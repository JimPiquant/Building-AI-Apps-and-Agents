# Day 4 Demo — Module 5 — trajectory, cost, and the eval -> change -> re-eval loop.
#
# Self-contained, deliberately small — same spirit as Day 3 Module 7's
# evaluation demo (a tiny mock scenario, not the full lab harness), so
# this stays fast and easy to reason about live. Two agents
# (researcher -> writer) via SequentialBuilder — the same construction
# already proven in Module 1's demo — with ONE local tool backed by a
# plain dict, no docs corpus, no Azure DevOps, no live judge model.
#
# Copyright (c) Microsoft. All rights reserved.

from __future__ import annotations

import asyncio
import os
import time
from typing import Annotated

from agent_framework import Agent, AgentResponse, Message, tool
from agent_framework.foundry import FoundryChatClient
from agent_framework.orchestrations import SequentialBuilder
from azure.identity import AzureCliCredential
from dotenv import load_dotenv
from pydantic import Field

load_dotenv()

PROMPT = "What is the requests-per-minute rate limit for a Standard tier subscription?"
EXPECTED_ACTIONS = ["lookup_rate_limit"]
MUST_MENTION = "1,200"

RATE_LIMITS = {
    "free": "60 requests per minute",
    "standard": "1,200 requests per minute",
    "premium": "12,000 requests per minute",
}


@tool
def lookup_rate_limit(
    tier: Annotated[str, Field(description="Subscription tier: free, standard, or premium.")],
) -> str:
    """Look up the requests-per-minute rate limit for a subscription tier."""
    return RATE_LIMITS.get(tier.lower(), f"Unknown tier: {tier}")


WRITER_INSTRUCTIONS = (
    "You are a writer. Answer the user's question in one sentence, using "
    "only the researcher's findings above. If the researcher gave you no "
    "findings, say plainly that you don't know — never guess a number."
)

# The ONE thing this demo changes between runs. Everything else — the
# prompt, the tool, the writer, the workflow topology — stays identical.
RESEARCHER_INSTRUCTIONS = {
    "BEFORE": (
        "You are a helpful researcher. Answer the user's question about "
        "subscription rate limits. Do not use any tools, just make up something plausable."
    ),
    "AFTER": (
        "You are a researcher. You MUST call lookup_rate_limit for the "
        "relevant tier before answering — never state a rate limit number "
        "from memory, even if you think you know it."
    ),
}


def build_client() -> FoundryChatClient:
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )


def collect_actions(messages: list[Message]) -> list[str]:
    """The trajectory: every function_call content item, in order. Same
    approach Day 3 Module 7's evaluate_agent used for a single agent,
    now reading across BOTH agents' messages in this 2-agent workflow —
    the exact generalization Module 5's slide describes."""
    actions: list[str] = []
    for message in messages:
        for content in message.contents:
            if content.type == "function_call":
                actions.append(content.name)
    return actions


def collect_tokens(outputs: list[AgentResponse]) -> int:
    total = 0
    for output in outputs:
        usage = output.usage_details or {}
        total += usage.get("total_token_count") or 0
    return total


async def run_case(label: str, researcher_instructions: str) -> None:
    client = build_client()
    researcher = Agent(
        client=client,
        name="researcher",
        instructions=researcher_instructions,
        tools=[lookup_rate_limit],
    )
    writer = Agent(client=client, name="writer", instructions=WRITER_INSTRUCTIONS)

    # intermediate_output_from=[researcher]: without this, only the writer's
    # final message comes back — and the researcher's tool call (the
    # trajectory this demo scores) would never be visible. Same technique
    # Module 1's demo already showed live.
    workflow = SequentialBuilder(
        participants=[researcher, writer],
        intermediate_output_from=[researcher],
    ).build()

    wall_start = time.monotonic()
    events = await workflow.run(PROMPT)
    wall_elapsed = time.monotonic() - wall_start

    outputs = [o for o in events.get_outputs() if isinstance(o, AgentResponse)]
    all_messages = [msg for output in outputs for msg in output.messages]

    actions = collect_actions(all_messages)
    tokens = collect_tokens(outputs)
    final_text = outputs[-1].messages[-1].text if outputs and outputs[-1].messages else ""

    trajectory_ok = actions == EXPECTED_ACTIONS
    system_ok = MUST_MENTION in final_text

    print(f"\n===== {label} =====")
    print(f"  Process eval  — trajectory: {actions or '(no tool calls)'}")
    print(f"                  expected:   {EXPECTED_ACTIONS}")
    print(f"                  {'PASS' if trajectory_ok else 'FAIL'} (Task Navigation Efficiency, exact_match)")
    print(f"  System eval   — final answer: {final_text!r}")
    print(f"                  {'PASS' if system_ok else 'FAIL'} (contains {MUST_MENTION!r})")
    print(f"  Cost          — {tokens} tokens this run")
    print(f"  Wall time     — {wall_elapsed:.2f}s")


async def main() -> None:
    print("=" * 70)
    print("BEFORE — vague researcher instructions, no explicit tool requirement")
    print("=" * 70)
    await run_case("BEFORE", RESEARCHER_INSTRUCTIONS["BEFORE"])

    print("\n" + "=" * 70)
    print("Change ONE thing: the researcher's instructions now require the tool")
    print("=" * 70)
    await run_case("AFTER", RESEARCHER_INSTRUCTIONS["AFTER"])

    print(
        "\nSame prompt, same tool, same writer, same workflow topology. The "
        "only thing that changed between BEFORE and AFTER is one sentence in "
        "the researcher's instructions. Compare the two PASS/FAIL lines above "
        "— that delta is the eval -> change -> re-eval loop, run live."
    )


if __name__ == "__main__":
    asyncio.run(main())
