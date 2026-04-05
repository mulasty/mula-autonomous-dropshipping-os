export const SYNC_STATUSES = [
  "no_change_needed",
  "stock_updated",
  "price_updated",
  "stock_and_price_updated",
  "listing_paused",
  "listing_hidden",
  "review_required"
] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];
