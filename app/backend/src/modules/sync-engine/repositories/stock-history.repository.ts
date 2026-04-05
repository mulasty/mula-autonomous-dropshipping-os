import { randomUUID } from "node:crypto";
import { SyncStockHistoryEntry } from "../contracts/sync-output.contract";

export interface RecordStockHistoryInput {
  productId: string;
  previousStock: number | null;
  newStock: number | null;
  sourceReference?: string | null;
}

export interface StockHistoryRepository {
  recordChange(input: RecordStockHistoryInput): Promise<SyncStockHistoryEntry>;
}

export class NoopStockHistoryRepository implements StockHistoryRepository {
  async recordChange(input: RecordStockHistoryInput): Promise<SyncStockHistoryEntry> {
    return {
      stockEventId: randomUUID(),
      productId: input.productId,
      previousStock: input.previousStock,
      newStock: input.newStock,
      sourceReference: input.sourceReference ?? null,
      changedAt: new Date().toISOString()
    };
  }
}
