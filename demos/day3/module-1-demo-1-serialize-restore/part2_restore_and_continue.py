import asyncio
import json
import os

from agent_framework import Agent, AgentSession
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
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
