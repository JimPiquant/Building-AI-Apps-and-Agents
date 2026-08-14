# API Reference

The Contoso API is a REST API. All endpoints are versioned under `/v1`.

Base URL: `https://api.contoso.example.com/v1`

## Endpoint catalog

### Public

- `GET /hello` — smoke test, no auth required
- `GET /status` — health check

### Authenticated

- `GET /account` — returns the account associated with the API key
- `GET /account/usage` — current month's usage counters
- `GET /orders` — list orders on the account
- `GET /orders/{id}` — get a single order (returns `status`, `reason`, `created_at`)
- `POST /orders` — create an order (plan change, quota purchase)

### Tickets

- `GET /tickets/{id}` — get a support ticket by ID
- `POST /tickets` — create a support ticket

## Request format

- JSON body, `Content-Type: application/json`
- Timestamps in ISO 8601 UTC
- IDs are opaque strings (do not parse)

## Response format

Success: `2xx` with a JSON body describing the resource.

Failure: non-2xx with a JSON body containing `code`, `message`, and (optionally)
`details`. See [error-codes.md](error-codes.md).

## Pagination

List endpoints support:

- `limit` — 1 to 100, default 25
- `cursor` — opaque cursor from the previous response's `next_cursor`

Responses include `data` (array) and `next_cursor` (string or null).
