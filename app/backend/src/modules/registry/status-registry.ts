import {
  getSchemaEnumRegistry,
  SchemaEnumManifestItem
} from "../metadata/repository-manifest";

export type RegistryEntryKind = "status" | "enum" | "label";
export type RegistryEntrySource = "sql_constraint" | "policy_registry";

export interface StatusRegistryEntry {
  key: string;
  kind: RegistryEntryKind;
  source: RegistryEntrySource;
  normalizedName: string;
  description: string;
  values: string[];
  groups?: Record<string, string[]>;
  aliases?: Record<string, string>;
}

export interface RegistrySyncMismatch {
  key: string;
  schemaValues: string[];
  registryValues: string[];
  missingInRegistry: string[];
  missingInSchema: string[];
}

export interface RegistrySyncReport {
  synchronized: boolean;
  missingFromRegistry: string[];
  missingFromSchema: string[];
  mismatches: RegistrySyncMismatch[];
}

export interface StatusRegistryManifest {
  normalization: {
    caseSensitive: false;
    separatorNormalization: "spaces-and-hyphens-to-underscores";
    trimsWhitespace: true;
  };
  entries: StatusRegistryEntry[];
  sync: RegistrySyncReport;
}

export class InvalidEnumFilterError extends Error {
  readonly registryKey: string;
  readonly receivedValue: string;
  readonly allowedValues: string[];

  constructor(registryKey: string, receivedValue: string, allowedValues: string[]) {
    super(
      `Invalid value "${receivedValue}" for ${registryKey}. Allowed values: ${allowedValues.join(", ")}.`
    );
    this.name = "InvalidEnumFilterError";
    this.registryKey = registryKey;
    this.receivedValue = receivedValue;
    this.allowedValues = allowedValues;
  }
}

const STATUS_REGISTRY: StatusRegistryEntry[] = [
  {
    key: "supplier_imports.import_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "supplier_import_status",
    description: "Supplier feed import lifecycle state.",
    values: ["started", "fetched", "parsed", "completed", "failed", "partial"],
    groups: {
      active: ["started", "fetched", "parsed"],
      terminal: ["completed", "failed", "partial"],
      degraded: ["failed", "partial"]
    }
  },
  {
    key: "products_normalized.normalization_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "product_normalization_status",
    description: "Product normalization pipeline state.",
    values: ["pending", "normalized", "failed", "partial"],
    groups: {
      active: ["pending"],
      terminal: ["normalized", "failed", "partial"],
      degraded: ["failed", "partial"]
    }
  },
  {
    key: "listings.listing_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "listing_status",
    description: "Listing generation and publication lifecycle state.",
    values: [
      "draft",
      "generated",
      "validation_failed",
      "ready_for_publication",
      "published",
      "paused",
      "archived"
    ],
    groups: {
      pre_publication: ["draft", "generated", "validation_failed", "ready_for_publication"],
      active: ["published", "paused"],
      terminal: ["archived"]
    }
  },
  {
    key: "listing_validations.validation_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "listing_validation_status",
    description: "Outcome of a listing validation run.",
    values: ["passed", "failed", "review_required"],
    groups: {
      passing: ["passed"],
      blocking: ["failed", "review_required"]
    },
    aliases: {
      requires_review: "review_required",
      needs_review: "review_required"
    }
  },
  {
    key: "orders.order_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "order_status",
    description: "Order routing and fulfillment lifecycle state.",
    values: [
      "received",
      "validated",
      "validation_failed",
      "queued_for_supplier",
      "submitted_to_supplier",
      "supplier_acknowledged",
      "awaiting_tracking",
      "in_transit",
      "delivered",
      "cancelled",
      "exception"
    ],
    groups: {
      intake: ["received", "validated", "validation_failed"],
      supplier_handoff: ["queued_for_supplier", "submitted_to_supplier", "supplier_acknowledged"],
      fulfillment: ["awaiting_tracking", "in_transit"],
      terminal: ["delivered", "cancelled", "exception"]
    }
  },
  {
    key: "orders.payment_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "payment_status",
    description: "Commercial payment state for an order.",
    values: [
      "pending",
      "authorized",
      "paid",
      "failed",
      "refunded",
      "partially_refunded",
      "cancelled"
    ],
    groups: {
      open: ["pending", "authorized"],
      settled: ["paid"],
      reversed: ["failed", "refunded", "partially_refunded", "cancelled"]
    }
  },
  {
    key: "orders.supplier_submission_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "supplier_submission_status",
    description: "State of handoff from the platform to the supplier.",
    values: ["pending", "queued", "submitted", "acknowledged", "failed", "not_required"],
    groups: {
      active: ["pending", "queued", "submitted"],
      terminal: ["acknowledged", "failed", "not_required"]
    }
  },
  {
    key: "orders.tracking_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "tracking_status",
    description: "Shipment tracking lifecycle state.",
    values: ["pending", "received", "in_transit", "delivered", "missing", "exception"],
    groups: {
      active: ["pending", "received", "in_transit"],
      terminal: ["delivered", "missing", "exception"]
    }
  },
  {
    key: "product_rule_decisions.decision_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "product_rule_decision_status",
    description: "Rules engine outcome for a normalized product.",
    values: ["approved", "rejected", "review_required", "improve_required", "blocked"],
    groups: {
      publishable: ["approved"],
      review_path: ["review_required", "improve_required"],
      blocked: ["rejected", "blocked"]
    },
    aliases: {
      requires_review: "review_required",
      needs_review: "review_required"
    }
  },
  {
    key: "customer_messages.direction",
    kind: "enum",
    source: "sql_constraint",
    normalizedName: "message_direction",
    description: "Direction of a customer support message.",
    values: ["inbound", "outbound"]
  },
  {
    key: "support_responses.send_status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "support_send_status",
    description: "Send lifecycle for a support response draft.",
    values: ["drafted", "sent", "failed", "cancelled"],
    groups: {
      open: ["drafted"],
      terminal: ["sent", "failed", "cancelled"]
    }
  },
  {
    key: "exceptions.severity",
    kind: "enum",
    source: "sql_constraint",
    normalizedName: "exception_severity",
    description: "Operational severity used for prioritizing exceptions.",
    values: ["low", "medium", "high", "critical"]
  },
  {
    key: "exceptions.status",
    kind: "status",
    source: "sql_constraint",
    normalizedName: "exception_status",
    description: "Exception queue lifecycle state.",
    values: ["new", "acknowledged", "in_review", "resolved", "closed"],
    groups: {
      queue: ["new", "acknowledged", "in_review"],
      terminal: ["resolved", "closed"]
    }
  },
  {
    key: "customer_messages.classification_label",
    kind: "label",
    source: "policy_registry",
    normalizedName: "support_classification_label",
    description: "Normalized support message labels used by policy and routing decisions.",
    values: [
      "order_status",
      "shipping_delay",
      "pre_sale_question",
      "address_change",
      "cancellation_request",
      "return_request",
      "complaint",
      "legal_claim",
      "other"
    ],
    groups: {
      auto_send_allowed: ["order_status", "shipping_delay", "pre_sale_question"],
      escalation_required: ["complaint", "legal_claim"],
      operator_review: ["address_change", "cancellation_request", "return_request", "other"]
    }
  }
];

