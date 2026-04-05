import { randomUUID } from "node:crypto";
import { RawImportRecord } from "../contracts/raw-import-record.contract";
import { PersistedRawProductReference } from "../repositories/supplier-import.repository";

export interface PersistImportPayloadInput {
  importId: string;
  supplierId: string;
  payload: unknown;
  checksum?: string | null;
}

export interface PersistRawRecordsInput {
  importId: string;
  records: RawImportRecord[];
}

export interface RawPayloadPersisterService {
  persistImportPayload(input: PersistImportPayloadInput): Promise<{ rawPayloadReference: string }>;
  persistRawRecords(
    input: PersistRawRecordsInput
  ): Promise<{ persistedCount: number; persistedRows: PersistedRawProductReference[] }>;
}

export class NoopRawPayloadPersisterService implements RawPayloadPersisterService {
  async persistImportPayload(): Promise<{ rawPayloadReference: string }> {
    return {
      rawPayloadReference: `noop-raw-payload-${randomUUID()}`
    };
  }

  async persistRawRecords(
    input: PersistRawRecordsInput
  ): Promise<{ persistedCount: number; persistedRows: PersistedRawProductReference[] }> {
    return {
      persistedCount: input.records.length,
      persistedRows: input.records
        .filter(
          (record): record is RawImportRecord & { sourceProductReference: string } =>
            typeof record.sourceProductReference === "string" &&
            record.sourceProductReference.trim().length > 0
        )
        .map((record) => ({
          rowNumber: record.rowNumber,
          rawProductId: `noop-raw-product-${randomUUID()}`,
          sourceProductReference: record.sourceProductReference
        }))
    };
  }
}
