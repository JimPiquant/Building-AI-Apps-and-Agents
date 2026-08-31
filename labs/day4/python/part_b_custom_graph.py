"""
Day 4 Lab — Part B — A custom graph fixes it.

This file is provided complete — run it to see Part A's exact limitation
get fixed: the same Planner/Retriever/Critic roles, rebuilt on a custom
WorkflowBuilder graph with a genuine revision loop and a required budget
guardrail.

Story:
  1. Rebuild Part A's three roles using WorkflowBuilder instead of
     SequentialBuilder — a genuine rewrite of the orchestration plumbing,
     not a small diff on Part A's code (Module 2's own "escalating
     sophistication" framing).
  2. Add a conditional edge routing not-approved verdicts away from the
     approved path (Module 3's "Conditional edges in code" slide) — this
     is the exact mechanic Sequential can't do.
  3. Add a REQUIRED budget guardrail: a conditional edge has no built-in
     max_iterations (unlike AgentLoopMiddleware's single-agent loop), so
     the Critic-to-Planner loop can run forever if the model never
     approves. A small custom executor (revision_gate, below) tracks a
     counter in workflow state (ctx.set_state/get_state) and stops the
     loop with a graceful GuardrailStop once the budget is exceeded.
  4. Run it against the SAME golden set as Part A and confirm the
     questions that failed in Part A now get a genuine second (or third)
     attempt.

--------------------------------------------------------------------------
Grounding note — this file's real shape vs. Module 3's simplified slide
code. Module 3's "Conditional edges in code" slide shows:

    builder.add_edge(critic, planner, condition=lambda result: not result.approved)

as if `result` were an already-parsed CriticVerdict with a plain
`.approved` attribute, and as if the loop-back edge went directly back to
the planner. That's illustrative pseudocode, not the literal real shape —
confirmed against Microsoft Learn's own "Conditional Edges" tutorial and
its complete edge_condition.py sample (agent-framework repo):
  - Condition functions receive the raw AgentExecutorResponse the
    upstream agent produced, not a pre-parsed model. The condition itself
    is responsible for parsing (`DetectionResult.model_validate_json(
    message.agent_response.text)` in that sample) and defensively
    handling anything unexpected.
  - Agents that participate in conditional routing are wrapped in
    AgentExecutor(agent, id=...) explicitly (that sample's own pattern).
  - Condition functions receive ONLY the message, never `ctx` — so a
    workflow-state counter (ctx.set_state/get_state, Module 3's own state
    primitive) can only be read/written from inside a real Executor's
    @handler, never from a bare condition lambda.

So this file keeps the conditional-edge MECHANIC Module 3 teaches —
that's still exactly what routes a not-approved verdict away from the
approved path — but the counter itself lives one hop downstream, inside
revision_gate, a small custom executor that actually has `ctx`. This is
the same "small glue executor between agents" pattern edge_condition.py's
own sample uses (to_email_assistant_request / handle_email_response /
handle_spam_classifier_response there; finalize / revision_gate here).

Grounding note — one fresh workflow per golden-set question. Same reason
as Part A (see its module docstring): Microsoft Learn's Workflows "State"
doc is explicit that reusing one workflow instance across different
tasks lets agent threads AND revision_gate's own state-counter leak
across unrelated questions. build_workflow() is called fresh inside the
golden-set loop below for exactly this reason — question #2 must start
with a clean planner/retriever/critic thread and a revision_count of
zero, not whatever question #1 left behind.

--------------------------------------------------------------------------
Definition of done for Part B (from labs/day4/README.md):
  - Revision loop works; trajectory eval scores and cost per successful
    outcome captured
  - Budget guardrail triggers cleanly in a stress test - REQUIRED, not
    stretch
--------------------------------------------------------------------------

Prereqs:
  1. `uv run part_a_sequential.py` runs end-to-end (confirms Part A's
     limitation, which this file fixes)

Run with:
    uv run part_b_custom_graph.py

VS Code debugger tip: breakpoint inside revision_gate() to watch
ctx.get_state("revision_count") accumulate across loop iterations for a
single golden-set question — this is the one piece of real workflow
state this lab uses.
"""
from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic import BaseModel

from agent_framework import (
    AgentExecutor,
    AgentExecutorRequest,
    AgentExecutorResponse,
    Message,
    WorkflowBuilder,
    WorkflowContext,
    executor,
)
from azure.identity import AzureCliCredential

from roles import Answer, CriticVerdict, build_critic, build_planner, build_retriever, load_golden_set

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

MAX_REVISIONS = 3  # the required budget guardrail — tune during authoring/dry runs


class GuardrailStop(BaseModel):
    """Part B's graceful-stop output when the revision loop hits
    MAX_REVISIONS without the Critic approving. A bounded, visible stop,
    not a silent infinite loop or an unhandled exception — the
    guardrail's whole point (Module 6)."""
    reason: str
    revisions_attempted: int
    last_feedback: str


def _extract_verdict(message: Any) -> CriticVerdict | None:
    """Parse a CriticVerdict out of an AgentExecutorResponse for use in a
    condition function. Returns None on anything unexpected (not an
    AgentExecutorResponse, or a parse failure) so conditions can fail
    closed rather than crash the workflow — the same defensive style as
    the framework's own edge_condition.py sample."""
    if not isinstance(message, AgentExecutorResponse):
        return None
    try:
        return CriticVerdict.model_validate_json(message.agent_response.text)
    except Exception:
        return None


def _is_approved(message: Any) -> bool:
    verdict = _extract_verdict(message)
    return verdict is not None and verdict.approved


