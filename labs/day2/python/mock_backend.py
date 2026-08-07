"""
Mock backend — in-memory ticket store.

Provided as-is. Do NOT modify — the golden-set evals depend on the seeded
ticket IDs and the deterministic responses.

Your `tools.py` calls into this module. This is the layer that Day 3 will
replace with a real Azure DevOps MCP server — the tool interface stays the
same, only the backend changes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal

Priority = Literal["low", "med", "high"]
TicketStatus = Literal["open", "in_progress", "waiting_on_customer", "resolved", "closed"]


@dataclass
class Ticket:
    id: str
    title: str
    body: str
    priority: Priority
    status: TicketStatus
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# Seed tickets — the golden-set evals refer to these IDs by number.
# Do not renumber; the golden set uses 12345 and 12346.
_SEEDED: dict[str, Ticket] = {
    "12345": Ticket(
        id="12345",
        title="Rate limit increase request",
        body="Enterprise customer requesting 50k rpm burst",
        priority="med",
        status="in_progress",
    ),
    "12346": Ticket(
        id="12346",
        title="Webhook delivery failures",
        body="Customer reports 20% of webhooks not delivered",
        priority="high",
        status="waiting_on_customer",
    ),
}


class MockTicketBackend:
    """In-memory ticket store. New instances start from the seeded snapshot."""

    def __init__(self) -> None:
        self._tickets: dict[str, Ticket] = {tid: t for tid, t in _SEEDED.items()}
        self._next_id = 20000

    def create(self, title: str, body: str, priority: Priority) -> str:
        ticket_id = str(self._next_id)
        self._next_id += 1
        self._tickets[ticket_id] = Ticket(
            id=ticket_id, title=title, body=body, priority=priority, status="open"
        )
        return ticket_id

    def get_status(self, ticket_id: str) -> TicketStatus:
        if ticket_id not in self._tickets:
            raise KeyError(f"Ticket {ticket_id} not found")
        return self._tickets[ticket_id].status

    def get_ticket(self, ticket_id: str) -> Ticket:
        if ticket_id not in self._tickets:
            raise KeyError(f"Ticket {ticket_id} not found")
        return self._tickets[ticket_id]


# Module-level singleton — tools import this.
BACKEND = MockTicketBackend()
