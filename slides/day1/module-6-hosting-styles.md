---
marp: true
paginate: true
---

# Module 6 — Agent Hosting Styles
### Client-side vs. Foundry-hosted (PromptAgent and HostedAgent)

Day 1 · 35 minutes

---

## Two places an agent can live

**Client-side** — you build the agent in your app code with `Agent` + a chat client. In-process thread state. Your process owns the lifecycle.

**Foundry-hosted** — the agent is created and configured in the Foundry portal (or via API). MAF connects to it over the wire. Foundry owns the lifecycle.

MAF gives you a consistent API for both. You choose based on the scenario, not the SDK.

---

## Client-side agent — Python

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

The agent object lives entirely in your process. Kill the process, kill the thread.

---

## Client-side agent — C#

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

Same shape — construct locally, run locally, no persisted server-side identity.

---

## Foundry-hosted, flavor 1 — PromptAgent

**PromptAgent** is a *versioned*, portal-configured agent living inside Foundry. Instructions, model, tools, and knowledge sources are configured on the service.

```python
from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant",
    agent_version="1.0",           # PromptAgent is versioned
    credential=AzureCliCredential(),
)

result = await agent.run("What is Foundry IQ?")
```

**When to prefer PromptAgent:** you want the agent to be a *shipped artifact* your team can review, version, and deploy independently from app code.

---

## Foundry-hosted, flavor 2 — HostedAgent

**HostedAgent** is a Foundry-hosted agent without an explicit version number. Slightly simpler; still server-managed.

```python
from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant",
    # no agent_version
    credential=AzureCliCredential(),
)

result = await agent.run("What is Foundry IQ?")
```

**When to prefer HostedAgent:** you want a shared, server-hosted agent but versioning as a hard constraint isn't required for your scenario.

---

## Trade-offs at a glance

| Concern | Client-side | Foundry PromptAgent | Foundry HostedAgent |
|---------|:-----------:|:-------------------:|:-------------------:|
| Where the agent identity lives | In your code | In Foundry | In Foundry |
| Thread state | In-process | Server-managed | Server-managed |
| Versioning built in | You handle it | **Yes** | No |
| Shared across apps | Duplicate code | **Yes** | **Yes** |
| Iteration speed | Fast (redeploy your app) | Portal + deploy new version | Fastest for portal edits |
| Cost model | Per-token only | Per-token (+ any hosted tools) | Per-token (+ any hosted tools) |
| Portability off Foundry | High | Lower | Lower |
| Best for | Embedded / library / niche scenarios | Shared production agents that need version discipline | Shared agents where portal iteration wins |

---

## Decision guide (rough cuts)

- **Building a library or embedded assistant?** → Client-side.
- **One agent used by 3+ apps or teams?** → Foundry-hosted.
- **Regulated / auditable agent that needs immutable versions?** → PromptAgent.
- **Prototyping quickly with portal edits?** → HostedAgent.

You can and will mix — nothing stops you from having some client-side and some Foundry-hosted agents in the same app.

---

## Common gotchas

- **Confusing "PromptAgent" with "client-side."** PromptAgent is *hosted*. Client-side is the one that lives in your process. This trips people up because "prompt" sounds lightweight.
- **Assuming portability.** A PromptAgent's configuration is Foundry-specific. Design your app so runtime choice is behind an interface.
- **Mixing credentials.** All three use Azure identity — the differences are in *what* the credential authenticates *to* (your project endpoint, or a specific hosted agent).

---

## Same code, different destinations — local-first, cloud-agnostic

A MAF agent you write on your laptop is portable. The **hosting decision is separable from the agent code**.

- **Local dev on your laptop** — `uv run` from a terminal or F5 in VS Code. Fast iteration, no cloud round-trip for logic.
- **Same MAF code moves to** any of:
  - **Foundry Agent Service** — managed runtime; register as a PromptAgent or HostedAgent
  - **Azure Container Apps or AKS** — you own the container
  - **Azure Functions** — event-driven or HTTP triggers

**What this buys you:** you can prototype and evaluate on your laptop before you commit to a hosting decision. And you can change the hosting decision later without rewriting the agent.

**What it does *not* mean:** portability off Azure. Foundry-specific features (PromptAgent versioning, Foundry IQ, portal-managed connections) are Foundry-hosted-only.

---

## What you'll do in the lab

In today's lab you'll:
- **Part A** — build a **client-side agent** in your code
- **Part B** — connect to a **Foundry PromptAgent** you create in the portal
- **Part C (bonus)** — connect to a **Foundry HostedAgent**
- Compare responses, thread persistence, and where each configuration lives

Same model, three hosting styles. You'll feel the trade-offs.

---

## Takeaways

- Client-side agents live in **your process**; Foundry-hosted agents live in **Foundry**.
- Foundry-hosted has two flavors: **PromptAgent** (versioned) and **HostedAgent** (non-versioned).
- Pick based on **who owns lifecycle** and **who consumes the agent**, not the SDK.
- Vocabulary matters — use the exact terms Foundry and MAF use.

**Next:** we walk through the lab and get you into your dev environment.
