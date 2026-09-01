"""
Day 4 Lab — Part C — Evaluate and compare.

This file is provided complete — run it to see all three of Part B's
orchestration constructions (Sequential, custom graph, Group Chat)
evaluated against the SAME shared golden set, so the comparison actually
means something instead of being three separate anecdotes. This file
builds nothing new — it imports Part B's three `build_workflow_*()`
functions directly rather than re-implementing any orchestration
plumbing. Module 5's evaluation anchor lives here: this is the one place
in the lab that runs the golden set and reports numbers.

Story:
  1. Load the shared golden set (evals/golden_set.jsonl — the same 15
     questions Part B's demo used one of).
  2. Run only the FIRST GOLDEN_SET_LIMIT (5) questions through EACH of
     the three constructions — 15 total workflow runs, not 5. Both
     multi-round constructions (custom graph, Group Chat) can take up to
     4 full planner/retriever/critic rounds per question when a question
     needs revision, so this is already the slower part of the lab; the
     full 15-question set is a lot slower still. Set GOLDEN_SET_LIMIT to
     None (or a higher number) locally if you want the full comparison.
  2. For each construction, classify each result: APPROVED (first pass or
     after revision), NOT APPROVED, or — construction #2 only —
     GUARDRAIL TRIPPED (a distinct, typed result only the custom graph
     produces; Group Chat's guardrail has no separate signal from a
     plain rejection, see part_b_orchestrations.py's own note on this).
  3. Print a per-construction summary, then a side-by-side comparison
     table across all three.

What this file does NOT do, flagged rather than silently assumed: no
token-cost tracking, no cost-per-successful-outcome metric, no LLM-judged
trajectory score. Module 5's slides name both as things a full evaluation
harness would include; this lab's scope stops at "did the Critic approve,
and did the guardrail behave" — a real extension, not implemented here.

--------------------------------------------------------------------------
Definition of done for Part C (from labs/day4/README.md):
  - All three constructions run against the same golden-set slice
  - A comparison table reports approved rate (and, for construction #2,
    guardrail-trip rate) side by side
  - Short reflection: which construction fit best, and why — this is
    part of Done, not an afterthought
--------------------------------------------------------------------------

Prereqs:
  1. `uv run part_b_orchestrations.py` runs end-to-end (confirms all
     three constructions work before running them 5x each here)

Run with:
    uv run part_c_evaluate.py

VS Code debugger tip: breakpoint inside `_run_custom_graph` or
`_run_group_chat` to watch a single golden-set question take multiple
rounds when it needs revision — the first golden-set questions include
both single-pass and revision-needing questions on purpose (see
evals/golden_set.jsonl's own header comment).
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

from agent_framework import AgentExecutorRequest, Message
from azure.identity import AzureCliCredential

from part_b_orchestrations import (
    GuardrailStop,
    build_workflow_custom_graph,
    build_workflow_group_chat,
    build_workflow_sequential,
    extract_verdict,
)
from roles import Answer, load_golden_set

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GOLDEN_SET_LIMIT = 5  # see module docstring — each construction runs
# this many questions; custom graph and Group Chat can take multiple
# rounds per question, so this is already slower than Part A/B's single
# runs. Set to None (or higher) to run the full 15-question golden set.


@dataclass
class RunResult:
    approved: bool
    guardrail_tripped: bool  # only ever True for construction #2 (custom graph) —
    # Group Chat's guardrail (MAX_GROUP_CHAT_MESSAGES) has no distinct signal
    # from a plain not-approved rejection, see part_b_orchestrations.py
    detail: str  # the Answer's summary if approved, else the Critic's feedback


async def _run_sequential(credential: AzureCliCredential, query: str) -> RunResult:
    workflow = build_workflow_sequential(credential)
    events = await workflow.run(query)
    verdict = extract_verdict(events.get_outputs()[0])
    if verdict.approved:
        return RunResult(approved=True, guardrail_tripped=False, detail=verdict.answer.summary)
    return RunResult(approved=False, guardrail_tripped=False, detail=verdict.feedback)


async def _run_custom_graph(credential: AzureCliCredential, query: str) -> RunResult:
    workflow = build_workflow_custom_graph(credential)
    request = AgentExecutorRequest(messages=[Message(role="user", contents=[query])], should_respond=True)
    events = await workflow.run(request)
    outputs = events.get_outputs()
    output = outputs[0] if outputs else None
    if isinstance(output, Answer):
        return RunResult(approved=True, guardrail_tripped=False, detail=output.summary)
    if isinstance(output, GuardrailStop):
        return RunResult(approved=False, guardrail_tripped=True, detail=output.last_feedback)
    return RunResult(approved=False, guardrail_tripped=False, detail="NO OUTPUT")


async def _run_group_chat(credential: AzureCliCredential, query: str) -> RunResult:
    workflow = build_workflow_group_chat(credential)
    events = await workflow.run(query)
    outputs = events.get_outputs()
    if not outputs:
        return RunResult(approved=False, guardrail_tripped=False, detail="NO OUTPUT")
    verdict = extract_verdict(outputs[-1])
    if verdict.approved:
        return RunResult(approved=True, guardrail_tripped=False, detail=verdict.answer.summary)
    return RunResult(approved=False, guardrail_tripped=False, detail=verdict.feedback)


CONSTRUCTIONS = {
    "Sequential": _run_sequential,
    "Custom graph": _run_custom_graph,
    "Group Chat": _run_group_chat,
}


async def main() -> None:
    credential = AzureCliCredential()
    full_golden_set = load_golden_set()
    golden_set = full_golden_set[:GOLDEN_SET_LIMIT]

    print(f"Part C — Evaluate and compare — {len(golden_set)} of {len(full_golden_set)} golden-set questions\n")

    all_results: dict[str, list[tuple[dict, RunResult]]] = {}
    for name, run_fn in CONSTRUCTIONS.items():
        print(f"=== {name} ===")
        results: list[tuple[dict, RunResult]] = []
        for row in golden_set:
            result = await run_fn(credential, row["query"])
            results.append((row, result))
            if result.approved:
                status = "APPROVED"
            elif result.guardrail_tripped:
                status = "GUARDRAIL TRIPPED"
            else:
                status = "NOT APPROVED"
            print(f"[{status}] {row['query']}")
        all_results[name] = results

        approved_count = sum(1 for _, r in results if r.approved)
        guardrail_count = sum(1 for _, r in results if r.guardrail_tripped)
        print(f"{approved_count}/{len(results)} approved.")
        if guardrail_count:
            print(f"{guardrail_count}/{len(results)} hit the guardrail — a bounded, graceful stop, not a bug.")
        print()

    print("=== Comparison ===")
    print(f"{'Construction':<14} | {'Approved':>10} | {'Guardrail trips':>15}")
    print("-" * 46)
    for name, results in all_results.items():
        approved_count = sum(1 for _, r in results if r.approved)
        guardrail_count = sum(1 for _, r in results if r.guardrail_tripped)
        guardrail_display = str(guardrail_count) if name == "Custom graph" else "n/a (no distinct signal)"
        print(f"{name:<14} | {approved_count}/{len(results):<8} | {guardrail_display:>15}")

    print(
        "\nReflection (part of Done, not an afterthought): which construction "
        "fit best for this scenario, and why? Sequential is cheapest but "
        "can't recover from a rejection. The custom graph gives you full "
        "control over the retry/guardrail logic at the cost of writing it "
        "yourself. Group Chat delegates the routing decision to another "
        "LLM call, trading determinism and an extra model call per turn "
        "for less code. Write your answer down — a committed reflection "
        "is part of this lab's definition of done."
    )


if __name__ == "__main__":
    asyncio.run(main())
