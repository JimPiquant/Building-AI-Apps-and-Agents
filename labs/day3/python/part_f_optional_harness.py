"""
Day 3 Lab — Part F (OPTIONAL) — Agent Harness.

Optional stretch content, matching Module 8's own framing: "Awareness and
comparison only — no required lab work." This file is provided complete
— run it, read it, compare it against the plain Agent you built in every
other part today. Nothing here is required to consider Day 3's lab done,
and nothing here is authored by you.

Story:
  1. Build a plain Agent the way every other part today has (same shape
     as agent.py) — the baseline you're comparing against.
  2. Build a harness agent with create_harness_agent(client=...) instead —
     same chat client, same instructions parameter split
     (harness_instructions vs. agent_instructions), but the factory wires
     up todo tracking and plan/execute mode tracking automatically
     (Module 8's "create_harness_agent architecture" flow: chat client ->
     chat pipeline -> providers -> middleware -> your application UX).
  3. Run the SAME request through both and compare what prints. The
     harness agent's response and any tool/todo activity is driven by
     providers you never wrote — that's the entire point of a harness:
     opinionated scaffolding, not a new primitive.

What this file deliberately does NOT do, and why:
  - No web search, looping, skills, or shell tooling enabled. Module 8's
    own capability table marks background agents, shared file access,
    and looping "Experimental," and shell tooling requires the
    pre-release agent-framework-tools package — none of that belongs in
    a self-paced stretch exercise with no supervision.
  - No GitHubCopilotAgent code. Module 8's own slides are explicit that
    Harness and GitHubCopilotAgent are two SEPARATE construction paths
    with "no official direct composition pattern" — GitHubCopilotAgent
    is a standard MAF agent, not a chat client you can pass into
    create_harness_agent. It also needs its own permission handler and
    is recommended to run inside Docker or a dev container once shell/
    file permissions are granted (Module 8's "Permissions are a hard
    boundary" slide) — appropriately out of scope for this lab. Read
    Module 8's comparison table instead; there's nothing to run here.

Definition of done: none — this part is optional and ungraded. Run it,
read it, and walk away with the comparison Module 8 asks for: recognize
when a plain Agent, a harness agent, or a separate agent-service
integration like GitHubCopilotAgent is the right fit — see Module 8's
"Choose the least opinionated fit" slide.

Prereqs:
  1. `uv run agent.py` prints a greeting (baseline works)

Run with:
    uv run part_f_optional_harness.py
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import Agent, create_harness_agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

REQUEST = "Plan a short agenda for a one-hour team retrospective meeting."


def build_client() -> FoundryChatClient:
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )


def build_plain_agent(client: FoundryChatClient) -> Agent:
    """The baseline — a plain Agent, the same shape as every other part today."""
    return Agent(
        client=client,
        name="PlainAgent",
        instructions="You are a helpful planning assistant.",
    )


def build_harness_agent(client: FoundryChatClient):
    """The comparison — create_harness_agent wraps the SAME client with
    opinionated scaffolding (todo tracking, plan/execute mode tracking,
    per-service-call history, compaction) enabled by default. Nothing
    else is opted in — no web search, looping, skills, or shell tooling.
    """
    return create_harness_agent(
        client=client,
        name="HarnessAgent",
        agent_instructions="You are a helpful planning assistant.",
    )


async def run_plain(client: FoundryChatClient) -> None:
    print("=== Plain Agent ===")
    agent = build_plain_agent(client)
    result = await agent.run(REQUEST)
    print(f"{result}\n")


async def run_harness(client: FoundryChatClient) -> None:
    print("=== Harness Agent (create_harness_agent) ===")
    agent = build_harness_agent(client)
    session = agent.create_session()
    result = await agent.run(REQUEST, session=session)
    print(f"{result}\n")
    print(
        "Notice: you didn't write a single line of todo-tracking or "
        "plan/execute-mode logic above — create_harness_agent's context "
        "providers composed that for you around the same chat client. "
        "That's the whole trade this module asks you to recognize: less "
        "code to write, less visibility into exactly what ran."
    )


async def main() -> None:
    client = build_client()
    await run_plain(client)
    await run_harness(client)


if __name__ == "__main__":
    asyncio.run(main())
