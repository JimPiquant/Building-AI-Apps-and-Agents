"""
Day 2 Lab — Part A — Grounded docs assistant.

Attach the Foundry IQ knowledge base you created in the Foundry portal
(see labs/day2/README.md — Prerequisites) to the baseline agent, then run
a small evaluation of retrieval quality.

Definition of done:
  - Retrieval score >= 0.7 on the answerable set
  - Groundedness score >= 0.8

Prereqs:
  1. `uv run python agent.py` prints a greeting (baseline works)
  2. Portal setup complete: storage account + blob container created,
     docs uploaded, IQ knowledge base created in the Foundry portal, and
     RBAC assigned (Storage Blob Data Reader on the Search MI + Search
     Index Data Reader on the Foundry project MI).
  3. AZURE_SEARCH_ENDPOINT and FOUNDRY_IQ_KNOWLEDGE_NAME are set in .env
"""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

from foundry_iq import create_knowledge_base_tool

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

EVAL_QUERIES = [
    # Three questions the docs CAN answer (Retrieval + Groundedness should score high)
    {"query": "How do I generate an API key?", "should_answer": True},
    {"query": "What does a 429 response mean and how should I handle it?", "should_answer": True},
    {"query": "What happens when an account enters payment_review?", "should_answer": True},
    # Two questions the docs CANNOT answer (agent should refuse — Groundedness protects)
    {"query": "What's my current month's usage?", "should_answer": False},
    {"query": "Can you cancel my order 12345?", "should_answer": False},
]


def _grounding_context(response) -> str:
    tool_results = []
    for message in response.messages:
        for content in message.contents:
            if content.type == "function_result" and content.result:
                tool_results.append(content.result)
    return "\n\n".join(tool_results)


def build_grounded_agent(
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
        instructions=(
            "You are a support assistant for the Contoso developer API.\n"
            "For product questions, use the documentation knowledge source.\n"
            "If the documentation does not contain the answer, say \"I don't have that information.\" "
            "Do not guess."
        ),
        tools=[knowledge_tool],
    )


async def main() -> None:
    with AzureCliCredential() as credential:
        async with create_knowledge_base_tool(credential) as knowledge_tool:
            agent = build_grounded_agent(credential, knowledge_tool)

            results = []
            print("--- Part A: grounded assistant ---\n")
            for item in EVAL_QUERIES:
                response = await agent.run(item["query"])
                answer = str(response)
                context = _grounding_context(response)
                print(f"Q: {item['query']}")
                print(f"A: {answer}\n")
                results.append({
                    "query": item["query"],
                    "should_answer": item["should_answer"],
                    "answer": answer,
                    "context": context,
                })

    # Save transcript — evals/retrieval_eval.py reads this file
    out = Path(__file__).resolve().parent / "evals" / "part_a_transcript.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")
    print(f"\nTranscript written to {out}")
    print("Next: run `uv run python evals/retrieval_eval.py` to score retrieval + groundedness.")


if __name__ == "__main__":
    asyncio.run(main())
