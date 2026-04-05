import {
  ListingContentPackage,
  ListingContentQualitySignals
} from "../contracts/listing-generation-output.contract";
import { ChannelConstraints } from "../contracts/channel-constraints.contract";
import { ListingProductInput } from "../contracts/listing-generation-input.contract";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toSentenceCase(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value: string, limit: number | undefined): string {
  if (!limit || value.length <= limit) {
    return value;
  }

  return `${value.slice(0, Math.max(limit - 3, 0)).trimEnd()}...`;
}

function uniqueStrings(values: string[]): string[] {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const cleaned = normalizeWhitespace(value);
    const key = cleaned.toLowerCase();
    if (cleaned.length === 0 || normalized.has(key)) {
      continue;
    }

    normalized.add(key);
    output.push(cleaned);
  }

  return output;
}

function resolveBaseTitle(product: ListingProductInput): string {
  return (
    product.titleNormalized?.trim() ||
    product.titleRaw?.trim() ||
    [product.brand?.trim(), product.model?.trim(), product.categoryNormalized?.trim()].filter(Boolean).join(" ") ||
    "Untitled product"
  );
}

function buildTitle(product: ListingProductInput, constraints: ChannelConstraints): string {
  const explicitTitle = product.titleNormalized?.trim() || product.titleRaw?.trim();
  if (explicitTitle) {
    return truncate(normalizeWhitespace(explicitTitle), constraints.titleMaxLength);
  }

  const baseTitle = resolveBaseTitle(product);
  const brand = product.brand?.trim();
  const model = product.model?.trim();
  const parts = uniqueStrings([brand ?? "", model ?? "", baseTitle]);
  return truncate(parts.join(" "), constraints.titleMaxLength);
}

function buildBullets(product: ListingProductInput, constraints: ChannelConstraints): string[] {
  if (!constraints.bulletsSupported) {
    return [];
  }

  const attributeBullets = Object.entries(product.attributes)
    .filter(([, value]) => value !== null && `${value}`.trim().length > 0)
    .slice(0, 4)
    .map(([key, value]) => `${toSentenceCase(key.replace(/_/g, " "))}: ${value}`);

  const highlightBullets = (product.trustedHighlights ?? []).slice(0, 3);
  const packageBullet =
    product.packageContents && product.packageContents.length > 0
      ? `Package contents: ${product.packageContents.join(", ")}`
      : "";

  return uniqueStrings([...highlightBullets, ...attributeBullets, packageBullet]).slice(0, 6);
}

function buildDescription(product: ListingProductInput, bullets: string[]): string {
  const overviewSource =
    product.descriptionRaw?.trim() ||
    `${resolveBaseTitle(product)} built from trusted product data for ${product.categoryNormalized ?? "its category"}.`;

  const overview = normalizeWhitespace(overviewSource);
  const technicalDetails =
    Object.entries(product.attributes)
      .filter(([, value]) => value !== null && `${value}`.trim().length > 0)
      .slice(0, 6)
      .map(([key, value]) => `- ${toSentenceCase(key.replace(/_/g, " "))}: ${value}`)
      .join("\n") || "- No structured technical details available.";

  const bulletSummary =
    bullets.length > 0
      ? bullets.map((bullet) => `- ${bullet}`).join("\n")
      : "- No additional highlights available.";
  const packageSection =
    product.packageContents && product.packageContents.length > 0
      ? `\n\nPackage contents:\n- ${product.packageContents.join("\n- ")}`
      : "";

  return `${overview}\n\nHighlights:\n${bulletSummary}\n\nTechnical details:\n${technicalDetails}${packageSection}`;
}

function buildSeoPackage(product: ListingProductInput, title: string, bullets: string[]) {
  const keywordCandidates = uniqueStrings([
    product.brand ?? "",
    product.model ?? "",
    product.categoryNormalized ?? "",
    ...bullets.flatMap((bullet) => bullet.split(/[,.:;-]/))
  ]);

  return {
    metaTitle: title,
    metaDescription: truncate(
      normalizeWhitespace(
        product.descriptionRaw?.trim() ||
          bullets.join(" ").trim() ||
          `${title} in ${product.categoryNormalized ?? "general"} category.`
      ),
      160
    ),
    keywords: keywordCandidates.slice(0, 8)
  };
}

export class ListingContentGeneratorService {
  generate(
    product: ListingProductInput,
    constraints: ChannelConstraints
  ): { content: ListingContentPackage; qualitySignals: ListingContentQualitySignals } {
    const title = buildTitle(product, constraints);
    const bullets = buildBullets(product, constraints);
    const description = buildDescription(product, bullets);
    const seo = buildSeoPackage(product, title, bullets);
    const content: ListingContentPackage = {
      title,
      bullets,
      description,
      attributes: product.attributes,
      seo
    };

    return {
      content,
      qualitySignals: {
        titleLength: title.length,
        bulletCount: bullets.length,
        attributeCount: Object.keys(product.attributes).length,
        sourceHighlightsUsed: (product.trustedHighlights ?? []).slice(0, 3).length
      }
    };
  }
}
