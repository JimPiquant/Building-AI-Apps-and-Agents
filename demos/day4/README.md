# Day 4 Demonstrations

Live demos that punctuate the Day 4 lecture material. Same shape as the
[Day 1](../day1/README.md), [Day 2](../day2/README.md), and
[Day 3](../day3/README.md) demos — each demo has slide placement, time
budget, setup checklist, narration + step-by-step, expected result,
fallback story, and teaching payoff.

Every Day 4 demo grounds in an official `microsoft/agent-framework` SDK
sample where one exists, run as-is or with a clearly noted, minimal
adaptation. Two demos (Module 3's graph visualization) additionally copy
code directly from `labs/day4/python/` — specifically the worked
`solutions/` answers, not the student-facing stubs — into the demo's own
self-contained directory, so nothing here depends on importing across the
lab boundary.

## Roster

| Module | Demo | Title | Time | Placement |
|---|---|---|---|---|
| 1 | 1 | [Wrap a workflow, call it like any other agent](module-1-demo-1-workflow-as-agent.md) | ~4 min | after slide 9 · "Wrap a workflow as an agent" |
| 2 | 1 | [ConcurrentBuilder proves it, wall-clock](module-2-demo-1-concurrent-parallelism.md) | ~5 min | after slide 6 · "Concurrent in code" |
| 3 | 1 | [Visualize the graph you're about to build yourself](module-3-demo-1-visualize-graph.md) | ~5 min | after slide 6 · "Visualize the graph you just built" |
| 5 | 1 | [Trajectory, cost, and the eval → change → re-eval loop](module-5-demo-1-trajectory-and-cost.md) | ~4 min | after slide 9 · "The eval → change → re-eval loop" |
| 6 | 1 | [Bound the loop (Option A: predicate + max_iterations, no judge)](module-6-demo-1-bound-the-loop.md) | ~4 min | after slide 2 · "Infinite loops" |

## Shared environment

Every Day 4 demo runs against **the presenter's own Foundry project** used
for Days 1-3, plus:

- **`az login`** completed on the terminal, correct subscription selected
- **`gpt-5.6-luna`** deployed and reachable
- **`uv sync`** in `demos/day4/` — installs `agent-framework`,
  `agent-framework-orchestrations`, `agent-framework-foundry`,
  `azure-identity`, `python-dotenv`
- **A clean scratch dir** — all five demos run standalone scripts, no
  shared state between them

No Azure DevOps or other external service dependency for any of the five
authored demos — everything runs against the presenter's Foundry project
and, for Module 3's demo, a small bundled local docs corpus (copied from
the lab, no live knowledge base).

Additional per-demo prereqs are called out inside each demo file.

## Timing sanity check

The 5 authored demos total ~22 minutes against Day 4's ~220-minute core
lecture budget (Modules 1-6) — about 10% of lecture time, leaner than Day 3
(~20%) because Day 4's lab is now hands-on authoring rather than
read-and-run, so demos exist to preview mechanics the lab is about to
exercise, not to substitute for lab time.

## Recording as fallback

For each demo, do a **dry-run recording** (screen + audio) once and keep
it under `demos/day4/recordings/` (git-ignored — do not commit large
video files). If the live demo dies, pivot to the recording rather than
skipping the payoff entirely.

Recording naming: `moduleN-demoN-<slug>.mp4`.

## Authoring status

- [x] 1.1 Wrap a workflow, call it like any other agent
- [x] 2.1 ConcurrentBuilder proves it, wall-clock
- [x] 3.1 Visualize the graph you're about to build yourself
- [x] 5.1 Trajectory, cost, and the eval → change → re-eval loop
- [x] 6.1 Bound the loop (Option A: `AgentLoopMiddleware(predicate, max_iterations=N)`, no judge)
