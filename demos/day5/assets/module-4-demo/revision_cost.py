#!/usr/bin/env python3
"""Replay the synthetic evidence for Day 5, Demo 4.1."""

from dataclasses import dataclass
from decimal import Decimal


MILLION_TOKENS = Decimal("1000000")
REQUIRED_FACTS = ("Sev2", "Retry-After")
RATES_USD_PER_MILLION = {
    "uncached_input": Decimal("2.00"),
    "cached_input": Decimal("1.00"),
    "output": Decimal("8.00"),
}


@dataclass(frozen=True)
class RunEvidence:
    name: str
    answer: str
    input_tokens: int
    cached_input_tokens: int
    output_tokens: int
    first_visible_seconds: Decimal
    completion_seconds: Decimal


RUNS = (
    RunEvidence(
        name="draft_only",
        answer="Treat the sustained degradation as Sev2 and begin incident response.",
        input_tokens=2_000,
        cached_input_tokens=0,
        output_tokens=300,
        first_visible_seconds=Decimal("1.1"),
        completion_seconds=Decimal("4.6"),
    ),
    RunEvidence(
        name="one_revision",
        answer=(
            "Treat the sustained degradation as Sev2 and have the client honor "
            "Retry-After before retrying."
        ),
        input_tokens=3_400,
        cached_input_tokens=600,
        output_tokens=550,
        first_visible_seconds=Decimal("1.2"),
        completion_seconds=Decimal("8.9"),
    ),
)


def validate(run: RunEvidence) -> None:
    token_counts = (
        run.input_tokens,
        run.cached_input_tokens,
        run.output_tokens,
    )
    if any(count < 0 for count in token_counts):
        raise ValueError(f"{run.name}: token counts cannot be negative")
    if run.cached_input_tokens > run.input_tokens:
        raise ValueError(f"{run.name}: cached input must be a subset of input")
    if run.first_visible_seconds < 0 or run.completion_seconds < 0:
        raise ValueError(f"{run.name}: elapsed times cannot be negative")
    if run.first_visible_seconds > run.completion_seconds:
        raise ValueError(f"{run.name}: first-visible time exceeds completion time")


def passes_acceptance_rule(run: RunEvidence) -> bool:
    return all(fact in run.answer for fact in REQUIRED_FACTS)


def estimated_cost_usd(run: RunEvidence) -> Decimal:
    uncached_input_tokens = run.input_tokens - run.cached_input_tokens
    return (
        uncached_input_tokens * RATES_USD_PER_MILLION["uncached_input"]
        + run.cached_input_tokens * RATES_USD_PER_MILLION["cached_input"]
        + run.output_tokens * RATES_USD_PER_MILLION["output"]
    ) / MILLION_TOKENS


def format_run(run: RunEvidence) -> str:
    validate(run)
    accepted = passes_acceptance_rule(run)
    estimated_cost = estimated_cost_usd(run)
    outcome = "PASS" if accepted else "FAIL"
    cost_per_success = (
        f"USD {estimated_cost:.4f}" if accepted else "undefined (0 successes)"
    )
    total_tokens = run.input_tokens + run.output_tokens

    return (
        f"{run.name:12} | outcome={outcome} | "
        f"first_visible={run.first_visible_seconds:.1f} s | "
        f"complete={run.completion_seconds:.1f} s | "
        f"tokens={total_tokens} | estimated_cost=USD {estimated_cost:.4f} | "
        f"cost/success={cost_per_success}"
    )


def main() -> None:
    print("ILLUSTRATIVE WORKSHOP FIGURES — NOT AZURE PRICING OR OBSERVED TELEMETRY")
    for run in RUNS:
        print(format_run(run))


if __name__ == "__main__":
    main()
