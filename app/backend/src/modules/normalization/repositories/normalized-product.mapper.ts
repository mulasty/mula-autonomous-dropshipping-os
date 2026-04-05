import { NormalizationOutput } from "../contracts/normalization-output.contract";

export interface NormalizedProductPersistenceRow {
  supplierId: string;
  rawProductId: string;
  internalSku: string;
  supplierSku: string;
  ean: string | null;
  brand: string | null;
  titleRaw: string | null;
  titleNormalized: string | null;
  descriptionRaw: string | null;
  categorySource: string | null;
  categoryNormalized: string | null;
  attributesJson: string;
  imagesJson: string;
  weightKg: number | null;
  shippingTimeDays: number | null;
  costNet: number | null;
  costGross: number | null;
  currency: string | null;
  stockQuantity: number | null;
  dataQualityScore: number;
  normalizationStatus: "normalized" | "partial" | "failed";
  normalizedAt: string;
}

export function mapNormalizationToPersistenceRow(
  output: NormalizationOutput
): NormalizedProductPersistenceRow {
  if (!output.normalizedProduct.rawProductId) {
    throw new Error("Normalized product persistence requires rawProductId.");
  }

  return {
    supplierId: output.normalizedProduct.supplierId,
    rawProductId: output.normalizedProduct.rawProductId,
    internalSku: output.normalizedProduct.internalSku,
    supplierSku: output.normalizedProduct.supplierSku,
    ean: output.normalizedProduct.ean,
    brand: output.normalizedProduct.brand,
    titleRaw: output.normalizedProduct.titleRaw,
    titleNormalized: output.normalizedProduct.titleNormalized,
    descriptionRaw: output.normalizedProduct.descriptionRaw,
    categorySource: output.normalizedProduct.categorySource,
    categoryNormalized: output.normalizedProduct.categoryNormalized,
    attributesJson: JSON.stringify(output.normalizedProduct.attributes),
    imagesJson: JSON.stringify(output.normalizedProduct.imageUrls),
    weightKg: output.normalizedProduct.weightKg,
    shippingTimeDays: output.normalizedProduct.shippingTimeDays,
    costNet: output.normalizedProduct.costNet,
    costGross: output.normalizedProduct.costGross,
    currency: output.normalizedProduct.currency,
    stockQuantity: output.normalizedProduct.stockQuantity,
    dataQualityScore: output.normalizedProduct.dataQualityScore,
    normalizationStatus: output.normalizationStatus,
    normalizedAt: output.normalizedProduct.normalizedAt
  };
}
