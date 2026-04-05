export const SUPPORT_STATUSES = ["classified", "drafted", "sent", "escalated"] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number];
