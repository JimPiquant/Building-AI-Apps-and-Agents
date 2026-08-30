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


def _build_ado_mcp(*, readonly: bool) -> MCPStreamableHTTPTool:
    org = os.environ["AZURE_DEVOPS_ORG"]
    bearer_token = _get_ado_bearer_token()

    return MCPStreamableHTTPTool(
        name="ado",
        url=f"https://mcp.dev.azure.com/{org}",
        header_provider=lambda _: {
            "Authorization": f"Bearer {bearer_token}",
            "X-MCP-Toolsets": "wit",
            "X-MCP-Readonly": "true" if readonly else "false",
        },
    )


def build_read_only_ado_mcp() -> MCPStreamableHTTPTool:
    """Part C: read-only Azure DevOps MCP tool (X-MCP-Readonly: true)."""
    return _build_ado_mcp(readonly=True)


def build_write_enabled_ado_mcp() -> MCPStreamableHTTPTool:
    """Part D: write-enabled Azure DevOps MCP tool.

    X-MCP-Readonly is false here so the server will accept a write call —
    Part D's own approval gate is what should stop an unapproved write
    from ever reaching this tool, not this header.
    """
    return _build_ado_mcp(readonly=False)
