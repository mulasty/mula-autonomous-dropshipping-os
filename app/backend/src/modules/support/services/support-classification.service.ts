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
  CustomerMessageRepository,
  NoopCustomerMessageRepository
} from "../repositories/customer-message.repository";
import {
  SupportClassificationInput,
  SupportClassificationLabel,
  SupportPolicyContext
} from "../contracts/support-classification-input.contract";
import {
  StoredCustomerMessage,
  SupportClassificationOutput
} from "../contracts/support-classification-output.contract";

export const defaultSupportPolicy: SupportPolicyContext = {
  policyVersion: "support-policy-v1",
  automationConfidenceThreshold: 0.85,
  escalationConfidenceThreshold: 0.65,
  autoSendLabels: ["order_status", "shipping_delay"],
  draftOnlyLabels: ["pre_sale_question", "return_request"]
};

export function buildSupportPolicy(
  overrides: Partial<SupportPolicyContext> | undefined
): SupportPolicyContext {
  return {
    ...defaultSupportPolicy,
    ...overrides,
    autoSendLabels: overrides?.autoSendLabels ?? defaultSupportPolicy.autoSendLabels,
    draftOnlyLabels: overrides?.draftOnlyLabels ?? defaultSupportPolicy.draftOnlyLabels
  };
}

function includesAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function classifyMessage(messageText: string): {
  classificationLabel: SupportClassificationLabel;
  confidence: number;
  escalate: boolean;
  escalationReason: string | null;
  reasonCodes: string[];
} {
  const normalizedText = messageText.toLowerCase();
  const legalTerms = ["lawyer", "court", "regulator", "fraud", "scam", "chargeback"];
  const safetyTerms = ["injury", "injured", "dangerous", "fire", "shock", "exploded", "burned"];
  const aggressiveTerms = ["lawsuit", "thief", "scammers", "idiot", "terrible service"];
  const refundTerms = ["refund", "money back", "reimbursement"];
  const cancellationTerms = ["cancel", "cancellation", "stop my order"];
  const returnTerms = ["return", "send back", "rma"];
  const shippingTerms = ["tracking", "where is my package", "delay", "delayed", "shipment"];
  const orderStatusTerms = ["where is my order", "order status", "status of my order"];
  const preSaleTerms = ["is it compatible", "do you have", "specification", "what are the dimensions"];
  const complaintTerms = ["complaint", "broken", "damaged", "not working", "wrong item"];

  if (includesAny(normalizedText, legalTerms)) {
    return {
      classificationLabel: "legal_or_reputational_risk",
      confidence: 0.99,
      escalate: true,
      escalationReason: "LEGAL_OR_REPUTATIONAL_RISK",
      reasonCodes: ["LEGAL_OR_REPUTATIONAL_RISK"]
    };
  }

  if (includesAny(normalizedText, safetyTerms)) {
    return {
      classificationLabel: "complaint_high_risk",
      confidence: 0.98,
      escalate: true,
      escalationReason: "SAFETY_INCIDENT",
      reasonCodes: ["SAFETY_INCIDENT"]
    };
  }

  if (includesAny(normalizedText, aggressiveTerms)) {
    return {
      classificationLabel: "complaint_high_risk",
      confidence: 0.92,
      escalate: true,
      escalationReason: "AGGRESSIVE_OR_THREATENING_LANGUAGE",
      reasonCodes: ["AGGRESSIVE_OR_THREATENING_LANGUAGE"]
    };
  }

  if (includesAny(normalizedText, refundTerms)) {
    return {
      classificationLabel: "refund_request",
      confidence: 0.86,
      escalate: false,
      escalationReason: null,
      reasonCodes: ["REFUND_REQUEST_REQUIRES_REVIEW"]
    };
  }

  if (includesAny(normalizedText, cancellationTerms)) {
    return {
      classificationLabel: "cancellation_request",
      confidence: 0.86,
      escalate: false,
      escalationReason: null,
      reasonCodes: ["CANCELLATION_REQUEST_REQUIRES_REVIEW"]
    };
  }

  if (includesAny(normalizedText, returnTerms)) {
    return {
      classificationLabel: "return_request",
      confidence: 0.88,
      escalate: false,
      escalationReason: null,
      reasonCodes: []
    };
  }

  if (includesAny(normalizedText, shippingTerms)) {
    return {
      classificationLabel: "shipping_delay",
      confidence: 0.91,
      escalate: false,
      escalationReason: null,
      reasonCodes: []
    };
  }

  if (includesAny(normalizedText, orderStatusTerms)) {
    return {
      classificationLabel: "order_status",
      confidence: 0.92,
      escalate: false,
      escalationReason: null,
      reasonCodes: []
    };
  }

  if (includesAny(normalizedText, preSaleTerms)) {
    return {
      classificationLabel: "pre_sale_question",
      confidence: 0.84,
      escalate: false,
      escalationReason: null,
      reasonCodes: []
    };
  }

  if (includesAny(normalizedText, complaintTerms)) {
    return {
      classificationLabel: "complaint_low_risk",
      confidence: 0.78,
      escalate: false,
      escalationReason: null,
      reasonCodes: ["COMPLAINT_REVIEW_RECOMMENDED"]
    };
  }

  return {
    classificationLabel: "unclear",
    confidence: 0.45,
    escalate: false,
    escalationReason: null,
    reasonCodes: ["LOW_CLASSIFICATION_CONFIDENCE"]
  };
}

