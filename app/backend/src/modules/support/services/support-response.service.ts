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
import {
  NoopSupportResponseRepository,
  SupportResponseRepository
} from "../repositories/support-response.repository";
import { SupportResponseInput } from "../contracts/support-response-input.contract";
import { SupportResponseOutput } from "../contracts/support-response-output.contract";
import { SupportClassificationLabel } from "../contracts/support-classification-input.contract";

function buildResponseText(input: SupportResponseInput): string | null {
  const label = input.classification.classificationLabel;

  if (label === "order_status") {
    const orderStatus = input.orderContext?.orderStatus;
    const trackingStatus =
      input.orderContext?.trackingStatus ?? input.trackingContext?.lastKnownStatus;

    if (!orderStatus && !trackingStatus) {
      return null;
    }

    const orderStatusSentence = orderStatus
      ? `Your order status is currently ${orderStatus}.`
      : "We do not yet have a verified order status update.";
    const trackingSentence = trackingStatus
      ? `The latest verified tracking status is ${trackingStatus}.`
      : "A verified tracking update is not available yet.";
    return `Thank you for your message. ${orderStatusSentence} ${trackingSentence} We will continue to update the order as new verified information appears.`;
  }

  if (label === "shipping_delay") {
    const trackingStatus =
      input.trackingContext?.lastKnownStatus ?? input.orderContext?.trackingStatus;

    if (!trackingStatus) {
      return null;
    }

    return `Thank you for your patience. We can confirm a shipping delay on the current shipment flow. The latest verified status is ${trackingStatus}. We are monitoring the case and recommend checking again after the next carrier update rather than relying on an unsupported delivery promise.`;
  }

  if (label === "return_request") {
    return "Thank you for your message. We can help with a standard return flow. Please use the normal return path for this order and include the order reference in your request so the team can verify the case and share the next approved step.";
  }

  if (label === "pre_sale_question") {
    const facts = input.productContext?.knownFacts?.filter((fact) => fact.trim().length > 0) ?? [];
    const productTitle = input.productContext?.title ?? "the requested product";
    const factBlock =
      facts.length > 0
        ? `Known product facts: ${facts.join("; ")}.`
        : "We can only confirm facts that are already present in trusted product data.";
    return `Thank you for your question about ${productTitle}. ${factBlock} If you need a confirmation that is not present in the trusted product record, the case should stay with an operator instead of guessing.`;
  }

  return "This case should stay with an operator because the current classification is not eligible for a safe automated response.";
}

function resolveMissingContextReason(input: SupportResponseInput): string | null {
  const label = input.classification.classificationLabel;

  if (
    label === "order_status" &&
    !input.orderContext?.orderStatus &&
    !input.orderContext?.trackingStatus &&
    !input.trackingContext?.lastKnownStatus
  ) {
    return "MISSING_VERIFIED_ORDER_OR_TRACKING_STATE";
  }

  if (
    label === "shipping_delay" &&
    !input.orderContext?.trackingStatus &&
    !input.trackingContext?.lastKnownStatus
  ) {
    return "MISSING_VERIFIED_TRACKING_STATE";
  }

  return null;
}

function resolveSendStatus(input: SupportResponseInput): "drafted" | "sent" {
  if (
    input.sendMode === "auto_send_allowed" &&
    input.classification.policyContext.autoSendLabels.includes(input.classification.classificationLabel) &&
    input.classification.automationAllowed
  ) {
    return "sent";
  }

  return "drafted";
}

function buildRecommendedNextStep(
  label: SupportClassificationLabel,
  sendStatus: "drafted" | "sent" | "cancelled",
  escalateFlag: boolean,
  automationAllowed: boolean
): string {
  if (escalateFlag) {
    return "handoff_to_operator";
  }

  if (!automationAllowed) {
    return "await_operator_action";
  }

  return sendStatus === "sent"
    ? "monitor_customer_reply"
    : label === "pre_sale_question" || label === "return_request"
      ? "review_draft_before_send"
      : "send_when_rollout_allows";
}

export class SupportResponseService {
  constructor(
    private readonly supportResponseRepository: SupportResponseRepository = new NoopSupportResponseRepository(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async respond(input: SupportResponseInput): Promise<OperationResult<SupportResponseOutput>> {
    const promptVersion = input.promptVersion ?? "support-response-template-v1";
    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "support_response_drafting_started",
        entityType: "customer_message",
        entityId: input.classification.messageId,
        eventSource: "support_response_service",
        payload: {
          classificationLabel: input.classification.classificationLabel
        }
      })
    ];

