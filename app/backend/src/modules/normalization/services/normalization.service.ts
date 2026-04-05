import { randomUUID } from "node:crypto";
import { createDomainEvent, DomainEvent } from "../../../shared";
import { RuleEvaluationInput } from "../../rules-engine";
import { normalizationFieldAliases } from "../normalization-rules";
import { NormalizationInput } from "../contracts/normalization-input.contract";
import {
  NormalizationOutput,
  NormalizedProductCandidate
} from "../contracts/normalization-output.contract";
import { FieldNormalizerService } from "./field-normalizer.service";

function buildInternalSku(supplierId: string, supplierSku: string): string {
  const supplierToken = supplierId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  const skuToken = supplierSku.replace(/[^a-zA-Z0-9_-]/g, "-").toUpperCase();
  return `${supplierToken}-${skuToken}`;
}

function calculateDataQualityScore(candidate: NormalizedProductCandidate): number {
  let score = 0;

  if (candidate.titleNormalized) {
    score += 20;
  }

  if (candidate.categoryNormalized) {
    score += 15;
  }

  if (candidate.supplierSku) {
    score += 15;
  }

  if (candidate.costNet !== null || candidate.costGross !== null) {
    score += 15;
  }

  if (candidate.stockQuantity !== null) {
    score += 15;
  }

  if (candidate.imageCount > 0) {
    score += 10;
  }

  if (Object.keys(candidate.attributes).length > 0) {
    score += 10;
  }

  return score;
}

function buildRecommendedNextStep(status: NormalizationOutput["normalizationStatus"]): string {
  switch (status) {
    case "normalized":
      return "send_to_rules_engine";
    case "partial":
      return "review_normalization_and_continue";
    default:
      return "create_exception_and_stop";
  }
}

export class NormalizationService {
  constructor(
    private readonly fieldNormalizer: FieldNormalizerService = new FieldNormalizerService()
  ) {}

