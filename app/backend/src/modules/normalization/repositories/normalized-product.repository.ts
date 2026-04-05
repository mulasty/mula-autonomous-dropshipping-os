import { randomUUID } from "node:crypto";
import { DatabaseClient, wrapPersistenceError } from "../../../shared";
import { NormalizationOutput } from "../contracts/normalization-output.contract";
import { mapNormalizationToPersistenceRow } from "./normalized-product.mapper";

interface NormalizedProductInsertRow {
  product_id: string;
  normalized_at: string;
}

export interface PersistedNormalizedProduct {
  productId: string;
  normalizedAt: string;
}

export interface NormalizedProductRepository {
  saveNormalizedProduct(output: NormalizationOutput): Promise<PersistedNormalizedProduct>;
}

export class NoopNormalizedProductRepository implements NormalizedProductRepository {
  async saveNormalizedProduct(): Promise<PersistedNormalizedProduct> {
    return {
      productId: randomUUID(),
      normalizedAt: new Date().toISOString()
    };
  }
}

export class PostgresNormalizedProductRepository
  implements NormalizedProductRepository
{
  constructor(private readonly db: DatabaseClient) {}

  async saveNormalizedProduct(
    output: NormalizationOutput
  ): Promise<PersistedNormalizedProduct> {
    const row = mapNormalizationToPersistenceRow(output);

    try {
      const rows = await this.db.query<NormalizedProductInsertRow>(
        `
          insert into products_normalized (
            supplier_id,
            raw_product_id,
            internal_sku,
            supplier_sku,
            ean,
            brand,
            title_raw,
            title_normalized,
            description_raw,
            category_source,
            category_normalized,
            attributes_json,
            images_json,
            weight_kg,
            shipping_time_days,
            cost_net,
            cost_gross,
            currency,
            stock_quantity,
            data_quality_score,
            normalization_status,
            normalized_at,
            updated_at
          )
          values (
            $1::uuid,
            $2::uuid,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12::jsonb,
            $13::jsonb,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19,
            $20,
            $21,
            $22::timestamptz,
            now()
          )
          on conflict (raw_product_id) do update
          set
            supplier_id = excluded.supplier_id,
            internal_sku = excluded.internal_sku,
            supplier_sku = excluded.supplier_sku,
            ean = excluded.ean,
            brand = excluded.brand,
            title_raw = excluded.title_raw,
            title_normalized = excluded.title_normalized,
            description_raw = excluded.description_raw,
            category_source = excluded.category_source,
            category_normalized = excluded.category_normalized,
            attributes_json = excluded.attributes_json,
            images_json = excluded.images_json,
            weight_kg = excluded.weight_kg,
            shipping_time_days = excluded.shipping_time_days,
            cost_net = excluded.cost_net,
            cost_gross = excluded.cost_gross,
            currency = excluded.currency,
            stock_quantity = excluded.stock_quantity,
            data_quality_score = excluded.data_quality_score,
            normalization_status = excluded.normalization_status,
            normalized_at = excluded.normalized_at,
            updated_at = now()
          returning product_id, normalized_at::text as normalized_at
        `,
        [
          row.supplierId,
          row.rawProductId,
          row.internalSku,
          row.supplierSku,
          row.ean,
          row.brand,
          row.titleRaw,
          row.titleNormalized,
          row.descriptionRaw,
          row.categorySource,
          row.categoryNormalized,
          row.attributesJson,
          row.imagesJson,
          row.weightKg,
          row.shippingTimeDays,
          row.costNet,
          row.costGross,
          row.currency,
          row.stockQuantity,
          row.dataQualityScore,
          row.normalizationStatus,
          row.normalizedAt
        ]
      );

      const inserted = rows[0];
      if (!inserted) {
        throw new Error("Normalized product persistence returned no rows.");
      }

      return {
        productId: inserted.product_id,
        normalizedAt: inserted.normalized_at
      };
    } catch (error) {
      throw wrapPersistenceError("save_normalized_product", error);
    }
  }
}
