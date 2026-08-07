"""
Day 2 Lab — Part A — Grounded docs assistant.

Attach the Foundry IQ knowledge source you created with create_iq_source.py
to the baseline agent, then run a small evaluation of retrieval quality.

Definition of done:
  - Retrieval score >= 0.7 on the answerable set
  - Groundedness score >= 0.8

Prereqs:
  1. `uv run python agent.py` prints a greeting (baseline works)
  2. `uv run python create_iq_source.py` completed successfully
  3. FOUNDRY_IQ_KNOWLEDGE_NAME is set in .env
"""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import ChatAgent
from agent_framework.foundry import FoundryChatClient, FoundryKnowledgeSource
from azure.identity import AzureCliCredential

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


def build_grounded_agent() -> ChatAgent:
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
        instructions=(
            "You are a support assistant for the Contoso developer API.\n"
            "For product questions, use the documentation knowledge source.\n"
            "If the documentation does not contain the answer, say \"I don't have that information.\" "
            "Do not guess."
        ),
        knowledge_sources=[knowledge],
    )


async def main() -> None:
    agent = build_grounded_agent()

    results = []
    print("--- Part A: grounded assistant ---\n")
    for item in EVAL_QUERIES:
        response = await agent.run(item["query"])
        answer = str(response)
        print(f"Q: {item['query']}")
        print(f"A: {answer}\n")
        results.append({
            "query": item["query"],
            "should_answer": item["should_answer"],
            "answer": answer,
        })

    # Save transcript — evals/retrieval_eval.py reads this file
    out = Path(__file__).resolve().parents[1] / "evals" / "part_a_transcript.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")
    print(f"\nTranscript written to {out}")
    print("Next: run `uv run python ../evals/retrieval_eval.py` to score retrieval + groundedness.")


if __name__ == "__main__":
    asyncio.run(main())
