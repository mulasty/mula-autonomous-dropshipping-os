import { randomUUID } from "node:crypto";
import { DatabaseClient } from "../persistence/database-client";
import { wrapPersistenceError } from "../persistence/persistence-error";
import { nowIsoTimestamp } from "../persistence/timestamp";
import { ExceptionCreateInput, ExceptionReference } from "./exception-service";

interface ExceptionInsertRow {
  exception_id: string;
  severity: ExceptionReference["severity"];
  status: ExceptionReference["status"];
  created_at: string;
}

export interface StoredExceptionRecord extends ExceptionReference {
  entityType: string;
  entityId: string;
  exceptionCategory: string;
  summary: string;
  details: Record<string, unknown>;
}

export interface ExceptionRepository {
  saveException(input: ExceptionCreateInput): Promise<ExceptionReference>;
}

export class NoopExceptionRepository implements ExceptionRepository {
  async saveException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    return {
      exceptionId: `noop-exception-${randomUUID()}`,
      severity: input.severity,
      status: "new",
      reasonCode: input.reasonCode,
      createdAt: nowIsoTimestamp()
    };
  }
}

export class InMemoryExceptionRepository implements ExceptionRepository {
  private readonly store = new Map<string, StoredExceptionRecord>();

  async saveException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    const record: StoredExceptionRecord = {
      exceptionId: `memory-exception-${randomUUID()}`,
      entityType: input.entityType,
      entityId: input.entityId,
      exceptionCategory: input.domain,
      severity: input.severity,
      status: "new",
      reasonCode: input.reasonCode,
      summary: input.summary,
      details: input.details ?? {},
      createdAt: nowIsoTimestamp()
    };

    this.store.set(record.exceptionId, record);
    return record;
  }

  async listOpenExceptions(): Promise<StoredExceptionRecord[]> {
    return [...this.store.values()].filter((record) =>
      ["new", "acknowledged", "in_review"].includes(record.status)
    );
  }
}

export class PostgresExceptionRepository implements ExceptionRepository {
  constructor(private readonly db: DatabaseClient) {}

  async saveException(input: ExceptionCreateInput): Promise<ExceptionReference> {
    try {
      const rows = await this.db.query<ExceptionInsertRow>(
        `
          insert into exceptions (
            entity_type,
            entity_id,
            exception_category,
            severity,
            status,
            summary,
            details_json
          )
          values ($1, $2::uuid, $3, $4, 'new', $5, $6::jsonb)
          returning
            exception_id,
            severity,
            status,
            created_at::text as created_at
        `,
        [
          input.entityType,
          input.entityId,
          input.domain,
          input.severity,
          input.summary,
          JSON.stringify(input.details ?? {})
        ]
      );

      const row = rows[0];
      if (!row) {
        throw new Error("Exception insert returned no rows.");
      }

      return {
        exceptionId: row.exception_id,
        severity: row.severity,
        status: row.status,
        reasonCode: input.reasonCode,
        createdAt: row.created_at
      };
    } catch (error) {
      throw wrapPersistenceError("save_exception", error);
    }
  }
}
