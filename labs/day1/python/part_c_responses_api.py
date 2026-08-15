"""
Day 1 Lab — Part C — Your own code, calling the Responses API.

Build an MAF app that runs in *your* process and calls Foundry's Responses API
for models and platform tools. This is one of the three ways to run an agent
with Foundry — the runtime is yours (laptop today, Container Apps / App Service
/ AKS / Functions tomorrow), and Foundry serves the model plus platform tools.

The same MAF code you write here is what would run inside a **Hosted agent**
(Part B) if you later chose to package it as a container. No rewrite required.
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

    # Your code, calling the Responses API on your Foundry project endpoint.
    # The Agent + FoundryChatClient pair runs in *this* process.
    agent = Agent(
        client=FoundryChatClient(
            project_endpoint=project_endpoint,
            model=model,
            credential=AzureCliCredential(),
        ),
        name="DocsAssistant",
        instructions=INSTRUCTIONS,
    )

    # --- 1. Non-streaming ---
    print("--- Non-streaming ---")
    result = await agent.run("In two sentences, what is Microsoft Foundry?")
    print(f"Agent: {result}\n")

    # --- 2. Streaming ---
    print("--- Streaming ---")
    print("Agent: ", end="", flush=True)
    async for chunk in agent.run(
        "Give me one interesting fact about the Microsoft Agent Framework.",
        stream=True,
    ):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print("\n")

    # --- 3. Multi-turn ---
    session = agent.create_session()
    print("--- Multi-turn ---")
    r1 = await agent.run("I am building a small internal docs assistant. Suggest 3 features.",
        session=session)
    print(f"Agent (turn 1): {r1}\n")
    r2 = await agent.run("Of those, which should I build first and why?",
        session=session)
    print(f"Agent (turn 2): {r2}\n")


# ---------------------------------------------------------------------------
# Reflection prompts (save the transcript above; cite it in reflection.md)
#
# 1. Where did the thread state live during the multi-turn run?
# 2. This same code could run in Container Apps, App Service, AKS, or Functions.
#    Which host would you pick for a real production scenario and why?
# 3. Stretch: zip this Part C code and deploy it as a Hosted agent (like the
#    one you connected to in Part B). What does Foundry add on top of the same
#    MAF code once it's hosted?
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
