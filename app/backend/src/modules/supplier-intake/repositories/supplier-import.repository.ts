import { createHash, randomUUID } from "node:crypto";
import { DatabaseClient, wrapPersistenceError } from "../../../shared";
import { RawImportRecord } from "../contracts/raw-import-record.contract";
import { SupplierIntakeStatus } from "../types/intake-status";

export interface PersistedRawProductReference {
  rowNumber: number;
  rawProductId: string;
  sourceProductReference: string;
}

export interface SupplierImportStartInput {
  importId: string;
  supplierId: string;
  sourceReference?: string | null;
}

export interface SupplierImportCompleteInput {
  importId: string;
  finalStatus: SupplierIntakeStatus;
  recordsReceived: number;
  recordsValid: number;
  recordsInvalid: number;
  errorSummary?: string | null;
}

export interface SupplierImportRepository {
  recordImportStarted(input: SupplierImportStartInput): Promise<void>;
  persistRawProducts(input: {
    importId: string;
    supplierId: string;
    records: RawImportRecord[];
  }): Promise<PersistedRawProductReference[]>;
  recordImportCompleted(input: SupplierImportCompleteInput): Promise<void>;
}

export class NoopSupplierImportRepository implements SupplierImportRepository {
  async recordImportStarted(): Promise<void> {}

  async persistRawProducts(input: {
    importId: string;
    supplierId: string;
    records: RawImportRecord[];
  }): Promise<PersistedRawProductReference[]> {
    return input.records
      .filter(
        (record): record is RawImportRecord & { sourceProductReference: string } =>
          typeof record.sourceProductReference === "string" &&
          record.sourceProductReference.trim().length > 0
      )
      .map((record) => ({
        rowNumber: record.rowNumber,
        rawProductId: `noop-raw-product-${randomUUID()}`,
        sourceProductReference: record.sourceProductReference
      }));
  }

  async recordImportCompleted(): Promise<void> {}
}

interface RawProductInsertRow {
  raw_product_id: string;
}

function mapFinalStatusToImportStatus(status: SupplierIntakeStatus): string {
  switch (status) {
    case "completed":
      return "completed";
    case "partial":
      return "partial";
    default:
      return "failed";
  }
}

export class PostgresSupplierImportRepository implements SupplierImportRepository {
  constructor(private readonly db: DatabaseClient) {}

  async recordImportStarted(input: SupplierImportStartInput): Promise<void> {
    try {
      await this.db.query(
        `
          insert into supplier_imports (
            import_id,
            supplier_id,
            import_status,
            source_reference
          )
          values ($1::uuid, $2::uuid, 'started', $3)
          on conflict (import_id) do update
          set
            supplier_id = excluded.supplier_id,
            source_reference = excluded.source_reference
        `,
        [input.importId, input.supplierId, input.sourceReference ?? null]
      );
    } catch (error) {
      throw wrapPersistenceError("record_import_started", error);
    }
  }

  async persistRawProducts(input: {
    importId: string;
    supplierId: string;
    records: RawImportRecord[];
  }): Promise<PersistedRawProductReference[]> {
    const persistedRows: PersistedRawProductReference[] = [];

    try {
      for (const record of input.records) {
        if (
          typeof record.sourceProductReference !== "string" ||
          record.sourceProductReference.trim().length === 0
        ) {
          continue;
        }

        const sourceProductReference = record.sourceProductReference.trim();
        const payloadHash = createHash("sha256")
          .update(JSON.stringify(record.rawPayload))
          .digest("hex");

        const rows = await this.db.query<RawProductInsertRow>(
          `
            insert into products_raw (
              supplier_id,
              import_id,
              source_product_reference,
              raw_payload_json,
              payload_hash
            )
            values ($1::uuid, $2::uuid, $3, $4::jsonb, $5)
            returning raw_product_id
          `,
          [
            input.supplierId,
            input.importId,
            sourceProductReference,
            JSON.stringify(record.rawPayload),
            payloadHash
          ]
        );
        const inserted = rows[0];
        if (!inserted) {
          throw new Error("Raw product insert returned no rows.");
        }

        persistedRows.push({
          rowNumber: record.rowNumber,
          rawProductId: inserted.raw_product_id,
          sourceProductReference
        });
      }

      return persistedRows;
    } catch (error) {
      throw wrapPersistenceError("persist_raw_products", error);
    }
  }

  async recordImportCompleted(input: SupplierImportCompleteInput): Promise<void> {
    try {
      await this.db.query(
        `
          update supplier_imports
          set
            import_status = $2,
            records_received = $3,
            records_valid = $4,
            records_invalid = $5,
            error_summary = $6,
            finished_at = now()
          where import_id = $1::uuid
        `,
        [
          input.importId,
          mapFinalStatusToImportStatus(input.finalStatus),
          input.recordsReceived,
          input.recordsValid,
          input.recordsInvalid,
          input.errorSummary ?? null
        ]
      );
    } catch (error) {
      throw wrapPersistenceError("record_import_completed", error);
    }
  }
}
