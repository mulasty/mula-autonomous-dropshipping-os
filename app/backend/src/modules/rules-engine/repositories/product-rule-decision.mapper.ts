import { nowIsoTimestamp } from "../../../shared";
import { RuleEvaluationOutput } from "../contracts/rule-evaluation-output.contract";

export interface ProductRuleDecisionPersistenceRow {
  productId: string;
  rulesVersion: string;
  policyVersion: string;
  decisionStatus: RuleEvaluationOutput["decisionStatus"];
  reasonCodesJson: string;
  projectedNetMargin: number | null;
  projectedGrossMargin: number | null;
  riskFlagsJson: string;
  recommendedNextStep: string;
  decidedAt: string;
}

export function mapRuleDecisionToPersistenceRow(
  decision: RuleEvaluationOutput
): ProductRuleDecisionPersistenceRow {
  return {
    productId: decision.productId,
    rulesVersion: decision.rulesVersion,
    policyVersion: decision.policyVersion,
    decisionStatus: decision.decisionStatus,
    reasonCodesJson: JSON.stringify(decision.decisionReasonCodes),
    projectedNetMargin: decision.computedMarginMetrics.projectedNetMargin,
    projectedGrossMargin: decision.computedMarginMetrics.projectedGrossMargin,
    riskFlagsJson: JSON.stringify(decision.riskFlags),
    recommendedNextStep: decision.recommendedNextStep,
    decidedAt: nowIsoTimestamp()
  };
}
