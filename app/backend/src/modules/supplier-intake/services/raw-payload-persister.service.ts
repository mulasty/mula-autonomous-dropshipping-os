import { randomUUID } from "node:crypto";
import { RawImportRecord } from "../contracts/raw-import-record.contract";

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
  persistRawRecords(input: PersistRawRecordsInput): Promise<{ persistedCount: number }>;
}

export class NoopRawPayloadPersisterService implements RawPayloadPersisterService {
  async persistImportPayload(): Promise<{ rawPayloadReference: string }> {
    return {
      rawPayloadReference: `noop-raw-payload-${randomUUID()}`
    };
  }

  async persistRawRecords(input: PersistRawRecordsInput): Promise<{ persistedCount: number }> {
    return {
      persistedCount: input.records.length
    };
  }
}
