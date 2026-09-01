"""
Day 4 Lab — Part C — Change one thing, measure it.

YOU AUTHOR THIS FILE. One TODO here; the rest of Part C is running the
harness and reading what it tells you.

GOAL
You have a working Part B. Now answer a question you cannot answer by
looking at it: is a different orchestration better?

This is Module 5's eval -> change -> re-eval loop, and it is the first point
in the lab where aggregate measurement is the right tool. Parts A and B were
about seeing one run clearly. Comparing two orchestrations is a question
about a distribution, and a distribution needs a golden set.

WHAT YOU DO
  1. Build the same three roles with GroupChatBuilder instead of a graph.
  2. Run evaluate.py against Part B and Part C on the same eight cases.
  3. Read the comparison and decide whether the change helped.

HOW GROUP CHAT DIFFERS
In your Part B graph you decided the order. In a group chat an orchestrator
agent picks who speaks next, turn by turn, until a termination condition
fires. You are handing the routing decision to a model -- Module 1's
spectrum, one notch toward "the model decides".

That is a real trade, not a cosmetic swap. The orchestrator may reach a good
answer in fewer turns than your fixed graph, or it may wander. Measuring is
the only way to know which.

RUN WITH
    uv run part_c_group_chat.py                 # one question, see it work
    uv run evaluate.py --part b --part c        # the comparison that matters
"""

from __future__ import annotations

import asyncio

from agent_framework import Agent, Message
from agent_framework.orchestrations import GroupChatBuilder

from agents import build_all, build_client
from trace import run_and_trace

SPANNING_QUESTION = (
    "A Premium customer has been receiving sustained 429 responses for the "
    "last 15 minutes. What incident severity does this get, and what should "
    "we tell them to change in their client?"
)

ORCHESTRATOR_INSTRUCTIONS = """\
You coordinate a documentation research team: a Planner, a Retriever, and a
Critic.

Choose who speaks next based on what the conversation still needs:
- Nothing planned yet -> Planner.
- A plan exists but no documents retrieved -> Retriever.
- Findings exist but no judgement -> Critic.
- The Critic asked for more and named a gap -> Planner, to replan for it.
- The Critic approved -> the work is done.

Keep the team moving toward a cited answer. Do not let the same participant
speak twice in a row unless the conversation genuinely calls for it.
"""


def build_group_chat_workflow():
    """Build the same three roles as a group chat.

    TODO
    ----
    Build and return a GroupChatBuilder workflow.

        GroupChatBuilder(
            participants=[planner, retriever, critic],
            orchestrator_agent=orchestrator,
            termination_condition=<callable>,
        ).build()

    Notes that will save you time:

      * GroupChatBuilder comes from `agent_framework.orchestrations`, the
        same separate package as SequentialBuilder. Already imported above.

      * `orchestrator_agent` is a real Agent instance, not a function. One is
        built for you below with ORCHESTRATOR_INSTRUCTIONS.

      * `termination_condition` receives the message list and returns a bool.
        THIS IS YOUR BOUND, and it is required for the same reason Part B2's
        was: an orchestrator that keeps finding more to do will keep going.
        Something like "stop once there have been 8 assistant turns" is a
        reasonable ceiling for three roles and up to two revision passes:

            lambda messages: sum(
                1 for m in messages if m.role == "assistant"
            ) >= 8

      * The orchestrator must support structured outputs -- the group chat
        sets `response_format` internally when it invokes that agent. The
        workshop model handles this; a smaller model may not.

    Return the built workflow.
    """
    planner, retriever, critic = build_all()
    orchestrator = Agent(
        client=build_client(),
        name="Orchestrator",
        description="Coordinates the research team by selecting who speaks next",
        instructions=ORCHESTRATOR_INSTRUCTIONS,
    )

    raise NotImplementedError("TODO: build and return the GroupChatBuilder workflow")


async def main() -> None:
    workflow = build_group_chat_workflow()

    print("=" * 74)
    print("Part C — the same question, orchestrated by an agent")
    print("=" * 74)
    print(f"\n  Q: {SPANNING_QUESTION}\n")

    outputs = await run_and_trace(workflow, SPANNING_QUESTION)

    print("=" * 74)
    print("Result")
    print("=" * 74 + "\n")
    for output in outputs:
        if isinstance(output, list):
            for message in output:
                author = getattr(message, "author_name", None) or message.role
                text = " ".join(str(getattr(message, "text", "")).split())
                print(f"  [{author}] {text[:160]}")
        else:
            print(f"  {output}")

    print(
        "\n  Count the turns against Part B's trace. Then run:\n\n"
        "      uv run evaluate.py --part b --part c\n\n"
        "  and let the golden set settle it.\n"
    )


if __name__ == "__main__":
    asyncio.run(main())