def _needs_revision(message: Any) -> bool:
    verdict = _extract_verdict(message)
    return verdict is not None and not verdict.approved


def compute_next_step(verdict: CriticVerdict, current_count: int) -> tuple[int, GuardrailStop | None]:
    """The guardrail's pure decision logic, deliberately separated from
    revision_gate's workflow-context plumbing below so it can be unit
    tested in isolation (tests/test_part_b_guardrail.py) with no live
    Foundry workflow, no AgentExecutorResponse, no WorkflowContext —
    mirrors Day 3's "test the logic in isolation first" approach
    (Module 6).

    Returns (new_count, stop): stop is a populated GuardrailStop once
    new_count exceeds MAX_REVISIONS, else None (meaning: still under
    budget, loop back to the Planner)."""
    new_count = current_count + 1
    if new_count > MAX_REVISIONS:
        return new_count, GuardrailStop(
            reason=f"Exceeded the {MAX_REVISIONS}-revision budget without Critic approval.",
            revisions_attempted=new_count,
            last_feedback=verdict.feedback,
        )
    return new_count, None


@executor(id="finalize")
async def finalize(response: AgentExecutorResponse, ctx: WorkflowContext[Any, Answer]) -> None:
    """Approved path: unwrap the Critic's Answer and yield it as the
    workflow's output. Never sends a message onward — this is a terminal
    hop, hence WorkflowContext[Any, Answer] (send type unused, yield
    type Answer)."""
    verdict = CriticVerdict.model_validate_json(response.agent_response.text)
    assert verdict.answer is not None, "an approved verdict always carries an answer (roles.py's contract)"
    await ctx.yield_output(verdict.answer)


@executor(id="revision_gate")
async def revision_gate(
    response: AgentExecutorResponse, ctx: WorkflowContext[AgentExecutorRequest, GuardrailStop]
) -> None:
    """Not-approved path: track the revision count in workflow state
    (ctx.set_state/get_state, private to this executor by default — no
    other executor needs to read it) and either route a new request back
    to the Planner with the Critic's feedback, or trip the guardrail and
    yield a graceful GuardrailStop instead of looping forever."""
    verdict = CriticVerdict.model_validate_json(response.agent_response.text)
    current_count = ctx.get_state("revision_count") or 0
    new_count, stop = compute_next_step(verdict, current_count)
    ctx.set_state("revision_count", new_count)

    if stop is not None:
        await ctx.yield_output(stop)
        return

    await ctx.send_message(
        AgentExecutorRequest(
            messages=[
                Message(
                    role="user",
                    contents=[
                        "The Critic rejected the previous plan with this feedback: "
                        f"{verdict.feedback}\nRevise the plan to address it."
                    ],
                )
            ],
            should_respond=True,
        ),
        target_id="planner",
    )


def build_workflow(credential: AzureCliCredential):
    """Part B: Planner -> Retriever -> Critic, with a bounded Critic ->
    Planner revision loop and a required budget guardrail. Call this
    fresh for every task/request (see module docstring on state
    isolation) — never reuse one build_workflow() result across
    unrelated questions; revision_gate's own counter would leak too."""
    planner = AgentExecutor(build_planner(credential), id="planner")
    retriever = AgentExecutor(build_retriever(credential), id="retriever")
    critic = AgentExecutor(build_critic(credential), id="critic")

    return (
        WorkflowBuilder(start_executor=planner)
        .add_edge(planner, retriever)
        .add_edge(retriever, critic)
        .add_edge(critic, finalize, condition=_is_approved)
        .add_edge(critic, revision_gate, condition=_needs_revision)
        .add_edge(revision_gate, planner)
        .build()
    )


async def main() -> None:
    credential = AzureCliCredential()
    golden_set = load_golden_set()

    results = []
    for row in golden_set:
        # Fresh workflow (fresh Agent instances, fresh threads, fresh
        # revision_count) per question — required for state isolation,
        # see module docstring.
        workflow = build_workflow(credential)
        request = AgentExecutorRequest(
            messages=[Message(role="user", contents=[row["query"]])], should_respond=True
        )
        events = await workflow.run(request)
        outputs = events.get_outputs()
        results.append((row, outputs[0] if outputs else None))

    print(f"Part B — Custom graph — {len(results)} golden-set questions\n")
    approved_count = 0
    guardrail_trips = 0
    no_output = 0
    for row, output in results:
        if isinstance(output, Answer):
            approved_count += 1
            print(f"[APPROVED] {row['query']}")
        elif isinstance(output, GuardrailStop):
            guardrail_trips += 1
            print(f"[GUARDRAIL TRIPPED after {output.revisions_attempted} revisions] {row['query']}")
            print(f"    last feedback: {output.last_feedback}")
        else:
            no_output += 1
            print(f"[NO OUTPUT] {row['query']}")

    print(f"\n{approved_count}/{len(results)} approved (possibly after revision).")
    print(f"{guardrail_trips}/{len(results)} hit the guardrail — a bounded, graceful stop, not a bug.")
    if no_output:
        print(f"{no_output}/{len(results)} produced no output — investigate before trusting eval numbers.")
    print(
        "\nCompare this against Part A's results: questions Part A marked "
        "NOT APPROVED with no way to recover should now show up either "
        "APPROVED (the revision loop worked) or GUARDRAIL TRIPPED (a "
        "genuinely hard question, stopped safely instead of looping "
        "forever)."
    )


if __name__ == "__main__":
    asyncio.run(main())
