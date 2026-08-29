import asyncio
import os

from pydantic import BaseModel
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


class TriageResult(BaseModel):
    route: str  # "answer" | "clarify" | "work_item"
    summary: str
    needs_work_item: bool


INSTRUCTIONS = """\
You are a support assistant for the Contoso developer API.
Classify every request into a TriageResult: route (answer, clarify, or
work_item), a one-sentence summary, and whether a work item is recommended.
"""


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    agent = Agent(client=client, instructions=INSTRUCTIONS)
    session = agent.create_session()

    request = "I keep getting 500 errors when I POST /login."
    stream = agent.run(
        request,
        stream=True,
        session=session,
        options={"response_format": TriageResult},
    )

    print("--- streaming ---")
    async for update in stream:
        if update.text:
            print(update.text, end="", flush=True)
    print("\n--- finalized ---")

    final = await stream.get_final_response()
    triage = final.value
    if not isinstance(triage, TriageResult):
        raise RuntimeError("Agent did not return a valid TriageResult")

    print(f"route={triage.route!r} needs_work_item={triage.needs_work_item!r}")
    print(f"summary={triage.summary!r}")


asyncio.run(main())
