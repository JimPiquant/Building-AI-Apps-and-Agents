"""
Day 4 Lab — Part B — isolation tests for the budget-guardrail counter.

Run with:
    cd labs/day4/python
    uv run pytest tests/test_part_b_guardrail.py -v

Test compute_next_step() — the guardrail's pure decision logic — WITHOUT
running a full workflow against Foundry, and without constructing any
real AgentExecutorResponse/WorkflowContext. Mirrors
labs/day3/python/tests/test_part_b_middleware.py's "test the logic in
isolation first" approach (Module 6). part_b_orchestrations.py
deliberately separates compute_next_step() (plain function, no framework
dependency) from revision_gate() (the @executor-decorated function that
does the actual ctx.get_state/set_state/send_message/yield_output
plumbing) specifically so these tests don't need to fake any of that
machinery. This guardrail belongs to part_b_orchestrations.py's
construction #2 (the custom WorkflowBuilder graph) specifically —
construction #1 (Sequential) has no loop to guard, and construction #3
(Group Chat) expresses its own guardrail differently (a message-count
cap inside termination_condition, not a counter like this one).

Covers both original TODO bullets:
  - the guardrail stops routing back to the Planner once the configured
    MAX_REVISIONS is reached, even if the Critic still hasn't approved
  - the workflow surfaces a clear, graceful GuardrailStop when the
    guardrail trips, not a silent infinite loop or an unhandled exception
"""
from __future__ import annotations

import sys
from pathlib import Path

# Make the project root importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from part_b_orchestrations import MAX_REVISIONS, GuardrailStop, compute_next_step  # noqa: E402
from roles import CriticVerdict  # noqa: E402


def _rejected(feedback: str = "needs more detail") -> CriticVerdict:
    return CriticVerdict(approved=False, feedback=feedback, answer=None)


def test_guardrail_allows_revision_under_budget() -> None:
    """Below MAX_REVISIONS, compute_next_step must NOT stop — the loop
    should keep going back to the Planner."""
    new_count, stop = compute_next_step(_rejected(), current_count=0)

    assert new_count == 1
    assert stop is None, "must not stop while still under budget"


def test_guardrail_stops_after_max_revisions() -> None:
    """Once the budget is reached, compute_next_step must stop routing
    back to the Planner, even though the Critic still hasn't approved."""
    new_count, stop = compute_next_step(_rejected("still missing citations"), current_count=MAX_REVISIONS)

    assert new_count == MAX_REVISIONS + 1
    assert stop is not None, "must stop once the budget is exceeded"
    assert stop.revisions_attempted == MAX_REVISIONS + 1
    assert stop.last_feedback == "still missing citations"


def test_guardrail_trip_is_graceful_not_silent() -> None:
    """The guardrail's whole point (Module 6): a bounded, typed
    GuardrailStop result, never a silent infinite loop or an unhandled
    exception, however far over budget the loop has run."""
    _, stop = compute_next_step(_rejected("circular reasoning"), current_count=MAX_REVISIONS + 5)

    assert isinstance(stop, GuardrailStop)
    assert stop.reason, "GuardrailStop.reason must be a non-empty, human-readable explanation"
