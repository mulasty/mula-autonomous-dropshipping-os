export interface NormalizedProductRuleInput {
  productId: string;
  internalSku?: string | null;
  supplierSku?: string | null;
  categoryNormalized?: string | null;
  costNet?: number | null;
  costGross?: number | null;
  projectedSalePrice: number;
  projectedSalePriceGross?: number | null;
  targetChannel: string;
  shippingTimeDays?: number | null;
  shippingCostEstimate?: number | null;
  shippingMethodDefined?: boolean | null;
  stockQuantity?: number | null;
  dataQualityScore?: number | null;
  imageCount?: number | null;
  titleNormalized?: string | null;
  hasRequiredAttributes?: boolean | null;
  categoryMappingConfidence?: number | null;
  channelFeeRate?: number | null;
  paymentFeeRate?: number | null;
  handlingBuffer?: number | null;
  returnRiskBuffer?: number | null;
  taxRate?: number | null;
}

export interface SupplierRuleContext {
  supplierId?: string | null;
  trustScore?: number | null;
  stockAccuracyScore?: number | null;
  cancellationRate?: number | null;
  lastImportAgeHours?: number | null;
}

export interface RulesPolicyContext {
  policyVersion: string;
  rulesVersion: string;
  minimumNetMargin: number;
  reviewWarningBandUpper: number;
  minimumAbsoluteProfitAmount: number;
  minimumSupplierTrustScore: number;
  supplierTrustReviewThreshold: number;
  maximumShippingTimeDays: number;
  minimumDataQualityScore: number;
  minimumImageCount: number;
  minimumStockQuantity: number;
  minimumCategoryMappingConfidence: number;
  allowedCategories: string[];
  bannedCategories: string[];
  allowMissingFeeModelReview: boolean;
  allowMissingShippingEstimateReview: boolean;
}

export interface RuleEvaluationInput {
  normalizedProduct: NormalizedProductRuleInput;
  supplierContext?: SupplierRuleContext;
  policyContext?: Partial<RulesPolicyContext>;
}
