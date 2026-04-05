import { DatabaseClient } from "../../../shared";
import { wrapPersistenceError } from "../../../shared";
import { PolicyLoadRequest } from "../contracts/policy-loader.contract";
import { PolicyRecord } from "../contracts/policy-record.contract";

interface PolicyRow {
  policy_id: string;
  policy_name: string;
  policy_version: string;
  policy_type: string;
  policy_payload_json: Record<string, unknown>;
  active_from: string;
  is_active: boolean;
  created_at: string;
}

function mapPolicyRow(row: PolicyRow): PolicyRecord {
  return {
    policyId: row.policy_id,
    policyName: row.policy_name,
    policyVersion: row.policy_version,
    policyType: row.policy_type,
    policyPayload: row.policy_payload_json,
    isActive: row.is_active,
    activeFrom: row.active_from,
    createdAt: row.created_at
  };
}

export interface PolicyRepository {
  findPolicy(input: PolicyLoadRequest): Promise<PolicyRecord | null>;
}

export class NoopPolicyRepository implements PolicyRepository {
  async findPolicy(): Promise<PolicyRecord | null> {
    return null;
  }
}

export class PostgresPolicyRepository implements PolicyRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findPolicy(input: PolicyLoadRequest): Promise<PolicyRecord | null> {
    if (!this.db.isConfigured()) {
      return null;
    }

    try {
      const rows = input.policyVersion
        ? await this.db.query<PolicyRow>(
            `
              select
                policy_id,
                policy_name,
                policy_version,
                policy_type,
                policy_payload_json,
                active_from::text as active_from,
                is_active,
                created_at::text as created_at
              from policies
              where policy_name = $1 and policy_version = $2
              limit 1
            `,
            [input.policyName, input.policyVersion]
          )
        : await this.db.query<PolicyRow>(
            `
              select
                policy_id,
                policy_name,
                policy_version,
                policy_type,
                policy_payload_json,
                active_from::text as active_from,
                is_active,
                created_at::text as created_at
              from policies
              where policy_name = $1
                and ($2::boolean = false or is_active = true)
              order by is_active desc, active_from desc, created_at desc
              limit 1
            `,
            [input.policyName, input.requireActive !== false]
          );

      return rows[0] ? mapPolicyRow(rows[0]) : null;
    } catch (error) {
      throw wrapPersistenceError("find_policy", error);
    }
  }
}
