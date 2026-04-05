import { randomUUID } from "node:crypto";
import { SyncPricingHistoryEntry } from "../contracts/sync-output.contract";

export interface RecordPricingHistoryInput {
  listingId: string;
  previousPrice: number | null;
  newPrice: number | null;
  changeReason: string;
  sourceCostReference?: string | null;
  triggeredBy: string;
}

export interface PricingHistoryRepository {
  recordChange(input: RecordPricingHistoryInput): Promise<SyncPricingHistoryEntry>;
}

export class NoopPricingHistoryRepository implements PricingHistoryRepository {
  async recordChange(input: RecordPricingHistoryInput): Promise<SyncPricingHistoryEntry> {
    return {
      pricingEventId: randomUUID(),
      listingId: input.listingId,
      previousPrice: input.previousPrice,
      newPrice: input.newPrice,
      changeReason: input.changeReason,
      sourceCostReference: input.sourceCostReference ?? null,
      triggeredBy: input.triggeredBy,
      changedAt: new Date().toISOString()
    };
  }
}
