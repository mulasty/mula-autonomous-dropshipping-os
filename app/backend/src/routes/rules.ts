import { FastifyInstance } from "fastify";
import { DatabaseUnavailableError, PostgresDatabase } from "../db/postgres";
import { PolicyLoaderService, PostgresPolicyRepository } from "../modules/policy-loader";
import {
  PostgresProductRuleDecisionRepository,
  ProductRulesEngineService,
  RuleEvaluationInput,
  RuleEvaluationRuntimeService,
  RulesPolicyContext
} from "../modules/rules-engine";
import { PostgresDatabaseClient } from "../shared";

interface RulesRouteOptions {
  db: PostgresDatabase;
}

interface ValidationIssue {
  path: string;
  message: string;
}

interface ParsedRuleEvaluationRequest {
  evaluationInput: RuleEvaluationInput;
  persistDecision: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalString(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  options?: { required?: boolean }
): string | null | undefined {
  if (value === undefined) {
    if (options?.required) {
      issues.push({ path, message: "Expected non-empty string." });
    }

    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ path, message: "Expected non-empty string." });
    return undefined;
  }

  return value;
}

function readOptionalNumber(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  options?: { required?: boolean }
): number | null | undefined {
  if (value === undefined) {
    if (options?.required) {
      issues.push({ path, message: "Expected finite number." });
    }

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

function readOptionalBoolean(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  options?: { required?: boolean }
): boolean | null | undefined {
  if (value === undefined) {
    if (options?.required) {
      issues.push({ path, message: "Expected boolean." });
    }

    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "boolean") {
    issues.push({ path, message: "Expected boolean." });
    return undefined;
  }

  return value;
}

function readOptionalStringArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    issues.push({ path, message: "Expected array of strings." });
    return undefined;
  }

  return value;
}

function readOptionalObject(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  options?: { required?: boolean }
): Record<string, unknown> | undefined {
  if (value === undefined) {
    if (options?.required) {
      issues.push({ path, message: "Expected object." });
    }

    return undefined;
  }

  if (!isRecord(value)) {
    issues.push({ path, message: "Expected object." });
    return undefined;
  }

  return value;
}

