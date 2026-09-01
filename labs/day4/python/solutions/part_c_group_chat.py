"""
Day 4 Lab — Part C worked answer.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow this solution to run directly while importing the workshop modules.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from agent_framework import Agent
from agent_framework.orchestrations import GroupChatBuilder

from agents import build_all, build_client
from part_c_group_chat import ORCHESTRATOR_INSTRUCTIONS, SPANNING_QUESTION
from trace import run_and_trace  # pyright: ignore[reportAttributeAccessIssue]

# Three roles, plus up to two revision passes, needs roughly eight assistant
# turns. Past that the orchestrator is not converging, and this bound is the
# group-chat equivalent of Part B2's revision cap -- same reasoning, different
# mechanism.
MAX_ASSISTANT_TURNS = 8


def build_group_chat_workflow():
    """TODO completed."""
    planner, retriever, critic = build_all()
    orchestrator = Agent(
        client=build_client(),
        name="Orchestrator",
        description="Coordinates the research team by selecting who speaks next",
        instructions=ORCHESTRATOR_INSTRUCTIONS,
    )

    return GroupChatBuilder(
        participants=[planner, retriever, critic],
        orchestrator_agent=orchestrator,
        termination_condition=lambda messages: sum(
            1 for m in messages if m.role == "assistant"
        )
        >= MAX_ASSISTANT_TURNS,
        intermediate_output_from=[planner, retriever, critic],
    ).build()


async def main() -> None:
    workflow = build_group_chat_workflow()
    print(f"\n  Q: {SPANNING_QUESTION}\n")
    await run_and_trace(workflow, SPANNING_QUESTION)


if __name__ == "__main__":
    asyncio.run(main())
