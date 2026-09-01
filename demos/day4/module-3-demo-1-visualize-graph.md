# Module 3 · Demo 1 — Visualize the graph you're about to build yourself

**Placement:** After **slide 6 — "Visualize the graph you just built"** (Module 3).

**Time:** ~5 min total (30s framing + 2 min visualize + optional 2 min live
run + 30s payoff)

**Language:** Python (MAF SDK). The graph-building code is copied — not
imported — from `labs/day4/python/solutions/part_b_graph.py`, the worked
answer to the lab's own Part B1 exercise. `agents.py`, `retrieval.py`, and
`workflow_nodes.py` in this demo's own directory are likewise copied from
`labs/day4/python/`, with one deliberate change: this copy of
`workflow_nodes.py` has the Part B2 guardrail fix already applied, so the
optional live-run section below is safe to run without risking an
unbounded loop.

## What it shows

The previous slide's code rendered `WorkflowViz(workflow).to_mermaid()`
on an abstract example. This demo renders the **exact** three-executor,
conditional-loop graph attendees are about to build by hand in this
afternoon's Part B1 — Planner → Retriever → Critic, with a conditional
edge back to the Planner when the Critic doesn't approve.

Two parts:
1. **Build + visualize (required).** Construct the graph, print its
   Mermaid representation, paste it into
   [mermaid.live](https://mermaid.live) live. No model call happens here —
   `WorkflowViz` only inspects graph structure (executors and edges), so
   this part is instant and can't fail on a flaky network.
2. **Run it for real (optional, time permitting).** Execute the graph
   against a question that usually needs at least one revision pass, so
   the loop-back edge on the diagram fires for real, not just in theory.

**What this demo is NOT:** it does not walk through the Part B1 TODOs
themselves — that's the lab's job this afternoon. This demo shows
attendees what their OWN finished graph will look like once they build
it, before they start.

## Setup checklist

Do this **before the module starts**:

- **Four files staged** in `demos/day4/module-3-demo-1-visualize-graph/`:
  `agents.py`, `retrieval.py`, `workflow_nodes.py`, and
  `build_and_visualize.py`, plus `data/docs/*.md` (the same 9-file
  Contoso Cloud Platform corpus the lab uses)
- **`az login`** completed, correct subscription selected (needed even
  for the visualization-only path, since building the agents constructs
  a real `FoundryChatClient` — it just never calls the model unless you
  run the optional live section)
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in `demos/day4/.env`)
- **`uv sync`** in `demos/day4/`
- **Dry-run both paths once**: `uv run python build_and_visualize.py`
  (visualization only) and `RUN_LIVE=1 uv run python
  build_and_visualize.py` (also runs it for real) — confirm the live run
  actually triggers at least one revision pass on your dry run; if it
  doesn't, the loop-back edge only gets proven by the diagram, not by a
  live trace, which is still a fine outcome

## Narration + steps

**Opening (30s):**
"You're about to spend the next chunk of the lab building this exact
graph by hand. Let's look at what it turns into before you start typing."

**Step 1 — Build and visualize (~2 min)**

```bash
uv run python build_and_visualize.py
```

Read the printed Mermaid text, then paste it into
[mermaid.live](https://mermaid.live) on screen.

**Say:** *"Eight nodes: three agents, three small adapters that parse
JSON between them, and a gate. Look at the two dashed arrows out of
`revision_gate` — one goes to `to_revision`, which loops back to
`planner`. That's the one shape `SequentialBuilder` from Part A cannot
do. Everything else in this graph, Sequential could give you in one
line. This loop is the reason Part B1 exists."*

**Step 2 — Optional: run it for real (~2 min, if time permits)**

```bash
RUN_LIVE=1 uv run python build_and_visualize.py
```

If the Critic doesn't approve on the first pass, narrate the loop live.

**Say:** *"Watch the trace — if the Critic says not-approved, the
condition on that dashed edge evaluates true, and the Planner runs
again with the Critic's own feedback. That's not a special case in the
code; it's the same graph you just saw on the diagram, actually
executing the edge you were told to look for."*

If the Critic approves on the first pass instead:

**Say:** *"This question happened to pass on the first try — the loop
edge exists and is ready, it just didn't need to fire this run. You'll
likely see it fire on your own machine this afternoon with a harder
question."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is the same graph, rendered two ways: as a diagram you
can reason about before running anything, and as an actual execution
trace. Both come from the exact code you're about to write by hand in
Part B1 — nothing here is simplified for the slide."*

## Expected result

- The visualization step always succeeds and prints a valid Mermaid
  diagram with two dashed (conditional) edges out of `revision_gate`
- The optional live run either shows the loop-back firing (Critic
  rejects, Planner re-runs) or completes on the first pass — both are
  legitimate outcomes, narrated differently per the script above
- Total elapsed clock: under 5 minutes with the optional step, under 3
  without it

## Fallback story if it breaks live

**Most likely failures:**
- `az login` session expired — the visualization step still needs a
  constructed (not necessarily called) `FoundryChatClient`
- The optional live run times out or the model is slow — this step is
  explicitly optional; skip straight to the payoff if it's taking too
  long

Have these ready:
1. **Screenshot of the printed Mermaid text**
2. **Screenshot of the rendered diagram** from mermaid.live, with the
   two dashed conditional edges visible
3. **Screenshot of a successful live run** showing the loop firing, from
   your dry run

Story: *"This is the exact graph you're about to build this afternoon,
already rendered from a dry run. The two dashed edges out of the gate are
what you're wiring by hand in Part B1."*

Then advance the slide.

## Teaching payoff

*"`WorkflowViz` isn't a debugging afterthought — render your graph BEFORE
you trust it, the same way you'd sanity-check a diagram before shipping
an architecture. And the loop-back edge you just saw is the one thing no
prebuilt orchestration pattern from Module 2 gives you for free — that's
exactly what you're about to build yourself."*

## Reference

- `labs/day4/python/solutions/part_b_graph.py` — the worked answer this demo's graph-building code is copied from
- `labs/day4/python/workflow_nodes.py` + `labs/day4/python/solutions/part_b2_revision_gate.py` — the adapters and guardrail this demo's local copy is based on
- [Workflow Visualization (Python)](https://learn.microsoft.com/en-us/agent-framework/workflows/visualization) — concept grounding for `WorkflowViz`
- Module 3 slide 6 ("Visualize the graph you just built") — the code this demo runs live
- Module 3 slide 5 ("Conditional edges in code") — the mechanic behind the loop-back edge this demo renders and (optionally) triggers
