import asyncio
import time
from pathlib import Path

from agent_framework import Agent, ContextProvider
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

"""
    Right pane of the "Tool vs. context provider" demo.

    Injects the same orders via a UserOrdersProvider that runs
    before every turn. The data is already in the prompt when the
    model starts generating — no reasoning delay, no tool round trip.

    Steps to run:

        cd module-3-demo-2-tool-vs-provider
        uv sync
        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        export FOUNDRY_MODEL=gpt-5.6-luna
        uv run provider_path.py

    Expected output:
        [provider path] 1-2s
        Same answer text as tool_path.py, but no tool call in the trace

    Note: verify ChatContextProvider / before_invoke against the current
    Learn 'adding-context-providers' guide the week of delivery — API
    surface was preview at authoring time.
"""

ORDERS_PATH = Path(__file__).with_name("orders.json")


class UserOrdersProvider(ContextProvider):
    async def before_run(self, *, agent, session, context, state):
        orders = ORDERS_PATH.read_text()
        context.extend_instructions(
            self.source_id,
            f"The current user's recent orders (JSON): {orders}",
        )


async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="OrdersAgent",
        instructions="You are a helpful support agent. Be brief.",
        context_providers=[UserOrdersProvider("user-orders")],
    )
    session = agent.create_session()

    t0 = time.perf_counter()
    r = await agent.run("What's my most recent order?", session=session)
    dt = time.perf_counter() - t0
    print(f"[provider path] {dt:.2f}s\n{r}")

asyncio.run(main())
