import { DomainEvent } from "../../../shared";
import { ChannelPublicationPayload } from "./channel-publication-payload.contract";

export interface PublicationOutput {
  listingId: string;
  listingStatus: "ready_for_publication" | "generated" | "validation_failed";
  publicationStatus: "ready_for_publication" | "review_required" | "blocked";
  publicationReady: boolean;
  channelPublicationPayload: ChannelPublicationPayload | null;
  recommendedNextStep: string;
  domainEvents: DomainEvent[];
}
