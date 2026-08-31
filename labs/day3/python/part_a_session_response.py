"""
Day 3 Lab — Part A — Session continuity + typed response.

Turns 1-3 (session serialize/restore) are provided complete — run them,
read them, understand the contract. Turn 4 (streaming + a typed
TriageResult) is yours to author: see stream_typed_response()'s TODO
below.

Story (one continuous session, four turns):
  1. Create an AgentSession, run two turns, and serialize it with
     session.to_dict() — same contract as
     demos/day3/module-1-demo-1-serialize-restore/.
  2. Simulate a process boundary: drop the in-memory session, reload the
     serialized payload from disk, and restore it with
     AgentSession.from_dict(). A third turn on the restored session proves
     state survived — it can still answer a question about turn 1.
  3. YOU AUTHOR THIS: on that same restored session, run a fourth turn
     with stream=True and options={"response_format": TriageResult} —
     the same combined pattern demos/day3/module-2-demo-1-stream-then-triage/
     showed live in Module 2. Watch the text stream token by token, then
     read the finalized typed TriageResult.

Definition of done (from labs/day3/README.md / Module 9's slide):
  - Session: the restored turn (step 2) retains the state from turns 1-2 —
    prove this by asking about turn 1's fact and getting the right answer
  - Structured stream: the UI receives update text throughout, and a final
    typed TriageResult value is produced; no partial JSON is treated as an
    action mid-stream

Prereqs:
  1. `uv run python agent.py` prints a greeting (baseline works)
  2. FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_MODEL are set in .env

Run with:
    uv run part_a_session_response.py

Stuck, or want to check your work? labs/day3/python/solutions/part_a_session_response.py
has a completed reference implementation of stream_typed_response() — try
authoring it yourself first.

Tip: set a breakpoint on the first line of run_and_serialize() and step
through with the VS Code debugger (Run and Debug > Python File) to watch
each turn build the session, then step into restore_session_and_verify()
to watch AgentSession.from_dict() rebuild it from the serialized payload.
"""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

from agent_framework import Agent, AgentSession
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SESSION_PAYLOAD_PATH = Path(__file__).resolve().parent / "part_a_session_payload.json"


class TriageResult(BaseModel):
    route: str  # "answer" | "clarify" | "work_item"
    summary: str
    needs_work_item: bool


TRIAGE_INSTRUCTIONS = """\
You are a support assistant for the Contoso developer API. Keep answers
brief. When asked to classify a request, respond with a TriageResult:
route (answer, clarify, or work_item), a one-sentence summary, and
whether a work item is recommended.
"""


def build_agent() -> Agent:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    return Agent(
        client=client,
        name="ContinuityAgent",
        instructions=TRIAGE_INSTRUCTIONS,
    )


async def run_and_serialize(agent: Agent) -> None:
    """Turns 1-2: create a session, run two turns, serialize it to disk."""
    session = agent.create_session()

    r1 = await agent.run(
        "Remember this project is called Atlas.", session=session,
    )
    print("Turn 1:", r1, "\n")

    r2 = await agent.run("What's the project name?", session=session)
    print("Turn 2:", r2, "\n")

    payload = session.to_dict()
    SESSION_PAYLOAD_PATH.write_text(json.dumps(payload))
    print(f"Session serialized to {SESSION_PAYLOAD_PATH.name}.\n")


async def restore_session_and_verify(agent: Agent) -> AgentSession:
    """Turn 3: reload the payload from disk and restore the session.

    Reading from disk (rather than reusing the in-memory `session` object
    from run_and_serialize) simulates a fresh process picking up where a
    prior one left off — the same contract
    demos/day3/module-1-demo-1-serialize-restore/ proves across two
    separate `uv run` invocations.
    """
    payload = json.loads(SESSION_PAYLOAD_PATH.read_text())
    resumed = AgentSession.from_dict(payload)

    r3 = await agent.run(
        "What did I tell you to remember?", session=resumed,
    )
    print("Turn 3 (restored session):", r3, "\n")
    return resumed


# ---------------------------------------------------------------------------
# Part A, Turn 4 — Author stream_typed_response()
#
# Reference: slides/day3/module-2-streaming-structured.md, "Combine
# streaming and structure", and the exact working pattern
# demos/day3/module-2-demo-1-stream-then-triage/main.py just showed live
# in Module 2 — this is the same call shape, adapted to run on the
# restored session from Turn 3 instead of a fresh one.
#
# TODO: replace the raise below with your implementation. Steps:
#   1. Call agent.run(request, stream=True, session=session,
#      options={"response_format": TriageResult}) — do NOT await this
#      call directly; it returns an async stream object.
#   2. Iterate it with `async for update in stream:` and print
#      update.text as it arrives (this is the live token-by-token
#      display) — check update.text is truthy before printing.
#   3. Once the loop finishes, call `await stream.get_final_response()`
#      to get the finalized AgentResponse, then read its `.value` — this
#      is the parsed TriageResult, not the raw text you streamed above.
#   4. Validate the result is actually a TriageResult (isinstance check)
#      before returning it — don't just trust `.value`'s type.
# ---------------------------------------------------------------------------

async def stream_typed_response(agent: Agent, session: AgentSession) -> TriageResult:
    """Turn 4: stream text for display, then read the finalized typed value.

    Stuck, or want to check your work? See
    labs/day3/python/solutions/part_a_session_response.py — try authoring this
    yourself first.
    """
    request = "I keep getting 500 errors when I POST /login."
    raise NotImplementedError("Implement stream_typed_response — see the TODO comment above this function")


async def main() -> None:
    agent = build_agent()

    await run_and_serialize(agent)
    resumed = await restore_session_and_verify(agent)
    triage = await stream_typed_response(agent, resumed)

    print(f"route={triage.route!r} needs_work_item={triage.needs_work_item!r}")
    print(f"summary={triage.summary!r}")

    SESSION_PAYLOAD_PATH.unlink(missing_ok=True)


if __name__ == "__main__":
    asyncio.run(main())
