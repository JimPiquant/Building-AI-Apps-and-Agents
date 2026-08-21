"""Shared Foundry IQ MCP integration for the Day 2 agents.

Consumes a Foundry IQ knowledge base you already created in the Foundry
portal. See labs/day2/README.md#prerequisites-portal-setup-one-time-15-min
for how the knowledge base gets provisioned (portal-first: create a storage
account + blob container, upload the docs, create the knowledge base in the
Foundry portal, grant Storage Blob Data Reader to the Search MI and
Search Index Data Reader to the Foundry project MI).

The MCP URL shape below is stable across authoring paths — SDK-provisioned,
portal-provisioned, or IaC-provisioned knowledge bases all expose the same
retrieve endpoint.
"""

import os
from collections.abc import Mapping
from typing import Any
from urllib.parse import quote

from agent_framework import MCPStreamableHTTPTool
from azure.identity import AzureCliCredential, get_bearer_token_provider


def create_knowledge_base_tool(credential: AzureCliCredential) -> MCPStreamableHTTPTool:
    search_endpoint = os.environ["AZURE_SEARCH_ENDPOINT"].rstrip("/")
    knowledge_base_name = os.environ["FOUNDRY_IQ_KNOWLEDGE_NAME"]
    token_provider = get_bearer_token_provider(
        credential,
        "https://search.azure.com/.default",
    )

    def provide_headers(_: Mapping[str, Any]) -> dict[str, str]:
        return {"Authorization": f"Bearer {token_provider()}"}

    return MCPStreamableHTTPTool(
        name="contoso-documentation",
        description=(
            "General Contoso developer API product documentation. "
            "Does not contain account-specific state."
        ),
        url=(
            f"{search_endpoint}/knowledgebases/{quote(knowledge_base_name, safe='')}/mcp"
            "?api-version=2026-05-01-preview"
        ),
        allowed_tools=["knowledge_base_retrieve"],
        include_detailed_errors=True,
        approval_mode="never_require",
        request_timeout=60,
        header_provider=provide_headers,
    )