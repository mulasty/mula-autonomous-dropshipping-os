import { DomainEvent } from "../../../shared";
import { SupplierAcknowledgementStatus } from "../../../shared";
import { SupplierOrderPayload } from "./supplier-order-payload.contract";
import { OrderRoutingStatus } from "../types/order-routing-status";

export interface OrderRoutingOutput {
  orderId: string;
  routingStatus: OrderRoutingStatus;
  acknowledgementStatus?: SupplierAcknowledgementStatus;
  supplierOrderReference?: string | null;
  submissionReference?: string | null;
  supplierPayload?: SupplierOrderPayload;
  recommendedNextStep: string;
  domainEvents: DomainEvent[];
}
