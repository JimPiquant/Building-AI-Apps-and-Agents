# Billing

Contoso bills monthly for API usage above your plan's included quota.

## Billing cycle

- Statements generate on the 1st of each month for the prior month's usage
- Invoices are due within 30 days
- Payment methods on file are automatically charged 5 business days before due date

## Included quota by plan

| Plan | Included requests/month | Overage rate |
|---|---|---|
| Free | 100,000 | Not available (hard cap) |
| Starter | 5,000,000 | $0.10 per 1,000 requests |
| Pro | 50,000,000 | $0.05 per 1,000 requests |
| Enterprise | Custom | Contract |

## Prorated upgrades

Upgrading takes effect immediately. You're charged a prorated amount for the
remainder of the current cycle at the new plan's daily rate.

## Downgrades

Downgrades take effect at the start of the next billing cycle. Your current cycle
is billed at the higher rate.

## Reviewing charges

Statements show a per-day usage breakdown. Any single day that exceeds 10x the
average of the prior 30 days is flagged for automatic review — see
[payment-review.md](payment-review.md).

## Payment failures

If a payment fails:

1. We retry the payment method after 3 days
2. If that fails, we email the account owner and admins
3. After 14 days without a successful payment, the account is downgraded to Free tier
4. After 30 days without a successful payment, the account is suspended
