import { defaultRulesPolicyContext, RulesPolicyContext } from "../../rules-engine";
import {
  LoadedPolicyRecord,
  LoadedRulesPolicy,
  PolicyLoadRequest,
  PolicyLoader
} from "../contracts/policy-loader.contract";
import { PolicyRepository } from "../repositories/policy.repository";

function parseNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function parseStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function pickPayloadValue(
  payload: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (key in payload) {
      return payload[key];
    }
  }

  return undefined;
}

function mapRulesPolicyPayload(
  payload: Record<string, unknown>,
  policyVersionFallback: string
): Partial<RulesPolicyContext> {
  return {
    policyVersion:
      parseString(pickPayloadValue(payload, "policyVersion", "policy_version")) ??
      policyVersionFallback,
    rulesVersion:
      parseString(pickPayloadValue(payload, "rulesVersion", "rules_version")) ??
      defaultRulesPolicyContext.rulesVersion,
    minimumNetMargin: parseNumber(
      pickPayloadValue(payload, "minimumNetMargin", "minimum_net_margin")
    ),
    reviewWarningBandUpper: parseNumber(
      pickPayloadValue(payload, "reviewWarningBandUpper", "review_warning_band_upper")
    ),
    minimumAbsoluteProfitAmount: parseNumber(
      pickPayloadValue(
        payload,
        "minimumAbsoluteProfitAmount",
        "minimum_absolute_profit_amount"
      )
    ),
    minimumSupplierTrustScore: parseNumber(
      pickPayloadValue(
        payload,
        "minimumSupplierTrustScore",
        "minimum_supplier_trust_score"
      )
    ),
    supplierTrustReviewThreshold: parseNumber(
      pickPayloadValue(
        payload,
        "supplierTrustReviewThreshold",
        "supplier_trust_review_threshold"
      )
    ),
    maximumShippingTimeDays: parseNumber(
      pickPayloadValue(payload, "maximumShippingTimeDays", "maximum_shipping_time_days")
    ),
    minimumDataQualityScore: parseNumber(
      pickPayloadValue(payload, "minimumDataQualityScore", "minimum_data_quality_score")
    ),
    minimumImageCount: parseNumber(
      pickPayloadValue(payload, "minimumImageCount", "minimum_image_count")
    ),
    minimumStockQuantity: parseNumber(
      pickPayloadValue(payload, "minimumStockQuantity", "minimum_stock_quantity")
    ),
    minimumCategoryMappingConfidence: parseNumber(
      pickPayloadValue(
        payload,
        "minimumCategoryMappingConfidence",
        "minimum_category_mapping_confidence"
      )
    ),
    allowedCategories: parseStringArray(
      pickPayloadValue(payload, "allowedCategories", "allowed_categories")
    ),
    bannedCategories: parseStringArray(
      pickPayloadValue(payload, "bannedCategories", "banned_categories")
    ),
    allowMissingFeeModelReview: parseBoolean(
      pickPayloadValue(
        payload,
        "allowMissingFeeModelReview",
        "allow_missing_fee_model_review"
      )
    ),
    allowMissingShippingEstimateReview: parseBoolean(
      pickPayloadValue(
        payload,
        "allowMissingShippingEstimateReview",
        "allow_missing_shipping_estimate_review"
      )
    )
  };
}

export class PolicyLoaderService implements PolicyLoader {
  constructor(
    private readonly policyRepository: PolicyRepository,
    private readonly defaultRulesPolicy: RulesPolicyContext = defaultRulesPolicyContext
  ) {}

  async loadPolicyRecord(input: PolicyLoadRequest): Promise<LoadedPolicyRecord> {
    const record = await this.policyRepository.findPolicy({
      ...input,
      requireActive: input.requireActive ?? true
    });

    return {
      source: record ? "database" : "fallback",
      record,
      warnings: record ? [] : [`POLICY_NOT_FOUND:${input.policyName}`]
    };
  }

  async loadRulesPolicy(
    overrides: Partial<RulesPolicyContext> = {}
  ): Promise<LoadedRulesPolicy> {
    const loadedRecord = await this.loadPolicyRecord({
      policyName: "rules_engine_policy",
      policyVersion: overrides.policyVersion
    });

    const databasePolicy = loadedRecord.record
      ? mapRulesPolicyPayload(
          loadedRecord.record.policyPayload,
          loadedRecord.record.policyVersion
        )
      : {};

    return {
      ...loadedRecord,
      policy: {
        ...this.defaultRulesPolicy,
        ...databasePolicy,
        ...overrides,
        allowedCategories:
          overrides.allowedCategories ??
          databasePolicy.allowedCategories ??
          this.defaultRulesPolicy.allowedCategories,
        bannedCategories:
          overrides.bannedCategories ??
          databasePolicy.bannedCategories ??
          this.defaultRulesPolicy.bannedCategories
      }
    };
  }
}
