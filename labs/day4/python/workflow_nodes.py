"""
Day 4 Lab — graph plumbing shared by Part B.

PROVIDED COMPLETE, with ONE deliberate exception: `RevisionGate` ships with
its bound missing. You write that in Part B2. Everything else here is worked
example — read it, don't rewrite it.

WHY THESE ADAPTERS EXIST
An `Agent` placed in a workflow graph speaks in `AgentExecutorResponse`
objects whose payload is TEXT. The typed contracts in agents.py (Plan,
Findings, CriticResult) only exist once something parses that text. These
small `@executor` functions are that something: they parse the upstream
agent's JSON, and build the next agent's request.

This is the official pattern -- see the SDK's own control-flow sample
`python/samples/03-workflows/control-flow/edge_condition.py`, which parses
`response.agent_response.text` with `model_validate_json` in exactly this
shape. Real graphs are agent nodes separated by small typed adapters.

READING ORDER
  1. `parse` .............. text in, Pydantic model out
  2. `to_plan` ............ Planner -> Retriever
  3. `to_findings` ........ Retriever -> Critic
  4. `RevisionGate` ....... Critic -> loop back, or finish   <- Part B2 edits
  5. `to_revision` ........ gate -> Planner, carrying feedback
  6. `finalize` ........... gate -> workflow output
"""

from __future__ import annotations

import json

from agent_framework import (
    AgentExecutorRequest,
    AgentExecutorResponse,
    Executor,
    Message,
    WorkflowContext,
    executor,
    handler,
)
from pydantic import BaseModel
from typing_extensions import Never, TypeVar

_M = TypeVar("_M", bound=BaseModel)

from agents import Answer, CriticResult, Findings, Plan

# How many revision passes Part B allows before it gives up gracefully.
# Part B2 is about making this number mean something.
MAX_REVISIONS = 2

# Workflow-state keys. State is shared across the whole run and survives the
# loop-back, which is exactly why the counter lives here and not in a Python
# variable inside an executor.
REVISION_COUNT = "revision_count"
ORIGINAL_QUESTION = "original_question"


# --------------------------------------------------------------------------
# 1. Parsing
# --------------------------------------------------------------------------


def parse(response: AgentExecutorResponse, model: type[_M]) -> _M:
    """Pull a typed model out of an agent's text response.

    Models sometimes wrap JSON in a markdown fence even when asked not to,
    so strip one if present before validating.
    """
    text = response.agent_response.text.strip()
    if text.startswith("```"):
        lines = [ln for ln in text.splitlines() if not ln.startswith("```")]
        text = "\n".join(lines).strip()
    return model.model_validate_json(text)


def _request(payload: str) -> AgentExecutorRequest:
    return AgentExecutorRequest(
        messages=[Message("user", contents=[payload])], should_respond=True
    )


# --------------------------------------------------------------------------
# 2. Planner -> Retriever
# --------------------------------------------------------------------------


@executor(id="to_plan")
async def to_plan(
    response: AgentExecutorResponse, ctx: WorkflowContext[AgentExecutorRequest]
) -> None:
    """Parse the Planner's Plan and hand the Retriever its instructions."""
    plan = parse(response, Plan)
    ctx.set_state(ORIGINAL_QUESTION, plan.question)

    if not plan.needs_retrieval or not plan.steps:
        payload = (
            f"QUESTION: {plan.question}\n\n"
            "The planner determined this question needs no document retrieval. "
            "Return empty excerpts, empty citations, and no gaps."
        )
    else:
        steps = "\n".join(f"{i}. {s}" for i, s in enumerate(plan.steps, 1))
        payload = f"QUESTION: {plan.question}\n\nRun these search steps:\n{steps}"

    await ctx.send_message(_request(payload))


# --------------------------------------------------------------------------
# 3. Retriever -> Critic
# --------------------------------------------------------------------------


@executor(id="to_findings")
async def to_findings(
    response: AgentExecutorResponse, ctx: WorkflowContext[AgentExecutorRequest]
) -> None:
    """Parse the Retriever's Findings and hand the Critic everything it needs."""
    findings = parse(response, Findings)
    question = ctx.get_state(ORIGINAL_QUESTION, "")
    attempt = ctx.get_state(REVISION_COUNT, 0) + 1

    payload = (
        f"QUESTION: {question}\n\n"
        f"ATTEMPT: {attempt} of {MAX_REVISIONS + 1}\n\n"
        f"EXCERPTS:\n{findings.excerpts or '(none)'}\n\n"
        f"CITATIONS: {json.dumps(findings.citations)}\n"
        f"REPORTED GAPS: {json.dumps(findings.gaps)}\n\n"
        "Judge these findings and produce a CriticResult."
    )
    await ctx.send_message(_request(payload))


