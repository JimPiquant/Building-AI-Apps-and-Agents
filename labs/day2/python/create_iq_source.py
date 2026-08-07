"""
Day 2 Lab — Part A helper: create the Foundry IQ knowledge source.

Uploads the mock docs corpus (labs/day2/data/docs/) as a Foundry IQ knowledge
source you'll attach to your agent in part_a_grounded_agent.py.

Run once. If you re-run, it upserts (same name = idempotent).

Usage:
    cd labs/day2/python
    uv run python create_iq_source.py

Reference: Module 1 (Foundry IQ Deep Dive) slides + Learn:
    https://learn.microsoft.com/en-us/azure/foundry/concepts/agent-knowledge
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from azure.ai.projects.aio import AIProjectClient
from azure.identity.aio import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DOCS_DIR = Path(__file__).resolve().parents[1] / "data" / "docs"


async def main() -> None:
    endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
    knowledge_name = os.environ.get("FOUNDRY_IQ_KNOWLEDGE_NAME", "contoso-docs")

    doc_paths = sorted(DOCS_DIR.glob("*.md"))
    if not doc_paths:
        raise SystemExit(f"No docs found in {DOCS_DIR}")

    print(f"Uploading {len(doc_paths)} docs to IQ knowledge source '{knowledge_name}'...")

    async with AzureCliCredential() as credential:
        async with AIProjectClient(endpoint=endpoint, credential=credential) as client:
            # Upload each doc as a file, then group into the IQ knowledge source.
            uploaded_ids = []
            for p in doc_paths:
                file_obj = await client.files.upload(
                    file=p.open("rb"),
                    purpose="assistants",
                )
                uploaded_ids.append(file_obj.id)
                print(f"  uploaded {p.name} → {file_obj.id}")

            # Create (or replace) the knowledge source with these files.
            source = await client.knowledge_sources.upsert(
                name=knowledge_name,
                description=(
                    "General Contoso developer API product documentation. "
                    "Does NOT contain account-specific state (orders, tickets, entitlements)."
                ),
                file_ids=uploaded_ids,
            )
            print(f"\nKnowledge source ready: {source.name} (id={source.id})")
            print(f"Add this name to your .env as FOUNDRY_IQ_KNOWLEDGE_NAME={knowledge_name}")


if __name__ == "__main__":
    asyncio.run(main())
