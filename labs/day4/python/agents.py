"""
Day 4 Lab — the three roles, and the types they exchange.

PROVIDED COMPLETE. Read it before Part A; you will not edit it.

The same Planner, Retriever, and Critic are used unchanged in Part A
(SequentialBuilder), Part B (a custom WorkflowBuilder graph), and Part C
(an alternative orchestration). That is the whole point of the lab: the
roles are a constant, the orchestration is the variable. If you find
yourself editing an agent's instructions to make a part pass, stop -- you
are changing the measuring stick along with the thing being measured, and
the evaluation delta at the end will mean nothing.

WHY THE ROLES ARE PROVIDED
Writing three sets of agent instructions is Day 1 and Day 2 work you have
already done. Day 4's subject is who decides what happens next. You spend
your time on the graph.

THE CONTRACT BETWEEN ROLES
Module 4 makes the point that in a multi-agent system the type passed
between agents IS the interface. These are those types:

    Plan          Planner  -> Retriever
    Findings      Retriever -> Critic
    CriticResult  Critic   -> (end, or back to Planner)

CriticResult is the one that matters for the graph. It always carries an
Answer -- the Critic's best attempt so far -- plus an `approved` flag and a
`reason`. That shape is deliberate:

  * `approved` is what a conditional edge tests, so the routing decision is
    a plain boolean on a typed object, not a string the graph has to parse.
  * `reason` is the feedback the Planner receives on a revision pass. An
    unapproved result with an empty reason gives the next plan nothing to
    work with.
  * carrying an Answer even when unapproved is what lets Part B2's guardrail
    give up gracefully. When the revision cap is hit there is always
    something to return -- a low-confidence answer that names the gap, which
    is a far better outcome than an exception.
"""

from __future__ import annotations

import os
from pathlib import Path

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from retrieval import search_docs

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


# --------------------------------------------------------------------------
# The types the roles exchange
# --------------------------------------------------------------------------


class Plan(BaseModel):
    """Planner -> Retriever."""

    question: str = Field(description="The user's original question, unchanged.")
    steps: list[str] = Field(
        description=(
            "One search phrase per sub-question, in the order they should be "
            "run. Empty when the question needs no retrieval."
        )
    )
    needs_retrieval: bool = Field(
        description="False for general-knowledge questions the corpus cannot improve."
    )
    reasoning: str = Field(description="One sentence on why the question splits this way.")


class Findings(BaseModel):
    """Retriever -> Critic."""

    excerpts: str = Field(description="Relevant text pulled from the corpus.")
    citations: list[str] = Field(
        description="Filenames the excerpts came from, e.g. ['rate-limits.md']."
    )
    gaps: list[str] = Field(
        description="Sub-questions from the plan that the corpus did not answer."
    )


class Answer(BaseModel):
    """The deliverable. Module 4's structured contract."""

    summary: str = Field(description="Two or three sentences answering the question.")
    bullets: list[str] = Field(description="The supporting specifics.")
    citations: list[str] = Field(
        description="Source filenames. Empty list when no retrieval was needed."
    )
    confidence: float = Field(
        ge=0.0, le=1.0, description="0.0-1.0. Below 0.5 means a real gap remains."
    )


class CriticResult(BaseModel):
    """Critic -> end, or back to the Planner.

    `approved` is what Part B's conditional edge tests.
    """

    approved: bool = Field(
        description="True when the answer is complete and every claim is cited."
    )
    reason: str = Field(
        description=(
            "When not approved: what is missing and what the next plan should "
            "search for. This is the only feedback the Planner receives."
        )
    )
    answer: Answer = Field(description="Best answer so far, approved or not.")


# --------------------------------------------------------------------------
# The client
# --------------------------------------------------------------------------


def build_client() -> FoundryChatClient:
    """One chat client, shared by all three roles."""
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )


# --------------------------------------------------------------------------
# Instructions
# --------------------------------------------------------------------------

