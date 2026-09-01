# Contoso Cloud Platform — Client Retry Policy

This is the retry behavior the platform expects from client applications.
Client SDKs published by Contoso implement it by default.

## Which responses are retryable

| Status | Retryable | Notes |
|---|---|---|
| 408 Request Timeout | Yes | Retry with a fresh idempotency key |
| 429 Too Many Requests | Yes | Honor `Retry-After` (see `rate-limits.md`) |
| 500, 502, 503, 504 | Yes | Transient server-side failures |
| 400, 401, 403, 404, 409, 422 | **No** | Retrying will not change the outcome |

## Backoff

Use exponential backoff with full jitter:

    delay = random(0, min(cap, base * 2 ** attempt))

- `base` = 200 milliseconds
- `cap` = 20 seconds
- **Maximum 5 attempts**, including the original request

When a `Retry-After` header is present, it overrides the computed delay.
Never retry sooner than `Retry-After` indicates.

## Idempotency

All write operations accept an `Idempotency-Key` header. Retries of a write
**must** reuse the key from the original attempt. Without it, a retry can
duplicate the write. Keys are honored for 24 hours.

## What not to do

- Do not retry non-retryable status codes.
- Do not retry without backoff — this is the most common cause of edge
  throttling.
- Do not exceed 5 attempts. Surface the failure to the caller instead.
