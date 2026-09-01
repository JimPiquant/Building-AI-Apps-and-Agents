# Contoso Cloud Platform — Service Tiers

The platform offers three service tiers. Tier determines quota, support
response, and data handling. Tier is set per subscription and can be changed
once per billing period.

## Free

- 10,000 API requests per month
- 1 project, 2 seats
- Community support only; no response-time commitment
- Not eligible for the availability SLA

## Standard

- 2,000,000 API requests per month
- 25 projects, 100 seats
- Business-hours support (09:00–17:00 local, Mon–Fri)
- Covered by the availability SLA (see `regions-and-sla.md`)

## Premium

- 20,000,000 API requests per month
- Unlimited projects, unlimited seats
- 24x7 support with severity-based response targets
  (see `incident-severity.md`)
- Covered by the availability SLA, with regional failover included

## Quota behavior

When a subscription exceeds its monthly request allowance:

- **Free** — requests are rejected with HTTP 429 for the remainder of the
  billing period. No overage billing is available.
- **Standard** and **Premium** — requests continue to be served and the
  excess is billed as overage (see `cost-model.md`). Sustained overage of
  more than 200% of the tier allowance for two consecutive billing periods
  triggers a mandatory tier review.

Exceeding quota never deletes or truncates stored data. Retention is
governed solely by `data-retention.md`.
