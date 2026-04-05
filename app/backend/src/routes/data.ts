import { FastifyInstance } from "fastify";
import { PostgresDatabase } from "../db/postgres";
import { normalizeRegistryValue } from "../modules/registry/status-registry";

interface RegisterDataRoutesOptions {
  db: PostgresDatabase;
}

function parseLimit(input: string | undefined): number {
  if (!input) {
    return 25;
  }

  const parsed = Number.parseInt(input, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 25;
  }

  return Math.min(parsed, 100);
}

export async function registerDataRoutes(
  app: FastifyInstance,
  options: RegisterDataRoutesOptions
): Promise<void> {
  app.get("/v1/suppliers", async (request) => {
    const query = request.query as { limit?: string };
    const rows = await options.db.query(
      `
        select
          supplier_id,
          supplier_name,
          integration_type,
          is_active,
          trust_score,
          last_import_at,
          created_at,
          updated_at
        from suppliers
        order by created_at desc
        limit $1
      `,
      [parseLimit(query.limit)]
    );

    return { data: rows };
  });

  app.get("/v1/products", async (request) => {
    const query = request.query as { limit?: string; normalization_status?: string };
    const filters: string[] = [];
    const values: unknown[] = [];
    const normalizationStatus = normalizeRegistryValue(
      "products_normalized.normalization_status",
      query.normalization_status
    );

    if (normalizationStatus) {
      values.push(normalizationStatus);
      filters.push(`normalization_status = $${values.length}`);
    }

    values.push(parseLimit(query.limit));
    const limitParameter = values.length;
    const whereClause = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
    const rows = await options.db.query(
      `
        select
          product_id,
          internal_sku,
          supplier_sku,
          brand,
          category_normalized,
          stock_quantity,
          normalization_status,
          updated_at
        from products_normalized
        ${whereClause}
        order by updated_at desc
        limit $${limitParameter}
      `,
      values
    );

    return { data: rows };
  });

  app.get("/v1/orders", async (request) => {
    const query = request.query as {
      limit?: string;
      order_status?: string;
      payment_status?: string;
      supplier_submission_status?: string;
      tracking_status?: string;
    };
    const filters: string[] = [];
    const values: unknown[] = [];
    const orderStatus = normalizeRegistryValue("orders.order_status", query.order_status);
    const paymentStatus = normalizeRegistryValue("orders.payment_status", query.payment_status);
    const supplierSubmissionStatus = normalizeRegistryValue(
      "orders.supplier_submission_status",
      query.supplier_submission_status
    );
    const trackingStatus = normalizeRegistryValue("orders.tracking_status", query.tracking_status);

    if (orderStatus) {
      values.push(orderStatus);
      filters.push(`order_status = $${values.length}`);
    }

    if (paymentStatus) {
      values.push(paymentStatus);
      filters.push(`payment_status = $${values.length}`);
    }

    if (supplierSubmissionStatus) {
      values.push(supplierSubmissionStatus);
      filters.push(`supplier_submission_status = $${values.length}`);
    }

    if (trackingStatus) {
      values.push(trackingStatus);
      filters.push(`tracking_status = $${values.length}`);
    }

    values.push(parseLimit(query.limit));
    const limitParameter = values.length;
    const whereClause = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
    const rows = await options.db.query(
      `
        select
          order_id,
          channel,
          channel_order_id,
          order_status,
          payment_status,
          supplier_submission_status,
          tracking_status,
          created_at,
          updated_at
        from orders
        ${whereClause}
        order by created_at desc
        limit $${limitParameter}
      `,
      values
    );

    return { data: rows };
  });

  app.get("/v1/exceptions", async (request) => {
    const query = request.query as { limit?: string; status?: string; severity?: string };
    const filters: string[] = [];
    const values: unknown[] = [];
    const exceptionStatus = normalizeRegistryValue("exceptions.status", query.status);
    const exceptionSeverity = normalizeRegistryValue("exceptions.severity", query.severity);

    if (exceptionStatus) {
      values.push(exceptionStatus);
      filters.push(`status = $${values.length}`);
    }

    if (exceptionSeverity) {
      values.push(exceptionSeverity);
      filters.push(`severity = $${values.length}`);
    }

    values.push(parseLimit(query.limit));
    const limitParameter = values.length;
    const whereClause = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
    const rows = await options.db.query(
      `
        select
          exception_id,
          entity_type,
          entity_id,
          exception_category,
          severity,
          status,
          summary,
          created_at,
          resolved_at
        from exceptions
        ${whereClause}
        order by created_at desc
        limit $${limitParameter}
      `,
      values
    );

    return { data: rows };
  });
}
