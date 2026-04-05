import {
  createDomainEvent,
  DomainEvent,
  escalate,
  ExceptionService,
  NoopExceptionService,
  NoopLogger,
  ok,
  OperationResult,
  review,
  RuntimeLogger
} from "../../../shared";
import { SyncInput, SyncPolicyContext } from "../contracts/sync-input.contract";
import { RepricingEvaluationOutput, SyncOutput } from "../contracts/sync-output.contract";
import {
  NoopPricingHistoryRepository,
  PricingHistoryRepository
} from "../repositories/pricing-history.repository";
import {
  NoopStockHistoryRepository,
  StockHistoryRepository
} from "../repositories/stock-history.repository";
import { RepricingEvaluationService } from "./repricing-evaluation.service";

const defaultSyncPolicy: SyncPolicyContext = {
  policyVersion: "sync-policy-v1",
  minimumNetMargin: 0.18,
  minimumAbsoluteProfitAmount: 20,
  maximumPriceIncreaseRate: 0.12,
  maximumPriceDecreaseRate: 0.2,
  zeroStockAction: "pause",
  unknownStockAction: "pause",
  discontinuedAction: "hide",
  stockInstabilityEscalationThreshold: 3,
  channelFeeRate: 0.11,
  paymentFeeRate: 0.02,
  shippingCostEstimate: 12,
  handlingBuffer: 2,
  returnRiskBuffer: 3,
  repeatedFailureCount: 0,
  stockInstabilityDetected: false
};

function buildSyncPolicy(overrides: Partial<SyncPolicyContext> | undefined): SyncPolicyContext {
  return {
    ...defaultSyncPolicy,
    ...overrides
  };
}

function hasStockChanged(previousStock: number | null, newStock: number | null): boolean {
  return previousStock !== newStock;
}

function resolveStockSyncDecision(input: SyncInput, policy: SyncPolicyContext): {
  syncStatus: SyncOutput["syncStatus"];
  stockAction: SyncOutput["stockAction"];
  visibilityAction: SyncOutput["visibilityAction"];
  nextStock: number | null;
  reasonCodes: string[];
  exceptionRecommended: boolean;
} {
  const { supplierState, listingState } = input;

  if (supplierState.availabilityStatus === "discontinued") {
    return {
      syncStatus: policy.discontinuedAction === "hide" ? "listing_hidden" : "listing_paused",
      stockAction: "none",
      visibilityAction: policy.discontinuedAction === "hide" ? "hide_listing" : "pause_listing",
      nextStock: 0,
      reasonCodes: ["PRODUCT_DISCONTINUED"],
      exceptionRecommended: false
    };
  }

  if (supplierState.availabilityStatus === "inactive") {
    return {
      syncStatus: "listing_paused",
      stockAction: "none",
      visibilityAction: "pause_listing",
      nextStock: 0,
      reasonCodes: ["SUPPLIER_INACTIVE"],
      exceptionRecommended: false
    };
  }

  if (!supplierState.stockKnown || supplierState.availabilityStatus === "unknown") {
    return {
      syncStatus: policy.unknownStockAction === "hide" ? "listing_hidden" : "listing_paused",
      stockAction: "none",
      visibilityAction: policy.unknownStockAction === "hide" ? "hide_listing" : "pause_listing",
      nextStock: null,
      reasonCodes: ["STOCK_UNRELIABLE"],
      exceptionRecommended: true
    };
  }

  if ((supplierState.stockQuantity ?? 0) <= 0) {
    return {
      syncStatus: policy.zeroStockAction === "hide" ? "listing_hidden" : "listing_paused",
      stockAction: "none",
      visibilityAction: policy.zeroStockAction === "hide" ? "hide_listing" : "pause_listing",
      nextStock: supplierState.stockQuantity ?? 0,
      reasonCodes: ["STOCK_UNAVAILABLE"],
      exceptionRecommended: false
    };
  }

  if (
    policy.stockInstabilityDetected ||
    policy.repeatedFailureCount >= policy.stockInstabilityEscalationThreshold
  ) {
    return {
      syncStatus: "review_required",
      stockAction: "review_required",
      visibilityAction: "none",
      nextStock: supplierState.stockQuantity ?? listingState.currentStock ?? null,
      reasonCodes: [
        ...(policy.stockInstabilityDetected ? ["STOCK_UNRELIABLE"] : []),
        ...(policy.repeatedFailureCount >= policy.stockInstabilityEscalationThreshold
          ? ["REPEATED_SYNC_FAILURE"]
          : [])
      ],
      exceptionRecommended: true
    };
  }

  if (hasStockChanged(listingState.currentStock, supplierState.stockQuantity ?? null)) {
    return {
      syncStatus: "stock_updated",
      stockAction: "update_stock",
      visibilityAction: "none",
      nextStock: supplierState.stockQuantity ?? null,
      reasonCodes: [],
      exceptionRecommended: false
    };
  }

  return {
    syncStatus: "no_change_needed",
    stockAction: "none",
    visibilityAction: "none",
    nextStock: listingState.currentStock,
    reasonCodes: [],
    exceptionRecommended: false
  };
}

