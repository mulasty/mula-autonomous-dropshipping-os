import { ChannelConstraints } from "../contracts/channel-constraints.contract";
import {
  ListingContentPackage,
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

export class ListingValidationService {
  validate(
    product: ListingProductInput,
    content: ListingContentPackage,
    constraints: ChannelConstraints
  ): ListingValidationResult {
    const errorCodes: string[] = [];
    const warningCodes: string[] = [];
    const combinedText = [content.title, ...content.bullets, content.description].join(" ");

    if (content.title.trim().length === 0) {
      errorCodes.push("EMPTY_TITLE");
    }

    if (constraints.titleMaxLength && content.title.length > constraints.titleMaxLength) {
      errorCodes.push("TITLE_TOO_LONG");
    }

    if (constraints.descriptionRequired && content.description.trim().length === 0) {
      errorCodes.push("MISSING_DESCRIPTION");
    }

    for (const attributeKey of constraints.requiredAttributeGroups) {
      const value = content.attributes[attributeKey];
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

    if (hasDuplicateStrings(content.bullets)) {
      warningCodes.push("DUPLICATED_SPAMMY_TEXT");
    }

    if (!constraints.bulletsSupported && content.bullets.length > 0) {
      warningCodes.push("CHANNEL_FORMAT_VIOLATION");
    }

    if (
      product.brand &&
      content.title.trim().length > 0 &&
      !content.title.toLowerCase().includes(product.brand.toLowerCase())
    ) {
      warningCodes.push("FACT_CONFLICT");
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
