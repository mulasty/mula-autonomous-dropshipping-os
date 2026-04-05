import { RulesPolicyContext } from "./contracts/rule-evaluation-input.contract";

export const defaultRulesPolicyContext: RulesPolicyContext = {
  policyVersion: "starter-policy-v1",
  rulesVersion: "rules-engine-v1",
  minimumNetMargin: 0.18,
  reviewWarningBandUpper: 0.24,
  minimumAbsoluteProfitAmount: 20,
  minimumSupplierTrustScore: 60,
  supplierTrustReviewThreshold: 75,
  maximumShippingTimeDays: 5,
  minimumDataQualityScore: 60,
  minimumImageCount: 3,
  minimumStockQuantity: 1,
  minimumCategoryMappingConfidence: 0.8,
  allowedCategories: [],
  bannedCategories: [],
  allowMissingFeeModelReview: false,
  allowMissingShippingEstimateReview: false
};

export function buildRulesPolicyContext(
  overrides: Partial<RulesPolicyContext> | undefined
): RulesPolicyContext {
  return {
    ...defaultRulesPolicyContext,
    ...overrides,
    allowedCategories: overrides?.allowedCategories ?? defaultRulesPolicyContext.allowedCategories,
    bannedCategories: overrides?.bannedCategories ?? defaultRulesPolicyContext.bannedCategories
  };
}
