"""
Day 4 Lab — Part B2 — the guardrail specification.

THIS TEST SHIPS FAILING. Making it pass is Part B2.

It needs no Foundry credentials and makes no model call. The Critic is a
stub that behaves like the worst realistic case: it never approves. That is
not a strawman -- it is exactly what a correct Critic does when asked a
question the corpus cannot answer, which is what evals/stress_case.json is.

WHAT IS BEING SPECIFIED
Part B1's gate loops whenever `approved` is false. For a Critic that
eventually approves, that terminates. For one that never does, it does not.
That is a correctness bug in the graph, and no amount of prompt tuning fixes
it -- the Critic is behaving correctly.

Read these three tests as the requirement, then edit `RevisionGate.decide`
in workflow_nodes.py:

  1. the loop stops at MAX_REVISIONS
  2. stopping is graceful -- a low-confidence Answer, not an exception
  3. a Critic that DOES approve still short-circuits immediately

WHY NOT JUST USE WorkflowBuilder(max_iterations=...)?
Because it is a different tool for a different job. `max_iterations`
defaults to 100 supersteps and guards the entire graph against runaway
execution; when it trips the run simply stops, and the caller gets no
answer. What you want here is a domain rule -- "two revision passes is
all this question is worth" -- that ends the run deliberately, with an
honest low-confidence answer a caller can actually use. Backstop and policy
are not the same thing. Keep both.

RUN WITH
    uv run pytest tests/test_guardrail.py -v
"""

from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents import Answer, CriticResult  # noqa: E402
from workflow_nodes import (  # noqa: E402
    MAX_REVISIONS,
    REVISION_COUNT,
    GateDecision,
    RevisionGate,
    parse,
)


# --------------------------------------------------------------------------
# Fakes — no agent, no network, no credentials.
# --------------------------------------------------------------------------


class FakeContext:
    """Stands in for WorkflowContext.

    Mirrors the real API's shape in the one way that matters here:
    get_state/set_state are synchronous, send_message is awaited.
    """

    def __init__(self) -> None:
        self._state: dict[str, object] = {}
        self.sent: list[object] = []

    def get_state(self, key: str, default: object = None) -> object:
        return self._state.get(key, default)

    def set_state(self, key: str, value: object) -> None:
        self._state[key] = value

    async def send_message(self, message: object, target_id: str | None = None) -> None:
        self.sent.append(message)

    async def yield_output(self, output: object) -> None:
        self.sent.append(output)


def critic_response(*, approved: bool, reason: str = "still missing the approval authority") -> object:
    """An AgentExecutorResponse whose text is a serialized CriticResult."""
    result = CriticResult(
        approved=approved,
        reason="" if approved else reason,
        answer=Answer(
            summary="Partial answer assembled from the excerpts.",
            bullets=["A supporting detail."],
            citations=["incident-severity.md"],
            confidence=0.8,
        ),
    )
    return SimpleNamespace(
        agent_response=SimpleNamespace(text=result.model_dump_json()),
        executor_id="critic",
    )


def test_parse_accepts_json_wrapped_in_markdown_prose() -> None:
    response = critic_response(approved=True)
    response.agent_response.text = (
        "Here is the requested result:\n```json\n"
        f"{response.agent_response.text}\n```"
    )

    result = parse(response, CriticResult)

    assert result.approved is True


async def drive_until_settled(max_turns: int = 25) -> tuple[list[GateDecision], FakeContext]:
    """Run the gate against a Critic that never approves.

    Each turn feeds the gate one unapproved CriticResult, exactly as the
    graph would on a revision pass. A correctly bounded gate stops asking
    for revisions well before max_turns.
    """
    gate = RevisionGate()
    ctx = FakeContext()
    decisions: list[GateDecision] = []

    for _ in range(max_turns):
        await gate.decide(critic_response(approved=False), ctx)
        decision = ctx.sent[-1]
        assert isinstance(decision, GateDecision)
        decisions.append(decision)
        if not decision.should_revise:
            break

    return decisions, ctx


# --------------------------------------------------------------------------
# The specification
# --------------------------------------------------------------------------


async def test_loop_is_bounded() -> None:
    """A Critic that never approves must not produce unbounded revisions."""
    decisions, _ = await drive_until_settled()

    assert not decisions[-1].should_revise, (
        f"The gate asked for a revision on all {len(decisions)} turns and never "
        "stopped. A Critic that never approves will loop forever. Bound it in "
        "RevisionGate.decide()."
    )

    revisions_requested = sum(1 for d in decisions if d.should_revise)
    assert revisions_requested <= MAX_REVISIONS, (
        f"The gate requested {revisions_requested} revisions; MAX_REVISIONS is "
        f"{MAX_REVISIONS}."
    )


async def test_stop_is_graceful_not_an_exception() -> None:
    """Giving up must still return a usable, honestly-labelled Answer."""
    decisions, _ = await drive_until_settled()
    final = decisions[-1]

    assert final.capped, (
        "The final decision should set capped=True so a caller can tell "
        "'we ran out of passes' apart from 'the critic approved'."
    )
    assert final.answer is not None, "Give up with an answer, not with nothing."
    assert final.answer.confidence <= 0.3, (
        f"Confidence was {final.answer.confidence}. An answer the Critic never "
        "approved must not claim high confidence -- that is the failure mode "
        "this whole part exists to prevent."
    )
    assert final.answer.summary, "The summary should say the workflow gave up."


async def test_approved_result_finishes_immediately() -> None:
    """The bound must not break the normal path."""
    gate = RevisionGate()
    ctx = FakeContext()

    await gate.decide(critic_response(approved=True), ctx)

    decision = ctx.sent[-1]
    assert isinstance(decision, GateDecision)
    assert not decision.should_revise, "An approved result must not be sent back."
    assert not decision.capped, "An approved result was not capped; it was approved."
    assert decision.answer.confidence > 0.3, (
        "An approved answer should keep the Critic's own confidence."
    )
    assert ctx.get_state(REVISION_COUNT, 0) == 0, (
        "Approving on the first pass should not have incremented the counter."
    )
