"""
Day 4 Lab — Part B — The graph that fixes it.

YOU AUTHOR THIS FILE. Part B1 is the graph (TODOs 1-3). Part B2 is the
bound, and you write that one in workflow_nodes.py, not here.

GOAL
Rebuild Part A's three roles as an explicit WorkflowBuilder graph with a
conditional edge that routes an unapproved answer back to the Planner.

This is a genuine rewrite, not a diff on Part A. SequentialBuilder handed
you a pipeline; here you declare every node and every edge yourself. That is
the trade: you write more, and in exchange you can express a shape --
a loop -- that no prebuilt orchestration pattern offers.

THE GRAPH YOU ARE BUILDING

    planner ──▶ to_plan ──▶ retriever ──▶ to_findings ──▶ critic
                                                            │
                                                            ▼
      ┌──────────────── to_revision ◀────[needs_revision]── gate
      │                                                     │
      └──▶ planner                              [is_final]──┴──▶ finalize ──▶ output

The agent nodes and the adapters between them are provided in
workflow_nodes.py -- read that file before you start. Your job is the
wiring: which nodes connect, and under what condition.

WHY THE ADAPTERS ARE THERE
An Agent in a graph emits an `AgentExecutorResponse` carrying text. The typed
contracts (Plan, Findings, CriticResult) only exist once something parses
that text. The `to_*` executors do that, and build the next agent's request.
Real graphs are agent nodes separated by small typed adapters.

RUN WITH
    uv run part_b_graph.py

Part B2 adds:
    uv run pytest tests/test_guardrail.py -v
"""

from __future__ import annotations

import asyncio

from agent_framework import AgentExecutor, AgentExecutorRequest, Message, WorkflowViz

from agents import build_all
from trace import print_answer, run_and_trace
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
    """Build the Planner/Retriever/Critic graph with a revision loop.

    TODO (1 of 3) — wrap the agents
    -------------------------------
    Wrap each of the three agents in an `AgentExecutor` so its output arrives
    downstream as a typed `AgentExecutorResponse` the adapters can parse:

        planner_node = AgentExecutor(planner, id="planner")

    (You can pass a bare Agent to add_edge and the builder will wrap it for
    you, but wrapping explicitly is what lets the adapters see
    `.agent_response.text`.)

    TODO (2 of 3) — wire the forward path
    -------------------------------------
    Create the builder with the planner as the start node, then add edges:

        builder = WorkflowBuilder(start_executor=planner_node)

    `start_executor` is keyword-only and required; there is no
    `.set_start_executor()`. Then chain, in order:

        planner_node -> to_plan -> retriever_node -> to_findings
                     -> critic_node -> gate

    `add_edge` returns the builder, so you can chain calls.

    TODO (3 of 3) — wire the loop
    -----------------------------
    Two conditional edges out of the gate:

        gate -> to_revision   when `needs_revision` is true
        gate -> finalize      when `is_final` is true

    and then close the loop:

        to_revision -> planner_node

    A condition is any callable taking the upstream message and returning a
    bool; `needs_revision` and `is_final` are already written for you in
    workflow_nodes.py. Note what a condition does NOT get: the workflow
    context. It sees the message and nothing else -- which is why the
    revision counter lives inside the gate.

    Finally, .build() and return the workflow.

    ON max_iterations
    -----------------
    `WorkflowBuilder` takes a `max_iterations` argument that defaults to 100
    supersteps. It is a runaway backstop for the whole graph, not a revision
    policy: when it trips, the run stops there and you get no graceful
    answer. Leave it at the default. Part B2 is about adding a bound that
    belongs to your domain and ends the run deliberately.
    """
    planner, retriever, critic = build_all()
    gate = RevisionGate()

    raise NotImplementedError("TODO 1-3: build and return the graph workflow")


async def main() -> None:
    workflow = build_graph_workflow()

    print("=" * 74)
    print("The graph you built")
    print("=" * 74)
    print(
        "\nPaste this into any Mermaid renderer. The conditional edges render\n"
        "as dashed arrows -- look for the one going back to the planner. If\n"
        "it is not there, the loop is not there.\n"
    )
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
        print_answer(answer)

    print(
        "\n  Compare this trace against Part A's. If the revision loop fired,\n"
        "  the planner appears TWICE -- once on the first pass, once after\n"
        "  the Critic sent it back with feedback.\n\n"
        "  Now go break it: Part B2.\n"
    )


if __name__ == "__main__":
    asyncio.run(main())
