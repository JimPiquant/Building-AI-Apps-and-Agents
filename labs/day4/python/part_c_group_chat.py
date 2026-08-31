"""
Day 4 Lab — Part C — Swap to Group Chat.

You'll build this in Part C:

    - Rebuild the same three roles again, this time with GroupChatBuilder
      and an orchestrator_agent playing the Critic's judging role (Module
      2's "Group Chat in code" pattern:
        GroupChatBuilder(participants=[...], orchestrator_agent=...)
      This is a genuine second implementation, not a one-line pattern
      swap on Part B's graph.
    - Re-run the SAME golden set used in Parts A and B.
    - Quantify the delta against Part B: did the trajectory pass rate
      change? Did cost per successful outcome change?
    - Write a short reflection: which approach (Part B's custom graph or
      Part C's Group Chat) fit best, and why. This is part of Done, not
      an afterthought.

--------------------------------------------------------------------------
Definition of done for Part C (from labs/day4/README.md):
  - Rebuilt with Group Chat; same golden set re-run; delta vs. Part B
    quantified
  - Reflection committed to the repo: which approach fit best, and why
--------------------------------------------------------------------------

TODO: implement build_workflow() below using
agent_framework.orchestrations.GroupChatBuilder with an orchestrator_agent
that plays the Critic's judge role, following Module 2's Group Chat
orchestration slides. Reuse roles.py unchanged. Reuse Part B's evaluation
code/golden-set loading rather than re-authoring it.
"""
from __future__ import annotations

import asyncio

from agent_framework.orchestrations import GroupChatBuilder

from roles import build_critic, build_planner, build_retriever


def build_workflow():
    """Part C: Planner/Retriever participants, an orchestrator_agent playing the Critic's role."""
    raise NotImplementedError("Build the GroupChatBuilder workflow with a custom orchestrator_agent here.")


async def main() -> None:
    raise NotImplementedError(
        "Part C: build the workflow, re-run it against evals/golden_set.jsonl, "
        "and quantify the delta against Part B's results."
    )


if __name__ == "__main__":
    asyncio.run(main())
