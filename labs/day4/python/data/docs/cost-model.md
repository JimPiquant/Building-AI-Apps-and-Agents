# Contoso Cloud Platform — Cost Model

## Billing units

Usage is billed on three meters:

- **Requests** — per 1,000 API requests
- **Compute seconds** — per 1,000 compute-seconds consumed by generated
  artifacts
- **Storage** — per GB-month of stored operational data and artifacts

Telemetry storage is not billed; it is included in the tier and governed by
`data-retention.md`.

## Included allowances and overage

| Tier | Included requests / month | Overage per 1,000 requests |
|---|---:|---:|
| Free | 10,000 | Not available — requests are rejected |
| Standard | 2,000,000 | $0.40 |
| Premium | 20,000,000 | $0.25 |

Overage is calculated at the end of the billing period on total requests
above the included allowance, rounded up to the nearest 1,000.

## Compute and storage

| Meter | Standard | Premium |
|---|---:|---:|
| Compute seconds (per 1,000) | $1.10 | $0.85 |
| Storage (per GB-month) | $0.12 | $0.09 |

## Billing period and disputes

The billing period is the calendar month in the subscription's registered
time zone. Invoices are issued within 5 business days of period close.
Billing disputes must be raised within 60 days of invoice date.

Note: this document covers usage charges only. Service-credit remedies tied
to the availability commitment are handled under the commercial agreement and
are not described in platform documentation.