PLANNER_INSTRUCTIONS = """\
You are the Planner in a documentation research workflow.

Break the user's question into the minimum set of search phrases needed to
answer it completely, then stop. You do not search and you do not answer.

Rules:
- One step per distinct sub-question. A question asking about billing, tier,
  and data is three sub-questions, not one.
- Write each step in the platform's own vocabulary -- "change freeze
  deployment approval", not "can we ship in December". The retriever matches
  on keywords.
- Set needs_retrieval to false ONLY for general knowledge that the platform
  corpus could not improve (for example, what an HTTP status code means in
  general). When false, return no steps.
- If you are given critic feedback from a previous attempt, treat it as the
  priority. Produce a plan that closes the gap it names; do not repeat the
  plan that already failed.
"""

RETRIEVER_INSTRUCTIONS = """\
You are the Retriever in a documentation research workflow.

Run the plan's search steps with the search_docs tool and report what you
find. You do not judge sufficiency and you do not write the final answer.

Rules:
- Call search_docs once per plan step. Use the step text as the query.
- Quote the relevant passages. Do not paraphrase away specifics -- numbers,
  thresholds, and named roles are usually the whole answer.
- Record the filename of every document you drew from, in citations.
- When a search returns NO_MATCH, or returns documents that do not address
  the step, record that step in gaps. Reporting a gap honestly is a correct
  outcome; inventing coverage is not.
- If the plan has no steps, return empty excerpts, empty citations, and no
  gaps.
"""

CRITIC_INSTRUCTIONS = """\
You are the Critic in a documentation research workflow. You have two jobs:
write the answer, and decide whether it is good enough to ship.

Produce a CriticResult every time, containing your best Answer and an
approved flag.

Approve when ALL of these hold:
- Every part of the user's question is addressed.
- Every factual claim traces to a cited document.
- The retriever reported no gaps that matter to the question.

Do NOT approve when:
- A sub-question is unanswered or only partly answered.
- A claim is not supported by the excerpts you were given.
- The retriever reported a gap that changes the answer.

When you do not approve, `reason` must say precisely what is missing and
what the next search should look for. "Incomplete" is useless feedback;
"the approval authority for a freeze exception was not retrieved -- search
on-call approval authority" is useful.

On confidence and honesty:
- Answer the part you can support and say plainly what the documentation
  does not cover. A partially grounded answer that names its gap is correct.
  An answer that fills a gap with something plausible is a failure, however
  complete it looks.
- Set confidence below 0.5 when a real gap remains.
- When the corpus simply does not cover the question, say so in the summary,
  set confidence low, and cite nothing. Do not keep asking for another pass
  in the hope that a document appears -- if two attempts have not found it,
  it is not there.

For a general-knowledge question with no retrieval, answer from your own
knowledge, return an empty citations list, and approve.
"""


# --------------------------------------------------------------------------
# The roles
# --------------------------------------------------------------------------


def build_planner(client: FoundryChatClient | None = None) -> Agent:
    return Agent(
        client=client or build_client(),
        name="Planner",
        instructions=PLANNER_INSTRUCTIONS,
    )


def build_retriever(client: FoundryChatClient | None = None) -> Agent:
    return Agent(
        client=client or build_client(),
        name="Retriever",
        instructions=RETRIEVER_INSTRUCTIONS,
        tools=[search_docs],
    )


def build_critic(client: FoundryChatClient | None = None) -> Agent:
    return Agent(
        client=client or build_client(),
        name="Critic",
        instructions=CRITIC_INSTRUCTIONS,
    )


def build_all() -> tuple[Agent, Agent, Agent]:
    """Planner, Retriever, Critic over one shared client.

    Call this per run, not once at import. Module 3's state-isolation warning
    applies to executors, and the same habit avoids surprises here: fresh
    instances per run means no state leaks between golden-set cases.
    """
    client = build_client()
    return build_planner(client), build_retriever(client), build_critic(client)
