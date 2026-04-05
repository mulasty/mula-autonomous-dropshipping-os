import { DatabaseClient, DomainEvent, wrapPersistenceError } from "../../../shared";

export interface OrderRoutingRepository {
  persistDomainEvents(orderId: string, events: DomainEvent[]): Promise<void>;
}

export class NoopOrderRoutingRepository implements OrderRoutingRepository {
  async persistDomainEvents(): Promise<void> {}
}

export class PostgresOrderRoutingRepository implements OrderRoutingRepository {
  constructor(private readonly db: DatabaseClient) {}

  async persistDomainEvents(orderId: string, events: DomainEvent[]): Promise<void> {
    try {
      for (const event of events) {
        await this.db.query(
          `
            insert into order_events (
              order_id,
              event_type,
              event_payload_json,
              event_source
            )
            values ($1::uuid, $2, $3::jsonb, $4)
          `,
          [
            orderId,
            event.eventType,
            JSON.stringify(event.payload ?? {}),
            event.eventSource
          ]
        );
      }
    } catch (error) {
      throw wrapPersistenceError("persist_order_routing_events", error);
    }
  }
}