# --------------------------------------------------------------------------
# 4. The gate  <- Part B2 edits this class
# --------------------------------------------------------------------------


class GateDecision(BaseModel):
    """What the gate decided, and why.

    Carried on the edge so the two conditional edges out of the gate have a
    plain boolean to test -- the same shape the SDK's own edge_condition
    sample routes on.
    """

    should_revise: bool
    answer: Answer
    feedback: str
    revision: int
    capped: bool = False


class RevisionGate(Executor):
    """Decide whether to send the work back to the Planner, or finish.

    PART B1: ships approving-or-looping purely on `result.approved`. That is
    correct behaviour for a Critic that eventually approves -- and an
    unbounded loop for one that never does.

    PART B2: you add the bound. See the TODO below.
    """

    def __init__(self, id: str = "revision_gate") -> None:
        super().__init__(id=id)

    @handler
    async def decide(
        self, response: AgentExecutorResponse, ctx: WorkflowContext[GateDecision]
    ) -> None:
        result: CriticResult = parse(response, CriticResult)
        revision = ctx.get_state(REVISION_COUNT, 0)

        if result.approved:
            await ctx.send_message(
                GateDecision(
                    should_revise=False,
                    answer=result.answer,
                    feedback="",
                    revision=revision,
                )
            )
            return

        # ------------------------------------------------------------------
        # TODO (Part B2) — bound this loop.
        #
        # Right now every unapproved result loops back, forever, for a
        # question the corpus cannot answer. Before incrementing the counter
        # and sending the work back, stop when `revision` has already reached
        # MAX_REVISIONS and finish gracefully instead:
        #
        #   * send a GateDecision with should_revise=False and capped=True
        #   * carry the Critic's best answer, but replace its confidence with
        #     something honest (<= 0.3) and prefix the summary so a reader
        #     knows the workflow gave up rather than concluded
        #
        # Read tests/test_guardrail.py first -- it is the specification, and
        # it is currently failing.
        # ------------------------------------------------------------------

        ctx.set_state(REVISION_COUNT, revision + 1)
        await ctx.send_message(
            GateDecision(
                should_revise=True,
                answer=result.answer,
                feedback=result.reason,
                revision=revision + 1,
            )
        )


def capped_answer(answer: Answer, revisions: int) -> Answer:
    """Rewrite an answer as an honest, bounded give-up. Used by Part B2."""
    return Answer(
        summary=(
            f"[Stopped after {revisions} revision passes without the Critic "
            f"approving.] {answer.summary}"
        ),
        bullets=answer.bullets,
        citations=answer.citations,
        confidence=min(answer.confidence, 0.3),
    )


# --------------------------------------------------------------------------
# 5. Gate -> Planner (the loop-back)
# --------------------------------------------------------------------------


@executor(id="to_revision")
async def to_revision(
    decision: GateDecision, ctx: WorkflowContext[AgentExecutorRequest]
) -> None:
    """Send the Critic's feedback back to the Planner for another pass.

    The feedback is the entire point of the loop. A revision pass that
    re-sends the original question with no feedback produces the same plan
    and the same failure -- burning a full pass to learn nothing.
    """
    question = ctx.get_state(ORIGINAL_QUESTION, "")
    payload = (
        f"QUESTION: {question}\n\n"
        f"A previous attempt was rejected by the critic on revision "
        f"{decision.revision}.\n"
        f"CRITIC FEEDBACK: {decision.feedback}\n\n"
        "Produce a NEW plan that closes this gap. Do not repeat the plan that "
        "already failed."
    )
    await ctx.send_message(_request(payload))


# --------------------------------------------------------------------------
# 6. Gate -> workflow output
# --------------------------------------------------------------------------


@executor(id="finalize")
async def finalize(decision: GateDecision, ctx: WorkflowContext[Never, Answer]) -> None:
    """Emit the Answer as the workflow's terminal output."""
    await ctx.yield_output(decision.answer)


# --------------------------------------------------------------------------
# Edge conditions
# --------------------------------------------------------------------------
# A condition receives the message the upstream executor produced and returns
# a bool. It does NOT receive the workflow context -- which is precisely why
# the revision counter lives in the gate (which has ctx) and the condition
# only reads a field off the message.


def needs_revision(message: object) -> bool:
    return isinstance(message, GateDecision) and message.should_revise


def is_final(message: object) -> bool:
    return isinstance(message, GateDecision) and not message.should_revise
