"""
Day 3 Lab — Part E — Evaluate the tool contract.

This file is provided complete — run it to see LocalEvaluator catch a
real regression across three golden cases, then read through it before
considering the lab done.

Only 3 golden cases are implemented here, not the 4 Module 9 names — see
"On the missing 'rejected write' case" below before you go looking for it.

Story:
  1. Load 3 golden cases from evals/tool_contract_golden_set.jsonl: a
     read, an approved write, and a no-tool request.
  2. Build one agent with local mock wit_work_item/wit_work_item_write
     tools (NOT a real ado_mcp.py MCP connection) — matching
     demos/day3/module-7-demo-1-eval-catches-wrong-tool/main.py exactly.
     LocalEvaluator's whole purpose is a fast, no-API-call, deterministic
     inner-loop check (Module 7's "Local checks and Foundry evaluators
     complement each other" slide); a real MCP round-trip to your ADO org
     would defeat that and reintroduce Part C/D's live-org dependency
     into what should be a fast, repeatable check.
  3. For the read and write cases, run evaluate_agent with
     LocalEvaluator(tool_calls_present, tool_call_args_match) against an
     ExpectedToolCall — the exact pattern the demo above uses.
  4. For the no-tool case, run evaluate_agent with a CUSTOM evaluator,
     no_tool_called (Module 7's "Custom evaluators wrap any function"
     pattern: the @evaluator decorator, conversation: list parameter).
     The built-in checks can only verify expected calls are present
     ("extras OK" per the framework's own built-in-checks table) — they
     cannot express "expect zero tool calls," so a plain ExpectedToolCall
     approach can't cover this case.
  5. Every evaluate_agent call sets num_repetitions=3 and reports the
     observed pass rate (Module 7's "Use Repetitions to handle
     nondeterminism" slide) — no single run is trusted as ground truth,
     and no universal pass threshold is invented.
  6. Optionally (run_foundry_evals, called last, wrapped so a failure here
     doesn't block the LocalEvaluator results above): also score the read
     and write cases with Microsoft Foundry's cloud tool-use evaluators.
     Unlike LocalEvaluator, these results are scored server-side and
     persisted in your Foundry project — see "After you run it" below
     for where to find them.

On the missing "rejected write" case: Module 9's slide names four golden
cases; three are implemented here. The fourth — a write the human rejects
at the approval prompt — is deliberately deferred. Its outcome turns on a
human approval DECISION rather than on the agent's own tool selection, and
evaluating that decision path through evaluate_agent/LocalEvaluator is not
demonstrated in the Day 3 demonstrations or in the Agent Framework
evaluation documentation. Rather than invent an ungrounded mechanism, this
lab covers the three cases the documented API supports and leaves the
rejected-write case as a follow-up.

On run_foundry_evals()'s separate judge client: it builds a SEPARATE
FoundryChatClient using EVALUATION_MODEL as the judge, rather than
reusing the agent's own client. Reusing the same client/model for both
the agent and its judge is a documented anti-pattern elsewhere in this
workshop (Day 2 Module 3: "Judge model = production model is a conflict
of interest — use a different, usually smaller, judge"), so this lab
keeps the two separate.

Definition of done (from labs/day3/README.md / Module 9's slide):
  - Expected tool/action/args are reported for each golden case; no
    universal pass threshold is claimed — only the observed rate across
    repetitions

Prereqs:
  1. `uv run agent.py` prints a greeting (baseline works)

Run with:
    uv run part_e_evaluate.py

After you run it: each Foundry evaluator result prints a report_url —
open it in a browser to see the persisted evaluation run in the Foundry
portal (aggregated pass/fail counts, per-evaluator scores, token usage).
You can also browse there directly: Foundry portal (https://ai.azure.com)
-> your project -> Evaluation in the left pane -> select the run for
row-level detail (query, response, ground truth, evaluator scores).

Tip: set a breakpoint inside no_tool_called() and step through with the
VS Code debugger (Run and Debug > Python File) to inspect the actual
Message/content objects evaluate_agent builds from the no-tool golden
case's conversation.
"""
from __future__ import annotations

import asyncio
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Annotated, Any

from dotenv import load_dotenv
from pydantic import Field

from agent_framework import (
    Agent,
    ExpectedToolCall,
    LocalEvaluator,
    evaluator,
    evaluate_agent,
    tool,
    tool_call_args_match,
    tool_calls_present,
)
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GOLDEN_SET_PATH = Path(__file__).resolve().parent / "evals" / "tool_contract_golden_set.jsonl"
NUM_REPETITIONS = 3


@dataclass
class GoldenCase:
    query: str
    expected_tool: str | None
    expected_args: dict[str, Any] = field(default_factory=dict)


