---
title: Evaluating Multi-Agent Systems
subtitle: This week's evaluation anchor — trajectory, cost, and regression, not just a single response
eyebrow: DAY 4 · MODULE 5 · 45 MIN · EVALUATION ANCHOR
tag: Day 4 · Module 5
deck: module-5-evaluation.pptx
---

# Module 5 — Evaluating Multi-Agent Systems

## Evaluating Multi-Agent Systems
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This is Day 4's evaluation anchor — per Day 1's cross-day table and Day 2's "Where eval shows up" list, both already committed. Day 3 evaluated one agent's tool contract; today extends the same discipline to a chain of agents and the workflow's own final outcome. -->

- Day 3 evaluated one agent's tool contract. Today: the outcome of a chain of agents, and every step along the way.

## Two evaluation angles
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This is the Foundry agent-evaluators doc's own framing, reproduced directly. System evaluation applies to the main orchestrator or the final agent responsible for task completion in a multi-agent system; process evaluation applies to each step along the way. -->

- **System evaluation**
  - Examines the **end-to-end outcome** of the whole workflow
  - Applies to the orchestrator, or the final agent responsible for completion
- **Process evaluation**
  - Examines the **quality and efficiency of each step**
  - Focuses on the tool calls executed along the way

## System evaluation: the outcome
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This table is reproduced from the Foundry agent-evaluators doc, trimmed to the categories most relevant to a workflow-level check. All are (preview) except Task Navigation Efficiency, which is generally available and needs ground truth. -->

| Evaluator | Answers |
|---|---|
| Task Completion *(preview)* | Did the agent complete the requested task with a usable deliverable? |
| Task Adherence *(preview)* | Did the agent follow its assigned rules and constraints? |
| Task Navigation Efficiency | Did the agent take an efficient path, compared to a known-good sequence? |
| Intent Resolution *(preview)* | Did the agent correctly identify what the user actually wanted? |
| Customer Satisfaction *(preview)* | How satisfied would a user be, across helpfulness, clarity, resolution? |

## Task Navigation Efficiency in code
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This is the evaluator that directly generalizes Day 3's tool_calls_present/tool_call_args_match to a multi-step trajectory — it needs ground-truth expected_actions, same discipline as Day 3's ExpectedToolCall. exact_match requires the same order and content; in_order_match/any_order_match tolerate extra steps. -->

```python
{
    "type": "azure_ai_evaluator",
    "name": "task_navigation_efficiency",
    "evaluator_name": "builtin.task_navigation_efficiency",
    "initialization_parameters": {"matching_mode": "in_order_match"},
    "data_mapping": {
        "actions": "{{item.actions}}",
        "expected_actions": "{{item.expected_actions}}",
    },
}
```

`matching_mode` is `exact_match` (order and content), `in_order_match` (extra steps allowed, order preserved), or `any_order_match` (extra steps allowed, any order) — the same "extras OK" trade-off Day 3's `tool_calls_present` made for a single agent.

## Process evaluation: the steps
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: These are the same category Day 3 Module 7's "Available Foundry evaluators" table already listed under Tool usage — this module applies them across the whole multi-agent trajectory instead of one agent's calls. -->

| Evaluator | Answers |
|---|---|
| Tool Call Accuracy | Right tool calls, correct parameters, no redundancy? |
| Tool Selection | Correct and necessary tools chosen, nothing extra? |
| Tool Input Accuracy | Are all tool-call parameters correct — groundedness, type, format, required/unexpected? |
| Tool Output Utilization | Did the agent actually use the tool's result correctly downstream? |
| Tool Call Success | Did the tool calls succeed, or hit technical errors? |

## What "trajectory" means here
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Ground the abstract word "trajectory" concretely: it's the ordered list of actions (function_call content items) across every agent in the workflow, not just one agent's tool calls. This is the multi-agent extension of Day 3's single-agent tool contract. -->

- A **trajectory** is the ordered sequence of actions taken across the whole workflow — every agent's tool calls, in the order they happened
- For the lab: Planner's decomposition, Retriever's lookups, Critic's accept/loop decision, and (if triggered) the loop back through Planner again
- Task Navigation Efficiency's `actions` field is exactly this: a list of `function_call` messages, compared against a known-good `expected_actions` list

