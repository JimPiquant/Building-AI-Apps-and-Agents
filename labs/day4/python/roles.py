"""
Day 4 Lab — shared Planner/Retriever/Critic roles (used by Parts A, B, and C).

Provided support module — do NOT need to modify this to complete any part,
unless you want to extend it. The same three agents are reused unchanged
across every part; only what runs them changes:
  Part A - a raw WorkflowBuilder graph, straight-line, no loop (workflow
           basics: executors, edges, output_from)
  Part B - three different orchestration constructions of the SAME graph
           (SequentialBuilder, a custom WorkflowBuilder graph with a
           revision loop + guardrail, GroupChatBuilder)
  Part C - no new construction; evaluates all of Part B's workflows
           against the same golden set
Keeping the roles here, shared, is what makes the eval deltas in Part C
meaningful instead of noise from re-authored agents.

Roles (from Module 7's "What you'll build" slide):
    Planner   - decomposes the user's question into sub-questions
    Retriever - grounds each sub-question against the bundled local docs
                (data/docs/*.md, copied from Day 2's docs assistant docs)
                via the search_docs tool below, returns citations
    Critic    - checks groundedness, coverage, and safety; emits the final
                structured Answer on pass, feedback for another pass on
                fail (only meaningful for Part B's custom-graph and
                Group Chat constructions — Part A's straight-line graph
                has nowhere to send a fail back to, see
                part_a_workflow_basics.py)

On search_docs, deliberately NOT Foundry IQ: an earlier draft of this lab
had the Retriever call a live Foundry IQ knowledge base (Day 2's Azure AI
Search + knowledge base MCP endpoint). That makes Day 4 depend on a
per-attendee Azure resource surviving intact since Day 2 — if someone
deleted it, or never finished provisioning it, the lab breaks on line 1
for reasons that have nothing to do with what Day 4 teaches. search_docs
is a plain local Python function (no network call, no MCP, no Azure
resource) searching the bundled copy of Day 2's own docs in data/docs/ —
the only dependency is the repo checkout itself.

Structured outputs are set via `default_options={"response_format": ...}`
at agent construction time (confirmed API — see
https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs),
not per-call — so whichever orchestration mechanism (raw WorkflowBuilder,
SequentialBuilder, GroupChatBuilder) invokes these agents internally, each
one's response is already parsed against its own schema. Each downstream
role's instructions read the previous role's structured JSON directly out
of the conversation history — this is Module 4's "structured outputs as
contracts between agents" pattern, and it's why the full prior
conversation (not just the immediately preceding message) needs to reach
each agent for these three roles to work together.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Annotated

from pydantic import BaseModel, Field

from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

DOCS_DIR = Path(__file__).resolve().parent / "data" / "docs"
GOLDEN_SET_PATH = Path(__file__).resolve().parent / "evals" / "golden_set.jsonl"


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
    whichever construction can act on it (Part B's custom-graph and Group
    Chat constructions only — Part A and Part B's Sequential construction
    have nowhere to send a rejected verdict back to)."""
    approved: bool
    feedback: str = ""
    answer: Answer | None = None


def build_client(credential: AzureCliCredential) -> FoundryChatClient:
    """Public so Part B can build its own orchestrator agent (not one of
    the three core roles) sharing the same credential as everything else."""
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=credential,
    )


@tool
def search_docs(
    keyword: Annotated[
        str,
        Field(description="A keyword or short phrase to search for in the bundled Contoso developer docs."),
    ],
) -> str:
    """Search the bundled Contoso developer API docs (data/docs/*.md) for a
    keyword. Returns the full text of every doc file that contains a
    case-insensitive match to the keyword, each prefixed with its filename
    so it can be cited, or a plain "no matches" message if nothing is
    found. Local, in-process, and offline — no network call, no MCP, no
    Azure resource."""
    needles = keyword.lower().split()

    matches = []
    for path in sorted(DOCS_DIR.glob("*.md")):
        text = path.read_text()
        if any(needle in text.lower() for needle in needles):
            matches.append(f"--- {path.name} ---\n{text}")
    if not matches:
        return f"No docs matched '{keyword}'."
    return "\n\n".join(matches)


def build_planner(credential: AzureCliCredential) -> Agent:
    """Decomposes the user's question into sub-questions for the Retriever."""
    return Agent(
        client=build_client(credential),
        name="planner",
        instructions=(
            "You are a research planner. Break the user's question into 1-3 "
            "focused sub-questions that, together, fully answer it. Prefer "
            "one sub-question when the question is already narrow."
        ),
        default_options={"response_format": Plan},
    )


def build_retriever(credential: AzureCliCredential) -> Agent:
    """Grounds each sub-question in the Planner's plan against the bundled local docs."""
    return Agent(
        client=build_client(credential),
        name="retriever",
        instructions=(
            "You are a research retriever. The previous assistant message is a "
            "JSON Plan with a sub_questions list. For EACH sub-question, call "
            "search_docs with a relevant keyword to find grounding, then report "
            "your findings and the exact filenames the tool returned as "
            "citations. If search_docs has nothing relevant for a "
            "sub-question, say so plainly in that sub-question's findings and "
            "leave its citations empty — do not guess."
        ),
        tools=[search_docs],
        default_options={"response_format": RetrievalResult},
    )


def build_critic(credential: AzureCliCredential) -> Agent:
    """Checks groundedness/coverage/safety; emits Answer on pass, feedback on fail."""
    return Agent(
        client=build_client(credential),
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


def load_golden_set() -> list[dict]:
    """Parse the shared JSONL golden set (evals/golden_set.jsonl), skipping
    blank lines and // comments. Part C's dedicated job — it runs all
    three of Part B's constructions against the exact same 15 questions
    so the comparison means something. Parts A and B's own demos each use
    one hand-picked question instead, not this full set."""
    rows: list[dict] = []
    for line in GOLDEN_SET_PATH.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        rows.append(json.loads(stripped))
    return rows


def extract_verdict(final) -> CriticVerdict:
    """Extract a CriticVerdict from a plain AgentResponse-shaped workflow
    output. Used wherever the Critic is a plain Agent (or an AgentExecutor
    with no custom finalize wrapper) rather than unwrapped by a custom
    executor — Part A's straight-line graph, and constructions #1
    (Sequential) and #3 (Group Chat) in Part B. Tries `.value` first (the
    parsed structured output — confirmed for both a direct `agent.run()`
    call and a plain AgentExecutor's designated workflow output); falls
    back to parsing the last message's text as JSON if `.value` isn't
    already a CriticVerdict.

    Grounding note — this inference isn't directly confirmed by a single
    fetched sample that combines default_options={"response_format": ...}
    with a workflow's designated output, but AgentResponse is the same
    class in both the single-agent and workflow-output cases, and
    default_options is a property of the Agent instance itself — so it
    should apply regardless of who's calling .run() internally. The
    fallback covers this being wrong."""
    if isinstance(final.value, CriticVerdict):
        return final.value
    return CriticVerdict.model_validate_json(final.messages[-1].text)
