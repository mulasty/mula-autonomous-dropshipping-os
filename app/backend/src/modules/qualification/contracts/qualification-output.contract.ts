import { DomainEvent } from "../../../shared";
import { RuleEvaluationOutput } from "../../rules-engine";
import { QualificationStatus } from "../types/qualification-status";

export interface QualificationOutput {
  productId: string;
  qualificationStatus: QualificationStatus;
  rulesDecision: RuleEvaluationOutput;
  aiReviewEligible: boolean;
  aiReviewRequiredBeforeListing: boolean;
  listingGenerationAllowed: boolean;
  exceptionRecommended: boolean;
  recommendedNextStep: string;
  auditLogRequired: boolean;
  domainEvents: DomainEvent[];
}
