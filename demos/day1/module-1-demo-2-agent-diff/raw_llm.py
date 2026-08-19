import asyncio

from agent_framework.foundry import FoundryChatClient
from agent_framework import Message
from azure.identity import AzureCliCredential
from dotenv import load_dotenv
load_dotenv()

"""
    Left pane of the "What an agent adds" live diff demo.

    Raw model call — no MAF Agent, no tools, no session.
    Two sequential requests to the same model, each stateless.

    Steps to run:

        cd module-1-demo-2-agent-diff
        uv sync
        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        export FOUNDRY_MODEL=gpt-5.6-luna
        uv run raw_llm.py

    Expected output:
        Turn 1: model hedges — no access to real-time information
        Turn 2: model has no memory of Turn 1
"""


async def main():
    client = FoundryChatClient(credential=AzureCliCredential())

    r1 = await client.get_response(
        messages=[
            Message("system", ["You are a friendly assistant. Keep answers brief."]),
            Message("user", ["What time is it right now?"]),
        ],
    )
    print("Turn 1:", r1.text, "\n")

    r2 = await client.get_response(
        messages=[
            Message("system", ["You are a friendly assistant. Keep answers brief."]),
            Message("user", ["What did I just ask you?"]),
        ],
    )
    print("Turn 2:", r2.text)


asyncio.run(main())
