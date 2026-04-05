export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  eventType: string;
  entityType: string;
  entityId: string;
  eventSource: string;
  occurredAt: string;
  payload: TPayload;
  actorType?: string;
  actorReference?: string | null;
}

export function createDomainEvent<TPayload extends Record<string, unknown>>(
  input: Omit<DomainEvent<TPayload>, "occurredAt">
): DomainEvent<TPayload> {
  return {
    ...input,
    occurredAt: new Date().toISOString()
  };
}
