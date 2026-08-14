"""
Day 2 Lab — your function tools.

You'll author two tools here in Part B:

    create_ticket(title, body, priority) -> str
        Create a support ticket. Backed by mock_backend.BACKEND.create(...).

    lookup_status(ticket_id) -> str
        Look up the status of an existing ticket. Backed by
        mock_backend.BACKEND.get_status(...).

Both are Module 6 patterns. Start simple (bare function) and progress:

    Step 1: Get the tools working as bare functions with type hints and docstrings.
    Step 2: Add Pydantic Field descriptions to the parameters.
    Step 3: Switch to @tool decorator + explicit schema (Pattern 3 in Module 6).
    Step 4: Add error handling — decide per tool: raise, return string, return dict.

Test each tool in isolation FIRST (see tests/test_tools.py), then wire it into
the agent in part_b_wire_tools.py.

--------------------------------------------------------------------------
Definition of done for Part B:
  - Both tools authored with @tool decorator and Pydantic-backed schemas
  - test_tools.py passes (isolation tests)
  - test_golden_set.py passes 6/6 on tools_golden_set.jsonl
--------------------------------------------------------------------------
"""
from __future__ import annotations

from typing import Annotated, Literal
from pydantic import BaseModel, Field

from agent_framework import tool  # noqa: F401  # you'll uncomment when you use @tool

from mock_backend import BACKEND


# ---------------------------------------------------------------------------
# Part B, Step 1 — Author create_ticket
#
# Reference: slides/day2/module-6-authoring-tools.md, "Pattern 3 — Explicit
# schemas". You want a Pydantic input model with a Literal-typed priority so
# the model can't invent priorities.
#
# TODO: replace the raise below with your implementation.
# ---------------------------------------------------------------------------

class CreateTicketInput(BaseModel):
    """Input schema for creating a support ticket."""
    title: Annotated[str, Field(description="Short ticket title")]
    body: Annotated[str, Field(description="Full description of the problem")]
    priority: Annotated[
        Literal["low", "med", "high"],
        Field(description="Ticket priority"),
    ] = "med"

@tool(
    name="create_ticket",
    description="Create a support ticket for a problem that needs a human engineer. "
                "Use when the user reports a problem you cannot answer from documentation. "
                "Do NOT use for general product questions.",
    schema=CreateTicketInput,
    approval_mode="never_require",  # switch to always_require to see gating
)
def create_ticket(title: str, body: str, priority: Literal["low", "med", "high"] = "med") -> str:
    """Create a support ticket for a problem that needs a human engineer.

    Call this when the user reports an unresolved technical or account-specific
    problem that requires investigation or action by a human engineer. Do not
    call it for general product questions, documentation lookups, or issues that
    can be resolved directly. Returns a confirmation containing the new ticket ID.
    """
    if priority not in {"low", "med", "high"}:
            raise ValueError(f"Invalid priority: {priority!r}")

    ticket_id = BACKEND.create(title=title, body=body, priority=priority)
    return f"Created ticket {ticket_id}"


# ---------------------------------------------------------------------------
# Part B, Step 2 — Author lookup_status
#
# Reference: Module 6 "Async is a first-class citizen" — make this async
# and use it as a chance to practice the async tool pattern.
# ---------------------------------------------------------------------------

async def lookup_status(ticket_id: str) -> str:
    """Look up the status of an existing support ticket by ID.

    TODO — write a proper four-part docstring.
    """
    status = BACKEND.get_status(ticket_id=ticket_id)
    return status


# ---------------------------------------------------------------------------
# What "done" looks like — a working create_ticket looks something like:
#
#     @tool(
#         name="create_ticket",
#         description="Create a support ticket for a problem that needs a human engineer. "
#                     "Use when the user reports a problem you cannot answer from documentation. "
#                     "Do NOT use for general product questions.",
#         schema=CreateTicketInput,
#         approval_mode="never_require",  # switch to always_require to see gating
#     )
#     def create_ticket(title: str, body: str, priority: str = "med") -> str:
#         """..."""
#         ticket_id = BACKEND.create(title=title, body=body, priority=priority)
#         return f"Created ticket {ticket_id}"
#
# Refer to Module 6 patterns 1-4 for the full authoring style.
# ---------------------------------------------------------------------------
