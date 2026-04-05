export type SupportClassificationLabel =
  | "pre_sale_question"
  | "order_status"
  | "shipping_delay"
  | "return_request"
  | "complaint_low_risk"
  | "complaint_high_risk"
  | "refund_request"
  | "cancellation_request"
  | "legal_or_reputational_risk"
  | "unclear";

export interface SupportOrderContext {
  orderId?: string | null;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  trackingStatus?: string | null;
}

export interface SupportTrackingContext {
  carrier?: string | null;
  trackingNumber?: string | null;
  lastKnownStatus?: string | null;
  lastUpdatedAt?: string | null;
}

export interface SupportProductContext {
  productId?: string | null;
  title?: string | null;
  knownFacts?: string[];
}

export interface SupportPolicyContext {
  policyVersion: string;
  automationConfidenceThreshold: number;
  escalationConfidenceThreshold: number;
  autoSendLabels: SupportClassificationLabel[];
  draftOnlyLabels: SupportClassificationLabel[];
}

export interface SupportClassificationInput {
  messageId?: string;
  channel: string;
  messageText: string;
  customerId?: string | null;
  orderContext?: SupportOrderContext;
  trackingContext?: SupportTrackingContext;
  productContext?: SupportProductContext;
  policyContext?: Partial<SupportPolicyContext>;
}
