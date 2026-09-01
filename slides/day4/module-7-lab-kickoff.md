---
title: Day 4 Lab Kickoff
subtitle: Three parts, one scenario — workflow basics, then orchestrations, then evaluation
eyebrow: DAY 4 · MODULE 7 · 25 MIN
tag: Day 4 · Module 7
deck: module-7-lab-kickoff.pptx
---

# Module 7 — Day 4 Lab Kickoff

## Day 4 Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This lab composes every module from today: workflow primitives (3), orchestration patterns (2), memory contracts (4), and a trajectory evaluation with a cost metric (5), plus the guardrail from Module 6 — now a required deliverable, not a stretch goal. Note for presenters: the lab's own part order (basics, then orchestrations, then eval) deliberately runs opposite to today's lecture order (orchestration patterns in Module 2, before workflow fundamentals in Module 3) — build it by hand first, then appreciate the shortcut, is the lab's own teaching sequence. -->

- Turn the Day 3 single agent into a multi-agent research workflow — three parts, escalating sophistication, one shared evaluation

## What you'll build
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: Same Planner/Retriever/Critic roles across all three parts — the roles don't change, only what runs them does. The Summarizer role from an earlier draft was folded into the Critic to keep this lab digestible — the Critic both judges and produces the final answer. -->

- The **same three roles** — Planner, Retriever, Critic:
  - **Part A** — a raw `WorkflowBuilder` graph, by hand, no loop
  - **Part B** — the SAME roles, three ways: `SequentialBuilder`'s shortcut, a custom graph with a revision loop, `GroupChatBuilder`'s alternative fix
  - **Part C** — the golden set against all three of Part B's constructions
