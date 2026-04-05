import { DomainEvent } from "../../../shared";
import { NormalizationOutput } from "../../normalization";
import { QualificationOutput } from "../../qualification";
import {
  PersistedProductRuleDecision,
  RuleEvaluationOutput
} from "../../rules-engine";

export type ProductPipelineStage =
  | "normalization"
  | "normalization_persistence"
  | "rules_evaluation"
  | "qualification";

export interface ProductPipelineOutput {
  workflowRunId: string;
  supplierId: string;
  importId: string | null;
  stageReached: ProductPipelineStage;
  pipelineStatus: "completed" | "review_required" | "escalated" | "failed";
  normalization: NormalizationOutput;
  rulesDecision: RuleEvaluationOutput | null;
  qualification: QualificationOutput | null;
  persistedArtifacts: {
    normalizedProductId: string | null;
    ruleDecisionId: string | null;
  };
  recommendedNextStep: string;
  domainEvents: DomainEvent[];
}

export interface ProductPipelineRuleEvaluationArtifacts {
  decision: RuleEvaluationOutput;
  persistedDecision: PersistedProductRuleDecision | null;
}
