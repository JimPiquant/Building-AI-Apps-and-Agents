"""
Day 1 Lab — Part B — Foundry PromptAgent.

Connect to a *versioned*, portal-configured **PromptAgent** in your Foundry
project. Instructions, model, and any hosted tools were configured in the portal
during Part B setup; here we just connect and run.

Vocabulary reminder:
    A **PromptAgent** is a Foundry-hosted agent identified by (name, version).
    Publishing a new version does not overwrite `1.0`; consumers pinning to `1.0`
    keep the old behavior. This is the "shipped artifact" model.
"""

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


async def main() -> None:
    project_endpoint = os.environ.get("FOUNDRY_PROJECT_ENDPOINT")
    agent_name = os.environ.get("FOUNDRY_PROMPT_AGENT_NAME")
    agent_version = os.environ.get("FOUNDRY_PROMPT_AGENT_VERSION")
    missing = [k for k, v in {
        "FOUNDRY_PROJECT_ENDPOINT": project_endpoint,
        "FOUNDRY_PROMPT_AGENT_NAME": agent_name,
        "FOUNDRY_PROMPT_AGENT_VERSION": agent_version,
    }.items() if not v]
    if missing:
        raise SystemExit(f"Set the following in labs/day1/.env before running: {', '.join(missing)}")

    # Foundry-hosted PromptAgent — versioned.
    agent = FoundryAgent(
        project_endpoint=project_endpoint,
        agent_name=agent_name,
        agent_version=agent_version,
        credential=AzureCliCredential(),
    )

    # Ask the same questions you asked in Part A so you can compare.
    print(f"--- PromptAgent: {agent_name} v{agent_version} ---")
    for prompt in [
        "In two sentences, what is Microsoft Foundry?",
        "I am building a small internal docs assistant. Suggest 3 features.",
        "Of those, which should I build first and why?",
    ]:
        result = await agent.run(prompt)
        print(f"User: {prompt}")
        print(f"Agent: {result}\n")


# ---------------------------------------------------------------------------
# Reflection prompts — save the transcript above; cite it in reflection.md
#
# 1. Where does the thread state live now (compared to Part A)?
# 2. To publish a v1.1 of this PromptAgent, what would you change?
# 3. If 3 different Publix apps consumed this PromptAgent, what benefits does
#    "versioned in Foundry" give you over a client-side agent duplicated in
#    each app?
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
