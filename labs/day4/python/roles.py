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
    Planner  - decomposes the user's question into sub-questions
    Retriever - grounds against the Foundry IQ knowledge source, returns citations
    Critic   - checks groundedness, coverage, and safety; emits the final
               structured Answer on pass, requests another pass on fail
               (Parts B/C only - Part A's Critic has nowhere to send a
               fail back to)

--------------------------------------------------------------------------
TODO: implement the Answer model and the three build_*() factories below,
following Module 4's memory-contracts framing (structured outputs as
contracts between agents) and Module 7's role descriptions.
--------------------------------------------------------------------------
"""
from __future__ import annotations

import os

from pydantic import BaseModel

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


class Answer(BaseModel):
    """The Critic's final structured output — the workflow's terminal contract."""
    summary: str
    bullets: list[str]
    citations: list[str]
    confidence: float


def _client() -> FoundryChatClient:
    return FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )


def build_planner() -> Agent:
    """Decomposes the user's question into sub-questions for the Retriever."""
    raise NotImplementedError("Build the Planner agent here.")


def build_retriever() -> Agent:
    """Grounds each sub-question against the Foundry IQ knowledge source, returns citations."""
    raise NotImplementedError("Build the Retriever agent here.")


def build_critic() -> Agent:
    """Checks groundedness/coverage/safety; emits Answer on pass, requests another pass on fail."""
    raise NotImplementedError("Build the Critic agent here.")
