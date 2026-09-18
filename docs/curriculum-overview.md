# Curriculum overview

## What you'll be able to do by the end
- Choose between the three ways to run an agent with Foundry — a **Prompt agent**, a **Hosted agent**, or your own code calling the **Responses API** — and know which fits which scenario.
- Build agents with the Microsoft Agent Framework in Python and C#.
- Ground agents on enterprise knowledge with Foundry IQ or your own RAG pipeline.
- Attach Toolbox tools, custom function tools, and MCP servers.
- Evaluate agents at retrieval, single-agent, and multi-agent layers.
- Coordinate multi-agent workflows and reason about cost, latency, and failure modes.
- Assess agent production readiness: observability, identity, safety, cost controls, and continuous evaluation.

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
- **Day 5** — Ops, Foundry Toolkit for VS Code, and capstone scoping. See the [approved Day 5 plan](day5-plan.md), [slide sources](../slides/day5/), and [attendee materials](../labs/day5/). Deployment-target comparisons and deployment exercises are not part of Day 5; Day 1's hosting material remains part of the workshop.

## Reference domain
Every day builds on the same reference project: a **technical documentation assistant**. It's intentionally general-purpose so what you learn transfers to any real production scenario. Day 3 introduces a real integration (Azure DevOps work items via the official Azure DevOps MCP server) so the pattern is production-shaped by the end of the week.

## Out of scope
The following are intentionally **not covered**:
- **Copilot Studio** — low-code / maker audience; different tool, different persona.
- **Semantic Kernel** — MAF is Microsoft's forward direction for agent development.
- **AutoGen** — research-lineage predecessor to MAF.

## Post-workshop capstone
The workshop ends with a **capstone project** (teams of 2–3, no solo path, ~2–3 weeks). It closes with a shared demo day — all teams present live (~15 min per team: demo, Q&A, and coaching) — rather than separate 1:1 reviews, though ad-hoc 1:1 follow-up remains available on request. Kickoff is September 21, 2026; the demo-day date is TBD. The [Day 5 plan](day5-plan.md#capstone-deliverables) defines the requirements, and the [Day 5 attendee materials](../labs/day5/) provide the working templates and evidence pack.
