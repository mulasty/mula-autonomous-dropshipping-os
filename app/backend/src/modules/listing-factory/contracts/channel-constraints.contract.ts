export interface ChannelConstraints {
  channel: string;
  policyMode?: "channel_specific" | "fallback_conservative";
  titleMaxLength?: number;
  descriptionRequired: boolean;
  bulletsSupported: boolean;
  requiredAttributeGroups: string[];
  bannedClaimPatterns: string[];
  shippingPromiseRestrictions: string[];
  publicationNotes?: string | null;
}
