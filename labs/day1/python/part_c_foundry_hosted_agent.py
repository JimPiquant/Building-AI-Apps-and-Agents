"""
Day 1 Lab — Part C (bonus) — Foundry HostedAgent.

Connect to a **HostedAgent** (non-versioned) in your Foundry project. Uses the
same `FoundryAgent` class as Part B, but without `agent_version`.

Vocabulary reminder:
    A **HostedAgent** is a Foundry-hosted agent identified by name only. Portal
    edits update it in place — great for fast iteration; less strict than a
    versioned PromptAgent.
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
    agent_name = os.environ.get("FOUNDRY_HOSTED_AGENT_NAME")
    if not project_endpoint or not agent_name:
        raise SystemExit(
            "Set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_HOSTED_AGENT_NAME "
            "in labs/day1/.env before running this script."
        )

    # Foundry-hosted HostedAgent — no version.
    agent = FoundryAgent(
        project_endpoint=project_endpoint,
        agent_name=agent_name,
        credential=AzureCliCredential(),
    )

    print(f"--- HostedAgent: {agent_name} ---")
    result = await agent.run(
        "Compared to a versioned PromptAgent, what changes for the consumer of this agent?"
    )
    print(f"Agent: {result}\n")


# ---------------------------------------------------------------------------
# Reflection prompt — brief:
#
# When would you actively *want* the non-versioned HostedAgent over a PromptAgent?
# When would you actively want the reverse?
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
