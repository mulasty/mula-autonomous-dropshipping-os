import { randomUUID } from "node:crypto";
import {
  DatabaseClient,
  wrapPersistenceError
} from "../../../shared";
import {
  StoredCustomerMessage
} from "../contracts/support-classification-output.contract";
import {
  SupportClassificationLabel,
  SupportPolicyContext
} from "../contracts/support-classification-input.contract";

interface CustomerMessageRow {
  message_id: string;
  channel: string;
  message_text: string;
  customer_id: string | null;
  order_id: string | null;
  created_at: string;
  classification_label: SupportClassificationLabel;
  automation_allowed: boolean;
  confidence: string | number;
  escalation_flag: boolean;
  after_state_json: Record<string, unknown> | null;
}

export interface SaveCustomerMessageInput {
  messageId?: string;
  channel: string;
  messageText: string;
  customerId: string | null;
  orderId: string | null;
  classificationLabel: SupportClassificationLabel;
  automationAllowed: boolean;
  confidence: number;
  escalationFlag: boolean;
  escalationReason: string | null;
  reasonCodes: string[];
  policyContext: SupportPolicyContext;
}

export interface CustomerMessageRepository {
  saveClassification(input: SaveCustomerMessageInput): Promise<StoredCustomerMessage>;
  getClassification(messageId: string): Promise<StoredCustomerMessage | null>;
}

export class NoopCustomerMessageRepository implements CustomerMessageRepository {
  async saveClassification(input: SaveCustomerMessageInput): Promise<StoredCustomerMessage> {
    return {
      messageId: input.messageId ?? randomUUID(),
      channel: input.channel,
      messageText: input.messageText,
      customerId: input.customerId,
      orderId: input.orderId,
      createdAt: new Date().toISOString(),
      classificationLabel: input.classificationLabel,
      automationAllowed: input.automationAllowed,
      confidence: input.confidence,
      escalationFlag: input.escalationFlag,
      escalationReason: input.escalationReason,
      reasonCodes: [...input.reasonCodes],
      policyContext: input.policyContext
    };
  }

  async getClassification(_messageId: string): Promise<StoredCustomerMessage | null> {
    return null;
  }
}

export class InMemoryCustomerMessageRepository implements CustomerMessageRepository {
  private readonly store = new Map<string, StoredCustomerMessage>();

  async saveClassification(input: SaveCustomerMessageInput): Promise<StoredCustomerMessage> {
    const stored: StoredCustomerMessage = {
      messageId: input.messageId ?? randomUUID(),
      channel: input.channel,
      messageText: input.messageText,
      customerId: input.customerId,
      orderId: input.orderId,
      createdAt: new Date().toISOString(),
      classificationLabel: input.classificationLabel,
      automationAllowed: input.automationAllowed,
      confidence: input.confidence,
      escalationFlag: input.escalationFlag,
      escalationReason: input.escalationReason,
      reasonCodes: [...input.reasonCodes],
      policyContext: input.policyContext
    };

    this.store.set(stored.messageId, stored);
    return stored;
  }

  async getClassification(messageId: string): Promise<StoredCustomerMessage | null> {
    return this.store.get(messageId) ?? null;
  }
}

function parsePolicyContext(
  value: unknown
): SupportPolicyContext | null {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as { policyVersion?: unknown }).policyVersion !== "string" ||
    typeof (value as { automationConfidenceThreshold?: unknown }).automationConfidenceThreshold !==
      "number" ||
    typeof (value as { escalationConfidenceThreshold?: unknown }).escalationConfidenceThreshold !==
      "number" ||
    !Array.isArray((value as { autoSendLabels?: unknown }).autoSendLabels) ||
    !Array.isArray((value as { draftOnlyLabels?: unknown }).draftOnlyLabels)
  ) {
    return null;
  }

  return {
    policyVersion: (value as { policyVersion: string }).policyVersion,
    automationConfidenceThreshold: (value as { automationConfidenceThreshold: number })
      .automationConfidenceThreshold,
    escalationConfidenceThreshold: (value as { escalationConfidenceThreshold: number })
      .escalationConfidenceThreshold,
    autoSendLabels: [...((value as { autoSendLabels: SupportClassificationLabel[] }).autoSendLabels)],
    draftOnlyLabels: [...((value as { draftOnlyLabels: SupportClassificationLabel[] }).draftOnlyLabels)]
  };
}

