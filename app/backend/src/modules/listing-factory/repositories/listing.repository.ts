import { randomUUID } from "node:crypto";
import { DatabaseClient, wrapPersistenceError } from "../../../shared";
import { ListingGenerationOutput } from "../contracts/listing-generation-output.contract";
import {
  mapListingOutputToDraftRow,
  mapListingOutputToValidationRow
} from "./listing.mapper";

interface ListingInsertRow {
  listing_id: string;
  listing_status: string;
  updated_at: string;
}

interface ListingValidationInsertRow {
  validation_id: string;
  checked_at: string;
}

interface PersistedListingDraft {
  listingId: string;
  listingStatus: string;
  updatedAt: string;
}

interface PersistedListingValidation {
  validationId: string;
  checkedAt: string;
}

export interface ListingRepository {
  saveDraft(output: ListingGenerationOutput): Promise<PersistedListingDraft>;
  saveValidation(
    listingId: string,
    output: ListingGenerationOutput
  ): Promise<PersistedListingValidation>;
  getListingPublicationState(listingId: string): Promise<{
    listingId: string;
    listingStatus: string;
    channel: string;
    latestValidationStatus: string | null;
    titleGenerated: string | null;
    descriptionGenerated: string | null;
    attributesPayloadJson: Record<string, unknown>;
    seoPayloadJson: Record<string, unknown>;
  } | null>;
  markReadyForPublication(listingId: string): Promise<{
    listingId: string;
    listingStatus: string;
    updatedAt: string;
  } | null>;
}

export class NoopListingRepository implements ListingRepository {
  private readonly drafts = new Map<string, Awaited<ReturnType<ListingRepository["getListingPublicationState"]>>>();

  async saveDraft(output: ListingGenerationOutput): Promise<PersistedListingDraft> {
    const listingId = randomUUID();
    const draft: NonNullable<
      Awaited<ReturnType<ListingRepository["getListingPublicationState"]>>
    > = {
      listingId,
      listingStatus: output.listingStatus,
      channel: output.channel,
      latestValidationStatus: output.validation.validationStatus,
      titleGenerated: output.generatedPayload.title,
      descriptionGenerated: output.generatedPayload.description,
      attributesPayloadJson: {
        ...output.generatedPayload.attributes
      },
      seoPayloadJson: {
        ...output.generatedPayload.seo
      }
    };
    this.drafts.set(listingId, draft);
    return {
      listingId,
      listingStatus: output.listingStatus,
      updatedAt: new Date().toISOString()
    };
  }

  async saveValidation(
    _listingId: string,
    _output: ListingGenerationOutput
  ): Promise<PersistedListingValidation> {
    return {
      validationId: randomUUID(),
      checkedAt: new Date().toISOString()
    };
  }

  async getListingPublicationState(listingId: string) {
    return this.drafts.get(listingId) ?? null;
  }

  async markReadyForPublication(listingId: string) {
    const draft = this.drafts.get(listingId);
    if (!draft) {
      return null;
    }

    draft.listingStatus = "ready_for_publication";
    return {
      listingId,
      listingStatus: draft.listingStatus,
      updatedAt: new Date().toISOString()
    };
  }
}

interface ListingPublicationStateRow {
  listing_id: string;
  listing_status: string;
  channel: string;
  title_generated: string | null;
  description_generated: string | null;
  attributes_payload_json: Record<string, unknown>;
  seo_payload_json: Record<string, unknown>;
  latest_validation_status: string | null;
}

export class PostgresListingRepository implements ListingRepository {
  constructor(private readonly db: DatabaseClient) {}

