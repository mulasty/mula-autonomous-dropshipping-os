export const RULE_DECISION_STATUSES = [
  "approved",
  "rejected",
  "review_required",
  "improve_required",
  "blocked"
] as const;

export type RuleDecisionStatus = (typeof RULE_DECISION_STATUSES)[number];

export const RULE_DECISION_PRIORITY: Record<RuleDecisionStatus, number> = {
  approved: 1,
  improve_required: 2,
  review_required: 3,
  rejected: 4,
  blocked: 5
};
