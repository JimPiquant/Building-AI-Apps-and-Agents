---
marp: true
paginate: true
---

# Module 5 — Foundry Toolbox in Practice
### Managed tools you attach without writing

Day 2 · 25 minutes

---

## Where we are in Actions

Module 4 covered the **function-calling contract** — same for every tool.

Modules 5–7 walk the three tool origins:

- **Module 5 (this one)** — **Toolbox tools** — Microsoft-managed catalog of tools you attach without writing
- **Module 6** — Custom function tools you author in MAF
- **Module 7** — Combining knowledge + tools

Toolbox is where you say: "I need my agent to search the web. I don't need to build a web-search tool."

*Source: [Create and manage a toolbox in Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox)*

---

## What Foundry Toolbox is

- A **curated catalog** of ready-to-use tools an agent can attach to
- A **project-scoped resource** — one toolbox per set of tools you want to reuse
- **Exposed to MAF over an MCP endpoint** — same MCP protocol as Day 3
- **Versioned** — publish v1, iterate to v2, consumers pin (or use the default)
- **Managed by Microsoft (or your organization)** — you don't own the runtime

One toolbox can contain many tools. Multiple agents can consume the same toolbox.

---

## The tools available in the catalog

| Category | Examples |
|---|---|
| **Web** | Web search (Bing), Bing Custom Search |
| **Code** | Code interpreter (sandboxed Python) |
| **Data & search** | Azure AI Search, File search |
| **Enterprise** | SharePoint, Microsoft Fabric, WorkIQ |
| **Custom** | Any MCP server (local or remote), Skills |
| **Discovery** | Tool search (intent-based routing) |

Two categories worth extra attention:

- **MCP tool** — attach any MCP server to the toolbox. Same protocol as Day 3.
- **Toolbox search** — LLM-driven routing over your toolbox's tools when there are too many for the model to pick from.

---

## Why toolbox, and not just "tools=[...] on the agent"

Function tools attach to a specific agent. Toolboxes are **reusable across agents**.

| Question | Function tools (Module 6) | Toolbox (this module) |
|---|---|---|
| Where is the code? | In your app | In Foundry (or the MCP server behind it) |
| Who runs it? | Your process | Foundry or the MCP server |
| Auth to internal systems? | Your code handles | Project connections + managed identity |
| Shared across agents? | Copy code | One toolbox, many agents |
| Versioned? | With your app | First-class in Foundry |
| Governance? | You audit | Central catalog, RBAC, rai_config |

Toolbox wins on **reuse, governance, and platform-managed auth**. Function tools win on **flexibility** and having code you control.

---

## Toolbox anatomy

A toolbox is a **project resource** with:

- **Name** — identifier
- **Description** — human-readable
- **Tools** — a list of tool entries (each with its own config)
- **Connections** — project connections the toolbox references (AI Search, MCP server, Bing, etc.)
- **Skills** — Foundry skills packaged as MCP resources
- **Policies** — optional RAI policy applied at the toolbox level
- **Versions** — the whole thing is versioned; one version is the default

Attendees see the version story again — it's the same "publish a version, consumers pin" pattern as Prompt agents.

---

## Two authoring paths

**Portal** — click-through UI in the Foundry portal for exploration.

**IaC-first (workshop path)** — `azd ai` CLI or SDK.

Two-step flow:

1. Create the **connections** the toolbox will reference (`azd ai connection create ...` — one per credential record)
2. Create the toolbox from a **YAML file** (`azd ai toolbox create <name> --from-file toolbox.yaml`)

The YAML references connections **by name**. Credentials never live in the YAML — they live in the connections.

---

## A minimal toolbox YAML

```yaml
# my-toolbox.yaml
description: Docs assistant helper toolbox

tools:
  - type: web_search
    name: web

  - type: code_interpreter
    container: { type: auto }
    name: code

  - type: toolbox_search   # intent-based routing over the tools above
```

Create it:

```bash
azd ai project set $PROJECT_ENDPOINT
azd ai toolbox create my-toolbox --from-file ./my-toolbox.yaml
```

Three tools attached. No custom code, no credentials in the file. First version becomes the default automatically.

---

## Adding a tool that needs a connection

For tools that reach external systems, register a connection first:

```bash
# 1. Register the connection (project scope)
azd ai connection create my-search-conn \
  --kind cognitive-search \
  --target https://<search>.search.windows.net \
  --auth-type project-managed-identity
```

Then reference by name in the toolbox YAML:

```yaml
tools:
  - type: azure_ai_search
    name: search
    azure_ai_search:
      indexes:
        - project_connection_id: my-search-conn
          index_name: docs-index
```

Managed identity means the toolbox authenticates as *itself* — no long-lived keys in the YAML.

---

## Attaching an MCP server as a Toolbox tool

Any MCP server (public URL or your own) can be a toolbox tool:

```yaml
tools:
  - type: mcp
    server_label: myserver
    server_url: https://your-mcp-server.example.com
    require_approval: never
    project_connection_id: my-mcp-conn
```

