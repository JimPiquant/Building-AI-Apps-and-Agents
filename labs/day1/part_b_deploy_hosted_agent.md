# Day 1 · Part B setup — deploy the docs-assistant Hosted agent

In Day 1 Part B you will **connect to** a pre-deployed Hosted agent named `docs-assistant-hosted`. This document tells you how to deploy that agent.

Estimated time: **~20 minutes**.

## Prerequisites

- A Foundry resource and Foundry project (create with the [Azure CLI quickstart](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources?tabs=azurecli) — same setup attendees do in Part A pre-work).
- A deployed model (recommended: `gpt-5.4-mini`).
- The Azure CLI signed in (`az login`) as an identity with **Foundry Owner** or **Owner** at the Foundry resource scope.
- The Azure Developer CLI signed in (`azd auth login`)
- Docker not required — Foundry builds the container from a zip.

## What we're deploying

The Hosted agent's source is essentially the **same MAF code as `labs/day1/python/part_c_responses_api.py`** — an `Agent` + `FoundryChatClient` that answers docs-assistant questions. The source code and configuratoin is uploaded to Agent Service, Foundry builds the container image, runs it with a managed endpoint, and gives it a dedicated Entra identity, tracing, and content safety.

## Steps

### 1. Prepare the source

From the labs/day1 root:

```bash
mkdir -p docs-assistant-hosted
uv add agent-framework agent-framework-foundry azure-ai-projects azure-identity python-dotenv
```

Edit `docs-assistant-hosted/main.py` to expose the agent as a callable entry point that Agent Service can invoke:

```python
# main.py — packaged for Foundry Agent Service Hosted agent
import os
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework_foundry_hosting import ResponsesHostServer
from azure.identity import DefaultAzureCredential

INSTRUCTIONS = """
## Role
You are a technical documentation assistant helping developers get started
with Microsoft Foundry and the Microsoft Agent Framework (MAF).

## Rules
- Prefer short, concrete answers. Cite documentation when you can.
- If you don't know, say so plainly instead of guessing.
- Keep code snippets minimal and directly relevant.
"""

"""
The Foundry hosting infrastructure automatically injects 
    FOUNDRY_PROJECT_ENDPOINT, AZURE_AI_MODEL_DEPLOYMENT_NAME and APPLICATIONINSIGHTS_CONNECTION_STRING
"""

def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        credential=DefaultAzureCredential(),
    )

    agent = Agent(
        client=client,
        instructions=INSTRUCTIONS,
        # The hosting infrastructure manages conversation history, so the
        # service doesn't need to store it.
        default_options={"store": False},
    )

    server = ResponsesHostServer(agent)
    server.run()


if __name__ == "__main__":
    main()
```

Prepare the agent for deployment using `azd`, the Azure Developer CLI:

```bash
azd auth login
azd ext install azure.ai.agents or "azd ext upgrade azure.ai.agents" if already installed
azd ai agent init
```

Azd will prompt for your hosted agent configuration:
- How do you want to initialize your agent?: `Use the code in the current directory`
- What is the name of your project?: `docs-assistant-hosted`
- Enter a name for your agent: [Type ? for hint] `docs-assistant-hosted`
- How would you like to deploy your agent?: `Source Code (ZIP upload)`
- Select the runtime for your agent: `Python 3.14`
- Enter the file path for the entry point of the agent: `main.py`
- How should dependencies be resolved?: `Remote build (dependencies installed on server during deployment)`
- Which protocols does your agent support?: `responses`
- Select a Foundry project to host your agent and any models or tools it uses.: `Use an existing Foundry project`
- Select subscription: `your subscription`
- Select a Foundry project: `\<foundry account\> / \<foundry project\> (region)`
- How would you like to configure model(s) for your agent?: `Use an existing model deployment`
- Select a model deployment: `gpt-5.4-mini (gpt-5.4-mini v2026-03-17, GlobalStandard)`


### 2. Deploy the agent to the Foundry portal

```bash
azd provision
azd deploy
```
After about a minute azd should report that your agent is deployed and responding to pings.

### 3. Test the deployment

Before Day 1, verify from your own laptop:

```bash
azd ai agent invoke docs-assistant-hosted 'what are you able to do?'
```

You should see the agent respond.


## Cleanup

After the workshop, delete the Hosted agent from **Agents** in the portal, or use:

```bash
az rest --method delete \
  --url "https://<project>.services.ai.azure.com/agents/docs-assistant-hosted?api-version=<current>"
```

(Refer to the current Agent Service REST API version in Learn.)
