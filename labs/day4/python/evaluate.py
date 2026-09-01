"""
Day 4 Lab — the evaluation harness.

PROVIDED COMPLETE. You run it; you do not write it.

That split is deliberate. Wiring a scoring loop and summing OpenTelemetry
token counters is plumbing you have written before in some form. What is
worth your time is reading what the numbers say -- and, in particular,
learning when they say nothing.

WHAT IT MEASURES

  Task success        the answer contains what a correct answer must contain
                      (`must_mention`) and cites what it must cite. Local and
                      deterministic -- no judge model, no API call. This is
                      Day 3's LocalEvaluator discipline at workflow scale.

  Citation accuracy   did it cite the documents the answer actually needs?

  Trajectory          the ordered tool calls compared against the golden
                      set's `expected_actions`. This is the ground truth
                      Foundry's Task Navigation Efficiency evaluator consumes;
                      here it is scored locally so the inner loop stays fast
                      and free. `--foundry` sends the same trajectories to the
                      cloud evaluators instead.

  Cost per success    total tokens across every agent in the run, divided by
                      the number of cases that passed. A workflow that
                      succeeds cheaply beats one that succeeds expensively,
                      and pass rate alone cannot tell them apart.

READING THE OUTPUT — THE PART THAT MATTERS
With eight cases and three agents per run, a one-case swing is roughly 12
percentage points. Three agents each add their own nondeterminism, so two
runs of the SAME orchestration will not always score the same.

The harness therefore reports a range across repetitions, not a single
number. If Part B and Part C's ranges overlap, the honest conclusion is
"no measurable difference at this sample size" -- not "C is better because
its midpoint is higher". Saying that out loud is a correct result and a
good answer in your reflection. Module 5's "don't invent a universal pass
threshold" is the same instinct applied to a comparison.

USAGE
    uv run evaluate.py --part b                     # one part, 1 repetition
    uv run evaluate.py --part b --repetitions 3     # see the spread
    uv run evaluate.py --part a --part b --part c --repetitions 3
    uv run evaluate.py --part b --foundry           # add cloud evaluators
    uv run evaluate.py --part b --case r1           # one case, while debugging
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import statistics
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GOLDEN_SET = Path(__file__).resolve().parent / "evals" / "golden_set.jsonl"
RESULTS_DIR = Path(__file__).resolve().parent / "results"


# --------------------------------------------------------------------------
# Golden set
# --------------------------------------------------------------------------


@dataclass
class Case:
    id: str
    question: str
    branch: str
    expected_citations: list[str]
    expected_actions: list[str]
    must_mention: list[str]
    notes: str = ""


def load_cases() -> list[Case]:
    cases: list[Case] = []
    for line in GOLDEN_SET.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        row = json.loads(stripped)
        cases.append(
            Case(
                id=row["id"],
                question=row["question"],
                branch=row["branch"],
                expected_citations=row.get("expected_citations", []),
                expected_actions=row.get("expected_actions", []),
                must_mention=row.get("must_mention", []),
                notes=row.get("notes", ""),
            )
        )
    return cases


# --------------------------------------------------------------------------
# Scoring one run
# --------------------------------------------------------------------------


@dataclass
class CaseResult:
    case_id: str
    branch: str
    success: bool
    citations_ok: bool
    trajectory_ok: bool
    tokens: int
    revisions: int
    confidence: float
    detail: str = ""


@dataclass
class PartResult:
    part: str
    repetition: int
    cases: list[CaseResult] = field(default_factory=list)

    @property
    def passed(self) -> int:
        return sum(1 for c in self.cases if c.success)

    @property
    def total(self) -> int:
        return len(self.cases)

    @property
    def pass_rate(self) -> float:
        return self.passed / self.total if self.total else 0.0

    @property
    def total_tokens(self) -> int:
        return sum(c.tokens for c in self.cases)

    @property
    def cost_per_success(self) -> float:
        return self.total_tokens / self.passed if self.passed else float("inf")


def _answer_text(answer: Any) -> str:
    summary = getattr(answer, "summary", "") or ""
    bullets = " ".join(getattr(answer, "bullets", []) or [])
    return f"{summary} {bullets}".lower()


def score_case(case: Case, answer: Any, actions: list[str], tokens: int, revisions: int) -> CaseResult:
    """Deterministic scoring. No judge model."""
    if answer is None:
        return CaseResult(case.id, case.branch, False, False, False, tokens, revisions, 0.0,
                          "no answer produced")

    text = _answer_text(answer)
    citations = [c.lower() for c in (getattr(answer, "citations", []) or [])]
    confidence = float(getattr(answer, "confidence", 0.0) or 0.0)

    missing = [m for m in case.must_mention if m.lower() not in text]
    expected_cites = [c.lower() for c in case.expected_citations]
    missing_cites = [c for c in expected_cites if c not in citations]

    citations_ok = not missing_cites
    if not expected_cites:
        # A no-retrieval case is only correct if it cites nothing.
        citations_ok = not citations

    trajectory_ok = actions == case.expected_actions or (
        len(actions) >= len(case.expected_actions)
        and all(a in actions for a in case.expected_actions)
    )
    if not case.expected_actions:
        trajectory_ok = not actions

    success = not missing and citations_ok

    detail = ""
    if missing:
        detail = f"missing {missing}"
    elif missing_cites:
        detail = f"uncited {missing_cites}"
    elif not citations_ok:
        detail = "cited sources on a no-retrieval case"

    return CaseResult(case.id, case.branch, success, citations_ok, trajectory_ok,
                      tokens, revisions, confidence, detail)


# --------------------------------------------------------------------------
# Running a part
# --------------------------------------------------------------------------


def _collect_tokens(events: list[Any]) -> int:
    """Sum token usage across every model call in the run.

    The framework emits usage on response data following the OpenTelemetry
    GenAI conventions. Shapes vary by event, so probe defensively and report
    0 rather than crashing an evaluation over telemetry.
    """
    total = 0
    for event in events:
        data = getattr(event, "data", None)
        usage = getattr(data, "usage", None) or getattr(
            getattr(data, "agent_response", None), "usage", None
        )
        if usage is None:
            continue
        for attr in ("input_tokens", "output_tokens", "prompt_tokens", "completion_tokens"):
            value = getattr(usage, attr, None)
            if isinstance(value, int):
                total += value
    return total


def _collect_actions(events: list[Any]) -> list[str]:
    """Extract the ordered tool calls -- the trajectory."""
    actions: list[str] = []
    for event in events:
        if event.type not in ("executor_completed", "intermediate", "output"):
            continue
        data = getattr(event, "data", None)
        messages = getattr(getattr(data, "agent_response", None), "messages", None) or getattr(
            data, "messages", None
        )
        for message in messages or []:
            for content in getattr(message, "contents", None) or []:
                if getattr(content, "type", None) == "function_call":
                    name = getattr(content, "name", None)
                    if name:
                        actions.append(name)
    return actions


async def run_case(part: str, case: Case) -> CaseResult:
    """Run one golden-set case against one part's workflow."""
    from agent_framework import AgentExecutorRequest, Message

    if part == "a":
        from part_a_sequential import build_sequential_workflow

        workflow = build_sequential_workflow()
        message: Any = case.question
    elif part == "b":
        from part_b_graph import build_graph_workflow

        workflow = build_graph_workflow()
        message = AgentExecutorRequest(
            messages=[Message("user", contents=[case.question])], should_respond=True
        )
    elif part == "c":
        from part_c_group_chat import build_group_chat_workflow

        workflow = build_group_chat_workflow()
        message = case.question
    else:
        raise ValueError(f"unknown part {part!r}")

    events: list[Any] = []
    answer: Any = None
    async for event in workflow.run(message, stream=True):
        events.append(event)
        if event.type == "output":
            answer = event.data

    # Parts A and C emit conversation objects rather than an Answer; pull the
    # last thing that looks like one.
    if answer is not None and not hasattr(answer, "summary"):
        answer = _coerce_answer(answer)

    revisions = sum(
        1 for e in events if e.type == "executor_invoked" and e.executor_id == "to_revision"
    )
    return score_case(case, answer, _collect_actions(events), _collect_tokens(events), revisions)


