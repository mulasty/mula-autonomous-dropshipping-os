import {
  RuleEvaluationInput,
  RulesPolicyContext,
  NormalizedProductRuleInput,
  SupplierRuleContext
} from "../contracts/rule-evaluation-input.contract";
import { RuleEvaluationOutput } from "../contracts/rule-evaluation-output.contract";
import { buildRulesPolicyContext } from "../default-rules-policy";
import { RuleReasonCode } from "../types/reason-code";
import { RULE_DECISION_PRIORITY, RuleDecisionStatus } from "../types/rule-decision-status";
import { MarginCalculationService } from "./margin-calculation.service";

function normalizeCategory(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toLowerCase();
}

function uniqueSortedReasons(reasons: Set<RuleReasonCode>): RuleReasonCode[] {
  return [...reasons].sort((left, right) => left.localeCompare(right));
}

function uniqueSortedFlags(flags: Set<string>): string[] {
  return [...flags].sort((left, right) => left.localeCompare(right));
}

function chooseDecision(candidates: RuleDecisionStatus[]): RuleDecisionStatus {
  return candidates.reduce<RuleDecisionStatus>((current, next) => {
    return RULE_DECISION_PRIORITY[next] > RULE_DECISION_PRIORITY[current] ? next : current;
  }, "approved");
}

function recommendedNextStep(decision: RuleDecisionStatus): string {
  switch (decision) {
    case "approved":
      return "send_to_listing_factory";
    case "improve_required":
      return "send_to_enrichment";
    case "review_required":
      return "send_to_operator_review";
    case "rejected":
      return "stop_candidate_and_log_decision";
    case "blocked":
      return "create_exception_and_stop";
  }
}

export class ProductRulesEngineService {
  constructor(private readonly marginCalculationService: MarginCalculationService = new MarginCalculationService()) {}

  evaluate(input: RuleEvaluationInput): RuleEvaluationOutput {
    const policy = buildRulesPolicyContext(input.policyContext);
    const product = input.normalizedProduct;
    const supplier = input.supplierContext;
    const reasons = new Set<RuleReasonCode>();
    const riskFlags = new Set<string>();
    const candidates: RuleDecisionStatus[] = [];

    this.applyCategoryRules(product, policy, reasons, riskFlags, candidates);
    this.applyDataIntegrityRules(product, policy, reasons, riskFlags, candidates);

    const marginResult = this.marginCalculationService.calculate(product, policy);
    marginResult.metrics.marginReasonCodes.forEach((reason) => reasons.add(reason));
    if (marginResult.metrics.marginReasonCodes.includes("BORDERLINE_MARGIN")) {
      riskFlags.add("borderline_margin");
    }
    if (
      marginResult.metrics.marginReasonCodes.includes("LOW_MARGIN") ||
      marginResult.metrics.marginReasonCodes.includes("NEGATIVE_PROFIT")
    ) {
      riskFlags.add("margin_unsafe");
    }
    if (marginResult.metrics.marginReasonCodes.includes("MISSING_COST_DATA")) {
      riskFlags.add("missing_cost_data");
    }
    candidates.push(marginResult.metrics.marginDecision);

    this.applySupplierTrustRules(supplier, policy, reasons, riskFlags, candidates);
    this.applyShippingRules(product, policy, reasons, riskFlags, candidates);
    this.applyImprovementRules(product, policy, reasons, riskFlags, candidates);

    const decisionStatus = chooseDecision(candidates);

    return {
      productId: product.productId,
      decisionStatus,
      decisionReasonCodes: uniqueSortedReasons(reasons),
      computedMarginMetrics: marginResult.metrics,
      riskFlags: uniqueSortedFlags(riskFlags),
      recommendedNextStep: recommendedNextStep(decisionStatus),
      listingGenerationAllowed: decisionStatus === "approved" || decisionStatus === "improve_required",
      policyVersion: policy.policyVersion,
      rulesVersion: policy.rulesVersion
    };
  }

  private applyCategoryRules(
    product: NormalizedProductRuleInput,
    policy: RulesPolicyContext,
    reasons: Set<RuleReasonCode>,
    riskFlags: Set<string>,
    candidates: RuleDecisionStatus[]
  ): void {
    const category = normalizeCategory(product.categoryNormalized);
    const bannedCategories = new Set(policy.bannedCategories.map(normalizeCategory).filter((value): value is string => value !== null));
    const allowedCategories = new Set(
      policy.allowedCategories.map(normalizeCategory).filter((value): value is string => value !== null)
    );

    if (!category) {
      reasons.add("MISSING_CATEGORY");
      riskFlags.add("category_missing");
      candidates.push("blocked");
      return;
    }

    if (bannedCategories.has(category)) {
      reasons.add("BANNED_CATEGORY");
      riskFlags.add("category_blocked");
      candidates.push("rejected");
    }

    if (allowedCategories.size > 0 && !allowedCategories.has(category)) {
      reasons.add("CATEGORY_NOT_ALLOWLISTED");
      riskFlags.add("category_not_allowlisted");
      candidates.push("review_required");
    }

    if (
      product.categoryMappingConfidence !== null &&
      product.categoryMappingConfidence !== undefined &&
      product.categoryMappingConfidence < policy.minimumCategoryMappingConfidence
    ) {
      reasons.add("REVIEW_CATEGORY_MAPPING");
      riskFlags.add("category_uncertain");
      candidates.push("review_required");
    }
  }

