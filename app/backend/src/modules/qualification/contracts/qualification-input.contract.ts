import { RuleEvaluationInput, RuleEvaluationOutput } from "../../rules-engine";

export interface QualificationInput {
  workflowRunId?: string;
  highBusinessPriority?: boolean;
  aiReviewEnabled?: boolean;
  existingRuleDecision?: RuleEvaluationOutput;
  rulesInput?: RuleEvaluationInput;
}
