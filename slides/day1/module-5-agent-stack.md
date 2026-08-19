---
marp: true
paginate: true
---

# Module 5 — The Agent Stack
### The mental model we use

Day 1 · 35 minutes

---

## The five-layer stack

Every agent you build fits into these five layers:

1. **Model** — the deployed model
2. **Runtime** — where the agent lives (client-side vs. Foundry-hosted)
3. **Actions** — how it *does* things (tools, Toolbox, MCP)
4. **Knowledge** — how it *knows* things (Foundry IQ, RAG)
5. **Ops** — identity, tracing, evaluation, cost, deployment

Keep this five-word list in your head all week. Every module maps to at least one of these.

---

## Layer 1 — Model

Where it lives: your **Foundry project**, as a **model deployment**.

Decisions at this layer:
- Which model? (frontier vs. efficient, cost vs. capability)
- What deployment capacity? (tokens per minute)
- Which region?

We'll come back to model routing on Day 5 (small first, escalate on low confidence).

---

## Layer 2 — Runtime

Where the agent code and state run. Three options with Foundry:

- **Foundry-hosted · Prompt agent** — portal- or SDK-authored, *no code*, Foundry runs it. Zero infrastructure to manage.
- **Foundry-hosted · Hosted agent** — *your code* (MAF or other frameworks), packaged as a container or zip; Foundry runs the container with a managed endpoint, autoscale, dedicated Entra identity, and observability.
- **Self-hosted** — your MAF app runs in your process (laptop, Container Apps, App Service, AKS, Functions) and calls Foundry's Responses API for models and platform tools.

Module 6 walks both families in detail. Each has a sweet spot.

---

## Layer 3 — Actions

How the agent affects the world:

- **Function tools** — Python or C# functions you write, decorated for MAF
- **Foundry Toolbox** — curated tools exposed via an MCP endpoint (Bing, Fabric, SharePoint, code interpreter, …)
- **MCP servers** — the open protocol; MAF can consume any MCP server and you can author your own
- **Skills** — portable packages of instructions + reference material + optional scripts, with progressive disclosure

**Day 2** covers function tools and Toolbox. **Day 3** covers MCP end-to-end. **Skills** are awareness-only in this workshop — see the dedicated slide below.

---

## Layer 4 — Knowledge

How the agent grounds its answers:

- **Foundry IQ** — enterprise knowledge/grounding layer; unified retrieval across AI Search indexes, SharePoint, OneLake / Fabric
- **Custom RAG** — AI Search or a vector store you drive yourself, when you need control IQ doesn't yet give you

**Day 2** is a deep dive on both — including when to prefer one over the other.

---

## Layer 5 — Ops

The unglamorous layer that makes agents production-worthy:

- **Identity** — Entra, managed identity, RBAC
- **Tracing** — OTel spans of every model call, tool invocation, and decision; view in the Foundry portal or ship to App Insights
- **Evaluation** — retrieval, single-agent, multi-agent, and continuous eval
- **Cost & latency** — model tiers, caching, batching, routing
- **Deployment** — Container Apps vs. Functions vs. AKS

**Day 5** owns most of this — but **evaluation is threaded through every day**.

---

## Skills — packaging expertise for reuse

A **skill** is a portable package that bundles instructions, reference material, and optional scripts into a single unit that any agent can discover and load on demand.

|  | Tool | Skill |
|---|---|---|
| **What it provides** | A single callable action | Instructions + reference material + optional scripts |
| **How the agent uses it** | Calls it when it needs to act | Loads it when task matches; reads instructions; may call scripts |
| **Context cost** | Tool schema always in the prompt | Only name + description (~100 tokens) upfront; full content on demand |
| **Portability** | Tied to the agent that registers it | Self-contained package any compatible agent can discover |
| **Best for** | Individual actions (query a DB, send an email) | Domain expertise (expense policies, code review guidelines) |

**Rule of thumb:** tools are *verbs* (search, book, validate). Skills are *expertise* (travel booking knowledge, expense policy knowledge). Agents use tools **to act** and skills **to know how to act**.

*Grounded in [Learn — Adding Skills](https://learn.microsoft.com/agent-framework/journey/adding-skills).*

---

## Where each day lives on the stack

| Day | Model | Runtime | Actions | Knowledge | Ops |
|-----|:-----:|:-------:|:-------:|:---------:|:---:|
| 1 | ✓ | ✓ (both flavors) | tease | tease | — |
| 2 | ✓ | ✓ | **deep** | **deep** | eval |
| 3 | ✓ | **deep** | **deep (MCP)** | ✓ | eval |
| 4 | ✓ | **multi-agent** | ✓ | ✓ | **eval anchor** |
| 5 | routing | ✓ | ✓ | ✓ | **deep** |

Nothing appears in the workshop that doesn't fit here. If a topic feels orphaned, we've probably placed it wrong — tell us.

---

## Why this matters

Anyone who leaves with the stack in their head can:
- **Diagnose problems by layer.** "The agent isn't grounded" is a *Knowledge* problem, not a *Model* problem.
- **Estimate cost and risk.** Adding an MCP server is an *Actions* + *Ops* concern, not a model concern.
- **Communicate cleanly with stakeholders.** Product, ops, and security stakeholders all live at different layers.

Bring this back to your team as a shared vocabulary.

---

## Takeaways

- Five layers: **Model, Runtime, Actions, Knowledge, Ops.**
- Every day of the workshop, and every real agent you build, fits into these.
- When something breaks or costs too much, ask **which layer** first.

**Next:** Module 6 zooms into Layer 2 (Runtime) — the three hosting options you can pick, and when to pick which.
