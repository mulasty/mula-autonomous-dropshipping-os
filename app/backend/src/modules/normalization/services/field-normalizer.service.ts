import {
  normalizationFieldAliases,
  reservedNormalizationKeys
} from "../normalization-rules";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function parseNumberLike(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
      return Number.parseFloat(normalized);
    }
  }

  return null;
}

export class FieldNormalizerService {
  normalizeText(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0
      ? normalizeWhitespace(value)
      : null;
  }

  normalizeIdentifier(value: unknown): string | null {
    const normalized = this.normalizeText(value);
    return normalized ? normalized.replace(/\s+/g, "-") : null;
  }

  normalizeCurrency(value: unknown): string | null {
    const normalized = this.normalizeText(value);
    return normalized ? normalized.slice(0, 3).toUpperCase() : null;
  }

  normalizeCategory(value: unknown): { source: string | null; normalized: string | null; confidence: number } {
    const categorySource = this.normalizeText(value);
    if (!categorySource) {
      return {
        source: null,
        normalized: null,
        confidence: 0
      };
    }

    const normalized = categorySource
      .replace(/\s*>\s*/g, " / ")
      .replace(/\s*\/\s*/g, " / ")
      .toLowerCase();

    return {
      source: categorySource,
      normalized,
      confidence: 0.95
    };
  }

  extractFirstText(payload: Record<string, unknown>, keys: readonly string[]): string | null {
    for (const key of keys) {
      const normalized = this.normalizeText(payload[key]);
      if (normalized) {
        return normalized;
      }
    }

    return null;
  }

  extractFirstIdentifier(payload: Record<string, unknown>, keys: readonly string[]): string | null {
    for (const key of keys) {
      const normalized = this.normalizeIdentifier(payload[key]);
      if (normalized) {
        return normalized;
      }
    }

    return null;
  }

  extractFirstNumber(payload: Record<string, unknown>, keys: readonly string[]): number | null {
    for (const key of keys) {
      const normalized = parseNumberLike(payload[key]);
      if (normalized !== null) {
        return normalized;
      }
    }

    return null;
  }

  extractImageUrls(payload: Record<string, unknown>): string[] {
    for (const key of normalizationFieldAliases.images) {
      const value = payload[key];
      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => normalizeWhitespace(item));
      }

      if (typeof value === "string" && value.trim().length > 0) {
        return [normalizeWhitespace(value)];
      }
    }

    return [];
  }

  extractAttributes(
    payload: Record<string, unknown>
  ): Record<string, string | number | boolean | null> {
    const attributes: Record<string, string | number | boolean | null> = {};

    for (const key of normalizationFieldAliases.attributes) {
      const nested = payload[key];
      if (!isRecord(nested)) {
        continue;
      }

      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        if (
          nestedValue === null ||
          typeof nestedValue === "string" ||
          typeof nestedValue === "number" ||
          typeof nestedValue === "boolean"
        ) {
          attributes[normalizeKey(nestedKey)] =
            typeof nestedValue === "string" ? normalizeWhitespace(nestedValue) : nestedValue;
        }
      }
    }

    for (const [key, value] of Object.entries(payload)) {
      if (reservedNormalizationKeys.has(key)) {
        continue;
      }

      if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        attributes[normalizeKey(key)] =
          typeof value === "string" ? normalizeWhitespace(value) : value;
      }
    }

    return attributes;
  }
}
