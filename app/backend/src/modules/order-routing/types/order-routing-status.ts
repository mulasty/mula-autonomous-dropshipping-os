export const ORDER_ROUTING_STATUSES = [
  "routing_validation_failed",
  "supplier_rejected",
  "supplier_ambiguous",
  "supplier_timeout",
  "awaiting_tracking"
] as const;

export type OrderRoutingStatus = (typeof ORDER_ROUTING_STATUSES)[number];
