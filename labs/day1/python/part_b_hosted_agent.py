"""
Day 1 Lab — Part B — Hosted agent.

Connect from your app to a **Hosted agent** deployed in the shared Foundry
Agent Service sandbox. A Hosted agent is your agent code — packaged as a
container or a source zip — that Foundry runs for you with a managed endpoint,
autoscale, a dedicated Microsoft Entra identity, and end-to-end observability.

The workshop instructor pre-deploys a `docs-assistant-hosted` Hosted agent
whose source is essentially the Part C code, packaged for Agent Service (see
labs/day1/instructor/deploy-hosted-agent-day1.md). You connect to it here to
feel the difference vs. Parts A and C.

Then, in the portal, walk through what Foundry manages for you:
    - Managed endpoint (the URL you're calling)
    - Autoscale metrics
    - Agent identity (dedicated Entra identity)
    - Tracing / observability dashboard
    - At least one attached Toolbox tool (for example, web search)
    - Content safety filters

Stretch (belongs in Part C): after you finish Part C, zip your own Part C code
and deploy it as your own Hosted agent through the Foundry portal.
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

    # Connect to a Foundry-run Hosted agent. Same client class as Part A;
    # a Hosted agent has no explicit version number in the connection.
    agent = FoundryAgent(
        project_endpoint=project_endpoint,
        agent_name=agent_name,
        credential=AzureCliCredential(),
    )

    print(f"--- Hosted agent: {agent_name} ---")
    result = await agent.run(
        "Compared to running the same MAF code in my own process, "
        "what does Foundry Agent Service manage for you when the agent is hosted?"
    )
    print(f"Agent: {result}\n")

    # Ask the same multi-turn set as Parts A and C so the transcripts are comparable.
    for prompt in [
        "In two sentences, what is Microsoft Foundry?",
        "I am building a small internal docs assistant. Suggest 3 features.",
        "Of those, which should I build first and why?",
    ]:
        r = await agent.run(prompt)
        print(f"User: {prompt}")
        print(f"Agent: {r}\n")


# ---------------------------------------------------------------------------
# Reflection prompts
#
# 1. Open the Foundry portal for this Hosted agent. Which of these does Foundry
#    manage for you: endpoint, autoscale, identity, tracing, content safety,
#    Toolbox tools? Which would you have to build yourself in Part C?
# 2. What breaks (or becomes harder) if we move this same agent code out of
#    Foundry Agent Service and run it ourselves in Azure Container Apps?
# 3. After finishing Part C: attempt the portal zip → Hosted agent flow with
#    your Part C code. Note what worked and what tripped you up.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
