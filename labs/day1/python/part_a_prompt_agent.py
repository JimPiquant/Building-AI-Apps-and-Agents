"""
Day 1 Lab — Part A — Prompt agent.

Connect from your app to a Prompt agent already published in your Foundry
project. Run `create_prompt_agent.py` first — it creates version 1.0 of the
`docs-assistant` Prompt agent using the Azure AI Projects SDK. This script
then connects to that agent and runs a set of multi-turn prompts.

A **Prompt agent** is a Foundry-authored agent: instructions, model, and tools
are defined as configuration. Foundry Agent Service runs it. There is no
application code to maintain and no compute to manage on your side. The
version you publish is what your consumers pin to.

Environment variables (set in labs/day1/.env):
    FOUNDRY_PROJECT_ENDPOINT
    FOUNDRY_PROMPT_AGENT_NAME=docs-assistant
    FOUNDRY_PROMPT_AGENT_VERSION=1
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

    # Connect to a Foundry-hosted Prompt agent by name + version.
    agent = FoundryAgent(
        project_endpoint=project_endpoint,
        agent_name=agent_name,
        agent_version=agent_version,
        credential=AzureCliCredential(),
    )

    print(f"--- Prompt agent: {agent_name} v{agent_version} ---")
    for prompt in [
        "In two sentences, what is Microsoft Foundry?",
        "I am building a small internal docs assistant. Suggest 3 features.",
        "Of those, which should I build first and why?",
    ]:
        result = await agent.run(prompt)
        print(f"User: {prompt}")
        print(f"Agent: {result}\n")


# ---------------------------------------------------------------------------
# Reflection prompts (save the transcript above; cite it in reflection.md)
#
# 1. What did you *not* write to make this work? (Instructions, runtime, endpoint,
#    scaling, identity — where does each live?)
# 2. What would you change to publish a v1.1 of this Prompt agent, and what
#    happens to existing consumers pinned to v1.0?
# 3. If three different apps in your organization consumed this Prompt agent, what benefits
#    does "versioned in Foundry" give you over the same instructions duplicated
#    across three codebases?
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
