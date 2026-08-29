import asyncio
import os

from agent_framework import Agent, MCPStdioTool, Message
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
        credential=AzureCliCredential(),
    )
    agent = Agent(client=client, instructions="You are a helpful assistant.")

    async with MCPStdioTool(
        name="calculator",
        command="uvx",
        args=["mcp-server-calculator"],
        approval_mode="always_require",
    ) as mcp:
        query = (
            "Use the calculator tool to compute 47 times 89, plus 12. "
            "Do not calculate it yourself."
        )
        result = await agent.run(query, tools=mcp)

        while result.user_input_requests:
            new_inputs = [query]
            for request in result.user_input_requests:
                if request.function_call is None:
                    continue
                print(f"\nApproval requested for: {request.function_call.name}")
                print(f"Arguments: {request.function_call.arguments}")
                approval = input("Approve? (y/n): ")
                new_inputs.append(Message("assistant", [request])) # type: ignore
                new_inputs.append(
                    Message("user", [request.to_function_approval_response(approval.lower() == "y")]) # type: ignore
                )
            result = await agent.run(new_inputs, tools=mcp)

        print("\nFinal:", result)


asyncio.run(main())
