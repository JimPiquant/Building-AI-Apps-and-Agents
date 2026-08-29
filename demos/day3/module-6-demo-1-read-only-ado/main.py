import asyncio
import os

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential, InteractiveBrowserCredential, TokenCachePersistenceOptions


async def main() -> None:
    org = os.environ["AZURE_DEVOPS_ORG"]
    project = os.environ["AZURE_DEVOPS_PROJECT"]
    tenant_id = os.environ["AZURE_DEVOPS_TENANT_ID"]
    work_item_id = os.environ["AZURE_DEVOPS_WORK_ITEM_ID"]

    with (
        AzureCliCredential() as foundry_credential,
        InteractiveBrowserCredential(
            tenant_id=tenant_id,
            cache_persistence_options=TokenCachePersistenceOptions(name="day3-ado-mcp"),
        ) as ado_credential,
    ):
        access_token = ado_credential.get_token("https://mcp.dev.azure.com/.default")

        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=foundry_credential,
        )
        agent = Agent(client=client, instructions="You are a helpful Azure DevOps assistant.")

        async with MCPStreamableHTTPTool(
            name="ado",
            url=f"https://mcp.dev.azure.com/{org}",
            header_provider=lambda _: {
                "Authorization": f"Bearer {access_token.token}",
                "X-MCP-Toolsets": "wit",
                "X-MCP-Readonly": "true",
            },
        ) as mcp:
            print("--- Read: should succeed ---")
            read_result = await agent.run(
                f"Get work item {work_item_id} in project {project} and summarize its title and state.",
                tools=mcp,
            )
            print(read_result, "\n")

            print("--- Write attempt: should be rejected server-side ---")
            write_result = await agent.run(
                f"Update work item {work_item_id} in project {project}: add a comment saying 'reviewed'.",
                tools=mcp,
            )
            print(write_result)


asyncio.run(main())
