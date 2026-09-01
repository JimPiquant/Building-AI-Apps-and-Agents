# Contoso Cloud Platform — Deployment Windows

## Standard windows

Production deployments are permitted:

- Monday through Thursday, 09:00–16:00 in the target region's local time
- Never on Friday, weekends, or public holidays in the target region

Deployments outside these hours require engineering manager approval
(see `oncall-rotation.md`).

## Change freeze

An annual change freeze runs from **15 December through 2 January**. During
the freeze, no production deployment may proceed except:

- **Sev1 or Sev2 incident mitigation** — permitted at any hour, and requires
  engineering manager approval before the change is applied. The approval may
  be given verbally during the incident and recorded in the incident log
  afterwards.
- **Security patches rated Critical** — permitted with the same approval path.

A hotfix that does not mitigate an active Sev1/Sev2 and is not a Critical
security patch waits until the freeze ends. There is no exception path for
feature work, dependency upgrades, or performance improvements.

## Regional considerations

Each region observes its own local time and public holiday calendar. A change
that is in-window for East may be out-of-window for West on the same day.
Deploy region by region; never deploy to all regions simultaneously.

## Rollback

Every deployment must have a tested rollback path that completes in under
10 minutes. The on-call primary may trigger a rollback without further
approval.
