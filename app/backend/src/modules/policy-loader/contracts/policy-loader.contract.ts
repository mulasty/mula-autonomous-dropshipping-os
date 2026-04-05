import { RulesPolicyContext } from "../../rules-engine";
import { PolicyRecord } from "./policy-record.contract";

export interface PolicyLoadRequest {
  policyName: string;
  policyVersion?: string;
  requireActive?: boolean;
}

export interface LoadedPolicyRecord {
  source: "database" | "fallback";
  record: PolicyRecord | null;
  warnings: string[];
}

export interface LoadedRulesPolicy extends LoadedPolicyRecord {
  policy: RulesPolicyContext;
}

export interface PolicyLoader {
  loadPolicyRecord(input: PolicyLoadRequest): Promise<LoadedPolicyRecord>;
  loadRulesPolicy(overrides?: Partial<RulesPolicyContext>): Promise<LoadedRulesPolicy>;
}