  async saveDraft(output: ListingGenerationOutput): Promise<PersistedListingDraft> {
    const row = mapListingOutputToDraftRow(output);

    try {
      const rows = await this.db.query<ListingInsertRow>(
        `
          insert into listings (
            product_id,
            channel,
            listing_status,
            title_generated,
            bullets_json,
            description_generated,
            attributes_payload_json,
            seo_payload_json,
            generation_version,
            updated_at
          )
          values (
            $1::uuid,
            $2,
            $3,
            $4,
            $5::jsonb,
            $6,
            $7::jsonb,
            $8::jsonb,
            $9,
            now()
          )
          on conflict (product_id, channel) do update
          set
            listing_status = excluded.listing_status,
            title_generated = excluded.title_generated,
            bullets_json = excluded.bullets_json,
            description_generated = excluded.description_generated,
            attributes_payload_json = excluded.attributes_payload_json,
            seo_payload_json = excluded.seo_payload_json,
            generation_version = excluded.generation_version,
            updated_at = now()
          returning listing_id, listing_status, updated_at::text as updated_at
        `,
        [
          row.productId,
          row.channel,
          row.listingStatus,
          row.titleGenerated,
          row.bulletsJson,
          row.descriptionGenerated,
          row.attributesPayloadJson,
          row.seoPayloadJson,
          row.generationVersion
        ]
      );

      const inserted = rows[0];
      if (!inserted) {
        throw new Error("Listing draft persistence returned no rows.");
      }

      return {
        listingId: inserted.listing_id,
        listingStatus: inserted.listing_status,
        updatedAt: inserted.updated_at
      };
    } catch (error) {
      throw wrapPersistenceError("save_listing_draft", error);
    }
  }

  async saveValidation(
    listingId: string,
    output: ListingGenerationOutput
  ): Promise<PersistedListingValidation> {
    const row = mapListingOutputToValidationRow(listingId, output);

    try {
      const rows = await this.db.query<ListingValidationInsertRow>(
        `
          insert into listing_validations (
            listing_id,
            validation_status,
            validation_errors_json,
            validation_warnings_json
          )
          values ($1::uuid, $2, $3::jsonb, $4::jsonb)
          returning validation_id, checked_at::text as checked_at
        `,
        [
          row.listingId,
          row.validationStatus,
          row.validationErrorsJson,
          row.validationWarningsJson
        ]
      );

      const inserted = rows[0];
      if (!inserted) {
        throw new Error("Listing validation persistence returned no rows.");
      }

      return {
        validationId: inserted.validation_id,
        checkedAt: inserted.checked_at
      };
    } catch (error) {
      throw wrapPersistenceError("save_listing_validation", error);
    }
  }

  async getListingPublicationState(listingId: string) {
    try {
      const rows = await this.db.query<ListingPublicationStateRow>(
        `
          select
            l.listing_id,
            l.listing_status,
            l.channel,
            l.title_generated,
            l.description_generated,
            l.attributes_payload_json,
            l.seo_payload_json,
            lv.validation_status as latest_validation_status
          from listings l
          left join lateral (
            select validation_status
            from listing_validations
            where listing_id = l.listing_id
            order by checked_at desc
            limit 1
          ) lv on true
          where l.listing_id = $1::uuid
          limit 1
        `,
        [listingId]
      );

      const row = rows[0];
      if (!row) {
        return null;
      }

      return {
        listingId: row.listing_id,
        listingStatus: row.listing_status,
        channel: row.channel,
        latestValidationStatus: row.latest_validation_status,
        titleGenerated: row.title_generated,
        descriptionGenerated: row.description_generated,
        attributesPayloadJson: row.attributes_payload_json ?? {},
        seoPayloadJson: row.seo_payload_json ?? {}
      };
    } catch (error) {
      throw wrapPersistenceError("get_listing_publication_state", error);
    }
  }

  async markReadyForPublication(listingId: string) {
    try {
      const rows = await this.db.query<ListingInsertRow>(
        `
          update listings
          set
            listing_status = 'ready_for_publication',
            updated_at = now()
          where listing_id = $1::uuid
          returning listing_id, listing_status, updated_at::text as updated_at
        `,
        [listingId]
      );

      const updated = rows[0];
      if (!updated) {
        return null;
      }

      return {
        listingId: updated.listing_id,
        listingStatus: updated.listing_status,
        updatedAt: updated.updated_at
      };
    } catch (error) {
      throw wrapPersistenceError("mark_listing_ready_for_publication", error);
    }
  }
}
