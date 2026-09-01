"""
Day 4 Lab — Part B2 worked answer.

This is the completed `RevisionGate.decide` from workflow_nodes.py. To apply
it, replace the TODO block in that file's `decide` method with the marked
section below.

WHAT CHANGED
Three lines of logic, before the counter is incremented:

    if revision >= MAX_REVISIONS:
        ... finish, capped ...
        return

Everything else is unchanged.

WHY IT GOES THERE
The check has to happen *before* `ctx.set_state(REVISION_COUNT, revision + 1)`
and before the revise message is sent. Put it after, and the gate has already
asked for one more pass than it should.

WHY THE COUNTER IS IN WORKFLOW STATE
`ctx.set_state` / `ctx.get_state` are shared across the whole workflow run
and survive the loop back to the Planner. An instance attribute on the gate
would work only until you reused the gate across runs -- at which point run
two would inherit run one's count, which is Module 3's state-isolation trap.
A local variable would not survive the loop at all.

Note both are SYNCHRONOUS -- no `await`. `send_message` and `yield_output`
are async; state access is not.

WHY THE CONDITION FUNCTION COULDN'T DO THIS
An edge condition receives only the message the upstream executor produced.
It gets no workflow context, so it cannot read a counter. That is the reason
the gate is an Executor at all rather than a lambda on the edge: counting is
stateful, and state lives with executors.
"""

from __future__ import annotations

from agent_framework import AgentExecutorResponse, WorkflowContext, handler

from agents import CriticResult
from workflow_nodes import (
    MAX_REVISIONS,
    REVISION_COUNT,
    GateDecision,
    capped_answer,
    parse,
)


class RevisionGateSolution:
    """The completed `decide`. Copy the body into workflow_nodes.RevisionGate."""

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

        # ---- Part B2 begins ------------------------------------------------
        if revision >= MAX_REVISIONS:
            # Out of passes. Finish deliberately with an honest answer rather
            # than asking for a revision that will be rejected the same way.
            await ctx.send_message(
                GateDecision(
                    should_revise=False,
                    answer=capped_answer(result.answer, revision),
                    feedback=result.reason,
                    revision=revision,
                    capped=True,
                )
            )
            return
        # ---- Part B2 ends --------------------------------------------------

        ctx.set_state(REVISION_COUNT, revision + 1)
        await ctx.send_message(
            GateDecision(
                should_revise=True,
                answer=result.answer,
                feedback=result.reason,
                revision=revision + 1,
            )
        )
