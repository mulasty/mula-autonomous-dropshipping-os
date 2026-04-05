import { ChannelConstraints } from "./channel-constraints.contract";

export interface ListingProductInput {
  productId: string;
  internalSku?: string | null;
  supplierSku?: string | null;
  brand?: string | null;
  model?: string | null;
  titleRaw?: string | null;
  titleNormalized?: string | null;
  descriptionRaw?: string | null;
  categoryNormalized?: string | null;
  attributes: Record<string, string | number | boolean | null>;
  trustedHighlights?: string[];
  packageContents?: string[];
  shippingTimeDays?: number | null;
  imageUrls?: string[];
}

export interface ListingQualificationContext {
  qualificationStatus: "approved" | "improve_required" | "review_required" | "rejected" | "blocked";
  listingGenerationAllowed: boolean;
  reasonCodes?: string[];
}

export interface ListingGenerationInput {
  channel: string;
  promptVersion?: string;
  normalizedProduct: ListingProductInput;
  qualification: ListingQualificationContext;
  channelConstraints?: Partial<ChannelConstraints>;
}
