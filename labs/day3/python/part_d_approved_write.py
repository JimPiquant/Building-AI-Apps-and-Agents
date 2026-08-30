"""
Day 3 Lab — Part D — Approved write.

You'll build this in Part D:

    - Connect to your Azure DevOps organization with the write-enabled MCP
      tool (see ado_mcp.py) — allow wit_work_item_write, action="create"
      or "update".
    - Require explicit approval before the write executes: show the exact
      arguments to a human (e.g. via approval_mode, Module 5's tool
      approval pattern) before the mutation runs.
    - After the write is approved and executes, read the work item again
      (Part C's read path) to verify the mutation actually took effect.

--------------------------------------------------------------------------
Definition of done for Part D (from Module 9's "Definition of done and
guardrails" slide):
  - Write requires approval; the read-after-write verifies the mutation;
    dedicated project only (never point this at a shared/production ADO org)
--------------------------------------------------------------------------

TODO: implement build_agent() and main() below, following Module 5's tool
approval slides and demos/day3/module-5-demo-2-approval-mode/main.py as
reference code. ado_mcp.build_write_enabled_ado_mcp() provides the MCP tool.
"""
from __future__ import annotations

import asyncio

from ado_mcp import build_write_enabled_ado_mcp  # noqa: F401  # use when you build the agent


async def main() -> None:
    raise NotImplementedError("Part D: connect the write-enabled ADO MCP tool, require approval, then verify.")


if __name__ == "__main__":
    asyncio.run(main())
