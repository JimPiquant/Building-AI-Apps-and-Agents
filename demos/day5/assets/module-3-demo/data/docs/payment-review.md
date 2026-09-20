# Payment Review

When an account's usage or payment history triggers automatic review, the account
is placed in `payment_review` status. This document explains what that means.

## Why an account enters payment review

- A single day of usage exceeds 10x the trailing 30-day average
- A payment method has failed 2+ times in the last 6 months
- Unusual patterns in the account's usage that our fraud system flags
- A manual flag from support

## What happens during review

- API access continues normally — the account is NOT suspended
- New invoices are generated but not auto-charged during the review window
- The review is normally resolved within 3 business days
- If the review requires customer input, we contact the account owner by email

## What customers should do

- Nothing, in most cases — review is automatic
- If you receive an email requesting information, respond within 5 business days
- If you're unsure why you're in review, open a support ticket with your account ID

## What "held" order status means

If you see order status = `held` with reason = `payment_review`, it means the
order (typically a plan change or a bulk quota purchase) is waiting for the
account review to resolve. It will process automatically once review clears.

You do not need to re-submit the order.
