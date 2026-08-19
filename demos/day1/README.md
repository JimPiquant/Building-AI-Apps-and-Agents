# Day 1 Demonstrations

Live demos that punctuate the Day 1 lecture material. Same shape as the
[Day 2 demos](../day2/README.md) — each demo has slide placement, time
budget, setup checklist, narration + step-by-step, expected result,
fallback story, and teaching payoff.

## Roster

| Module | Demo | Title | Time | Placement |
|---|---|---|---|---|
| 1 | 2 | [What an agent adds — live diff](module-1-demo-2-agent-diff.md) | ~4 min | after slide 4 · "What an agent adds" |
| 2 | 1 | [Create a Foundry project, live](module-2-demo-1-create-project.md) | ~5 min | after slide 3 · "Foundry resource architecture" |
| 3 | 2 | [Tool vs. context provider — which fires when?](module-3-demo-2-tool-vs-provider.md) | ~4 min | after slide 8 · "The context lifecycle" |
| 4 | 1 | [The 6-line agent](module-4-demo-1-six-line-agent.md) | ~3 min | after slide 4 · "The simplest possible Python agent" |

## Shared environment

Every Day 1 demo runs against the **same Foundry project** the presenter uses
in the labs, plus:

- **`az login`** completed and the correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** in a shell env var (not in `.env` since some
  demos deliberately show pre-`.env` setup)
- **`gpt-5.6-luna`** deployed and reachable
- **Foundry portal** open in a browser tab pointed at the project
- **A clean scratch dir** for demos that live-type code (Module 1 demo 2,
  Module 3 demo 2, Module 4 demo 1)

Additional per-demo prereqs are called out inside each demo file.

## Timing budget

Combined runtime for the 4 demos: **~16 minutes**. Day 1 has a
~4-hour lecture budget across 7 modules. Demos land at ~7% of lecture
time — well within the "punctuation, not filler" bar.

## Recording as fallback

For each demo, do a **dry-run recording** (screen + audio) once and keep it
under `demos/day1/recordings/` (git-ignored — do not commit large video
files). If a live demo dies, pivot to the recording rather than skipping
the payoff entirely.

Recording naming: `moduleN-demoN-<slug>.mp4`.

## Authoring status

- [x] 1.2 What an agent adds — live diff
- [x] 2.1 Create a Foundry project, live
- [x] 3.2 Tool vs. context provider — which fires when?
- [x] 4.1 The 6-line agent
