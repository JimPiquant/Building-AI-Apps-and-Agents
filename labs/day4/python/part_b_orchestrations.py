"""
Day 4 Lab — Part B — Orchestrations.

This file is provided complete — run it to see the SAME Planner/
Retriever/Critic roles from Part A built three genuinely different ways:
the `SequentialBuilder` shortcut, a custom `WorkflowBuilder` graph with a
revision loop and a required guardrail, and `GroupChatBuilder` with an
LLM orchestrator. No golden set here, no scored comparison — that's
Part C's job, and it imports the three `build_workflow_*()` functions
below rather than re-implementing any of this.

Story:
  1. `build_workflow_sequential()` — the exact same graph Part A built by
     hand (planner -> retriever -> critic, no loop), now built with
     `SequentialBuilder` in one line. Same limitation as Part A: the
     Critic runs once, and a rejected verdict has nowhere to go.
  2. `build_workflow_custom_graph()` — fixes that limitation: a
     conditional edge routes a rejected verdict to `revision_gate`, which
     tracks a revision counter in workflow state and either loops back to
     the Planner with the Critic's feedback, or trips a REQUIRED budget
     guardrail (a conditional edge has no built-in max_iterations, unlike
     AgentLoopMiddleware's single-agent loop).
  3. `build_workflow_group_chat()` — a second, different fix: the SAME
     three roles as plain participants in a `GroupChatBuilder`, with an
     LLM `orchestrator_agent` deciding who speaks next instead of a
     deterministic Python condition function. Its own `termination_condition`
     parameter is the guardrail here — no separate custom executor needed,
     because GroupChatBuilder gives you exactly one hook (unlike the
     custom graph's dedicated `revision_gate` executor).
  4. `main()` runs the SAME hard question (one that needs at least one
     revision) through all three, so you can watch the identical
     limitation and two different fixes, back to back.

--------------------------------------------------------------------------
Grounding note — Module 3's simplified slide code vs. this file's real
shape (construction #2, the custom graph). Module 3's "Conditional edges
in code" slide shows:

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

So this file keeps the conditional-edge MECHANIC Module 3 teaches — still
exactly what routes a not-approved verdict away from the approved path —
but the counter itself lives one hop downstream, inside `revision_gate`,
a small custom executor that actually has `ctx`. Same "small glue
executor between agents" pattern as edge_condition.py's own sample
(to_email_assistant_request / handle_email_response /
handle_spam_classifier_response there; `finalize` / `revision_gate` here).

Grounding note — construction #3 (GroupChatBuilder). Unlike the custom
graph's `participants` (wrapped in `AgentExecutor` for conditional
routing), GroupChatBuilder's `participants` are plain `Agent` instances —
confirmed against Microsoft Learn's Group Chat orchestration tutorial and
its own Python sample. That sample's `orchestrator_agent` is a full
`Agent`, not a plain function — Module 2's own framing: "Flexible
Orchestrator Strategies... agent-based orchestrators." Its
`termination_condition` receives the shared message list directly
(`lambda messages: sum(1 for msg in messages if msg.role == "assistant")
>= 4` in that sample) — the same list every participant sees, since
GroupChatBuilder broadcasts each response to keep every participant's own
context current (Module 2's "Context Synchronization" bullet). That
broadcast is why `build_orchestrator()`'s instructions below don't need
to repeat the Critic's feedback back to the Planner the way
`revision_gate` does in construction #2 — the Planner already sees it.

Grounding note — one fresh workflow per question, for all three
constructions. Same reasoning as Part A: Microsoft Learn's Workflows
"State" doc is explicit that reusing one workflow instance across
different tasks leaks agent threads (and, in construction #2,
`revision_gate`'s own counter) across unrelated questions.

--------------------------------------------------------------------------
Definition of done for Part B (from labs/day4/README.md):
  - All three constructions run end-to-end on the same hard question
  - Revision loop (construction #2) and orchestrator routing
    (construction #3) both visibly recover from the Sequential
    limitation shown in construction #1
  - Budget guardrail triggers cleanly in a stress test — REQUIRED, not
    stretch, for BOTH constructions #2 and #3
--------------------------------------------------------------------------

Prereqs:
  1. `uv run part_a_workflow_basics.py` runs end-to-end (confirms the
     straight-line graph this file's Sequential construction mirrors)

Run with:
    uv run part_b_orchestrations.py

VS Code debugger tip: breakpoint inside `revision_gate()` to watch
`ctx.get_state("revision_count")` accumulate across loop iterations for
construction #2 — this is the one piece of real workflow state this lab
uses. For construction #3, breakpoint inside `_group_chat_finished()` to
watch the message count grow toward `MAX_GROUP_CHAT_MESSAGES`.
"""
from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic import BaseModel

