---
marp: true
paginate: true
---

# Module 6 — Hosting Agent Framework agents
### Foundry-hosted and self-hosted — pick what your app needs to own

Day 1 · 35 minutes

---

## Where the agent process lives

**First choose who operates the infrastructure.** This is an operational choice between Microsoft-managed **Foundry Hosted Agents** and **self-hosting**. It's separate from the protocol that clients use to reach your agent.

- **Foundry-hosted** — Microsoft runs the container, scaling, session lifecycle, and platform integration. GA.
- **Self-hosted** — your app owns the runtime; Agent Framework provides hosting helpers for common patterns. Python packages are prerelease.

Two families. Under Foundry-hosted there are two flavors — **Prompt agents** (configuration-only) and **Hosted agents** (your MAF code, containerized).

*Grounded in [Learn — Hosting Agent Framework applications](https://learn.microsoft.com/agent-framework/hosting/).*

---

## Foundry-hosted family

Microsoft-managed hosting. **GA today.**

**What Foundry runs:** the container, autoscale, session persistence, platform integration.
**What you own:** your agent code (Hosted flavor) or configuration (Prompt flavor), plus Foundry settings.

**Two flavors of Foundry-hosted:**

| Flavor | What's inside | Best for |
|---|---|---|
| **Prompt agent** | Configuration only — instructions, model, tools. Versioned. | Fast start, internal tools, agents without custom orchestration |
| **Hosted agent** | Your MAF code, packaged as a container (or zip, Foundry builds the image) | Agents with custom code, orchestration, or logic — with managed hosting |

**Choose Foundry-hosted when:** you want Microsoft-managed hosting and don't need application-level control over the runtime.

*Grounded in [Learn — Foundry Hosted Agents](https://learn.microsoft.com/agent-framework/hosting/foundry-hosted-agent).*

---

## Foundry-hosted · Prompt agent

A **Prompt agent** is authored entirely as configuration — instructions, model, tools. Author via the **SDK / REST** (the IaC-first norm, CI/CD-friendly), via a **declarative YAML** definition, or **in the Foundry portal** (fine for exploration). Either way, **Foundry runs it**. No application code to maintain, no compute to pay for, no containers to patch.

Connect to a Prompt agent from your app:

```python
from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    agent_name="docs-assistant",
    agent_version="1.0",
    credential=AzureCliCredential(),
)
result = await agent.run("What is Foundry IQ?")
```

**Best for:** fast start, internal tools, production agents that don't need custom orchestration logic.

---

## Foundry-hosted · Hosted agent

Take an agent you wrote with MAF (or LangGraph, or the OpenAI / Anthropic Agents SDK, or your own code). Package it as a container image, or as a zip of source (Foundry builds the image for you). Deploy to Foundry Agent Service. **Foundry runs the container** with:

- A **managed endpoint** (a stable URL you or another agent can call)
- **Autoscale** — container instances scale per session and request volume
- A **dedicated Microsoft Entra identity** per agent
- **End-to-end observability** — tracing, metrics, App Insights integration
- **Content safety** — integrated guardrails and prompt-injection mitigation

Connect to a Hosted agent from any client (including another agent):

```python
from agent_framework.foundry import FoundryAgent

agent = FoundryAgent(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    agent_name="docs-assistant-hosted",
    credential=AzureCliCredential(),
)
```

Package used at author time: **`agent-framework-foundry-hosting`** (prerelease). Exposes your agent via the Foundry **Responses** or **Invocations** protocol.

**Best for:** agents that call into your own custom code, custom orchestration, multi-agent systems, and any scenario where you want full control over agent logic while letting Foundry handle hosting, scaling, and identity.

---

## What Foundry manages for you

Beyond running the container, Agent Service brings a bundle of managed capabilities every Foundry-hosted agent inherits:

- **Managed endpoint** — you call one URL; Foundry routes and scales
- **Managed conversations / memory** — session state without you standing up a store (BYO memory store also supported)
- **Foundry Toolbox** — a curated MCP-compatible catalog of tools (web search, code interpreter, file search, SharePoint, Fabric, MCP servers, custom skills)
- **Foundry IQ** — enterprise knowledge / grounding (Day 2)
- **Agent identity** — dedicated Entra identity; managed credential for tool auth
- **Observability** — traces, metrics, dashboards
- **Content safety** — RAI filters and XPIA mitigation

This is the answer to "why not just run my own container somewhere?" — **Foundry hosts your app runtime *and* the tooling around it in one place.**

---

## Self-hosted family

**You run the agent process** in your own web app, container, service, or runtime. Your application owns routing, identity, authorization, request policy, storage, deployment, scaling, and native client libraries.

**Agent Framework provides hosting helpers, not a server:**

- **Python** — `agent-framework-hosting` (session state) plus protocol packages (`-hosting-responses`, `-hosting-a2a`, `-hosting-mcp`, `-hosting-telegram`). Prerelease.
- **C#** — `Microsoft.Agents.AI.Hosting` (session store, DI integration) plus protocol packages. Prerelease.

**What MAF gives you:** `AgentState` / `SessionStore` (Python) or `AddAIAgent` / `AgentSessionStore` (C#), plus protocol integrations. Your app plugs these into its own framework (FastAPI, ASP.NET Core, Django, Azure Functions, …).

**Choose self-hosted when:** you need application-level control or must integrate with existing infrastructure.

*Grounded in [Learn — Self-host Agent Framework applications](https://learn.microsoft.com/agent-framework/hosting/self-hosting/?pivots=programming-language-python).*

---

## Self-hosted · Python — Agent + Responses API

The simplest self-hosted form: your app calls `agent.run(...)` directly. Your process. Your runtime. No protocol endpoint yet.

```python
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="You are a helpful docs assistant. Cite sources.",
    # tools=[...],
)
result = await agent.run("What is Foundry IQ?")
```

Deploy this to Container Apps, App Service, AKS, Functions, or run it locally. Foundry serves the model + platform tools via the Responses API; **you** manage the runtime.

**Best for:** embedded assistants, prototyping, agents inside existing apps you already run somewhere, and any time you want full control over the runtime.

**Important:** this is **additive** to Foundry-hosted — the same MAF code can be repackaged as a Foundry-hosted Hosted agent later without a rewrite.

---

## Self-hosted · C# equivalent

```csharp
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

AIAgent agent = new AIProjectClient(
        new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: model,
        name: "DocsAssistant",
        instructions: "You are a helpful docs assistant. Cite sources.");

Console.WriteLine(await agent.RunAsync("What is Foundry IQ?"));
```

Same shape. Same primitives. Same "your process calls Foundry's Responses API" pattern.

---

## Self-hosting: pick a protocol

If you want clients to reach your self-hosted agent over the network, add a **protocol integration package**. Same agent target, different clients.

| Protocol | Python package | C# package | Use for |
|---|---|---|---|
| **OpenAI Responses / Chat Completions** | `agent-framework-hosting-responses` | `Microsoft.Agents.AI.Hosting.OpenAI` | Any OpenAI-compatible client |
| **Agent-to-Agent (A2A)** | `agent-framework-hosting-a2a` | (protocol integration) | Agent discovery + messaging between agents |
| **Model Context Protocol (MCP)** | `agent-framework-hosting-mcp` | (protocol integration) | Expose your agent as a callable MCP tool |
| **Telegram Bot API** | `agent-framework-hosting-telegram` | — | Native Telegram bot |

**Rule of thumb:** hosting model = *who runs it*. Protocol = *how clients reach it*. Pick them separately. One self-hosted app can expose several protocols against the same agent.

---

## Compare at a glance

| Concern | Foundry-hosted · Prompt | Foundry-hosted · Hosted | Self-hosted |
|---------|:-----------------------:|:-----------------------:|:-----------:|
| Runtime code to maintain | None | Yours | Yours |
| Compute to manage | None (Foundry) | Container compute (Foundry-managed) | Yours |
| Managed endpoint | Yes | Yes | You provide |
| Autoscale | Yes | Yes | You handle |
| Agent identity (Entra) | Yes | Yes, dedicated | You handle |
| Iteration speed | Portal + publish | Portal upload / redeploy | Fastest (edit + restart) |
| Portability off Foundry | Low | Medium (Foundry-managed features stay behind) | High |
| Cost model | Per-call inference + tool usage | Per-call inference + tool usage + container compute | Per-call inference + tool usage + your own compute |

---

## Decision guide (rough cuts)

- **Getting started or building a scoped internal tool with no custom logic?** → **Foundry-hosted · Prompt agent**
- **Shipping a production agent that calls your own code and you want managed hosting + Entra identity + observability?** → **Foundry-hosted · Hosted agent**
- **Regulated agent, needs managed content safety, single stable endpoint, and dedicated identity?** → either Foundry-hosted flavor
- **Embedding an agent inside an existing app you already run somewhere?** → **Self-hosted**
- **Prototyping quickly on your laptop before you decide on hosting?** → **Self-hosted**
- **Need to integrate with existing infrastructure — auth, tenancy, storage — that you already control?** → **Self-hosted**

You can and will mix these in a real system.

---

## Common gotchas

- **"Prompt agent = client-side"** — wrong. A Prompt agent is Foundry-managed; there's no client-side runtime for it at all. What sounds lightweight isn't the *runtime* — it's the *authoring*.
- **"Hosted agent = my code running anywhere in Azure"** — wrong. Hosted agent specifically means your code as a container run by **Foundry Agent Service**. Your code running in your own App Service that calls the Responses API is **self-hosted**, not Foundry-hosted.
- **"Self-hosted means no MAF hosting packages"** — wrong. Self-hosting is where the `agent-framework-hosting-*` packages live. They're helpers for the common protocol patterns; your app owns everything else.
- **Assuming portability off Foundry** — Prompt is Foundry-only by construction; Hosted keeps Foundry-managed features (Toolbox, IQ, portal connections) behind the managed endpoint. Self-hosted is the most portable.
- **Mixing hosting model with protocol** — hosting model = *who runs it*. Protocol = *how clients reach it*. Both Foundry-hosted and self-hosted expose Responses; the protocol choice doesn't determine the hosting model.

---

## Same MAF code, different destinations

The MAF code you write self-hosted — the `Agent + FoundryChatClient` app running in your own process — can be **repackaged as a Foundry-hosted Hosted agent later** without a rewrite. That's the platform's design.

- **Local dev on your laptop** → `uv run` from a terminal, F5 in VS Code. Same code.
- **Deploy to Container Apps / AKS / Functions** → Self-hosted in production. Same code.
- **Ship as a Foundry Hosted agent** → zip the code, upload via the Foundry portal (Foundry builds the container), Foundry runs it. Same code.

Prototype locally. Decide the hosting later. Foundry-specific features (Toolbox skills, IQ connections, agent identity) become available when you promote to Foundry-hosted.

---

## What you'll do in the lab

- **Part A — Foundry-hosted Prompt agent.** Create a Prompt agent in your Foundry project. Connect to it from your MAF app.
- **Part B — Foundry-hosted Hosted agent.** Deploy your own Hosted agent to Foundry Agent Service with `azd`. Connect to it and explore what Foundry manages: endpoint, tracing, dedicated agent identity, content safety.
- **Part C — Self-hosted.** Build an MAF app in Python that calls the Responses API from your process. **Stretch:** extend your Part C code with a custom function tool or a Foundry IQ knowledge source (both deep-dive on Days 2–3).

Same underlying docs-assistant behavior, both hosting families. You'll feel the trade-offs.

---

## Takeaways

- Two hosting families: **Foundry-hosted** (Microsoft-managed, GA) and **self-hosted** (your app owns the runtime).
- Under Foundry-hosted: **Prompt agents** (configuration only) and **Hosted agents** (your MAF code, containerized).
- **Same MAF code** can move between self-hosted and Foundry-hosted without a rewrite.
- Hosting model and protocol are **separate choices** — Responses / A2A / MCP / Telegram can layer on top of either family.
- Foundry Agent Service manages *more than models* — endpoint, identity, observability, Toolbox tools, memory, content safety — for both Foundry-hosted flavors.

**Next:** the lab walkthrough and environment check.
