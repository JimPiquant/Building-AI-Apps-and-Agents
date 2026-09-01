"""
Day 4 Lab — Part A — Workflow basics.

This file is provided complete — run it to see how a workflow is actually
built, by hand, before Part B shows you the prebuilt shortcuts. No golden
set here, no evaluation — that's Part C's job. This part is purely about
the graph primitives Module 3 teaches: executors, edges, and how a
workflow decides what counts as its output.

Story:
  1. Wrap each of the shared Planner/Retriever/Critic roles (roles.py) in
     an `AgentExecutor` and wire them into a straight-line graph with
     `WorkflowBuilder` + `add_edge` — no conditional edges, no loop-back,
     just planner -> retriever -> critic in a fixed order.
  2. Run it once against a single sample question and read the result.
  3. Visualize the graph you just built with `WorkflowViz` (Module 3's
     own "Visualize the graph you just built" slide) — render it as
     Mermaid text, no extra dependency required.

Grounding note — why `output_from=[critic]` is not optional decoration.
Confirmed against Microsoft Learn's "Agent Executor" reference: every
`AgentExecutor`, by default, yields its own response as a workflow output
event — not just the LAST one in the chain. Without `output_from`,
`workflow.run(...).get_outputs()` on this 3-executor graph would return
THREE responses (the Planner's Plan, the Retriever's RetrievalResult, AND
the Critic's CriticVerdict), not just the Critic's — because nothing here
designates a single "the" output the way you'd expect from a single
function call. `output_from=[critic]` is exactly how you make that
designation explicit. (Leaving it out is also now flagged deprecated by
the framework itself — "compatibility mode" — so this lab teaches the
current, explicit form directly, not the old implicit default.)

This detail matters for Part B: `SequentialBuilder` is doing exactly this
kind of designation FOR you — it wires the same three executors together
and quietly picks the last participant as the one whose response counts
as "the" output (with `intermediate_output_from=[...]` available if you
want the earlier ones surfaced too). Once you've seen `output_from` spelled
out here, Part B's shortcut stops looking like magic.

--------------------------------------------------------------------------
Definition of done for Part A (from labs/day4/README.md):
  - The graph runs end-to-end and prints the Critic's structured verdict
  - The rendered Mermaid diagram matches the three-executor, two-edge
    graph described above (planner -> retriever -> critic, no loop)
--------------------------------------------------------------------------

Prereqs:
  1. `uv run agent.py` prints a greeting (baseline works)

Run with:
    uv run part_a_workflow_basics.py

VS Code debugger tip: breakpoint on the `events = await workflow.run(...)`
line and step into `events.get_outputs()` — with a single element in the
returned list, you can see directly that `output_from=[critic]` is the
reason there's exactly one, not three.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import AgentExecutor, WorkflowBuilder, WorkflowViz
from azure.identity import AzureCliCredential

from roles import build_critic, build_planner, build_retriever, extract_verdict

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SAMPLE_QUERY = "What are the prerequisites before I make my first API call?"


def build_workflow(credential: AzureCliCredential):
    """Part A: Planner -> Retriever -> Critic, wired by hand with
    WorkflowBuilder — a straight-line graph, no loop. Call this fresh for
    every task/request: reusing one workflow instance across unrelated
    questions leaks agent conversation threads between them (confirmed
    against Microsoft Learn's Workflows "State Isolation" guidance — wrap
    construction in a helper function so each run gets fresh instances)."""
    planner = AgentExecutor(build_planner(credential), id="planner")
    retriever = AgentExecutor(build_retriever(credential), id="retriever")
    critic = AgentExecutor(build_critic(credential), id="critic")

    return (
        WorkflowBuilder(start_executor=planner, output_from=[critic])
        .add_edge(planner, retriever)
        .add_edge(retriever, critic)
        .build()
    )


async def main() -> None:
    credential = AzureCliCredential()
    workflow = build_workflow(credential)

    print(f"Query: {SAMPLE_QUERY}\n")
    events = await workflow.run(SAMPLE_QUERY)
    outputs = events.get_outputs()
    print(f"{len(outputs)} designated output(s) — output_from=[critic] means exactly one.\n")

    verdict = extract_verdict(outputs[0])
    print(f"approved={verdict.approved}")
    if verdict.approved:
        print(f"summary: {verdict.answer.summary}")
        print(f"citations: {verdict.answer.citations}")
    else:
        print(f"feedback: {verdict.feedback}")
        print(
            "\nNo way to act on that feedback here — this graph has no "
            "loop back to the Planner. That's Part B's problem to solve, "
            "not a bug in this file."
        )

    print("\n--- Visualizing the graph (Module 3's WorkflowViz) ---")
    viz = WorkflowViz(workflow)
    print(viz.to_mermaid())
    print(
        "\nPaste the Mermaid text above into any Mermaid renderer "
        "(https://mermaid.live, or a VS Code Mermaid preview extension) "
        "to see the graph you just built: three executors, two direct "
        "edges, no conditional edges, no loop."
    )


if __name__ == "__main__":
    asyncio.run(main())
