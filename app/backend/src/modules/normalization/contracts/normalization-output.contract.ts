import { DomainEvent } from "../../../shared";
import { RuleEvaluationInput } from "../../rules-engine";
import { NormalizationStatus } from "../types/normalization-status";

export interface NormalizedProductCandidate {
  productId: string;
  supplierId: string;
  rawProductId: string | null;
  sourceProductReference: string;
  internalSku: string;
  supplierSku: string;
  ean: string | null;
  brand: string | null;
  titleRaw: string | null;
  titleNormalized: string | null;
  descriptionRaw: string | null;
  categorySource: string | null;
  categoryNormalized: string | null;
  attributes: Record<string, string | number | boolean | null>;
  imageUrls: string[];
  weightKg: number | null;
  shippingTimeDays: number | null;
  costNet: number | null;
  costGross: number | null;
  currency: string | null;
  stockQuantity: number | null;
  dataQualityScore: number;
  categoryMappingConfidence: number;
  hasRequiredAttributes: boolean;
  imageCount: number;
  normalizedAt: string;
}

export interface NormalizationOutput {
  workflowRunId: string;
  normalizationStatus: NormalizationStatus;
  normalizedProduct: NormalizedProductCandidate;
  warningCodes: string[];
  errorCodes: string[];
  derivedFields: string[];
  reviewRecommended: boolean;
  rulesInput: RuleEvaluationInput;
  recommendedNextStep: string;
  domainEvents: DomainEvent[];
}
