# Contoso Cloud Platform — Data Retention

Retention is governed by data class and service tier. Retention periods are
measured from the moment the record is written, not from account activity.

## Data classes

- **Operational data** — project configuration, user records, API keys.
- **Telemetry** — request logs, latency samples, error traces.
- **Generated artifacts** — model outputs, exports, rendered reports.

## Retention by tier

| Data class | Free | Standard | Premium |
|---|---|---|---|
| Operational data | 30 days after deletion | 90 days after deletion | 1 year after deletion |
| Telemetry | 7 days | 30 days | 90 days |
| Generated artifacts | 24 hours | 30 days | 180 days |

## Deletion

Deletion is a two-stage process:

1. **Soft delete** — the record is immediately unreadable through the API but
   still recoverable by support. The retention periods above apply to this
   stage.
2. **Purge** — at the end of the retention period the record is permanently
   destroyed and is not recoverable by anyone, including support.

A subscription downgrade does **not** retroactively shorten retention for
records already written. Records keep the retention period that applied at
write time.

Exceeding quota has no effect on retention. See `service-tiers.md`.
