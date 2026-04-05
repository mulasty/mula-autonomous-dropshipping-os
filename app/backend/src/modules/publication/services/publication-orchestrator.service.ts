import {
  createDomainEvent,
  DomainEvent,
  escalate,
  fail,
  ok,
  OperationResult,
  review
} from "../../../shared";
import { ListingRepository } from "../../listing-factory/repositories/listing.repository";
import { PublicationInput } from "../contracts/publication-input.contract";
import { PublicationOutput } from "../contracts/publication-output.contract";

export class PublicationOrchestratorService {
  constructor(private readonly listingRepository: ListingRepository) {}

  async prepare(
    input: PublicationInput
  ): Promise<OperationResult<PublicationOutput>> {
    const listing = await this.listingRepository.getListingPublicationState(
      input.listingId
    );
    if (!listing) {
      return fail(
        "listing_not_found",
        "Listing could not be found for publication preparation."
      );
    }

    const domainEvents: DomainEvent[] = [
      createDomainEvent({
        eventType: "publication_preparation_started",
        entityType: "listing",
        entityId: input.listingId,
        eventSource: "publication_orchestrator_service",
        payload: {
          channel: listing.channel
        }
      })
    ];

    if (listing.latestValidationStatus !== "passed") {
      const output: PublicationOutput = {
        listingId: input.listingId,
        listingStatus:
          listing.latestValidationStatus === "failed"
            ? "validation_failed"
            : "generated",
        publicationStatus:
          listing.latestValidationStatus === "review_required"
            ? "review_required"
            : "blocked",
        publicationReady: false,
        channelPublicationPayload: null,
        recommendedNextStep:
          listing.latestValidationStatus === "review_required"
            ? "send_to_listing_review_queue"
            : "stop_and_fix_listing_input",
        domainEvents
      };

      return listing.latestValidationStatus === "review_required"
        ? review(output, {
            domainEvents,
            recommendedNextStep: output.recommendedNextStep
          })
        : escalate(output, {
            domainEvents,
            recommendedNextStep: output.recommendedNextStep
          });
    }

    const persisted = await this.listingRepository.markReadyForPublication(
      input.listingId
    );
    const output: PublicationOutput = {
      listingId: input.listingId,
      listingStatus: persisted?.listingStatus === "ready_for_publication"
        ? "ready_for_publication"
        : "generated",
      publicationStatus: "ready_for_publication",
      publicationReady: true,
      channelPublicationPayload: {
        listingId: input.listingId,
        channel: listing.channel,
        title: listing.titleGenerated ?? "",
        description: listing.descriptionGenerated ?? "",
        attributes: listing.attributesPayloadJson,
        seo: listing.seoPayloadJson
      },
      recommendedNextStep: "handoff_to_channel_adapter",
      domainEvents
    };

    domainEvents.push(
      createDomainEvent({
        eventType: "listing_ready_for_publication",
        entityType: "listing",
        entityId: input.listingId,
        eventSource: "publication_orchestrator_service",
        payload: {
          channel: listing.channel
        }
      })
    );

    return ok(output, {
      domainEvents,
      recommendedNextStep: output.recommendedNextStep
    });
  }
}
