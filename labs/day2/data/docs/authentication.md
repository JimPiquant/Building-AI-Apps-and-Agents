# Authentication

The Contoso API uses bearer token authentication. Every request must include an
`Authorization: Bearer <token>` header. Requests without a valid token receive
a 401 response.

## Generating an API key

1. Sign in to the [Contoso developer portal](https://developer.contoso.example.com)
2. Navigate to **Settings → API Keys**
3. Click **Generate new key**
4. Copy the token and store it securely — it's shown only once

Keys do not expire automatically but can be revoked at any time.

## Key rotation

We recommend rotating keys every 90 days. Rotating is a two-step operation:

1. Generate a new key (both keys are valid during the overlap window)
2. Update your application to use the new key
3. Revoke the old key from the portal

## Common errors

- `401 unauthorized` — missing or malformed token
- `403 forbidden` — token is valid but lacks the scope required for the endpoint
- `500 internal server error` on `/auth/*` endpoints — indicates the authentication
  service is having issues. This is almost always a service-side problem. See
  [troubleshooting-login.md](troubleshooting-login.md).

## Scopes

API keys have one or more scopes:

- `read` — GET requests to public endpoints
- `write` — POST, PUT, PATCH, DELETE
- `admin` — user and billing management

The scope is set when the key is generated and cannot be changed later. Generate a
new key with the correct scope if you need to expand access.
