---
title: Day 3 Lab Kickoff
subtitle: Frame a proposed lab that composes Day 3's primitives
eyebrow: DAY 3 · MODULE 9 · 15 MIN
tag: Day 3 · Module 9
deck: module-9-lab-kickoff.pptx
---

# Module 9 — Day 3 Lab Kickoff

## Day 3 Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python -->
<!-- notes: This module frames a proposed future lab. No Day 3 lab files are created in this change. -->

- A proposed five-stage build: state and response, robustness, read, write, and evaluation

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
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation?tabs=python | https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Close the core Day 3 live time here. Learners have all required primitives for the proposed future lab. -->

- You build read-only behavior before approved writes.
- You treat the lab sequence as a proposed structure, not a completed lab.
- You compose Day 3's primitives across five stages: state and response, robustness, read, write, and evaluation.
- You confirm prerequisites — a dedicated Azure DevOps project, a Foundry evaluation project, and known work-item fixtures — before this proposed lab can be scaffolded.
