---
title: Evaluation & Lab Kickoff
subtitle: Check exact tool use, then frame the future Day 3 build
eyebrow: DAY 3 · MODULE 7 · 30 MIN
tag: Day 3 · Module 7
deck: module-7-eval-lab-kickoff.pptx
---

# Module 7 — Evaluation & Lab Kickoff

## Evaluation & Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: This module teaches the evaluation contract and frames a future lab. No Day 3 lab files are created in this change. The core path uses Agent Framework evaluation, not the separate azure-ai-evaluation package. -->

- Validate session, streaming, middleware, MCP, and exact tool behavior

## Use the Agent Framework evaluation stack
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: Keep the stack explicit: evaluate_agent orchestrates runs, ExpectedToolCall carries ground truth, LocalEvaluator performs deterministic checks, and FoundryEvals adds cloud evaluators. -->

1. **Queries** — Representative user requests
2. **evaluate_agent** — Runs the agent and captures conversations
3. **ExpectedToolCall** — Names and expected argument subsets
4. **LocalEvaluator** — Fast deterministic checks
5. **FoundryEvals** — Cloud-based quality and tool-use evaluators

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

## Repetitions reveal nondeterminism
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: num_repetitions runs each query independently multiple times. Do not teach one universal pass percentage; choose acceptance criteria from risk, use case, sample size, and observed variance. -->

1. **Run** — Set `num_repetitions` for each query
2. **Observe** — Compare tool selection and arguments across runs
3. **Diagnose** — Inspect descriptions, instructions, and context
4. **Set criteria** — Based on your scenario and risk, not an arbitrary universal threshold

## Local checks and Foundry evaluators complement each other
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/evaluation/microsoft-foundry?tabs=python -->
<!-- notes: Local checks are fast and deterministic. FoundryEvals uses the Foundry evaluation service and requires a project plus judge model deployment. A single run can include both providers and returns separate results. -->

- **LocalEvaluator**
  - No evaluator API call
  - Exact tool names and argument subsets
  - Fast inner loop and CI smoke tests
- **FoundryEvals**
  - Cloud-based evaluation service
  - LLM-as-judge quality and agent behavior
  - Portal dashboards and comparisons

## Choose Foundry evaluators for tool behavior
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: Highlight relevant categories rather than all available evaluators. FoundryEvals automatically adds tool call accuracy when items contain tool definitions; explicit constants are also available. -->

- **tool_call_accuracy** — Overall correctness of tool calls
- **tool_selection** — Whether the right tool was chosen
- **tool_input_accuracy** — Whether arguments were appropriate
- **tool_output_utilization** — Whether the response used the result
- **tool_call_success** — Whether the call completed successfully
- **task_adherence** — Whether the agent followed the requested task

## Future lab architecture
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: This sequence composes the day's primitives. It is a proposed lab flow only; the repository intentionally has no labs/day3 implementation yet. -->

1. **A · State + response** — Session, serialization, stream, TriageResult
2. **B · Robustness** — Timing, guardrail, exception handling
3. **C · Read** — Read-only Azure DevOps MCP
4. **D · Write** — Explicitly approved work-item mutation
5. **E · Evaluate** — Exact local checks plus selected Foundry evaluators

## Part A + B: runtime foundation
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Part A proves continuity and the response contract. Part B adds cross-cutting controls without changing the core docs-assistant instructions or tools. -->

- **Part A**
  - Create and reuse AgentSession
  - Serialize and restore with to_dict/from_dict
  - Stream display updates
  - Finalize a typed TriageResult
- **Part B**
  - Add logging/timing middleware
  - Short-circuit one blocked request
  - Handle a classified exception
  - Demonstrate a bounded retry policy

## Part C + D: read before write
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/agent-framework/agents/tools/tool-approval?tabs=python -->
<!-- notes: Part C uses only the read dispatcher with the wit toolset and read-only header. Part D enables only the needed write tool and requires approval after showing the current record and proposed arguments. -->

- **Part C · Read-only**
  - `X-MCP-Toolsets: wit`
  - `X-MCP-Readonly: true`
  - `wit_work_item` with `get` or `my`
  - Verify result against the workshop project
- **Part D · Approved write**
  - Allow `wit_work_item_write`
  - Use `create` or `update`
  - Show exact arguments before approval
  - Read again to verify the mutation

## Part E: evaluate the tool contract
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: Include positive read, positive write, and no-tool cases. Ground truth must include the consolidated tool plus action. Repeat enough to observe variation, then report the observed rate without inventing a universal threshold. -->

1. **Golden cases** — Read, approved write, rejected write, and no-tool request
2. **Expected calls** — Tool name plus action and key arguments
3. **Local checks** — Presence and argument subset match
4. **Repetitions** — Observe consistency across independent runs
5. **FoundryEvals** — Add tool selection/input accuracy where available

## Prerequisites for the future lab
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: Do not claim setup has already happened. A future lab author must supply a dedicated Entra-backed Azure DevOps Services organization/project, Foundry project and judge deployment, least-privilege identity, and known work-item fixtures. -->

- **Day 2 baseline** — Working docs assistant and FoundryChatClient
- **Azure DevOps** — Entra-backed Services org plus dedicated workshop project
- **Permissions** — Read access first; separately approved write access
- **Foundry evals** — Project client and judge model deployment
- **Fixtures** — Known work item IDs and a reset/cleanup plan

## Definition of done and guardrails
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python | https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Definition of done is behavioral, not an arbitrary score. Troubleshoot from auth to discovery to selection to execution. Preserve the read-first boundary while debugging. -->

| Area | Done when | Guardrail |
|---|---|---|
| Session | Restored turn retains intended state | Ownership mapping verified |
| Structured stream | UI updates, final typed value | No partial JSON actions |
| Middleware | Guard and failure path are observable | Retry is bounded |
| ADO MCP | Read succeeds; write requires approval | Dedicated project only |
| Evaluation | Expected tool/action/args are reported | No universal pass threshold claimed |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: Close the core Day 3 live time here. If time permits, continue to the explicitly optional harness comparison. Otherwise, learners have all required primitives for a future lab. -->

- You use MAF `evaluate_agent`, `ExpectedToolCall`, `LocalEvaluator`, and `FoundryEvals`.
- You test exact consolidated ADO tool names and actions.
- You use repetitions to expose variance, not to justify a universal threshold.
- You build read-only behavior before approved writes.
- You treat the lab sequence as a future implementation, not a completed lab.

