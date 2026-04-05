create or replace view exception_queue_view as
select
  e.exception_id,
  e.entity_type,
  e.entity_id,
  e.exception_category,
  e.severity,
  e.status,
  e.summary,
  e.details_json,
  e.created_at,
  e.resolved_at,
  extract(epoch from (now() - e.created_at))::bigint as age_seconds,
  case e.severity
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    else 1
  end as severity_rank
from exceptions e
where e.status in ('new', 'acknowledged', 'in_review');
