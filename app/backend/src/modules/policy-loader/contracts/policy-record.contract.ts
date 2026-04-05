export interface PolicyRecord {
  policyId: string;
  policyName: string;
  policyVersion: string;
  policyType: string;
  policyPayload: Record<string, unknown>;
  isActive: boolean;
  activeFrom: string;
  createdAt: string;
}
