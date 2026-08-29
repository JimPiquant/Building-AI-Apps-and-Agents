import asyncio
import json
import os

from agent_framework import Agent
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
