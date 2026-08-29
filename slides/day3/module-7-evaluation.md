---
title: Evaluation
subtitle: Combine fast local checks with cloud-based Foundry evaluators
eyebrow: DAY 3 · MODULE 7 · 20 MIN
tag: Day 3 · Module 7
deck: module-7-evaluation.pptx
---

# Module 7 — Evaluation

## Evaluation
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python -->
<!-- notes: This module covers the two Agent Framework evaluation providers — LocalEvaluator and FoundryEvals — then how to apply them to check exact tool use. -->

- Run fast local checks, cloud-based Foundry evaluators, or both in a single evaluation run

## Local checks and Foundry evaluators complement each other 
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/evaluation/microsoft-foundry?tabs=python -->
<!-- notes: Local checks are fast and deterministic. FoundryEvals uses the Foundry evaluation service and requires a project plus judge model deployment. A single run can include both providers and returns separate results. -->

- **Local Evaluators: LocalEvaluator**
  - No evaluator API call
  - Exact tool names and argument subsets
  - Fast inner loop and CI smoke tests
- **Microsoft Foundry Evalutators: FoundryEvals**
  - Cloud-based evaluation service
  - LLM-as-judge quality and agent behavior
  - Portal dashboards and comparisons

## Local evaluators: built-in checks
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python -->
<!-- notes: This is the framework's built-in LocalEvaluator check table, reproduced verbatim from the Local evaluators section. The next slide's Azure DevOps example uses tool_calls_present and tool_call_args_match; keyword_check and tool_called_check are shown here for completeness. -->

| Check | What it does |
|---|---|
| `keyword_check(*keywords)` | Response must contain all specified keywords |
| `tool_called_check(*tool_names)` | Agent must have called the specified tools |
| `tool_calls_present` | All `expected_tool_calls` names appear in the conversation (unordered, extras OK) |
| `tool_call_args_match` | Expected tool calls match on name and arguments (subset match on args) |

## Check tool name and arguments locally
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: tool_calls_present checks expected names. tool_call_args_match checks name and argument subset. The exact Azure DevOps consolidated tool name and action belong in the ground truth. -->

```python
expected = ExpectedToolCall(
    "wit_work_item",
    {"action": "get", "id": 42},
)

local = LocalEvaluator(
    tool_calls_present,
    tool_call_args_match,
)

results = await evaluate_agent(
    agent=agent,
    queries=["Get work item 42."],
    expected_tool_calls=[expected],
    evaluators=local,
)
```

## DEMO 7.1 — evaluate_agent catches a wrong tool call
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-7-demo-1-eval-catches-wrong-tool.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/evaluation/evaluate_with_expected.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs evaluate_with_expected.py as-is, with one seeded query the agent is known to mis-tool on. -->

Run the previous slide's exact `evaluate_agent` call against a seeded query the agent picks the wrong tool for: `tool_calls_present`/`tool_call_args_match` fail the check and print exactly which expectation didn't match — evaluation catching a real regression, not a synthetic pass.

## Custom evaluators wrap any function
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python#custom-function-evaluators-1 -->
<!-- notes: The @evaluator decorator wraps any function as an evaluator check. The function's parameter names determine what data it receives from the EvalItem — supported names are query, response, expected_output, expected_tool_calls, conversation, tools, and context. Return bool, float (>= 0.5 passes), a dict with a score or passed key, or CheckResult; async functions are handled automatically. -->

```python
from agent_framework import evaluator, LocalEvaluator

@evaluator
def is_concise(response: str) -> bool:
    """Check response is under 500 words."""
    return len(response.split()) < 500

@evaluator
def mentions_city(response: str, expected_output: str) -> bool:
    """Check response contains the expected city name."""
    return expected_output.lower() in response.lower()

@evaluator
def used_tools(conversation: list, tools: list) -> float:
    """Score based on tool usage. Returns 0.0–1.0 (>= 0.5 passes)."""
    tool_calls = [c for m in conversation for c in (m.contents or []) if c.type == "function_call"]
    return min(len(tool_calls) / max(len(tools), 1), 1.0)

local = LocalEvaluator(is_concise, mentions_city, used_tools)
```

## Foundry evaluators
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python#microsoft-foundry-evaluators -->
<!-- notes: Highlight relevant categories rather than all available evaluators. FoundryEvals automatically adds tool call accuracy when items contain tool definitions; explicit constants are also available. -->

```python
from agent_framework.foundry import FoundryEvals

evals = FoundryEvals(
    project_client=project_client,
    model="gpt-4o",
    evaluators=[FoundryEvals.RELEVANCE, FoundryEvals.COHERENCE],
)
```

FoundryEvals connects to Microsoft Foundry's evaluation service for cloud-based LLM-as-judge evaluation. Results are viewable in the Foundry portal with dashboards and comparison views.


## Available Foundry evaluators
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python#available-evaluators -->
<!-- notes: Highlight relevant categories rather than all available evaluators. FoundryEvals automatically adds tool call accuracy when items contain tool definitions; explicit constants are also available. -->

| Category | Evaluators |
|---|---|
| Agent behavior | `intent_resolution`, `task_adherence`, `task_completion`, `task_navigation_efficiency` |
| Tool usage | `tool_call_accuracy`, `tool_selection`, `tool_input_accuracy`, `tool_output_utilization`, `tool_call_success` |
| Quality | `coherence`, `fluency`, `relevance`, `groundedness`, `response_completeness`, `similarity` |
| Safety | `violence`, `sexual`, `self_harm`, `hate_unfairness` |

## Use Repetitions to handle nondeterminism
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: num_repetitions runs each query independently multiple times. Do not teach one universal pass percentage; choose acceptance criteria from risk, use case, sample size, and observed variance. -->

1. **Run** — Set `num_repetitions` for each query
2. **Observe** — Compare tool selection and arguments across runs
3. **Diagnose** — Inspect descriptions, instructions, and context
4. **Set criteria** — Based on your scenario and risk, not an arbitrary universal threshold

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?pivots=programming-language-python -->
<!-- notes: Ask attendees whether repeated evaluation runs changed their confidence in a single pass/fail number. If time permits, continue to Module 8's optional harness comparison; otherwise proceed to Module 9's lab kickoff. -->

- You choose between `LocalEvaluator` (fast, deterministic, no API call) and `FoundryEvals` (cloud-based, LLM-as-judge), or combine both in one `evaluate_agent` call.
- You use the built-in local checks (`keyword_check`, `tool_called_check`, `tool_calls_present`, `tool_call_args_match`), or wrap your own function with the `@evaluator` decorator.
- You use `ExpectedToolCall` with `LocalEvaluator` to check exact tool names and arguments, as in the Azure DevOps example.
- `FoundryEvals` covers four evaluator categories: Agent behavior, Tool usage, Quality, and Safety.
- You use `num_repetitions` to expose variance across independent runs, not to justify a single universal pass threshold.
