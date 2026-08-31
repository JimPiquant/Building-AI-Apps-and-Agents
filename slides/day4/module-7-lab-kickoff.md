---
title: Day 4 Lab Kickoff
subtitle: Three parts, one scenario — start simple, then build up to a workflow you can evaluate and compare
eyebrow: DAY 4 · MODULE 7 · 25 MIN
tag: Day 4 · Module 7
deck: module-7-lab-kickoff.pptx
---

# Module 7 — Day 4 Lab Kickoff

## Day 4 Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This lab composes every module from today: orchestration patterns (2), workflow primitives (3), memory contracts (4), and a trajectory evaluation with a cost metric (5), plus the guardrail from Module 6 — now a required deliverable, not a stretch goal. -->

- Turn the Day 3 single agent into a multi-agent research workflow — three parts, escalating sophistication, one shared evaluation

## What you'll build
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: Same Planner/Retriever/Critic roles across all three parts — the roles don't change, only the orchestration mechanism does. The Summarizer role from an earlier draft was folded into the Critic to keep this lab digestible — the Critic both judges and produces the final answer. -->

- The **same three roles** — Planner, Retriever, Critic — implemented three different ways:
  - **Part A** — `SequentialBuilder`, no correction
  - **Part B** — a custom `WorkflowBuilder` graph with a revision loop
  - **Part C** — `GroupChatBuilder`, an alternative to Part B's fix
- **Optional stretch** — a Ticket agent that files a real Azure DevOps work item (Day 3's MCP path) when the Critic flags a documentation gap
- All three parts run against the **same golden set** — same questions, escalating orchestration sophistication, a visible eval delta at each step

## Part A — Sequential (warm-up)
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/sequential -->
<!-- notes: This isn't filler — it's a live demonstration of the exact limitation Module 2's own takeaway already names ("Sequential cannot loop back"). The Critic here has no way to ask for another pass; that gap is what Part B exists to fix. -->

- Build Planner → Retriever → Critic with plain `SequentialBuilder` — the simplest orchestration pattern, no loop
- The Critic runs **once**: check passes → emit the `Answer`; check fails → the workflow just returns as-is, no correction
- Run it against the golden set and watch it fail on the questions that need a second pass — this is the limitation, live, not a slide bullet
- Sets up Part B: the fix for what you just watched break

## Part B — A custom graph fixes it
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: This is Module 3's conditional-edge primitive, applied to the exact gap Part A exposed. Rebuilding with WorkflowBuilder is a genuine rewrite of the orchestration plumbing, not a small diff on Part A's SequentialBuilder code — set that expectation directly with attendees. -->

```python
builder = WorkflowBuilder(start_executor=planner)
builder.add_edge(planner, retriever)
builder.add_edge(retriever, critic)

# The fix: route back to the planner when the critic isn't satisfied
builder.add_edge(critic, planner, condition=lambda result: not result.approved)
```

Rebuild Part A's three roles with `WorkflowBuilder` instead of `SequentialBuilder` — same roles, a genuinely different graph, not a small edit.

## Part B's guardrail is required, not optional
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Unlike AgentLoopMiddleware's built-in max_iterations, a custom conditional edge has no automatic cap — the Critic-to-Planner loop can genuinely run forever if the model never approves. This is a correctness requirement for Part B, not a stretch goal, and it's the concrete reason Day 5's "budget guardrails revisited" module has something real to point back at. -->

- A conditional edge has **no built-in `max_iterations`** — unlike `AgentLoopMiddleware`'s single-agent loop, nothing stops this loop automatically
- Add your own counter in workflow state (`ctx.set_state`/`get_state`), checked inside the condition function
- **Prove the workflow fails safely** under it — a bounded, graceful stop, not an unbounded token burn
- This is Module 6's advice, applied directly to the one loop this lab can actually trigger

## Part C — Swap to Group Chat
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/group-chat -->
<!-- notes: GroupChatBuilder's orchestrator_agent parameter is a real Agent, not a plain function — it can play the Critic's judging role directly. This is a genuine second implementation, not a one-line pattern swap, which is why the eval-change-re-eval discipline from Module 5 applies here for real: baseline from Part B, change to Part C, re-run, quantify. -->

1. **Rebuild** — same three roles, now with `GroupChatBuilder(participants=[...], orchestrator_agent=critic_orchestrator)`
2. **Baseline** — you already have Part B's trajectory eval scores and cost per successful outcome
3. **Re-run** — the same golden set, same evaluators, against Part C
4. **Quantify the delta** — did the pass rate change? Did cost per successful outcome change?
5. **Reflect** — which approach fit best, and why — write it down, it's part of Done

## Build one golden set, use it for all three parts
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Same discipline as Day 3 Part E, at workflow scale — Module 5's own framing. Building it once and reusing it across Parts A, B, and C is what makes the progression meaningful instead of three disconnected exercises. -->

- ~15 realistic questions, each with expected citations/answers as ground truth
- Cover the real branches: a question that grounds cleanly on the first pass, one that needs the Critic's revision loop, and a general-knowledge question needing no retrieval at all
- Build it once, before Part A — every part runs against the exact same set, so the eval deltas mean something

## Run the trajectory evaluation
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: The lab's own definition of what to measure, straight from the locked spec — plan quality, retrieval recall, and BOTH of the Critic's decisions (the reject-and-loop call and the final Answer), not just the final output. Run this same list against Parts A, B, and C. -->

- **Plan quality** — did the Planner's decomposition make sense for the question?
- **Retrieval recall** — did the Retriever actually find the right grounding?
- **Critic accuracy** — both decisions: the reject-and-loop call (Parts B/C only — Part A's Critic never loops), *and* the final structured `Answer`
- **End-to-end task success** — did the whole workflow produce a usable answer?
- **Cost per successful outcome** — tokens summed across every agent, divided by successful cases (Module 5)

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
<!-- notes: Reworded for the 3-part structure — same substance as the locked spec, but the budget guardrail is now a required Part B deliverable, not a stretch goal, per this session's design decision. -->

| Area | Done when |
|---|---|
| Part A | Runs end-to-end on the golden set; the "no correction" limitation shows up in at least one result |
| Part B | Revision loop works; trajectory eval scores and cost per successful outcome captured |
| Part B guardrail | Triggers cleanly in a stress test — **required**, not stretch |
| Part C | Rebuilt with Group Chat; same golden set re-run; delta vs. Part B quantified |
| Reflection | Which approach fit best, and why — committed to the repo |
| Stretch | Ticket agent files a real ADO work item when the Critic flags a gap |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Close the core Day 4 live time here. Learners have every primitive from Modules 1-6 before starting the lab. -->

- You build the same three roles three different ways — Sequential, a custom graph, Group Chat — and watch the same limitation get fixed, then compared against an alternative fix.
- You measure every part against the same golden set, so the differences you see are real, not noise.
- You build the guardrail Module 6 argued for — required here, because nothing else bounds this loop.
- You quantify the effect of a real change instead of assuming it helped.
