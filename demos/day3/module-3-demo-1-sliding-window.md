# Module 3 · Demo 1 — SlidingWindowStrategy pruning old messages, live

**Placement:** After **slide 5 — "Grounded Python: keep recent groups"** (Module 3, EXPERIMENTAL).

**Time:** ~4 min total (30s framing + 30s before + 2 min run/inspect + 30s payoff)

**Language:** Python (MAF SDK). Runs the official
[`compaction/basics.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/compaction/basics.py)
sample, using its own documented usage pattern — no API key needed.

## What it shows

`basics.py` builds one fixed 8-message "before" history (a data-migration
planning conversation with one tool-call/tool-result pair baked in) and
prints it once. The sample's own header comment says exactly how to use
it: *"Keep one `selected_strategy` block active in `main`. Comment the
active block and uncomment one of the alternatives to switch
strategies."* The file ships with `SelectiveToolCallCompactionStrategy`
active by default — this demo swaps the active block to
`SlidingWindowStrategy(keep_last_groups=4, preserve_system=True)`, the
exact strategy the previous slide's code snippet shows, and re-runs.

The audience sees the same 8-message "before" list, then the "after" list
with older non-system groups pruned and the system message still
anchored — the EXPERIMENTAL ladder's gentlest rung, proven on real data,
no model call required.

**What this demo is NOT:** it does not call a model or use
`SummarizationStrategy` (that requires a real chat client per the sample's
own comments) — this demo stays on the free, deterministic strategies to
keep the live run fast and dependency-free.

## Setup checklist

Do this **before the module starts**:

- **Clone or vendor `basics.py`** into
  `demos/day3/module-3-demo-1-sliding-window/basics.py` (unmodified copy
  of the official sample)
- **No credentials needed** — this strategy touches only a local message
  list
- **`uv sync`** in `demos/day3/` — `agent-framework` is the only
  dependency this file needs
- **Pre-edit the file before the module starts:** comment out the active
  `selected_strategy_name = "SelectiveToolCallCompactionStrategy"` block
  and uncomment the `SlidingWindowStrategy` block, exactly as the file's
  own header comment instructs. Do this ahead of time — don't live-edit
  Python during the module.
- **Dry-run once** to confirm the "before"/"after" message counts print
  as expected

## Narration + steps

**Opening (30s):**
"The previous slide's code was four lines — `SlidingWindowStrategy(keep_last_groups=20)`.
Let's see what 'keep the newest N groups' actually prunes, on a real
message list."

**Step 1 — Show the "before" list (~30s)**

```bash
uv run python basics.py
```

Let the "Before compaction" block print. Point at the message count and
the tool-call/tool-result pair.

**Say:** *"Eight messages: a system anchor, a planning conversation, and
one tool call in the middle. This is the full history before anything is
pruned."*

**Step 2 — Show the "after" list (~90s)**

Let the rest of the output print — `apply_compaction()` running the
sliding-window strategy and printing the reduced list.

**Say:** *"Same conversation, now passed through `SlidingWindowStrategy`
with `keep_last_groups=4`. Watch which messages survive — the system
message stays anchored by default, and the oldest non-system groups are
the ones that get dropped."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This didn't call a model. It didn't cost a token. It's pure
list surgery on messages you already have in memory — which is exactly
why it's the gentlest rung on the EXPERIMENTAL ladder. The moment you need
`SummarizationStrategy` instead, you're paying for a model call to
preserve meaning instead of just dropping it."*

## Expected result

- "Before compaction" prints all 8 messages with their roles
- "After compaction" prints a shorter list with older non-system groups
  removed and the system message still present
- No network calls, no API key required, runs in well under a second
- Total elapsed clock: under 4 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Wrong block left active (forgot to swap comments ahead of time) —
  shows `SelectiveToolCallCompactionStrategy` behavior instead; the fix
  is a one-line comment swap, not a live debug
- Copy of `basics.py` drifted from the upstream sample after an
  `agent-framework` version bump

Have these ready:
1. **Screenshot of the "before" and "after" console output** from a
   successful dry run

Story: *"This is what the before/after list looked like from my dry run —
the pattern is what matters: system anchored, oldest non-system groups
pruned first."*

Then advance the slide.

## Teaching payoff

*"Compaction isn't a black box — it's list surgery you can read and
reason about. Start here, at the gentlest rung, before reaching for
anything that costs a model call or changes meaning."*

## Reference

- [`compaction/basics.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/compaction/basics.py) — the official sample this demo runs, using its own documented strategy-swap usage
- [Context compaction (Python)](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python) — concept grounding
- Module 3 slide 5 ("Grounded Python: keep recent groups") — the code this demo runs live
