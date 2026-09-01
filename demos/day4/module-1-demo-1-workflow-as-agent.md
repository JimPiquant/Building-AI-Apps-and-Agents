# Module 1 · Demo 1 — Wrap a workflow, call it like any other agent

**Placement:** After **slide 9 — "Wrap a workflow as an agent"** (Module 1).

**Time:** ~4 min total (30s framing + 90s default run + 90s intermediate-output run + 30s payoff)

**Language:** Python (MAF SDK). Step 1 runs the official
[`sequential_workflow_as_agent.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/03-workflows/agents/sequential_workflow_as_agent.py)
sample as-is. Step 2 is a minimal, clearly-noted adaptation of that same
sample — it builds the same workflow twice, with and without
`intermediate_output_from`, so the room can compare message counts
directly instead of reading the sample's own docstring note about it.

## What it shows

The previous slide's code was the abstract shape:

```python
workflow = SequentialBuilder(participants=[researcher, writer]).build()
workflow_agent = workflow.as_agent(name="Content Pipeline Agent")
response = await workflow_agent.run("Write an article about AI trends")
```

This demo makes it concrete with a real two-agent pipeline (`writer` →
`reviewer`) and a genuine gotcha the official sample flags in its own
comments: **`workflow.as_agent()` returns only the LAST participant's
response by default.** The writer's own draft ran — you'll see it in the
trace if you watch closely — but it never shows up in
`agent_response.messages` unless you explicitly designate it with
`intermediate_output_from=[writer]`.

**What this demo is NOT:** it does not implement a custom aggregator or
change the workflow's topology — the point is that `.as_agent()` is a thin,
faithful wrapper around whatever output-designation rules you already set
on the workflow (Module 3's `output_from` lesson, one level up).

## Setup checklist

Do this **before the module starts**:

- **Both scripts staged** in
  `demos/day4/module-1-demo-1-workflow-as-agent/`:
  `sequential_workflow_as_agent.py` (unmodified official sample) and
  `with_intermediate_output.py` (the comparison script)
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in `demos/day4/.env` — `python-dotenv` is a project dependency)
- **`uv sync`** in `demos/day4/` — installs `agent-framework`,
  `agent-framework-orchestrations`, `agent-framework-foundry`,
  `azure-identity`, `python-dotenv`
- **Dry-run both scripts once**, end to end. For
  `with_intermediate_output.py` specifically: read the printed content
  types on Configuration B's extra message and confirm whether they say
  `text_reasoning` (as the sample's own comment claims) on your installed
  `agent-framework` version, or plain `text`. Either way the message-COUNT
  difference (1 vs. 2) is the reliable part — adjust your narration on the
  content-type specifics only if your dry run shows something different
  from this runbook's wording below.

## Narration + steps

**Opening (30s):**
"The last slide said a workflow can be wrapped behind the exact same
`.run()` interface as a single agent. Let's prove that, and then find the
one gotcha worth knowing before you rely on it."

**Step 1 — Run the official sample as-is (~90s)**

```bash
uv run python sequential_workflow_as_agent.py
```

Let it print. Point at the single printed message — the reviewer's
feedback.

**Say:** *"Two agents ran — writer, then reviewer — but the wrapped
workflow handed back exactly ONE message, like a single agent would.
That's `.as_agent()` doing its job: whatever this workflow was already
built to output, that's what a caller sees — nothing more."*

**Step 2 — Run the comparison script (~90s)**

```bash
uv run python with_intermediate_output.py
```

Let both configurations print. Point at the message counts:
**Configuration A: 1 message. Configuration B: 2 messages.**

**Say:** *"Same workflow, same prompt. Configuration A is what you just
saw. Configuration B adds one keyword argument —
`intermediate_output_from=[writer]` — when building the SequentialBuilder,
BEFORE wrapping it as an agent. The writer's own draft was always
running in both cases; the only thing that changed is whether it's
*designated* as part of what the caller gets back."*

Point at the printed content-type line for configuration B's extra
message — confirm it matches (or note if it differs from) what your
dry run showed.

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is the same lesson Module 3 teaches about `output_from` on
a raw `WorkflowBuilder` graph, one level up: wrapping a workflow as an
agent doesn't add new judgment about what counts as output — it just
exposes whatever designation you already made. If you built the workflow
wrong, `.as_agent()` faithfully hands you the wrong thing back."*

## Expected result

- Step 1: exactly one printed message (the reviewer's feedback)
- Step 2: Configuration A prints 1 message; Configuration B prints 2 —
  the writer's message included
- Total elapsed clock: under 4 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Network hiccup mid-run (two live model calls per script, four total)
- Model output varies enough that a specific quoted phrase from the
  sample's docstring doesn't appear verbatim — expected; the STRUCTURE
  (message counts) is what this demo is proving, not exact wording

Have these ready:
1. **Screenshot of Step 1's single-message output**
2. **Screenshot of Step 2's two-configuration comparison**, with both
   message counts visible

Story: *"This is what a clean run of both scripts looked like from my dry
run. The pattern that matters is the message count: 1 without
`intermediate_output_from`, 2 with it."*

Then advance the slide.

## Teaching payoff

*"A workflow wrapped as an agent is not a black box that decides what to
show you — it exposes exactly the output designation you already built
into the workflow. Composition (today's Module 1 arc) goes full circle:
agents to workflows, and workflows back to agents, with no hidden
judgment added at the seam."*

## Reference

- [`sequential_workflow_as_agent.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/03-workflows/agents/sequential_workflow_as_agent.py) — the exact, unmodified sample Step 1 runs
- [Using Workflows as Agents (Python)](https://learn.microsoft.com/en-us/agent-framework/workflows/as-agents) — concept grounding, including the `AGENT_FORWARDED_EVENT_TYPES = {"output", "intermediate"}` event-conversion table
- Module 1 slide 11 ("Wrap a workflow as an agent") — the code this demo runs live
- Module 3's `output_from` lesson — the one-level-down mechanism this demo's gotcha traces back to
