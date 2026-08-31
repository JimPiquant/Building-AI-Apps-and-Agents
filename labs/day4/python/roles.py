"""
Day 4 Lab — shared Planner/Retriever/Critic roles (used by Parts A, B, and C).

Provided support module — do NOT need to modify this to complete any part,
unless you want to extend it. The same three agents are reused unchanged
across all three parts; only the orchestration mechanism around them
changes (SequentialBuilder in Part A, a custom WorkflowBuilder graph in
Part B, GroupChatBuilder in Part C). Keeping the roles here, shared, is
what makes the Part A -> B -> C eval deltas meaningful instead of noise
from re-authored agents.

Roles (from Module 7's "What you'll build" slide):
    Planner   - decomposes the user's question into sub-questions
    Retriever - grounds each sub-question against the Foundry IQ knowledge
                source (foundry_iq.py), returns citations
    Critic    - checks groundedness, coverage, and safety; emits the final
                structured Answer on pass, feedback for another pass on
                fail (Parts B/C only — Part A's Critic has nowhere to
                send a fail back to, see part_a_sequential.py)

Structured outputs are set via `default_options={"response_format": ...}`
at agent construction time (confirmed API — see
https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs),
not per-call — so whichever orchestration mechanism (SequentialBuilder,
WorkflowBuilder, GroupChatBuilder) invokes these agents internally, each
one's response is already parsed against its own schema. Each downstream
role's instructions read the previous role's structured JSON directly out
of the conversation history — this is Module 4's "structured outputs as
contracts between agents" pattern, and it's why Sequential's default
"full prior conversation" context mode (not chain_only_agent_responses)
is required for these three roles to work together.
"""
from __future__ import annotations

import os

from pydantic import BaseModel

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


class Plan(BaseModel):
    """Planner's structured output — the sub-questions the Retriever should ground."""
    sub_questions: list[str]


class Evidence(BaseModel):
    """One sub-question's grounding, found by the Retriever."""
    sub_question: str
    findings: str
    citations: list[str]


class RetrievalResult(BaseModel):
    """Retriever's structured output — evidence for every sub-question in the Plan."""
    evidence: list[Evidence]


class Answer(BaseModel):
    """The Critic's final structured output on approval — the workflow's terminal contract."""
    summary: str
    bullets: list[str]
    citations: list[str]
    confidence: float


class CriticVerdict(BaseModel):
    """Critic's structured output. `approved=True` carries a populated `answer`;
    `approved=False` carries `feedback` describing what's missing, for
    whichever part can act on it (Parts B/C only)."""
    approved: bool
    feedback: str = ""
    answer: Answer | None = None


def _client(credential: AzureCliCredential) -> FoundryChatClient:
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=credential,
    )


def build_planner(credential: AzureCliCredential) -> Agent:
    """Decomposes the user's question into sub-questions for the Retriever."""
    return Agent(
        client=_client(credential),
        name="planner",
        instructions=(
            "You are a research planner. Break the user's question into 1-3 "
            "focused sub-questions that, together, fully answer it. Prefer "
            "one sub-question when the question is already narrow."
        ),
        default_options={"response_format": Plan},
    )


def build_retriever(credential: AzureCliCredential, knowledge_tool: MCPStreamableHTTPTool) -> Agent:
    """Grounds each sub-question in the Planner's plan against the Foundry IQ knowledge source."""
    return Agent(
        client=_client(credential),
        name="retriever",
        instructions=(
            "You are a research retriever. The previous assistant message is a "
            "JSON Plan with a sub_questions list. For EACH sub-question, use the "
            "documentation knowledge source to find grounding, then report your "
            "findings and the exact citations the tool returned. If the "
            "knowledge source has nothing relevant for a sub-question, say so "
            "plainly in that sub-question's findings and leave its citations "
            "empty — do not guess."
        ),
        tools=[knowledge_tool],
        default_options={"response_format": RetrievalResult},
    )


def build_critic(credential: AzureCliCredential) -> Agent:
    """Checks groundedness/coverage/safety; emits Answer on pass, feedback on fail."""
    return Agent(
        client=_client(credential),
        name="critic",
        instructions=(
            "You are a research critic. The previous assistant message is a JSON "
            "RetrievalResult with evidence for each sub-question. Check three "
            "things: (1) groundedness — does every claim trace to a citation, "
            "not an unsupported guess; (2) coverage — does the evidence actually "
            "answer the user's original question; (3) safety — no unsafe or "
            "out-of-scope content. If all three pass, set approved=true and "
            "fill in answer with a concise summary, supporting bullets, the "
            "citations actually used, and your confidence (0-1). If any check "
            "fails, set approved=false, leave answer empty, and put specific, "
            "actionable feedback in feedback describing exactly what's missing "
            "or wrong."
        ),
        default_options={"response_format": CriticVerdict},
    )
