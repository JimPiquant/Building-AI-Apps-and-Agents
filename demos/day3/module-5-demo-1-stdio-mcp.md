# Module 5 · Demo 1 — Local stdio MCP tool call, end to end

**Placement:** After **slide 4 — "Local stdio is a child-process boundary"** (Module 5).

**Time:** ~5 min total (30s framing + 90s show the pattern + 2 min run + 30s payoff)

**Language:** Python (MAF SDK). Grounded directly in the previous slide's
own code, sourced from
[Learn — Local MCP tools](https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python).
No matching sample file exists in the repo's `02-agents/mcp/` folder for
this exact minimal shape (that folder's samples cover API-key auth,
GitHub PAT, long-running tasks, progressive disclosure, and sampling
approval — not a plain stdio walkthrough) — the Learn doc's own
documented code is the grounding source here.

## What it shows

The previous slide's code is four lines inside an async context manager:

```python
async with MCPStdioTool(
    name="calculator",
    command="uvx",
    args=["mcp-server-calculator"],
) as mcp:
    result = await agent.run("Calculate the total.", tools=mcp)
```

This demo runs it live: `MCPStdioTool` launches `mcp-server-calculator` as
a local child process over stdin/stdout, the agent discovers the tools
that server exposes, the model picks one and invokes it with validated
arguments, and the connection (and child process) closes cleanly when the
`async with` block exits — the full client/server loop from the module's
opening flow diagram, made concrete.

**What this demo is NOT:** it does not touch remote HTTP transport,
`header_provider`, or `approval_mode` — those are the next few slides
and Demo 5.2.

## Setup checklist

Do this **before the module starts**:

- **`uvx` available** on the presenter machine (ships with `uv`) — no
  separate install step; `uvx mcp-server-calculator` will fetch and run
  the server on first use
- **One script staged**: `demos/day3/module-5-demo-1-stdio-mcp/main.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported or in
  `.env`
- **`uv sync`** in `demos/day3/`
- **Dry-run once** — note the first-call latency while `uvx` resolves
  the server package; a warm run is much faster

### Reference `main.py`

```python
import asyncio
import os

from agent_framework import Agent, MCPStdioTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(client=client, instructions="You are a helpful assistant.")

        async with MCPStdioTool(
            name="calculator",
            command="uvx",
            args=["mcp-server-calculator"],
        ) as mcp:
            result = await agent.run(
                "What is 47 times 89, plus 12?",
                tools=mcp,
            )
            print(result)


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide's code was four lines. Let's actually run it — a
local child process, talking MCP over stdin/stdout, wired into an
agent."

**Step 1 — Walk the code (~90s)**

Open `main.py`. Point at the three phases:
- `async with MCPStdioTool(...)` — this launches `uvx mcp-server-calculator`
  as a child process
- `agent.run(..., tools=mcp)` — the agent discovers the server's tools
  and can call them
- The `async with` block closing — connection and child process torn
  down automatically, even on error

**Say:** *"Connect, discover, invoke, synthesize, and clean up — that's
the module's flow diagram, and it's the whole file."*

**Step 2 — Run it (~2 min)**

```bash
uv run python main.py
```

Watch it resolve `uvx` (first run may take a few seconds), then print the
agent's answer.

**Say:** *"The model picked a tool from the calculator server, called it
with the two numbers, and used the result to answer. I didn't write a
calculator — I connected to one."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is the trust model for local stdio: you're launching and
trusting a specific command and package. That's why the slide said —
only commands and packages you've reviewed and pinned. Next slide moves
to a remote HTTP server, where the trust model shifts to auth and the
operator, not a local binary you control."*

## Expected result

- `uvx` resolves and launches `mcp-server-calculator` (first run may take
  a few seconds; subsequent runs are faster)
- The agent correctly computes `47 * 89 + 12 = 4195` (or equivalent,
  depending on model phrasing) using the calculator tool
- The child process and MCP connection close cleanly on exit
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- `uvx` not installed or not on `PATH` — fix ahead of time
- First-run latency while `uvx` fetches the package from PyPI — can spike
  on a slow connection
- The model answers without visibly showing the tool call in the printed
  output — the agent's tool-use attribution is model-dependent

Have these ready:
1. **Screenshot of a successful run** showing the computed answer
2. **A note on the expected latency** for a cold vs. warm `uvx` resolve

Story: *"This is what a clean run looked like from my dry run — the tool
does the arithmetic, the agent explains it. The pattern is what matters:
a local process, one context manager, one `tools=` list."*

Then advance the slide.

## Teaching payoff

*"MCP over stdio is a child process and a protocol, not magic. You just
watched the exact four-line pattern from the slide connect, discover,
invoke, and clean up — the same shape you'll see again over HTTP, and
again against the real Azure DevOps server in Module 6."*

## Reference

- [Local MCP tools (Python)](https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python) — the doc this demo's code is grounded in verbatim
- Module 5 slide 4 ("Local stdio is a child-process boundary") — the code this demo runs live
