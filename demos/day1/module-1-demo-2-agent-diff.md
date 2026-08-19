# Module 1 · Demo 2 — What an agent adds (live diff)

**Placement:** After **slide 4 — "What an agent adds"** (Module 1).

**Time:** ~4 min total (30s framing + 90s left pane + 90s right pane + 30s payoff)

**Language:** Python — two small scripts run side by side.

## What it shows

Slide 4 diagrammed *Instructions · Tools · Session · Middleware · LLM
Provider* as the five layers an agent wraps around a raw LLM. This demo
proves the diagram is not aspirational. Two panes run the same
question through:

- **Left:** a raw `Responses` API call — instructions + user message, no
  agent
- **Right:** an MAF `Agent` with `instructions=`, `tools=[get_current_time]`,
  and `session=session`

Ask *"what time is it right now, and remember I asked you this."*

- Left: says it doesn't have access to real-time info; second turn has
  no memory of the question
- Right: calls `get_current_time`, gets the actual time, and on the
  second turn ("what did I just ask you?") remembers exactly

The whole "agent wraps LLM with structure" argument lands in 90 seconds
of live output.

## Setup checklist

Do this **before the module starts**:

- **Two scripts staged** in a scratch dir on the presenter machine:
  - `raw_llm.py` — direct Responses API call, no MAF agent
  - `agent_with_context.py` — MAF `Agent` with a `get_current_time`
    tool and an explicit session
- **`az login`** completed and correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell
- **A split terminal** — left pane runs `raw_llm.py`, right pane runs
  `agent_with_context.py`. Font large enough to read from the back.
- **Dry-run recording** as fallback

### Reference `raw_llm.py`

```python
import asyncio, os
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

async def main():
    client = FoundryChatClient(credential=AzureCliCredential())
    # Raw model call — no Agent, no tools, no session
    r1 = await client.get_response(
        messages=[
            {"role": "system", "content": "You are a friendly assistant. Keep answers brief."},
            {"role": "user", "content": "What time is it right now, and remember I asked you this."},
        ],
    )
    print("Turn 1:", r1.text, "\n")

    # Second call — new request, no memory
    r2 = await client.get_response(
        messages=[
            {"role": "system", "content": "You are a friendly assistant. Keep answers brief."},
            {"role": "user", "content": "What did I just ask you?"},
        ],
    )
    print("Turn 2:", r2.text)

asyncio.run(main())
```

### Reference `agent_with_context.py`

```python
import asyncio
from datetime import datetime
from typing import Annotated
from pydantic import Field

from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

@tool
def get_current_time() -> str:
    """Return the current server time in ISO 8601 format."""
    return datetime.now().isoformat(timespec="seconds")

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="TimeAgent",
        instructions="You are a friendly assistant. Keep answers brief.",
        tools=[get_current_time],
    )
    session = agent.create_session()

    r1 = await agent.run(
        "What time is it right now, and remember I asked you this.",
        session=session,
    )
    print("Turn 1:", r1, "\n")

    r2 = await agent.run("What did I just ask you?", session=session)
    print("Turn 2:", r2)

asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The slide said an agent adds instructions, tools, session, middleware,
and a swappable provider. I want to show you what happens when you
strip those away. Left pane: raw LLM call. Right pane: full MAF agent.
Same question, same model."

**Step 1 — Left pane: raw LLM (~90s)**

```bash
uv run raw_llm.py
```

Read both turns of output aloud:
- Turn 1: model hedges — "I don't have access to real-time information"
  or similar
- Turn 2: model says something like "I'm not sure what you asked me
  previously"

**Say:** *"Two problems, both visible. No tool means no real time. No
session means no memory across calls. Solvable individually, but you'd
build that plumbing yourself, per application."*

**Step 2 — Right pane: MAF agent (~90s)**

```bash
uv run agent_with_context.py
```

Read both turns:
- Turn 1: actual current time — "It's 2026-08-19T15:42:00" or similar
- Turn 2: agent explicitly recalls the question — "You asked me what
  time it was and asked me to remember it"

**Say:** *"Same model. Same question. But this one has a `get_current_time`
tool the framework called for me, and a session that carried the
conversation state across turns. I didn't write any dispatch logic;
MAF did it. That's the difference the previous slide was pointing at."*

**Step 3 — Optional payoff aside (~30s)**

Point at the diff between the two scripts. `raw_llm.py` is ~15 lines of
direct API calls. `agent_with_context.py` is roughly the same size —
but the model has memory and tools because MAF composed those in for
me.

**Say:** *"The lines of code are roughly the same. What changed is the
capability. Every layer on the previous slide's diagram is doing real
work in the right pane."*

## Expected result

- Left pane Turn 1: model refuses to give a real time
- Left pane Turn 2: model doesn't remember Turn 1
- Right pane Turn 1: agent calls the tool and prints a real ISO timestamp
- Right pane Turn 2: agent recalls the earlier question specifically
- Total elapsed clock: under 4 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Left pane model *does* remember Turn 1 verbatim due to prompt caching
  — rare but possible with some models
- Tool call fails because import path drift
- Right pane returns the current time in an unexpected format

Have these ready:
1. **Screenshots** of both panes with the expected output
2. **A recording** of the successful demo

Story: *"Model variance can occasionally surface here. This is what the
runs look like from my dry-run. The pattern is what matters —
memoryless vs. remembers, no tool vs. calls the tool."*

Then advance the slide.

## Teaching payoff

*"An agent isn't magic — it's a small runtime that wraps your LLM with
the plumbing every real application needs. Instructions, tools, session,
middleware, a swappable provider. The next module is the SDK primitives
that let you compose these."*
