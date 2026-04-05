import { randomUUID } from "node:crypto";
import {
  DatabaseClient,
  wrapPersistenceError
} from "../../../shared";
import { StoredSupportResponse } from "../contracts/support-response-output.contract";

interface SupportResponseRow {
  response_id: string;
  created_at: string;
  send_status: "drafted" | "sent" | "cancelled";
}

export interface SaveSupportResponseInput {
  messageId: string;
  promptVersion: string;
  responseText: string | null;
  sendStatus: "drafted" | "sent" | "cancelled";
  escalate: boolean;
  escalationReason: string | null;
}

export interface SupportResponseRepository {
  saveResponse(input: SaveSupportResponseInput): Promise<StoredSupportResponse>;
}

export class NoopSupportResponseRepository implements SupportResponseRepository {
  async saveResponse(input: SaveSupportResponseInput): Promise<StoredSupportResponse> {
    return {
      responseId: randomUUID(),
      createdAt: new Date().toISOString(),
      sendStatus: input.sendStatus
    };
  }
}

export class InMemorySupportResponseRepository implements SupportResponseRepository {
  async saveResponse(input: SaveSupportResponseInput): Promise<StoredSupportResponse> {
    return {
      responseId: randomUUID(),
      createdAt: new Date().toISOString(),
      sendStatus: input.sendStatus
    };
  }
}

export class PostgresSupportResponseRepository implements SupportResponseRepository {
  constructor(private readonly db: DatabaseClient) {}

  async saveResponse(input: SaveSupportResponseInput): Promise<StoredSupportResponse> {
    try {
      const rows = await this.db.query<SupportResponseRow>(
        `
          insert into support_responses (
            message_id,
            prompt_version,
            response_text,
            send_status,
            escalate,
            escalation_reason
          )
          values ($1::uuid, $2, $3, $4, $5, $6)
          returning
            response_id::text as response_id,
            created_at::text as created_at,
            send_status
        `,
        [
          input.messageId,
          input.promptVersion,
          input.responseText ?? "",
          input.sendStatus,
          input.escalate,
          input.escalationReason
        ]
      );

      const row = rows[0];
      if (!row) {
        throw new Error("Support response insert returned no rows.");
      }

      return {
        responseId: row.response_id,
        createdAt: row.created_at,
        sendStatus: row.send_status
      };
    } catch (error) {
      throw wrapPersistenceError("save_support_response", error);
    }
  }
}
