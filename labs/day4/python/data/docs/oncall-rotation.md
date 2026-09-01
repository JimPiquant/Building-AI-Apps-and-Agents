# Contoso Cloud Platform — On-Call Rotation

## Structure

Each service has a primary and a secondary on-call engineer. Rotations run
Wednesday 10:00 to Wednesday 10:00, one week per shift.

- **Primary** — takes the page, triages, assigns severity, drives resolution.
- **Secondary** — backstop if the primary does not acknowledge within
  10 minutes; also handles a second concurrent incident.
- **Engineering manager** — escalation point for missed response targets and
  the approving authority for out-of-window changes.

## Escalation path

1. Primary on-call (page)
2. Secondary on-call (after 10 minutes unacknowledged)
3. Engineering manager (after a further 30 minutes, or on any missed Sev1/Sev2
   first-response target — see `incident-severity.md`)
4. Director of Engineering (Sev1 exceeding 4 hours)

## Approval authority

The on-call **primary** may approve:

- Rolling back a deployment
- Scaling a service within its existing capacity envelope
- Enabling or disabling a feature flag

The **engineering manager** must approve:

- Any deployment during a change freeze (see `deployment-windows.md`)
- Any change that alters customer-visible data retention
- Any emergency access grant to production data

## Handoff

Outgoing on-call posts a written handoff covering open incidents, in-flight
changes, and anything expected to page during the next shift. Handoff is
required even when the shift was quiet.
