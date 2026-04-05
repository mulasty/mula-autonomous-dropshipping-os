export interface ChannelConstraints {
  channel: string;
  titleMaxLength?: number;
  descriptionRequired: boolean;
  bulletsSupported: boolean;
  requiredAttributeGroups: string[];
  bannedClaimPatterns: string[];
  shippingPromiseRestrictions: string[];
  publicationNotes?: string | null;
}
