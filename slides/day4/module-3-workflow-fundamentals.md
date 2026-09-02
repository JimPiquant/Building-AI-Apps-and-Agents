---
title: MAF Workflows
subtitle: Executors, edges, events, and state — the graph primitives everything else builds on
eyebrow: DAY 4 · MODULE 3 · 55 MIN
tag: Day 4 · Module 3
deck: module-3-workflow-fundamentals.pptx
---

# Module 3 — MAF Workflows

## MAF Workflows
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: This module teaches the graph API (WorkflowBuilder) that every orchestration pattern from Module 2 is built on top of, plus human-in-the-loop and checkpointing. Module 2's patterns are templates; this module is what you reach for when no template fits — exactly the lab's Planner/Retriever/Critic revision loop. -->

- Every orchestration pattern from Module 2 is built on the same primitives: executors, edges, events, and state

## Executors: the processing units
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/executors -->
<!-- notes: An executor can be custom logic or an agent — Module 1's "workflow with agent executors" row on the intelligence spectrum. Handlers are type-annotated; the workflow validates the graph against those declared types. -->

- Executors receive typed messages, do work, and produce output messages or events
- Two kinds: 
  - Custom logic components
  - AI agents (Module 1's "workflow with agent executors")
- Each handler's type annotations declare what it can send and yield — the workflow validates the graph against these at build time
  - `WorkflowContext.send_message(...)` forwards to connected executors
  - `ctx.yield_output(...)` produces a workflow output

## A minimal executor
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/executors -->
<!-- notes: This is the framework's own minimal example. @handler methods must be type-annotated; the annotation on ctx (WorkflowContext[str]) declares the output type this handler can send. -->

```python
from agent_framework import Executor, WorkflowContext, handler

class UpperCase(Executor):
    @handler
    async def to_upper_case(self, text: str, ctx: WorkflowContext[str]) -> None:
        await ctx.send_message(text.upper())
```

## Edges: how messages flow
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: This is the framework's own edge-type table. Conditional edges are the mechanic that matters most today — they're the only way to route a message back to an earlier executor, which none of Module 2's prebuilt patterns support. -->

| Type | Description | Use case |
|---|---|---|
| Direct | Simple one-to-one connection | Linear pipelines |
| Conditional | Routes based on a condition function | Binary routing (if/else) |
| Switch-Case | Routes to different executors by condition | Multi-branch routing |
| Multi-Selection (Fan-out) | One executor sends to multiple targets | Parallel processing |
| Fan-in | Multiple executors send to one target | Aggregation |

## Conditional edges in code
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: This is the exact mechanic a custom revision loop (like the lab's Critic to Planner) is built from — a conditional edge back to an earlier executor. No prebuilt orchestration pattern from Module 2 supports this; Sequential is strictly forward-only. -->

```python
builder = WorkflowBuilder(start_executor=planner)
builder.add_edge(planner, retriever)
builder.add_edge(retriever, critic)

# Loop back to the planner when the critic isn't satisfied
builder.add_edge(critic, planner, condition=lambda result: not result.approved)
# ...and a separate edge to wherever the workflow's approved path continues
```

This is the mechanic behind any revision loop a prebuilt orchestration pattern can't express.

## Visualize the graph you just built
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/visualization -->
<!-- notes: A genuinely good live-demo moment for the lab's own Planner/Retriever/Critic graph — render it and show the room, including the conditional loop-back edge. No extra dependency for the text formats (Mermaid, DOT); pip install graphviz only for image export. -->

```python
from agent_framework import WorkflowViz

viz = WorkflowViz(workflow)

print(viz.to_mermaid())   # paste into any Mermaid renderer
print(viz.to_digraph())   # Graphviz DOT format
viz.save_svg("workflow.svg")
```

Conditional edges render as dashed arrows labeled "conditional" — the lab's Critic → Planner loop-back is visually obvious, not just implied by the code.

## DEMO 3.1 — Visualize the graph you're about to build yourself
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day4/module-3-demo-1-visualize-graph.md -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/visualization -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Graph-building code is copied (not imported) from labs/day4/python/solutions/part_b_graph.py, the worked answer to this afternoon's Part B1 exercise, with the Part B2 guardrail fix already applied so the optional live run is safe. -->

Render the same three-executor, conditional-loop graph attendees are about to build by hand this afternoon — Planner → Retriever → Critic, with a conditional edge back to the Planner when the Critic doesn't approve. Paste the printed Mermaid into mermaid.live live, then optionally run it for real on a question that usually needs a revision pass, so the loop-back edge fires in an actual trace, not just on the diagram.

## The superstep execution model
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution -->
<!-- notes: A modified Pregel model (Bulk Synchronous Parallel). This is why Concurrent's parallel agents actually run at the same time, and why checkpoints are reliable — they only need to capture state at these well-defined boundaries. -->

1. **Collect** — gather all pending messages from the previous superstep
2. **Route** — dispatch messages to target executors based on edges and conditions
3. **Execute** — run all target executors **concurrently** within this superstep
4. **Synchronize** — wait for every executor to finish (a barrier) before advancing
5. **Queue** — new messages emitted this superstep wait for the next one

## Why supersteps matter
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution -->
<!-- notes: Three concrete guarantees the BSP model buys you. The fan-out caveat is worth stating: a long-running branch blocks the whole superstep from advancing, even if a parallel branch finished quickly — consolidate sequential steps into one executor if you need truly independent timing. -->

- **Deterministic execution** — the same input always executes in the same order
- **Reliable checkpointing** — state can be saved at superstep boundaries with no ambiguity
- **Simpler reasoning** — no race conditions between supersteps; every executor sees a consistent view

**Caveat**: the barrier means one slow executor blocks the whole superstep — consolidate sequential logic into one executor if independent branches need independent timing

## Events give you observability
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/events -->
<!-- notes: Every workflow event uses a unified WorkflowEvent class with a type discriminator in Python. request_info is the human-in-the-loop hook covered next. Custom events (WorkflowEvent(type=..., data=...)) let executors emit domain-specific signals. -->

| Event type | Meaning |
|---|---|
| `output` / `intermediate` | Terminal vs. observational workflow output |
| `executor_invoked` / `executor_completed` / `executor_failed` | Per-executor lifecycle |
| `superstep_started` / `superstep_completed` | Superstep boundaries |
| `request_info` | An executor is requesting external input (human-in-the-loop) |

## Debugging with edge delivery status
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/observability -->
<!-- notes: Distinct from the WorkflowEvent stream on the previous slide — this is OpenTelemetry span-based tracing (workflow.build, workflow.run, executor.process, edge_group.process, message.send) for external tools like Aspire Dashboard or Application Insights, not something you consume programmatically in your own workflow code. edge_group.delivery_status is the practical payoff for today's lab: it tells you exactly why a message didn't arrive — including a conditional edge whose condition evaluated false. -->

| `edge_group.delivery_status` | Meaning |
|---|---|
| `delivered` | Message reached the target executor |
| `dropped condition false` | A conditional edge's condition evaluated false |
| `dropped type mismatch` | Target executor can't handle this message type |
| `buffered` | Waiting on more messages to arrive for a fan-in |

Every edge decision in the graph — including the lab's own Critic → Planner condition — shows up here, on a span you can inspect with the same OpenTelemetry tooling from Day 3's observability content.

## State: access and share common data
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/state -->
<!-- notes: This is the mechanism Module 4 builds its "per-agent vs. shared memory" content on top of. State isolation matters: reusing one workflow-builder/executor instance across unrelated runs leaks state between them — wrap construction in a helper function so each run gets fresh instances. -->

- `ctx.set_state(key, value)` / `ctx.get_state(key)` — state that is available to downstream executors
- Use a consistent key across executors to exchange state that isn't a direct message
- Writes are visible to the writer immediately; other executors see them starting the **next** superstep
- **Isolation risk**: reusing one workflow/executor instance across unrelated runs leaks state between them
  - Build fresh instances per run

## Human-in-the-loop: request and response
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop -->
<!-- notes: ctx.request_info() pauses the workflow and emits a request_info event; the framework routes the eventual response back to the same executor's @response_handler automatically, matched by request/response type annotations. -->

- `ctx.request_info(request_data=..., response_type=...)` pauses the workflow and emits a `request_info` event
- Handle the response with a `@response_handler` method — the framework matches responses to handlers by type annotation
- This is the exact mechanism a human reviewer, an approval system, or any external system plugs into
- Same request/response channel — different payload — is how tool approval works inside a workflow

## Tool approval reuses the same channel
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop -->
<!-- notes: This is the multi-agent-workflow version of Day 3's single-agent approval_mode — same underlying request/response mechanism, now surfacing through a workflow's event stream instead of a single agent.run() loop. -->

```python
@tool(approval_mode="always_require")
def execute_database_query(query: str) -> str:
    return f"Query executed successfully: {query}"

# The workflow pauses and emits a request_info event carrying a
# function_approval_request payload when the agent tries to call it
async for event in stream:
    if event.type == "request_info" and event.data.type == "function_approval_request":
        responses[event.request_id] = event.data.to_function_approval_response(approved=True)
```

## Checkpoints: save and resume
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/checkpoints -->
<!-- notes: Created at the end of every superstep — this is exactly why the superstep model matters. A checkpoint captures everything needed to resume, including in-flight human-in-the-loop requests. -->

- A checkpoint is created:
  - At the start of the first **superstep**
  - At the end of **every superstep**, after all its executors finish
- Captures: executor state, pending messages for the next superstep, **pending requests and responses**, and shared state
- Pending human-in-the-loop requests are re-emitted as `request_info` events when you restore — you never lose an outstanding approval

Use cases: long-running workflows, pause/resume across process restarts, audit/compliance snapshots, migrating a run across environments

## A note on the functional API
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: Per this workshop's decision: teach WorkflowBuilder as primary; mention the functional API honestly, including its experimental status, and flag it as worth revisiting once it's no longer experimental. Do not build the lab on it. -->

- **`WorkflowBuilder` (today's focus)**
  - Explicit edges and conditions
  - Fixed graphs, fan-out/fan-in, type-validated routing
  - Available in Python, C#, and Go
- **`@workflow` — Python only, EXPERIMENTAL**
  - Native Python control flow: `if`, `while`, `asyncio.gather`
  - Could simplify a custom revision loop to a plain `while` — worth revisiting once it's no longer experimental
  - Not used for today's lab while it remains experimental

## Declarative workflows: describe what, not how
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/declarative?pivots=programming-language-python#overview -->
<!-- notes: Supersedes this deck's earlier one-slide "mention only, out of scope" stub — the workshop now teaches this content directly rather than just flagging its existence, matching the doc's own Overview section (key-benefit labels are verbatim). The required Parts A-C of today's lab stay WorkflowBuilder-based; an optional, provided-complete Part D was later added that loads a declarative YAML workflow via WorkflowFactory, for direct contrast. -->

- Declarative workflows define workflow logic in YAML instead of programmatic code — easier to read, modify, and share across teams
- You describe what the workflow should do, not how to implement it — the framework converts the YAML into an executable workflow graph
- Key benefits:
  - Readable — YAML syntax is easy to understand, even for non-developers
  - Portable — definitions can be shared, versioned, and modified without code changes
  - Rapid iteration — modify workflow behavior by editing configuration files
  - Consistent structure — predefined action types keep workflows following best practices

## When to use declarative vs. programmatic workflows
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/declarative?pivots=programming-language-python#when-to-use-declarative-vs-programmatic-workflows -->
<!-- notes: Verbatim table from the doc. The required Parts A-C of today's lab sit squarely in the Programmatic column ("integration with existing Python code," "complex custom logic") — worth naming explicitly when this table is on screen. The optional Part D is the Declarative counter-example. -->

| Scenario | Recommended Approach |
|---|---|
| Standard orchestration patterns | Declarative |
| Workflows that change frequently | Declarative |
| Non-developers need to modify workflows | Declarative |
| Complex custom logic | Programmatic |
| Maximum flexibility and control | Programmatic |
| Integration with existing Python code | Programmatic |

## Python YAML structure
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/declarative?pivots=programming-language-python#python-yaml-structure -->
<!-- notes: Verbatim skeleton from the doc's Python zone. The doc's own follow-on Structure Elements table (name/description/inputs/actions, required or not) is compressed into the one-line caption below rather than reproduced as a second table. -->

```yaml
name: my-workflow
description: A brief description of what this workflow does

inputs:
  parameterName:
    type: string
    description: Description of the parameter

actions:
  - kind: ActionType
    id: unique_action_id
    displayName: Human readable name
    # Action-specific properties
```

Only `name` and `actions` are required — `description` and `inputs` are optional, and `actions` is the ordered list of steps the workflow actually runs.

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop | https://learn.microsoft.com/en-us/agent-framework/workflows/checkpoints | https://learn.microsoft.com/en-us/agent-framework/workflows/visualization | https://learn.microsoft.com/en-us/agent-framework/workflows/observability | https://learn.microsoft.com/en-us/agent-framework/workflows/declarative -->
<!-- notes: Ask attendees to name the two building blocks a Critic-to-Planner revision loop needs. Answer: a conditional edge (this module) plus a counter in workflow state (also this module) — no prebuilt orchestration pattern from Module 2 supports the loop-back directly. -->

- You build executors from typed message handlers, and connect them with direct, conditional, switch-case, or fan-in/fan-out edges.
- Conditional edges are what a revision loop needs — no prebuilt orchestration pattern supports routing back to an earlier agent.
- The superstep (Pregel/BSP) model is why parallel execution is real, checkpointing is reliable, and execution is deterministic.
- Human-in-the-loop and tool approval share one request/response mechanism; checkpoints preserve pending requests across a restore.
- You can render any graph you build with `WorkflowViz`, and diagnose a silent edge with `edge_group.delivery_status` — both work on the lab's own conditional edge.
- `WorkflowBuilder` is today's lab tool; the functional `@workflow` API remains experimental and worth a second look later, while declarative YAML workflows — covered on the previous three slides — are a real production alternative once a graph settles into a standard, frequently-edited pattern.
