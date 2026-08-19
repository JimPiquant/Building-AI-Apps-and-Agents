import asyncio
import time
from pathlib import Path

from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

"""
    Left pane of the "Tool vs. context provider" demo.

    Registers get_user_orders as a @tool. The model has to decide to
    call it, so attendees see the reasoning + tool round-trip cost.

    Steps to run:

        cd module-3-demo-2-tool-vs-provider
        uv sync
        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        export FOUNDRY_MODEL=gpt-5.6-luna
        uv run tool_path.py

    Expected output:
        [tool path] 2-4s
        Answer references specific order details from orders.json
"""

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

    t0 = time.perf_counter()
    r = await agent.run("What's my most recent order?", session=session)
    dt = time.perf_counter() - t0
    print(f"[tool path] {dt:.2f}s\n{r}")


asyncio.run(main())
