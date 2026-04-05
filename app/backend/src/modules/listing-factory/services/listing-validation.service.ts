import { ChannelConstraints } from "../contracts/channel-constraints.contract";
import {
  ListingGeneratedPayload,
  ListingValidationResult
} from "../contracts/listing-generation-output.contract";
import { ListingProductInput } from "../contracts/listing-generation-input.contract";

function includesPattern(value: string, patterns: string[]): boolean {
  const haystack = value.toLowerCase();
  return patterns.some((pattern) => haystack.includes(pattern.toLowerCase()));
}

function hasDuplicateStrings(values: string[]): boolean {
  const normalized = values.map((value) => value.trim().toLowerCase()).filter((value) => value.length > 0);
  return new Set(normalized).size !== normalized.length;
}

const placeholderPatterns = ["{{", "}}", "tbd", "n/a", "[placeholder]"];

function resolveRequiredValue(
  product: ListingProductInput,
  payload: ListingGeneratedPayload,
  key: string
): string | number | boolean | null | undefined {
  const attributeValue = payload.attributes[key];
  if (attributeValue !== undefined) {
    return attributeValue;
  }

  switch (key) {
    case "brand":
      return product.brand;
    case "model":
      return product.model;
    default:
      return undefined;
  }
}

export class ListingValidationService {
  validate(
    product: ListingProductInput,
    generatedPayload: Omit<ListingGeneratedPayload, "validation_status">,
    constraints: ChannelConstraints
  ): ListingValidationResult {
    const errorCodes: string[] = [];
    const warningCodes: string[] = [];
    const combinedText = [
      generatedPayload.title,
      ...generatedPayload.bullets,
      generatedPayload.description,
      generatedPayload.seo.meta_title,
      generatedPayload.seo.meta_description
    ].join(" ");

    if (generatedPayload.title.trim().length === 0) {
      errorCodes.push("EMPTY_TITLE");
    }

    if (constraints.titleMaxLength && generatedPayload.title.length > constraints.titleMaxLength) {
      errorCodes.push("TITLE_TOO_LONG");
    }

    if (constraints.descriptionRequired && generatedPayload.description.trim().length === 0) {
      errorCodes.push("MISSING_DESCRIPTION");
    }

    for (const attributeKey of constraints.requiredAttributeGroups) {
      const value = resolveRequiredValue(product, {
        ...generatedPayload,
        validation_status: "failed"
      }, attributeKey);
      if (value === undefined || value === null || `${value}`.trim().length === 0) {
        errorCodes.push("MISSING_REQUIRED_ATTRIBUTE");
        break;
      }
    }

    if (includesPattern(combinedText, constraints.bannedClaimPatterns)) {
      errorCodes.push("UNSUPPORTED_CLAIM");
    }

    if (includesPattern(combinedText, constraints.shippingPromiseRestrictions)) {
      errorCodes.push("CHANNEL_FORMAT_VIOLATION");
    }

    if (hasDuplicateStrings(generatedPayload.bullets)) {
      warningCodes.push("DUPLICATED_SPAMMY_TEXT");
    }

    if (!constraints.bulletsSupported && generatedPayload.bullets.length > 0) {
      warningCodes.push("CHANNEL_FORMAT_VIOLATION");
    }

    if (includesPattern(combinedText, placeholderPatterns)) {
      errorCodes.push("UNSUPPORTED_PLACEHOLDER");
    }

    if (
      product.brand &&
      generatedPayload.title.trim().length > 0 &&
      !generatedPayload.title.toLowerCase().includes(product.brand.toLowerCase())
    ) {
      warningCodes.push("FACT_CONFLICT");
    }

    if (
      product.brand &&
      generatedPayload.seo.meta_title.trim().length > 0 &&
      !generatedPayload.seo.meta_title.toLowerCase().includes(product.brand.toLowerCase())
    ) {
      warningCodes.push("FACT_CONFLICT");
    }

    if (constraints.policyMode === "fallback_conservative" && errorCodes.length === 0) {
      warningCodes.push("UNKNOWN_CHANNEL_CONSTRAINTS");
    }

    const validationStatus =
      errorCodes.length > 0 ? "failed" : warningCodes.length > 0 ? "review_required" : "passed";

    return {
      validationStatus,
      errorCodes,
      warningCodes,
      publicationReady: validationStatus === "passed"
    };
  }
}
