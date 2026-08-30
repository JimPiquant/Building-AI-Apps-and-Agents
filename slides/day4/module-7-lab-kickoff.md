---
title: Day 4 Lab Kickoff
subtitle: Turn the Day 3 single agent into a multi-agent research workflow, then evaluate it
eyebrow: DAY 4 · MODULE 7 · 25 MIN
tag: Day 4 · Module 7
deck: module-7-lab-kickoff.pptx
---

# Module 7 — Day 4 Lab Kickoff

## Day 4 Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This lab composes every module from today: workflows and orchestration patterns (2-3), memory contracts between agents (4), and a trajectory evaluation with a cost metric (5), plus the guardrails from Module 6 as an explicit stretch goal. -->

- Turn the Day 3 single agent into a multi-agent research workflow, then evaluate it

## What you'll build
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: Three agents, matching the workshop's own locked lab spec. The Summarizer role that existed in an earlier draft was folded into the Critic to keep this lab digestible — the Critic both judges and produces the final answer. -->

- **Planner** — decomposes the user's question into sub-questions
- **Retriever** — grounds against the documentation knowledge source, returns citations
- **Critic** — checks groundedness, coverage, and safety; when the check passes, emits the final structured `Answer{summary, bullets, citations, confidence}`; when it fails, sends back for another pass (with a max-iteration budget)
- **Optional stretch** — a Ticket agent that files a real Azure DevOps work item (Day 3's MCP path) when the Critic flags a documentation gap

## The revision loop
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: This is the shape, not the final implementation choice — which specific building blocks (a custom graph, a prebuilt orchestration pattern, or some combination) construct this shape is still being finalized and isn't locked in this slide. -->

1. **Planner** decomposes the question
2. **Retriever** grounds each sub-question against the knowledge source
3. **Critic** checks groundedness, coverage, and safety
4. **Pass** → emit the final `Answer`; **fail** → route back to Planner for another pass, within a bounded budget

## Build a golden set
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Same discipline as Day 3 Part E, at workflow scale — Module 5's own framing. ~15 questions is enough to see a real pass-rate distribution across the workflow's real branches. -->

- ~15 realistic questions, each with expected citations/answers as ground truth
- Cover the real branches: a question that grounds cleanly on the first pass, one that should trigger the Critic's revision loop, and a general-knowledge question needing no retrieval at all

## Run the trajectory evaluation
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This is the lab's own definition of what to measure, straight from the locked spec — plan quality, retrieval recall, and BOTH of the Critic's decisions (the reject-and-loop call and the final Answer), not just the final output. -->

- **Plan quality** — did the Planner's decomposition make sense for the question?
- **Retrieval recall** — did the Retriever actually find the right grounding?
- **Critic accuracy** — both decisions: the reject-and-loop call, *and* the final structured `Answer`
- **End-to-end task success** — did the whole workflow produce a usable answer?
- **Cost per successful outcome** — tokens summed across every agent, divided by successful cases (Module 5)

## Change one thing, re-measure
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: This is Module 5's eval-change-re-eval discipline, applied to the lab's own required experiment: swap the orchestration pattern the workflow uses, then quantify what changed. -->

1. **Baseline** — run the golden set against your working workflow
2. **Change one thing** — e.g., swap the orchestration pattern the workflow uses
3. **Re-run** — the same golden set, same evaluators
4. **Quantify the delta** — did the trajectory pass rate change? Did cost per successful outcome change?
5. **Reflect** — which pattern fit best, and why — write it down, it's part of Done

## Guardrails to build in
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Direct callback to Module 6 — the Critic-to-Planner loop is exactly the workflow-graph loop-back that needs its own counter, since no built-in max_iterations applies to a conditional edge between two different executors. -->

- Stretch goal: add a budget guardrail (max tokens / max iterations) on the Critic → Planner loop
- Prove the workflow **fails safely** under it — a bounded, graceful stop, not an unbounded token burn
- This is Module 6's own advice applied directly: a workflow-graph loop-back has no automatic cap, so build one

## Prerequisites
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Mirrors Day 3 Module 9's prerequisites-card style. The ADO MCP path is only needed for the optional Ticket agent stretch, not the core lab. -->

1. **Day 3 lab complete** — a working single agent with memory, streaming, structured outputs, and MCP
2. **Foundry IQ knowledge source** — the same one your Day 2/3 docs assistant already grounds against
3. **A Foundry judge model deployment** — for cost/trajectory evaluation
4. **(Optional stretch only)** — Day 3's Azure DevOps MCP path, for the Ticket agent

## Definition of done
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Verbatim from the locked lab spec — behavioral criteria, not an arbitrary score, same discipline as every other day's Definition of Done. -->

| Area | Done when |
|---|---|
| Workflow | Completes on the golden set with end-to-end success at or above your own target threshold |
| Trajectory eval | Scores captured, pre- and post-change |
| Cost | Cost-per-successful-outcome recorded |
| Reflection | Which orchestration pattern fit best, and why — committed to the repo |
| Stretch | Budget guardrail triggers cleanly in a stress test |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Close the core Day 4 live time here. Learners have every primitive from Modules 1-6 before starting the lab. -->

- You compose today's primitives into one workflow: agents, a revision loop, memory contracts, and a trajectory evaluation.
- You measure the whole workflow's outcome and every step along the way — not just the final answer.
- You quantify the effect of a real change instead of assuming it helped.
- You build the guardrail Module 6 argued for, on the one loop this lab can actually trigger.