function isAutomationAllowed(
  label: SupportClassificationLabel,
  confidence: number,
  policy: SupportPolicyContext
): boolean {
  return (
    (policy.autoSendLabels.includes(label) || policy.draftOnlyLabels.includes(label)) &&
    confidence >= policy.automationConfidenceThreshold
  );
}

export function buildRecommendedNextStep(
  label: SupportClassificationLabel,
  automationAllowed: boolean,
  escalateFlag: boolean
): string {
  if (escalateFlag) {
    return "escalate_to_operator_immediately";
  }

  if (!automationAllowed) {
    return "send_to_operator_queue";
  }

  return label === "return_request" || label === "pre_sale_question"
    ? "draft_response_for_review"
    : "draft_or_send_low_risk_response";
}

export function buildStoredClassificationOutput(
  storedMessage: StoredCustomerMessage
): SupportClassificationOutput {
  const escalateFlag = storedMessage.escalationFlag;

  return {
    messageId: storedMessage.messageId,
    channel: storedMessage.channel,
    classificationLabel: storedMessage.classificationLabel,
    supportStatus: escalateFlag ? "escalated" : "classified",
    automationAllowed: storedMessage.automationAllowed,
    confidence: storedMessage.confidence,
    escalate: escalateFlag,
    escalationReason: storedMessage.escalationReason,
    reasonCodes: storedMessage.reasonCodes,
    policyContext: storedMessage.policyContext,
    recommendedNextStep: buildRecommendedNextStep(
      storedMessage.classificationLabel,
      storedMessage.automationAllowed,
      escalateFlag
    ),
    storedMessage,
    domainEvents: []
  };
}

export class SupportClassificationService {
  constructor(
    private readonly customerMessageRepository: CustomerMessageRepository = new NoopCustomerMessageRepository(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async classify(input: SupportClassificationInput): Promise<OperationResult<SupportClassificationOutput>> {
    const policyContext = buildSupportPolicy(input.policyContext);
    const decision = classifyMessage(input.messageText);
    const automationAllowed = isAutomationAllowed(
      decision.classificationLabel,
      decision.confidence,
      policyContext
    );
    const mustEscalate =
      decision.escalate ||
      (decision.confidence < policyContext.escalationConfidenceThreshold &&
        (decision.classificationLabel === "unclear" || decision.classificationLabel === "complaint_low_risk"));

    const storedMessage = await this.customerMessageRepository.saveClassification({
      messageId: input.messageId,
      channel: input.channel,
      messageText: input.messageText,
      customerId: input.customerId ?? null,
      orderId: input.orderContext?.orderId ?? null,
      classificationLabel: decision.classificationLabel,
      automationAllowed,
      confidence: decision.confidence,
      escalationFlag: mustEscalate,
      escalationReason: mustEscalate
        ? decision.escalationReason ?? "LOW_CONFIDENCE_OR_POLICY_RISK"
        : null,
      reasonCodes: decision.reasonCodes,
      policyContext
    });

    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "support_classification_started",
        entityType: "customer_message",
        entityId: storedMessage.messageId,
        eventSource: "support_classification_service",
        payload: {
          channel: input.channel
        }
      }),
      createDomainEvent({
        eventType: "support_classified",
        entityType: "customer_message",
        entityId: storedMessage.messageId,
        eventSource: "support_classification_service",
        payload: {
          classificationLabel: decision.classificationLabel,
          automationAllowed,
          confidence: decision.confidence
        }
      })
    ];

    const output: SupportClassificationOutput = {
      messageId: storedMessage.messageId,
      channel: input.channel,
      classificationLabel: decision.classificationLabel,
      supportStatus: mustEscalate ? "escalated" : "classified",
      automationAllowed,
      confidence: decision.confidence,
      escalate: mustEscalate,
      escalationReason: storedMessage.escalationReason,
      reasonCodes: storedMessage.reasonCodes,
      policyContext: storedMessage.policyContext,
      recommendedNextStep: buildRecommendedNextStep(storedMessage.classificationLabel, automationAllowed, mustEscalate),
      storedMessage,
      domainEvents
    };

    this.logger.info("Support message classified", {
      messageId: output.messageId,
      classificationLabel: output.classificationLabel,
      escalate: output.escalate
    });

    if (mustEscalate) {
      const exception = await this.exceptionService.createException({
        entityType: "customer_message",
        entityId: output.messageId,
        domain: "support",
        severity: decision.classificationLabel === "legal_or_reputational_risk" ? "high" : "medium",
        reasonCode: output.escalationReason ?? "SUPPORT_ESCALATION_REQUIRED",
        summary: "Support message requires operator escalation.",
        details: {
          classificationLabel: output.classificationLabel,
          confidence: output.confidence
        }
      });

      return escalate(output, {
        domainEvents,
        reasonCodes: output.reasonCodes,
        recommendedNextStep: output.recommendedNextStep,
        exception
      });
    }

    if (!automationAllowed) {
      return review(output, {
        domainEvents,
        reasonCodes: output.reasonCodes,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    return ok(output, {
      domainEvents,
      reasonCodes: output.reasonCodes,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
