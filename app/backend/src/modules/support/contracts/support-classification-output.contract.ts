import { DomainEvent } from "../../../shared";
import {
  SupportClassificationLabel,
  SupportPolicyContext
} from "./support-classification-input.contract";
import { SupportStatus } from "../types/support-status";

export interface StoredCustomerMessage {
  messageId: string;
  channel: string;
  messageText: string;
  customerId: string | null;
  orderId: string | null;
  createdAt: string;
  classificationLabel: SupportClassificationLabel;
  automationAllowed: boolean;
  confidence: number;
  escalationFlag: boolean;
  escalationReason: string | null;
  reasonCodes: string[];
  policyContext: SupportPolicyContext;
}

export interface SupportClassificationOutput {
  messageId: string;
  channel: string;
  classificationLabel: SupportClassificationLabel;
  supportStatus: Extract<SupportStatus, "classified" | "escalated">;
  automationAllowed: boolean;
  confidence: number;
  escalate: boolean;
  escalationReason: string | null;
  reasonCodes: string[];
  policyContext: SupportPolicyContext;
  recommendedNextStep: string;
  storedMessage: StoredCustomerMessage;
  domainEvents: DomainEvent[];
}
