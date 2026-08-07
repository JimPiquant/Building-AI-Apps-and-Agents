# Getting Started with Contoso API

Welcome to the Contoso API. This guide walks you through creating your first API call.

## Prerequisites

- A Contoso developer account (sign up at https://developer.contoso.example.com)
- A generated API key (see [authentication.md](authentication.md))
- Python 3.11+ or Node 20+

## Your first call

```bash
curl -H "Authorization: Bearer $CONTOSO_API_KEY" \
  https://api.contoso.example.com/v1/hello
```

You should get back a JSON payload with `{"message": "Hello, world"}` and a 200 status code.

## Next steps

- Review the [API reference](api-reference.md) for the full endpoint catalog
- Understand [rate limits](rate-limits.md) before you go to production
- Learn how [error codes](error-codes.md) are structured

## Support

For product questions, this documentation is the primary source. For account-specific
issues (billing, entitlements, usage), open a support ticket.
