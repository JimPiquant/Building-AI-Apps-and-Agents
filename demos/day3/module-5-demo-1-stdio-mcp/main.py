import asyncio
import os

from agent_framework import Agent, MCPStdioTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(client=client, instructions="You are a helpful assistant.")

        async with MCPStdioTool(
            name="calculator",
            command="uvx",
            args=["mcp-server-calculator"],
        ) as mcp:
            result = await agent.run(
                "What is 47 times 89, plus 12?",
                tools=mcp,
            )
            print(result)


asyncio.run(main())