## Building a golden set for a workflow
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Extends Day 3 Part E's 3-case golden set to workflow scale. Matches the lab's own current golden_set.jsonl and README exactly (8 cases across 4 branches) — updated from an earlier ~15-question, 3-branch spec after the lab's restructure; evaluate.py's own comment explains the 8-case count (8 cases x 3 repetitions x 3 parts is already ~72 workflow runs). -->

- Same discipline as Day 3 Part E, at workflow scale: real queries, expected outcomes, not synthetic passes
- The lab's own golden set: 8 cases across 4 branches — small on purpose, since every case runs against all 3 parts × 3 repetitions (~72 workflow runs already)
- Cover the workflow's real branches: grounded (clean single-document lookup), revision (spans documents, needs a Critic-triggered loop), no_retrieval (general knowledge, no tools), and partial (the corpus answers half — naming the gap is correct, inventing the rest is a failure)

## Cost per successful outcome
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/observability -->
<!-- notes: This is what "cost per successful outcome" is actually computed from — OpenTelemetry GenAI semantic-convention metrics the framework already emits per model call, summed across every agent in the workflow, divided by the count of golden-set cases that passed. -->

- The framework emits `gen_ai.client.token.usage` (a histogram metric) and `gen_ai.usage.input_tokens`/`output_tokens` (span attributes) for every model call, automatically
- **Cost per successful outcome** = sum of tokens across every agent's model calls in a run, divided by the count of golden-set cases that actually passed
- A 3-agent workflow that succeeds cheaply beats a 3-agent workflow that succeeds expensively — this metric is how you tell them apart, not just pass/fail

## The eval → change → re-eval loop
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: This is the lab's own "introduce a small change (e.g., swap orchestration pattern), rerun the eval, quantify the delta" step, generalized into a repeatable discipline — this workshop's "regression harness" is this loop run consistently, not a separate named API. -->

1. **Baseline** — run the golden set, record trajectory pass rate and cost per successful outcome
2. **Change one thing** — e.g., swap an orchestration pattern, adjust an instruction, add a tool
3. **Re-run** — the same golden set, same evaluators
4. **Quantify the delta** — did the pass rate change? Did cost per successful outcome change?
5. **Repeat** — run this discipline every time the workflow changes, and it becomes your regression harness

## DEMO 5.1 — Trajectory, cost, and the eval → change → re-eval loop
<!-- layout: demo -->
<!-- demo-time: ~4 min -->
<!-- demo-reference: Runbook: demos/day4/module-5-demo-1-trajectory-and-cost.md -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Self-contained, deliberately small (a tiny 2-agent researcher -> writer workflow via SequentialBuilder, one local dict-backed tool) — same spirit as Day 3 Module 7's evaluation demo, not the full lab harness. -->

Run the SAME 2-agent workflow twice: BEFORE, the researcher's instructions are vague and it may skip its one tool — process eval and system eval both at risk of failing. AFTER, one sentence is added requiring the tool call — nothing else changes. Compare trajectory (process eval), the final answer (system eval), and total tokens (cost) across the two runs: this IS the loop the slide just named, run live.

## Repetitions still matter at workflow scale
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Direct extension of Day 3 Module 7's num_repetitions slide — multi-agent workflows have MORE nondeterminism sources than a single agent (every agent's own model call, plus the orchestrator's routing decisions), so this matters even more, not less. -->

- Every agent's model call is a fresh source of nondeterminism — a 3-agent workflow has three (or more) independent chances to vary
- `num_repetitions` still applies: run each golden-set case multiple times, observe the pass-rate distribution
- Don't invent a universal pass threshold — set acceptance criteria from your own risk tolerance and observed variance, same discipline as Day 3

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators | https://learn.microsoft.com/en-us/agent-framework/agents/observability -->
<!-- notes: Ask attendees which evaluator would catch a Planner that never assigns work to the Retriever at all. Answer: Task Navigation Efficiency (or Tool Selection at the process level) — not Task Completion, which only checks the final deliverable and could be fooled by a lucky final answer. -->

- You evaluate the workflow's end-to-end outcome (System evaluation) separately from the quality of each step (Process evaluation).
- Task Navigation Efficiency generalizes Day 3's `tool_calls_present`/`tool_call_args_match` to a full multi-agent trajectory.
- Cost per successful outcome comes from the framework's own token-usage telemetry, not a separate cost API.
- Your "regression harness" is the eval → change → re-eval loop, run consistently every time the workflow changes.
- Repetitions matter more, not less, with multiple agents — more model calls means more sources of variance.
