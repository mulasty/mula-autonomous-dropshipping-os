import { FastifyInstance } from "fastify";
import { DatabaseUnavailableError, PostgresDatabase } from "../db/postgres";
import {
  NormalizationService,
  PostgresNormalizedProductRepository
} from "../modules/normalization";
import { PolicyLoaderService, PostgresPolicyRepository } from "../modules/policy-loader";
import {
  ProductPipelineInput,
  ProductPipelineService
} from "../modules/product-pipeline";
import { QualificationService } from "../modules/qualification";
import {
  PostgresProductRuleDecisionRepository,
  ProductRulesEngineService,
  RuleEvaluationRuntimeService
} from "../modules/rules-engine";
import {
  NoopExceptionService,
  NoopLogger,
  PersistentExceptionService,
  PostgresDatabaseClient,
  PostgresExceptionRepository
} from "../shared";

interface PipelineRouteOptions {
  db: PostgresDatabase;
}

interface ValidationIssue {
  path: string;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequiredString(value: unknown, path: string, issues: ValidationIssue[]): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ path, message: "Expected non-empty string." });
    return "";
  }

  return value;
}

function readOptionalString(value: unknown, path: string, issues: ValidationIssue[]): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    issues.push({ path, message: "Expected string." });
    return undefined;
  }

  return value;
}

function readRequiredNumber(value: unknown, path: string, issues: ValidationIssue[]): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push({ path, message: "Expected finite number." });
    return 0;
  }

  return value;
}

function readOptionalNumber(value: unknown, path: string, issues: ValidationIssue[]): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push({ path, message: "Expected finite number." });
    return undefined;
  }

  return value;
}

function readOptionalBoolean(value: unknown, path: string, issues: ValidationIssue[]): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    issues.push({ path, message: "Expected boolean." });
    return undefined;
  }

  return value;
}

function parseProductPipelineInput(
  body: unknown
): { value?: ProductPipelineInput; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!isRecord(body) || !isRecord(body.rawPayload) || !isRecord(body.pricingContext)) {
    return {
      issues: [
        {
          path: "body",
          message: "Body must include rawPayload object and pricingContext object."
        }
      ]
    };
  }

  const supplierContext =
    body.supplierContext === undefined
      ? undefined
      : isRecord(body.supplierContext)
        ? body.supplierContext
        : (issues.push({ path: "supplierContext", message: "Expected object." }), undefined);

  const value: ProductPipelineInput = {
    workflowRunId: readOptionalString(body.workflowRunId, "workflowRunId", issues) ?? undefined,
    supplierId: readRequiredString(body.supplierId, "supplierId", issues),
    importId: readOptionalString(body.importId, "importId", issues),
    rawProductId: readOptionalString(body.rawProductId, "rawProductId", issues),
    sourceProductReference: readRequiredString(
      body.sourceProductReference,
      "sourceProductReference",
      issues
    ),
    rawPayload: body.rawPayload,
    prevalidationStatus:
      body.prevalidationStatus === "accepted_for_normalization" ||
      body.prevalidationStatus === "rejected_invalid_row" ||
      body.prevalidationStatus === "review_required_row"
        ? body.prevalidationStatus
        : undefined,
    pricingContext: {
      projectedSalePrice: readRequiredNumber(
        body.pricingContext.projectedSalePrice,
        "pricingContext.projectedSalePrice",
        issues
      ),
      targetChannel: readRequiredString(
        body.pricingContext.targetChannel,
        "pricingContext.targetChannel",
        issues
      ),
      projectedSalePriceGross: readOptionalNumber(
        body.pricingContext.projectedSalePriceGross,
        "pricingContext.projectedSalePriceGross",
        issues
      ),
      shippingCostEstimate: readOptionalNumber(
        body.pricingContext.shippingCostEstimate,
        "pricingContext.shippingCostEstimate",
        issues
      ),
      channelFeeRate: readOptionalNumber(
        body.pricingContext.channelFeeRate,
        "pricingContext.channelFeeRate",
        issues
      ),
      paymentFeeRate: readOptionalNumber(
        body.pricingContext.paymentFeeRate,
        "pricingContext.paymentFeeRate",
        issues
      ),
      handlingBuffer: readOptionalNumber(
        body.pricingContext.handlingBuffer,
        "pricingContext.handlingBuffer",
        issues
      ),
      returnRiskBuffer: readOptionalNumber(
        body.pricingContext.returnRiskBuffer,
        "pricingContext.returnRiskBuffer",
        issues
      ),
      taxRate: readOptionalNumber(body.pricingContext.taxRate, "pricingContext.taxRate", issues)
    },
    supplierContext: supplierContext
      ? {
          supplierId: readOptionalString(
            supplierContext.supplierId,
            "supplierContext.supplierId",
            issues
          ),
          trustScore: readOptionalNumber(
            supplierContext.trustScore,
            "supplierContext.trustScore",
            issues
          ),
          stockAccuracyScore: readOptionalNumber(
            supplierContext.stockAccuracyScore,
            "supplierContext.stockAccuracyScore",
            issues
          ),
          cancellationRate: readOptionalNumber(
            supplierContext.cancellationRate,
            "supplierContext.cancellationRate",
            issues
          ),
          lastImportAgeHours: readOptionalNumber(
            supplierContext.lastImportAgeHours,
            "supplierContext.lastImportAgeHours",
            issues
          )
        }
      : undefined,
    aiReviewEnabled: readOptionalBoolean(body.aiReviewEnabled, "aiReviewEnabled", issues),
    highBusinessPriority: readOptionalBoolean(
      body.highBusinessPriority,
      "highBusinessPriority",
      issues
    ),
    persistNormalizedProduct: readOptionalBoolean(
      body.persistNormalizedProduct,
      "persistNormalizedProduct",
      issues
    ),
    persistRuleDecision: readOptionalBoolean(
      body.persistRuleDecision,
      "persistRuleDecision",
      issues
    )
  };

  if (issues.length > 0) {
    return { issues };
  }

  return { value, issues };
}

export async function registerPipelineRoutes(
  app: FastifyInstance,
  options: PipelineRouteOptions
): Promise<void> {
  const dbClient = new PostgresDatabaseClient(options.db);
  const exceptionService = dbClient.isConfigured()
    ? new PersistentExceptionService(new PostgresExceptionRepository(dbClient))
    : new NoopExceptionService();
  const pipelineService = new ProductPipelineService(
    new NormalizationService(),
    new RuleEvaluationRuntimeService(
      new ProductRulesEngineService(),
      new PolicyLoaderService(new PostgresPolicyRepository(dbClient)),
      dbClient.isConfigured() ? new PostgresProductRuleDecisionRepository(dbClient) : undefined
    ),
    new QualificationService(
      new ProductRulesEngineService(),
      new NoopLogger(),
      exceptionService
    ),
    dbClient.isConfigured() ? new PostgresNormalizedProductRepository(dbClient) : undefined,
    exceptionService
  );

  app.post("/v1/pipeline/qualify", async (request, reply) => {
    const parsed = parseProductPipelineInput(request.body);
    if (!parsed.value) {
      reply.code(400).send({
        error: "invalid_product_pipeline_request",
        message:
          "Body must include supplierId, sourceProductReference, rawPayload object, and pricingContext with projectedSalePrice and targetChannel.",
        issues: parsed.issues
      });
      return;
    }

    if (
      (parsed.value.persistNormalizedProduct || parsed.value.persistRuleDecision) &&
      !dbClient.isConfigured()
    ) {
      throw new DatabaseUnavailableError();
    }

    return {
      data: await pipelineService.run(parsed.value)
    };
  });
}
