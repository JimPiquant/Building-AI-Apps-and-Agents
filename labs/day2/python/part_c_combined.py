"""
Day 2 Lab — Part C — Combined agent (knowledge + tools).

Attach BOTH the Foundry IQ knowledge source (Part A) AND your function tools
(Part B) to a single agent, then use the Module 7 four-line instruction
template to steer the composition order.

Definition of done for Part C:
  - All three queries in evals/combined_golden_set.jsonl produce the expected
    trace order (retrieve-then-act, act-then-retrieve, docs-only-no-tool).
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import ChatAgent
from agent_framework.foundry import FoundryChatClient, FoundryKnowledgeSource
from azure.identity import AzureCliCredential

from tools import create_ticket, lookup_status

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


# The Module 7 four-line instruction template. Iterate on this to pass all three
# combined-golden-set queries.
COMBINED_INSTRUCTIONS = """\
You are a support assistant for the Contoso developer API.

Default source: documentation.

For account-specific questions (orders, tickets, entitlements), look up the current
state with lookup_status BEFORE explaining what the state means.

When creating tickets, first check documentation for the correct classification,
then call create_ticket.

If you don't find an answer in documentation and no tool applies, say
"I don't have that information."
"""


def build_combined_agent() -> ChatAgent:
    endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
    model = os.environ.get("FOUNDRY_MODEL", "gpt-5.4-mini")
    knowledge_name = os.environ["FOUNDRY_IQ_KNOWLEDGE_NAME"]

    client = FoundryChatClient(
        endpoint=endpoint,
        deployment_name=model,
        credential=AzureCliCredential(),
    )
    knowledge = FoundryKnowledgeSource(
        name=knowledge_name,
        description=(
            "General Contoso developer API product documentation. "
            "Does NOT contain account-specific state (orders, tickets, entitlements)."
        ),
    )
    return ChatAgent(
        chat_client=client,
        instructions=COMBINED_INSTRUCTIONS,
        knowledge_sources=[knowledge],
        tools=[create_ticket, lookup_status],
    )


DRIVER_QUERIES = [
    # Retrieve-then-act — docs should classify, then create_ticket fires
    "I keep getting 500 errors when I POST /login. Please file a ticket.",
    # Act-then-retrieve — lookup_status first, then docs explain payment_review
    "Why is ticket 12345 still in_progress?",
    # Docs-only — no tool should be called
    "How do I generate a new API key?",
]


async def main() -> None:
    agent = build_combined_agent()
    print("--- Part C: combined agent ---\n")
    for q in DRIVER_QUERIES:
        print(f"Q: {q}")
        response = await agent.run(q)
        print(f"A: {response}\n")

    print("Next: inspect traces / run tests/test_golden_set.py against combined_golden_set.jsonl.")


if __name__ == "__main__":
    asyncio.run(main())
