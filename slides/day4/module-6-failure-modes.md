---
title: Multi-Agent Failure Modes & Mitigations
subtitle: Bound the loop, watch the cost, and catch drift before it reaches production
eyebrow: DAY 4 · MODULE 6 · 20 MIN
tag: Day 4 · Module 6
deck: module-6-failure-modes.pptx
---

# Module 6 — Multi-Agent Failure Modes & Mitigations

## Multi-Agent Failure Modes & Mitigations
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Four failure categories, each with a concrete mitigation already introduced elsewhere today. This module's job is to name the failure clearly and point back at the mechanism that bounds it. -->

- More agents means more places a run can go wrong, quietly, before anyone notices

## Infinite loops
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: The framework's own words, quoted directly: "Always bound autonomous loops. A completion condition can fail, a model can stall, and an evaluator can be probabilistic." AgentLoopMiddleware re-invokes ONE agent until a completion condition is met — distinct from the lab's Critic-to-Planner loop, which is a workflow-graph loop-back between two different executors, covered next. -->

- Framework's own warning, verbatim: *"Always bound autonomous loops. A completion condition can fail, a model can stall, and an evaluator can be probabilistic."*
- `AgentLoopMiddleware(predicate, max_iterations=N)` bounds a **single agent** re-invoking itself until a completion condition is met (default max: 10 runs)
- `AgentLoopMiddleware.with_judge(judge_client, criteria=[...], max_iterations=N)` is a judge-driven variant — structurally the closest built-in primitive to the lab's own Critic role (default max: 5 iterations)

## Bounding a workflow-level loop
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping | https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/state -->
<!-- notes: This is the distinction to land clearly: AgentLoopMiddleware only bounds one agent looping on itself. A conditional edge routing between two different executors (Module 3's Critic-to-Planner example) has no automatic iteration cap — you build one, using workflow state. -->

- **Single-agent loop** (`AgentLoopMiddleware`)
  - One agent, re-invoked on itself
  - `max_iterations` is built in
- **Workflow-graph loop-back** (Module 3's conditional edge)
  - Two different executors — e.g., Critic routing back to Planner
  - No automatic cap — track your own counter in workflow state, check it in the condition function

## Tool storms
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: "Tool storm" is this workshop's own descriptive term for excessive/redundant tool calls, not verbatim framework vocabulary — flag that honestly. The detection mechanism (Tool Selection, Tool Call Accuracy) is real and grounded from Module 5. -->

- **Tool storm** (this workshop's term, not framework vocabulary): an agent makes many more tool calls than the task needs — redundant lookups, retried calls that already succeeded, tool-calling in a loop with no progress
- Module 5's **Tool Selection** evaluator catches unnecessary tool calls directly; **Tool Call Accuracy** catches redundancy in the calls that were made
- A workflow multiplies this risk — a tool storm inside any one agent's turn also inflates every downstream cost metric

## Cost blowouts
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/observability | https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/magentic -->
<!-- notes: Ties directly to Module 5's cost-per-successful-outcome metric and Module 2's Magentic guardrail parameters — this module is where those two get framed explicitly as a failure mode + mitigation pair. -->

- The framework's own token-usage telemetry (`gen_ai.client.token.usage`, `gen_ai.usage.input_tokens`/`output_tokens`) is your detection signal — watch it per agent, not just for the workflow as a whole
- Magentic's `max_round_count`, `max_stall_count`, and `max_reset_count` (Module 2) are a real, shipped example of a **built-in** cost guardrail — not every pattern has one this explicit
- For a custom graph, the mitigation is the same as for infinite loops: a bounded counter, checked before the next round starts

## Quality drift
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: "Quality drift" is also this workshop's own term for a golden-set pass rate degrading run over run or after a change — flag that honestly, same as tool storm. The detection mechanism (num_repetitions, eval-change-re-eval loop) is Module 5's, real and grounded. -->

- **Quality drift** (this workshop's term): a golden-set pass rate that degrades over time, or after a change that looked unrelated
- Detection is Module 5's own discipline: `num_repetitions` for run-to-run variance, and the eval → change → re-eval loop for change-induced drift
- The earlier a drift shows up in your regression harness, the cheaper it is to fix — this is the argument for running the loop on every change, not just before a release

## Guardrails, by failure mode
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping | https://learn.microsoft.com/en-us/agent-framework/agents/observability | https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: This summary table is this workshop's own synthesis of the mechanisms above — not a single verbatim framework table. Use it as the module's closing reference slide. -->

| Failure mode | Detect with | Mitigate with |
|---|---|---|
| Infinite loop (one agent) | Iteration count keeps climbing | `AgentLoopMiddleware`/`.with_judge(...)`, `max_iterations` |
| Infinite loop (workflow graph) | Same executor keeps re-entering | Your own counter in workflow state, checked in the condition |
| Tool storm | Tool Selection / Tool Call Accuracy fail | Tighter tool descriptions; narrower instructions |
| Cost blowout | `gen_ai.client.token.usage` spikes | Built-in orchestration caps (Magentic) or your own budget check |
| Quality drift | Falling pass rate across repetitions or changes | `num_repetitions`; eval → change → re-eval on every change |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Ask attendees to name the guardrail their own lab workflow needs before they'd trust it in production. Expected answer: a bounded counter on the Critic-to-Planner loop, since that's the one failure mode this exact lab can trigger on its own. -->

- Every autonomous loop needs an explicit bound — the framework says this outright, and means it.
- A single agent looping on itself and a workflow graph looping between executors are bounded differently — know which one you're building.
- "Tool storm" and "quality drift" are this workshop's own names for real problems; the detection tools (Tool Selection, `num_repetitions`, token-usage metrics) are the framework's.
- The cheapest time to catch a regression is the next change after it was introduced — that's what a regression harness is for.
