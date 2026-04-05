export const SUPPLIER_INTAKE_STATUSES = [
  "started",
  "fetched",
  "parsed",
  "partial",
  "completed",
  "failed"
] as const;

export type SupplierIntakeStatus = (typeof SUPPLIER_INTAKE_STATUSES)[number];

export const ROW_PREVALIDATION_STATUSES = [
  "accepted_for_normalization",
  "rejected_invalid_row",
  "review_required_row"
] as const;

export type RowPrevalidationStatus = (typeof ROW_PREVALIDATION_STATUSES)[number];
