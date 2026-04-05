create extension if not exists pgcrypto;

create table if not exists suppliers (
  supplier_id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  integration_type text not null,
  source_endpoint text,
  is_active boolean not null default true,
  trust_score numeric(5,2),
  avg_fulfillment_delay_days integer,
  stock_accuracy_score numeric(5,2),
  cancellation_rate numeric(5,2),
  last_import_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_trust_score_range check (trust_score is null or trust_score between 0 and 100),
  constraint suppliers_stock_accuracy_score_range check (stock_accuracy_score is null or stock_accuracy_score between 0 and 100),
  constraint suppliers_cancellation_rate_range check (cancellation_rate is null or cancellation_rate between 0 and 100)
);

create unique index if not exists suppliers_supplier_name_uidx
  on suppliers (lower(supplier_name));

create table if not exists supplier_imports (
  import_id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(supplier_id) on delete cascade,
  import_status text not null,
  source_reference text,
  records_received integer not null default 0,
  records_valid integer not null default 0,
  records_invalid integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_summary text,
  constraint supplier_imports_status_check check (
    import_status in ('started', 'fetched', 'parsed', 'completed', 'failed', 'partial')
  ),
  constraint supplier_imports_received_non_negative check (records_received >= 0),
  constraint supplier_imports_valid_non_negative check (records_valid >= 0),
  constraint supplier_imports_invalid_non_negative check (records_invalid >= 0)
);

create index if not exists supplier_imports_supplier_started_idx
  on supplier_imports (supplier_id, started_at desc);

create table if not exists products_raw (
  raw_product_id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(supplier_id) on delete cascade,
  import_id uuid not null references supplier_imports(import_id) on delete cascade,
  source_product_reference text not null,
  raw_payload_json jsonb not null,
  payload_hash text not null,
  imported_at timestamptz not null default now()
);

create index if not exists products_raw_import_idx
  on products_raw (import_id);

create index if not exists products_raw_supplier_source_idx
  on products_raw (supplier_id, source_product_reference);

create index if not exists products_raw_payload_hash_idx
  on products_raw (payload_hash);

create table if not exists products_normalized (
  product_id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(supplier_id) on delete restrict,
  raw_product_id uuid not null references products_raw(raw_product_id) on delete cascade,
  internal_sku text not null,
  supplier_sku text not null,
  ean text,
  brand text,
  title_raw text,
  title_normalized text,
  description_raw text,
  category_source text,
  category_normalized text,
  attributes_json jsonb not null default '{}'::jsonb,
  images_json jsonb not null default '[]'::jsonb,
  weight_kg numeric(10,3),
  shipping_time_days integer,
  cost_net numeric(12,2),
  cost_gross numeric(12,2),
  currency char(3),
  stock_quantity integer,
  data_quality_score numeric(5,2),
  normalization_status text not null default 'normalized',
  normalized_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_normalized_status_check check (
    normalization_status in ('pending', 'normalized', 'failed', 'partial')
  ),
  constraint products_normalized_data_quality_range check (
    data_quality_score is null or data_quality_score between 0 and 100
  ),
  constraint products_normalized_raw_product_unique unique (raw_product_id),
  constraint products_normalized_internal_sku_unique unique (internal_sku),
  constraint products_normalized_supplier_sku_unique unique (supplier_id, supplier_sku)
);

create unique index if not exists products_normalized_ean_uidx
  on products_normalized (ean)
  where ean is not null;

create index if not exists products_normalized_supplier_category_idx
  on products_normalized (supplier_id, category_normalized);

create table if not exists listings (
  listing_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products_normalized(product_id) on delete cascade,
  channel text not null,
  channel_listing_id text,
  listing_status text not null default 'draft',
  current_price numeric(12,2),
  currency char(3),
  title_generated text,
  bullets_json jsonb not null default '[]'::jsonb,
  description_generated text,
  attributes_payload_json jsonb not null default '{}'::jsonb,
  seo_payload_json jsonb not null default '{}'::jsonb,
  generation_version text,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint listings_status_check check (
    listing_status in ('draft', 'generated', 'validation_failed', 'ready_for_publication', 'published', 'paused', 'archived')
  ),
  constraint listings_product_channel_unique unique (product_id, channel)
);

create unique index if not exists listings_channel_listing_uidx
  on listings (channel, channel_listing_id)
  where channel_listing_id is not null;

create index if not exists listings_status_channel_idx
  on listings (listing_status, channel);

create table if not exists listing_validations (
  validation_id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(listing_id) on delete cascade,
  validation_status text not null,
  validation_errors_json jsonb not null default '[]'::jsonb,
  validation_warnings_json jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null default now(),
  constraint listing_validations_status_check check (
    validation_status in ('passed', 'failed', 'review_required')
  )
);

create index if not exists listing_validations_listing_checked_idx
  on listing_validations (listing_id, checked_at desc);

create table if not exists customers (
  customer_id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  full_name text,
  country char(2),
  created_at timestamptz not null default now()
);

create unique index if not exists customers_email_uidx
  on customers (lower(email))
  where email is not null;

create table if not exists orders (
  order_id uuid primary key default gen_random_uuid(),
  channel text not null,
  channel_order_id text not null,
  order_status text not null default 'received',
  payment_status text not null default 'pending',
  customer_reference uuid references customers(customer_id) on delete set null,
  order_total_gross numeric(12,2),
  currency char(3),
  supplier_submission_status text not null default 'pending',
  tracking_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    order_status in (
      'received',
      'validated',
      'validation_failed',
      'queued_for_supplier',
      'submitted_to_supplier',
      'supplier_acknowledged',
      'awaiting_tracking',
      'in_transit',
      'delivered',
      'cancelled',
      'exception'
    )
  ),
  constraint orders_payment_status_check check (
    payment_status in ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled')
  ),
  constraint orders_supplier_submission_status_check check (
    supplier_submission_status in ('pending', 'queued', 'submitted', 'acknowledged', 'failed', 'not_required')
  ),
  constraint orders_tracking_status_check check (
    tracking_status in ('pending', 'received', 'in_transit', 'delivered', 'missing', 'exception')
  ),
  constraint orders_channel_order_unique unique (channel, channel_order_id)
);

create index if not exists orders_status_created_idx
  on orders (order_status, created_at desc);

create table if not exists order_items (
  order_item_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(order_id) on delete cascade,
  product_id uuid references products_normalized(product_id) on delete set null,
  listing_id uuid references listings(listing_id) on delete set null,
  supplier_sku text,
  quantity integer not null,
  unit_price numeric(12,2),
  line_total numeric(12,2),
  constraint order_items_quantity_positive check (quantity > 0)
);

create index if not exists order_items_order_idx
  on order_items (order_id);

create index if not exists order_items_product_idx
  on order_items (product_id);
