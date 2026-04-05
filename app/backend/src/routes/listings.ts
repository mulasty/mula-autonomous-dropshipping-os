import { FastifyInstance } from "fastify";
import {
  ChannelConstraints,
  ListingFactoryService,
  ListingGenerationInput,
  ListingProductInput,
  ListingQualificationContext
} from "../modules/listing-factory";

const ALLOWED_QUALIFICATION_STATUSES: ListingQualificationContext["qualificationStatus"][] = [
  "approved",
  "improve_required",
  "review_required",
  "rejected",
  "blocked"
];

function isQualificationStatus(
  value: string
): value is ListingQualificationContext["qualificationStatus"] {
  return ALLOWED_QUALIFICATION_STATUSES.includes(
    value as ListingQualificationContext["qualificationStatus"]
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseOptionalBoolean(value: unknown): boolean | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === "boolean" ? value : undefined;
}

function parseOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return undefined;
  }

  return value;
}

function parseAttributes(
  value: unknown
): Record<string, string | number | boolean | null> | null {
  if (!isRecord(value)) {
    return null;
  }

  const attributes: Record<string, string | number | boolean | null> = {};

  for (const [key, attributeValue] of Object.entries(value)) {
    if (
      attributeValue === null ||
      typeof attributeValue === "string" ||
      typeof attributeValue === "number" ||
      typeof attributeValue === "boolean"
    ) {
      attributes[key] = attributeValue;
      continue;
    }

    return null;
  }

  return attributes;
}

function parseChannelConstraints(value: unknown): Partial<ChannelConstraints> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const channel = typeof value.channel === "string" ? value.channel : undefined;
  const titleMaxLength =
    typeof value.titleMaxLength === "number" && Number.isFinite(value.titleMaxLength)
      ? value.titleMaxLength
      : undefined;
  const descriptionRequired =
    typeof value.descriptionRequired === "boolean" ? value.descriptionRequired : undefined;
  const bulletsSupported = typeof value.bulletsSupported === "boolean" ? value.bulletsSupported : undefined;
  const requiredAttributeGroups = parseOptionalStringArray(value.requiredAttributeGroups);
  const bannedClaimPatterns = parseOptionalStringArray(value.bannedClaimPatterns);
  const shippingPromiseRestrictions = parseOptionalStringArray(value.shippingPromiseRestrictions);
  const publicationNotes = parseOptionalString(value.publicationNotes);

  return {
    ...(channel !== undefined ? { channel } : {}),
    ...(titleMaxLength !== undefined ? { titleMaxLength } : {}),
    ...(descriptionRequired !== undefined ? { descriptionRequired } : {}),
    ...(bulletsSupported !== undefined ? { bulletsSupported } : {}),
    ...(requiredAttributeGroups !== undefined ? { requiredAttributeGroups } : {}),
    ...(bannedClaimPatterns !== undefined ? { bannedClaimPatterns } : {}),
    ...(shippingPromiseRestrictions !== undefined ? { shippingPromiseRestrictions } : {}),
    ...(publicationNotes !== undefined ? { publicationNotes } : {})
  };
}

function parseNormalizedProduct(value: unknown): ListingProductInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const productId = parseOptionalString(value.productId);
  const attributes = parseAttributes(value.attributes);

  if (!productId || !attributes) {
    return null;
  }

  return {
    productId,
    attributes,
    internalSku: parseOptionalString(value.internalSku),
    supplierSku: parseOptionalString(value.supplierSku),
    brand: parseOptionalString(value.brand),
    model: parseOptionalString(value.model),
    titleRaw: parseOptionalString(value.titleRaw),
    titleNormalized: parseOptionalString(value.titleNormalized),
    descriptionRaw: parseOptionalString(value.descriptionRaw),
    categoryNormalized: parseOptionalString(value.categoryNormalized),
    trustedHighlights: parseOptionalStringArray(value.trustedHighlights),
    packageContents: parseOptionalStringArray(value.packageContents),
    shippingTimeDays: parseOptionalNumber(value.shippingTimeDays),
    imageUrls: parseOptionalStringArray(value.imageUrls)
  };
}

function parseListingPreviewInput(body: unknown): ListingGenerationInput | null {
  if (!isRecord(body) || !isRecord(body.qualification)) {
    return null;
  }

  const channel = parseOptionalString(body.channel);
  const promptVersion = parseOptionalString(body.promptVersion);
  const normalizedProduct = parseNormalizedProduct(body.normalizedProduct);
  const qualificationStatus = parseOptionalString(body.qualification.qualificationStatus);
  const listingGenerationAllowed = parseOptionalBoolean(body.qualification.listingGenerationAllowed);
  const reasonCodes = parseOptionalStringArray(body.qualification.reasonCodes);
  const channelConstraints = parseChannelConstraints(body.channelConstraints);

  if (
    !channel ||
    !normalizedProduct ||
    !qualificationStatus ||
    typeof listingGenerationAllowed !== "boolean" ||
    !isQualificationStatus(qualificationStatus)
  ) {
    return null;
  }

  return {
    channel,
    promptVersion: promptVersion ?? undefined,
    normalizedProduct,
    qualification: {
      qualificationStatus,
      listingGenerationAllowed,
      reasonCodes
    },
    channelConstraints
  };
}

export async function registerListingsRoutes(app: FastifyInstance): Promise<void> {
  const listingFactory = new ListingFactoryService();

  app.post("/v1/listings/preview", async (request, reply) => {
    const parsed = parseListingPreviewInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_listing_preview_request",
        message:
          "Body must include channel, normalizedProduct.productId, normalizedProduct.attributes, qualification.qualificationStatus, and qualification.listingGenerationAllowed."
      });
      return;
    }

    return {
      data: await listingFactory.generatePreview(parsed)
    };
  });
}