function parseRuleEvaluationRequest(
  body: unknown
): { value?: ParsedRuleEvaluationRequest; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const payload = readOptionalObject(body, "body", issues, { required: true });
  if (!payload) {
    return { issues };
  }

  const normalizedProduct = readOptionalObject(
    payload.normalizedProduct,
    "normalizedProduct",
    issues,
    { required: true }
  );
  if (!normalizedProduct) {
    return { issues };
  }

  const supplierContext =
    payload.supplierContext === undefined
      ? {}
      : readOptionalObject(payload.supplierContext, "supplierContext", issues) ?? {};
  const policyContext =
    payload.policyContext === undefined
      ? {}
      : readOptionalObject(payload.policyContext, "policyContext", issues) ?? {};
  const persistDecision =
    readOptionalBoolean(payload.persistDecision, "persistDecision", issues) ?? false;

  const evaluationInput: RuleEvaluationInput = {
    normalizedProduct: {
      productId:
        readOptionalString(
          normalizedProduct.productId,
          "normalizedProduct.productId",
          issues,
          {
            required: true
          }
        ) ?? "",
      projectedSalePrice:
        readOptionalNumber(
          normalizedProduct.projectedSalePrice,
          "normalizedProduct.projectedSalePrice",
          issues,
          { required: true }
        ) ?? 0,
      targetChannel:
        readOptionalString(
          normalizedProduct.targetChannel,
          "normalizedProduct.targetChannel",
          issues,
          { required: true }
        ) ?? "",
      internalSku: readOptionalString(
        normalizedProduct.internalSku,
        "normalizedProduct.internalSku",
        issues
      ),
      supplierSku: readOptionalString(
        normalizedProduct.supplierSku,
        "normalizedProduct.supplierSku",
        issues
      ),
      categoryNormalized: readOptionalString(
        normalizedProduct.categoryNormalized,
        "normalizedProduct.categoryNormalized",
        issues
      ),
      costNet: readOptionalNumber(normalizedProduct.costNet, "normalizedProduct.costNet", issues),
      costGross: readOptionalNumber(
        normalizedProduct.costGross,
        "normalizedProduct.costGross",
        issues
      ),
      projectedSalePriceGross: readOptionalNumber(
        normalizedProduct.projectedSalePriceGross,
        "normalizedProduct.projectedSalePriceGross",
        issues
      ),
      shippingTimeDays: readOptionalNumber(
        normalizedProduct.shippingTimeDays,
        "normalizedProduct.shippingTimeDays",
        issues
      ),
      shippingCostEstimate: readOptionalNumber(
        normalizedProduct.shippingCostEstimate,
        "normalizedProduct.shippingCostEstimate",
        issues
      ),
      shippingMethodDefined: readOptionalBoolean(
        normalizedProduct.shippingMethodDefined,
        "normalizedProduct.shippingMethodDefined",
        issues
      ),
      stockQuantity: readOptionalNumber(
        normalizedProduct.stockQuantity,
        "normalizedProduct.stockQuantity",
        issues
      ),
      dataQualityScore: readOptionalNumber(
        normalizedProduct.dataQualityScore,
        "normalizedProduct.dataQualityScore",
        issues
      ),
      imageCount: readOptionalNumber(
        normalizedProduct.imageCount,
        "normalizedProduct.imageCount",
        issues
      ),
      titleNormalized: readOptionalString(
        normalizedProduct.titleNormalized,
        "normalizedProduct.titleNormalized",
        issues
      ),
      hasRequiredAttributes: readOptionalBoolean(
        normalizedProduct.hasRequiredAttributes,
        "normalizedProduct.hasRequiredAttributes",
        issues
      ),
      categoryMappingConfidence: readOptionalNumber(
        normalizedProduct.categoryMappingConfidence,
        "normalizedProduct.categoryMappingConfidence",
        issues
      ),
      channelFeeRate: readOptionalNumber(
        normalizedProduct.channelFeeRate,
        "normalizedProduct.channelFeeRate",
        issues
      ),
      paymentFeeRate: readOptionalNumber(
        normalizedProduct.paymentFeeRate,
        "normalizedProduct.paymentFeeRate",
        issues
      ),
      handlingBuffer: readOptionalNumber(
        normalizedProduct.handlingBuffer,
        "normalizedProduct.handlingBuffer",
        issues
      ),
      returnRiskBuffer: readOptionalNumber(
        normalizedProduct.returnRiskBuffer,
        "normalizedProduct.returnRiskBuffer",
        issues
      ),
      taxRate: readOptionalNumber(normalizedProduct.taxRate, "normalizedProduct.taxRate", issues)
    },
    supplierContext: {
      supplierId: readOptionalString(supplierContext.supplierId, "supplierContext.supplierId", issues),
      trustScore: readOptionalNumber(supplierContext.trustScore, "supplierContext.trustScore", issues),
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
    },
    policyContext: {
      policyVersion: readOptionalString(
        policyContext.policyVersion,
        "policyContext.policyVersion",
        issues
      ) as string | undefined,
      rulesVersion: readOptionalString(
        policyContext.rulesVersion,
        "policyContext.rulesVersion",
        issues
      ) as string | undefined,
      minimumNetMargin: readOptionalNumber(
        policyContext.minimumNetMargin,
        "policyContext.minimumNetMargin",
        issues
      ) as number | undefined,
      reviewWarningBandUpper: readOptionalNumber(
        policyContext.reviewWarningBandUpper,
        "policyContext.reviewWarningBandUpper",
        issues
      ) as number | undefined,
      minimumAbsoluteProfitAmount: readOptionalNumber(
        policyContext.minimumAbsoluteProfitAmount,
        "policyContext.minimumAbsoluteProfitAmount",
        issues
      ) as number | undefined,
      minimumSupplierTrustScore: readOptionalNumber(
        policyContext.minimumSupplierTrustScore,
        "policyContext.minimumSupplierTrustScore",
        issues
      ) as number | undefined,
      supplierTrustReviewThreshold: readOptionalNumber(
        policyContext.supplierTrustReviewThreshold,
        "policyContext.supplierTrustReviewThreshold",
        issues
      ) as number | undefined,
      maximumShippingTimeDays: readOptionalNumber(
        policyContext.maximumShippingTimeDays,
        "policyContext.maximumShippingTimeDays",
        issues
      ) as number | undefined,
      minimumDataQualityScore: readOptionalNumber(
        policyContext.minimumDataQualityScore,
        "policyContext.minimumDataQualityScore",
        issues
      ) as number | undefined,
      minimumImageCount: readOptionalNumber(
        policyContext.minimumImageCount,
        "policyContext.minimumImageCount",
        issues
      ) as number | undefined,
      minimumStockQuantity: readOptionalNumber(
        policyContext.minimumStockQuantity,
        "policyContext.minimumStockQuantity",
        issues
      ) as number | undefined,
      minimumCategoryMappingConfidence: readOptionalNumber(
        policyContext.minimumCategoryMappingConfidence,
        "policyContext.minimumCategoryMappingConfidence",
        issues
      ) as number | undefined,
      allowedCategories: readOptionalStringArray(
        policyContext.allowedCategories,
        "policyContext.allowedCategories",
        issues
      ),
      bannedCategories: readOptionalStringArray(
        policyContext.bannedCategories,
        "policyContext.bannedCategories",
        issues
      ),
      allowMissingFeeModelReview: readOptionalBoolean(
        policyContext.allowMissingFeeModelReview,
        "policyContext.allowMissingFeeModelReview",
        issues
      ) as boolean | undefined,
      allowMissingShippingEstimateReview: readOptionalBoolean(
        policyContext.allowMissingShippingEstimateReview,
        "policyContext.allowMissingShippingEstimateReview",
        issues
      ) as boolean | undefined
    } satisfies Partial<RulesPolicyContext>
  };

  if (issues.length > 0) {
    return { issues };
  }

  return {
    value: {
      evaluationInput,
      persistDecision
    },
    issues
  };
}

export async function registerRulesRoutes(
  app: FastifyInstance,
  options: RulesRouteOptions
): Promise<void> {
  const dbClient = new PostgresDatabaseClient(options.db);
  const rulesRuntime = new RuleEvaluationRuntimeService(
    new ProductRulesEngineService(),
    new PolicyLoaderService(new PostgresPolicyRepository(dbClient)),
    dbClient.isConfigured() ? new PostgresProductRuleDecisionRepository(dbClient) : undefined
  );

  app.post("/v1/rules/evaluate", async (request, reply) => {
    const parsed = parseRuleEvaluationRequest(request.body);
    if (!parsed.value) {
      reply.code(400).send({
        error: "invalid_rule_evaluation_request",
        message:
          "Body must include a valid normalizedProduct with productId, projectedSalePrice, and targetChannel. Optional fields must match expected types.",
        issues: parsed.issues
      });
      return;
    }

    if (parsed.value.persistDecision && !dbClient.isConfigured()) {
      throw new DatabaseUnavailableError();
    }

    const evaluation = await rulesRuntime.evaluate(parsed.value);
    return {
      data: evaluation.decision,
      meta: {
        policySource: evaluation.loadedPolicy.source,
        policyWarnings: evaluation.loadedPolicy.warnings,
        persistedDecisionId: evaluation.persistedDecision?.decisionId ?? null
      }
    };
  });
}
