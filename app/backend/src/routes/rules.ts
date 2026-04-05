import { FastifyInstance } from "fastify";
import {
  ProductRulesEngineService,
  RuleEvaluationInput,
  RulesPolicyContext
} from "../modules/rules-engine";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseOptionalBoolean(value: unknown): boolean | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "boolean" ? value : undefined;
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

function parseOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseConfigNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseConfigBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function parseConfigString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseRuleEvaluationInput(body: unknown): RuleEvaluationInput | null {
  if (!isRecord(body) || !isRecord(body.normalizedProduct)) {
    return null;
  }

  const normalizedProduct = body.normalizedProduct;
  const productId = parseOptionalString(normalizedProduct.productId);
  const projectedSalePrice = parseOptionalNumber(normalizedProduct.projectedSalePrice);
  const targetChannel = parseOptionalString(normalizedProduct.targetChannel);

  if (!productId || typeof projectedSalePrice !== "number" || !targetChannel) {
    return null;
  }

  const supplierContext = isRecord(body.supplierContext) ? body.supplierContext : {};
  const policyContext = isRecord(body.policyContext) ? body.policyContext : {};

  return {
    normalizedProduct: {
      productId,
      projectedSalePrice,
      targetChannel,
      internalSku: parseOptionalString(normalizedProduct.internalSku),
      supplierSku: parseOptionalString(normalizedProduct.supplierSku),
      categoryNormalized: parseOptionalString(normalizedProduct.categoryNormalized),
      costNet: parseOptionalNumber(normalizedProduct.costNet),
      costGross: parseOptionalNumber(normalizedProduct.costGross),
      projectedSalePriceGross: parseOptionalNumber(normalizedProduct.projectedSalePriceGross),
      shippingTimeDays: parseOptionalNumber(normalizedProduct.shippingTimeDays),
      shippingCostEstimate: parseOptionalNumber(normalizedProduct.shippingCostEstimate),
      shippingMethodDefined: parseOptionalBoolean(normalizedProduct.shippingMethodDefined),
      stockQuantity: parseOptionalNumber(normalizedProduct.stockQuantity),
      dataQualityScore: parseOptionalNumber(normalizedProduct.dataQualityScore),
      imageCount: parseOptionalNumber(normalizedProduct.imageCount),
      titleNormalized: parseOptionalString(normalizedProduct.titleNormalized),
      hasRequiredAttributes: parseOptionalBoolean(normalizedProduct.hasRequiredAttributes),
      categoryMappingConfidence: parseOptionalNumber(normalizedProduct.categoryMappingConfidence),
      channelFeeRate: parseOptionalNumber(normalizedProduct.channelFeeRate),
      paymentFeeRate: parseOptionalNumber(normalizedProduct.paymentFeeRate),
      handlingBuffer: parseOptionalNumber(normalizedProduct.handlingBuffer),
      returnRiskBuffer: parseOptionalNumber(normalizedProduct.returnRiskBuffer),
      taxRate: parseOptionalNumber(normalizedProduct.taxRate)
    },
    supplierContext: {
      supplierId: parseOptionalString(supplierContext.supplierId),
      trustScore: parseOptionalNumber(supplierContext.trustScore),
      stockAccuracyScore: parseOptionalNumber(supplierContext.stockAccuracyScore),
      cancellationRate: parseOptionalNumber(supplierContext.cancellationRate),
      lastImportAgeHours: parseOptionalNumber(supplierContext.lastImportAgeHours)
    },
    policyContext: {
      policyVersion: parseConfigString(policyContext.policyVersion),
      rulesVersion: parseConfigString(policyContext.rulesVersion),
      minimumNetMargin: parseConfigNumber(policyContext.minimumNetMargin),
      reviewWarningBandUpper: parseConfigNumber(policyContext.reviewWarningBandUpper),
      minimumAbsoluteProfitAmount: parseConfigNumber(policyContext.minimumAbsoluteProfitAmount),
      minimumSupplierTrustScore: parseConfigNumber(policyContext.minimumSupplierTrustScore),
      supplierTrustReviewThreshold: parseConfigNumber(policyContext.supplierTrustReviewThreshold),
      maximumShippingTimeDays: parseConfigNumber(policyContext.maximumShippingTimeDays),
      minimumDataQualityScore: parseConfigNumber(policyContext.minimumDataQualityScore),
      minimumImageCount: parseConfigNumber(policyContext.minimumImageCount),
      minimumStockQuantity: parseConfigNumber(policyContext.minimumStockQuantity),
      minimumCategoryMappingConfidence: parseConfigNumber(policyContext.minimumCategoryMappingConfidence),
      allowedCategories: parseOptionalStringArray(policyContext.allowedCategories),
      bannedCategories: parseOptionalStringArray(policyContext.bannedCategories),
      allowMissingFeeModelReview: parseConfigBoolean(policyContext.allowMissingFeeModelReview),
      allowMissingShippingEstimateReview: parseConfigBoolean(policyContext.allowMissingShippingEstimateReview)
    } satisfies Partial<RulesPolicyContext>
  };
}

export async function registerRulesRoutes(app: FastifyInstance): Promise<void> {
  const rulesEngine = new ProductRulesEngineService();

  app.post("/v1/rules/evaluate", async (request, reply) => {
    const parsed = parseRuleEvaluationInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_rule_evaluation_request",
        message:
          "Body must include normalizedProduct.productId, normalizedProduct.projectedSalePrice, and normalizedProduct.targetChannel."
      });
      return;
    }

    return {
      data: rulesEngine.evaluate(parsed)
    };
  });
}
