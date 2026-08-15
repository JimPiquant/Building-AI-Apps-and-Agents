"""
Day 1 Lab — Part A (SDK creation) — Create a Prompt agent from code.

IaC-first operating norm: create resources from code, not the portal. This script
creates (or updates) a Prompt agent version in your Foundry project using the
Azure AI Projects SDK. Run this once before `part_a_prompt_agent.py`.

You can also create Prompt agents in the Foundry portal — see the alternative
path in labs/day1/README.md. The portal is fine for exploration; for
CI/CD-friendly repeatable creation, code is the norm.

Required environment variables (set in labs/day1/.env):
    FOUNDRY_PROJECT_ENDPOINT
    FOUNDRY_MODEL                       # your model deployment name
    FOUNDRY_PROMPT_AGENT_NAME=docs-assistant
"""

import os
from pathlib import Path

from dotenv import load_dotenv

from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition
from azure.identity import AzureCliCredential

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

INSTRUCTIONS = """\
## Role
You are a technical documentation assistant helping developers get started
with Microsoft Foundry and the Microsoft Agent Framework (MAF).

## Rules
- Prefer short, concrete answers. Cite documentation when you can.
- If you don't know, say so plainly instead of guessing.
- Keep code snippets minimal and directly relevant.
"""


def main() -> None:
    project_endpoint = os.environ.get("FOUNDRY_PROJECT_ENDPOINT")
    model = os.environ.get("FOUNDRY_MODEL")
    agent_name = os.environ.get("FOUNDRY_PROMPT_AGENT_NAME", "docs-assistant")

    missing = [k for k, v in {
        "FOUNDRY_PROJECT_ENDPOINT": project_endpoint,
        "FOUNDRY_MODEL": model,
    }.items() if not v]
    if missing:
        raise SystemExit(f"Set the following in labs/day1/.env before running: {', '.join(missing)}")

    # supress the pylance warnings
    assert project_endpoint is not None
    assert model is not None

    client = AIProjectClient(
        endpoint=project_endpoint,
        credential=AzureCliCredential(),
    )

    with client:
        # create_version publishes a new version of the named agent. Each call
        # creates a new immutable version; consumers pin to a specific version
        # (see part_a_prompt_agent.py, which pins version 1.0 via env var).
        agent = client.agents.create_version(
            agent_name=agent_name,
            definition=PromptAgentDefinition(
                model=model,
                instructions=INSTRUCTIONS,
            ),
        )
        print(f"Created Prompt agent: name={agent.name}  version={agent.version}  id={agent.id}")
        print("Go to the Foundry portal to view the agent.")
        print()
        print("Next step: set FOUNDRY_PROMPT_AGENT_VERSION in labs/day1/.env to the version above,")
        print("then run: uv run python part_a_prompt_agent.py to connect to the agent.")


if __name__ == "__main__":
    main()
