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

## Same three ingredients across every surface

No matter which surface you pick, an agent needs the same three things:

- **A model** — a deployed language model
- **Instructions** — how the agent should behave
- **Tools** — the things it can do beyond talking

What changes across surfaces is **how much code you write** and **who owns the runtime**.

---

## A decision framework, visualized — control vs. ease of use

The three surfaces sit on a familiar spectrum:

| Bucket | Surface | Trade-off |
|---|---|---|
| **IaaS** (most control, most code) | Containers + OSS frameworks | You own everything. Not covered further. |
| **PaaS** (managed platform) | **Foundry Agent Service + MAF** | Managed runtime, you own agent code and behavior. **This workshop.** |
| **SaaS** (least code, most opinionated) | Copilot Studio | Portal-first, low-code, targets M365 / Teams. Not covered further. |

We live in PaaS territory. When we say "the SDK is Python or C#," that's the P in PaaS talking — you write real code, but you don't run the infrastructure.

---

## When is an agent the right answer?

Not every LLM problem needs an agent. Match complexity to need:

- **Direct LLM call** — one-shot, narrow scope. Example: *"summarize this doc."* No tools, no iteration, no memory beyond the prompt.
- **Single agent with tools** — iterative, scoped, needs to *do* something. Example: *"answer this question with sources; open a ticket if needed."* Days 1–3.
- **Multi-agent workflow** — a task decomposes into distinct roles that hand off. Example: *"plan → retrieve → verify → act."* Day 4.

Rule of thumb: **reach for the leftmost pattern that actually solves the problem.** Agents cost more per turn, are harder to evaluate, and fail in more interesting ways than a plain LLM call.

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
