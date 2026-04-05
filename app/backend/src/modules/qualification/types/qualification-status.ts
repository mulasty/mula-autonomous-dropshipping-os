export const QUALIFICATION_STATUSES = [
  "approved",
  "rejected",
  "review_required",
  "improve_required",
  "blocked"
] as const;

export type QualificationStatus = (typeof QUALIFICATION_STATUSES)[number];
