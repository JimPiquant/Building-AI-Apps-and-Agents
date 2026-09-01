# Module 2 · Demo 1 — ConcurrentBuilder proves it, wall-clock

**Placement:** After **slide 6 — "Concurrent in code"** (Module 2).

**Time:** ~5 min total (30s framing + 2 min concurrent run + 90s sequential
comparison + 30s payoff)

**Language:** Python (MAF SDK). Grounded in the official
[`concurrent_agents.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/03-workflows/orchestrations/concurrent_agents.py)
sample — the same researcher/marketer/legal domain agents and eBike prompt
the previous slide's own code snippet is drawn from. Two clearly-noted
adaptations: shorter instructions (2-3 sentences per agent, for a
time-boxed live demo instead of the sample's long-form output) and a
timing middleware + sequential comparison, neither of which the official
sample needs since it isn't trying to prove parallelism live.

## What it shows

The previous slide's code built a `ConcurrentBuilder` workflow and printed
three agents' responses one after another — which LOOKS sequential on the
page, even though the slide's own notes claim they ran in parallel. This
demo doesn't ask you to take that on faith.

**Part 1** runs the three domain agents through `ConcurrentBuilder`, with
a small `AgentMiddleware` timing each agent's own start/finish offset
against a shared clock, and prints a crude ASCII timeline bar so the
overlap is visible, not just implied by a log line.

**Part 2** runs the SAME three agents on the SAME prompt, one at a time —
no `ConcurrentBuilder`, just three plain `await agent.run(...)` calls in a
row.

Compare the two "total wall-clock time" numbers: concurrent should land
close to what ONE agent alone takes; sequential should land close to the
SUM of all three. That gap is the proof.

**What this demo is NOT:** it does not use OpenTelemetry span tooling
(Day 3's observability content, or Module 3's `edge_group.delivery_status`)
to show the overlap — that's a real, more rigorous way to see it, but adds
setup this demo doesn't need. This demo's proof is simpler and self-
contained: elapsed time and a printed timeline.

## Setup checklist

Do this **before the module starts**:

- **Script staged** in
  `demos/day4/module-2-demo-1-concurrent-parallelism/concurrent_with_timing.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in `demos/day4/.env`)
- **`uv sync`** in `demos/day4/`
- **Dry-run once**, and note your own actual timings — the narration below
  assumes concurrent ≈ one agent's time and sequential ≈ 3× that, but
  your real numbers (network latency, model load) may differ. Adjust the
  specific numbers you say aloud to match your dry run, not this
  runbook's illustrative wording.

## Narration + steps

**Opening (30s):**
"The slide's code looked like three agents ran one after another — same
as reading down a page. Let's actually time it and find out."

**Step 1 — Run the concurrent part (~2 min)**

```bash
uv run python concurrent_with_timing.py
```

Let Part 1 print. Point at the START/FINISH timestamps as they appear —
call out that researcher, marketer, and legal all show START at
roughly the same offset, not one after another.

**Say:** *"Watch the timestamps as they print — three START lines, close
together, before any FINISH line shows up. That's not three agents taking
turns; that's three agents running at the same time."*

When the ASCII timeline bar prints, point at the overlapping bars.

**Say:** *"Same picture, drawn out: three bars, overlapping, not stacked
end to end."*

**Step 2 — Let Part 2 run (~90s)**

Let the sequential comparison finish and read both "total wall-clock
time" lines aloud.

**Say:** *"Concurrent finished in about [your dry-run number] — close to
what ONE of these agents takes alone. Sequential took about [your dry-run
number] — close to three times that. Same three agents, same prompt, same
model. The only thing that changed is whether `ConcurrentBuilder` fanned
them out at once, or a plain loop ran them one at a time."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is why the strengths-and-weaknesses table two slides from
now says Concurrent's cost driver is 'the slowest agent, not the sum' —
you just watched why that's true. And it's why Module 3's superstep model
matters: 'execute all target executors concurrently within this
superstep' isn't a slide bullet, it's the mechanism that just ran live."*

## Expected result

- Part 1 prints three START lines close together, then three FINISH
  lines, then a timeline bar showing visible overlap
- Part 1's total wall-clock time is close to a single agent's own
  response time
- Part 2's total wall-clock time is noticeably longer — roughly the sum
  of the three individual agent times
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Network/model latency varies enough between dry run and live run that
  the exact numbers differ — the RATIO (concurrent ≈ 1×, sequential ≈ 3×)
  is what matters, not a specific second count
- A slow individual model response makes the "close together" START
  lines look less crisp than in your dry run

Have these ready:
1. **Screenshot of Part 1's START/FINISH timestamps and timeline bar**
2. **Screenshot of both "total wall-clock time" lines** from your dry run

Story: *"This is what a clean run looked like in my dry run — concurrent
close to one agent's time, sequential close to three times that. The
mechanism is the same regardless of the exact numbers you'd see live."*

Then advance the slide.

## Teaching payoff

*"`ConcurrentBuilder` isn't a nicer way to print three sequential results
together — it's a real fan-out, and the wall-clock proves it. That's the
concrete version of what Module 3 calls a superstep: gather, dispatch, and
execute every target executor at the same time, then wait for all of them
before moving on."*

## Reference

- [`concurrent_agents.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/03-workflows/orchestrations/concurrent_agents.py) — the official sample this demo's agents, instructions, and prompt are grounded in
- [Concurrent orchestration (Python)](https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/concurrent) — concept grounding
- Module 2 slide 6 ("Concurrent in code") — the code this demo proves live
- Module 3's superstep execution model — the mechanism behind the overlap this demo times
