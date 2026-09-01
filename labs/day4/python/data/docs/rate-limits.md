# Contoso Cloud Platform — Rate Limits

Rate limits are applied per subscription, per region, on a sliding one-minute
window. They are independent of the monthly request allowance described in
`service-tiers.md`.

## Limits by tier

| Tier | Requests per minute | Concurrent connections |
|---|---:|---:|
| Free | 60 | 4 |
| Standard | 1,200 | 64 |
| Premium | 12,000 | 512 |

## When a limit is exceeded

The platform returns **HTTP 429 Too Many Requests** with these headers:

- `Retry-After` — whole seconds to wait before retrying. Always present on
  a 429 response.
- `X-Contoso-RateLimit-Remaining` — requests left in the current window.
- `X-Contoso-RateLimit-Reset` — Unix timestamp when the window resets.

Clients **must** honor `Retry-After`. A client that ignores it and retries
immediately may be throttled at the edge for up to 15 minutes, which returns
HTTP 503 rather than 429 and does not include `Retry-After`.

## Burst allowance

Standard and Premium subscriptions may exceed the per-minute limit by up to
25% for a maximum of 10 seconds in any 5-minute period. Burst capacity is
best-effort and is not covered by the SLA.