function normalizeToken(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getRegistryMap(): Map<string, StatusRegistryEntry> {
  return new Map(STATUS_REGISTRY.map((entry) => [entry.key, entry]));
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function compareRegistryEntry(
  registryEntry: StatusRegistryEntry,
  schemaEntry: SchemaEnumManifestItem
): RegistrySyncMismatch | null {
  const registryValues = new Set(registryEntry.values);
  const schemaValues = new Set(schemaEntry.values);

  const missingInRegistry = schemaEntry.values.filter((value) => !registryValues.has(value));
  const missingInSchema = registryEntry.values.filter((value) => !schemaValues.has(value));

  if (missingInRegistry.length === 0 && missingInSchema.length === 0) {
    return null;
  }

  return {
    key: registryEntry.key,
    schemaValues: sortStrings(schemaEntry.values),
    registryValues: sortStrings(registryEntry.values),
    missingInRegistry: sortStrings(missingInRegistry),
    missingInSchema: sortStrings(missingInSchema)
  };
}

export function getStatusRegistryEntries(): StatusRegistryEntry[] {
  return STATUS_REGISTRY.map((entry) => ({
    ...entry,
    values: [...entry.values],
    groups: entry.groups
      ? Object.fromEntries(
          Object.entries(entry.groups).map(([groupName, values]) => [groupName, [...values]])
        )
      : undefined,
    aliases: entry.aliases ? { ...entry.aliases } : undefined
  }));
}

export function normalizeRegistryValue(
  registryKey: string,
  input: string | undefined
): string | undefined {
  if (!input) {
    return undefined;
  }

  const registryEntry = getRegistryMap().get(registryKey);
  if (!registryEntry) {
    throw new Error(`Unknown registry key: ${registryKey}`);
  }

  const normalizedInput = normalizeToken(input);
  const aliasMatch = registryEntry.aliases?.[normalizedInput];
  if (aliasMatch) {
    return aliasMatch;
  }

  const directMatch = registryEntry.values.find((value) => normalizeToken(value) === normalizedInput);
  if (directMatch) {
    return directMatch;
  }

  throw new InvalidEnumFilterError(registryKey, input, registryEntry.values);
}

export async function getStatusRegistryManifest(): Promise<StatusRegistryManifest> {
  const schemaEntries = await getSchemaEnumRegistry();
  const registryEntries = getStatusRegistryEntries();
  const registryMap = getRegistryMap();
  const sqlManagedEntries = registryEntries.filter((entry) => entry.source === "sql_constraint");
  const schemaMap = new Map(schemaEntries.map((entry) => [entry.key, entry]));

  const missingFromSchema = sqlManagedEntries
    .filter((entry) => !schemaMap.has(entry.key))
    .map((entry) => entry.key)
    .sort((left, right) => left.localeCompare(right));

  const missingFromRegistry = schemaEntries
    .filter((entry) => !registryMap.has(entry.key))
    .map((entry) => entry.key)
    .sort((left, right) => left.localeCompare(right));

  const mismatches = sqlManagedEntries
    .map((entry) => {
      const schemaEntry = schemaMap.get(entry.key);
      return schemaEntry ? compareRegistryEntry(entry, schemaEntry) : null;
    })
    .filter((value): value is RegistrySyncMismatch => value !== null)
    .sort((left, right) => left.key.localeCompare(right.key));

  return {
    normalization: {
      caseSensitive: false,
      separatorNormalization: "spaces-and-hyphens-to-underscores",
      trimsWhitespace: true
    },
    entries: registryEntries.sort((left, right) => left.key.localeCompare(right.key)),
    sync: {
      synchronized: missingFromRegistry.length === 0 && missingFromSchema.length === 0 && mismatches.length === 0,
      missingFromRegistry,
      missingFromSchema,
      mismatches
    }
  };
}
