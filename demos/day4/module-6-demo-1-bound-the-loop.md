# Module 6 · Demo 1 — Bound the loop (Option A: predicate + max_iterations, no judge)

**Placement:** After **slide 2 — "Infinite loops"** (Module 6), before the
"Bounding a workflow-level loop" slide.

**Time:** ~4 min total (30s framing + 60s BOUNDED run + 60s RUNAWAY run + 30s
payoff)

**Language:** Python (MAF SDK). Adapted from the official
`microsoft/agent-framework` SDK sample
`python/samples/02-agents/middleware/agent_loop_middleware_refinement.py` —
same agent, same `should_continue` / `record_feedback` / `fresh_context`
mechanics, same streamed user/assistant printing. This is **Option A**: a
plain `AgentLoopMiddleware(predicate, max_iterations=N)`. No judge model,
no second chat client, no structured-output verdict — that's
`AgentLoopMiddleware.with_judge(...)`, a heavier variant intentionally left
out of Day 4's authored demos for now.

## What it shows

A single agent (`refiner`) is asked to suggest a name for a note-taking
app and told to end its message with an exact completion marker,
`<promise>COMPLETE</promise>`, once it's confident the name is final. The
SAME agent and SAME instructions run through **two different
`should_continue` predicates**, back to back:

- **BOUNDED** — the predicate checks for the marker the agent was
  actually told to emit. The loop is expected to stop **on its own**,
  under the `max_iterations=5` cap.
- **RUNAWAY** — the predicate checks for `<promise>COMPLETED</promise>`
  — a one-word typo (`COMPLETED` vs `COMPLETE`) that can never appear
  verbatim in the agent's text. This is a real bug shape: the developer
  wrote the predicate against a slightly different string than the one
  in the agent's own instructions, so `should_continue` can **never**
  return `False` on its own. `max_iterations=3` is the *only* thing that
  stops this case.

That second case is this module's own slide, reproduced as code — the
framework's warning, quoted verbatim on the slide: *"Always bound
autonomous loops. A completion condition can fail, a model can stall,
and an evaluator can be probabilistic."* RUNAWAY is exactly "a completion
condition can fail," and the demo's whole point is that the agent never
notices anything is wrong — it happily emits its correct marker every
time — the bug is entirely in the code checking for it.

**What makes this reliable to run live:** unlike a live-model judgment
call, whether RUNAWAY hits the cap is guaranteed by construction — the
string `should_continue` checks for literally cannot appear, regardless
of what the model says. Only BOUNDED's iteration *count* (how many
passes before it stops) is genuinely model-dependent.

**What this demo is NOT:** it does not use `AgentLoopMiddleware.with_judge`,
does not compose two loop middleware, and does not use a `TodoProvider` —
all real, more advanced patterns shown in the SDK's other
`agent_loop_middleware_*` samples, but out of scope for a first,
straightforward look at the primitive.

## Setup checklist

Do this **before the module starts**:

- **Script staged** in
  `demos/day4/module-6-demo-1-bound-the-loop/bound_the_loop.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in `demos/day4/.env`)
- **`uv sync`** in `demos/day4/`
- **Dry-run once.** RUNAWAY hitting the cap is guaranteed (see above);
  the only thing to confirm live is that BOUNDED completes in a small,
  readable number of iterations (1–3) so the contrast reads clearly.

## Narration + steps

**Opening (30s):**
"The last slide named the risk and quoted the framework directly: a
completion condition can fail. Here's exactly what that looks like in
code, and what catches it."

**Step 1 — Run the BOUNDED case (~60s)**

```bash
uv run python bound_the_loop.py
```

Let the BOUNDED section stream. Point at the `user:` nudge lines
appearing between iterations.

**Say:** *"That's `AgentLoopMiddleware` re-invoking the same agent —
each `user:` line is the loop's own injected nudge, built from
`next_message` and the progress log. `should_continue` is one function:
does the response contain the marker the agent was told to emit? As soon
as it does, the loop stops on its own — well under the `max_iterations`
cap."*

**Step 2 — Let the RUNAWAY case run (~60s)**

Let it print automatically.

**Say:** *"Same agent, same instructions, same marker-based predicate
shape. I changed one word in the string `should_continue` checks for —
`COMPLETED` instead of `COMPLETE`. The agent still does exactly what it
was told, every single time. The bug is entirely on our side, and
`should_continue` can never see it. Watch — it runs three times and
stops, not because it succeeded, because `max_iterations` cut it off."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"Same predicate shape, one-word typo, completely different
failure mode. That's why the framework's advice isn't 'write a correct
predicate' — it's 'always set `max_iterations`, in case you don't.'"*

## Expected result

- BOUNDED: streams a small number of iterations (typically 1–3), the
  final line reports `STOPPED: should_continue found its marker`
- RUNAWAY: always runs exactly 3 iterations (`max_iterations=3`), the
  final line reports `STOPPED: the max_iterations safety cap`
- Total elapsed clock: under 4 minutes

## Fallback story if it breaks live

**Most likely failures:**
- BOUNDED takes longer than expected to find its marker (still bounded
  by `max_iterations=5`, just a slower live moment) — this is ordinary
  model variance, not a bug
- Network hiccup mid-stream (up to 8 model calls total across both
  cases)

Have ready:
1. **Screenshot of the BOUNDED run's tail** (iteration count + STOPPED
   line)
2. **Screenshot of the RUNAWAY run's tail**, same two lines

Story: *"This is what a clean run looked like in my dry run — a handful
of iterations for BOUNDED, exactly three for RUNAWAY, cut off by the
cap. The pattern that matters is that one is a natural stop and the
other is a forced one — not the exact iteration count you'd see live."*

Then advance the slide.

## Teaching payoff

*"A completion condition can fail — and when it does, the agent never
notices, because from its side it did everything right.
`max_iterations` is the one guarantee in this picture that doesn't
depend on the model or your own code being correct. That's Option A:
one predicate, one cap, no judge model — the simplest version of the
primitive this module names, and the one to reach for first."*

## Reference

- [Agent looping (`microsoft/agent-framework` docs)](https://learn.microsoft.com/en-us/agent-framework/agents/looping) — the framework warning this demo's RUNAWAY case makes concrete: *"Always bound autonomous loops. A completion condition can fail, a model can stall, and an evaluator can be probabilistic."*
- `python/samples/02-agents/middleware/agent_loop_middleware_refinement.py` (official SDK sample) — the source this demo adapts, unchanged in mechanics (`should_continue`, `record_feedback`, `fresh_context`, streamed iteration counting)
- `python/samples/02-agents/middleware/agent_loop_middleware_judge.py` and `agent_loop_middleware_report.py` (official SDK samples) — the judge-driven variant (Option B) intentionally not authored as a Day 4 demo yet
- Module 6 slide 2 ("Infinite loops") — the exact primitive and quoted warning this demo runs live
- Module 6 slide 7 ("Guardrails, by failure mode") — the summary table row (`Infinite loop (one agent)` → `AgentLoopMiddleware`/`max_iterations`) this demo is the live version of