def load_golden_cases() -> list[GoldenCase]:
    """Parse the JSONL golden set, skipping blank lines and // comments."""
    cases: list[GoldenCase] = []
    for line in GOLDEN_SET_PATH.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        row = json.loads(stripped)
        cases.append(
            GoldenCase(
                query=row["query"],
                expected_tool=row.get("expected_tool"),
                expected_args=row.get("expected_args", {}),
            )
        )
    return cases


# Local mock tools — same shape as
# demos/day3/module-7-demo-1-eval-catches-wrong-tool/main.py, deliberately
# NOT the real ado_mcp.py MCP connection (see module docstring, point 2).
@tool
def wit_work_item(
    action: Annotated[str, Field(description="get, get_batch, my, or list_for_iteration")],
    id: int,
) -> str:
    """Read an Azure DevOps work item."""
    return f"[READ] action={action} id={id}"


@tool
def wit_work_item_write(
    action: Annotated[str, Field(description="create, update, update_batch, or add_child")],
    id: int,
) -> str:
    """Create or modify an Azure DevOps work item."""
    return f"[WRITE] action={action} id={id}"


@evaluator
def no_tool_called(conversation: list) -> bool:
    """Custom check: pass only if the agent made NO function/tool call.

    Follows Module 7's "Custom evaluators wrap any function" pattern
    exactly (the @evaluator decorator, a conversation: list parameter).
    """
    tool_calls = [c for m in conversation for c in (m.contents or []) if c.type == "function_call"]
    return len(tool_calls) == 0


def build_agent() -> Agent:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    return Agent(
        client=client,
        instructions="You are an Azure DevOps assistant. Use wit_work_item for reads, "
                     "wit_work_item_write for creates/updates.",
        tools=[wit_work_item, wit_work_item_write],
    )


async def evaluate_golden_case(agent: Agent, case: GoldenCase) -> None:
    """Run one golden case NUM_REPETITIONS times and print the observed pass rate."""
    print(f"\n--- {case.query!r} ---")

    if case.expected_tool is None:
        local = LocalEvaluator(no_tool_called)
        results = await evaluate_agent(
            agent=agent,
            queries=[case.query],
            evaluators=local,
            num_repetitions=NUM_REPETITIONS,
        )
    else:
        expected = ExpectedToolCall(case.expected_tool, case.expected_args)
        local = LocalEvaluator(tool_calls_present, tool_call_args_match)
        results = await evaluate_agent(
            agent=agent,
            queries=[case.query],
            expected_tool_calls=[expected],
            evaluators=local,
            num_repetitions=NUM_REPETITIONS,
        )

    for r in results:
        print(f"{r.provider}: {r.passed}/{r.total} passed")
        for item in r.items:
            if item.status != "pass":
                print(f"  [{item.status}] {item.input_text} -> {(item.output_text or '')[:80]}")


async def run_foundry_evals(agent: Agent, cases: list[GoldenCase]) -> None:
    """Optional: also score the tool-using cases with Foundry's cloud evaluators.

    Wrapped separately from evaluate_golden_case() so a Foundry-side
    problem doesn't block the LocalEvaluator results above, which are this
    lab's actual definition-of-done requirement. The import and the client
    construction are inside the guard too, so a missing
    FOUNDRY_PROJECT_ENDPOINT or an unavailable FoundryEvals class reports
    the same way a missing EVALUATION_MODEL deployment does, instead of
    raising out of main().
    """
    print("\n=== Optional: Foundry cloud evaluators ===")

    try:
        from agent_framework.foundry import FoundryEvals

        judge_client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("EVALUATION_MODEL", os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna")),
            credential=AzureCliCredential(),
        )
        foundry = FoundryEvals(
            client=judge_client,
            evaluators=[FoundryEvals.TOOL_CALL_ACCURACY, FoundryEvals.TOOL_SELECTION],
        )
    except Exception as exc:  # noqa: BLE001 — optional path, report and continue
        print(f"Foundry evaluation unavailable ({exc})")
        print("The LocalEvaluator results above are unaffected.")
        return
    for case in cases:
        if case.expected_tool is None:
            continue  # FoundryEvals' tool evaluators need a tool-using case
        try:
            results = await evaluate_agent(agent=agent, queries=[case.query], evaluators=foundry)
        except Exception as exc:  # noqa: BLE001 — optional path, report and continue
            print(f"--- {case.query!r}: Foundry evaluation unavailable ({exc}) ---")
            continue
        for r in results:
            print(f"--- {case.query!r} ---")
            print(f"{r.provider}: {r.passed}/{r.total} passed")
            print(f"  Persisted in Foundry — open to see row-level detail: {r.report_url}")


async def main() -> None:
    cases = load_golden_cases()
    agent = build_agent()

    for case in cases:
        await evaluate_golden_case(agent, case)

    await run_foundry_evals(agent, cases)


if __name__ == "__main__":
    asyncio.run(main())
