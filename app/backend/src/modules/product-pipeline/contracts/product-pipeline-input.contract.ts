import {
  NormalizationPricingContext
} from "../../normalization";
import { SupplierRuleContext } from "../../rules-engine";
import { RowPrevalidationStatus } from "../../supplier-intake";

export interface ProductPipelineInput {
  workflowRunId?: string;
  supplierId: string;
  importId?: string | null;
  rawProductId?: string | null;
  sourceProductReference: string;
  rawPayload: Record<string, unknown>;
  prevalidationStatus?: RowPrevalidationStatus;
  pricingContext: NormalizationPricingContext;
  supplierContext?: SupplierRuleContext;
  aiReviewEnabled?: boolean;
  highBusinessPriority?: boolean;
  persistNormalizedProduct?: boolean;
  persistRuleDecision?: boolean;
}
