"""
Day 3 Lab — Azure DevOps MCP client (shared by Part C and Part D).

Provided support module — do NOT need to modify this to complete Part C or
Part D, unless you want to extend it. Wraps MCPStreamableHTTPTool pointed at
your own Azure DevOps organization, following Module 5/6's remote MCP
pattern and demos/day3/module-6-demo-1-read-only-ado/main.py.

Environment variables (see labs/day3/.env.example):
    AZURE_DEVOPS_ORG          your Entra-backed ADO organization name
    AZURE_DEVOPS_PROJECT      your dedicated workshop project within it
    AZURE_DEVOPS_WORK_ITEM_ID a known work item ID to read/write against

--------------------------------------------------------------------------
TODO: implement build_read_only_ado_mcp() and build_write_enabled_ado_mcp()
below, following Module 6's header pattern:
    X-MCP-Toolsets: wit
    X-MCP-Readonly: true   (Part C only — omit or set false for Part D)
--------------------------------------------------------------------------
"""
from __future__ import annotations

import os

from agent_framework import MCPStreamableHTTPTool


def build_read_only_ado_mcp() -> MCPStreamableHTTPTool:
    """Part C: read-only Azure DevOps MCP tool (X-MCP-Readonly: true)."""
    raise NotImplementedError("Build the read-only MCPStreamableHTTPTool here.")


def build_write_enabled_ado_mcp() -> MCPStreamableHTTPTool:
    """Part D: write-enabled Azure DevOps MCP tool (approval required)."""
    raise NotImplementedError("Build the write-enabled MCPStreamableHTTPTool here.")
