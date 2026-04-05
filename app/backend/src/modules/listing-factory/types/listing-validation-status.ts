export const LISTING_VALIDATION_STATUSES = ["passed", "failed", "review_required"] as const;

export type ListingValidationStatus = (typeof LISTING_VALIDATION_STATUSES)[number];
