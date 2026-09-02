---
title: Agents vs. Workflows
subtitle: Choose who decides what happens next, then compose across boundaries
eyebrow: DAY 4 · MODULE 1 · 35 MIN
tag: Day 4 · Module 1
deck: module-1-agents-vs-workflows.pptx
---

# Module 1 — Agents vs. Workflows

## Agents vs. Workflows
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: Frame the whole day around one question: for each step in the process, who decides what happens next — the model or you? Agents decide at runtime; workflows decide at design time. -->

- For every step in your process, decide: does the model decide what happens next, or do you?

## Two philosophies, not two products
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: Agents and workflows are not competing frameworks — they are different points on the same spectrum, and most production systems combine both. -->

- **Agents decide**
  - The model picks which tool to call, whether to delegate, when to stop
  - Powerful for open-ended tasks where the right path depends on the conversation
- **Workflows decide**
  - You define the graph explicitly: steps, order, decision points
  - Essential when the process itself has rules

## The intelligence spectrum
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: This is the framework's own spectrum, reworded as a flow. Most real systems live in the middle: a workflow graph with some agent-executor steps and some deterministic ones. -->

1. **Single agent with tools** — the model decides every step; most flexible, least predictable
2. **Workflow with agent executors** — the graph controls the process; agents reason at specific steps
3. **Workflow with deterministic executors only** — no LLM at all; a traditional, fully predictable pipeline

## Choosing the right pattern
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: This table is the framework's own "who decides" decision framework, reproduced from the journey page. Use it to segue into the rest of the day: Module 2 covers row 2 in depth, Module 3 covers row 3, and the human-in-the-loop content extends row 3. -->

| Question | If the model decides | If you decide |
|---|---|---|
| Which subtask to tackle next? | Agents as tools | Workflows |
| Whether to involve another agent? | Agents as tools | Agents in workflows |
| When to ask a human? | Tool approval (reactive, per-tool) | Human-in-the-loop (explicit gates) |
| How to handle partial failure? | Retry logic in tool implementations | Checkpoints |

## When workflows earn their complexity
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: These are the framework doc's own motivating examples. The common thread: the structure of the process is known ahead of time and shouldn't be left to the model to figure out at runtime. -->

- A document-review pipeline where a draft must be written, reviewed, revised, and approved — in that order, every time
- A customer-onboarding flow: collect info, run a compliance check, provision accounts, send a welcome email — some steps parallel, some gated by human approval
- An analytics workflow that should resume from the last checkpoint after a failure, not start over

Prefer simpler patterns first — reach for workflows when order, gates, or resumability genuinely matter.

## Recap: agents as tools
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/agents-as-tools -->
<!-- notes: This is Day 2/3's composition pattern, recapped as the baseline before introducing A2A and workflows as the next two rungs. One agent calls another as a function tool — the framework handles the conversion. -->

- One agent (outer) calls another agent (inner) as if it were a regular function tool
- The outer agent decides *when* and *whether* to delegate — the same way it decides to call any tool
- The inner agent runs independently: its own instructions, tools, and model calls
- Limitation: the outer agent sees only the inner agent's final text response, not its reasoning or tool calls

This works well within one process, one team, one runtime. What about across a boundary?

## Crossing a boundary: Agent-to-Agent (A2A)
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/agent-to-agent -->
<!-- notes: A2A is an open protocol (a2a-protocol.org), not an Agent Framework invention. It's the answer to "what if the other agent isn't in my process, my team, or even my framework?" -->

- **Agent-to-Agent (A2A)** is an open protocol for agents to discover each other, exchange messages, and coordinate — over HTTP, in any language or framework
- Use it when you cross a boundary in-process composition can't handle:
  - **Service boundaries** — the other agent runs as its own microservice
  - **Team boundaries** — a partner team owns the agent; you don't have its code or model
  - **Organizational boundaries** — a third-party agent (document processing, legal review) needs a standard way to be discovered and called
  - **Independent evolution** — different release cycles, teams, or languages

If your agents share a process and a team, agents-as-tools is simpler — A2A adds value specifically at a boundary.

## Call a remote agent over A2A
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/agent-framework/integrations/by-component/agent-services/a2a -->
<!-- notes: A2AAgent wraps any A2A-compliant endpoint as a standard AIAgent — run() feels identical to a local agent. This ships in a separate, prerelease package (agent-framework-a2a, pip install --pre) — flag the maturity level honestly, same as any other prerelease API this week. -->

```python
from agent_framework.a2a import A2AAgent

async with A2AAgent(name="remote", url="https://a2a-agent.example.com") as agent:
    response = await agent.run("Hello!")
    print(response.messages[0].text)
```

`A2AAgent` ships in a separate, prerelease package: `pip install agent-framework-a2a --pre`.

## Wrap a workflow as an agent
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/agent-framework/workflows/as-agents -->
<!-- notes: workflow.as_agent(...) closes the loop: a multi-agent workflow, once built, is indistinguishable from a single agent to its caller — including other agents calling it as a tool, or A2A clients calling it remotely. -->

```python
workflow = SequentialBuilder(participants=[researcher, writer]).build()

# Wrap the whole workflow behind the standard agent interface
workflow_agent = workflow.as_agent(name="Content Pipeline Agent")

response = await workflow_agent.run("Write an article about AI trends")
```

A caller — another agent, an A2A client, your own code — can't tell it's talking to a workflow instead of a single agent.

## DEMO 1.1 — Wrap a workflow, call it like any other agent
<!-- layout: demo -->
<!-- demo-time: ~4 min -->
<!-- demo-reference: Runbook: demos/day4/module-1-demo-1-workflow-as-agent.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/03-workflows/agents/sequential_workflow_as_agent.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Step 1 runs the official sequential_workflow_as_agent.py sample as-is; Step 2 is a minimal, clearly-noted comparison script (with/without intermediate_output_from). -->

Run the official `sequential_workflow_as_agent.py` sample live: a two-agent writer→reviewer pipeline wrapped as an agent returns exactly one message, matching the previous slide's code. Then run a comparison script that builds the SAME workflow with and without `intermediate_output_from=[writer]` — proving `.as_agent()` exposes only whatever output designation the workflow already had, nothing more.

## The composition circle
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: This closes Module 1's arc: from the lightest composition pattern, to crossing a boundary, to explicit orchestration, and back to looking like a single agent again. Module 2 picks up "workflows" in depth; Modules 3-6 build out the rest. -->

1. **Agents as tools** — compose in-process, model-driven delegation
2. **Agent-to-Agent (A2A)** — compose across a process/service/org boundary
3. **Workflows** — compose with an explicit, developer-defined graph (today's Modules 2-6)
4. **Workflows as agents** — wrap the whole graph back behind the standard agent interface

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows | https://learn.microsoft.com/agent-framework/journey/agent-to-agent -->
<!-- notes: Ask attendees which of today's four composition mechanics applies to the lab's Planner/Retriever/Critic workflow. Answer: workflows (explicit graph) for the core loop, with workflows-as-agents as the optional wrapping if the whole thing needs to be called from elsewhere. -->

- You decide, per step, whether the model or the code should control what happens next.
- You use agents as tools for in-process, model-driven delegation.
- You reach for A2A specifically when you cross a process, service, or organizational boundary.
- You build workflows when the process itself has rules: fixed order, human gates, or resumability.
- You can wrap any workflow behind the standard agent interface with `.as_agent()` — composition goes full circle.
