import { RowPrevalidationStatus } from "../../supplier-intake";

export interface NormalizationPricingContext {
  projectedSalePrice: number;
  targetChannel: string;
  projectedSalePriceGross?: number | null;
  shippingCostEstimate?: number | null;
  channelFeeRate?: number | null;
  paymentFeeRate?: number | null;
  handlingBuffer?: number | null;
  returnRiskBuffer?: number | null;
  taxRate?: number | null;
}

export interface NormalizationInput {
  workflowRunId?: string;
  supplierId: string;
  importId?: string | null;
  rawProductId?: string | null;
  sourceProductReference: string;
  rawPayload: Record<string, unknown>;
  prevalidationStatus: RowPrevalidationStatus;
  pricingContext: NormalizationPricingContext;
}
