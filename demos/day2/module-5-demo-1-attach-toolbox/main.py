"""
Module 5 · Demo 1 — Consume a hosted Foundry toolbox from a local MAF agent.

Client-side agent. No hosting server, no azd, no container. This script
runs locally and consumes a toolbox that already exists in your Foundry
project via its MCP endpoint.

Setup:
    1. Publish a toolbox in your Foundry project (see Learn's toolbox
       quickstart: https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox?pivots=python)
       and note its consumer endpoint URL. Format:
         https://<account>.services.ai.azure.com/api/projects/<project>/toolboxes/<toolbox-name>/mcp?api-version=v1

        You can find the full URL in the Foundry portal by selecting the toolbox or editing it. You can also:

        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        azd ai toolbox show web-search-toolbox --output json

    2. Create a .env file in this folder with:

           FOUNDRY_PROJECT_ENDPOINT=https://<account>.services.ai.azure.com/api/projects/<project>
           FOUNDRY_MODEL=gpt-5.6-luna
           FOUNDRY_TOOLBOX_ENDPOINT=<full MCP endpoint from step 1>

    3. Sign in locally:  az login

    4. Install deps:     uv sync

Usage:
    uv run python main.py
    uv run python main.py "What time is it in London right now?"

The default question at the bottom of main() is a stand-in — replace it
with something that will exercise a tool your toolbox actually publishes
(web_search, azure_ai_search, a custom time utility, etc.).

Reference: Learn — Create and manage a toolbox in Foundry (Python pivot)
    https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox?pivots=python
"""
from __future__ import annotations

import asyncio
import os
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.core.credentials import TokenCredential
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

load_dotenv(Path(__file__).parent / ".env")

TOOLBOX_ENDPOINT = os.environ.get("FOUNDRY_TOOLBOX_ENDPOINT")
if not TOOLBOX_ENDPOINT:
    raise SystemExit(
        "Set FOUNDRY_TOOLBOX_ENDPOINT in .env — the toolbox MCP consumer URL "
        "from your Foundry project."
    )


def make_toolbox_header_provider(
    credential: TokenCredential,
) -> Callable[[dict[str, Any]], dict[str, str]]:
    """Return a header_provider that injects a fresh Entra bearer token per request.

    azure-identity's get_bearer_token_provider returns a callable that always
    hands back a valid, cached token — refreshed automatically when the current
    one nears expiry. MCPStreamableHTTPTool calls the header_provider on every
    request, so each MCP call carries a current token without any manual
    refresh logic.
    """
    get_token = get_bearer_token_provider(credential, "https://ai.azure.com/.default")

    def provide(_kwargs: dict[str, Any]) -> dict[str, str]:
        return {"Authorization": f"Bearer {get_token()}"}

    return provide


async def run(question: str) -> None:
    credential = DefaultAzureCredential()

    toolbox_tool = MCPStreamableHTTPTool(
        name="foundry_toolbox",
        description="Tools exposed by the configured Foundry toolbox.",
        url=TOOLBOX_ENDPOINT,
        header_provider=make_toolbox_header_provider(credential),
        load_prompts=False,
    )

    async with Agent(
        client=FoundryChatClient(credential=credential),
        name="toolbox-demo-agent",
        instructions=(
            "You are a helpful assistant with access to Foundry toolbox tools. "
            "Use them whenever they can improve the answer."
        ),
        tools=toolbox_tool,
    ) as agent:
        result = await agent.run(question)
        print(result)


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else (
        "What tools do you have access to?"
    )
    asyncio.run(run(question))


if __name__ == "__main__":
    main()