- **Optional stretch** — a Ticket agent that files a real Azure DevOps work item (Day 3's MCP path) when the Critic flags a documentation gap
- Part C runs the **same golden set** against every construction from Part B — same questions, one comparison table

## Part A — Workflow basics
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/executors -->
<!-- notes: This is deliberately NOT SequentialBuilder — that's Part B's shortcut. Part A wires the same three roles by hand with WorkflowBuilder + add_edge, straight-line, no conditional edges, so the graph primitives are visible before the prebuilt templates hide them. output_from is the one detail worth dwelling on: every AgentExecutor yields its own response as output by default, so without output_from=[critic] this 3-executor graph would produce three outputs, not one. -->

- Wrap Planner, Retriever, Critic in `AgentExecutor`; wire them straight-line with `WorkflowBuilder` + `add_edge` — no loop, no conditional edges yet
- `output_from=[critic]` designates the Critic's response as the ONE workflow output — without it, all three executors' responses would count
- Run it once on a single question; visualize the graph with `WorkflowViz(workflow).to_mermaid()` (Module 3's own visualization tooling)
- No golden set here — that's Part C's job. Part A is purely "how is a workflow actually built"

## Part B — Orchestrations
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/sequential | https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: Construction #1 (Sequential) is the shortcut for exactly what Part A built by hand — same limitation, one line of code. Construction #2 fixes it. Rebuilding with a custom WorkflowBuilder graph is a genuine rewrite of the orchestration plumbing, not a small diff on construction #1's code — set that expectation directly with attendees. -->

```python
# Construction #1 — the shortcut for Part A's graph
SequentialBuilder(participants=[planner, retriever, critic]).build()

# Construction #2 — fixes its limitation
builder = WorkflowBuilder(start_executor=planner)
builder.add_edge(planner, retriever)
builder.add_edge(retriever, critic)
builder.add_edge(critic, planner, condition=lambda result: not result.approved)
```

Same limitation as Part A: Sequential's Critic runs once, with nowhere to send a rejected verdict. Construction #2 fixes it with a conditional loop back to the Planner.

## Part B — Group Chat, a second fix
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/group-chat -->
<!-- notes: GroupChatBuilder's orchestrator_agent parameter is a real Agent, not a plain function — it decides who speaks next by reading the shared conversation, not by evaluating a Python condition. Participants here are plain Agent instances, not AgentExecutor-wrapped like construction #2 — confirmed against the framework's own Group Chat tutorial and Python sample. This is a genuine third implementation, not a one-line pattern swap. -->

1. **Rebuild** — same three roles as plain participants, now with `GroupChatBuilder(participants=[...], orchestrator_agent=..., termination_condition=...)`
2. **Orchestrator decides, not Python** — an LLM agent reads the shared conversation and picks who speaks next; no condition function to write
3. **Context Synchronization does the work `revision_gate` had to do manually** — the Planner already sees the Critic's rejection when re-selected, because the conversation is shared
4. **The guardrail lives in `termination_condition`** — GroupChatBuilder gives you exactly one hook to control termination, not a graph of edges to route through

## Part B's guardrail is required for both fixes
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Unlike AgentLoopMiddleware's built-in max_iterations, neither construction #2's conditional edge nor construction #3's orchestrator has an automatic cap — both loops can genuinely run forever if the model never approves. This is a correctness requirement for BOTH constructions, not a stretch goal, and it's the concrete reason Day 5's "budget guardrails revisited" module has something real to point back at. -->

- Neither a conditional edge nor an LLM orchestrator has a **built-in `max_iterations`** — unlike `AgentLoopMiddleware`'s single-agent loop, nothing stops either loop automatically
- Construction #2: a counter in workflow state (`ctx.set_state`/`get_state`), checked by a small executor since condition functions never get `ctx`
- Construction #3: `termination_condition` itself is the guardrail — a message-count cap alongside the "Critic approved" check, in one function
- **Prove both fail safely** — a bounded, graceful stop, not an unbounded token burn. This is Module 6's advice, applied to the two loops this lab can actually trigger

## Part C — Evaluate and compare
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Part C builds nothing new — it imports Part B's three build_workflow_*() functions directly. This is where Module 5's evaluation anchor actually lives in the lab, instead of being smeared across every part. -->

- Imports Part B's three `build_workflow_*()` functions directly — no new orchestration code
- Runs the SAME golden-set slice against **all three constructions**: Sequential, custom graph, Group Chat
- Reports a comparison table: approved rate for each, plus guardrail-trip rate for construction #2 specifically (construction #3's guardrail has no distinct signal from a plain rejection)
- **Reflect** — which approach fit best, and why — write it down, it's part of Done

## Build one golden set, use it for Part C
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Same discipline as Day 3 Part E, at workflow scale — Module 5's own framing. Building it once and reusing it for Part C's comparison is what makes the progression meaningful instead of three disconnected exercises. Part A and Part B's own demos use one hand-picked question each, not the golden set — the golden set's job is Part C's statistical comparison. -->

- ~15 realistic questions, each with expected citations/answers as ground truth
- Cover the real branches: a question that grounds cleanly on the first pass, one that needs the Critic's revision loop, and a general-knowledge question needing no retrieval at all
- Build it once, before Part C — every construction runs against the exact same set, so the comparison means something

## Run the trajectory evaluation
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: The lab's own definition of what to measure, straight from the locked spec — plan quality, retrieval recall, and BOTH of the Critic's decisions (the reject-and-loop call and the final Answer), not just the final output. This lab's actual implemented scope stops at approved/rejected/guardrail-tripped counting — cost-per-outcome and an LLM-judged trajectory score are named here as what a fuller harness would add, flagged explicitly as not implemented, not silently assumed. -->

- **Plan quality** — did the Planner's decomposition make sense for the question?
- **Retrieval recall** — did the Retriever actually find the right grounding?
- **Critic accuracy** — both decisions: the reject-and-loop call (constructions #2/#3 only — construction #1 never loops), *and* the final structured `Answer`
- **End-to-end task success** — did the whole workflow produce a usable answer? (this lab's actual implemented metric: approved / not approved / guardrail tripped)
- **Cost per successful outcome** — tokens summed across every agent, divided by successful cases (Module 5 names this; not implemented in this lab's Part C — a real extension, flagged rather than assumed)

## Prerequisites
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Mirrors Day 3 Module 9's prerequisites-card style. The ADO MCP path is only needed for the optional Ticket agent stretch, not the core lab. -->

1. **Day 3 lab complete** — a working single agent with memory, streaming, structured outputs, and MCP
2. **Bundled reference docs** — included in the repo (`labs/day4/python/data/docs/`); nothing to provision, no live knowledge base required
3. **A Foundry judge model deployment** — for cost/trajectory evaluation
4. **(Optional stretch only)** — Day 3's Azure DevOps MCP path, for the Ticket agent

## Definition of done
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation | https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Reworded for the workflow-basics/orchestrations/evaluate structure — the budget guardrail is a required deliverable for BOTH orchestration constructions in Part B, not a stretch goal. -->

| Area | Done when |
|---|---|
| Part A | The graph runs end-to-end and prints the Critic's verdict; the Mermaid diagram matches the graph |
| Part B | All three constructions run on the same hard question; constructions #2/#3 both recover from construction #1's limitation |
| Part B guardrail | Triggers cleanly in a stress test for BOTH constructions #2 and #3 — **required**, not stretch |
| Part C | Golden set runs against all three constructions; a comparison table reports approved rate side by side |
| Reflection | Which construction fit best, and why — committed to the repo |
| Stretch | Ticket agent files a real ADO work item when the Critic flags a gap |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Close the core Day 4 live time here. Learners have every primitive from Modules 1-6 before starting the lab. -->

- You build a workflow by hand before you use the prebuilt shortcut — Part A first, Part B second, deliberately in that order.
- You build the same three roles three different ways — Sequential, a custom graph, Group Chat — and watch the same limitation get fixed two different ways.
- You measure every construction against the same golden set in one dedicated evaluation pass, so the differences you see are real, not noise.
- You build the guardrail Module 6 argued for — required for both fixes, because nothing else bounds either loop.
