import { DomainEvent } from "../../../shared";
import { ListingFactoryStatus } from "../types/listing-status";
import { ListingValidationStatus } from "../types/listing-validation-status";
import { ChannelConstraints } from "./channel-constraints.contract";

export interface ListingSeoPackage {
  meta_title: string;
  meta_description: string;
  keywords: string[];
}

export interface ListingGeneratedPayload {
  title: string;
  bullets: string[];
  description: string;
  attributes: Record<string, string | number | boolean | null>;
  seo: ListingSeoPackage;
  validation_status: ListingValidationStatus;
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
  listingId?: string | null;
  productId: string;
  channel: string;
  promptVersion: string;
  listingStatus: ListingFactoryStatus;
  generatedPayload: ListingGeneratedPayload;
  validation: ListingValidationResult;
  qualitySignals: ListingContentQualitySignals;
  recommendedNextStep: string;
  exceptionRecommended: boolean;
  constraintsUsed: ChannelConstraints;
  domainEvents: DomainEvent[];
}
