# Curriculum overview

## What you'll be able to do by the end
- Choose between the three ways to run an agent with Foundry — a **Prompt agent**, a **Hosted agent**, or your own code calling the **Responses API** — and know which fits which scenario.
- Build agents with the Microsoft Agent Framework in Python and C#.
- Ground agents on enterprise knowledge with Foundry IQ or your own RAG pipeline.
- Attach Toolbox tools, custom function tools, and MCP servers.
- Evaluate agents at retrieval, single-agent, and multi-agent layers.
- Coordinate multi-agent workflows and reason about cost, latency, and failure modes.
- Ship an agent to Azure with observability, identity, safety, and eval in production.

## The mental model we use all week

We refer to a five-layer stack every day:

1. **Model** — a model deployed in your Foundry project.
2. **Runtime** — where the agent runs. Three options with Foundry: a **Prompt agent** (portal-authored, no code, Foundry runs it), a **Hosted agent** (your code packaged as a container, Foundry runs it), or **your own code calling the Responses API** (your process runs your code; Foundry serves models and tools).
3. **Actions** — how the agent *does* things: Foundry Toolbox tools, MCP servers, and custom function tools.
4. **Knowledge** — how the agent *knows* things: Foundry IQ knowledge sources, or your own RAG on AI Search / a vector store.
5. **Ops** — identity, tracing, evaluation, cost, deployment.

Each day maps onto this stack:
- **Day 1** — Model + Runtime (both flavors) + a taste of Actions and Knowledge.
- **Day 2** — Knowledge and Actions in depth.
- **Day 3** — Runtime deep dive (memory, streaming, structured outputs, MCP).
- **Day 4** — Multiple agents working together, and how to evaluate them.
- **Day 5** — Ops.

## Reference domain
Every day builds on the same reference project: a **technical documentation assistant**. It's intentionally general-purpose so what you learn transfers to any real production scenario. Days 3–4 introduce real integrations (Azure DevOps work items via the official Azure DevOps MCP server) so the pattern is production-shaped by the end of the week.

## Out of scope
The following are intentionally **not covered**:
- **Copilot Studio** — low-code / maker audience; different tool, different persona.
- **Semantic Kernel** — MAF is Microsoft's forward direction for agent development.
- **AutoGen** — research-lineage predecessor to MAF.

## Post-workshop capstone
The workshop ends with a **capstone project** (solo or teams of 2–3, ~4–6 weeks) reviewed 1:1 with the instructor. See the Day 5 materials for the required-elements checklist and charter template.
