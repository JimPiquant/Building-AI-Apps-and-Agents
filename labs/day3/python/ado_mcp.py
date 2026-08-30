"""
Day 3 Lab — Azure DevOps MCP client (shared by Part C and Part D).

Provided support module — you should not need to modify this to complete
Part C or Part D, unless you want to extend it. Wraps
MCPStreamableHTTPTool pointed at your own Azure DevOps organization,
following the authenticated remote MCP pattern in
demos/day3/module-6-demo-1-read-only-ado/main.py: a separate
InteractiveBrowserCredential (not the AzureCliCredential your
FoundryChatClient uses) fetches a bearer token for the ADO MCP endpoint's
own scope, and header_provider attaches it plus Module 6's
X-MCP-Toolsets/X-MCP-Readonly headers to every MCP request.

Environment variables (see labs/day3/.env.example):
    AZURE_DEVOPS_ORG          your Entra-backed ADO organization name
    AZURE_DEVOPS_TENANT_ID    the Entra tenant that org is backed by

Both build_*_ado_mcp() functions return an MCPStreamableHTTPTool that must
be entered as an async context manager — see part_c_read_only.py and
part_d_approved_write.py for the usage pattern:

    async with build_read_only_ado_mcp() as mcp:
        result = await agent.run("...", tools=mcp)
"""
from __future__ import annotations

import os
from typing import Any

from agent_framework import MCPStreamableHTTPTool
from azure.identity import InteractiveBrowserCredential, TokenCachePersistenceOptions

_ADO_MCP_SCOPE = "https://mcp.dev.azure.com/.default"


def _get_ado_bearer_token() -> str:
    """Fetch a bearer token for the Azure DevOps MCP endpoint.

    Uses a separate InteractiveBrowserCredential from the AzureCliCredential
    your FoundryChatClient uses — the ADO MCP endpoint and your Foundry
    project are different resources, each with its own Entra sign-in.
    Token cache persistence (TokenCachePersistenceOptions) means you only
    see the browser prompt once across lab runs, not on every invocation.
    """
    tenant_id = os.environ["AZURE_DEVOPS_TENANT_ID"]
    with InteractiveBrowserCredential(
        tenant_id=tenant_id,
        cache_persistence_options=TokenCachePersistenceOptions(name="day3-ado-mcp"),
    ) as credential:
        access_token = credential.get_token(_ADO_MCP_SCOPE)
    return access_token.token


def _build_ado_mcp(
    *, readonly: bool, approval_mode: str | dict[str, list[str]] | None = None
) -> MCPStreamableHTTPTool:
    org = os.environ["AZURE_DEVOPS_ORG"]
    bearer_token = _get_ado_bearer_token()

    kwargs: dict[str, Any] = {
        "name": "ado",
        "url": f"https://mcp.dev.azure.com/{org}",
        "header_provider": lambda _: {
            "Authorization": f"Bearer {bearer_token}",
            "X-MCP-Toolsets": "wit",
            "X-MCP-Readonly": "true" if readonly else "false",
        },
    }
    if approval_mode is not None:
        kwargs["approval_mode"] = approval_mode
    return MCPStreamableHTTPTool(**kwargs)


def build_read_only_ado_mcp() -> MCPStreamableHTTPTool:
    """Part C: read-only Azure DevOps MCP tool (X-MCP-Readonly: true)."""
    return _build_ado_mcp(readonly=True)


def build_write_enabled_ado_mcp(
    approval_mode: str | dict[str, list[str]] | None = None,
) -> MCPStreamableHTTPTool:
    """Part D: write-enabled Azure DevOps MCP tool.

    X-MCP-Readonly is false here so the server will accept a write call.
    approval_mode defaults to the per-tool mapping form the
    MCPStreamableHTTPTool API reference documents (a dict with an
    always_require_approval/never_require_approval key mapping to a list
    of tool names). Both write tools are named: wit_work_item_write covers
    field updates, and wit_work_item_comment_write covers comments. A
    comment is its own tool rather than an action on wit_work_item_write,
    so gating only the latter would let part_d_approved_write.py's comment
    write execute without review. This matches Module 5's "approval_mode
    creates a human boundary" slide's "Per-tool mapping | Read
    automatically; review writes" row. wit_work_item (the verify-read in
    part_d_approved_write.py) is not listed in either key, so it proceeds
    automatically.
    """
    if approval_mode is None:
        approval_mode = {
            "always_require_approval": [
                "wit_work_item_write",
                "wit_work_item_comment_write",
            ]
        }
    return _build_ado_mcp(readonly=False, approval_mode=approval_mode)
