"""
Day 4 Lab — Part B1 worked answer (the graph).

The Part B2 bound lives separately, in solutions/part_b2_revision_gate.py.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow this solution to run directly while importing the workshop modules.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from agent_framework import (
    AgentExecutor,
    AgentExecutorRequest,
    Message,
    WorkflowBuilder,
    WorkflowViz,
)

from agents import Answer, CriticResult, Findings, Plan, build_all
from trace import print_answer, run_and_trace  # pyright: ignore[reportAttributeAccessIssue]
from workflow_nodes import (
    RevisionGate,
    finalize,
    is_final,
    needs_revision,
    to_findings,
    to_plan,
    to_revision,
)

SPANNING_QUESTION = (
    "A Premium customer has been receiving sustained 429 responses for the "
    "last 15 minutes. What incident severity does this get, and what should "
    "we tell them to change in their client?"
)


def build_graph_workflow():
    """TODOs 1-3 completed.

    Points worth noticing:

    * `start_executor` is keyword-only and required. There is no
      `.set_start_executor()` -- if you find that in a docstring somewhere, it
      is stale.

    * `add_edge` returns the builder, so the whole graph is one chain.

    * The two conditional edges out of the gate are a binary split on the same
      message: exactly one of `needs_revision` / `is_final` is true for any
      GateDecision. That is the shape the SDK's own edge_condition sample uses
      for its spam / not-spam routing.

    * The loop closes because `to_revision` points back at `planner_node`, a
      node that already exists in the graph. Nothing special marks it as a
      loop -- a cycle is just an edge pointing backwards.
    """
    planner, retriever, critic = build_all()

    planner.default_options["response_format"] = Plan
    retriever.default_options["response_format"] = Findings
    critic.default_options["response_format"] = CriticResult

    planner_node = AgentExecutor(planner, id="planner")
    retriever_node = AgentExecutor(retriever, id="retriever")
    critic_node = AgentExecutor(critic, id="critic")
    gate = RevisionGate()

    return (
        WorkflowBuilder(start_executor=planner_node)
        # forward path
        .add_edge(planner_node, to_plan)
        .add_edge(to_plan, retriever_node)
        .add_edge(retriever_node, to_findings)
        .add_edge(to_findings, critic_node)
        .add_edge(critic_node, gate)
        # the decision
        .add_edge(gate, to_revision, condition=needs_revision)
        .add_edge(gate, finalize, condition=is_final)
        # and back around
        .add_edge(to_revision, planner_node)
        .build()
    )


async def main() -> None:
    workflow = build_graph_workflow()

    print("=" * 74)
    print("The graph you built")
    print("=" * 74 + "\n")
    print(WorkflowViz(workflow).to_mermaid())

    print("\n" + "=" * 74)
    print("The question Part A could not fix")
    print("=" * 74)
    print(f"\n  Q: {SPANNING_QUESTION}\n")

    outputs = await run_and_trace(
        workflow,
        AgentExecutorRequest(
            messages=[Message("user", contents=[SPANNING_QUESTION])],
            should_respond=True,
        ),
    )

    print("=" * 74)
    print("Result")
    print("=" * 74 + "\n")
    for answer in outputs:
        if isinstance(answer, Answer):
            print_answer(answer)


if __name__ == "__main__":
    asyncio.run(main())
