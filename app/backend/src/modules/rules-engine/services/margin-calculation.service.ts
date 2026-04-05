import { RulesPolicyContext, NormalizedProductRuleInput } from "../contracts/rule-evaluation-input.contract";
import { ComputedMarginMetrics } from "../contracts/rule-evaluation-output.contract";
import { RuleReasonCode } from "../types/reason-code";

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundMargin(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export interface MarginCalculationResult {
  metrics: ComputedMarginMetrics;
}

export class MarginCalculationService {
  private readonly formulaVersion = "margin-formula-v1";

  calculate(
    product: NormalizedProductRuleInput,
    policy: RulesPolicyContext
  ): MarginCalculationResult {
    const reasons: RuleReasonCode[] = [];
    const supplierCost = product.costNet ?? product.costGross ?? null;

    if (!Number.isFinite(product.projectedSalePrice) || product.projectedSalePrice <= 0) {
      reasons.push("INVALID_PROJECTED_SALE_PRICE");

      return {
        metrics: {
          formulaVersion: this.formulaVersion,
          baseCost: null,
          variableFeeTotal: null,
          logisticsTotal: null,
          riskBufferTotal: null,
          requiredMinimumPrice: null,
          projectedSalePrice: product.projectedSalePrice,
          projectedProfitAmount: null,
          projectedNetMargin: null,
          projectedGrossMargin: null,
          marginDecision: "blocked",
          marginReasonCodes: reasons
        }
      };
    }

    const missingCostData = supplierCost === null || !Number.isFinite(supplierCost);
    if (missingCostData) {
      reasons.push("MISSING_COST_DATA");
    }

    const channelFeeRate = product.channelFeeRate ?? null;
    const paymentFeeRate = product.paymentFeeRate ?? null;
    const missingFeeModel = channelFeeRate === null || paymentFeeRate === null;
    if (missingFeeModel) {
      reasons.push("MISSING_FEE_MODEL");
    }

    const shippingCostEstimate = product.shippingCostEstimate ?? null;
    const missingShippingEstimate = shippingCostEstimate === null;
    if (missingShippingEstimate) {
      reasons.push("MISSING_SHIPPING_ESTIMATE");
    }

    if (reasons.length > 0) {
      const marginDecision =
        !missingCostData &&
        ((missingFeeModel && policy.allowMissingFeeModelReview) ||
          (missingShippingEstimate && policy.allowMissingShippingEstimateReview))
          ? "review_required"
          : "blocked";

      return {
        metrics: {
          formulaVersion: this.formulaVersion,
          baseCost: null,
          variableFeeTotal: null,
          logisticsTotal: shippingCostEstimate,
          riskBufferTotal: null,
          requiredMinimumPrice: null,
          projectedSalePrice: roundCurrency(product.projectedSalePrice),
          projectedProfitAmount: null,
          projectedNetMargin: null,
          projectedGrossMargin: null,
          marginDecision,
          marginReasonCodes: reasons
        }
      };
    }

    const resolvedSupplierCost = supplierCost as number;
    const resolvedChannelFeeRate = channelFeeRate as number;
    const resolvedPaymentFeeRate = paymentFeeRate as number;
    const resolvedShippingCostEstimate = shippingCostEstimate as number;
    const handlingBuffer = product.handlingBuffer ?? 0;
    const returnRiskBuffer = product.returnRiskBuffer ?? 0;
    const feeRateTotal = resolvedChannelFeeRate + resolvedPaymentFeeRate;
    const variableFeeTotal = product.projectedSalePrice * feeRateTotal;
    const riskBufferTotal = handlingBuffer + returnRiskBuffer;
    const baseCost = resolvedSupplierCost + resolvedShippingCostEstimate + variableFeeTotal + riskBufferTotal;
    const projectedProfitAmount = product.projectedSalePrice - baseCost;
    const projectedNetMargin = projectedProfitAmount / product.projectedSalePrice;

    let projectedGrossMargin: number | null = null;
    if (
      product.costGross !== null &&
      product.costGross !== undefined &&
      product.projectedSalePriceGross !== null &&
      product.projectedSalePriceGross !== undefined &&
      Number.isFinite(product.projectedSalePriceGross)
    ) {
      const grossProfit =
        product.projectedSalePriceGross -
        (product.costGross + resolvedShippingCostEstimate + variableFeeTotal + riskBufferTotal);
      projectedGrossMargin = grossProfit / product.projectedSalePriceGross;
    }

    const requiredMinimumPrice =
      feeRateTotal < 1
        ? (resolvedSupplierCost + resolvedShippingCostEstimate + riskBufferTotal + policy.minimumAbsoluteProfitAmount) /
          (1 - feeRateTotal)
        : null;

    if (projectedProfitAmount < 0) {
      reasons.push("NEGATIVE_PROFIT");
    }

    if (projectedProfitAmount < policy.minimumAbsoluteProfitAmount) {
      reasons.push("BELOW_MINIMUM_ABSOLUTE_PROFIT");
    }

    if (projectedNetMargin < policy.minimumNetMargin) {
      reasons.push("LOW_MARGIN");
    } else if (projectedNetMargin <= policy.reviewWarningBandUpper) {
      reasons.push("BORDERLINE_MARGIN");
    }

    let marginDecision: ComputedMarginMetrics["marginDecision"] = "approved";
    if (
      reasons.includes("NEGATIVE_PROFIT") ||
      reasons.includes("BELOW_MINIMUM_ABSOLUTE_PROFIT") ||
      reasons.includes("LOW_MARGIN")
    ) {
      marginDecision = "rejected";
    } else if (reasons.includes("BORDERLINE_MARGIN")) {
      marginDecision = "review_required";
    }

    return {
      metrics: {
        formulaVersion: this.formulaVersion,
        baseCost: roundCurrency(baseCost),
        variableFeeTotal: roundCurrency(variableFeeTotal),
        logisticsTotal: roundCurrency(resolvedShippingCostEstimate),
        riskBufferTotal: roundCurrency(riskBufferTotal),
        requiredMinimumPrice: requiredMinimumPrice === null ? null : roundCurrency(requiredMinimumPrice),
        projectedSalePrice: roundCurrency(product.projectedSalePrice),
        projectedProfitAmount: roundCurrency(projectedProfitAmount),
        projectedNetMargin: roundMargin(projectedNetMargin),
        projectedGrossMargin: projectedGrossMargin === null ? null : roundMargin(projectedGrossMargin),
        marginDecision,
        marginReasonCodes: reasons
      }
    };
  }
}
