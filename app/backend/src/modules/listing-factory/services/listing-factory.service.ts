import {
  createDomainEvent,
  DomainEvent,
  escalate,
  ExceptionService,
  fail,
  NoopExceptionService,
  NoopLogger,
  ok,
  OperationResult,
  review,
  RuntimeLogger
} from "../../../shared";
import { resolveChannelConstraints } from "../default-channel-constraints";
import { ListingGenerationInput } from "../contracts/listing-generation-input.contract";
import { ListingGenerationOutput } from "../contracts/listing-generation-output.contract";
import { ListingContentGeneratorService } from "./listing-content-generator.service";
import { ListingValidationService } from "./listing-validation.service";

function resolveRecommendedNextStep(output: ListingGenerationOutput): string {
  if (output.validation.validationStatus === "passed") {
    return "mark_ready_for_publication";
  }

  if (output.validation.validationStatus === "review_required") {
    return "send_to_listing_review_queue";
  }

  return "stop_and_fix_listing_input";
}

export class ListingFactoryService {
  constructor(
    private readonly generator: ListingContentGeneratorService = new ListingContentGeneratorService(),
    private readonly validator: ListingValidationService = new ListingValidationService(),
    private readonly logger: RuntimeLogger = new NoopLogger(),
    private readonly exceptionService: ExceptionService = new NoopExceptionService()
  ) {}

  async generatePreview(input: ListingGenerationInput): Promise<OperationResult<ListingGenerationOutput>> {
    if (!input.qualification.listingGenerationAllowed) {
      return fail(
        "listing_generation_not_allowed",
        "Listing generation is not allowed for the provided qualification state."
      );
    }

    if (!["approved", "improve_required"].includes(input.qualification.qualificationStatus)) {
      return fail(
        "qualification_status_not_supported",
        "Listing generation accepts only approved or improve_required qualification states."
      );
    }

    const constraints = resolveChannelConstraints(input.channel, input.channelConstraints);
    const generation = this.generator.generate(input.normalizedProduct, constraints);
    const validation = this.validator.validate(input.normalizedProduct, generation.content, constraints);
    const listingStatus =
      validation.validationStatus === "passed"
        ? "ready_for_publication"
        : validation.validationStatus === "failed"
          ? "validation_failed"
          : "generated";

    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "listing_generation_started",
        entityType: "product",
        entityId: input.normalizedProduct.productId,
        eventSource: "listing_factory_service",
        payload: {
          channel: input.channel,
          promptVersion: input.promptVersion ?? "listing-system-prompt-v1"
        }
      }),
      createDomainEvent({
        eventType: "listing_generated",
        entityType: "product",
        entityId: input.normalizedProduct.productId,
        eventSource: "listing_factory_service",
        payload: {
          channel: input.channel,
          listingStatus
        }
      }),
      createDomainEvent({
        eventType: `listing_validation_${validation.validationStatus}`,
        entityType: "product",
        entityId: input.normalizedProduct.productId,
        eventSource: "listing_factory_service",
        payload: {
          channel: input.channel,
          errorCodes: validation.errorCodes,
          warningCodes: validation.warningCodes
        }
      })
    ];

    const output: ListingGenerationOutput = {
      productId: input.normalizedProduct.productId,
      channel: input.channel,
      promptVersion: input.promptVersion ?? "listing-system-prompt-v1",
      listingStatus,
      content: generation.content,
      validation,
      qualitySignals: generation.qualitySignals,
      recommendedNextStep: "",
      exceptionRecommended: validation.validationStatus === "failed",
      constraintsUsed: constraints,
      domainEvents
    };
    output.recommendedNextStep = resolveRecommendedNextStep(output);

    this.logger.info("Listing preview generated", {
      productId: output.productId,
      channel: output.channel,
      validationStatus: output.validation.validationStatus
    });

    if (validation.validationStatus === "failed") {
      const exception = await this.exceptionService.createException({
        entityType: "product",
        entityId: output.productId,
        domain: "listing_factory",
        severity: "medium",
        reasonCode: validation.errorCodes[0] ?? "LISTING_VALIDATION_FAILED",
        summary: "Generated listing failed validation.",
        details: {
          channel: output.channel,
          errorCodes: validation.errorCodes
        }
      });

      return escalate(output, {
        domainEvents,
        reasonCodes: validation.errorCodes,
        riskFlags: validation.warningCodes,
        recommendedNextStep: output.recommendedNextStep,
        exception
      });
    }

    if (validation.validationStatus === "review_required") {
      return review(output, {
        domainEvents,
        reasonCodes: validation.warningCodes,
        recommendedNextStep: output.recommendedNextStep
      });
    }

    return ok(output, {
      domainEvents,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
