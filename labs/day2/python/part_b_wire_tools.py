"""
Day 2 Lab — Part B — Wire your function tools to the agent.

After you finish `tools.py`, this file wires create_ticket and lookup_status
into an agent so you can drive queries end-to-end.

Definition of done for Part B:
  - Isolation tests (tests/test_tools.py) pass
  - Golden-set eval (tests/test_golden_set.py against evals/tools_golden_set.jsonl) 6/6
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

from tools import create_ticket, lookup_status

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def build_agent_with_tools() -> Agent:
    endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
    model = os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna")

    client = FoundryChatClient(
        project_endpoint=endpoint,
        model=model,
        credential=AzureCliCredential(),
    )
    return Agent(
        client=client,
        instructions=(
            "You are a support assistant for the Contoso developer API.\n"
            "Use create_ticket when the user reports a problem needing a human engineer.\n"
            "Use lookup_status when the user asks about the status of an existing ticket.\n"
            "For general product questions, answer briefly — do not call a tool."
        ),
        tools=[create_ticket, lookup_status],
    )


DRIVER_QUERIES = [
    "I keep getting 500 errors on /login — please open a high-priority ticket.",
    "What's the status of ticket 12345?",
    "What are your rate limits?",
]


async def main() -> None:
    agent = build_agent_with_tools()
    print("--- Part B: agent with tools ---\n")
    for q in DRIVER_QUERIES:
        print(f"Q: {q}")
        response = await agent.run(q)
        print(f"A: {response}\n")

    print("Next: run tests/ to validate golden set. `uv run pytest ./tests/`")


if __name__ == "__main__":
    asyncio.run(main())
