# Module 3 · Demo 2 — Tool vs. context provider (which fires when?)

**Placement:** After **slide 8 — "The context lifecycle"** (Module 3).

**Time:** ~4 min total (30s framing + 90s tool path + 90s provider path + 30s payoff)

**Language:** Python — two scripts run side by side against the same
question.

## What it shows

Slides 6–8 argued that tools are **reactive** (model decides when to
call) and context providers are **proactive** (framework runs on every
invocation). This demo runs the same question through the same agent
in two configurations to make the timing difference visible:

- **Left pane** — `get_user_orders` registered as a **tool**. Model has to
  decide to call it. Attendees see the reasoning delay + tool-call
  round trip.
- **Right pane** — same data injected via a **context provider** that runs
  before every turn. Answer is instant; the data was already in the
  prompt when the model started generating.

Same agent, same model, same question. The **latency delta**, the **tool
call visible in the output**, and the **provider's silent injection**
together prove the pattern distinction.

## Setup checklist

Do this **before the module starts**:

- **Two scripts staged** in a scratch dir:
  - `tool_path.py` — same base agent, `get_user_orders` registered as `@tool`
  - `provider_path.py` — same base agent, `UserOrdersProvider` registered as a context provider
- **A shared mock data source** (either a small `orders.json` file or a
  hardcoded Python dict; either works). Both scripts pull from the
  same source so the answer text is identical.
- **`az login`** + `FOUNDRY_PROJECT_ENDPOINT` + `FOUNDRY_MODEL` env vars
  set in both terminal panes
- **A split terminal** with large font — left pane, right pane, both
  running in parallel
- **A stopwatch** on visible timing if you want to make the latency
  point sharper — optional; the "which one printed first" beat also
  works
- **Dry-run recording** as fallback

### Reference `orders.json`

```json
[
  {"id": "ord-1001", "date": "2026-08-14", "total": "$42.10", "status": "delivered"},
  {"id": "ord-1002", "date": "2026-08-18", "total": "$127.50", "status": "in_transit"},
  {"id": "ord-1003", "date": "2026-08-19", "total": "$8.99", "status": "processing"}
]
```

### Reference `tool_path.py`

```python
import asyncio, json
from pathlib import Path
from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

ORDERS_PATH = Path(__file__).with_name("orders.json")

@tool
def get_user_orders() -> str:
    """Return the current user's recent orders as a JSON string."""
    return ORDERS_PATH.read_text()

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="OrdersAgent",
        instructions="You are a helpful support agent. Be brief.",
        tools=[get_user_orders],
    )
    session = agent.create_session()

    import time
    t0 = time.perf_counter()
    r = await agent.run("What's my most recent order?", session=session)
    dt = time.perf_counter() - t0
    print(f"[tool path] {dt:.2f}s\n{r}")

asyncio.run(main())
```

### Reference `provider_path.py`

```python
import asyncio, json, time
from pathlib import Path
from agent_framework import Agent, ChatContextProvider
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

ORDERS_PATH = Path(__file__).with_name("orders.json")

class UserOrdersProvider(ChatContextProvider):
    async def before_invoke(self, context):
        # Inject the user's orders into the prompt on every turn
        orders = ORDERS_PATH.read_text()
        context.add_system_message(f"The current user's recent orders (JSON): {orders}")

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="OrdersAgent",
        instructions="You are a helpful support agent. Be brief.",
        context_providers=[UserOrdersProvider()],
    )
    session = agent.create_session()

    t0 = time.perf_counter()
    r = await agent.run("What's my most recent order?", session=session)
    dt = time.perf_counter() - t0
    print(f"[provider path] {dt:.2f}s\n{r}")

asyncio.run(main())
```

> **Note on API surface:** the exact `ChatContextProvider` /
> `before_invoke` API name may drift as MAF's context-provider
> integration stabilizes. Verify against the current
> [`adding-context-providers`](https://learn.microsoft.com/agent-framework/journey/adding-context-providers)
> guide the week of delivery. If the API has changed, adjust the
> provider path to match; the demo's teaching point is the same
> regardless of exact syntax.

## Narration + steps

**Opening (30s):**
"That slide described the context lifecycle — tools fire when the model
decides, providers fire on every turn. Same agent, same question, two
setups. Watch which finishes first."

**Step 1 — Tool path (~90s)**

```bash
uv run tool_path.py
```

Say (while it runs, ~5-7s): *"Model saw the question, reasoned that
`get_user_orders` was relevant, generated a function call, waited for
the round trip, incorporated the result, and generated the answer.
Model-driven — the tool schema and its choice are what triggered the
call."*

Read the printed latency aloud — likely 2–4 seconds.

**Step 2 — Provider path (~90s)**

```bash
uv run provider_path.py
```

Say (while it runs, ~2-3s): *"Same agent, same question. But the
provider ran before the model saw the question. Orders were already in
the prompt. The model didn't have to decide to call anything — the data
was there."*

Read the printed latency aloud — noticeably faster.

**Step 3 — Compare and land (~30s)**

Point at the two elapsed times on-screen. Same question. Same model.
The tool path is slower by the tool round-trip cost. The provider path
is slower by *always* paying the injection cost (even if the question
didn't need it).

**Say:** *"Neither is universally better. Tool path saves tokens when
the data isn't needed. Provider path saves latency and reasoning
complexity when the data is always needed. That's the rule of thumb
from the prior slide — provider for information the agent should always
have, tool for information the agent should fetch on demand."*

## Expected result

- Tool path: latency 2–4s; answer references specific order details;
  tool call visible in agent output or trace
- Provider path: latency 1–2s; same answer text; no tool call visible
- Attendees see the timing delta and the reasoning delta together

## Fallback story if it breaks live

**Most likely failures:**
- LLM variance produces similar latencies (model reasoned fast on tool
  path)
- Context provider API mismatch (see note above)
- Model refuses to use the tool on the tool path

Have these ready:
1. **A recording** of a run where the timing delta is clear
2. **Screenshots** of both terminal outputs

Story: *"Model reasoning latency has variance — here's a run from my
dry-run where the delta is obvious. The pattern is what matters: tool
is reactive, provider is proactive."*

Then advance the slide.

## Teaching payoff

*"'Which one should I use?' isn't philosophical — it's a timing and
token decision. Always-needed data goes in a provider. Sometimes-needed
data is a tool. That distinction shapes how you design context in every
real agent."*
