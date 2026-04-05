export const RUNTIME_RESULT_STATUSES = ["ok", "review_required", "escalated", "failed"] as const;
export type RuntimeResultStatus = (typeof RUNTIME_RESULT_STATUSES)[number];

export const EXCEPTION_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type ExceptionSeverity = (typeof EXCEPTION_SEVERITIES)[number];

export const EXCEPTION_STATUSES = ["new", "acknowledged", "in_review", "resolved", "closed"] as const;
export type ExceptionStatus = (typeof EXCEPTION_STATUSES)[number];

export const SUPPLIER_ACKNOWLEDGEMENT_STATUSES = [
  "acknowledged",
  "rejected",
  "ambiguous",
  "timeout"
] as const;
export type SupplierAcknowledgementStatus = (typeof SUPPLIER_ACKNOWLEDGEMENT_STATUSES)[number];
