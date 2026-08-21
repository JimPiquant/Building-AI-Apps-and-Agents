"""
Golden-set runner — validates which tool the agent picks for each query.

Reads a JSONL file with:
    {"query": "...", "expected_tool": "create_ticket" | "lookup_status" | null,
     "expected_args": {...}}

For each row, runs the agent, inspects the trace, and checks:
  - Which tool (or none) was called
  - What args the model chose (subset match)

Run with:
    cd labs/day2/python
    uv run pytest tests/test_golden_set.py -v

You'll iterate this loop several times during Part B. Each time an entry
fails, tighten either:
  - The tool description
  - The knowledge source description
  - The agent instructions
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

# Make the project root importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from part_b_wire_tools import build_agent_with_tools  # noqa: E402

GOLDEN_SET_PATH = Path(__file__).resolve().parents[1] / "evals" / "tools_golden_set.jsonl"


def _load_golden_set() -> list[dict]:
    if not GOLDEN_SET_PATH.exists():
        return []
    rows = []
    with GOLDEN_SET_PATH.open() as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("//"):
                continue
            rows.append(json.loads(line))
    return rows


def _tool_calls_from_trace(response) -> list[dict]:
    """Extract function calls from the MAF agent response trace."""
    calls = []
    for message in getattr(response, "messages", []) or []:
        for content in getattr(message, "contents", []) or []:
            if getattr(content, "type", None) != "function_call":
                continue
            arguments = getattr(content, "arguments", None) or {}
            if isinstance(arguments, str):
                arguments = json.loads(arguments)
            calls.append({
                "name": getattr(content, "name", None),
                "args": arguments,
            })
    return calls


@pytest.mark.asyncio
@pytest.mark.parametrize("row", _load_golden_set())
async def test_tool_selection(row: dict) -> None:
    agent = build_agent_with_tools()
    response = await agent.run(row["query"])
    calls = _tool_calls_from_trace(response)

    if row["expected_tool"] is None:
        assert calls == [], (
            f"Expected NO tool call for query {row['query']!r}, but got {calls}"
        )
    else:
        assert any(c["name"] == row["expected_tool"] for c in calls), (
            f"Expected tool {row['expected_tool']!r} for query {row['query']!r}, "
            f"but got {calls}"
        )

        expected_args = row.get("expected_args") or {}
        if expected_args:
            matching = [c for c in calls if c["name"] == row["expected_tool"]]
            args = matching[0]["args"] if matching else {}
            for k, v in expected_args.items():
                assert args.get(k) == v, (
                    f"Expected arg {k}={v!r} for {row['expected_tool']}, "
                    f"got {args.get(k)!r}. Full call: {matching[0]}"
                )
