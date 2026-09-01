# Contoso Cloud Platform — Incident Severity

Severity is assigned by the on-call engineer at the time of triage and can be
raised or lowered as understanding improves.

## Definitions and response targets

| Severity | Definition | First response | Update cadence |
|---|---|---|---|
| Sev1 | Complete outage of a customer-facing service, or confirmed data loss | 15 minutes | Every 30 minutes |
| Sev2 | Major degradation; a core workflow is unusable for a subset of customers | 30 minutes | Every 2 hours |
| Sev3 | Minor degradation with a viable workaround | 4 business hours | Daily |
| Sev4 | Cosmetic, documentation, or single-user issue | 2 business days | On resolution |

Response targets apply to **Premium** subscriptions. Standard subscriptions
receive Sev1 and Sev2 response during business hours only. Free subscriptions
have no response-time commitment (see `service-tiers.md`).

## Escalation

A Sev1 or Sev2 that misses its first-response target escalates automatically
to the secondary on-call, then to the engineering manager after a further
30 minutes. See `oncall-rotation.md`.

## Sustained rate limiting

Sustained HTTP 429 responses affecting a Premium subscription for more than
10 minutes is classified **Sev2** by default, because a core workflow is
unusable for that customer. The on-call engineer may lower it to Sev3 if the
customer's own traffic pattern is the cause and a documented workaround
exists — typically correcting the client's retry behavior as described in
`retry-policy.md`.
