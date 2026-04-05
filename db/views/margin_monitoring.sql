create or replace view margin_monitoring_view as
with latest_rule_decision as (
  select distinct on (product_id)
    product_id,
    decision_status,
    projected_net_margin,
    projected_gross_margin,
    reason_codes_json,
    risk_flags_json,
    decided_at
  from product_rule_decisions
  order by product_id, decided_at desc
)
select
  p.product_id,
  p.internal_sku,
  p.supplier_sku,
  s.supplier_name,
  p.category_normalized,
  p.cost_net,
  p.cost_gross,
  l.listing_id,
  l.channel,
  l.listing_status,
  l.current_price,
  d.decision_status,
  d.projected_net_margin,
  d.projected_gross_margin,
  d.reason_codes_json,
  d.risk_flags_json,
  d.decided_at as last_rules_decided_at
from products_normalized p
join suppliers s on s.supplier_id = p.supplier_id
left join listings l on l.product_id = p.product_id
left join latest_rule_decision d on d.product_id = p.product_id;
