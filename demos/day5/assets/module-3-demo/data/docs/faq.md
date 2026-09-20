# FAQ

## What SDKs do you support?

Official SDKs are available for Python (3.11+), Node (20+), .NET (8+), and Go (1.22+).
Install with your language's package manager — search for `contoso-api`.

Community SDKs exist for Ruby and Rust but are not supported by Contoso staff.

## Is there a sandbox environment?

Yes. Point your client at `https://sandbox.contoso.example.com/v1` instead of the
production URL. Sandbox has separate API keys and does not affect production data
or billing.

## How do I test webhooks locally?

Use a tunnel like `ngrok` or `cloudflared` to expose your local endpoint. Configure
the tunnel URL in the developer portal → Webhooks. Deliveries are retried up to 5
times over 24 hours if your endpoint doesn't return 2xx.

## What data do you store?

- Request metadata for 90 days (for billing and debugging)
- Request/response bodies only if you opt in
- No PII fields unless you explicitly send them

See our [privacy policy](https://contoso.example.com/privacy) for the full data
retention schedule.

## Can I export my data?

Yes. Owners can trigger an export from **Settings → Data Export**. Exports take up
to 24 hours and are delivered as a signed download URL that expires in 7 days.

## Do you support GDPR / SOC 2 / HIPAA?

- GDPR: yes, we're compliant
- SOC 2 Type II: yes, annual audit
- HIPAA: available on Enterprise plans only, requires a signed BAA
