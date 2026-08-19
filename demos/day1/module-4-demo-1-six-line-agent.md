# Module 4 · Demo 1 — The 6-line agent

**Placement:** After **slide 4 — "The simplest possible Python agent"** (Module 4).

**Time:** ~3 min total (30s framing + 90s live setup + 60s run + payoff)

**Language:** Python. Live-typed from an empty directory to a working agent.

## What it shows

Module 4 has just claimed MAF is "small and stable" — an `Agent` plus a
`FoundryChatClient` and you're running. This demo makes that literal:
open an empty terminal, type the setup, run it, get a real answer from
your Foundry-deployed model. The point is *there's no ceremony*.

The slide is the code. Attendees see the same six lines from the slide
show up in a shell they could reproduce in the lab.

## Setup checklist

Do this **before the module starts**:

- **`az login`** completed and the correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** values in
  presenter notes (values will be typed live, not sourced from `.env`)
- **A clean shell** in your presenter home, no scratch dir yet
- **`uv` on `PATH`** (verify `uv --version`)
- **Reference files** for a fallback:
  - `demos/day1/module-4-demo-1-six-line-agent/main.py`
  - `demos/day1/pyproject.toml` (shared across all Day 1 demos)

Have both files open in a second editor tab so you can paste if
live-typing gets slow.

Optional but nice: `bat` or a syntax-highlighted terminal so the code
you type is readable from the back of the room.

## Narration + steps

**Opening (30s):**
"The slide says the simplest MAF agent is six lines. Let me build one
from an empty directory."

**Step 1 — Set up the project (~90s)**

```bash
mkdir scratch
cd scratch
uv init --bare      # creates bare pyproject.toml
touch main.py
```

Open `pyproject.toml`, add dependencies and the MS package feed:

```toml
[project]
name = "scratch"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = [
    "agent-framework",
    "azure-identity"
]

[[tool.uv.index]]
name = "internal"
url = "https://packagefeedproxy.microsoft.io/pypi/simple/"
```

Then paste the code from the slide into `main.py`. Same code — nothing
hidden:

```python
import asyncio

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="HelloAgent",
        instructions="You are a friendly assistant. Keep answers brief.",
    )

    result = await agent.run("What is the capital of France?")

    print(result)

asyncio.run(main())
```

Then install:

```bash
uv sync
```

**Say (while `uv sync` runs, ~10s):** *"`uv sync` creates the venv, resolves
dependencies against the Microsoft package feed, and writes `uv.lock`.
No `pip install`, no manual venv management."*

**Step 2 — Set the two env vars (~15s)**

```bash
export FOUNDRY_PROJECT_ENDPOINT=https://<your-foundry>.services.ai.azure.com/api/projects/<your-project>
export FOUNDRY_MODEL=gpt-5.6-luna
```

**Say:** *"Two env vars. `FoundryChatClient` picks these up automatically —
no `dotenv` loading here because this is one-off scratch code. The lab
uses `dotenv` and a `.env` file, but the pattern is the same."*

**Step 3 — Run it (~45s)**

```bash
uv run main.py
```

Wait for the response. The agent should print a brief answer about Paris.

**Say (as the answer prints):** *"Six lines of MAF code. `Agent` +
`FoundryChatClient` + `AzureCliCredential` — that's the whole stack.
`AzureCliCredential` picked up my `az login` context. The Foundry model
served the response. And this is what Part C of today's lab expands
on."*

## Expected result

- `uv sync` completes cleanly (~15s on cold Microsoft package feed,
  faster on subsequent runs)
- `uv run main.py` prints something like:
  > *"The capital of France is Paris."*
- Total elapsed clock from opening the terminal to seeing the answer:
  under 3 minutes

## Fallback story if it breaks live

**Most likely failures:**
- `uv sync` slow or intermittent (Microsoft package feed hiccup — rare
  but possible; can be 30-90s)
- `az login` context expired (401 from `AzureCliCredential`)
- Model deployment name typo in `FOUNDRY_MODEL`

Have these ready:
1. **A recording** of the successful run, prepared during dry-run rehearsal
   (`demos/day1/recordings/module4-demo1-six-line-agent.mp4`)
2. **A screenshot** of the terminal with the Paris answer visible

Story: *"Live pulls from the internal package feed sometimes take a
minute — here's what it looks like when it works. Same six lines from
the slide, same one-line output."*

Then advance the slide.

## Teaching payoff

*"That's the whole surface area of a MAF agent. Six lines. `Agent` +
`FoundryChatClient` + `AzureCliCredential`. The rest of the workshop
adds tools, knowledge, hosting — but this is the atom."*

## Reference files

- [`module-4-demo-1-six-line-agent/main.py`](module-4-demo-1-six-line-agent/main.py) — the exact code you'll paste in the demo, with the setup steps in the docstring for reference
- [`../pyproject.toml`](pyproject.toml) — the shared Day 1 demo pyproject (agent-framework, azure-identity, python-dotenv, MS package feed)