  normalize(input: NormalizationInput): NormalizationOutput {
    const workflowRunId = input.workflowRunId ?? randomUUID();
    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "normalization_started",
        entityType: "supplier_import",
        entityId: input.importId ?? workflowRunId,
        eventSource: "normalization_service",
        payload: {
          sourceProductReference: input.sourceProductReference,
          supplierId: input.supplierId
        }
      })
    ];
    const warningCodes: string[] = [];
    const errorCodes: string[] = [];
    const derivedFields: string[] = [];

    if (input.prevalidationStatus !== "accepted_for_normalization") {
      errorCodes.push("ROW_NOT_ACCEPTED_FOR_NORMALIZATION");
    }

    const supplierSku =
      this.fieldNormalizer.extractFirstIdentifier(
        input.rawPayload,
        normalizationFieldAliases.supplierSku
      ) ?? this.fieldNormalizer.normalizeIdentifier(input.sourceProductReference);
    if (!supplierSku) {
      errorCodes.push("MISSING_SUPPLIER_SKU");
    } else {
      derivedFields.push("supplier_sku");
    }

    const internalSkuSource =
      this.fieldNormalizer.extractFirstIdentifier(
        input.rawPayload,
        normalizationFieldAliases.internalSku
      ) ?? supplierSku;
    const internalSku = internalSkuSource
      ? buildInternalSku(input.supplierId, internalSkuSource)
      : buildInternalSku(input.supplierId, input.sourceProductReference);
    derivedFields.push("internal_sku");

    const titleRaw = this.fieldNormalizer.extractFirstText(
      input.rawPayload,
      normalizationFieldAliases.title
    );
    const titleNormalized = titleRaw;
    const descriptionRaw = this.fieldNormalizer.extractFirstText(
      input.rawPayload,
      normalizationFieldAliases.description
    );
    const category = this.fieldNormalizer.normalizeCategory(
      this.fieldNormalizer.extractFirstText(input.rawPayload, normalizationFieldAliases.category)
    );
    const ean = this.fieldNormalizer.extractFirstIdentifier(
      input.rawPayload,
      normalizationFieldAliases.ean
    );
    const brand = this.fieldNormalizer.extractFirstText(
      input.rawPayload,
      normalizationFieldAliases.brand
    );
    const weightKg = this.fieldNormalizer.extractFirstNumber(
      input.rawPayload,
      normalizationFieldAliases.weightKg
    );
    const shippingTimeDays = this.fieldNormalizer.extractFirstNumber(
      input.rawPayload,
      normalizationFieldAliases.shippingTimeDays
    );
    const costNet = this.fieldNormalizer.extractFirstNumber(
      input.rawPayload,
      normalizationFieldAliases.costNet
    );
    const costGross = this.fieldNormalizer.extractFirstNumber(
      input.rawPayload,
      normalizationFieldAliases.costGross
    );
    const currency = this.fieldNormalizer.normalizeCurrency(
      this.fieldNormalizer.extractFirstText(input.rawPayload, normalizationFieldAliases.currency)
    );
    const stockQuantity = this.fieldNormalizer.extractFirstNumber(
      input.rawPayload,
      normalizationFieldAliases.stockQuantity
    );
    const imageUrls = this.fieldNormalizer.extractImageUrls(input.rawPayload);
    const attributes = this.fieldNormalizer.extractAttributes(input.rawPayload);

    if (!titleNormalized) {
      warningCodes.push("MISSING_TITLE");
    }

    if (!category.normalized) {
      warningCodes.push("MISSING_CATEGORY");
    } else if (category.confidence < 0.8) {
      warningCodes.push("LOW_CATEGORY_CONFIDENCE");
    }

    if (costNet === null && costGross === null) {
      warningCodes.push("MISSING_COST_DATA");
    }

    if (stockQuantity === null) {
      warningCodes.push("MISSING_STOCK_DATA");
    }

    if (imageUrls.length === 0) {
      warningCodes.push("MISSING_IMAGES");
    }

    const candidate: NormalizedProductCandidate = {
      productId: randomUUID(),
      supplierId: input.supplierId,
      rawProductId: input.rawProductId ?? null,
      sourceProductReference: input.sourceProductReference,
      internalSku,
      supplierSku: supplierSku ?? input.sourceProductReference,
      ean,
      brand,
      titleRaw,
      titleNormalized,
      descriptionRaw,
      categorySource: category.source,
      categoryNormalized: category.normalized,
      attributes,
      imageUrls,
      weightKg,
      shippingTimeDays,
      costNet,
      costGross,
      currency,
      stockQuantity,
      dataQualityScore: 0,
      categoryMappingConfidence: category.confidence,
      hasRequiredAttributes: Object.keys(attributes).length > 0,
      imageCount: imageUrls.length,
      normalizedAt: new Date().toISOString()
    };

    candidate.dataQualityScore = calculateDataQualityScore(candidate);
    const normalizationStatus =
      errorCodes.length > 0 ? "failed" : warningCodes.length > 0 ? "partial" : "normalized";

    const rulesInput: RuleEvaluationInput = {
      normalizedProduct: {
        productId: candidate.productId,
        internalSku: candidate.internalSku,
        supplierSku: candidate.supplierSku,
        categoryNormalized: candidate.categoryNormalized,
        costNet: candidate.costNet,
        costGross: candidate.costGross,
        projectedSalePrice: input.pricingContext.projectedSalePrice,
        projectedSalePriceGross: input.pricingContext.projectedSalePriceGross,
        targetChannel: input.pricingContext.targetChannel,
        shippingTimeDays: candidate.shippingTimeDays,
        shippingCostEstimate: input.pricingContext.shippingCostEstimate,
        shippingMethodDefined: candidate.shippingTimeDays !== null,
        stockQuantity: candidate.stockQuantity,
        dataQualityScore: candidate.dataQualityScore,
        imageCount: candidate.imageCount,
        titleNormalized: candidate.titleNormalized,
        hasRequiredAttributes: candidate.hasRequiredAttributes,
        categoryMappingConfidence: candidate.categoryMappingConfidence,
        channelFeeRate: input.pricingContext.channelFeeRate,
        paymentFeeRate: input.pricingContext.paymentFeeRate,
        handlingBuffer: input.pricingContext.handlingBuffer,
        returnRiskBuffer: input.pricingContext.returnRiskBuffer,
        taxRate: input.pricingContext.taxRate
      },
      supplierContext: {
        supplierId: input.supplierId
      }
    };

    domainEvents.push(
      createDomainEvent({
        eventType:
          normalizationStatus === "failed"
            ? "normalization_failed"
            : normalizationStatus === "partial"
              ? "normalization_partial"
              : "product_normalized",
        entityType: "product",
        entityId: candidate.productId,
        eventSource: "normalization_service",
        payload: {
          sourceProductReference: input.sourceProductReference,
          warningCodes,
          errorCodes
        }
      })
    );

    return {
      workflowRunId,
      normalizationStatus,
      normalizedProduct: candidate,
      warningCodes,
      errorCodes,
      derivedFields,
      reviewRecommended: normalizationStatus === "partial",
      rulesInput,
      recommendedNextStep: buildRecommendedNextStep(normalizationStatus),
      domainEvents
    };
  }
}
