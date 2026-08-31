"""
Day 4 Lab — Part A — Sequential (warm-up).

This file is provided complete — run it to see the shared Planner/
Retriever/Critic roles (roles.py) working together for the first time,
then read through it before considering Part A done.

Story:
  1. Build the workflow with plain SequentialBuilder — Planner ->
     Retriever -> Critic, in that fixed order, matching Module 2's
     "Sequential in code" slide exactly (same API, same terminal-output
     shape: the last participant's AgentResponse). The Retriever grounds
     against a small bundle of local docs (data/docs/*.md, copied from
     Day 2) via the search_docs tool in roles.py — deliberately NOT the
     live Foundry IQ knowledge base Day 2/3 used, so this lab has zero
     dependency on any Azure resource surviving intact since Day 2.
  2. Load the shared golden set (evals/golden_set.jsonl — the SAME
     15 questions Parts B and C will also run), but only run the FIRST
     GOLDEN_SET_LIMIT (5) of them through the workflow — each question
     runs 3 live agent turns (Planner, Retriever, Critic) with a fresh
     workflow, so the full 15-question set is slow for a quick dry run.
     Part A is the only part that limits the golden set this way; Parts
     B and C still run all 15 (see their own files) since this speed
     trade-off is specific to Part A's fast, provided-complete
     read-and-run role. Note: the golden set's first 5 rows are all
     `"expects_revision": false` clean questions (see
     evals/golden_set.jsonl) — with the default limit, Part A's own
     "no correction" limitation may NOT show up in this shorter run. Set
     GOLDEN_SET_LIMIT higher (or None) locally if you want to see it live.
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
  5. Finally, demonstrate `workflow.as_agent()` (Module 1's "composition
     goes full circle" slide, in code) — the exact same three-role
     pipeline, wrapped so it can be called just like a single agent. This
     is a genuinely useful pattern beyond this lab: it's how you'd hand
     this whole pipeline to ANOTHER orchestrator as one participant, or
     expose it behind a single agent-shaped interface. Per the SDK's own
     sequential_workflow_as_agent.py sample, `.as_agent()` returns only
     the terminal participant's (the Critic's) response — the same
     `CriticVerdict` shape as every other call in this file, nothing new
     to parse.

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

On rebuilding the workflow per golden-set question (not once, reused for
all 15): confirmed directly against Microsoft Learn's Workflows "State"
doc, "State Isolation" section — "Agent threads are persisted across
workflow runs... if the same workflow instance is reused for different
tasks or requests[, this] can lead to unintended state sharing. To
ensure each task has isolated agent state, wrap agent and workflow
creation inside a helper method so that each call produces new agent
instances with their own threads." build_workflow() already IS that
helper method (fresh Agent instances every call); main() below calls it
fresh inside the golden-set loop for exactly this reason — otherwise
question #2 would run with question #1's entire exchange still sitting
in every agent's thread, which would both skew results and burn
unnecessary tokens.

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
from pathlib import Path

from dotenv import load_dotenv

from agent_framework.orchestrations import SequentialBuilder
from azure.identity import AzureCliCredential

from roles import CriticVerdict, build_critic, build_planner, build_retriever, load_golden_set

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GOLDEN_SET_LIMIT = 5  # Part A only — each question is 3 live agent turns
# with a fresh workflow, so the full 15-question set is slow for a quick
# dry run. Set to None to run the whole golden set (matches Parts B/C).


def extract_verdict(final) -> CriticVerdict:
    """Extract the Critic's structured CriticVerdict from the workflow's
    terminal AgentResponse. Tries `.value` first (see module docstring for
    why this should work); falls back to parsing the last message's text
    as JSON if `.value` isn't already a CriticVerdict."""
    if isinstance(final.value, CriticVerdict):
        return final.value
    return CriticVerdict.model_validate_json(final.messages[-1].text)


def build_workflow(credential: AzureCliCredential):
    """Part A: Planner -> Retriever -> Critic, no correction. Call this
    fresh for every task/request (see module docstring on state
    isolation) — never reuse one build_workflow() result across
    unrelated questions."""
    planner = build_planner(credential)
    retriever = build_retriever(credential)
    critic = build_critic(credential)
    return SequentialBuilder(participants=[planner, retriever, critic]).build()


async def main() -> None:
    credential = AzureCliCredential()
    full_golden_set = load_golden_set()
    golden_set = full_golden_set[:GOLDEN_SET_LIMIT]

    results = []
    for row in golden_set:
        # Fresh workflow (fresh Agent instances, fresh threads) per question —
        # required for state isolation, see module docstring.
        workflow = build_workflow(credential)
        events = await workflow.run(row["query"])
        outputs = events.get_outputs()
        final = outputs[0]
        verdict = extract_verdict(final)
        results.append((row, verdict))

    print(f"Part A — Sequential — {len(results)} of {len(full_golden_set)} golden-set questions\n")
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

    # Bonus: the SAME pipeline, wrapped as a single agent (Module 1's
    # "composition goes full circle" slide, in code). Nothing about the
    # roles or the workflow changes — .as_agent() just lets any caller
    # invoke the whole three-role pipeline through the plain Agent
    # interface, as if it were one agent. Own fresh workflow instance
    # again, same state-isolation reason as the loop above.
    print("\n--- Bonus: the same workflow, wrapped with .as_agent() ---")
    bonus_workflow = build_workflow(credential)
    pipeline_agent = bonus_workflow.as_agent(name="planner-retriever-critic-pipeline")
    bonus_response = await pipeline_agent.run(
        "What are the prerequisites before I make my first API call?"
    )
    bonus_verdict = extract_verdict(bonus_response)
    print(f"approved={bonus_verdict.approved}")
    if bonus_verdict.answer:
        print(f"summary: {bonus_verdict.answer.summary}")


if __name__ == "__main__":
    asyncio.run(main())
