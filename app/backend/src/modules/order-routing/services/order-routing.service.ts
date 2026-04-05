import { randomUUID } from "node:crypto";
import {
  createDomainEvent,
  DomainEvent,
  escalate,
  ExceptionService,
  NoopExceptionService,
  NoopLogger,
  ok,
  OperationResult,
  RuntimeLogger
} from "../../../shared";
import { OrderRoutingInput, OrderRoutingPolicyContext } from "../contracts/order-routing-input.contract";
import { OrderRoutingOutput } from "../contracts/order-routing-output.contract";
import { SupplierOrderPayload } from "../contracts/supplier-order-payload.contract";
import {
  PlaceholderSupplierSubmissionService,
  SupplierSubmissionService
} from "./supplier-submission.service";
import {
  NoopOrderRoutingRepository,
  OrderRoutingRepository
} from "../repositories/order-routing.repository";

const defaultOrderRoutingPolicy: OrderRoutingPolicyContext = {
  allowedPaymentStatuses: ["authorized", "paid"],
  supportedCountries: []
};

function buildOrderRoutingPolicy(
  overrides: Partial<OrderRoutingPolicyContext> | undefined
): OrderRoutingPolicyContext {
  return {
    ...defaultOrderRoutingPolicy,
    ...overrides,
    allowedPaymentStatuses: overrides?.allowedPaymentStatuses ?? defaultOrderRoutingPolicy.allowedPaymentStatuses,
    supportedCountries: overrides?.supportedCountries ?? defaultOrderRoutingPolicy.supportedCountries
  };
}

function buildSupplierPayload(input: OrderRoutingInput, submissionReference: string): SupplierOrderPayload {
  return {
    orderId: input.orderId,
    supplierId: input.supplierId,
    submittedAt: new Date().toISOString(),
    items: input.items.map((item) => ({
      supplierSku: item.supplierSku as string,
      quantity: item.quantity
    })),
    shippingAddress: input.shippingAddress,
    customerNotes: input.customerNotes ?? null,
    submissionReference
  };
}

function validateRoutingInput(
  input: OrderRoutingInput,
  policy: OrderRoutingPolicyContext
): { valid: boolean; reasonCode?: string; summary?: string } {
  if (input.orderStatus !== "validated") {
    return {
      valid: false,
      reasonCode: "ORDER_NOT_VALIDATED",
      summary: "Order must be in validated state before routing."
    };
  }

  if (!policy.allowedPaymentStatuses.includes(input.paymentStatus)) {
    return {
      valid: false,
      reasonCode: "PAYMENT_STATUS_NOT_ALLOWED",
      summary: "Payment state does not meet routing policy."
    };
  }

  if (input.items.length === 0 || input.items.some((item) => !item.supplierSku || item.quantity <= 0)) {
    return {
      valid: false,
      reasonCode: "UNMAPPED_SKU",
      summary: "Every routed item must have supplier SKU and positive quantity."
    };
  }

  if (
    !input.shippingAddress.fullName ||
    !input.shippingAddress.line1 ||
    !input.shippingAddress.postalCode ||
    !input.shippingAddress.city ||
    !input.shippingAddress.country
  ) {
    return {
      valid: false,
      reasonCode: "ADDRESS_INCOMPLETE",
      summary: "Shipping address is incomplete."
    };
  }

  if (
    policy.supportedCountries.length > 0 &&
    !policy.supportedCountries.includes(input.shippingAddress.country)
  ) {
    return {
      valid: false,
      reasonCode: "UNSUPPORTED_DESTINATION",
      summary: "Destination country is not supported by routing policy."
    };
  }

  return { valid: true };
}

export class OrderRoutingService {
  constructor(
    private readonly supplierSubmissionService: SupplierSubmissionService = new PlaceholderSupplierSubmissionService(),
    private readonly orderRoutingRepository: OrderRoutingRepository = new NoopOrderRoutingRepository(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async route(input: OrderRoutingInput): Promise<OperationResult<OrderRoutingOutput>> {
    const policy = buildOrderRoutingPolicy(input.policyContext);
    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "order_routing_requested",
        entityType: "order",
        entityId: input.orderId,
        eventSource: "order_routing_service",
        payload: {
          supplierId: input.supplierId
        }
      })
    ];

