"""
Day 1 Lab — Part A — Client-side agent.

Build an MAF client-side agent using `Agent` + `FoundryChatClient` against a
Foundry-deployed model. Run non-streaming and streaming.

The agent object and its thread live entirely inside this Python process.

Vocabulary reminder:
    - "Client-side agent" = you construct Agent() in code (this file).
    - "Foundry PromptAgent" / "Foundry HostedAgent" = server-hosted; see Parts B and C.
"""

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

INSTRUCTIONS = """\
## Role
You are a technical documentation assistant helping developers get started
with Microsoft Foundry and the Microsoft Agent Framework (MAF).

## Rules
- Prefer short, concrete answers. Cite documentation when you can.
- If you don't know, say so plainly instead of guessing.
- Keep code snippets minimal and directly relevant.
"""


async def main() -> None:
    project_endpoint = os.environ.get("FOUNDRY_PROJECT_ENDPOINT")
    model = os.environ.get("FOUNDRY_MODEL")
    if not project_endpoint or not model:
        raise SystemExit(
            "Set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_MODEL in labs/day1/.env "
            "before running this script."
        )

    # Client-side agent: Agent + FoundryChatClient, in-process.
    agent = Agent(
        client=FoundryChatClient(
            project_endpoint=project_endpoint,
            model=model,
            credential=AzureCliCredential(),
        ),
        name="DocsAssistant",
        instructions=INSTRUCTIONS,
    )

    # --- 1. Non-streaming run ---
    print("--- Non-streaming ---")
    result = await agent.run("In two sentences, what is Microsoft Foundry?")
    print(f"Agent: {result}\n")

    # --- 2. Streaming run ---
    print("--- Streaming ---")
    print("Agent: ", end="", flush=True)
    async for chunk in agent.run(
        "Give me one interesting fact about the Microsoft Agent Framework.",
        stream=True,
    ):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print("\n")

    # --- 3. Multi-turn: the agent remembers within this run session ---
    print("--- Multi-turn ---")
    r1 = await agent.run("I am building a small internal docs assistant. Suggest 3 features.")
    print(f"Agent (turn 1): {r1}\n")
    r2 = await agent.run("Of those, which should I build first and why?")
    print(f"Agent (turn 2): {r2}\n")


# ---------------------------------------------------------------------------
# Reflection prompts — save the transcript above; you'll cite it in reflection.md
#
# 1. Where did the thread state live during the multi-turn run?
# 2. What would you have to change to persist the conversation across processes?
# 3. If two apps needed to talk to the "same" agent, what would you need to add?
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
