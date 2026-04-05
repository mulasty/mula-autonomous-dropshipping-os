import { ListingGenerationOutput } from "../contracts/listing-generation-output.contract";

export interface ListingDraftPersistenceRow {
  productId: string;
  channel: string;
  listingStatus: ListingGenerationOutput["listingStatus"];
  titleGenerated: string;
  bulletsJson: string;
  descriptionGenerated: string;
  attributesPayloadJson: string;
  seoPayloadJson: string;
  generationVersion: string;
}

export interface ListingValidationPersistenceRow {
  listingId: string;
  validationStatus: ListingGenerationOutput["validation"]["validationStatus"];
  validationErrorsJson: string;
  validationWarningsJson: string;
}

export function mapListingOutputToDraftRow(
  output: ListingGenerationOutput
): ListingDraftPersistenceRow {
  return {
    productId: output.productId,
    channel: output.channel,
    listingStatus: output.listingStatus,
    titleGenerated: output.generatedPayload.title,
    bulletsJson: JSON.stringify(output.generatedPayload.bullets),
    descriptionGenerated: output.generatedPayload.description,
    attributesPayloadJson: JSON.stringify(output.generatedPayload.attributes),
    seoPayloadJson: JSON.stringify(output.generatedPayload.seo),
    generationVersion: output.promptVersion
  };
}

export function mapListingOutputToValidationRow(
  listingId: string,
  output: ListingGenerationOutput
): ListingValidationPersistenceRow {
  return {
    listingId,
    validationStatus: output.validation.validationStatus,
    validationErrorsJson: JSON.stringify(output.validation.errorCodes),
    validationWarningsJson: JSON.stringify(output.validation.warningCodes)
  };
}
