"""
Day 3 Lab — Part D — Approved write.

This file is provided complete — run it to see a write pause for your
approval, then verify the mutation actually took effect.

Story (one agent, two requests against the known work item in .env):
  1. An approval-gated write — the SAME "add a comment saying 'reviewed'"
     request Part C could not carry out, because X-MCP-Readonly: true kept
     every write tool out of the tool list the server advertised. Here
     ado_mcp.build_write_enabled_ado_mcp() sets X-MCP-Readonly: false, so
     the write tool is offered and the server accepts the call — but only
     after you approve it. agent.run() returns immediately with
     result.user_input_requests populated instead of executing the tool;
     the pause/resume loop below prints the exact tool name and arguments,
     asks you to approve, and resumes with your decision — the same
     mechanic demos/day3/module-5-demo-2-approval-mode/main.py
     demonstrates on a local calculator tool, wired here onto the ADO MCP
     tool instead.
  2. A read-again request on the same work item, to verify the mutation
     actually took effect. This read does NOT pause for approval —
     ado_mcp.build_write_enabled_ado_mcp()'s default approval_mode names
     both write tools (wit_work_item_write and
     wit_work_item_comment_write) but not wit_work_item, so the read tool
     proceeds automatically. This is the per-tool mapping Module 5's "approval_mode
     creates a human boundary" slide's table row describes: "Different
     rules by tool name — Read automatically; review writes."

Definition of done (from labs/day3/README.md / Module 9's slide):
  - Write requires approval; the read-after-write verifies the mutation;
    dedicated project only — never point this at your organization's real
    production Azure DevOps project

Prereqs:
  1. `uv run part_c_read_only.py` has run at least once (confirms your
     ADO connection and .env are correct, and shows what the SAME request
     looks like when the server offers no write tool at all)
  2. The workshop's shared Azure DevOps org + your own dedicated project,
     plus a known work item ID, are set in .env — see labs/day3/README.md's
     Prerequisites section

Run with:
    uv run part_d_approved_write.py

Tip: set a breakpoint on the `while result.user_input_requests:` line in
run_with_approval() and step through with the VS Code debugger (Run and
Debug > Python File) to inspect exactly what a FunctionApprovalRequestContent
looks like before you approve or reject it.
"""
from __future__ import annotations

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent, AgentResponse, Message, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

from ado_mcp import build_write_enabled_ado_mcp

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def build_agent() -> Agent:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    return Agent(client=client, instructions="You are a helpful Azure DevOps assistant.")


async def run_with_approval(agent: Agent, query: str, mcp: MCPStreamableHTTPTool) -> AgentResponse:
    """Run a request that may pause for approval, resuming after each decision.

    Reuse one session so Foundry retains the complete assistant response,
    including reasoning content associated with an approved function call.
    """
    session = agent.create_session()
    result = await agent.run(query, tools=mcp, session=session)

    while result.user_input_requests:
        approval_responses = []
        for request in result.user_input_requests:
            if request.function_call is None:
                continue
            print(f"\nApproval requested for: {request.function_call.name}")
            print(f"Arguments: {request.function_call.arguments}")
            approval = input("Approve? (y/n): ")
            approval_responses.append(request.to_function_approval_response(approval.lower() == "y"))
        result = await agent.run(
            Message("user", approval_responses),
            tools=mcp,
            session=session,
        )

    return result


async def main() -> None:
    project = os.environ["AZURE_DEVOPS_PROJECT"]
    work_item_id = os.environ["AZURE_DEVOPS_WORK_ITEM_ID"]

    agent = build_agent()

    async with build_write_enabled_ado_mcp() as mcp:
        print("--- Approved write: add a comment (requires approval) ---")
        write_query = f"Update work item {work_item_id} in project {project}: add a comment saying 'reviewed'."
        write_result = await run_with_approval(agent, write_query, mcp)
        print("\nFinal:", write_result, "\n")

        print("--- Read again: verify the mutation actually took effect ---")
        read_result = await agent.run(
            f"Get work item {work_item_id} in project {project} and show its most recent comment.",
            tools=mcp,
        )
        print(read_result)


if __name__ == "__main__":
    asyncio.run(main())
