"""
Day 3 Lab — Part C — Read-only Azure DevOps MCP.

You'll build this in Part C:

    - Connect to your Azure DevOps organization over MCPStreamableHTTPTool
      with X-MCP-Toolsets: wit and X-MCP-Readonly: true (see ado_mcp.py).
    - Call wit_work_item with action="get" (or "my") against the known work
      item ID from your .env.
    - Verify the result against the workshop project — confirm the returned
      title/state matches what's actually in Azure DevOps.

--------------------------------------------------------------------------
Definition of done for Part C (from Module 9's "Definition of done and
guardrails" slide):
  - Read succeeds; the read-only header is proven to hold; dedicated
    project only (never point this at a shared/production ADO org)
--------------------------------------------------------------------------

TODO: implement build_agent() and main() below, following Module 5/6's
slides and demos/day3/module-6-demo-1-read-only-ado/main.py as reference
code. ado_mcp.build_read_only_ado_mcp() provides the MCP tool.
"""
from __future__ import annotations

import asyncio

from ado_mcp import build_read_only_ado_mcp  # noqa: F401  # use when you build the agent


async def main() -> None:
    raise NotImplementedError("Part C: connect the read-only ADO MCP tool and run a read query.")


if __name__ == "__main__":
    asyncio.run(main())
