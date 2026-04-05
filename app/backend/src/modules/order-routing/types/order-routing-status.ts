export const ORDER_ROUTING_STATUSES = [
  "routing_validation_failed",
  "payload_built",
  "supplier_acknowledged",
  "supplier_rejected",
  "supplier_ambiguous",
  "supplier_timeout",
  "awaiting_tracking",
  "exception"
] as const;

export type OrderRoutingStatus = (typeof ORDER_ROUTING_STATUSES)[number];
