# Day 3 Demonstrations

9 demos across 7 of the core Day 3 modules. Same shape as the
[Day 1](../day1/README.md) and [Day 2](../day2/README.md) demos — each demo
has slide placement, time budget, setup checklist, narration + step-by-step,
expected result, fallback story, and teaching payoff. Module 8 (OPTIONAL —
Agent Harness + GitHub Copilot Agent) and Module 9 (Day 3 Lab Kickoff) have
no demo: Module 8 is an awareness/comparison segment outside the
215-minute core, and Module 9 — like Day 1's and Day 2's Lab Kickoff
modules — frames upcoming work rather than demonstrating a runnable
scenario.

Every demo grounds in an official `microsoft/agent-framework` SDK sample
where one exists, run as-is or with a clearly noted, minimal adaptation.
Where no matching sample exists in the repo, the demo grounds directly in
the Learn doc the corresponding module slide already cites — flagged
explicitly in each runbook's opening section.

Placeholder marker slides for all 9 demos are already in the decks
(`decks/day3/*.pptx`), generated from a new `layout: demo` block in
`slides/day3/module-N-*.md` — same visually distinct "DEMO" interstitial
component (`T.demoSlide`) that Day 1 and Day 2 use, plus Day 3's own
per-slide grounding-source footer.

## Roster

| Module | Demo | Title | Time | Placement |
|---|---|---|---|---|
| 1 | 1 | [Serialize, kill the process, restore the session](module-1-demo-1-serialize-restore.md) | ~5 min | after slide 3 · "The lifecycle is explicit" |
| 2 | 1 | [Watch it stream, then get the typed TriageResult](module-2-demo-1-stream-then-triage.md) | ~5 min | after slide 9 · "Combine streaming and structure" |
| 3 | 1 | [SlidingWindowStrategy pruning old messages, live](module-3-demo-1-sliding-window.md) | ~4 min | after slide 5 · "Grounded Python: keep recent groups" |
| 4 | 1 | [The onion, printed](module-4-demo-1-onion-order.md) | ~5 min | after slide 3 · "Middleware executes like an onion" |
| 4 | 2 | [Guardrail blocks a request, live](module-4-demo-2-guardrail-termination.md) | ~4 min | after slide 8 · "Termination has an explicit result" |
| 5 | 1 | [Local stdio MCP tool call, end to end](module-5-demo-1-stdio-mcp.md) | ~5 min | after slide 4 · "Local stdio is a child-process boundary" |
| 5 | 2 | [approval_mode pauses a write tool for review](module-5-demo-2-approval-mode.md) | ~5 min | after slide 8 · "approval_mode creates a human boundary" |
| 6 | 1 | [Read-only ADO MCP in action](module-6-demo-1-read-only-ado.md) | ~5 min | after slide 7 · "Read-only is a server-side filter" |
| 7 | 1 | [evaluate_agent catches a wrong tool call](module-7-demo-1-eval-catches-wrong-tool.md) | ~5 min | after slide 4 · "Check tool name and arguments locally" |

Not authored in this batch (deferred, tracked for a future pass if more
demo time budget is wanted): Module 1 demo on duplicate history loaders,
Module 2 demo on partial-JSON parsing, Module 6 demo on the full
read→approve→write→verify sequence.

## Shared environment

Every Day 3 demo runs against **the presenter's own Foundry project** used
for Day 1/2, plus:

- **The Day 2 lab repo (`labs/day2/python/`)** cloned and `uv sync`'d — the
  streaming/structured-output demo extends the Day 2 docs assistant with a
  `TriageResult`
- **`az login`** completed on the terminal, correct subscription selected
- **`gpt-5.6-luna`** deployed and reachable
- **`uv` / `uvx`** available — several demos launch a local MCP server via
  `uvx mcp-server-calculator`
- **A clean scratch dir** for demos that run standalone scripts (Modules 1, 2, 3, 4, 5, 7)

Module 6's demo additionally requires the **presenter's own** Azure DevOps
Services organization (Entra-backed, not an MSA org) with a disposable
project and a known work-item ID — see that demo's setup checklist for the
exact environment variables to substitute. This is a personal instance, not
a shared Publix sandbox.

Additional per-demo prereqs are called out inside each demo file.

## Timing sanity check

The 9 authored demos total ~42 minutes against Day 3's 210-minute core
lecture budget — about 20% of lecture time, in the same range as Day 2
(~19%). Module 4 and Module 5 each carry two demos (~9–10 min each module);
if time is tight in dry-run, Module 4 demo 2 (guardrail termination) or
Module 5 demo 2 (approval_mode) are the first candidates to cut, since
their concepts are also covered narratively on the slide immediately
before them.

## Recording as fallback

For each demo, do a **dry-run recording** (screen + audio) once and
keep it under `demos/day3/recordings/` (git-ignored — do not commit large
video files). If the live demo dies, pivot to the recording rather than
skipping the payoff entirely.

Recording naming: `moduleN-demoN-<slug>.mp4`.

## Authoring status

- [x] 1.1 Serialize, kill the process, restore the session
- [x] 2.1 Watch it stream, then get the typed TriageResult
- [x] 3.1 SlidingWindowStrategy pruning old messages, live
- [x] 4.1 The onion, printed
- [x] 4.2 Guardrail blocks a request, live
- [x] 5.1 Local stdio MCP tool call, end to end
- [x] 5.2 approval_mode pauses a write tool for review
- [x] 6.1 Read-only ADO MCP in action
- [x] 7.1 evaluate_agent catches a wrong tool call
- [ ] 1.2 Duplicate history loaders (deferred)
- [ ] 2.2 Partial JSON isn't parseable mid-stream (deferred)
- [ ] 6.2 Read → propose → approve → write → verify (deferred)

