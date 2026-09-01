# Copyright (c) Microsoft. All rights reserved.
#
# Minimal, clearly-noted adaptation of the official
# `sequential_workflow_as_agent.py` sample (see that file in this same
# directory) — same writer -> reviewer workflow, same prompt, but this
# script builds TWO workflow-agents back to back so you can compare them
# directly instead of reading the sample's docstring note about it.
#
# The sample's own comment says: "workflow.as_agent() returns ONLY the
# final agent's response... To preserve earlier participant replies...
# build with intermediate_output_from=[writer]." This script proves that
# claim by running both configurations and counting messages — rather
# than asserting exactly HOW the writer's earlier message is represented
# (its content type is an implementation detail worth confirming on your
# own installed agent-framework version during your dry run; the message
# COUNT difference below is the reliable, easy-to-see payoff).

import asyncio
import os

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework.orchestrations import SequentialBuilder
from azure.identity import AzureCliCredential
from dotenv import load_dotenv

load_dotenv()

PROMPT = "Write a tagline for a budget-friendly eBike."


def build_agents(client: FoundryChatClient) -> tuple[Agent, Agent]:
    writer = Agent(
        client=client,
        instructions=("You are a concise copywriter. Provide a single, punchy marketing sentence based on the prompt."),
        name="writer",
    )
    reviewer = Agent(
        client=client,
        instructions=("You are a thoughtful reviewer. Give brief feedback on the previous assistant message."),
        name="reviewer",
    )
    return writer, reviewer


def print_messages(label: str, messages: list) -> None:
    print(f"\n===== {label}: {len(messages)} message(s) =====")
    for i, msg in enumerate(messages, start=1):
        name = msg.author_name or msg.role
        content_types = ", ".join(sorted({c.type for c in msg.contents})) or "(none)"
        print(f"{'-' * 60}\n{i:02d} [{name}] content types: {content_types}\n{msg.text or '(no .text content)'}")


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["FOUNDRY_MODEL"],
        credential=AzureCliCredential(),
    )

    # Configuration A — the sample as shipped: no intermediate_output_from.
    writer_a, reviewer_a = build_agents(client)
    workflow_a = SequentialBuilder(participants=[writer_a, reviewer_a]).build()
    response_a = await workflow_a.as_agent().run(PROMPT)
    print_messages("A) default (no intermediate_output_from)", response_a.messages)

    # Configuration B — same workflow, plus intermediate_output_from=[writer].
    writer_b, reviewer_b = build_agents(client)
    workflow_b = SequentialBuilder(
        participants=[writer_b, reviewer_b],
        intermediate_output_from=[writer_b],
    ).build()
    response_b = await workflow_b.as_agent().run(PROMPT)
    print_messages("B) with intermediate_output_from=[writer]", response_b.messages)

    print(
        "\nCompare the message counts above. Configuration A shows only the "
        "reviewer's final response — the writer's own draft ran, but nothing "
        "designated it as part of the answer, so workflow.as_agent() dropped "
        "it. Configuration B designates the writer's response too, and it "
        "shows up as an extra message. Check that message's content types "
        "against the sample's own note above: are they 'text_reasoning' as "
        "documented, or something else on your installed agent-framework "
        "version? Confirm during your dry run and adjust the narration below "
        "if it differs."
    )


if __name__ == "__main__":
    asyncio.run(main())
