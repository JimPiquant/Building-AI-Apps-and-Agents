# Rate Limits

The Contoso API enforces rate limits to protect infrastructure and ensure fair use.

## Standard limits

| Plan | Requests per minute | Burst |
|---|---|---|
| Free | 60 | 100 |
| Starter | 600 | 1,000 |
| Pro | 6,000 | 10,000 |
| Enterprise | Custom | Custom |

Limits are per API key. Multiple keys on the same account do not share a quota.

## Rate limit headers

Every response includes:

- `X-RateLimit-Limit` — your current plan's per-minute cap
- `X-RateLimit-Remaining` — how many requests you can still make this minute
- `X-RateLimit-Reset` — Unix timestamp when the window resets

## When you hit a limit

A `429 too many requests` response includes a `Retry-After` header (seconds).

We recommend exponential backoff starting at 1 second, doubling up to 32 seconds,
then failing.

## Requesting a limit increase

Enterprise customers can request custom limits by opening a support ticket. Include:

- Your account ID
- Current plan
- Peak requests per second observed
- Business justification

Turnaround is typically 2 business days.
