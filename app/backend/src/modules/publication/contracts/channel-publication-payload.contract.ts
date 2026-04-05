export interface ChannelPublicationPayload {
  listingId: string;
  channel: string;
  title: string;
  description: string;
  attributes: Record<string, unknown>;
  seo: Record<string, unknown>;
}