def _coerce_answer(output: Any) -> Any:
    """Best-effort: find an Answer inside a conversation-shaped output."""
    from agents import Answer

    candidates = output if isinstance(output, list) else [output]
    for item in reversed(candidates):
        text = getattr(item, "text", None) or str(item)
        try:
            return Answer.model_validate_json(text)
        except Exception:  # noqa: BLE001 — not an Answer; try the next one
            continue
    text = " ".join(
        str(getattr(item, "text", item)) for item in candidates
    )
    return Answer(summary=text, bullets=[], citations=[], confidence=0.0)


async def run_part(part: str, cases: list[Case], repetition: int) -> PartResult:
    result = PartResult(part=part, repetition=repetition)
    for case in cases:
        try:
            case_result = await run_case(part, case)
        except NotImplementedError as exc:
            raise SystemExit(
                f"\nPart {part.upper()} is not implemented yet: {exc}\n"
                f"Finish part_{part}_*.py before evaluating it.\n"
            ) from exc
        except Exception as exc:  # noqa: BLE001 — one bad case must not end the run
            case_result = CaseResult(case.id, case.branch, False, False, False, 0, 0, 0.0,
                                     f"error: {type(exc).__name__}: {exc}")
        result.cases.append(case_result)
        mark = "PASS" if case_result.success else "FAIL"
        note = f"  {case_result.detail}" if case_result.detail else ""
        print(f"    {case_result.case_id:<5} {case_result.branch:<13} {mark}{note}")
    return result


# --------------------------------------------------------------------------
# Foundry cloud evaluators (optional)
# --------------------------------------------------------------------------