function mapRowToStoredCustomerMessage(
  row: CustomerMessageRow
): StoredCustomerMessage {
  const afterState = row.after_state_json ?? {};
  const parsedPolicyContext = parsePolicyContext(
    typeof afterState.policyContext === "object" && afterState.policyContext !== null
      ? afterState.policyContext
      : null
  );
  const reasonCodes = Array.isArray(afterState.reasonCodes)
    ? afterState.reasonCodes.filter((value): value is string => typeof value === "string")
    : [];
  const escalationReason =
    typeof afterState.escalationReason === "string" ? afterState.escalationReason : null;

  return {
    messageId: row.message_id,
    channel: row.channel,
    messageText: row.message_text,
    customerId: row.customer_id,
    orderId: row.order_id,
    createdAt: row.created_at,
    classificationLabel: row.classification_label,
    automationAllowed: row.automation_allowed,
    confidence:
      typeof row.confidence === "number"
        ? row.confidence
        : Number.parseFloat(row.confidence),
    escalationFlag: row.escalation_flag,
    escalationReason,
    reasonCodes,
    policyContext:
      parsedPolicyContext ?? {
        policyVersion: "support-policy-v1",
        automationConfidenceThreshold: 0.85,
        escalationConfidenceThreshold: 0.65,
        autoSendLabels: ["order_status", "shipping_delay"],
        draftOnlyLabels: ["pre_sale_question", "return_request"]
      }
  };
}

export class PostgresCustomerMessageRepository implements CustomerMessageRepository {
  constructor(private readonly db: DatabaseClient) {}

  async saveClassification(input: SaveCustomerMessageInput): Promise<StoredCustomerMessage> {
    try {
      const rows = await this.db.query<CustomerMessageRow>(
        `
          insert into customer_messages (
            message_id,
            order_id,
            customer_id,
            channel,
            direction,
            message_text,
            classification_label,
            automation_allowed,
            confidence,
            escalation_flag
          )
          values (
            coalesce($1::uuid, gen_random_uuid()),
            $2::uuid,
            $3::uuid,
            $4,
            'inbound',
            $5,
            $6,
            $7,
            $8,
            $9
          )
          on conflict (message_id) do update
          set
            order_id = excluded.order_id,
            customer_id = excluded.customer_id,
            channel = excluded.channel,
            direction = excluded.direction,
            message_text = excluded.message_text,
            classification_label = excluded.classification_label,
            automation_allowed = excluded.automation_allowed,
            confidence = excluded.confidence,
            escalation_flag = excluded.escalation_flag
          returning
            message_id::text as message_id,
            channel,
            message_text,
            customer_id::text as customer_id,
            order_id::text as order_id,
            created_at::text as created_at,
            classification_label,
            automation_allowed,
            confidence::text as confidence,
            escalation_flag,
            null::jsonb as after_state_json
        `,
        [
          input.messageId ?? null,
          input.orderId,
          input.customerId,
          input.channel,
          input.messageText,
          input.classificationLabel,
          input.automationAllowed,
          input.confidence,
          input.escalationFlag
        ]
      );

      const row = rows[0];
      if (!row) {
        throw new Error("Customer message insert returned no rows.");
      }

      await this.db.query(
        `
          insert into audit_logs (
            actor_type,
            actor_reference,
            action_type,
            target_type,
            target_id,
            after_state_json
          )
          values ($1, $2, $3, $4, $5::uuid, $6::jsonb)
        `,
        [
          "system",
          "support_classification_service",
          "support_classification_saved",
          "customer_message",
          row.message_id,
          JSON.stringify({
            channel: input.channel,
            messageText: input.messageText,
            customerId: input.customerId,
            orderId: input.orderId,
            classificationLabel: input.classificationLabel,
            automationAllowed: input.automationAllowed,
            confidence: input.confidence,
            escalationFlag: input.escalationFlag,
            escalationReason: input.escalationReason,
            reasonCodes: input.reasonCodes,
            policyContext: input.policyContext
          })
        ]
      );

      return {
        messageId: row.message_id,
        channel: input.channel,
        messageText: input.messageText,
        customerId: input.customerId,
        orderId: input.orderId,
        createdAt: row.created_at,
        classificationLabel: input.classificationLabel,
        automationAllowed: input.automationAllowed,
        confidence: input.confidence,
        escalationFlag: input.escalationFlag,
        escalationReason: input.escalationReason,
        reasonCodes: [...input.reasonCodes],
        policyContext: input.policyContext
      };
    } catch (error) {
      throw wrapPersistenceError("save_customer_message_classification", error);
    }
  }

  async getClassification(messageId: string): Promise<StoredCustomerMessage | null> {
    try {
      const rows = await this.db.query<CustomerMessageRow>(
        `
          select
            message.message_id::text as message_id,
            message.channel,
            message.message_text,
            message.customer_id::text as customer_id,
            message.order_id::text as order_id,
            message.created_at::text as created_at,
            message.classification_label,
            message.automation_allowed,
            message.confidence::text as confidence,
            message.escalation_flag,
            audit.after_state_json
          from customer_messages as message
          left join lateral (
            select after_state_json
            from audit_logs
            where target_type = 'customer_message'
              and target_id = message.message_id
              and action_type = 'support_classification_saved'
            order by created_at desc
            limit 1
          ) as audit on true
          where message.message_id = $1::uuid
          limit 1
        `,
        [messageId]
      );

      const row = rows[0];
      return row ? mapRowToStoredCustomerMessage(row) : null;
    } catch (error) {
      throw wrapPersistenceError("get_customer_message_classification", error);
    }
  }
}
