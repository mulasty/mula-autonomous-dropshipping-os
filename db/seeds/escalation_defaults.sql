insert into policies (
  policy_name,
  policy_version,
  policy_type,
  policy_payload_json,
  active_from,
  is_active
)
values (
  'escalation_defaults',
  'v1',
  'operations',
  jsonb_build_object(
    'critical_exception_categories', jsonb_build_array(
      'publication_failure',
      'supplier_submission_failure',
      'legal_or_reputational_risk',
      'margin_guardrail_breach'
    ),
    'alert_channels', jsonb_build_array('telegram', 'email'),
    'support_high_risk_labels', jsonb_build_array(
      'complaint_high_risk',
      'refund_request',
      'legal_or_reputational_risk',
      'unclear'
    ),
    'supplier_failure_alert_threshold', 3
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
