# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "agent-framework-foundry",
#     "opentelemetry-exporter-otlp-proto-grpc",
#     "python-dotenv",
# ]
# ///
# Run with any PEP 723 compatible runner, e.g.:
#   uv run demos/day5/assets/module-2-demo/foundry_tracing_toolkit.py

# Copyright (c) Microsoft. All rights reserved.

import asyncio
import os
from random import randint
from typing import Annotated

from agent_framework import Agent, tool
from agent_framework.foundry import FoundryChatClient
from agent_framework.observability import configure_otel_providers, get_tracer
from azure.identity import AzureCliCredential
from dotenv import load_dotenv
from opentelemetry.trace import SpanKind
from opentelemetry.trace.span import format_trace_id
from pydantic import Field

"""
This sample exports Agent Framework telemetry to the local OTLP collector
started by Foundry Toolkit for Visual Studio Code. It does not require or
write to Application Insights.

Environment variables:
    FOUNDRY_PROJECT_ENDPOINT — Microsoft Foundry project endpoint
    FOUNDRY_MODEL            — Model deployment name (e.g. gpt-4o)
    TOOLKIT_TRACE_SENSITIVE_DATA — "true" only for controlled synthetic input
"""

load_dotenv()

os.environ.setdefault("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
os.environ.setdefault("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")


# NOTE: approval_mode="never_require" is for sample brevity.
@tool(approval_mode="never_require")
async def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    await asyncio.sleep(randint(0, 10) / 10.0)  # Simulate a network call
    conditions = ["sunny", "cloudy", "rainy", "stormy"]
    return f"The weather in {location} is {conditions[randint(0, 3)]} with a high of {randint(10, 30)}°C."


async def main():
    capture_sensitive_data = os.environ.get("TOOLKIT_TRACE_SENSITIVE_DATA", "false").lower() == "true"
    configure_otel_providers(enable_sensitive_data=capture_sensitive_data)

    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["FOUNDRY_MODEL"],
        credential=AzureCliCredential(),
    )

    print(f"Local tracing is configured. Sensitive content capture: {capture_sensitive_data}")
    print("Starting Weather Agent...")

    questions = ["What's the weather in Amsterdam?", "and in Paris, and which is better?", "Why is the sky blue?"]

    with get_tracer().start_as_current_span("Weather Agent Chat", kind=SpanKind.CLIENT) as current_span:
        print(f"Trace ID: {format_trace_id(current_span.get_span_context().trace_id)}")

        agent = Agent(
            client=client,
            tools=[get_weather],
            name="WeatherAgent",
            instructions="You are a weather assistant.",
            id="weather-agent",
        )

        session = agent.create_session()

        for question in questions:
            print(f"\nUser: {question}")
            print(f"{agent.name}: ", end="")
            async for update in agent.run(question, session=session, stream=True):
                if update.text:
                    print(update.text, end="")


if __name__ == "__main__":
    asyncio.run(main())
