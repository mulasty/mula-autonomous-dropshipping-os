export interface SyncNormalizedProductInput {
  productId: string;
  internalSku?: string | null;
  supplierSku?: string | null;
  categoryNormalized?: string | null;
  shippingTimeDays?: number | null;
}

export interface SyncSupplierState {
  sourceReference?: string | null;
  stockQuantity?: number | null;
  stockKnown: boolean;
  availabilityStatus: "active" | "inactive" | "discontinued" | "unknown";
  costNet?: number | null;
  costGross?: number | null;
}

export interface SyncListingState {
  listingId: string;
  channel: string;
  listingStatus: "published" | "paused" | "ready_for_publication" | "generated" | "archived";
  currentPrice: number | null;
  currentStock: number | null;
  currentlyVisible: boolean;
}

export interface SyncPolicyContext {
  policyVersion: string;
  minimumNetMargin: number;
  minimumAbsoluteProfitAmount: number;
  maximumPriceIncreaseRate: number;
  maximumPriceDecreaseRate: number;
  zeroStockAction: "pause" | "hide";
  unknownStockAction: "pause" | "hide";
  discontinuedAction: "pause" | "hide";
  stockInstabilityEscalationThreshold: number;
  channelFeeRate: number;
  paymentFeeRate: number;
  shippingCostEstimate: number;
  handlingBuffer: number;
  returnRiskBuffer: number;
  repeatedFailureCount: number;
  stockInstabilityDetected: boolean;
}

export interface SyncInput {
  syncRunId?: string;
  normalizedProduct: SyncNormalizedProductInput;
  supplierState: SyncSupplierState;
  listingState: SyncListingState;
  policyContext?: Partial<SyncPolicyContext>;
}
