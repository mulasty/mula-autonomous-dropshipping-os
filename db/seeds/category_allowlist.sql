insert into policies (
  policy_name,
  policy_version,
  policy_type,
  policy_payload_json,
  active_from,
  is_active
)
values (
  'category_allowlist',
  'v1',
  'catalog',
  jsonb_build_object(
    'allowed_categories', jsonb_build_array(
      'home_and_living',
      'office_supplies',
      'pet_supplies',
      'fitness_accessories',
      'consumer_accessories'
    ),
    'blocked_categories', jsonb_build_array(
      'medical_devices',
      'hazardous_materials',
      'adult_products',
      'weapons',
      'regulated_supplements'
    )
  ),
  now(),
  true
)
on conflict (policy_name, policy_version) do update
set
  policy_type = excluded.policy_type,
  policy_payload_json = excluded.policy_payload_json,
  active_from = excluded.active_from,
  is_active = excluded.is_active;
