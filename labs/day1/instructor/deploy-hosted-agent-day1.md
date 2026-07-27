# Deploying the Day 1 Hosted agent (instructor)

Day 1 Part B has attendees **connect to** a pre-deployed Hosted agent named `docs-assistant-hosted`. This document tells you (the instructor) how to deploy that agent before Day 1. Do this once, in the same Foundry project attendees will use — or in a shared workshop project everyone can reach.

Estimated time: **~20 minutes**, mostly waiting on container build.

## Prerequisites

- A Foundry resource and Foundry project (create with the [Azure CLI quickstart](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources?tabs=azurecli) — same setup attendees do in Part A pre-work).
- A deployed model (recommended: `gpt-5.4-mini`).
- The Azure CLI signed in (`az login`) as an identity with **Foundry Owner** or **Owner** at the Foundry resource scope.
- Docker not required — Foundry builds the container from a zip.

## What we're deploying

The Hosted agent's source is essentially the **same MAF code as `labs/day1/python/part_c_responses_api.py`** — an `Agent` + `FoundryChatClient` that answers docs-assistant questions. Packaged as a source zip and uploaded to Agent Service, Foundry builds the container image, runs it with a managed endpoint, and gives it a dedicated Entra identity, tracing, and content safety.

**Attach one Toolbox tool** to it (recommended: **web search**) so attendees can see a platform tool call in the trace during Part B's portal walkthrough.

## Steps

### 1. Prepare the source zip

From the repo root:

```bash
mkdir -p /tmp/docs-assistant-hosted
cp labs/day1/python/part_c_responses_api.py /tmp/docs-assistant-hosted/main.py
cp labs/day1/python/pyproject.toml /tmp/docs-assistant-hosted/pyproject.toml
```

Edit `/tmp/docs-assistant-hosted/main.py` to expose the agent as a callable entry point that Agent Service can invoke. The simplest shape:

```python
# main.py — packaged for Foundry Agent Service Hosted agent
import os
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import DefaultAzureCredential

INSTRUCTIONS = """\
## Role
You are a technical documentation assistant helping developers get started
with Microsoft Foundry and the Microsoft Agent Framework (MAF).

## Rules
- Prefer short, concrete answers. Cite documentation when you can.
- If you don't know, say so plainly instead of guessing.
- Keep code snippets minimal and directly relevant.
"""

# In a Hosted agent, the runtime auto-injects credentials + project endpoint.
agent = Agent(
    client=FoundryChatClient(credential=DefaultAzureCredential()),
    name="DocsAssistantHosted",
    instructions=INSTRUCTIONS,
)
```

Zip the directory:

```bash
cd /tmp/docs-assistant-hosted
zip -r ../docs-assistant-hosted.zip .
```

### 2. Upload via the Foundry portal

1. Open [https://ai.azure.com](https://ai.azure.com) → your project.
2. **Agents** → **New agent** (top-right) → **Code an agent** from the dropdown.
3. Name: `docs-assistant-hosted`.
4. Upload `/tmp/docs-assistant-hosted.zip` as the source. Foundry builds the container image for you.
5. Wait for the build to complete (typically 5–10 minutes).

> **Portal vocabulary note:** the portal's *"Code an agent"* corresponds to what the docs call a **Hosted agent** (your code, run by Foundry). *"Build an agent"* creates a **Prompt agent** (configuration-only). *"Link external agent"* is a separate scenario not used in this workshop.

### 3. Attach a Toolbox tool

Attendees need to see at least one platform tool fire in the trace during Part B. The easiest to demonstrate:

1. Open the Hosted agent's details page in the portal.
2. **Tools** → **Add** → **Web search** from the Toolbox catalog.
3. Save.

Other Toolbox tools (code interpreter, file search, custom skills) also work; web search is the most visually obvious in a trace.

### 4. Grant attendees access

Attendees need to be able to **invoke** the Hosted agent from their laptops. Assign each attendee the **Foundry User** role at the Foundry resource scope (this is the same starter role they need for the rest of the workshop).

```bash
az role assignment create \
  --assignee <attendee-upn-or-object-id> \
  --role "Foundry User" \
  --scope "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<foundry-resource>"
```

If you're using a shared workshop project, do this once for each attendee at the shared resource scope.

### 5. Test the deployment

Before Day 1, verify from your own laptop:

```bash
# From labs/day1/python (with your own .env pointing at the same project)
FOUNDRY_HOSTED_AGENT_NAME=docs-assistant-hosted uv run python part_b_hosted_agent.py
```

You should see the agent respond and, if you attached web search, the trace in the portal should show a `web_search` tool call.

## What attendees see

- They set `FOUNDRY_HOSTED_AGENT_NAME=docs-assistant-hosted` in their `.env`.
- They run `uv run python part_b_hosted_agent.py`.
- They walk the portal to see the managed endpoint URL, tracing dashboard, dedicated Entra identity, the web-search Toolbox tool in the trace, and content safety filters.
- Stretch (optional): they zip their **own** Part C code and deploy it as their own Hosted agent, repeating steps 1–3 above.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Container build fails during upload | `main.py` missing or import errors | Test locally with `uv run python main.py` before zipping |
| Attendee runs `part_b_hosted_agent.py` → 401 | Attendee missing `Foundry User` at resource scope | Assign the role (step 4) |
| Attendee runs `part_b_hosted_agent.py` → 404 | Attendee's `FOUNDRY_HOSTED_AGENT_NAME` doesn't match | Confirm the deployment name exactly matches `docs-assistant-hosted` |
| No trace shows the web-search tool call | Toolbox tool not attached | Redo step 3 |
| Agent responds but doesn't cite docs | Instructions drifted from the docs-assistant prompt | Redeploy with the `main.py` above |

## Cleanup

After the workshop, delete the Hosted agent from **Agents** in the portal, or use:

```bash
az rest --method delete \
  --url "https://<project>.services.ai.azure.com/agents/docs-assistant-hosted?api-version=<current>"
```

(Refer to the current Agent Service REST API version in Learn.)
