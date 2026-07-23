---
marp: true
paginate: true
---

# Module 6 — Three ways to run an agent with Foundry
### Prompt agents, Hosted agents, and calling the Responses API from your own code

Day 1 · 35 minutes

---

## Foundry Agent Service — you pick how much of the platform to use

The **Responses API** is a single model + tools entry point behind every path. What changes is **where your agent code runs** and **how much of the runtime Foundry manages for you**.

| Path | Where the code runs | Who manages the runtime |
|------|--------------------|-------------------------|
| **A · Prompt agent** | Foundry Agent Service | Foundry (no code, no compute) |
| **B · Hosted agent** | Foundry Agent Service | Foundry (managed endpoint, autoscale, identity, observability) |
| **C · Your own code, calling the Responses API** | Your process (laptop, Container Apps, App Service, AKS, Functions) | You |

Path B and Path C use the **same MAF code**. The difference is where that code executes.

---

## Path A — Prompt agent

A **Prompt agent** is authored entirely as configuration — instructions, model, tools. Author in the Foundry portal (portal-first) or via the SDK / REST (code-first, for CI/CD). Either way, **Foundry runs it**. No application code to maintain, no compute to pay for, no containers to patch.

Connect to a Prompt agent from your app:

```python
from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant",
    agent_version="1.0",
    credential=AzureCliCredential(),
)
result = await agent.run("What is Foundry IQ?")
```

**Best for:** fast start, internal tools, production agents that don't need custom orchestration logic.

---

## Path B — Hosted agent

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
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant-hosted",
    credential=AzureCliCredential(),
)
```

**Best for:** agents that call into your own custom code, custom orchestration, multi-agent systems, and any scenario where you want full control over agent logic while letting Foundry handle hosting, scaling, and identity.

---

## What Foundry manages *for* a Hosted agent

Beyond running the container, Agent Service brings a bundle of managed capabilities every Hosted agent inherits:

- **Managed endpoint** — you call one URL; Foundry routes and scales
- **Managed conversations / memory** — session state without you standing up a store (BYO memory store also supported)
- **Foundry Toolbox** — a curated MCP-compatible catalog of tools (web search, code interpreter, file search, SharePoint, Fabric, MCP servers, custom skills)
- **Foundry IQ** — enterprise knowledge / grounding (Day 2)
- **Agent identity** — dedicated Entra identity; managed credential for tool auth
- **Observability** — traces, metrics, dashboards
- **Content safety** — RAI filters and XPIA mitigation

This is the answer to "why not just run my own container somewhere?" — **Foundry hosts your app runtime *and* the tooling around it in one place.**

---

## Path C — Your own code, calling the Responses API

Write your agent as an MAF app in your own repo. Run it wherever you already run apps — on your laptop, in Azure Container Apps, App Service, AKS, or Functions. Your process calls Foundry's Responses API for models and platform tools; **you** manage the runtime.

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

**Best for:** embedded assistants, prototyping, agents inside existing apps you already run somewhere, and any time you want full control over the runtime.

**Important:** this is **additive** to Path B — the same MAF code can be repackaged as a Hosted agent later without a rewrite.

---

## Path C — C# equivalent

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

## Compare at a glance

| Concern | Path A · Prompt agent | Path B · Hosted agent | Path C · Your code + Responses API |
|---------|:---------------------:|:---------------------:|:---------------------------------:|
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

- **Getting started or building a scoped internal tool with no custom logic?** → **Path A · Prompt agent**
- **Shipping a production agent that calls your own code and you want managed hosting + Entra identity + observability?** → **Path B · Hosted agent**
- **Regulated agent, needs managed content safety, single stable endpoint, and dedicated identity?** → **Path A** or **Path B**
- **Embedding an agent inside an existing app you already run somewhere?** → **Path C · Your code + Responses API**
- **Prototyping quickly on your laptop before you decide on hosting?** → **Path C**

You can and will mix these in a real system.

---

## Common gotchas

- **"Prompt agent = client-side"** — wrong. A Prompt agent is Foundry-managed; there's no client-side runtime for it at all. What sounds lightweight isn't the *runtime* — it's the *authoring*.
- **"Hosted agent = my code running anywhere in Azure"** — wrong. Hosted agent specifically means your code as a container run by Foundry Agent Service. Your code running in your own App Service that calls the Responses API is Path C, not Path B.
- **Assuming portability off Foundry** — Path A is Foundry-only by construction; Path B keeps Foundry-managed features (Toolbox, IQ, portal connections) behind the managed endpoint. Path C is the most portable.
- **Mixing up authentication** — all three use Azure identity, but the credential authenticates to different things: your project endpoint (Path C), a specific Prompt-agent resource (Path A), or a Hosted-agent endpoint (Path B).

---

## Same MAF code, different destinations

The MAF code you write for Path C — the `Agent + FoundryChatClient` app running in your own process — can be **repackaged as a Hosted agent (Path B) later** without a rewrite. That's the platform's design.

- **Local dev on your laptop** → `uv run` from a terminal, F5 in VS Code. Same code.
- **Deploy to Container Apps / AKS / Functions** → Path C in production. Same code.
- **Ship as a Hosted agent inside Foundry** → zip the code, upload via the Foundry portal (Foundry builds the container), Foundry runs it. Same code.

Prototype locally. Decide the hosting later. Foundry-specific features (Toolbox skills, IQ connections, agent identity) become available when you promote to Path A or Path B.

---

## What you'll do in the lab

- **Part A — Prompt agent.** Create a Prompt agent in the Foundry portal. Connect to it from your MAF app.
- **Part B — Hosted agent.** Connect to a pre-deployed Hosted agent in the shared sandbox. Explore what Foundry manages: endpoint, tracing, agent identity, an attached Toolbox tool.
- **Part C — Your own code + Responses API.** Build an MAF app in Python (or C#) that calls the Responses API from your process. **Stretch:** zip your Part C code and deploy it as your own Hosted agent.

Same underlying docs-assistant behavior three ways. You'll feel the trade-offs.

---

## Takeaways

- Foundry gives you **three hosting options**, with the **Responses API** as the shared entry point.
- **Prompt agent** = configuration only. **Hosted agent** = your code, Foundry-run. **Path C** = your code, you run it.
- Foundry Agent Service manages *more than models* — endpoint, identity, observability, Toolbox tools, memory, content safety.
- Path C code is portable — you can promote to a Hosted agent later without a rewrite.

**Next:** the lab walkthrough and environment check.
