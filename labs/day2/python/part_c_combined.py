"""
Day 2 Lab — Part C — Combined agent (knowledge + tools).

Attach BOTH the Foundry IQ knowledge source (Part A) AND your function tools
(Part B) to a single agent, then iterate on the instruction template below if needed.

run with: uv run python part_c_combined.py
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

from foundry_iq import create_knowledge_base_tool
from tools import create_ticket, lookup_status

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


# Instruction template. Iterate on this to pass all three combined-golden-set
# queries. The four-part pattern: (1) default source, (2) state-first rule for
# account-specific questions, (3) retrieve-before-act for actions that need
# classification, (4) refusal fallback.
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

def build_combined_agent(
    credential: AzureCliCredential,
    knowledge_tool: MCPStreamableHTTPTool,
) -> Agent:
    endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
    model = os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna")

    client = FoundryChatClient(
        project_endpoint=endpoint,
        model=model,
        credential=credential,
    )
    return Agent(
        client=client,
        instructions=COMBINED_INSTRUCTIONS,
        tools=[knowledge_tool, create_ticket, lookup_status],
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
    with AzureCliCredential() as credential:
        async with create_knowledge_base_tool(credential) as knowledge_tool:
            agent = build_combined_agent(credential, knowledge_tool)
            print("--- Part C: combined agent ---\n")
            for q in DRIVER_QUERIES:
                print(f"Q: {q}")
                response = await agent.run(q)
                print(f"A: {response}\n")

    print("Next: inspect traces / run tests/test_golden_set.py against combined_golden_set.jsonl.")


if __name__ == "__main__":
    asyncio.run(main())
