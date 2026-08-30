"""
Day 3 Lab — Part B — isolation tests for middleware behavior.

Test the guardrail short-circuit and bounded retry WITHOUT running a full
agent turn against Foundry — mirrors labs/day2/python/tests/test_tools.py's
"test the logic in isolation first" approach (Module 6).

--------------------------------------------------------------------------
TODO: author tests here once part_b_middleware.py's middleware classes
exist. At minimum, cover:
  - the guardrail middleware sets context.result and raises
    MiddlewareTermination for a blocked request, and call_next() is never
    invoked
  - the bounded retry policy stops after its configured max attempts
    rather than looping unboundedly
--------------------------------------------------------------------------
"""
import pytest


@pytest.mark.skip(reason="Author this test once part_b_middleware.py's guardrail middleware exists.")
def test_guardrail_short_circuits_blocked_request() -> None:
    raise NotImplementedError


@pytest.mark.skip(reason="Author this test once part_b_middleware.py's retry policy exists.")
def test_retry_is_bounded() -> None:
    raise NotImplementedError
