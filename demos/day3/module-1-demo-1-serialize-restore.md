# Module 1 · Demo 1 — Serialize, kill the process, restore the session

**Placement:** After **slide 3 — "The lifecycle is explicit"** (Module 1).

**Time:** ~5 min total (30s framing + 90s first process + 60s "restart" + 90s restore + 30s payoff)

**Language:** Python (MAF SDK). Grounded directly in the slide's own code
snippet, which is sourced from
[Learn — Sessions & conversation state](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python).
No separate repo sample matches this exact minimal shape, so the Learn doc
is the primary grounding source (per this course's conflict-resolution
rule: Learn docs are source of truth for the documented API surface).

## What it shows

The previous slide showed four lines of code that look almost too simple:

```python
payload = session.to_dict()
resumed = AgentSession.from_dict(payload)
```

This demo proves those two lines are the entire durability contract. Two
scripts run in sequence, simulating two different OS processes:

- **`part1_run_and_serialize.py`** — creates a session, runs two turns
  ("Remember this project is called Atlas." / "What's the project name?"),
  then serializes the session to a JSON file on disk and exits.
- **`part2_restore_and_continue.py`** — a completely separate process
  invocation. It loads the JSON file, restores the session with
  `AgentSession.from_dict()`, and asks a third question ("What did I tell
  you to remember?") — proving conversation continuity survived the
  process boundary.

**What this demo is NOT:** it does not touch durable storage (Redis,
Cosmos DB, blob). Module 1's own "Durability is an application choice"
slide covers storage options; this demo isolates the serialize/restore
contract itself, using a local file as the simplest possible persistence
stand-in.

## Setup checklist

Do this **before the module starts**:

- **Two scripts staged** in `demos/day3/module-1-demo-1-serialize-restore/`:
  `part1_run_and_serialize.py` and `part2_restore_and_continue.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported in the
  shell (or in a local `.env` — `python-dotenv` is a project dependency)
- **A clean scratch dir** with write permission (the demo writes
  `session_payload.json` next to the scripts)
- **`uv sync`** in `demos/day3/` — installs `agent-framework`,
  `agent-framework-foundry`, `azure-identity`, `python-dotenv`
- **Dry-run once**, end to end, deleting `session_payload.json` between
  attempts so the "first process" step is honest

### Reference `part1_run_and_serialize.py`

```python
import asyncio
import json
import os

from agent_framework import Agent, AgentSession
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(
            client=client,
            name="ContinuityAgent",
            instructions="You are a friendly assistant. Keep answers brief.",
        )
        session = agent.create_session()

        r1 = await agent.run(
            "Remember this project is called Atlas.", session=session,
        )
        print("Turn 1:", r1, "\n")

        r2 = await agent.run("What's the project name?", session=session)
        print("Turn 2:", r2, "\n")

        payload = session.to_dict()
        with open("session_payload.json", "w") as f:
            json.dump(payload, f)
        print("Session serialized to session_payload.json. Process exiting now.")


asyncio.run(main())
```

### Reference `part2_restore_and_continue.py`

```python
import asyncio
import json
import os

from agent_framework import Agent, AgentSession
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(
            client=client,
            name="ContinuityAgent",
            instructions="You are a friendly assistant. Keep answers brief.",
        )

        with open("session_payload.json") as f:
            payload = json.load(f)
        resumed = AgentSession.from_dict(payload)

        r3 = await agent.run(
            "What did I tell you to remember?", session=resumed,
        )
        print("Turn 3 (new process):", r3)


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide's code looked almost too simple — `to_dict()` and
`from_dict()`. Let me prove that's the whole contract by actually killing
the process in between."

**Step 1 — Run the first process (~90s)**

```bash
uv run python part1_run_and_serialize.py
```

Read both turns aloud. Point at the last line of output — the payload was
written to disk, and the process is about to exit.

**Say:** *"That process is done. No lingering variables, no shared memory.
Whatever comes next has to come entirely from that JSON file."*

**Step 2 — Show the file, then "restart" (~60s)**

```bash
cat session_payload.json | head -c 300
```

**Say:** *"This is what a session actually is on disk — an ID, provider
state, and Foundry's own service session id if it's tracking one. It's
data, not a live object."*

**Step 3 — Run the second process (~90s)**

```bash
uv run python part2_restore_and_continue.py
```

Read Turn 3 aloud — the agent correctly answers "Atlas," something it can
only know from the restored session.

**Say:** *"New Python process. New agent object. Same conversation. The
session — not the process — carried the continuity."*

**Step 4 — Payoff aside (~30s)**

**Say:** *"This is the exact mechanism a real app uses to survive a
restart, a redeploy, or a load-balancer routing your next request to a
different server. Where you put that file — Redis, Cosmos DB, a database
row — is your application's choice. Module 1's storage slide names the
options; today you saw the underlying contract that makes any of them work."*

## Expected result

- Process 1 prints Turn 1 (acknowledges "Atlas") and Turn 2 (recalls it
  within the same process) and writes `session_payload.json`
- Process 2, run independently, prints Turn 3 correctly recalling "Atlas"
  despite being a fresh Python process with no shared memory
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- `session_payload.json` missing or stale from a previous dry run — delete
  it before the live run
- Foundry service-managed session behavior varies by deployment; if
  `service_session_id` handling surfaces unexpected extra state, don't
  debug live
- Network hiccup between the two process runs

Have these ready:
1. **Screenshot of Process 1's output**, including the "serialized" line
2. **Screenshot of the JSON file contents** (redacted if needed)
3. **Screenshot of Process 2's Turn 3 output** showing correct recall

Story: *"This is what a clean run looks like from my dry run — two
independent process invocations, one file connecting them. The pattern is
what matters: serialize before you might lose the process, restore before
you need the history."*

Then advance the slide.

## Teaching payoff

*"A session surviving a process boundary isn't magic — it's two method
calls and a place to put the bytes in between. Everything else — which
store, how you scope ownership, how you enforce authorization — is what
the rest of this module covers."*

## Reference

- [Sessions & conversation state (Python)](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python) — the doc this demo's code is grounded in verbatim
- Module 1 slide 3 ("The lifecycle is explicit") — the code this demo runs live
- Module 1 slide 8 ("Durability is an application choice") — where the *next* decision (which store) is taught