    const validation = validateRoutingInput(input, policy);
    if (!validation.valid) {
      const exception = await this.exceptionService.createException({
        entityType: "order",
        entityId: input.orderId,
        domain: "order_routing",
        severity: "high",
        reasonCode: validation.reasonCode ?? "ORDER_ROUTING_VALIDATION_FAILED",
        summary: validation.summary ?? "Order routing validation failed."
      });
      const output: OrderRoutingOutput = {
        orderId: input.orderId,
        routingStatus: "routing_validation_failed",
        recommendedNextStep: "send_to_operator_queue",
        domainEvents
      };

      await this.orderRoutingRepository.persistDomainEvents(input.orderId, domainEvents);

      return escalate(output, {
        domainEvents,
        reasonCodes: validation.reasonCode ? [validation.reasonCode] : undefined,
        recommendedNextStep: output.recommendedNextStep,
        exception
      });
    }

    const submissionReference = input.idempotencyKey ?? randomUUID();
    const payload = buildSupplierPayload(input, submissionReference);
    domainEvents.push(
      createDomainEvent({
        eventType: "supplier_payload_built",
        entityType: "order",
        entityId: input.orderId,
        eventSource: "order_routing_service",
        payload: {
          submissionReference
        }
      }),
      createDomainEvent({
        eventType: "supplier_submission_started",
        entityType: "order",
        entityId: input.orderId,
        eventSource: "order_routing_service",
        payload: {
          submissionReference
        }
      })
    );

    this.logger.info("Order routing started", {
      orderId: input.orderId,
      supplierId: input.supplierId,
      submissionReference
    });

    const submission = await this.supplierSubmissionService.submit(payload);
    const output: OrderRoutingOutput = {
      orderId: input.orderId,
      routingStatus:
        submission.acknowledgementStatus === "acknowledged"
          ? "awaiting_tracking"
          : submission.acknowledgementStatus === "rejected"
            ? "supplier_rejected"
            : submission.acknowledgementStatus === "timeout"
              ? "supplier_timeout"
              : "supplier_ambiguous",
      acknowledgementStatus: submission.acknowledgementStatus,
      supplierOrderReference: submission.supplierOrderReference ?? null,
      submissionReference: submission.submissionReference,
      supplierPayload: payload,
      recommendedNextStep:
        submission.acknowledgementStatus === "acknowledged" ? "wait_for_tracking" : "create_exception_and_stop",
      domainEvents
    };

    if (submission.acknowledgementStatus === "acknowledged") {
      domainEvents.push(
        createDomainEvent({
          eventType: "supplier_submission_acknowledged",
          entityType: "order",
          entityId: input.orderId,
          eventSource: "order_routing_service",
          payload: {
            submissionReference: submission.submissionReference,
            supplierOrderReference: submission.supplierOrderReference ?? null
          }
        })
      );

      await this.orderRoutingRepository.persistDomainEvents(input.orderId, domainEvents);

      return ok(output, {
        domainEvents,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    const exceptionReasonCode =
      submission.acknowledgementStatus === "rejected"
        ? "SUPPLIER_ORDER_REJECTED"
        : submission.acknowledgementStatus === "timeout"
          ? "SUPPLIER_SUBMISSION_TIMEOUT"
          : "SUPPLIER_RESPONSE_AMBIGUOUS";

    const exception = await this.exceptionService.createException({
      entityType: "order",
      entityId: input.orderId,
      domain: "order_routing",
      severity: submission.acknowledgementStatus === "rejected" ? "high" : "critical",
      reasonCode: exceptionReasonCode,
      summary: submission.responseSummary,
      details: {
        submissionReference: submission.submissionReference,
        retrySafe: submission.retrySafe
      }
    });

    await this.orderRoutingRepository.persistDomainEvents(input.orderId, domainEvents);

    return escalate(output, {
      domainEvents,
      reasonCodes: [exceptionReasonCode],
      recommendedNextStep: output.recommendedNextStep,
      exception
    });
  }
}
