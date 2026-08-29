# Module 7 · Demo 1 — evaluate_agent catches a wrong tool call

**Placement:** After **slide 4 — "Check tool name and arguments locally"** (Module 7).

**Time:** ~5 min total (30s framing + 90s passing case + 2 min failing case + 30s payoff)

**Language:** Python (MAF SDK). Grounded primarily in
[Learn — Evaluation](https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python),
which documents `ExpectedToolCall`, `expected_tool_calls=`, and
`tool_call_args_match` exactly as the previous slide's code
snippet uses them. **Note the divergence:** the repo's checked-in
[`evaluate_with_expected.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/evaluation/evaluate_with_expected.py)
sample currently demonstrates `evaluate_agent` + `LocalEvaluator` with a
custom `response_matches_expected` evaluator and `tool_calls_present`, but
does not yet wire `expected_tool_calls=[ExpectedToolCall(...)]` or
`tool_call_args_match` the way the Learn doc and the Module 7 slide do.
This demo follows the Learn doc's documented pattern (the same one the
slide's code block already cites) and extends the sample's
`evaluate_agent`/`LocalEvaluator` orchestration pattern with the
ADO-flavored `wit_work_item` scenario Module 7 sets up.

## What it shows

The previous slide's code checks one query against one expected tool
call:

```python
expected = ExpectedToolCall("wit_work_item", {"action": "get", "id": 42})
local = LocalEvaluator(tool_calls_present, tool_call_args_match)
results = await evaluate_agent(
    agent=agent, queries=["Get work item 42."],
    expected_tool_calls=[expected], evaluators=local,
)
```

This demo runs that exact call twice against a small mock agent that
exposes two similarly-named tools (`wit_work_item` for reads,
`wit_work_item_write` for writes) — deliberately close enough in name and
purpose that a model can plausibly pick the wrong one:

1. **Passing case** — a query that gets the model to call
   `wit_work_item` with the right `action`/`id` — `tool_calls_present`
   and `tool_call_args_match` both pass
2. **Seeded failing case** — a query engineered to tempt the model
   toward `wit_work_item_write` instead (or the right tool with the
   wrong `action`) — the evaluators report a failure with the specific
   mismatch, not just a pass/fail bit

**What this demo is NOT:** it does not call FoundryEvals or the cloud
evaluation service — this stays entirely in `LocalEvaluator`, fast and
deterministic, matching the slide's own framing of local checks as the
inner-loop tool.

## Setup checklist

Do this **before the module starts**:

- **One script staged**:
  `demos/day3/module-7-demo-1-eval-catches-wrong-tool/main.py`, with two
  mock tools (`wit_work_item`, `wit_work_item_write`) that just log their
  call and return a canned string — no real Azure DevOps connection
  needed for this demo (Module 6's demo already proved the real
  connection)
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported or in
  `.env`
- **`uv sync`** in `demos/day3/`
- **Dry-run twice** — model nondeterminism means the "seeded failing"
  query needs to reliably tempt the wrong tool; adjust the query wording
  until it fails consistently in your dry runs (this is the point of
  Module 7's later "Use Repetitions to handle nondeterminism" slide, but for
  this single demo you want a stable failure to show)

### Reference `main.py`

```python
import asyncio
import os
from typing import Annotated

from pydantic import Field

from agent_framework import (
    Agent, ExpectedToolCall, LocalEvaluator, evaluate_agent,
    tool, tool_call_args_match, tool_calls_present,
)
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


@tool
def wit_work_item(action: Annotated[str, Field(description="get, get_batch, my, or list_for_iteration")],
                   id: int) -> str:
    """Read an Azure DevOps work item."""
    return f"[READ] action={action} id={id}"


@tool
def wit_work_item_write(action: Annotated[str, Field(description="create, update, update_batch, or add_child")],
                         id: int) -> str:
    """Create or modify an Azure DevOps work item."""
    return f"[WRITE] action={action} id={id}"


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(
            client=client,
            instructions="You are an Azure DevOps assistant. Use wit_work_item for reads, "
                         "wit_work_item_write for creates/updates.",
            tools=[wit_work_item, wit_work_item_write],
        )

        local = LocalEvaluator(tool_calls_present, tool_call_args_match)

        print("--- Passing case ---")
        passing = await evaluate_agent(
            agent=agent,
            queries=["Get work item 42."],
            expected_tool_calls=[ExpectedToolCall("wit_work_item", {"action": "get", "id": 42})],
            evaluators=local,
        )
        for r in passing:
            print(f"{r.provider}: {r.passed}/{r.total} passed")

        print("\n--- Seeded failing case ---")
        failing = await evaluate_agent(
            agent=agent,
            queries=["Mark work item 42 as reviewed."],
            expected_tool_calls=[ExpectedToolCall("wit_work_item", {"action": "get", "id": 42})],
            evaluators=local,
        )
        for r in failing:
            print(f"{r.provider}: {r.passed}/{r.total} passed")
            for item in r.items:
                print(f"  [{item.status}] {item.input_text} -> {(item.output_text or '')[:80]}")


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide's code checked one query against one expected tool
call. Let's give the agent two similarly-named tools and see the
evaluator actually catch a mistake."

**Step 1 — Passing case (~90s)**

```bash
uv run python main.py
```

Let the first block print. Point at `passed/total`.

**Say:** *"Clean query, clean expectation, both checks pass. This is what
'green' looks like — `tool_calls_present` confirms the name showed up,
`tool_call_args_match` confirms the arguments matched too."*

**Step 2 — Seeded failing case (~2 min)**

Let the second block print. Point at the failed item's status line.

**Say:** *"I deliberately worded this query to tempt the model toward the
write tool, or the wrong action, while my ground truth still expects a
plain read. Look — the evaluator didn't just say 'fail.' It told me
exactly which expectation didn't match. That's the difference between
'the agent seems off' and 'here's the specific regression.'"*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This ran in milliseconds, no model judge, no API call to a
separate evaluation service — just `LocalEvaluator` comparing what
actually happened against what you said should happen. This is your CI
smoke test before you ever reach for FoundryEvals."*

## Expected result

- Passing case: `tool_calls_present` and `tool_call_args_match` both
  report a pass
- Seeded failing case: at least one evaluator reports a failure, with the
  printed item showing the mismatched tool name or arguments
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- The "seeded failing" query stops reliably failing (model behavior
  drifts run to run) — this is itself the nondeterminism the next slide
  names; if it happens live, treat it as a teaching moment rather than a
  broken demo
- Both cases pass because the model always picks correctly — have a
  harder-to-resist wrong-tool query ready as backup

Have these ready:
1. **Screenshot of the passing-case output**
2. **Screenshot of the failing-case output**, with the mismatch visible

Story: *"This is what a representative pass/fail pair looked like from my
dry run. Model behavior can vary run to run — that's exactly why the next
slide talks about repetitions instead of trusting a single run."*

Then advance the slide.

## Teaching payoff

*"Evaluation isn't a vibe check — it's a specific, repeatable comparison
between what you expected and what happened, and you just watched it
catch a real mismatch between two similarly-named tools. That's the
exact discipline Module 6's read/write distinction demands before you
ever let an agent touch a real work item."*

## Reference

- [Evaluation (Python)](https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python) — the doc `ExpectedToolCall`/`tool_call_args_match` are documented in, matching the previous slide's code exactly
- [`evaluate_with_expected.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/evaluation/evaluate_with_expected.py) — the adjacent official sample this demo's `evaluate_agent`/`LocalEvaluator` orchestration pattern extends (noted divergence: the checked-in sample doesn't yet use `expected_tool_calls`/`ExpectedToolCall`)
- Module 7 slide 4 ("Check tool name and arguments locally") — the code this demo runs live
