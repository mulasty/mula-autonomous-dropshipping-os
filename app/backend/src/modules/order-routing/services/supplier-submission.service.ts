import { randomUUID } from "node:crypto";
import { SupplierAcknowledgementStatus } from "../../../shared";
import { SupplierOrderPayload } from "../contracts/supplier-order-payload.contract";

export interface SupplierSubmissionResult {
  acknowledgementStatus: SupplierAcknowledgementStatus;
  submissionReference: string;
  supplierOrderReference?: string | null;
  retrySafe: boolean;
  responseSummary: string;
}

export interface SupplierSubmissionService {
  submit(payload: SupplierOrderPayload): Promise<SupplierSubmissionResult>;
}

export class PlaceholderSupplierSubmissionService implements SupplierSubmissionService {
  async submit(payload: SupplierOrderPayload): Promise<SupplierSubmissionResult> {
    return {
      acknowledgementStatus: "ambiguous",
      submissionReference: payload.submissionReference || randomUUID(),
      supplierOrderReference: null,
      retrySafe: false,
      responseSummary: "Supplier submission adapter is not configured."
    };
  }
}
