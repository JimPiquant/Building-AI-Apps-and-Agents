"""
Day 4 Lab — Part B — isolation tests for the budget-guardrail counter.

Test the iteration-counter/guardrail logic WITHOUT running a full workflow
against Foundry — mirrors labs/day3/python/tests/test_part_b_middleware.py's
"test the logic in isolation first" approach (Module 6).

--------------------------------------------------------------------------
TODO: author tests here once part_b_custom_graph.py's guardrail counter
exists. At minimum, cover:
  - the condition function stops routing back to the Planner once the
    configured MAX_REVISIONS is reached, even if the Critic still hasn't
    approved
  - the workflow surfaces a clear, graceful result when the guardrail
    trips, not a silent infinite loop or an unhandled exception
--------------------------------------------------------------------------
"""
import pytest


@pytest.mark.skip(reason="Author this test once part_b_custom_graph.py's guardrail counter exists.")
def test_guardrail_stops_after_max_revisions() -> None:
    raise NotImplementedError


@pytest.mark.skip(reason="Author this test once part_b_custom_graph.py's guardrail counter exists.")
def test_guardrail_trip_is_graceful_not_silent() -> None:
    raise NotImplementedError
