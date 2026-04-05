import { RuleReasonCode } from "../types/reason-code";
import { RuleDecisionStatus } from "../types/rule-decision-status";

export interface ComputedMarginMetrics {
  formulaVersion: string;
  baseCost: number | null;
  variableFeeTotal: number | null;
  logisticsTotal: number | null;
  riskBufferTotal: number | null;
  requiredMinimumPrice: number | null;
  projectedSalePrice: number;
  projectedProfitAmount: number | null;
  projectedNetMargin: number | null;
  projectedGrossMargin: number | null;
  marginDecision: RuleDecisionStatus;
  marginReasonCodes: RuleReasonCode[];
}

export interface RuleEvaluationOutput {
  productId: string;
  decisionStatus: RuleDecisionStatus;
  decisionReasonCodes: RuleReasonCode[];
  computedMarginMetrics: ComputedMarginMetrics;
  riskFlags: string[];
  recommendedNextStep: string;
  listingGenerationAllowed: boolean;
  policyVersion: string;
  rulesVersion: string;
}
