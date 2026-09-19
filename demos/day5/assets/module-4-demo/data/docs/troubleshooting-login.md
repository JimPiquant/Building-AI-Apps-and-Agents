# Troubleshooting Login Failures

If your calls to the Contoso API are failing to authenticate, work through this
checklist before opening a support ticket.

## Symptom: 401 unauthorized on every request

Most likely causes:

1. **Missing header.** The `Authorization: Bearer <token>` header must be present
   on every call.
2. **Malformed token.** The token must be the full string from the developer portal.
   No quotes, no `Bearer` prefix in the token itself (that goes in the header).
3. **Revoked token.** Check the developer portal → API Keys. Revoked keys are marked.
4. **Environment mismatch.** Production tokens do not work against the staging
   endpoint (and vice versa).

## Symptom: 403 forbidden on some requests

This means the token is valid but lacks the required scope. See
[authentication.md](authentication.md) for how scopes work.

## Symptom: 500 internal server error on POST /login or GET /auth/*

**This is almost always a service-side problem, not a client-side problem.** The
authentication service is having issues. What to do:

1. Check the [Contoso status page](https://status.contoso.example.com)
2. If the status page shows an incident, wait for it to resolve
3. If the status page shows all-green but you're still seeing 500s, **file a
   high-priority support ticket** with your correlation ID (from response headers)
4. Do NOT keep retrying — you'll just add load. Fall back to cached data if possible.

## Symptom: intermittent 401s

- Check the system clock on the client — token validation checks timestamps and a
  drifting clock can cause silent failures
- Check whether you're rotating keys and using the old key by mistake
