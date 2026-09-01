# Module 5 · Demo 1 — Trajectory, cost, and the eval → change → re-eval loop

**Placement:** After **slide 9 — "The eval → change → re-eval loop"** (Module 5).

**Time:** ~4 min total (30s framing + 90s BEFORE run + 90s AFTER run + 30s payoff)

**Language:** Python (MAF SDK). Self-contained, deliberately small — same
spirit as Day 3 Module 7's evaluation demo (a tiny mock scenario, not the
full lab harness). Two agents (`researcher` → `writer`) via
`SequentialBuilder`, the exact construction already proven in Module 1's
demo. One local tool backed by a plain Python dict — no docs corpus, no
Azure DevOps, no live judge model, no golden-set file to load.

## What it shows

This demo IS the loop the previous slide just named: run it, change ONE
thing, run it again, compare.

- **A tiny 2-agent workflow**: `researcher` (has one tool,
  `lookup_rate_limit`) → `writer` (writes the final one-sentence answer
  from the researcher's findings).
- **BEFORE**: the researcher's instructions are vague — "answer the
  user's question about subscription rate limits" — with no explicit
  requirement to use the tool.
- **AFTER**: one sentence added to the SAME instructions — "you MUST call
  `lookup_rate_limit`... never state a number from memory."
- Every other part of the workflow (prompt, tool, writer, topology) is
  identical between the two runs.

Each run prints three things, mapped directly onto this module's own
vocabulary:
- **Process eval** — the trajectory (which tools were actually called,
  in order) against `expected_actions = ["lookup_rate_limit"]` — this is
  Task Navigation Efficiency's own `exact_match` mode, generalized across
  BOTH agents' messages (the multi-agent extension of Day 3's
  single-agent `ExpectedToolCall`, exactly as the module's "What
  trajectory means here" slide describes).
- **System eval** — does the final answer contain the correct number
  (`1,200`)?
- **Cost** — total tokens across both agents' model calls this run
  (`usage_details["total_token_count"]`, summed).

**What this demo is NOT:** it does not call Foundry's cloud evaluators,
does not use a golden set file, and does not run repetitions live — all
real, but each adds setup or time this demo doesn't need to make its one
point. Mention `--repetitions` and cloud evaluators verbally; don't
demo them here.

## Setup checklist

Do this **before the module starts**:

- **Script staged** in
  `demos/day4/module-5-demo-1-trajectory-and-cost/trajectory_and_cost.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in `demos/day4/.env`)
- **`uv sync`** in `demos/day4/`
- **Dry-run several times.** This is the one real risk: whether the
  BEFORE case reliably skips the tool (or calls it inconsistently) is a
  live-model judgment call, not guaranteed — same caveat Day 3 Module 7's
  demo names about its own "seeded failing" case. If BEFORE passes on
  some dry runs, that's not a bug in this demo — it's the nondeterminism
  Module 5's "Repetitions still matter" slide already warned about. Pick
  a dry run where BEFORE fails and AFTER passes, and narrate from that
  observed behavior.

## Narration + steps

**Opening (30s):**
"The last slide named the loop: baseline, change one thing, re-run,
quantify the delta. Let's actually run it — the same PASS/FAIL and cost
numbers a real eval report would show you, on a workflow small enough to
read end to end."

**Step 1 — Run the BEFORE case (~90s)**

```bash
uv run python trajectory_and_cost.py
```

Let the BEFORE section print. Point at the trajectory line.

**Say:** *"Watch the trajectory — the ordered list of tool calls across
BOTH agents. [If it's empty:] Zero tool calls. The researcher answered
from its own training data instead of looking anything up — that's a
process-eval failure, and if the number happens to be wrong, it's a
system-eval failure too."*

**Step 2 — Let the AFTER case run (~90s)**

Let it print automatically (the script runs both back to back).

**Say:** *"Same prompt, same tool, same writer — the ONLY change was one
sentence in the researcher's own instructions. Now the trajectory shows
`lookup_rate_limit`, and the final answer contains the right number.
Compare the token counts too — the AFTER run may cost a few more tokens
for the tool call, which is exactly the 'cost per successful outcome'
trade Module 5 talks about: worth it here, because BEFORE wasn't
actually succeeding."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"That's the whole loop: baseline, change one thing, re-run,
read the delta — on trajectory, on the final outcome, and on cost, not
just a single pass/fail bit. This afternoon's Part C runs the same loop
at golden-set scale, across three orchestration constructions instead of
one instruction tweak."*

## Expected result

- BEFORE: trajectory shows no tool call (or an inconsistent one), process
  eval FAILs; final answer may or may not contain the correct number
- AFTER: trajectory shows exactly `['lookup_rate_limit']`, process eval
  PASSes; final answer contains `1,200`, system eval PASSes
- Total elapsed clock: under 4 minutes

## Fallback story if it breaks live

**Most likely failures:**
- The BEFORE case unexpectedly calls the tool anyway, or the AFTER case
  skips it — live-model nondeterminism, the same caveat named above
- Network hiccup mid-run (two live workflow runs, four model calls total)

Have these ready:
1. **Screenshot of the BEFORE run's output** (trajectory + system eval +
   cost lines)
2. **Screenshot of the AFTER run's output**, same three lines

Story: *"This is what a clean before/after comparison looked like in my
dry run. The pattern that matters is the delta across all three
metrics — trajectory, outcome, and cost — not the exact numbers you'd
see live."*

Then advance the slide.

## Teaching payoff

*"Trajectory, cost, and outcome are three separate questions, and a real
regression can hide in any one of them while the others look fine. The
eval → change → re-eval loop is how you catch that — and you just watched
it catch a one-sentence instruction change, live."*

## Reference

- [Task Navigation Efficiency (Foundry agent evaluators)](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators) — the evaluator this demo's trajectory check mirrors (`exact_match` mode)
- Day 3 Module 7's `evaluate_agent`/`ExpectedToolCall` demo — the single-agent version this demo generalizes to a 2-agent trajectory
- Module 5 slide 9 ("The eval → change → re-eval loop") — the exact loop this demo runs live
- Module 5 slide 6 ("What 'trajectory' means here") — the concept this demo's `collect_actions()` implements
- Module 5 slide 8 ("Cost per successful outcome") — the token-sum metric this demo prints per run
