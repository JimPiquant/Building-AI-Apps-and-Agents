"""
Day 4 Lab — Part A worked answer.

Both TODOs completed. The two functions below replace their counterparts in
part_a_sequential.py.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow this solution to run directly while importing the workshop modules.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from agent_framework.orchestrations import SequentialBuilder

from agents import build_all
from trace import run_and_trace  # pyright: ignore[reportAttributeAccessIssue]

CLEAN_QUESTION = "What is the requests-per-minute rate limit for a Standard tier subscription?"

SPANNING_QUESTION = (
    "A Premium customer has been receiving sustained 429 responses for the "
    "last 15 minutes. What incident severity does this get, and what should "
    "we tell them to change in their client?"
)


def build_sequential_workflow():
    """TODO 1 completed.

    output_from="all" is the part worth noticing. Without it only the Critic's
    response becomes workflow output, and the trace shows you a verdict with
    no visible reasoning behind it. With it you see all three participants and
    can read the Planner's decomposition -- which is usually where a failing
    case actually goes wrong.
    """
    planner, retriever, critic = build_all()
    return SequentialBuilder(
        participants=[planner, retriever, critic],
        output_from="all",
    ).build()


async def main() -> None:
    print("=" * 74)
    print("RUN 1 — a question the corpus answers cleanly")
    print("=" * 74)
    print(f"\n  Q: {CLEAN_QUESTION}\n")
    await run_and_trace(build_sequential_workflow(), CLEAN_QUESTION)

    print("=" * 74)
    print("RUN 2 — a question that spans two documents")
    print("=" * 74)
    print(f"\n  Q: {SPANNING_QUESTION}\n")

    # TODO 2 completed: a FRESH workflow, not the instance from run 1.
    await run_and_trace(build_sequential_workflow(), SPANNING_QUESTION)

    print("=" * 74)
    print("What just happened")
    print("=" * 74)
    print(
        "\n  The Critic on Run 2 most likely returned approved=false with a\n"
        "  precise reason -- and the workflow ended anyway. SequentialBuilder\n"
        "  is forward-only; there is no edge back to the Planner for that\n"
        "  rejection to travel along.\n"
    )


if __name__ == "__main__":
    asyncio.run(main())
