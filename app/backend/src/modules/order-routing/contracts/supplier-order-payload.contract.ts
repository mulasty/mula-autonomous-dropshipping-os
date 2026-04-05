export interface SupplierOrderPayloadItem {
  supplierSku: string;
  quantity: number;
}

export interface SupplierOrderShippingAddress {
  fullName: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
}

export interface SupplierOrderPayload {
  orderId: string;
  supplierId: string;
  submittedAt: string;
  items: SupplierOrderPayloadItem[];
  shippingAddress: SupplierOrderShippingAddress;
  customerNotes?: string | null;
  submissionReference: string;
}
