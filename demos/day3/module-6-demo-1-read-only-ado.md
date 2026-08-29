# Module 6 · Demo 1 — Read-only ADO MCP in action

**Placement:** After **slide 7 — "Read-only is a server-side filter"** (Module 6).

**Time:** ~5 min total (30s framing + 90s successful read + 2 min blocked write attempt + 30s payoff)

**Language:** Python (MAF SDK). **No SDK sample exists for the GA remote
Azure DevOps MCP server yet** — grounded directly in
[Learn — Azure DevOps Remote MCP Server](https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops)'s
documented endpoint, headers, and consolidated tool names, which the
Module 6 slides already cite as the sole source. Presenter substitutes
their own Entra-backed Azure DevOps organization before running — this
demo uses the presenter's personal ADO instance, not a shared Publix
sandbox.

## What it shows

The previous slide's code was a JSON header block:

```json
{
  "headers": {
    "X-MCP-Toolsets": "wit",
    "X-MCP-Readonly": "true"
  }
}
```

This demo wires that exact header pair onto an `MCPStreamableHTTPTool`
pointed at `https://mcp.dev.azure.com/{organization}`, then makes two
calls against the presenter's own Azure DevOps organization:

1. **A read** — `wit_work_item(action="get", id=<known id>)` — succeeds
   normally
2. **An attempted write** — asking the agent to update that same work
   item — is rejected because the server-side `X-MCP-Readonly: true`
   filter is in effect, not because of any client-side check

**What this demo is NOT:** it does not walk OAuth consent, the Foundry
catalog path, or write-tool usage — those are separate slides (and Module
6's own "OAuth consent belongs to the connection path" slide covers the
consent flow this demo's Entra OAuth sign-in will trigger on first use).

## Setup checklist

Do this **before the module starts**:

- **A personal Azure DevOps Services organization**, Entra-backed (not an
  MSA/standalone org — the remote server does not support those)
- **A disposable project** in that org with at least one known work item
  ID to read (create one ahead of time if needed; do not use a
  Publix-shared project for a personal demo)
- **One script staged**:
  `demos/day3/module-6-demo-1-read-only-ado/main.py`
- **`az login`** completed for the subscription containing the Foundry
  project. Azure DevOps uses a separate interactive browser login so the
  two services can belong to different tenants.
- **Environment variables** in `.env` or shell:
  ```
  AZURE_DEVOPS_ORG=<your-org-name>
  AZURE_DEVOPS_PROJECT=<project containing the work item>
  AZURE_DEVOPS_TENANT_ID=<tenant backing the Azure DevOps organization>
  AZURE_DEVOPS_WORK_ITEM_ID=<a known, disposable work item id>
  FOUNDRY_PROJECT_ENDPOINT=...
  FOUNDRY_MODEL=gpt-5.6-luna
  ```
- **Dry-run once** to complete the Azure DevOps interactive browser login

### Reference `main.py`

```python
import asyncio
import os

from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential, InteractiveBrowserCredential, TokenCachePersistenceOptions


async def main() -> None:
    org = os.environ["AZURE_DEVOPS_ORG"]
    project = os.environ["AZURE_DEVOPS_PROJECT"]
    tenant_id = os.environ["AZURE_DEVOPS_TENANT_ID"]
    work_item_id = os.environ["AZURE_DEVOPS_WORK_ITEM_ID"]

    with (
        AzureCliCredential() as foundry_credential,
      InteractiveBrowserCredential(
        tenant_id=tenant_id,
        cache_persistence_options=TokenCachePersistenceOptions(name="day3-ado-mcp"),
      ) as ado_credential,
    ):
        access_token = ado_credential.get_token("https://mcp.dev.azure.com/.default")

        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=foundry_credential,
        )
        agent = Agent(client=client, instructions="You are a helpful Azure DevOps assistant.")

        async with MCPStreamableHTTPTool(
            name="ado",
            url=f"https://mcp.dev.azure.com/{org}",
            header_provider=lambda _: {
                "Authorization": f"Bearer {access_token.token}",
                "X-MCP-Toolsets": "wit",
                "X-MCP-Readonly": "true",
            },
        ) as mcp:
            print("--- Read: should succeed ---")
            read_result = await agent.run(
                f"Get work item {work_item_id} in project {project} and summarize its title and state.",
                tools=mcp,
            )
            print(read_result, "\n")

            print("--- Write attempt: should be rejected server-side ---")
            write_result = await agent.run(
                f"Update work item {work_item_id} in project {project}: add a comment saying 'reviewed'.",
                tools=mcp,
            )
            print(write_result)


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide's headers were two lines of JSON. Let's point them at
a real Azure DevOps organization and see the read-only filter actually
hold."

**Step 1 — Run the read (~90s)**

```bash
uv run python main.py
```

The first run opens an OAuth browser window for the Azure DevOps tenant. Sign
in with an identity that belongs to the organization; subsequent runs reuse
the cached authentication record.

**Say:** *"`wit_work_item` with `action=get` — that's the read tool from
the previous module slide's table. It came back with the title and state.
Nothing surprising yet."*

**Step 2 — Watch the write attempt fail (~2 min)**

Let the second call run. Point at the response — the model either
reports it cannot complete the write, or the tool call itself returns a
permission/filter error surfaced back through the agent.

**Say:** *"Same connection. Same organization. The only thing that
changed is what I asked for. `X-MCP-Readonly: true` isn't a prompt
instruction the model could talk itself out of — it's a filter the
Azure DevOps server enforces before the write tool is even exposed. The
model literally cannot see a write tool to call."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is the read-first posture Module 6 wants you to default
to. You saw a real organization, a real work item, and a real server-side
guarantee — not a client-side convention that a misbehaving agent could
route around."*

## Expected result

- The read call succeeds and returns the work item's title/state
- The write attempt is rejected — either the agent reports it cannot
  find a write-capable tool, or the call errors out — because the header
  filter removed write tools from what the server exposes
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- **Sign-in or consent fails** — check the org is Entra-backed and the
  Entra tenant's enterprise app consent policy allows it (Module 6's own
  failure-modes table names this exact check first)
- **Tool is missing entirely for the read too** — check the toolset
  filter header spelling and value
- **Read succeeds but "write blocked" isn't obviously visible** — the
  agent may quietly explain it can't do that rather than surfacing a raw
  error; narrate the explanation as the proof point instead

Have these ready:
1. **Screenshot of the successful read**
2. **Screenshot of the write-attempt response** showing the block

Story: *"This is what a clean read-then-blocked-write pair looked like
from my dry run against my own organization. The pattern is what
matters — read succeeds, write is invisible to the model because the
server never exposed it."*

Then advance the slide.

## Teaching payoff

*"Read-only isn't a promise from the agent — it's a promise from the
server. You just watched the exact same connection succeed at reading
and fail at writing, with nothing in the client code changing between
the two calls except the request."*

## Reference

- [Azure DevOps Remote MCP Server](https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops) — the doc this demo's endpoint, headers, and tool names are grounded in verbatim
- Module 6 slide 7 ("Read-only is a server-side filter") — the code this demo runs live
- Module 6 slide 13 ("Failure modes tell you where to look") — troubleshooting reference if sign-in or discovery fails during the dry run
