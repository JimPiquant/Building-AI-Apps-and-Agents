import asyncio
import os

from agent_framework import Agent, MCPStdioTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=AzureCliCredential(),
        )
        agent = Agent(client=client, instructions="You are a helpful assistant.")

        query = (
            "Use the calculator tool to compute 47 times 89, plus 12. "
            "Do not calculate it yourself."
        )

        async with MCPStdioTool(
            name="calculator",
            command="uvx",
            args=["mcp-server-calculator"],
        ) as mcp:
            result = await agent.run(
                query,
                tools=mcp,
            )
            print(result)


asyncio.run(main())
