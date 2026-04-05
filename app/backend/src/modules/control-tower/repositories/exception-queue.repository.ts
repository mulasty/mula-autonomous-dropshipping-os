import {
  EXCEPTION_SEVERITIES,
  EXCEPTION_STATUSES,
  InMemoryExceptionRepository,
  StoredExceptionRecord
} from "../../../shared";
import { PostgresDatabase } from "../../../db/postgres";
import {
  ControlTowerExceptionItem,
  ControlTowerExceptionSummary
} from "../contracts/control-tower-summary.contract";

interface ExceptionCountRow {
  severity: (typeof EXCEPTION_SEVERITIES)[number];
  status: (typeof EXCEPTION_STATUSES)[number];
  count: string;
}

interface ExceptionItemRow {
  exception_id: string;
  entity_type: string;
  entity_id: string | null;
  exception_category: string;
  severity: (typeof EXCEPTION_SEVERITIES)[number];
  status: (typeof EXCEPTION_STATUSES)[number];
  summary: string;
  created_at: string;
}

function createEmptySeverityMap() {
  return {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };
}

function createEmptyStatusMap() {
  return {
    new: 0,
    acknowledged: 0,
    in_review: 0,
    resolved: 0,
    closed: 0
  };
}

function mapRecordsToSummary(
  records: StoredExceptionRecord[],
  warnings: string[]
): ControlTowerExceptionSummary {
  const bySeverity = createEmptySeverityMap();
  const byStatus = createEmptyStatusMap();

  for (const record of records) {
    bySeverity[record.severity] += 1;
    byStatus[record.status] += 1;
  }

  const items: ControlTowerExceptionItem[] = records
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 10)
    .map((record) => ({
      exceptionId: record.exceptionId,
      entityType: record.entityType,
      entityId: record.entityId,
      exceptionCategory: record.exceptionCategory,
      severity: record.severity,
      status: record.status,
      summary: record.summary,
      createdAt: record.createdAt
    }));

  return {
    totalOpen: records.length,
    bySeverity,
    byStatus,
    items,
    warnings
  };
}

export interface ExceptionQueueRepository {
  getOpenExceptionSummary(): Promise<ControlTowerExceptionSummary>;
}

export class PostgresExceptionQueueRepository implements ExceptionQueueRepository {
  constructor(private readonly db: PostgresDatabase) {}

  async getOpenExceptionSummary(): Promise<ControlTowerExceptionSummary> {
    if (!this.db.isConfigured()) {
      return {
        totalOpen: 0,
        bySeverity: createEmptySeverityMap(),
        byStatus: createEmptyStatusMap(),
        items: [],
        warnings: ["DATABASE_NOT_CONFIGURED"]
      };
    }

    try {
      const [countRows, itemRows] = await Promise.all([
        this.db.query<ExceptionCountRow>(
          `
            select severity, status, count(*)::text as count
            from exceptions
            where status in ('new', 'acknowledged', 'in_review')
            group by severity, status
          `
        ),
        this.db.query<ExceptionItemRow>(
          `
            select
              exception_id,
              entity_type,
              entity_id::text as entity_id,
              exception_category,
              severity,
              status,
              summary,
              created_at::text as created_at
            from exceptions
            where status in ('new', 'acknowledged', 'in_review')
            order by
              case severity
                when 'critical' then 1
                when 'high' then 2
                when 'medium' then 3
                else 4
              end,
              created_at desc
            limit 10
          `
        )
      ]);

      const bySeverity = createEmptySeverityMap();
      const byStatus = createEmptyStatusMap();
      let totalOpen = 0;

      for (const row of countRows) {
        const count = Number.parseInt(row.count, 10);
        bySeverity[row.severity] += count;
        byStatus[row.status] += count;
        totalOpen += count;
      }

      const items: ControlTowerExceptionItem[] = itemRows.map((row) => ({
        exceptionId: row.exception_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        exceptionCategory: row.exception_category,
        severity: row.severity,
        status: row.status,
        summary: row.summary,
        createdAt: row.created_at
      }));

      return {
        totalOpen,
        bySeverity,
        byStatus,
        items,
        warnings: []
      };
    } catch (error) {
      return {
        totalOpen: 0,
        bySeverity: createEmptySeverityMap(),
        byStatus: createEmptyStatusMap(),
        items: [],
        warnings: [error instanceof Error ? error.message : "EXCEPTION_QUERY_FAILED"]
      };
    }
  }
}

export class InMemoryExceptionQueueRepository implements ExceptionQueueRepository {
  constructor(private readonly repository: InMemoryExceptionRepository) {}

  async getOpenExceptionSummary(): Promise<ControlTowerExceptionSummary> {
    const records = await this.repository.listOpenExceptions();
    return mapRecordsToSummary(records, ["IN_MEMORY_EXCEPTION_QUEUE"]);
  }
}
