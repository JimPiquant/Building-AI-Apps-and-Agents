import asyncio

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

"""
    Actual steps to make this run:

        mkdir scratch
        cd scratch
        uv init --bare      # creates bare pyproject.toml
        touch main.py
        vim main.py         # paste in code from slide
        vim pyproject.toml  # add dependencies to agent-framework and azure-identity and use MS package feed
        uv sync             # install dependencies and creates python vitual environment and generates uv.lock file
        touch .env          # not used because this code doesn't use dotenv, but the labs do
        vim .env
        cat .env
        export FOUNDRY_PROJECT_ENDPOINT=https://jimwelch-test-foundry.services.ai.azure.com/api/projects/proj-default
        export FOUNDRY_MODEL=gpt-5.6-luna
        uv run main.py
"""

async def main():

    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="HelloAgent",
        instructions="You are a friendly assistant. Keep answers brief.",
    )

    result = await agent.run("What is the capital of France?")

    print(result)

asyncio.run(main())