Two important points:

- **Auth flows through the connection** — MCP servers can require keys, OAuth, Entra tokens; the connection handles it
- **Same MCP protocol** as Day 3 — Toolbox is just one way to wire an MCP server in

Attendees see this pattern again on Day 3 when they wire the Azure DevOps MCP server directly.

---

## Consuming a toolbox — the two endpoints

A toolbox exposes **two MCP endpoints**:

| Role | Endpoint | Use |
|---|---|---|
| **Consumer** | `{project}/toolboxes/{name}/mcp?api-version=v1` | Always serves the default version. Agents connect here. |
| **Developer** | `{project}/toolboxes/{name}/versions/{v}/mcp?api-version=v1` | Version-pinned. For testing before promoting. |

Rule of thumb: **agents use the consumer endpoint.** Promote new toolbox versions without redeploying the agent.

---

## Attaching a toolbox to an agent (MAF, Python)

```python
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework.foundry.toolbox import FoundryToolbox
from azure.identity import AzureCliCredential

toolbox = FoundryToolbox(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    name="my-toolbox",
    credential=AzureCliCredential(),
)

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="Use the toolbox tools to answer questions and cite sources.",
    tools=[toolbox],   # ← one line to attach all toolbox tools
)
```

`toolbox` behaves as a tool collection. Every tool in the toolbox becomes available to the agent. Under the hood: MCP handshake, tool schemas fetched, wired to the function-calling contract from Module 4.

---

## Attaching a toolbox to a Prompt agent

For Prompt agents, the toolbox is attached in the **agent configuration**, not from code:

- Portal: **Agents** → your agent → **Tools** → **Add Toolbox** → select toolbox → save
- SDK: pass toolbox reference in `PromptAgentDefinition(..., toolbox=...)`
- YAML: reference the toolbox in the agent's declarative definition

The consuming agent code (`FoundryAgent(agent_name=..., agent_version=...)`) stays the same. All Prompt-agent version consumers automatically get the new tools.

Same pattern for Hosted agents — configuration, not code.

---

## Governance you get from toolbox

Because toolboxes are a first-class Foundry resource:

- **RBAC** — who can create, update, and consume a toolbox is Entra-controlled
- **Audit** — toolbox versions and consumption tracked centrally
- **RAI policy** — apply a Responsible AI policy at the toolbox level (`policies.rai_config`)
- **Central catalog** — one place to see every managed tool in the project

This is the platform's answer to "how do we stop developers from wiring random tools into agents in production?"

---

## Versioning workflow

Standard workflow attendees will use:

1. Create v1 → automatically the default → agents consume via the consumer endpoint
2. Author v2 (add a tool, tighten a description, swap an MCP connection)
3. Test against the **developer endpoint** (`/versions/2/mcp`) before promotion
4. Promote v2 to default when validated → agents pick it up on their next call, no code change

The promote step is the "ship" moment. Same discipline as Prompt agent versioning from Day 1.

---

## When to build a function tool instead

Toolbox is powerful. It's not the answer to everything.

Reach for a **custom function tool (Module 6)** when:

- The logic doesn't fit any toolbox catalog entry
- You need runtime context the toolbox model can't express (per-user filtering, session state)
- You're prototyping fast and don't want to publish a toolbox yet
- The tool talks to something inside your app's process (in-memory cache, local model)

Reach for **Toolbox** when:

- The tool is a shared capability across agents
- You want central governance, RBAC, and audit
- The tool integrates with a supported enterprise system (SharePoint, Fabric, Bing, AI Search, MCP)
- You want versioning as a first-class concern

Mix both. Real agents often have `tools=[my_function_tool, my_toolbox]`.

---

## Common traps

- **Credentials in the YAML** — don't. Use connections. YAML is checked into source control.
- **Consumer endpoint vs. developer endpoint confusion** — agents = consumer; test = developer
- **Not testing before promoting** — v2 is default the moment you promote. Test against `/versions/2/mcp` first.
- **Too many tools in one toolbox** — same "≤10 tools per agent" rule from Module 4 applies. If a toolbox has 30 tools, use `toolbox_search`.
- **Assuming toolbox tools are free** — some tools have per-call costs (Bing search, code interpreter compute). Budget accordingly.
- **Skipping RAI policy** — toolbox is the right place to enforce content safety centrally. Use it.

---

## Takeaways

- **Foundry Toolbox = a curated catalog of managed tools** you attach without writing
- **Toolbox tools are exposed over MCP** — same protocol as Day 3
- **Two-step authoring**: connections first, then a YAML that references them by name
- **Two endpoints**: consumer (default version) and developer (version-pinned)
- **Toolbox wins on reuse, governance, and platform-managed auth.** Function tools win on flexibility.
- **Mix both** — real agents often have custom + toolbox tools together

**Next:** Authoring your own function tools in MAF — hands-on.
