---
marp: true
paginate: true
---

# Module 1 — Azure AI Landscape
### Where MAF, Foundry, and Copilot Studio fit

Day 1 · 25 minutes

---

## Why this module

By the end of the workshop you'll be building agents. Before you write a line of code, you need to know **which surface to build on** — and when.

Today's decisions have outsized impact on cost, control, and portability.

---

## Three surfaces you can build on

| Surface | Audience | Sweet spot |
|--------|----------|------------|
| **Copilot Studio** | Makers, business analysts | Low-code agents for M365, Teams, and Power Platform |
| **Microsoft Foundry** | Developers | Full model + agent platform on Azure |
| **Microsoft Agent Framework (MAF)** | Developers | The SDK your app code uses to build agents on top of Foundry (and other providers) |

Copilot Studio and Foundry can be complementary. This workshop focuses on **Foundry + MAF**.

---

## A one-line decision framework

- **Copilot Studio** — when the *maker* is the audience and the destination is Microsoft 365 / Teams. Not covered further in this workshop.
- **Foundry alone** — when you want to build, deploy, and share an agent from a portal with minimal code.
- **Foundry + MAF** — when you're writing production code and want to control agent construction, orchestration, tools, and evaluation.

We assume **Foundry + MAF** from Module 2 forward.

---

## What Foundry gives you

- Model deployments (frontier and open models)
- Playgrounds
- Foundry Agent Service — server-hosted agents (**PromptAgent**, **HostedAgent**)
- **Foundry Toolbox** — a curated tool/connector catalog (exposed via MCP)
- **Foundry IQ** — enterprise knowledge and grounding layer
- Evaluators, tracing, and safety

---

## What MAF gives you

- One SDK for authoring agents — Python and C#
- One vocabulary for **agents**, **threads**, **tools**, **runs**
- First-class support for streaming, memory, structured outputs
- Multi-agent orchestration primitives
- Consumes Foundry Toolbox and MCP servers
- The successor to **Semantic Kernel** and **AutoGen** patterns (both out of scope here)

---

## What we will and won't cover

**Covered:** Foundry, MAF, Toolbox, Foundry IQ, MCP, evaluation, production concerns.

**Explicitly out of scope:**
- Copilot Studio (different audience)
- Semantic Kernel (MAF is the forward direction)
- AutoGen (research-lineage predecessor to MAF)
- Third-party frameworks (LangChain, CrewAI, etc.)

If you need any of those, the workshop coordinator can point you to separate content.

---

## Roadmap: how the week hangs together

- **Day 1** — the stack, both agent hosting styles, first working agents
- **Day 2** — grounding (Foundry IQ, custom RAG) and tools in depth
- **Day 3** — single-agent depth: memory, streaming, structured outputs, MCP
- **Day 4** — multi-agent patterns + evaluation as a first-class activity
- **Day 5** — production: observability, security, cost, deployment; capstone kickoff

Every day extends the same reference project — a **technical documentation assistant**.

---

## Takeaways

- The three surfaces (Copilot Studio, Foundry, MAF) target different audiences and problems.
- This workshop lives at **Foundry + MAF**.
- MAF is Microsoft's forward direction for agent SDKs; SK and AutoGen are not.

**Next:** a working tour of the Foundry portal — projects, models, deployments, Toolbox, and Foundry IQ.
