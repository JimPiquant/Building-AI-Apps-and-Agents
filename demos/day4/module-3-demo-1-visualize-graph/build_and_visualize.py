# Day 4 Demo — Module 3 — visualize the lab's own Planner/Retriever/Critic graph.
#
# The graph-building code in `build_graph_workflow()` below is copied
# (not imported) from labs/day4/python/solutions/part_b_graph.py — the
# worked answer to the lab's own Part B1 exercise. `agents.py`,
# `retrieval.py`, and `workflow_nodes.py` in this same directory are
# likewise copied from labs/day4/python/, with one change: workflow_nodes.py
# here has the Part B2 guardrail fix already applied (see that file's own
# docstring) so the optional live run below is safe to run without an
# unbounded loop.
#
# Copyright (c) Microsoft. All rights reserved.

from __future__ import annotations

import asyncio
import os

from agent_framework import (
    AgentExecutor,
    AgentExecutorRequest,
    Message,
    WorkflowBuilder,
    WorkflowViz,
)
from azure.identity import AzureCliCredential
from dotenv import load_dotenv

from agents import Answer, CriticResult, Findings, Plan, build_all
from workflow_nodes import (
    RevisionGate,
    finalize,
    is_final,
    needs_revision,
    to_findings,
    to_plan,
    to_revision,
)

load_dotenv()

SPANNING_QUESTION = (
    "A Premium customer has been receiving sustained 429 responses for the "
    "last 15 minutes. What incident severity does this get, and what should "
    "we tell them to change in their client?"
)


def build_graph_workflow():
    """The exact graph Part B1 asks attendees to build by hand.

    planner -> to_plan -> retriever -> to_findings -> critic -> gate
    gate -[needs_revision]-> to_revision -> planner   (the loop-back)
    gate -[is_final]-------> finalize -> workflow output
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
        .add_edge(planner_node, to_plan)
        .add_edge(to_plan, retriever_node)
        .add_edge(retriever_node, to_findings)
        .add_edge(to_findings, critic_node)
        .add_edge(critic_node, gate)
        .add_edge(gate, to_revision, condition=needs_revision)
        .add_edge(gate, finalize, condition=is_final)
        .add_edge(to_revision, planner_node)
        .build()
    )


def show_visualization() -> None:
    """The core of this demo: build the graph, render it, nothing else.

    No live model call happens here — WorkflowViz only inspects the
    graph's structure (executors and edges), so this part is instant,
    free, and can't fail on a flaky network.
    """
    workflow = build_graph_workflow()

    print("=" * 70)
    print("The lab's own Planner/Retriever/Critic graph, rendered live")
    print("=" * 70)
    print()
    print(WorkflowViz(workflow).to_mermaid())
    print()
    print(
        "Paste the Mermaid text above into https://mermaid.live — look for "
        "the DASHED edges out of revision_gate: one condition (needs_revision) "
        "loops back to planner; the other (is_final) goes to finalize. That "
        "loop-back is the one thing SequentialBuilder (Part A) cannot do."
    )


async def run_it_once() -> None:
    """OPTIONAL — if time permits. Runs the graph for real against a
    question that usually triggers at least one revision pass, so the
    loop-back edge you just saw on the diagram fires for real.

    This DOES make live model calls (uses the real bundled docs corpus in
    this demo's own data/docs/ — a copy of the lab's corpus). Skip this
    if you're tight on time; the visualization above is the payoff this
    module's slide asks for.
    """
    credential = AzureCliCredential()
    workflow = build_graph_workflow()

    print("\n" + "=" * 70)
    print("Optional — running it for real")
    print("=" * 70)
    print(f"\nQ: {SPANNING_QUESTION}\n")

    request = AgentExecutorRequest(
        messages=[Message(role="user", contents=[SPANNING_QUESTION])],
        should_respond=True,
    )
    stream = workflow.run(request, stream=True)
    print("Workflow flow:")
    async for event in stream:
        if event.type == "executor_invoked" and event.executor_id:
            print(f"  -> {event.executor_id}", flush=True)

    events = await stream.get_final_response()
    outputs = events.get_outputs()
    answers = [output for output in outputs if isinstance(output, Answer)]

    if not answers:
        output_types = ", ".join(type(output).__name__ for output in outputs) or "none"
        raise RuntimeError(f"Workflow completed without an Answer (outputs: {output_types})")

    for answer in answers:
        print(f"APPROVED — summary: {answer.summary}")
        print(f"citations: {answer.citations}")


if __name__ == "__main__":
    show_visualization()

    run_live = os.environ.get("RUN_LIVE", "").lower() in ("1", "true", "yes")
    if run_live:
        asyncio.run(run_it_once())
    else:
        print(
            "\n(Skipping the optional live run — set RUN_LIVE=1 to also run "
            "the graph for real against a sample question.)"
        )
