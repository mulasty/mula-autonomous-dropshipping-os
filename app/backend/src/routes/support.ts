import { FastifyInstance } from "fastify";
import { ExceptionService } from "../shared";
import {
  buildStoredClassificationOutput,
  SupportClassificationInput,
  SupportClassificationLabel,
  SupportPolicyContext,
  SupportResponseInput,
  CustomerMessageRepository,
  SupportClassificationService,
  SupportResponseRepository,
  SupportResponseService
} from "../modules/support";

interface SupportRouteOptions {
  customerMessageRepository?: CustomerMessageRepository;
  supportResponseRepository?: SupportResponseRepository;
  exceptionService?: ExceptionService;
}

const SUPPORT_LABELS: SupportClassificationLabel[] = [
  "pre_sale_question",
  "order_status",
  "shipping_delay",
  "return_request",
  "complaint_low_risk",
  "complaint_high_risk",
  "refund_request",
  "cancellation_request",
  "legal_or_reputational_risk",
  "unclear"
];

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

function parseSupportPolicyContext(value: unknown): Partial<SupportPolicyContext> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const autoSendLabels = parseOptionalStringArray(value.autoSendLabels)?.filter((label) =>
    SUPPORT_LABELS.includes(label as SupportClassificationLabel)
  ) as SupportClassificationLabel[] | undefined;
  const draftOnlyLabels = parseOptionalStringArray(value.draftOnlyLabels)?.filter((label) =>
    SUPPORT_LABELS.includes(label as SupportClassificationLabel)
  ) as SupportClassificationLabel[] | undefined;

  return {
    policyVersion: parseOptionalString(value.policyVersion) ?? undefined,
    automationConfidenceThreshold:
      parseOptionalNumber(value.automationConfidenceThreshold) ?? undefined,
    escalationConfidenceThreshold:
      parseOptionalNumber(value.escalationConfidenceThreshold) ?? undefined,
    autoSendLabels,
    draftOnlyLabels
  };
}

function parseSupportClassificationInput(body: unknown): SupportClassificationInput | null {
  if (!isRecord(body)) {
    return null;
  }

  const channel = parseOptionalString(body.channel);
  const messageText = parseOptionalString(body.messageText);

  if (!channel || !messageText) {
    return null;
  }

  return {
    messageId: parseOptionalString(body.messageId) ?? undefined,
    channel,
    messageText,
    customerId: parseOptionalString(body.customerId),
    orderContext: isRecord(body.orderContext)
      ? {
          orderId: parseOptionalString(body.orderContext.orderId),
          orderStatus: parseOptionalString(body.orderContext.orderStatus),
          paymentStatus: parseOptionalString(body.orderContext.paymentStatus),
          trackingStatus: parseOptionalString(body.orderContext.trackingStatus)
        }
      : undefined,
    trackingContext: isRecord(body.trackingContext)
      ? {
          carrier: parseOptionalString(body.trackingContext.carrier),
          trackingNumber: parseOptionalString(body.trackingContext.trackingNumber),
          lastKnownStatus: parseOptionalString(body.trackingContext.lastKnownStatus),
          lastUpdatedAt: parseOptionalString(body.trackingContext.lastUpdatedAt)
        }
      : undefined,
    productContext: isRecord(body.productContext)
      ? {
          productId: parseOptionalString(body.productContext.productId),
          title: parseOptionalString(body.productContext.title),
          knownFacts: parseOptionalStringArray(body.productContext.knownFacts)
        }
      : undefined,
    policyContext: parseSupportPolicyContext(body.policyContext)
  };
}

type ParsedSupportResponseInput = Omit<SupportResponseInput, "classification"> & {
  storedMessageId: string;
};

function parseSupportResponseInput(body: unknown): ParsedSupportResponseInput | null {
  if (!isRecord(body)) {
    return null;
  }

  const messageId = parseOptionalString(body.messageId);
  const sendMode = parseOptionalString(body.sendMode);

  if (!messageId) {
    return null;
  }

  return {
    messageText: parseOptionalString(body.messageText) ?? undefined,
    orderContext: isRecord(body.orderContext)
      ? {
          orderId: parseOptionalString(body.orderContext.orderId),
          orderStatus: parseOptionalString(body.orderContext.orderStatus),
          paymentStatus: parseOptionalString(body.orderContext.paymentStatus),
          trackingStatus: parseOptionalString(body.orderContext.trackingStatus)
        }
      : undefined,
    trackingContext: isRecord(body.trackingContext)
      ? {
          carrier: parseOptionalString(body.trackingContext.carrier),
          trackingNumber: parseOptionalString(body.trackingContext.trackingNumber),
          lastKnownStatus: parseOptionalString(body.trackingContext.lastKnownStatus),
          lastUpdatedAt: parseOptionalString(body.trackingContext.lastUpdatedAt)
        }
      : undefined,
    productContext: isRecord(body.productContext)
      ? {
          productId: parseOptionalString(body.productContext.productId),
          title: parseOptionalString(body.productContext.title),
          knownFacts: parseOptionalStringArray(body.productContext.knownFacts)
        }
      : undefined,
    sendMode:
      sendMode === "auto_send_allowed" || sendMode === "draft_only"
      ? sendMode
      : undefined,
    promptVersion: parseOptionalString(body.promptVersion) ?? undefined,
    storedMessageId: messageId
  };
}

export async function registerSupportRoutes(
  app: FastifyInstance,
  options: SupportRouteOptions = {}
): Promise<void> {
  const classificationService = new SupportClassificationService(
    options.customerMessageRepository,
    undefined,
    options.exceptionService
  );
  const responseService = new SupportResponseService(
    options.supportResponseRepository,
    undefined,
    options.exceptionService
  );
  const customerMessageRepository = options.customerMessageRepository;

  app.post("/v1/support/classify", async (request, reply) => {
    const parsed = parseSupportClassificationInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_support_classification_request",
        message: "Body must include channel and messageText."
      });
      return;
    }

    return {
      data: await classificationService.classify(parsed)
    };
  });

  app.post("/v1/support/respond", async (request, reply) => {
    const parsed = parseSupportResponseInput(request.body);
    if (!parsed) {
      reply.code(400).send({
        error: "invalid_support_response_request",
        message: "Body must include messageId."
      });
      return;
    }

    if (!customerMessageRepository) {
      reply.code(500).send({
        error: "support_repository_unavailable",
        message: "Support message repository is not configured."
      });
      return;
    }

    const storedMessage = await customerMessageRepository.getClassification(parsed.storedMessageId);
    if (!storedMessage) {
      reply.code(404).send({
        error: "support_message_not_found",
        message: `No stored support classification found for messageId ${parsed.storedMessageId}.`
      });
      return;
    }

    const responseInput: SupportResponseInput = {
      classification: buildStoredClassificationOutput(storedMessage),
      messageText: parsed.messageText ?? storedMessage.messageText,
      orderContext: parsed.orderContext,
      trackingContext: parsed.trackingContext,
      productContext: parsed.productContext,
      sendMode: parsed.sendMode,
      promptVersion: parsed.promptVersion
    };

    return {
      data: await responseService.respond(responseInput)
    };
  });
}
