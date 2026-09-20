# Error Codes

The Contoso API returns structured errors. Every non-2xx response includes a JSON
body with `code`, `message`, and (optionally) `details`.

## HTTP status categories

- **4xx** — client-side errors. Retrying without changing the request will not help.
- **5xx** — server-side errors. Retry with exponential backoff.

## Common error codes

| HTTP | Code | Meaning | Action |
|---|---|---|---|
| 400 | `invalid_argument` | Malformed request body | Fix the request payload |
| 401 | `unauthenticated` | Missing or invalid token | Check the `Authorization` header |
| 403 | `permission_denied` | Token lacks required scope | Generate a key with the correct scope |
| 404 | `not_found` | Resource does not exist | Verify the ID |
| 409 | `conflict` | Resource state conflict | Refetch and retry |
| 429 | `rate_limited` | Rate limit exceeded | Backoff and retry |
| 500 | `internal_error` | Server-side error | Retry with backoff; open a ticket if persistent |
| 503 | `service_unavailable` | Downstream dependency down | Retry with backoff |

## Retry strategy

- Never retry 4xx errors except 429
- Always retry 5xx errors with exponential backoff (start 1s, double up to 32s)
- After 5 failed retries on the same request, surface the error to the user

## Correlation IDs

Every error response includes `X-Correlation-Id` in the headers. Include this when
opening a support ticket — it lets us find the failure in our logs immediately.
