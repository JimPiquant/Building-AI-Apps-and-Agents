"""
Day 4 Lab — Part A — Sequential, and its ceiling.

YOU AUTHOR THIS FILE. Two TODOs. A worked answer is in
solutions/part_a_sequential.py -- try it yourself first; the whole point of
Part A is what you SEE, and reading the solution skips that.

GOAL
Watch a Microsoft Agent Framework workflow execute, then find the wall that
SequentialBuilder runs into.

There is no scoring in this part. No golden set, no pass rate, no judge
model. You run two questions and read the event trace. Aggregate measurement
arrives in Part C, once there is something worth comparing.

WHAT YOU SHOULD SEE
Run 1 is a question the corpus answers cleanly. The trace shows Planner,
then Retriever, then Critic, each in its own superstep, one after another.

Run 2 is a question that spans two documents. The Planner will usually miss
part of it, the Retriever will report a gap, and the Critic will say
approved=false with a specific reason.

Then the workflow ends anyway.

That is the ceiling. `SequentialBuilder` is forward-only: there is no edge
from the Critic back to the Planner, so a rejection has nowhere to go. The
Critic can identify the problem perfectly and still be unable to do anything
about it. Part B is the fix for exactly this.

RUN WITH
    uv run part_a_sequential.py

TIP
Add `verbose=True` to run_and_trace(...) to print each executor's input and
output, not just its name. Noisy, but it is the fastest way to see what the
Planner actually decided.
"""

from __future__ import annotations

import asyncio

from agent_framework.orchestrations import SequentialBuilder

from agents import build_all
from trace import run_and_trace

CLEAN_QUESTION = "What is the requests-per-minute rate limit for a Standard tier subscription?"

SPANNING_QUESTION = (
    "A Premium customer has been receiving sustained 429 responses for the "
    "last 15 minutes. What incident severity does this get, and what should "
    "we tell them to change in their client?"
)


def build_sequential_workflow():
    """Wire the three roles into a forward-only pipeline.

    TODO (1 of 2)
    -------------
    Build a SequentialBuilder workflow with the three agents as participants,
    in the order Planner -> Retriever -> Critic, and return the built
    workflow.

    Two things worth knowing:

      * SequentialBuilder comes from `agent_framework.orchestrations`, not
        from `agent_framework` -- it ships in a separate package. The import
        at the top of this file is already correct.
      * By default only the LAST participant's response becomes workflow
        output. Pass `output_from="all"` if you want to see what the Planner
        and Retriever each produced, which is much more instructive here.

    Return the result of .build().
    """
    planner, retriever, critic = build_all()

    raise NotImplementedError("TODO 1: build and return the SequentialBuilder workflow")


async def main() -> None:
    print("=" * 74)
    print("RUN 1 — a question the corpus answers cleanly")
    print("=" * 74)
    print(f"\n  Q: {CLEAN_QUESTION}\n")

    workflow = build_sequential_workflow()
    await run_and_trace(workflow, CLEAN_QUESTION)

    print("=" * 74)
    print("RUN 2 — a question that spans two documents")
    print("=" * 74)
    print(f"\n  Q: {SPANNING_QUESTION}\n")

    # TODO (2 of 2)
    # ------------
    # Build a SECOND workflow instance and run it on SPANNING_QUESTION.
    #
    # Build it fresh rather than reusing the instance from Run 1. Reusing one
    # workflow across unrelated runs is the state-isolation trap Module 3
    # warns about: run 2 can inherit run 1's state. Fresh instance per run.
    raise NotImplementedError("TODO 2: build a fresh workflow and run SPANNING_QUESTION")

    print("=" * 74)
    print("What just happened")
    print("=" * 74)
    print(
        "\n  Read the Critic's output on Run 2. If it said approved=false,\n"
        "  it was right -- and nothing happened, because a Sequential\n"
        "  pipeline has no edge back to the Planner. The judgement was\n"
        "  correct and unusable.\n\n"
        "  Part B gives that rejection somewhere to go.\n"
    )


if __name__ == "__main__":
    asyncio.run(main())
