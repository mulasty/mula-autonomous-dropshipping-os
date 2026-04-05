export interface OrderRoutingItemInput {
  orderItemId?: string;
  supplierSku?: string | null;
  quantity: number;
}

export interface OrderRoutingAddressInput {
  fullName: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
}

export interface OrderRoutingPolicyContext {
  allowedPaymentStatuses: string[];
  supportedCountries: string[];
}

export interface OrderRoutingInput {
  orderId: string;
  supplierId: string;
  channel: string;
  orderStatus: string;
  paymentStatus: string;
  items: OrderRoutingItemInput[];
  shippingAddress: OrderRoutingAddressInput;
  customerNotes?: string | null;
  idempotencyKey?: string | null;
  policyContext?: Partial<OrderRoutingPolicyContext>;
}
