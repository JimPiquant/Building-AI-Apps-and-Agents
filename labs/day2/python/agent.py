"""
Day 2 baseline agent — plain MAF agent, no knowledge or tools attached.

Parts A/B/C progressively extend this. Run this file first to confirm your
`.env` is set up and Foundry is reachable. If this prints a greeting, you're
ready for Part A.
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def build_baseline_agent() -> Agent:
    """Build a Day 2 baseline agent — no knowledge, no tools."""
    endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
    model = os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna")

    client = FoundryChatClient(
        project_endpoint=endpoint,
        model=model,
        credential=AzureCliCredential(),
    )
    return Agent(
        client=client,
        instructions=
            "You are a support assistant for the Contoso developer API. "
            "Be concise. If you don't know the answer, say so."
    )


async def main() -> None:
    agent = build_baseline_agent()
    result = await agent.run("Say hello in one short sentence.")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
