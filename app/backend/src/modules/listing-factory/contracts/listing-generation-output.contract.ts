import { DomainEvent } from "../../../shared";
import { ListingFactoryStatus } from "../types/listing-status";
import { ListingValidationStatus } from "../types/listing-validation-status";
import { ChannelConstraints } from "./channel-constraints.contract";

export interface ListingSeoPackage {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface ListingContentPackage {
  title: string;
  bullets: string[];
  description: string;
  attributes: Record<string, string | number | boolean | null>;
  seo: ListingSeoPackage;
}

export interface ListingValidationResult {
  validationStatus: ListingValidationStatus;
  errorCodes: string[];
  warningCodes: string[];
  publicationReady: boolean;
}

export interface ListingContentQualitySignals {
  titleLength: number;
  bulletCount: number;
  attributeCount: number;
  sourceHighlightsUsed: number;
}

export interface ListingGenerationOutput {
  productId: string;
  channel: string;
  promptVersion: string;
  listingStatus: ListingFactoryStatus;
  content: ListingContentPackage;
  validation: ListingValidationResult;
  qualitySignals: ListingContentQualitySignals;
  recommendedNextStep: string;
  exceptionRecommended: boolean;
  constraintsUsed: ChannelConstraints;
  domainEvents: DomainEvent[];
}
