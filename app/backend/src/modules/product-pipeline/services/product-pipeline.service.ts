import { randomUUID } from "node:crypto";
import {
  createDomainEvent,
  escalate,
  ExceptionService,
  fail,
  NoopExceptionService,
  ok,
  OperationResult,
  review
} from "../../../shared";
import {
  NormalizationOutput,
  NormalizationService,
  NormalizedProductRepository
} from "../../normalization";
import { QualificationService } from "../../qualification";
import { RuleEvaluationRuntimeService } from "../../rules-engine";
import { ProductPipelineInput } from "../contracts/product-pipeline-input.contract";
import {
  ProductPipelineOutput,
  ProductPipelineRuleEvaluationArtifacts
} from "../contracts/product-pipeline-output.contract";

function mergeDomainEvents(
  output: ProductPipelineOutput,
  ...eventGroups: Array<{ domainEvents?: ProductPipelineOutput["domainEvents"] } | null | undefined>
): ProductPipelineOutput["domainEvents"] {
  const merged = [...output.domainEvents];

  for (const group of eventGroups) {
    if (group?.domainEvents) {
      merged.push(...group.domainEvents);
    }
  }

  return merged;
}

export class ProductPipelineService {
  constructor(
    private readonly normalizationService: NormalizationService,
    private readonly rulesRuntime: RuleEvaluationRuntimeService,
    private readonly qualificationService: QualificationService,
    private readonly normalizedProductRepository?: NormalizedProductRepository,
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async run(input: ProductPipelineInput): Promise<OperationResult<ProductPipelineOutput>> {
    const workflowRunId = input.workflowRunId ?? randomUUID();
    const normalization = this.normalizationService.normalize({
      workflowRunId,
      supplierId: input.supplierId,
      importId: input.importId,
      rawProductId: input.rawProductId,
      sourceProductReference: input.sourceProductReference,
      rawPayload: input.rawPayload,
      prevalidationStatus: input.prevalidationStatus ?? "accepted_for_normalization",
      pricingContext: input.pricingContext
    });

    const output: ProductPipelineOutput = {
      workflowRunId,
      supplierId: input.supplierId,
      importId: input.importId ?? null,
      stageReached: "normalization",
      pipelineStatus: "failed",
      normalization,
      rulesDecision: null,
      qualification: null,
      persistedArtifacts: {
        normalizedProductId: null,
        ruleDecisionId: null
      },
      recommendedNextStep: normalization.recommendedNextStep,
      domainEvents: [
        createDomainEvent({
          eventType: "product_pipeline_started",
          entityType: "supplier_import",
          entityId: input.importId ?? workflowRunId,
          eventSource: "product_pipeline_service",
          payload: {
            workflowRunId,
            supplierId: input.supplierId,
            sourceProductReference: input.sourceProductReference
          }
        }),
        ...normalization.domainEvents
      ]
    };

    if (normalization.normalizationStatus === "failed") {
      const exception = await this.exceptionService.createException({
        entityType: "supplier_import",
        entityId: input.importId ?? workflowRunId,
        domain: "normalization",
        severity: "medium",
        reasonCode: normalization.errorCodes[0] ?? "NORMALIZATION_FAILED",
        summary: "Normalization could not produce a safe canonical product record.",
        details: {
          workflowRunId,
          errorCodes: normalization.errorCodes,
          sourceProductReference: input.sourceProductReference
        }
      });

      output.pipelineStatus = "escalated";
      output.recommendedNextStep = normalization.recommendedNextStep;
      return escalate(output, {
        domainEvents: output.domainEvents,
        reasonCodes: normalization.errorCodes,
        recommendedNextStep: output.recommendedNextStep,
        exception
      });
    }

    if (input.persistNormalizedProduct) {
      if (!this.normalizedProductRepository) {
        return fail(
          "normalized_product_persistence_unavailable",
          "Normalized product persistence is not available in the current runtime."
        );
      }

      if (!normalization.normalizedProduct.rawProductId) {
        return fail(
          "normalized_product_requires_raw_reference",
          "Persisting a normalized product requires rawProductId from the intake persistence step."
        );
      }

      const persistedNormalized =
        await this.normalizedProductRepository.saveNormalizedProduct(normalization);
      normalization.normalizedProduct.productId = persistedNormalized.productId;
      normalization.rulesInput.normalizedProduct.productId = persistedNormalized.productId;
      output.persistedArtifacts.normalizedProductId = persistedNormalized.productId;
      output.stageReached = "normalization_persistence";
      output.domainEvents.push(
        createDomainEvent({
          eventType: "normalized_product_persisted",
          entityType: "product",
          entityId: persistedNormalized.productId,
          eventSource: "product_pipeline_service",
          payload: {
            workflowRunId,
            rawProductId: normalization.normalizedProduct.rawProductId
          }
        })
      );
    }

    const rulesEvaluation = await this.rulesRuntime.evaluate({
      evaluationInput: {
        ...normalization.rulesInput,
        supplierContext: {
          ...normalization.rulesInput.supplierContext,
          ...input.supplierContext
        }
      },
      persistDecision: input.persistRuleDecision
    });
    output.stageReached = "rules_evaluation";
    output.rulesDecision = rulesEvaluation.decision;
    output.persistedArtifacts.ruleDecisionId =
      rulesEvaluation.persistedDecision?.decisionId ?? null;
    output.domainEvents.push(
      createDomainEvent({
        eventType: "rules_decision_attached",
        entityType: "product",
        entityId: rulesEvaluation.decision.productId,
        eventSource: "product_pipeline_service",
        payload: {
          workflowRunId,
          decisionStatus: rulesEvaluation.decision.decisionStatus,
          policySource: rulesEvaluation.loadedPolicy.source
        }
      })
    );

    const qualificationResult = await this.qualificationService.qualify({
      workflowRunId,
      aiReviewEnabled: input.aiReviewEnabled,
      highBusinessPriority: input.highBusinessPriority,
      existingRuleDecision: rulesEvaluation.decision
    });

    if (qualificationResult.status === "failed") {
      return fail(
        qualificationResult.error.code,
        qualificationResult.error.message,
        qualificationResult.meta,
        qualificationResult.error.retriable
      );
    }

    output.stageReached = "qualification";
    output.qualification = qualificationResult.data;
    output.domainEvents = mergeDomainEvents(output, qualificationResult.data);
    output.recommendedNextStep =
      qualificationResult.meta?.recommendedNextStep ??
      qualificationResult.data.recommendedNextStep;

    if (qualificationResult.status === "escalated") {
      output.pipelineStatus = "escalated";
      return escalate(output, {
        domainEvents: output.domainEvents,
        reasonCodes: qualificationResult.meta?.reasonCodes,
        riskFlags: qualificationResult.meta?.riskFlags,
        recommendedNextStep: output.recommendedNextStep,
        exception: qualificationResult.meta?.exception
      });
    }

    if (
      qualificationResult.status === "review_required" ||
      normalization.normalizationStatus === "partial"
    ) {
      output.pipelineStatus = "review_required";
      return review(output, {
        domainEvents: output.domainEvents,
        reasonCodes: [
          ...(normalization.warningCodes ?? []),
          ...(qualificationResult.meta?.reasonCodes ?? [])
        ],
        riskFlags: qualificationResult.meta?.riskFlags,
        recommendedNextStep: output.recommendedNextStep,
        exception: qualificationResult.meta?.exception
      });
    }

    output.pipelineStatus = "completed";
    return ok(output, {
      domainEvents: output.domainEvents,
      reasonCodes: qualificationResult.meta?.reasonCodes,
      riskFlags: qualificationResult.meta?.riskFlags,
      recommendedNextStep: output.recommendedNextStep,
      exception: qualificationResult.meta?.exception
    });
  }
}
