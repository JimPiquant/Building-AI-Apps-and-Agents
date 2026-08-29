import asyncio
import os
from typing import Annotated

from pydantic import Field

from agent_framework import (
    Agent, ExpectedToolCall, LocalEvaluator, evaluate_agent,
    tool, tool_call_args_match, tool_calls_present,
)
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


@tool
def wit_work_item(action: Annotated[str, Field(description="get, get_batch, my, or list_for_iteration")],
                   id: int) -> str:
    """Read an Azure DevOps work item."""
    return f"[READ] action={action} id={id}"


@tool
def wit_work_item_write(action: Annotated[str, Field(description="create, update, update_batch, or add_child")],
                         id: int) -> str:
    """Create or modify an Azure DevOps work item."""
    return f"[WRITE] action={action} id={id}"


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    agent = Agent(
        client=client,
        instructions="You are an Azure DevOps assistant. Use wit_work_item for reads, "
                        "wit_work_item_write for creates/updates.",
        tools=[wit_work_item, wit_work_item_write],
    )

    local = LocalEvaluator(tool_calls_present, tool_call_args_match)

    print("--- Passing case ---")
    passing = await evaluate_agent(
        agent=agent,
        queries=["Get work item 42."],
        expected_tool_calls=[ExpectedToolCall("wit_work_item", {"action": "get", "id": 42})],
        evaluators=local,
    )
    for r in passing:
        print(f"{r.provider}: {r.passed}/{r.total} passed")

    print("\n--- Seeded failing case ---")
    failing = await evaluate_agent(
        agent=agent,
        queries=["Mark work item 42 as reviewed."],
        expected_tool_calls=[ExpectedToolCall("wit_work_item", {"action": "get", "id": 42})],
        evaluators=local,
    )
    for r in failing:
        print(f"{r.provider}: {r.passed}/{r.total} passed")
        for item in r.items:
            print(f"  [{item.status}] {item.input_text} -> {(item.output_text or '')[:80]}")


asyncio.run(main())
