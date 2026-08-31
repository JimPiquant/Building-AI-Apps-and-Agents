"""
Day 3 Lab — Part C — Read-only Azure DevOps MCP.

This file is provided complete — run it to prove the read-only header
holds against the workshop's Azure DevOps organization, then read through
it before moving on to Part D.

Story (one agent, two requests against the known work item in .env):
  1. A read request — should succeed and return the title/state.
  2. A write REQUEST against the same work item — which the agent cannot
     carry out, because ado_mcp.build_read_only_ado_mcp() sends
     X-MCP-Readonly: true and the server responds by omitting every write
     tool from the list it advertises. No write call is attempted and none
     is rejected: the capability is withheld at tool discovery, so the
     agent has nothing to call and reports that it cannot make the change.
     The boundary is enforced by the server, not by the agent's
     instructions or judgment.

Same two-request pattern as
demos/day3/module-6-demo-1-read-only-ado/main.py — this file wires the
shared ado_mcp.build_read_only_ado_mcp() (Part C+D's common support
module) into a plain agent instead of repeating the MCP connection setup
inline.

Definition of done (from labs/day3/README.md / Module 9's slide):
  - Read succeeds; the write request completes with no write tool having
    been offered; dedicated project only — never point this at your
    organization's real production Azure DevOps project

Prereqs:
  1. `uv run agent.py` prints a greeting (baseline works)
  2. The workshop's shared Azure DevOps org + your own dedicated project,
     plus a known work item ID, are set in .env — see labs/day3/README.md's
     Prerequisites section
  3. Be ready for a one-time browser sign-in prompt
     (InteractiveBrowserCredential, cached after the first run — see
     ado_mcp.py)

Run with:
    uv run part_c_read_only.py

Tip: set a breakpoint after the write-request agent.run() call and
inspect write_result in the VS Code debugger (Run and Debug > Python
File) — read its text to see how the agent reports a capability it was
never offered, rather than the process crashing. Note that this text is
the model's own explanation; the authoritative evidence is the tool list
the server advertised, which is why Part D's identical request behaves
differently.
"""
from __future__ import annotations

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

from ado_mcp import build_read_only_ado_mcp

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def build_agent() -> Agent:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    return Agent(client=client, instructions="You are a helpful Azure DevOps assistant.")


async def main() -> None:
    project = os.environ["AZURE_DEVOPS_PROJECT"]
    work_item_id = os.environ["AZURE_DEVOPS_WORK_ITEM_ID"]

    agent = build_agent()

    async with build_read_only_ado_mcp() as mcp:
        print("--- Read: should succeed ---")
        read_result = await agent.run(
            f"Get work item {work_item_id} in project {project} and summarize its title and state.",
            tools=mcp,
        )
        print(read_result, "\n")

        print("--- Write request: no write tool is offered under X-MCP-Readonly: true ---")
        write_result = await agent.run(
            f"Update work item {work_item_id} in project {project}: add a comment saying 'reviewed'.",
            tools=mcp,
        )
        print(write_result)


if __name__ == "__main__":
    asyncio.run(main())
