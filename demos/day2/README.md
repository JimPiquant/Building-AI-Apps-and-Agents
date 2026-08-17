# Day 2 Demonstrations

10 demos across the 8 Day 2 modules. Every one reinforces a specific slide
beat and lands in ~2–7 minutes.

## Roster

| Module | Demo | Title | Time | Placement |
|---|---|---|---|---|
| 1 | 1 | [Attach an IQ knowledge source, portal-first](module-1-demo-1-iq-attach-portal.md) | ~4 min | after the *"three building blocks"* slide |
| 1 | 2 | [Query planning in slow motion](module-1-demo-2-query-planning-trace.md) | ~5 min | after the *"unified ranking pipeline"* slide |
| 2 | 1 | [Same query, three retrieval strategies side by side](module-2-demo-1-three-strategies.md) | ~5 min | *(Batch 2)* |
| 2 | 2 | [The 20-line hand-rolled RAG](module-2-demo-2-20-line-rag.md) | ~6 min | *(Batch 2)* |
| 3 | 1 | [Score two agents live](module-3-demo-1-score-two-agents.md) | ~4 min | after the *"two must-know evaluators"* slide |
| 4 | 1 | [Function tool round-trip in the debugger](module-4-demo-1-debugger-round-trip.md) | ~5 min | *(Batch 2)* |
| 5 | 1 | [Attach a hosted toolbox in 30 seconds](module-5-demo-1-attach-toolbox.md) | ~3 min | after the *"why hosted tools"* slide |
| 6 | 1 | [Bare function → @tool → schema refactor](module-6-demo-1-tool-refactor.md) | ~7 min | *(Batch 2)* |
| 7 | 1 | [Retrieve-then-act with a trace](module-7-demo-1-retrieve-then-act-trace.md) | ~5 min | after the *retrieve-then-act pattern* slide |
| 8 | 1 | [Whole lab in 90 seconds](module-8-demo-1-lab-speedrun.md) | ~2 min | after the *three parts* slide |

## Shared environment

Every Day 2 demo runs against **the same Foundry project** the presenter used
to build the Day 1 lab, plus the following pre-baked assets:

- **A Foundry IQ knowledge source** loaded with the Day 2 lab's docs corpus
  (`labs/day2/python/data/docs/*.md`) — created with `create_iq_source.py`
- **A working docs-assistant agent** with IQ attached (grounded agent from
  Part A of the lab)
- **A second docs-assistant agent WITHOUT IQ** (a plain
  `ChatAgent(instructions=...)`) for comparison demos
- **Foundry portal open** in a browser tab, pointed at your project
- **`az login`** completed on the terminal for CLI-based demos
- **The Day 2 lab repo (`labs/day2/python/`)** cloned and `uv sync`'d

Additional per-demo prereqs are called out inside each demo file.

## Timing sanity check

If you run every Day 2 demo at full time budget, that's ~46 minutes. Day 2 has
a 240-minute lecture budget. Demos as designed consume ~19% of lecture time —
well within the "punctuation, not filler" bar.

## Recording as fallback

For each demo you author, do a **dry-run recording** (screen + audio) once and
keep it under `demos/day2/recordings/` (git-ignored — do not commit large
video files). If the live demo dies, you can pivot to the recording rather
than skipping the payoff entirely.

Recording naming: `moduleN-demoN-<slug>.mp4`.

## Authoring status

- **Batch 1 (narrative-forward, no new code):** ✅ 1.1, 1.2, 3.1, 5.1, 7.1, 8.1
- **Batch 2 (code-heavy):** ⏳ 2.1, 2.2, 4.1, 6.1
