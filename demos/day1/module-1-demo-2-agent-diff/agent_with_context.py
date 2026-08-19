import asyncio
from datetime import datetime

from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

"""
    Right pane of the "What an agent adds" live diff demo.

    MAF Agent with:
      - instructions
      - a get_current_time tool
      - an explicit session that carries state across two turns

    Steps to run:

        cd module-1-demo-2-agent-diff
        uv sync
        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        export FOUNDRY_MODEL=gpt-5.6-luna
        uv run agent_with_context.py

    Expected output:
        Turn 1: agent calls get_current_time and prints a real ISO timestamp
        Turn 2: agent recalls the earlier question specifically
"""


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