from agent_framework import (
    Agent,
    AgentExecutor,
    AgentExecutorRequest,
    AgentExecutorResponse,
    Message,
    WorkflowBuilder,
    WorkflowContext,
    executor,
)
from agent_framework.orchestrations import GroupChatBuilder, SequentialBuilder
from azure.identity import AzureCliCredential

from roles import (
    Answer,
    CriticVerdict,
    build_client,
    build_critic,
    build_planner,
    build_retriever,
    extract_verdict,
)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# A question that needs at least one revision — good for demonstrating
# all three constructions side by side. Full-scale, statistical
# comparison across all 15 golden-set questions is Part C's job.
SAMPLE_QUERY = (
    "Walk me through diagnosing a 401 error end-to-end, from first "
    "symptom to final resolution, citing every relevant doc along the way."
)

MAX_REVISIONS = 3  # construction #2's required budget guardrail
MAX_GROUP_CHAT_MESSAGES = 12  # construction #3's required budget guardrail —
# roughly the same "up to 4 full planner/retriever/critic rounds" budget
# as MAX_REVISIONS, so the two guardrails are comparable, not arbitrary


# ---------------------------------------------------------------------------
# Construction #1 — SequentialBuilder (the shortcut for Part A's graph)
# ---------------------------------------------------------------------------


def build_workflow_sequential(credential: AzureCliCredential):
    """The exact same graph Part A built by hand, as a one-line shortcut.
    Same limitation: the Critic runs once, no loop back to the Planner."""
    planner = build_planner(credential)
    retriever = build_retriever(credential)
    critic = build_critic(credential)
    return SequentialBuilder(participants=[planner, retriever, critic]).build()


# ---------------------------------------------------------------------------
# Construction #2 — a custom WorkflowBuilder graph with a revision loop
# ---------------------------------------------------------------------------


class GuardrailStop(BaseModel):
    """Construction #2's graceful-stop output when the revision loop hits
    MAX_REVISIONS without the Critic approving. A bounded, visible stop,
    not a silent infinite loop or an unhandled exception — the
    guardrail's whole point (Module 6)."""
    reason: str
    revisions_attempted: int
    last_feedback: str


def _extract_verdict_from_response(message: Any) -> CriticVerdict | None:
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
    verdict = _extract_verdict_from_response(message)
    return verdict is not None and verdict.approved


def _needs_revision(message: Any) -> bool:
    verdict = _extract_verdict_from_response(message)
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


def build_workflow_custom_graph(credential: AzureCliCredential):
    """Construction #2: Planner -> Retriever -> Critic, with a bounded
    Critic -> Planner revision loop and a required budget guardrail. Call
    fresh for every question — never reuse one build_workflow_*() result
    across unrelated questions; revision_gate's own counter would leak
    too."""
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


# ---------------------------------------------------------------------------
# Construction #3 — GroupChatBuilder with an LLM orchestrator
# ---------------------------------------------------------------------------


def build_orchestrator(credential: AzureCliCredential) -> Agent:
    """Selects which participant speaks next. Unlike construction #2's
    conditional edge (a deterministic Python function), this decision is
    itself made by an LLM reading the shared conversation — Module 2's
    orchestrator_agent parameter accepts a full Agent, not a plain
    function."""
    return Agent(
        client=build_client(credential),
        name="orchestrator",
        instructions=(
            "You coordinate a research team conversation to answer the "
            "user's question. The team: planner (breaks the question into "
            "sub-questions), retriever (grounds each sub-question against "
            "documentation), critic (checks the evidence and either "
            "approves with a final answer, or rejects with feedback).\n\n"
            "Selection rules:\n"
            "- If the conversation has not started, select planner.\n"
            "- After planner speaks, select retriever.\n"
            "- After retriever speaks, select critic.\n"
            "- After critic speaks: if critic's message is a JSON "
            "CriticVerdict with approved=false, select planner again — it "
            "already sees the critic's feedback in this shared "
            "conversation, so you do not need to repeat it yourself. If "
            "approved=true, the task is complete."
        ),
    )


