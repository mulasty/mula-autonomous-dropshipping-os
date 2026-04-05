import { Pool, QueryResultRow } from "pg";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("DATABASE_URL is not configured for the backend.");
    this.name = "DatabaseUnavailableError";
  }
}

export interface DatabaseHealth {
  configured: boolean;
  reachable: boolean;
  error?: string;
}

export class PostgresDatabase {
  private readonly pool: Pool | null;

  constructor(databaseUrl: string | null) {
    this.pool = databaseUrl
      ? new Pool({
          connectionString: databaseUrl,
          max: 5
        })
      : null;
  }

  isConfigured(): boolean {
    return this.pool !== null;
  }

  async healthCheck(): Promise<DatabaseHealth> {
    if (!this.pool) {
      return { configured: false, reachable: false };
    }

    try {
      await this.pool.query("select 1");
      return { configured: true, reachable: true };
    } catch (error) {
      return {
        configured: true,
        reachable: false,
        error: getErrorMessage(error)
      };
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<T[]> {
    if (!this.pool) {
      throw new DatabaseUnavailableError();
    }

    const result = await this.pool.query<T>(text, [...values]);
    return result.rows;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
