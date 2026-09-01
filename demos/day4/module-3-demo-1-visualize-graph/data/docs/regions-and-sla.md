# Contoso Cloud Platform — Regions and Availability SLA

## Regions

| Region | Code | Failover partner |
|---|---|---|
| East | `us-east-1` | West |
| West | `us-west-2` | East |
| Europe | `eu-west-1` | Europe North |
| Europe North | `eu-north-1` | Europe |

Free-tier subscriptions are pinned to a single region and have no failover
partner.

## Availability SLA

The monthly availability commitment applies to Standard and Premium
subscriptions only (see `service-tiers.md`).

| Tier | Monthly availability commitment |
|---|---|
| Standard | 99.5% |
| Premium | 99.9% |

Availability is measured per region, per calendar month, as the percentage of
one-minute intervals in which the regional API endpoint returned a non-5xx
response to a synthetic probe.

## Exclusions

The following do not count against the availability commitment:

- Burst capacity beyond the documented per-minute rate limit
  (see `rate-limits.md`)
- Scheduled maintenance announced at least 72 hours in advance
- Client-side failures, including HTTP 429 caused by the subscription's own
  traffic exceeding its rate limit
- Failures in a customer's own network path to the regional endpoint

## Failover

Premium subscriptions fail over automatically to the partner region when a
region is unavailable for more than 5 consecutive minutes. Failover is
one-way and requires a manual failback once the primary region is healthy.
Standard subscriptions do not fail over automatically.
