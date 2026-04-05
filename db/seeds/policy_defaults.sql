insert into policies (
  policy_name,
  policy_version,
  policy_type,
  policy_payload_json,
  active_from,
  is_active
)
values
  (
    'rules_engine_policy',
    'starter-policy-v1',
    'rules_engine',
    jsonb_build_object(
      'policy_version', 'starter-policy-v1',
      'rules_version', 'rules-engine-v1',
      'minimum_net_margin', 0.18,
      'review_warning_band_upper', 0.24,
      'minimum_absolute_profit_amount', 20.00,
      'minimum_supplier_trust_score', 60.00,
      'supplier_trust_review_threshold', 75.00,
      'maximum_shipping_time_days', 5,
      'minimum_data_quality_score', 60.00,
      'minimum_image_count', 3,
      'minimum_stock_quantity', 1,
      'minimum_category_mapping_confidence', 0.80,
      'allowed_categories', jsonb_build_array(),
      'banned_categories', jsonb_build_array(),
      'allow_missing_fee_model_review', false,
      'allow_missing_shipping_estimate_review', false
    ),
    now(),
    true
  ),
  (
    'pricing_guardrails',
    'v1',
    'pricing',
    jsonb_build_object(
      'minimum_net_margin', 25.00,
      'warning_band_above_minimum', 5.00,
      'max_percent_price_movement_per_sync', 15.00,
      'pause_on_uncertain_cost', true
    ),
    now(),
    true
  ),
  (
    'order_routing_guardrails',
    'v1',
    'operations',
    jsonb_build_object(
      'payment_required_statuses', jsonb_build_array('authorized', 'paid'),
      'block_on_missing_supplier_sku', true,
      'block_on_blocked_product', true,
      'missing_tracking_sla_hours', 72
    ),
    now(),
    true
  ),
  (
    'support_automation_guardrails',
    'v1',
    'support',
    jsonb_build_object(
      'default_mode', 'draft_or_send_low_risk_only',
      'auto_send_allowed_labels', jsonb_build_array('order_status', 'shipping_delay', 'pre_sale_question'),
      'escalate_on_low_confidence_below', 70.00
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