function buildRecommendedNextStep(output: SyncOutput): string {
  if (output.visibilityAction === "hide_listing") {
    return "propagate_listing_hide";
  }

  if (output.visibilityAction === "pause_listing") {
    return "propagate_listing_pause";
  }

  if (output.priceAction === "update_price" && output.stockAction === "update_stock") {
    return "propagate_stock_and_price_update";
  }

  if (output.priceAction === "update_price") {
    return "propagate_price_update";
  }

  if (output.stockAction === "update_stock") {
    return "propagate_stock_update";
  }

  switch (output.syncStatus) {
    case "review_required":
      return "create_exception_and_review";
    default:
      return "no_action_needed";
  }
}

export class SyncEngineService {
  constructor(
    private readonly repricingEvaluationService: RepricingEvaluationService = new RepricingEvaluationService(),
    private readonly stockHistoryRepository: StockHistoryRepository = new NoopStockHistoryRepository(),
    private readonly pricingHistoryRepository: PricingHistoryRepository = new NoopPricingHistoryRepository(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async evaluate(input: SyncInput): Promise<OperationResult<SyncOutput>> {
    const policy = buildSyncPolicy(input.policyContext);
    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "sync_requested",
        entityType: "product",
        entityId: input.normalizedProduct.productId,
        eventSource: "sync_engine_service",
        payload: {
          listingId: input.listingState.listingId,
          syncRunId: input.syncRunId ?? null
        }
      })
    ];

    const stockDecision = resolveStockSyncDecision(input, policy);
    const repricingEvaluation = this.repricingEvaluationService.evaluate(
      input.listingState,
      input.supplierState,
      policy
    );

    let syncStatus = stockDecision.syncStatus;
    let stockAction = stockDecision.stockAction;
    let priceAction: SyncOutput["priceAction"] = "none";
    let visibilityAction = stockDecision.visibilityAction;
    let newPrice = input.listingState.currentPrice;
    let newStock = stockDecision.nextStock;
    const reasonCodes = [...stockDecision.reasonCodes, ...repricingEvaluation.reasonCodes];
    let exceptionRecommended = stockDecision.exceptionRecommended;
    let stockHistoryEntry: SyncOutput["stockHistoryEntry"] = null;
    let pricingHistoryEntry: SyncOutput["pricingHistoryEntry"] = null;

    if (stockDecision.syncStatus === "review_required") {
      exceptionRecommended = true;
    } else if (
      stockDecision.syncStatus === "no_change_needed" ||
      stockDecision.syncStatus === "stock_updated"
    ) {
      if (repricingEvaluation.evaluationStatus === "unsafe") {
        syncStatus = "listing_paused";
        priceAction = "review_required";
        visibilityAction = "pause_listing";
        exceptionRecommended = true;
      } else if (repricingEvaluation.evaluationStatus === "review_required") {
        syncStatus = "review_required";
        priceAction = "review_required";
        exceptionRecommended = true;
      } else if (repricingEvaluation.evaluationStatus === "price_update_needed") {
        priceAction = "update_price";
        newPrice = repricingEvaluation.recommendedPrice;
      }
    }

    if (visibilityAction === "pause_listing") {
      syncStatus = "listing_paused";
    } else if (visibilityAction === "hide_listing") {
      syncStatus = "listing_hidden";
    } else if (stockAction === "update_stock" && priceAction === "update_price") {
      syncStatus = "stock_and_price_updated";
    } else if (priceAction === "update_price") {
      syncStatus = "price_updated";
    } else if (stockAction === "update_stock") {
      syncStatus = "stock_updated";
    } else if (stockAction === "review_required" || priceAction === "review_required") {
      syncStatus = "review_required";
    } else {
      syncStatus = "no_change_needed";
    }

