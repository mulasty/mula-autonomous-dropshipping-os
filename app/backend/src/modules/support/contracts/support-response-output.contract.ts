import { DomainEvent } from "../../../shared";
import { SupportStatus } from "../types/support-status";

export interface StoredSupportResponse {
  responseId: string;
  createdAt: string;
  sendStatus: "drafted" | "sent" | "cancelled";
}

export interface SupportResponseOutput {
  messageId: string;
  responseId: string;
  supportStatus: Extract<SupportStatus, "drafted" | "sent" | "escalated">;
  sendStatus: "drafted" | "sent" | "cancelled";
  responseText: string | null;
  promptVersion: string;
  escalate: boolean;
  escalationReason: string | null;
  recommendedNextStep: string;
  storedResponse: StoredSupportResponse;
  domainEvents: DomainEvent[];
}
