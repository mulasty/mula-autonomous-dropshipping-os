import {
  createDomainEvent,
  DomainEvent,
  escalate,
  ExceptionService,
  fail,
  NoopExceptionService,
  NoopLogger,
  ok,
  OperationResult,
  review,
  RuntimeLogger
} from "../../../shared";
import { ProductRulesEngineService } from "../../rules-engine";
import { QualificationInput } from "../contracts/qualification-input.contract";
import { QualificationOutput } from "../contracts/qualification-output.contract";

export class QualificationService {
  constructor(
    private readonly rulesEngine: ProductRulesEngineService = new ProductRulesEngineService(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async qualify(input: QualificationInput): Promise<OperationResult<QualificationOutput>> {
    const rulesDecision = input.existingRuleDecision ?? (input.rulesInput ? this.rulesEngine.evaluate(input.rulesInput) : null);
    if (!rulesDecision) {
      return fail(
        "qualification_input_missing",
        "Qualification requires either an existing rule decision or rules input."
      );
    }

    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "qualification_requested",
        entityType: "product",
        entityId: rulesDecision.productId,
        eventSource: "qualification_service",
        payload: {
          workflowRunId: input.workflowRunId ?? null
        }
      }),
      createDomainEvent({
        eventType: input.existingRuleDecision ? "rules_decision_attached" : "rules_decision_created",
        entityType: "product",
        entityId: rulesDecision.productId,
        eventSource: "qualification_service",
        payload: {
          decisionStatus: rulesDecision.decisionStatus
        }
      })
    ];

    const aiReviewEligible =
      input.aiReviewEnabled === true &&
      (rulesDecision.decisionStatus === "approved" || rulesDecision.decisionStatus === "improve_required");
    const aiReviewRequiredBeforeListing = aiReviewEligible;
    const recommendedNextStep = aiReviewEligible ? "send_to_ai_review" : rulesDecision.recommendedNextStep;
    const output: QualificationOutput = {
      productId: rulesDecision.productId,
      qualificationStatus: rulesDecision.decisionStatus,
      rulesDecision,
      aiReviewEligible,
      aiReviewRequiredBeforeListing,
      listingGenerationAllowed: rulesDecision.listingGenerationAllowed && !aiReviewRequiredBeforeListing,
      exceptionRecommended:
        rulesDecision.decisionStatus === "blocked" ||
        (rulesDecision.decisionStatus === "review_required" && input.highBusinessPriority === true),
      recommendedNextStep,
      auditLogRequired: true,
      domainEvents
    };

    this.logger.info("Qualification evaluated", {
      productId: rulesDecision.productId,
      qualificationStatus: rulesDecision.decisionStatus,
      aiReviewEligible
    });

    if (output.exceptionRecommended) {
      const exception = await this.exceptionService.createException({
        entityType: "product",
        entityId: rulesDecision.productId,
        domain: "qualification",
        severity: input.highBusinessPriority ? "high" : "medium",
        reasonCode:
          rulesDecision.decisionStatus === "blocked" ? "STRATEGIC_BLOCKED_PRODUCT" : "BORDERLINE_MARGIN_REVIEW",
        summary: "Qualification result requires operator escalation.",
        details: {
          qualificationStatus: output.qualificationStatus,
          reasonCodes: rulesDecision.decisionReasonCodes
        }
      });

      return escalate(output, {
        domainEvents,
        reasonCodes: rulesDecision.decisionReasonCodes,
        riskFlags: rulesDecision.riskFlags,
        recommendedNextStep,
        exception
      });
    }

    if (rulesDecision.decisionStatus === "review_required") {
      return review(output, {
        domainEvents,
        reasonCodes: rulesDecision.decisionReasonCodes,
        riskFlags: rulesDecision.riskFlags,
        recommendedNextStep
      });
    }

    return ok(output, {
      domainEvents,
      reasonCodes: rulesDecision.decisionReasonCodes,
      riskFlags: rulesDecision.riskFlags,
      recommendedNextStep
    });
  }
}
