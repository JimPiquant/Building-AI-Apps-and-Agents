"""
Day 4 Lab — Part A — Sequential (warm-up).

This file is provided complete — run it to see the shared Planner/
Retriever/Critic roles (roles.py) working together for the first time,
then read through it before considering Part A done.

Story:
  1. Build the workflow with plain SequentialBuilder — Planner ->
     Retriever -> Critic, in that fixed order, matching Module 2's
     "Sequential in code" slide exactly (same API, same terminal-output
     shape: the last participant's AgentResponse).
  2. Load the shared golden set (evals/golden_set.jsonl — the SAME
     15 questions Parts B and C will also run) and run every question
     through the workflow once.
  3. For each question, extract the Critic's structured CriticVerdict
     from the workflow's terminal AgentResponse and compare it against
     the golden set's expectation.
  4. Print a pass/fail summary. Questions marked "expects_revision": true
     in the golden set are EXPECTED to come back not-approved here — Part
     A's Critic has nowhere to send a "not approved" verdict back to.
     SequentialBuilder's own docs are explicit that "Order Matters:
     Agents execute strictly in the order specified in the participants
     list" — there is no loop-back. That's not a bug in this file; it's
     the exact limitation Part B exists to fix.

On extracting the Critic's structured output from a workflow (a flagged
inference, not directly shown in any fetched sample): every prior
structured-output example in this workshop (Day 3's `final.value`) reads
`.value` off a single agent's own AgentResponse, returned directly from
`agent.run()`. This lab calls `.value` on the AgentResponse returned by
`workflow.run()` instead — the last PARTICIPANT's response, surfaced
through the workflow. Nothing fetched this session shows this exact
combination (a workflow terminal output whose underlying agent used
default_options={"response_format": ...}) confirmed end-to-end, but
`default_options` is a property of the Critic Agent instance itself, and
AgentResponse is the same class in both cases — so this should work the
same way. As a safety net in case that inference is wrong,
extract_verdict() below falls back to parsing the last message's raw
text as JSON if `.value` isn't already a CriticVerdict.

--------------------------------------------------------------------------
Definition of done for Part A (from labs/day4/README.md):
  - Runs end-to-end on the golden set; the "no correction" limitation
    shows up in at least one result
--------------------------------------------------------------------------

Prereqs:
  1. `uv run agent.py` prints a greeting (baseline works)

Run with:
    uv run part_a_sequential.py

VS Code debugger tip: breakpoint inside extract_verdict() on the
`except Exception` fallback branch — that's the one line in this file
whose behavior is a documented inference rather than a confirmed API
shape, so it's the most useful place to actually inspect what
workflow.run() returned for yourself.
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

from dotenv import load_dotenv

from agent_framework.orchestrations import SequentialBuilder
from azure.identity import AzureCliCredential

from foundry_iq import create_knowledge_base_tool
from roles import CriticVerdict, build_critic, build_planner, build_retriever

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GOLDEN_SET_PATH = Path(__file__).resolve().parent / "evals" / "golden_set.jsonl"


def load_golden_set() -> list[dict]:
    """Parse the shared JSONL golden set, skipping blank lines and // comments."""
    rows: list[dict] = []
    for line in GOLDEN_SET_PATH.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        rows.append(json.loads(stripped))
    return rows


def extract_verdict(final) -> CriticVerdict:
    """Extract the Critic's structured CriticVerdict from the workflow's
    terminal AgentResponse. Tries `.value` first (see module docstring for
    why this should work); falls back to parsing the last message's text
    as JSON if `.value` isn't already a CriticVerdict."""
    if isinstance(final.value, CriticVerdict):
        return final.value
    return CriticVerdict.model_validate_json(final.messages[-1].text)


def build_workflow(credential: AzureCliCredential):
    """Part A: Planner -> Retriever -> Critic, no correction."""
    knowledge_tool = create_knowledge_base_tool(credential)
    planner = build_planner(credential)
    retriever = build_retriever(credential, knowledge_tool)
    critic = build_critic(credential)
    return SequentialBuilder(participants=[planner, retriever, critic]).build()


async def main() -> None:
    credential = AzureCliCredential()
    workflow = build_workflow(credential)
    golden_set = load_golden_set()

    results = []
    for row in golden_set:
        events = await workflow.run(row["query"])
        outputs = events.get_outputs()
        final = outputs[0]
        verdict = extract_verdict(final)
        results.append((row, verdict))

    print(f"Part A — Sequential — {len(results)} golden-set questions\n")
    approved_count = 0
    unexpected_fails = []
    for row, verdict in results:
        approved_count += int(verdict.approved)
        status = "APPROVED" if verdict.approved else "NOT APPROVED (no correction possible)"
        print(f"[{status}] {row['query']}")
        if not verdict.approved:
            print(f"    feedback: {verdict.feedback}")
        if verdict.approved and row.get("expects_revision"):
            # A question we expected to need revision passed anyway — not a
            # failure, just worth flagging since it's a softer signal than
            # the golden set predicted.
            print("    (note: golden set expected this one to need revision)")
        if not verdict.approved and not row.get("expects_revision"):
            unexpected_fails.append(row["query"])

    print(
        f"\n{approved_count}/{len(results)} approved on the first (only) pass."
    )
    if unexpected_fails:
        print(
            "Unexpected NOT APPROVED on questions the golden set marked as "
            "should pass cleanly:"
        )
        for query in unexpected_fails:
            print(f"  - {query}")
    print(
        "\nThis is Part A's point, not a bug: SequentialBuilder cannot loop "
        "back to an earlier participant, so any NOT APPROVED verdict above "
        "is final. Part B fixes this with a custom WorkflowBuilder graph "
        "and a conditional Critic -> Planner edge."
    )


if __name__ == "__main__":
    asyncio.run(main())
