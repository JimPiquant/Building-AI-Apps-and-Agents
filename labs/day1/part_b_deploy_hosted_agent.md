# Day 1 · Part B setup — deploy the docs-assistant Hosted agent

In Day 1 Part B you will **connect to** a pre-deployed Hosted agent named `docs-assistant-hosted`. This document tells you how to deploy that agent.

Estimated time: **~20 minutes**.

## Prerequisites

- A Foundry resource and Foundry project (create with the [Azure CLI quickstart](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources?tabs=azurecli) — same setup you did in Part A pre-work).
- A deployed model (recommended: `gpt-5.6-luna`).
- The Azure CLI signed in (`az login`) as an identity with **Foundry Owner** or **Owner** at the Foundry resource scope.
- The Azure Developer CLI signed in (`azd auth login`)
- Docker not required — Foundry builds the container from a zip.

## What we're deploying

The Hosted agent's source is essentially the **same MAF code as `labs/day1/python/part_c_responses_api.py`** — an `Agent` + `FoundryChatClient` that answers docs-assistant questions. The source code and configuratoin is uploaded to Agent Service, Foundry builds the container image, runs it with a managed endpoint, and gives it a dedicated Entra identity, tracing, and content safety.

## Steps

### 1. Prepare the source

From the labs/day1 root:

```bash
mkdir -p docs-assistant-hosted && cd docs-assistant-hosted
uv init
uv add agent-framework agent-framework-foundry azure-ai-projects azure-identity python-dotenv
```
'uv init' will scaffold a simple python project, including a pyproject.toml configuration file and a hello world main.py.
'uv add' adds dependencies to your pyproject.toml file.

Note: Ensure agent-framework is at version 1.12.1.  Here is a tested pyproject.toml dependencies configuration:

```bash
dependencies = [
    "agent-framework>=1.12.1",
    "agent-framework-foundry>=1.10.3",
    "azure-ai-projects>=2.3.0",
    "azure-identity>=1.25.3",
    "python-dotenv>=1.2.2",
]
```

After editing `pyproject.toml`, re-run `uv sync` so the new pinned versions get installed into the project's virtual environment:

```bash
uv sync
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
- Select a model deployment: `gpt-5.6-luna`


### 2. Deploy the agent to the Foundry portal

```bash
azd provision
azd deploy
```
After about a minute azd should report that your agent is deployed and responding to pings.

### 3. Test the deployment

Verify the deployment:

```bash
azd ai agent show docs-assistant-hosted
azd ai agent invoke docs-assistant-hosted 'what are you able to do?'
```

You should see the agent respond.

### 4. Confirm the agent type in the portal

Open the Foundry portal, navigate to your project, and open the **Agents** blade. You should see `docs-assistant-hosted` in the list — click it and confirm the **Type** column (or the details pane) shows **Hosted**. That's the visible proof that Agent Service is running the container image `azd` just built for you, rather than serving a Prompt agent definition.

## Troubleshooting note
404 not found errors may be due to a stale session resulting from incomplete deprovisioning.  Run this to force a new session:

```bash
azd ai agent invoke docs-assistant-hosted --new-session --new-conversation 'what are you able to do?'
```

Dependency-related errors during `azd deploy` (missing packages, resolution conflicts, or mismatched versions between local and remote) usually mean the `uv.lock` file is out of sync with the current `pyproject.toml`. Delete the lock file, resolve fresh, and redeploy:

```bash
rm uv.lock
uv sync
azd deploy
```

## Cleanup

After the workshop, delete the Hosted agent. Two ways to do it:

**Portal (fastest):** open your project in the Foundry portal, go to the **Agents** blade, select `docs-assistant-hosted`, and click **Delete**.

**CLI:**

```bash
az rest --method delete \
  --url "https://<project>.services.ai.azure.com/agents/docs-assistant-hosted?api-version=<current>"
```

(Refer to the current Agent Service REST API version in Learn.)
