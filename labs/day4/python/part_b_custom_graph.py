"""
Day 4 Lab — Part B — A custom graph fixes it.

You'll build this in Part B:

    - Rebuild Part A's three roles using WorkflowBuilder instead of
      SequentialBuilder — a genuine rewrite of the orchestration plumbing,
      not a small diff on Part A's code.
    - Add a conditional edge routing the Critic back to the Planner when
      the check fails (Module 3's "Conditional edges in code" slide):
        builder.add_edge(critic, planner, condition=lambda r: not r.approved)
    - Add a REQUIRED budget guardrail — a conditional edge has no built-in
      max_iterations (unlike AgentLoopMiddleware's single-agent loop), so
      the Critic-to-Planner loop can run forever if the model never
      approves. Track a counter in workflow state (ctx.set_state/
      get_state) and check it inside the condition function.
    - Run it against the SAME golden set as Part A and confirm the
      questions that failed in Part A now pass, or at least get a
      genuine second attempt.

--------------------------------------------------------------------------
Definition of done for Part B (from labs/day4/README.md):
  - Revision loop works; trajectory eval scores and cost per successful
    outcome captured
  - Budget guardrail triggers cleanly in a stress test - REQUIRED, not
    stretch
--------------------------------------------------------------------------

TODO: implement build_workflow() below using
agent_framework.WorkflowBuilder, the conditional-edge API from Module 3's
"Edges: how messages flow" slide, and workflow state (ctx.set_state/
get_state) for the iteration counter. Reuse roles.py unchanged.
"""
from __future__ import annotations

import asyncio

from agent_framework import WorkflowBuilder

from roles import build_critic, build_planner, build_retriever

MAX_REVISIONS = 3  # the required budget guardrail — tune during authoring


def build_workflow():
    """Part B: Planner -> Retriever -> Critic, with a bounded Critic -> Planner loop."""
    raise NotImplementedError("Build the WorkflowBuilder graph with the conditional edge and guardrail counter here.")


async def main() -> None:
    raise NotImplementedError("Part B: build the workflow, run it against evals/golden_set.jsonl, and print the results.")


if __name__ == "__main__":
    asyncio.run(main())