    if (
      hasStockChanged(input.listingState.currentStock, newStock) &&
      newStock !== input.listingState.currentStock
    ) {
      stockHistoryEntry = await this.stockHistoryRepository.recordChange({
        productId: input.normalizedProduct.productId,
        previousStock: input.listingState.currentStock,
        newStock,
        sourceReference: input.supplierState.sourceReference
      });
      domainEvents.push(
        createDomainEvent({
          eventType: "stock_evaluated",
          entityType: "product",
          entityId: input.normalizedProduct.productId,
          eventSource: "sync_engine_service",
          payload: {
            previousStock: input.listingState.currentStock,
            newStock
          }
        })
      );
    }

    if (newPrice !== input.listingState.currentPrice && newPrice !== null) {
      pricingHistoryEntry = await this.pricingHistoryRepository.recordChange({
        listingId: input.listingState.listingId,
        previousPrice: input.listingState.currentPrice,
        newPrice,
        changeReason: repricingEvaluation.reasonCodes[0] ?? "SYNC_REPRICING",
        sourceCostReference: input.supplierState.sourceReference,
        triggeredBy: "sync_engine_service"
      });
      domainEvents.push(
        createDomainEvent({
          eventType: "pricing_evaluated",
          entityType: "listing",
          entityId: input.listingState.listingId,
          eventSource: "sync_engine_service",
          payload: {
            previousPrice: input.listingState.currentPrice,
            newPrice
          }
        })
      );
    }

    if (syncStatus === "listing_paused" || syncStatus === "listing_hidden") {
      domainEvents.push(
        createDomainEvent({
          eventType: syncStatus === "listing_hidden" ? "listing_hidden" : "listing_paused",
          entityType: "listing",
          entityId: input.listingState.listingId,
          eventSource: "sync_engine_service",
          payload: {
            reasonCodes
          }
        })
      );
    } else if (
      syncStatus === "price_updated" ||
      syncStatus === "stock_updated" ||
      syncStatus === "stock_and_price_updated"
    ) {
      domainEvents.push(
        createDomainEvent({
          eventType: "listing_updated",
          entityType: "listing",
          entityId: input.listingState.listingId,
          eventSource: "sync_engine_service",
          payload: {
            syncStatus,
            reasonCodes
          }
        })
      );
    }

    const output: SyncOutput = {
      productId: input.normalizedProduct.productId,
      listingId: input.listingState.listingId,
      syncStatus,
      stockAction,
      priceAction,
      visibilityAction,
      actionsTaken: [
        ...(stockAction === "update_stock" ? ["update_stock" as const] : []),
        ...(priceAction === "update_price" ? ["update_price" as const] : []),
        ...(visibilityAction === "pause_listing" ? ["pause_listing" as const] : []),
        ...(visibilityAction === "hide_listing" ? ["hide_listing" as const] : [])
      ],
      previousStock: input.listingState.currentStock,
      newStock,
      previousPrice: input.listingState.currentPrice,
      newPrice,
      repricingEvaluation,
      stockHistoryEntry,
      pricingHistoryEntry,
      reasonCodes,
      recommendedNextStep: "",
      exceptionRecommended,
      policyVersion: policy.policyVersion,
      domainEvents
    };
    output.recommendedNextStep = buildRecommendedNextStep(output);

    this.logger.info("Sync evaluation completed", {
      productId: output.productId,
      listingId: output.listingId,
      syncStatus: output.syncStatus
    });

    if (exceptionRecommended) {
      const exception = await this.exceptionService.createException({
        entityType: "listing",
        entityId: output.listingId,
        domain: "sync_engine",
        severity:
          output.syncStatus === "listing_hidden" || repricingEvaluation.evaluationStatus === "unsafe"
            ? "high"
            : "medium",
        reasonCode: reasonCodes[0] ?? "SYNC_REVIEW_REQUIRED",
        summary: "Sync evaluation detected an unsafe or ambiguous live-state change.",
        details: {
          syncStatus: output.syncStatus,
          reasonCodes,
          repricingEvaluation
        }
      });

      return output.syncStatus === "review_required"
        ? review(output, {
            domainEvents,
            reasonCodes,
            recommendedNextStep: output.recommendedNextStep,
            exception
          })
        : escalate(output, {
            domainEvents,
            reasonCodes,
            recommendedNextStep: output.recommendedNextStep,
            exception
          });
    }

    return ok(output, {
      domainEvents,
      reasonCodes,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