async def run_foundry(results: list[PartResult]) -> None:
    """Optional cloud-evaluator pass. Wrapped so it can never fail the run."""
    print("\n" + "=" * 74)
    print("Foundry cloud evaluators (optional)")
    print("=" * 74)
    try:
        from agent_framework.foundry import FoundryEvals  # noqa: F401

        model = os.environ.get("EVALUATION_MODEL") or os.environ.get("FOUNDRY_MODEL")
        if not model:
            raise RuntimeError("neither EVALUATION_MODEL nor FOUNDRY_MODEL is set")
        print(
            f"\n  Judge model: {model}\n"
            "  Send the trajectories captured above to Task Navigation Efficiency\n"
            "  using each case's expected_actions as ground truth. Results persist\n"
            "  in your Foundry project; open the printed report URL for row-level\n"
            "  detail.\n"
        )
        print("  (Wire your project client here — see labs/day3 Part E for the pattern.)")
    except Exception as exc:  # noqa: BLE001 — optional path
        print(f"\n  Foundry evaluation unavailable ({exc}).")
        print("  The local results above are unaffected — they are the graded ones.\n")


# --------------------------------------------------------------------------
# Reporting
# --------------------------------------------------------------------------


def report(all_results: dict[str, list[PartResult]]) -> None:
    print("\n" + "=" * 74)
    print("Comparison")
    print("=" * 74 + "\n")

    header = f"  {'Part':<6}{'pass rate':<24}{'cost / success':<20}{'revisions'}"
    print(header)
    print("  " + "-" * (len(header) - 2))

    for part, results in all_results.items():
        rates = [r.pass_rate for r in results]
        costs = [r.cost_per_success for r in results if r.passed]
        revisions = sum(c.revisions for r in results for c in r.cases)

        if len(rates) > 1:
            rate_text = (
                f"{min(rates):.0%}-{max(rates):.0%} "
                f"(median {statistics.median(rates):.0%})"
            )
        else:
            rate_text = f"{rates[0]:.0%}"

        cost_text = f"{statistics.median(costs):,.0f} tok" if costs else "n/a"
        print(f"  {part.upper():<6}{rate_text:<24}{cost_text:<20}{revisions}")

    if len(next(iter(all_results.values()))) > 1 and len(all_results) > 1:
        spans = {
            part: (min(r.pass_rate for r in rs), max(r.pass_rate for r in rs))
            for part, rs in all_results.items()
        }
        parts = list(spans)
        overlapping = any(
            spans[a][0] <= spans[b][1] and spans[b][0] <= spans[a][1]
            for i, a in enumerate(parts)
            for b in parts[i + 1 :]
        )
        print()
        if overlapping:
            print(
                "  These ranges OVERLAP. At eight cases, that means you cannot\n"
                "  distinguish these orchestrations on pass rate -- the honest\n"
                "  conclusion is 'no measurable difference at this sample size'.\n"
                "  Look at cost per success and revision count instead, and say\n"
                "  so in your reflection."
            )
        else:
            print(
                "  These ranges do NOT overlap, so the difference survived\n"
                "  repetition. Now ask what it cost: check cost per success\n"
                "  before calling the higher pass rate a win."
            )
    print()


def save(all_results: dict[str, list[PartResult]]) -> None:
    RESULTS_DIR.mkdir(exist_ok=True)
    for part, results in all_results.items():
        path = RESULTS_DIR / f"part_{part}.json"
        path.write_text(
            json.dumps(
                {
                    "part": part,
                    "repetitions": len(results),
                    "runs": [
                        {
                            "repetition": r.repetition,
                            "pass_rate": r.pass_rate,
                            "passed": r.passed,
                            "total": r.total,
                            "total_tokens": r.total_tokens,
                            "cases": [vars(c) for c in r.cases],
                        }
                        for r in results
                    ],
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        print(f"  wrote {path.relative_to(Path.cwd()) if path.is_relative_to(Path.cwd()) else path}")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Day 4 lab evaluation harness")
    parser.add_argument("--part", action="append", choices=["a", "b", "c"], required=True,
                        help="repeatable, e.g. --part b --part c")
    parser.add_argument("--repetitions", type=int, default=1,
                        help="runs per case; use 3 for the final comparison")
    parser.add_argument("--case", action="append", help="limit to specific case ids")
    parser.add_argument("--foundry", action="store_true", help="also run Foundry cloud evaluators")
    args = parser.parse_args()

    cases = load_cases()
    if args.case:
        wanted = set(args.case)
        cases = [c for c in cases if c.id in wanted]
        if not cases:
            raise SystemExit(f"no cases matched {sorted(wanted)}")

    print(f"\nGolden set: {len(cases)} cases x {args.repetitions} repetition(s)")

    all_results: dict[str, list[PartResult]] = {}
    for part in args.part:
        all_results[part] = []
        for repetition in range(1, args.repetitions + 1):
            print(f"\n  Part {part.upper()} — repetition {repetition}")
            all_results[part].append(await run_part(part, cases, repetition))

    report(all_results)
    if args.foundry:
        await run_foundry([r for rs in all_results.values() for r in rs])
    save(all_results)


if __name__ == "__main__":
    asyncio.run(main())
