create table if not exists audit_logs (
  audit_id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_reference text,
  action_type text not null,
  target_type text not null,
  target_id uuid,
  before_state_json jsonb not null default '{}'::jsonb,
  after_state_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_target_created_idx
  on audit_logs (target_type, target_id, created_at desc);

create index if not exists audit_logs_actor_created_idx
  on audit_logs (actor_type, actor_reference, created_at desc);
