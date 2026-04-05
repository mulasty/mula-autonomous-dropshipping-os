create or replace view supplier_health_view as
with import_rollup as (
  select
    si.supplier_id,
    count(*) as import_attempts,
    count(*) filter (where si.import_status = 'completed') as completed_imports,
    count(*) filter (where si.import_status in ('failed', 'partial')) as degraded_imports,
    max(si.started_at) as last_import_started_at,
    max(si.finished_at) as last_import_finished_at
  from supplier_imports si
  group by si.supplier_id
),
product_rollup as (
  select
    pn.supplier_id,
    count(*) as normalized_products,
    count(*) filter (where pn.normalization_status = 'failed') as failed_normalizations
  from products_normalized pn
  group by pn.supplier_id
),
listing_rollup as (
  select
    pn.supplier_id,
    count(*) as listings_total,
    count(*) filter (where l.listing_status = 'published') as listings_published,
    count(*) filter (where l.listing_status = 'paused') as listings_paused
  from listings l
  join products_normalized pn on pn.product_id = l.product_id
  group by pn.supplier_id
)
select
  s.supplier_id,
  s.supplier_name,
  s.integration_type,
  s.is_active,
  s.trust_score,
  s.stock_accuracy_score,
  s.cancellation_rate,
  s.last_import_at,
  coalesce(ir.import_attempts, 0) as import_attempts,
  coalesce(ir.completed_imports, 0) as completed_imports,
  coalesce(ir.degraded_imports, 0) as degraded_imports,
  ir.last_import_started_at,
  ir.last_import_finished_at,
  coalesce(pr.normalized_products, 0) as normalized_products,
  coalesce(pr.failed_normalizations, 0) as failed_normalizations,
  coalesce(lr.listings_total, 0) as listings_total,
  coalesce(lr.listings_published, 0) as listings_published,
  coalesce(lr.listings_paused, 0) as listings_paused
from suppliers s
left join import_rollup ir on ir.supplier_id = s.supplier_id
left join product_rollup pr on pr.supplier_id = s.supplier_id
left join listing_rollup lr on lr.supplier_id = s.supplier_id;
