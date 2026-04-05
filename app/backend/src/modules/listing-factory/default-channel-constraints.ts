import { ChannelConstraints } from "./contracts/channel-constraints.contract";

const sharedBannedClaimPatterns = [
  "certified",
  "guaranteed",
  "lifetime warranty",
  "compatible with",
  "100% safe"
];

const sharedShippingRestrictions = ["24h delivery", "guaranteed next day", "same-day shipping"];

export const defaultChannelConstraints: Record<string, ChannelConstraints> = {
  allegro: {
    channel: "allegro",
    titleMaxLength: 75,
    descriptionRequired: true,
    bulletsSupported: true,
    requiredAttributeGroups: ["brand"],
    bannedClaimPatterns: sharedBannedClaimPatterns,
    shippingPromiseRestrictions: sharedShippingRestrictions,
    publicationNotes: "Starter Allegro constraints until policy tables take over."
  },
  amazon: {
    channel: "amazon",
    titleMaxLength: 150,
    descriptionRequired: true,
    bulletsSupported: true,
    requiredAttributeGroups: ["brand"],
    bannedClaimPatterns: sharedBannedClaimPatterns,
    shippingPromiseRestrictions: sharedShippingRestrictions,
    publicationNotes: "Starter Amazon constraints until policy tables take over."
  },
  ebay: {
    channel: "ebay",
    titleMaxLength: 80,
    descriptionRequired: true,
    bulletsSupported: false,
    requiredAttributeGroups: ["brand"],
    bannedClaimPatterns: sharedBannedClaimPatterns,
    shippingPromiseRestrictions: sharedShippingRestrictions,
    publicationNotes: "Starter eBay constraints until policy tables take over."
  },
  own_store: {
    channel: "own_store",
    titleMaxLength: 140,
    descriptionRequired: true,
    bulletsSupported: true,
    requiredAttributeGroups: [],
    bannedClaimPatterns: sharedBannedClaimPatterns,
    shippingPromiseRestrictions: sharedShippingRestrictions,
    publicationNotes: "Starter own-store constraints until policy tables take over."
  }
};

export function resolveChannelConstraints(
  channel: string,
  overrides?: Partial<ChannelConstraints>
): ChannelConstraints {
  const channelKey = channel.trim().toLowerCase();
  const fallback = defaultChannelConstraints[channelKey] ?? {
    channel: channelKey,
    titleMaxLength: 100,
    descriptionRequired: true,
    bulletsSupported: true,
    requiredAttributeGroups: ["brand"],
    bannedClaimPatterns: sharedBannedClaimPatterns,
    shippingPromiseRestrictions: sharedShippingRestrictions,
    publicationNotes: "Generic starter constraints until channel-specific policy is available."
  };

  return {
    ...fallback,
    ...overrides,
    channel,
    requiredAttributeGroups: overrides?.requiredAttributeGroups ?? fallback.requiredAttributeGroups,
    bannedClaimPatterns: overrides?.bannedClaimPatterns ?? fallback.bannedClaimPatterns,
    shippingPromiseRestrictions: overrides?.shippingPromiseRestrictions ?? fallback.shippingPromiseRestrictions
  };
}
