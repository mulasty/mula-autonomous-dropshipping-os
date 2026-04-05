import { SyncListingState, SyncPolicyContext, SyncSupplierState } from "../contracts/sync-input.contract";
import { RepricingEvaluationOutput } from "../contracts/sync-output.contract";

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundMargin(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export class RepricingEvaluationService {
  evaluate(
    listingState: SyncListingState,
    supplierState: SyncSupplierState,
    policy: SyncPolicyContext
  ): RepricingEvaluationOutput {
    const reasonCodes: string[] = [];
    const currentPrice = listingState.currentPrice;
    const sourceCost = supplierState.costNet ?? supplierState.costGross ?? null;

    if (currentPrice === null || !Number.isFinite(currentPrice) || currentPrice <= 0) {
      return {
        evaluationStatus: "unsafe",
        recommendedPrice: null,
        requiredMinimumPrice: null,
        projectedNetMargin: null,
        projectedProfitAmount: null,
        priceChangeRate: null,
        reasonCodes: ["CURRENT_PRICE_INVALID"]
      };
    }

    if (sourceCost === null || !Number.isFinite(sourceCost) || sourceCost <= 0) {
      return {
        evaluationStatus: "unsafe",
        recommendedPrice: null,
        requiredMinimumPrice: null,
        projectedNetMargin: null,
        projectedProfitAmount: null,
        priceChangeRate: null,
        reasonCodes: ["COST_DATA_INVALID"]
      };
    }

    const feeRateTotal = policy.channelFeeRate + policy.paymentFeeRate;
    if (feeRateTotal >= 1) {
      return {
        evaluationStatus: "review_required",
        recommendedPrice: null,
        requiredMinimumPrice: null,
        projectedNetMargin: null,
        projectedProfitAmount: null,
        priceChangeRate: null,
        reasonCodes: ["INVALID_FEE_CONFIGURATION"]
      };
    }

    const variableFees = currentPrice * feeRateTotal;
    const fixedBuffers = policy.shippingCostEstimate + policy.handlingBuffer + policy.returnRiskBuffer;
    const projectedProfitAmount = currentPrice - (sourceCost + fixedBuffers + variableFees);
    const projectedNetMargin = projectedProfitAmount / currentPrice;
    const requiredMinimumPrice =
      (sourceCost + fixedBuffers + policy.minimumAbsoluteProfitAmount) / (1 - feeRateTotal);

    if (
      projectedNetMargin >= policy.minimumNetMargin &&
      projectedProfitAmount >= policy.minimumAbsoluteProfitAmount
    ) {
      return {
        evaluationStatus: "not_needed",
        recommendedPrice: roundCurrency(currentPrice),
        requiredMinimumPrice: roundCurrency(requiredMinimumPrice),
        projectedNetMargin: roundMargin(projectedNetMargin),
        projectedProfitAmount: roundCurrency(projectedProfitAmount),
        priceChangeRate: 0,
        reasonCodes
      };
    }

    const recommendedPrice = roundCurrency(requiredMinimumPrice);
    const priceChangeRate = currentPrice > 0 ? (recommendedPrice - currentPrice) / currentPrice : null;

    if (priceChangeRate !== null && priceChangeRate > policy.maximumPriceIncreaseRate) {
      return {
        evaluationStatus: "review_required",
        recommendedPrice,
        requiredMinimumPrice: recommendedPrice,
        projectedNetMargin: roundMargin(projectedNetMargin),
        projectedProfitAmount: roundCurrency(projectedProfitAmount),
        priceChangeRate: roundMargin(priceChangeRate),
        reasonCodes: ["PRICE_CHANGE_THRESHOLD_EXCEEDED", "LIVE_MARGIN_UNSAFE"]
      };
    }

    reasonCodes.push("LIVE_MARGIN_UNSAFE");

    return {
      evaluationStatus: "price_update_needed",
      recommendedPrice,
      requiredMinimumPrice: recommendedPrice,
      projectedNetMargin: roundMargin(projectedNetMargin),
      projectedProfitAmount: roundCurrency(projectedProfitAmount),
      priceChangeRate: priceChangeRate === null ? null : roundMargin(priceChangeRate),
      reasonCodes
    };
  }
}
