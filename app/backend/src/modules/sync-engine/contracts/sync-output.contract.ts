import { DomainEvent } from "../../../shared";
import { SyncStatus } from "../types/sync-status";

export interface SyncStockHistoryEntry {
  stockEventId: string;
  productId: string;
  previousStock: number | null;
  newStock: number | null;
  sourceReference: string | null;
  changedAt: string;
}

export interface SyncPricingHistoryEntry {
  pricingEventId: string;
  listingId: string;
  previousPrice: number | null;
  newPrice: number | null;
  changeReason: string;
  sourceCostReference: string | null;
  triggeredBy: string;
  changedAt: string;
}

export interface RepricingEvaluationOutput {
  evaluationStatus: "not_needed" | "price_update_needed" | "review_required" | "unsafe";
  recommendedPrice: number | null;
  requiredMinimumPrice: number | null;
  projectedNetMargin: number | null;
  projectedProfitAmount: number | null;
  priceChangeRate: number | null;
  reasonCodes: string[];
}

export type SyncStockAction = "none" | "update_stock" | "review_required";
export type SyncPriceAction = "none" | "update_price" | "review_required";
export type SyncVisibilityAction = "none" | "pause_listing" | "hide_listing";
export type SyncAppliedAction =
  | "update_stock"
  | "update_price"
  | "pause_listing"
  | "hide_listing";

export interface SyncOutput {
  productId: string;
  listingId: string;
  syncStatus: SyncStatus;
  stockAction: SyncStockAction;
  priceAction: SyncPriceAction;
  visibilityAction: SyncVisibilityAction;
  actionsTaken: SyncAppliedAction[];
  previousStock: number | null;
  newStock: number | null;
  previousPrice: number | null;
  newPrice: number | null;
  repricingEvaluation: RepricingEvaluationOutput;
  stockHistoryEntry?: SyncStockHistoryEntry | null;
  pricingHistoryEntry?: SyncPricingHistoryEntry | null;
  reasonCodes: string[];
  recommendedNextStep: string;
  exceptionRecommended: boolean;
  policyVersion: string;
  domainEvents: DomainEvent[];
}
