import { DomainEvent } from "../../../shared";
import { RowPrevalidationStatus, SupplierIntakeStatus } from "../types/intake-status";

export interface RawImportRecord {
  rowNumber: number;
  sourceProductReference?: string | null;
  rawPayload: unknown;
  prevalidationStatus: RowPrevalidationStatus;
  warningCodes: string[];
  errorCodes: string[];
}

export interface SupplierImportSummary {
  recordsReceived: number;
  recordsParsed: number;
  recordsAccepted: number;
  recordsRejected: number;
  recordsReviewRequired: number;
  parseErrorCount: number;
}

export interface SupplierIntakeOutput {
  importId: string;
  supplierId: string;
  finalStatus: SupplierIntakeStatus;
  rawPayloadReference?: string | null;
  records: RawImportRecord[];
  summary: SupplierImportSummary;
  parseWarnings: string[];
  normalizationDispatchReady: boolean;
  recommendedNextStep: string;
  domainEvents: DomainEvent[];
}
