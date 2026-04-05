export const NORMALIZATION_STATUSES = ["normalized", "partial", "failed"] as const;

export type NormalizationStatus = (typeof NORMALIZATION_STATUSES)[number];
