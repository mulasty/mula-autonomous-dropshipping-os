import { QueryResultRow } from "pg";
import { PostgresDatabase } from "../../db/postgres";

export interface DatabaseClient {
  isConfigured(): boolean;
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[]
  ): Promise<T[]>;
}

export class PostgresDatabaseClient implements DatabaseClient {
  constructor(private readonly db: PostgresDatabase) {}

  isConfigured(): boolean {
    return this.db.isConfigured();
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<T[]> {
    return this.db.query<T>(text, values);
  }
}
