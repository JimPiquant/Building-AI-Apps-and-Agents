"""Readable console tracing for Agent Framework workflow steps."""

from __future__ import annotations

import json
from typing import Any

from agent_framework import AgentExecutorResponse, AgentResponse, Message


def _trace_items(value: Any) -> list[tuple[str | None, str]]:
    if isinstance(value, AgentExecutorResponse):
        return [(value.executor_id, value.agent_response.text)]
    if isinstance(value, AgentResponse):
        return [(value.agent_id, value.text)]
    if isinstance(value, Message):
        source = value.author_name or value.role
        return [(source, value.text)]
    if isinstance(value, (list, tuple)):
        return [item for nested in value for item in _trace_items(nested)]
    return [(None, str(value))]


def _pretty_text(text: str) -> str:
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text
    return json.dumps(parsed, indent=2)


def _print_trace_data(value: Any) -> None:
    seen: set[str] = set()
    for source, text in _trace_items(value):
        if text in seen:
            continue
        seen.add(text)
        if source:
            print(f"  from: {source}")
        for line in _pretty_text(text).splitlines() or [""]:
            print(f"  {line}")


def print_step_io(events: Any) -> None:
    """Print each executor's input and output from workflow lifecycle events."""
    for event in events:
        if event.type == "executor_invoked":
            print(f"\n[{event.executor_id}] INPUT")
            _print_trace_data(event.data)
        elif event.type == "executor_completed":
            print(f"[{event.executor_id}] OUTPUT")
            _print_trace_data(event.data)