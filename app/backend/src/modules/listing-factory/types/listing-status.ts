export const LISTING_FACTORY_STATUSES = [
  "draft",
  "generated",
  "validation_failed",
  "ready_for_publication"
] as const;

export type ListingFactoryStatus = (typeof LISTING_FACTORY_STATUSES)[number];
