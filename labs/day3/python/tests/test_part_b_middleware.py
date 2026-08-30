"""
Day 3 Lab — Part B — isolation tests for middleware behavior.

Run with:
    cd labs/day3/python
    uv run pytest tests/test_part_b_middleware.py -v

Test the guardrail short-circuit and the bounded retry WITHOUT running a
full agent turn against Foundry — mirrors
labs/day2/python/tests/test_tools.py's "test the logic in isolation first"
approach (Module 6). These tests use minimal fake context objects (only
the attributes the middleware actually reads/writes: .messages, .metadata,
.result for AgentContext; .function.name, .result for
FunctionInvocationContext) via types.SimpleNamespace, rather than real
AgentContext/FunctionInvocationContext instances — so these tests run with
no network calls and no Foundry credentials.
"""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

# Make the project root importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from agent_framework import MiddlewareTermination  # noqa: E402
from part_b_middleware import (  # noqa: E402
    MAX_RETRIES,
    GuardrailMiddleware,
    resilient_tool_middleware,
)


class _FakeMessage:
    def __init__(self, text: str) -> None:
        self.text = text


def _make_agent_context(text: str) -> SimpleNamespace:
    return SimpleNamespace(messages=[_FakeMessage(text)], metadata={}, result=None)


def _make_function_context() -> SimpleNamespace:
    return SimpleNamespace(function=SimpleNamespace(name="flaky_data_service"), result=None)


@pytest.mark.asyncio
async def test_guardrail_short_circuits_blocked_request() -> None:
    """A blocked request must set context.result and raise MiddlewareTermination
    BEFORE call_next() runs — never just return and assume the run stopped."""
    context = _make_agent_context("What's my password?")
    called = False

    async def call_next() -> None:
        nonlocal called
        called = True

    with pytest.raises(MiddlewareTermination):
        await GuardrailMiddleware().process(context, call_next)

    assert called is False, "call_next() must never run once the guardrail blocks a request"
    assert context.result is not None, "context.result must be set before MiddlewareTermination is raised"


@pytest.mark.asyncio
async def test_guardrail_allows_clean_request() -> None:
    """A request with no blocked keyword must pass through to call_next()."""
    context = _make_agent_context("What's the weather like?")
    called = False

    async def call_next() -> None:
        nonlocal called
        called = True

    await GuardrailMiddleware().process(context, call_next)

    assert called is True, "call_next() must run for a request with no blocked keyword"


@pytest.mark.asyncio
async def test_retry_is_bounded() -> None:
    """If call_next always fails, the retry must stop at MAX_RETRIES, not loop forever."""
    context = _make_function_context()
    attempts = 0

    async def call_next() -> None:
        nonlocal attempts
        attempts += 1
        raise TimeoutError("always fails")

    await resilient_tool_middleware(context, call_next)

    assert attempts == MAX_RETRIES, f"expected exactly {MAX_RETRIES} attempts, got {attempts}"
    assert context.result is not None, "a graceful fallback message must be set once retries are exhausted"


@pytest.mark.asyncio
async def test_retry_recovers_within_budget() -> None:
    """If call_next fails twice then succeeds, the retry must stop as soon as it succeeds."""
    context = _make_function_context()
    attempts = 0

    async def call_next() -> None:
        nonlocal attempts
        attempts += 1
        if attempts <= 2:
            raise TimeoutError("transient")

    await resilient_tool_middleware(context, call_next)

    assert attempts == 3, f"expected exactly 3 attempts (2 failures + 1 success), got {attempts}"
    assert context.result is None, "no fallback message should be set when the retry recovers"


@pytest.mark.asyncio
async def test_retry_does_not_catch_unclassified_exceptions() -> None:
    """A non-TimeoutError exception must propagate immediately, not be retried."""
    context = _make_function_context()
    attempts = 0

    async def call_next() -> None:
        nonlocal attempts
        attempts += 1
        raise ValueError("not a transient failure")

    with pytest.raises(ValueError):
        await resilient_tool_middleware(context, call_next)

    assert attempts == 1, "an unclassified exception must not trigger a retry"