def _last_critic_verdict(messages: list[Any]) -> CriticVerdict | None:
    """Scan backward for the Critic's most recent message and parse it.
    Returns None if the Critic hasn't spoken yet or its message doesn't
    parse — fail closed, same defensive style as construction #2's
    condition functions."""
    for msg in reversed(messages):
        if getattr(msg, "author_name", None) != "critic":
            continue
        try:
            return CriticVerdict.model_validate_json(msg.text)
        except Exception:
            return None
    return None


def _group_chat_finished(messages: list[Any]) -> bool:
    """termination_condition: stop once the Critic's most recent message
    approves, OR once the conversation hits MAX_GROUP_CHAT_MESSAGES — the
    required guardrail, expressed here instead of as a custom executor.
    Construction #2 needed a dedicated revision_gate executor for this;
    GroupChatBuilder's termination_condition parameter is itself
    sufficient to express both the finish condition and the safety cap in
    one place, because GroupChatBuilder gives you exactly one hook to
    control termination, not a graph of edges to route through."""
    verdict = _last_critic_verdict(messages)
    if verdict is not None and verdict.approved:
        return True
    return len(messages) >= MAX_GROUP_CHAT_MESSAGES


def build_workflow_group_chat(credential: AzureCliCredential):
    """Construction #3: the SAME three roles as plain participants,
    coordinated by an LLM orchestrator instead of Python conditional
    edges. Call fresh for every question — same state-isolation
    reasoning as the other two constructions."""
    planner = build_planner(credential)
    retriever = build_retriever(credential)
    critic = build_critic(credential)
    orchestrator = build_orchestrator(credential)

    return GroupChatBuilder(
        participants=[planner, retriever, critic],
        orchestrator_agent=orchestrator,
        termination_condition=_group_chat_finished,
    ).build()


# ---------------------------------------------------------------------------
# Demonstration — run all three on the same hard question
# ---------------------------------------------------------------------------


async def main() -> None:
    credential = AzureCliCredential()
    print(f"Query: {SAMPLE_QUERY}\n")

    print("=== Construction #1: SequentialBuilder (the shortcut) ===")
    workflow = build_workflow_sequential(credential)
    events = await workflow.run(SAMPLE_QUERY)
    verdict = extract_verdict(events.get_outputs()[0])
    print(f"approved={verdict.approved}")
    if not verdict.approved:
        print(f"feedback: {verdict.feedback}")
        print(
            "No way to act on that feedback — Sequential cannot loop back "
            "to the Planner. This is the exact limitation Part A's raw "
            "graph also hit; the two fixes below solve it two different "
            "ways.\n"
        )
    else:
        print("(Approved on the first pass — try a different SAMPLE_QUERY to see the limitation live.)\n")

    print("=== Construction #2: custom WorkflowBuilder graph + guardrail ===")
    workflow = build_workflow_custom_graph(credential)
    request = AgentExecutorRequest(messages=[Message(role="user", contents=[SAMPLE_QUERY])], should_respond=True)
    events = await workflow.run(request)
    outputs = events.get_outputs()
    output = outputs[0] if outputs else None
    if isinstance(output, Answer):
        print(f"APPROVED (after revision): {output.summary}\n")
    elif isinstance(output, GuardrailStop):
        print(f"GUARDRAIL TRIPPED after {output.revisions_attempted} revisions — a bounded, graceful stop.\n")
    else:
        print("NO OUTPUT — investigate before trusting this construction.\n")

    print("=== Construction #3: GroupChatBuilder + LLM orchestrator ===")
    workflow = build_workflow_group_chat(credential)
    events = await workflow.run(SAMPLE_QUERY)
    outputs = events.get_outputs()
    if outputs:
        verdict = extract_verdict(outputs[-1])
        if verdict.approved:
            print(f"APPROVED (after revision): {verdict.answer.summary}\n")
        else:
            print(
                f"NOT APPROVED — feedback: {verdict.feedback}\n"
                "Either a genuinely hard question, or MAX_GROUP_CHAT_MESSAGES "
                "was hit — the same bounded, graceful-stop concept as "
                "construction #2's guardrail, just expressed through "
                "termination_condition instead of a distinct GuardrailStop "
                "type.\n"
            )
    else:
        print("NO OUTPUT — investigate before trusting this construction.\n")

    print(
        "All three built the SAME three roles differently. Part C runs "
        "the full 15-question golden set against all three and reports "
        "which approach actually performs best — this file only showed "
        "you one question, one time each."
    )


if __name__ == "__main__":
    asyncio.run(main())