    if (input.classification.escalate) {
      const storedResponse = await this.supportResponseRepository.saveResponse({
        messageId: input.classification.messageId,
        promptVersion,
        responseText: null,
        sendStatus: "cancelled",
        escalate: true,
        escalationReason: input.classification.escalationReason
      });
      const output: SupportResponseOutput = {
        messageId: input.classification.messageId,
        responseId: storedResponse.responseId,
        supportStatus: "escalated",
        sendStatus: "cancelled",
        responseText: null,
        promptVersion,
        escalate: true,
        escalationReason: input.classification.escalationReason,
        recommendedNextStep: "handoff_to_operator",
        storedResponse,
        domainEvents
      };

      domainEvents.push(
        createDomainEvent({
          eventType: "support_escalated",
          entityType: "customer_message",
          entityId: input.classification.messageId,
          eventSource: "support_response_service",
          payload: {
            escalationReason: output.escalationReason
          }
        })
      );

      return escalate(output, {
        domainEvents,
        reasonCodes: input.classification.reasonCodes,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    if (!input.classification.automationAllowed) {
      const storedResponse = await this.supportResponseRepository.saveResponse({
        messageId: input.classification.messageId,
        promptVersion,
        responseText: null,
        sendStatus: "cancelled",
        escalate: false,
        escalationReason: null
      });
      const output: SupportResponseOutput = {
        messageId: input.classification.messageId,
        responseId: storedResponse.responseId,
        supportStatus: "escalated",
        sendStatus: "cancelled",
        responseText: null,
        promptVersion,
        escalate: false,
        escalationReason: null,
        recommendedNextStep: "await_operator_action",
        storedResponse,
        domainEvents
      };

      return review(output, {
        domainEvents,
        reasonCodes: input.classification.reasonCodes,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    const missingContextReason = resolveMissingContextReason(input);
    if (missingContextReason) {
      const storedResponse = await this.supportResponseRepository.saveResponse({
        messageId: input.classification.messageId,
        promptVersion,
        responseText: null,
        sendStatus: "cancelled",
        escalate: true,
        escalationReason: missingContextReason
      });
      const output: SupportResponseOutput = {
        messageId: input.classification.messageId,
        responseId: storedResponse.responseId,
        supportStatus: "escalated",
        sendStatus: "cancelled",
        responseText: null,
        promptVersion,
        escalate: true,
        escalationReason: missingContextReason,
        recommendedNextStep: "load_verified_context_and_handoff_to_operator",
        storedResponse,
        domainEvents
      };

      domainEvents.push(
        createDomainEvent({
          eventType: "support_escalated",
          entityType: "customer_message",
          entityId: input.classification.messageId,
          eventSource: "support_response_service",
          payload: {
            escalationReason: missingContextReason
          }
        })
      );

      const exception = await this.exceptionService.createException({
        entityType: "customer_message",
        entityId: input.classification.messageId,
        domain: "support",
        severity: "medium",
        reasonCode: missingContextReason,
        summary: "Support automation stopped because verified order or tracking context is missing.",
        details: {
          classificationLabel: input.classification.classificationLabel,
          channel: input.classification.channel
        }
      });

      return escalate(output, {
        domainEvents,
        reasonCodes: [...input.classification.reasonCodes, missingContextReason],
        recommendedNextStep: output.recommendedNextStep,
        exception
      });
    }

    const responseText = buildResponseText(input);
    if (!responseText) {
      const storedResponse = await this.supportResponseRepository.saveResponse({
        messageId: input.classification.messageId,
        promptVersion,
        responseText: null,
        sendStatus: "cancelled",
        escalate: true,
        escalationReason: "UNSAFE_AUTOMATED_RESPONSE_CONTEXT"
      });
      const output: SupportResponseOutput = {
        messageId: input.classification.messageId,
        responseId: storedResponse.responseId,
        supportStatus: "escalated",
        sendStatus: "cancelled",
        responseText: null,
        promptVersion,
        escalate: true,
        escalationReason: "UNSAFE_AUTOMATED_RESPONSE_CONTEXT",
        recommendedNextStep: "handoff_to_operator",
        storedResponse,
        domainEvents
      };

      return escalate(output, {
        domainEvents,
        reasonCodes: [...input.classification.reasonCodes, "UNSAFE_AUTOMATED_RESPONSE_CONTEXT"],
        recommendedNextStep: output.recommendedNextStep
      });
    }

    const sendStatus = resolveSendStatus(input);
    const storedResponse = await this.supportResponseRepository.saveResponse({
      messageId: input.classification.messageId,
      promptVersion,
      responseText,
      sendStatus,
      escalate: false,
      escalationReason: null
    });

    domainEvents.push(
      createDomainEvent({
        eventType: "support_response_drafted",
        entityType: "customer_message",
        entityId: input.classification.messageId,
        eventSource: "support_response_service",
        payload: {
          sendStatus
        }
      })
    );

    if (sendStatus === "sent") {
      domainEvents.push(
        createDomainEvent({
          eventType: "support_response_sent",
          entityType: "customer_message",
          entityId: input.classification.messageId,
          eventSource: "support_response_service",
          payload: {
            sendStatus
          }
        })
      );
    }

    const output: SupportResponseOutput = {
      messageId: input.classification.messageId,
      responseId: storedResponse.responseId,
      supportStatus: sendStatus === "sent" ? "sent" : "drafted",
      sendStatus,
      responseText,
      promptVersion,
      escalate: false,
      escalationReason: null,
      recommendedNextStep: buildRecommendedNextStep(
        input.classification.classificationLabel,
        sendStatus,
        false,
        input.classification.automationAllowed
      ),
      storedResponse,
      domainEvents
    };

    this.logger.info("Support response prepared", {
      messageId: output.messageId,
      sendStatus: output.sendStatus
    });

    return ok(output, {
      domainEvents,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
