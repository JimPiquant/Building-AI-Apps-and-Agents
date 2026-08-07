"""
Isolation tests for your Part B tools.

Run with:
    cd labs/day2/python
    uv run pytest ../tests/test_tools.py -v

These tests import your functions directly and call them WITHOUT an agent —
the fastest possible feedback loop for tool authoring.

The first two tests are wired up. The rest are TODOs you fill in as you
progress through Part B.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Make labs/day2/python importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "python"))

import pytest
from pydantic import ValidationError

from tools import create_ticket, lookup_status  # noqa: E402
from mock_backend import BACKEND  # noqa: E402


# ---------------------------------------------------------------------------
# create_ticket — isolation tests
# ---------------------------------------------------------------------------

def test_create_ticket_returns_string_containing_id():
    """Happy path — a valid create_ticket call returns a message with an ID."""
    result = create_ticket(
        title="Login fails",
        body="500 on POST /login",
        priority="high",
    )
    assert isinstance(result, str)
    assert "Created ticket" in result


def test_create_ticket_persists_in_backend():
    """Side-effect check — the ticket should be readable from the backend."""
    result = create_ticket(
        title="Webhook 401s",
        body="Suddenly seeing 401s from our webhook receiver",
        priority="med",
    )
    # Extract ticket id from "Created ticket XXXXX"
    ticket_id = result.split()[-1]
    ticket = BACKEND.get_ticket(ticket_id)
    assert ticket.title == "Webhook 401s"
    assert ticket.priority == "med"


# ---------------------------------------------------------------------------
# TODO — add these tests as you progress through Part B, Step 3.
# When you switch create_ticket to use @tool(schema=CreateTicketInput) with
# priority: Literal["low", "med", "high"], the second test below will pass
# WITHOUT you writing any validation logic — Pydantic does it for you.
# ---------------------------------------------------------------------------

@pytest.mark.skip(reason="Enable when you add Pydantic schema in tools.py")
def test_create_ticket_rejects_invalid_priority():
    with pytest.raises((ValidationError, ValueError)):
        create_ticket(title="X", body="Y", priority="urgent")  # not a valid enum value


# ---------------------------------------------------------------------------
# lookup_status — isolation tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_lookup_status_returns_string_for_seeded_ticket():
    result = await lookup_status("12345")
    assert isinstance(result, str)
    assert "12345" in result or "in_progress" in result


@pytest.mark.asyncio
async def test_lookup_status_handles_missing_ticket():
    """
    Design decision: how does your tool signal 'not found'?
    Pick ONE of these and assert the shape:
      - Returns an error string  → assert "not found" in result.lower()
      - Returns a dict/JSON      → assert '"error"' in result
      - Raises KeyError          → wrap with pytest.raises(KeyError)
    Update the assertion below to match your choice.
    """
    # TODO — decide error contract per Module 6 slide "Error contracts"
    result = await lookup_status("00000")
    assert "not found" in result.lower() or "error" in result.lower()
