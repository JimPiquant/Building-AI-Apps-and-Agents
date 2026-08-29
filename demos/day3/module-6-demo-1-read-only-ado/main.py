import asyncio
import os

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    org = os.environ["AZURE_DEVOPS_ORG"]
    work_item_id = os.environ["AZURE_DEVOPS_WORK_ITEM_ID"]

    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(client=client, instructions="You are a helpful Azure DevOps assistant.")

        async with MCPStreamableHTTPTool(
            name="ado",
            url=f"https://mcp.dev.azure.com/{org}",
            headers={"X-MCP-Toolsets": "wit", "X-MCP-Readonly": "true"},
        ) as mcp:
            print("--- Read: should succeed ---")
            read_result = await agent.run(
                f"Get work item {work_item_id} and summarize its title and state.",
                tools=mcp,
            )
            print(read_result, "\n")

            print("--- Write attempt: should be rejected server-side ---")
            write_result = await agent.run(
                f"Update work item {work_item_id}: add a comment saying 'reviewed'.",
                tools=mcp,
            )
            print(write_result)


asyncio.run(main())
