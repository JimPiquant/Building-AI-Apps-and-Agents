"""
Isolation tests for your Part B tools.

Run with:
    cd labs/day2/python
    uv run pytest tests/test_tools.py -v

These tests import your functions directly and call them WITHOUT an agent —
the fastest possible feedback loop for tool authoring.

Three tests are wired up (the two create_ticket happy paths and the
lookup_status success path). The other two are skipped by default —
enable each one as you progress through Part B (see the comment on
each skip marker).
"""
from __future__ import annotations

import sys
from pathlib import Path

# Make the project root importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

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
# When you switch create_ticket to use @tool(schema=CreateTicketInput) with
# priority: Literal["low", "med", "high"], this test will pass WITHOUT you
# writing any validation logic — Pydantic does it for you. Remove the skip
# marker to enable it.
# ---------------------------------------------------------------------------

@pytest.mark.skip(reason="Enable when you add the Pydantic schema in tools.py")
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


@pytest.mark.skip(reason="Enable after you decide your error contract — see docstring")
@pytest.mark.asyncio
async def test_lookup_status_handles_missing_ticket():
    """
    Design decision: how does your tool signal 'not found'?

    Pick ONE of these, replace the `pass` below with the matching body, then
    remove the @pytest.mark.skip decorator above.

      - Returns an error string:
          result = await lookup_status("00000")
          assert "not found" in result.lower()

      - Returns a dict/JSON:
          result = await lookup_status("00000")
          assert '"error"' in result

      - Raises an exception (KeyError, ValueError, or your own):
          with pytest.raises(KeyError):
              await lookup_status("00000")

    Reference: Module 6 slide "Error contracts".
    """
    pass  # replace with the assertion for the contract you chose
