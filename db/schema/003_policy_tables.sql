create table if not exists policies (
  policy_id uuid primary key default gen_random_uuid(),
  policy_name text not null,
  policy_version text not null,
  policy_type text not null,
  policy_payload_json jsonb not null default '{}'::jsonb,
  active_from timestamptz not null default now(),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint policies_name_version_unique unique (policy_name, policy_version)
);

create unique index if not exists policies_active_name_uidx
  on policies (policy_name)
  where is_active;

create table if not exists prompts (
  prompt_id uuid primary key default gen_random_uuid(),
  prompt_name text not null,
  module_name text not null,
  version text not null,
  prompt_text text not null,
  schema_reference text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint prompts_module_name_version_unique unique (module_name, prompt_name, version)
);

create unique index if not exists prompts_active_module_prompt_uidx
  on prompts (module_name, prompt_name)
  where is_active;