  private applyDataIntegrityRules(
    product: NormalizedProductRuleInput,
    policy: RulesPolicyContext,
    reasons: Set<RuleReasonCode>,
    riskFlags: Set<string>,
    candidates: RuleDecisionStatus[]
  ): void {
    if (!product.internalSku && !product.supplierSku) {
      reasons.add("MISSING_SKU");
      riskFlags.add("missing_identifier");
      candidates.push("blocked");
    }

    if (
      product.stockQuantity === null ||
      product.stockQuantity === undefined ||
      !Number.isFinite(product.stockQuantity) ||
      product.stockQuantity < 0
    ) {
      reasons.add("INVALID_STOCK_DATA");
      riskFlags.add("stock_invalid");
      candidates.push("blocked");
      return;
    }

    if (product.stockQuantity < policy.minimumStockQuantity) {
      reasons.add("LOW_STOCK_CONFIDENCE");
      riskFlags.add("stock_low");
      candidates.push("review_required");
    }

    if (product.hasRequiredAttributes === false) {
      reasons.add("MISSING_REQUIRED_ATTRIBUTES");
      riskFlags.add("attribute_gap");
      candidates.push("review_required");
    }
  }

  private applySupplierTrustRules(
    supplier: SupplierRuleContext | undefined,
    policy: RulesPolicyContext,
    reasons: Set<RuleReasonCode>,
    riskFlags: Set<string>,
    candidates: RuleDecisionStatus[]
  ): void {
    if (supplier?.trustScore === null || supplier?.trustScore === undefined) {
      reasons.add("MISSING_SUPPLIER_TRUST");
      riskFlags.add("supplier_trust_unknown");
      candidates.push("review_required");
      return;
    }

    if (supplier.trustScore < policy.minimumSupplierTrustScore) {
      reasons.add("LOW_SUPPLIER_TRUST");
      riskFlags.add("supplier_trust_low");
      candidates.push("blocked");
      return;
    }

    if (supplier.trustScore < policy.supplierTrustReviewThreshold) {
      reasons.add("LOW_SUPPLIER_TRUST");
      riskFlags.add("supplier_trust_borderline");
      candidates.push("review_required");
    }
  }

  private applyShippingRules(
    product: NormalizedProductRuleInput,
    policy: RulesPolicyContext,
    reasons: Set<RuleReasonCode>,
    riskFlags: Set<string>,
    candidates: RuleDecisionStatus[]
  ): void {
    if (product.shippingMethodDefined === false) {
      reasons.add("MISSING_SHIPPING_METHOD");
      riskFlags.add("shipping_method_missing");
      candidates.push("blocked");
    }

    if (product.shippingTimeDays === null || product.shippingTimeDays === undefined) {
      reasons.add("MISSING_SHIPPING_TIME");
      riskFlags.add("shipping_time_missing");
      candidates.push("review_required");
      return;
    }

    if (product.shippingTimeDays > policy.maximumShippingTimeDays) {
      reasons.add("SHIPPING_TIME_EXCEEDS_THRESHOLD");
      riskFlags.add("shipping_time_unsafe");
      candidates.push("rejected");
    }
  }

  private applyImprovementRules(
    product: NormalizedProductRuleInput,
    policy: RulesPolicyContext,
    reasons: Set<RuleReasonCode>,
    riskFlags: Set<string>,
    candidates: RuleDecisionStatus[]
  ): void {
    if (
      product.imageCount !== null &&
      product.imageCount !== undefined &&
      product.imageCount < policy.minimumImageCount
    ) {
      reasons.add("WEAK_IMAGE_SET");
      riskFlags.add("image_set_weak");
      candidates.push("improve_required");
    }

    if (
      product.dataQualityScore !== null &&
      product.dataQualityScore !== undefined &&
      product.dataQualityScore < policy.minimumDataQualityScore
    ) {
      reasons.add("LOW_DATA_QUALITY");
      riskFlags.add("data_quality_low");
      candidates.push("improve_required");
    }

    const title = product.titleNormalized?.trim() ?? "";
    if (title.length > 0 && title.length < 20) {
      reasons.add("IMPROVE_DESCRIPTION");
      riskFlags.add("title_too_short");
      candidates.push("improve_required");
    }
  }
}
