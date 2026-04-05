import { randomUUID } from "node:crypto";
import { DatabaseClient, wrapPersistenceError } from "../../../shared";
import { RuleEvaluationOutput } from "../contracts/rule-evaluation-output.contract";
import {
  mapRuleDecisionToPersistenceRow,
  ProductRuleDecisionPersistenceRow
} from "./product-rule-decision.mapper";

interface ProductRuleDecisionInsertRow {
  decision_id: string;
  decided_at: string;
}

export interface PersistedProductRuleDecision {
  decisionId: string;
  productId: string;
  decidedAt: string;
}

export interface ProductRuleDecisionRepository {
  saveDecision(decision: RuleEvaluationOutput): Promise<PersistedProductRuleDecision>;
}

export class NoopProductRuleDecisionRepository implements ProductRuleDecisionRepository {
  async saveDecision(decision: RuleEvaluationOutput): Promise<PersistedProductRuleDecision> {
    return {
      decisionId: `noop-rule-decision-${randomUUID()}`,
      productId: decision.productId,
      decidedAt: new Date().toISOString()
    };
  }
}

export class PostgresProductRuleDecisionRepository
  implements ProductRuleDecisionRepository
{
  constructor(private readonly db: DatabaseClient) {}

  async saveDecision(
    decision: RuleEvaluationOutput
  ): Promise<PersistedProductRuleDecision> {
    const row: ProductRuleDecisionPersistenceRow =
      mapRuleDecisionToPersistenceRow(decision);

    try {
      const rows = await this.db.query<ProductRuleDecisionInsertRow>(
        `
          insert into product_rule_decisions (
            product_id,
            rules_version,
            policy_version,
            decision_status,
            reason_codes_json,
            projected_net_margin,
            projected_gross_margin,
            risk_flags_json,
            recommended_next_step,
            decided_at
          )
          values ($1::uuid, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, $9, $10::timestamptz)
          returning decision_id, decided_at::text as decided_at
        `,
        [
          row.productId,
          row.rulesVersion,
          row.policyVersion,
          row.decisionStatus,
          row.reasonCodesJson,
          row.projectedNetMargin,
          row.projectedGrossMargin,
          row.riskFlagsJson,
          row.recommendedNextStep,
          row.decidedAt
        ]
      );

      const inserted = rows[0];
      if (!inserted) {
        throw new Error("Rule decision insert returned no rows.");
      }

      return {
        decisionId: inserted.decision_id,
        productId: row.productId,
        decidedAt: inserted.decided_at
      };
    } catch (error) {
      throw wrapPersistenceError("save_rule_decision", error);
    }
  }
}
