# Module 2 · Demo 1 — Watch it stream, then get the typed TriageResult

**Placement:** After **slide 9 — "Combine streaming and structure"** (Module 2).

**Time:** ~5 min total (30s framing + 2 min streaming run + 90s inspect
final value + 30s payoff)

**Language:** Python (MAF SDK). Runs the previous slide's exact combined
pattern, grounded in
[Learn — Structured outputs](https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python)
(confirmed via Microsoft's official code-sample index as verbatim,
runnable code — the doc embeds working samples, not pseudocode).

## What it shows

The previous slide's code block is the canonical combined pattern:

```python
stream = agent.run(request, stream=True, session=session,
                    options={"response_format": TriageResult})
async for update in stream:
    if update.text:
        render(update.text)
final = await stream.get_final_response()
triage = final.value
```

This demo runs it live against a standalone agent that shares the same
"support assistant for the Contoso developer API" narrative premise as
the Day 2 docs assistant, upgraded with a `TriageResult` model that
matches the structure Module 2's slides describe (`route`, `summary`,
`needs_work_item`) — the same typed contract Module 9's proposed lab
architecture designates for Part A. **This agent has no knowledge source
or function tools attached** — it's a bare agent isolating one narrow
concept, not an extension of `labs/day2/python`'s actual assistant.
Attaching real knowledge or tools would risk triggering a tool call
mid-stream, which changes the stream's shape and steps on the next
slide's point (see below) — so this demo deliberately stays standalone.
The audience watches text stream token by token, then sees a validated
Pydantic object print after the stream completes.

**What this demo is NOT:** it does not parse or act on anything mid-stream
— that's the next slide's point ("Partial JSON is display data, not a
value"), and this demo deliberately sets it up without stepping on it.

## Setup checklist

Do this **before the module starts**:

- **One script staged**: `demos/day3/module-2-demo-1-stream-then-triage/main.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported or in `.env`
- **`uv sync`** in `demos/day3/`
- **Dry-run once** — note the streaming cadence (how fast tokens arrive)
  so the live narration timing feels natural

### Reference `main.py`

```python
import asyncio
import os

from pydantic import BaseModel
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


class TriageResult(BaseModel):
    route: str  # "answer" | "clarify" | "work_item"
    summary: str
    needs_work_item: bool


INSTRUCTIONS = """\
You are a support assistant for the Contoso developer API.
Classify every request into a TriageResult: route (answer, clarify, or
work_item), a one-sentence summary, and whether a work item is recommended.
"""


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(client=client, instructions=INSTRUCTIONS)
        session = agent.create_session()

        request = "I keep getting 500 errors when I POST /login."
        stream = agent.run(
            request,
            stream=True,
            session=session,
            options={"response_format": TriageResult},
        )

        print("--- streaming ---")
        async for update in stream:
            if update.text:
                print(update.text, end="", flush=True)
        print("\n--- finalized ---")

        final = await stream.get_final_response()
        triage: TriageResult = final.value
        print(f"route={triage.route!r} needs_work_item={triage.needs_work_item!r}")
        print(f"summary={triage.summary!r}")


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide's code combined two things: a stream for the UI, and
a typed value for the app. Let's run it live — same Contoso support
assistant premise you've seen since Day 2, stripped down to isolate just
this one contract."

**Step 1 — Run it, watch the stream (~2 min)**

```bash
uv run python main.py
```

Let the tokens print live. Point at the terminal as they arrive.

**Say:** *"This is `update.text` — display data, arriving as the model
generates it. Nothing here is validated yet. Nothing here is safe to
parse or act on."*

**Step 2 — Point at the finalized value (~90s)**

When the stream completes and the `route=`/`summary=` lines print:

**Say:** *"Now — after the stream is done — I called
`get_final_response()`. `triage` isn't text anymore. It's a real
`TriageResult` instance. `triage.route`, `triage.needs_work_item` — typed,
validated, ready for my application to branch on."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"Same `agent.run()` call. One `stream=True` flag. One
`response_format` in `options`. You get progressive UI AND a typed
handoff — you don't have to choose."*

## Expected result

- Text streams visibly token-by-token during the run
- After the stream completes, `final.value` prints a valid `TriageResult`
  with a sensible `route` (likely `"work_item"` for the 500-error query)
  and `needs_work_item=True`
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- The model occasionally omits a field or returns an unexpected `route`
  string — structured-output support is model/deployment-dependent per
  the previous module's "Support follows the underlying client" slide
- Streaming cadence looks instantaneous on a fast connection, weakening
  the "watch it stream" visual

Have these ready:
1. **Screenshot of a mid-stream terminal state** (partial text visible)
2. **Screenshot of the finalized `TriageResult` print**

Story: *"Model responses vary run to run. This is what a representative
run looked like from my dry run — the pattern holds even when the exact
words differ."*

Then advance the slide.

## Teaching payoff

*"Two contracts, one call. Streaming is for the human watching. The typed
value is for the code that runs next. You just watched both happen in the
same request — this exact pattern is what Module 9's proposed lab
carries forward as the typed response contract."*

## Reference

- [Structured outputs (Python)](https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python) — the doc this demo's combined pattern is grounded in verbatim
- Module 2 slide 9 ("Combine streaming and structure") — the code this demo runs live
- Module 9 slide 2 ("Future lab architecture") — where `TriageResult` becomes part of the proposed Day 3 lab design
