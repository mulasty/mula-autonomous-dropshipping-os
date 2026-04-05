create table if not exists product_rule_decisions (
  decision_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products_normalized(product_id) on delete cascade,
  rules_version text not null,
  policy_version text not null,
  decision_status text not null,
  reason_codes_json jsonb not null default '[]'::jsonb,
  projected_net_margin numeric(12,2),
  projected_gross_margin numeric(12,2),
  risk_flags_json jsonb not null default '[]'::jsonb,
  recommended_next_step text,
  decided_at timestamptz not null default now(),
  constraint product_rule_decisions_status_check check (
    decision_status in ('approved', 'rejected', 'review_required', 'improve_required', 'blocked')
  )
);

create index if not exists product_rule_decisions_product_decided_idx
  on product_rule_decisions (product_id, decided_at desc);

create table if not exists product_ai_decisions (
  ai_decision_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products_normalized(product_id) on delete cascade,
  agent_name text not null,
  prompt_version text not null,
  input_reference text,
  output_json jsonb not null default '{}'::jsonb,
  confidence numeric(5,2),
  escalate boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_ai_decisions_confidence_range check (
    confidence is null or confidence between 0 and 100
  )
);

create index if not exists product_ai_decisions_product_created_idx
  on product_ai_decisions (product_id, created_at desc);

create table if not exists pricing_history (
  pricing_event_id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(listing_id) on delete cascade,
  previous_price numeric(12,2),
  new_price numeric(12,2),
  change_reason text,
  source_cost_reference text,
  triggered_by text,
  changed_at timestamptz not null default now()
);

create index if not exists pricing_history_listing_changed_idx
  on pricing_history (listing_id, changed_at desc);

create table if not exists stock_history (
  stock_event_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products_normalized(product_id) on delete cascade,
  previous_stock integer,
  new_stock integer,
  source_reference text,
  changed_at timestamptz not null default now()
);

create index if not exists stock_history_product_changed_idx
  on stock_history (product_id, changed_at desc);

create table if not exists order_events (
  order_event_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(order_id) on delete cascade,
  event_type text not null,
  event_payload_json jsonb not null default '{}'::jsonb,
  event_source text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_created_idx
  on order_events (order_id, created_at desc);

create table if not exists customer_messages (
  message_id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(order_id) on delete set null,
  customer_id uuid references customers(customer_id) on delete set null,
  channel text not null,
  direction text not null,
  message_text text not null,
  classification_label text,
  automation_allowed boolean,
  confidence numeric(5,2),
  escalation_flag boolean not null default false,
  created_at timestamptz not null default now(),
  constraint customer_messages_direction_check check (
    direction in ('inbound', 'outbound')
  ),
  constraint customer_messages_confidence_range check (
    confidence is null or confidence between 0 and 100
  )
);

create index if not exists customer_messages_order_created_idx
  on customer_messages (order_id, created_at desc);

create index if not exists customer_messages_customer_created_idx
  on customer_messages (customer_id, created_at desc);

create table if not exists support_responses (
  response_id uuid primary key default gen_random_uuid(),
  message_id uuid not null references customer_messages(message_id) on delete cascade,
  prompt_version text not null,
  response_text text not null,
  send_status text not null default 'drafted',
  escalate boolean not null default false,
  escalation_reason text,
  created_at timestamptz not null default now(),
  constraint support_responses_send_status_check check (
    send_status in ('drafted', 'sent', 'failed', 'cancelled')
  )
);

create index if not exists support_responses_message_created_idx
  on support_responses (message_id, created_at desc);

create table if not exists exceptions (
  exception_id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  exception_category text not null,
  severity text not null,
  status text not null default 'new',
  summary text not null,
  details_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint exceptions_severity_check check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  constraint exceptions_status_check check (
    status in ('new', 'acknowledged', 'in_review', 'resolved', 'closed')
  )
);

create index if not exists exceptions_queue_idx
  on exceptions (status, severity, created_at desc);

create index if not exists exceptions_entity_idx
  on exceptions (entity_type, entity_id);
