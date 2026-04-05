import { FastifyInstance } from "fastify";
import { ExceptionService } from "../shared";
import { SyncEngineService, SyncInput } from "../modules/sync-engine";

interface SyncRouteOptions {
  exceptionService?: ExceptionService;
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

function parseSyncInput(body: unknown): SyncInput | null {
  if (
    !isRecord(body) ||
    !isRecord(body.normalizedProduct) ||
    !isRecord(body.supplierState) ||
    !isRecord(body.listingState)
  ) {
    return null;
  }

  const productId = parseOptionalString(body.normalizedProduct.productId);
  const listingId = parseOptionalString(body.listingState.listingId);
  const channel = parseOptionalString(body.listingState.channel);
  const listingStatus = parseOptionalString(body.listingState.listingStatus);
  const stockKnown = parseOptionalBoolean(body.supplierState.stockKnown);
  const availabilityStatus = parseOptionalString(body.supplierState.availabilityStatus);

  if (
    !productId ||
    !listingId ||
    !channel ||
    !listingStatus ||
    typeof stockKnown !== "boolean" ||
    !availabilityStatus ||
    !["published", "paused", "ready_for_publication", "generated", "archived"].includes(listingStatus) ||
    !["active", "inactive", "discontinued", "unknown"].includes(availabilityStatus)
  ) {
    return null;
  }

  const policyContext = isRecord(body.policyContext) ? body.policyContext : undefined;

  return {
    syncRunId: parseOptionalString(body.syncRunId) ?? undefined,
    normalizedProduct: {
      productId,
      internalSku: parseOptionalString(body.normalizedProduct.internalSku),
      supplierSku: parseOptionalString(body.normalizedProduct.supplierSku),
      categoryNormalized: parseOptionalString(body.normalizedProduct.categoryNormalized),
      shippingTimeDays: parseOptionalNumber(body.normalizedProduct.shippingTimeDays)
    },
    supplierState: {
      sourceReference: parseOptionalString(body.supplierState.sourceReference),
      stockQuantity: parseOptionalNumber(body.supplierState.stockQuantity),
      stockKnown,
      availabilityStatus: availabilityStatus as SyncInput["supplierState"]["availabilityStatus"],
      costNet: parseOptionalNumber(body.supplierState.costNet),
      costGross: parseOptionalNumber(body.supplierState.costGross)
    },
    listingState: {
      listingId,
      channel,
      listingStatus: listingStatus as SyncInput["listingState"]["listingStatus"],
      currentPrice: parseOptionalNumber(body.listingState.currentPrice) ?? null,
      currentStock: parseOptionalNumber(body.listingState.currentStock) ?? null,
      currentlyVisible: parseOptionalBoolean(body.listingState.currentlyVisible) ?? false
    },
    policyContext: policyContext
      ? {
          policyVersion: parseOptionalString(policyContext.policyVersion) ?? undefined,
          minimumNetMargin: parseOptionalNumber(policyContext.minimumNetMargin) ?? undefined,
          minimumAbsoluteProfitAmount:
            parseOptionalNumber(policyContext.minimumAbsoluteProfitAmount) ?? undefined,
          maximumPriceIncreaseRate:
            parseOptionalNumber(policyContext.maximumPriceIncreaseRate) ?? undefined,
          maximumPriceDecreaseRate:
            parseOptionalNumber(policyContext.maximumPriceDecreaseRate) ?? undefined,
          zeroStockAction:
            parseOptionalString(policyContext.zeroStockAction) === "pause"
              ? "pause"
              : parseOptionalString(policyContext.zeroStockAction) === "hide"
                ? "hide"
                : undefined,
          unknownStockAction:
            parseOptionalString(policyContext.unknownStockAction) === "pause"
              ? "pause"
              : parseOptionalString(policyContext.unknownStockAction) === "hide"
                ? "hide"
                : undefined,
          discontinuedAction:
            parseOptionalString(policyContext.discontinuedAction) === "pause"
              ? "pause"
              : parseOptionalString(policyContext.discontinuedAction) === "hide"
                ? "hide"
                : undefined,
          stockInstabilityEscalationThreshold:
            parseOptionalNumber(policyContext.stockInstabilityEscalationThreshold) ?? undefined,
          channelFeeRate: parseOptionalNumber(policyContext.channelFeeRate) ?? undefined,
          paymentFeeRate: parseOptionalNumber(policyContext.paymentFeeRate) ?? undefined,
          shippingCostEstimate: parseOptionalNumber(policyContext.shippingCostEstimate) ?? undefined,
          handlingBuffer: parseOptionalNumber(policyContext.handlingBuffer) ?? undefined,
          returnRiskBuffer: parseOptionalNumber(policyContext.returnRiskBuffer) ?? undefined,
          repeatedFailureCount: parseOptionalNumber(policyContext.repeatedFailureCount) ?? undefined,
          stockInstabilityDetected:
            parseOptionalBoolean(policyContext.stockInstabilityDetected) ?? undefined
        }
      : undefined
  };
}

export async function registerSyncRoutes(
  app: FastifyInstance,
  options: SyncRouteOptions = {}
): Promise<void> {
  const syncEngine = new SyncEngineService(undefined, undefined, undefined, undefined, options.exceptionService);

  app.post("/v1/sync/evaluate", async (request, reply) => {
    const parsed = parseSyncInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_sync_request",
        message:
          "Body must include normalizedProduct.productId, supplierState.stockKnown, supplierState.availabilityStatus, listingState.listingId, listingState.channel, and listingState.listingStatus."
      });
      return;
    }

    return {
      data: await syncEngine.evaluate(parsed)
    };
  });
}
