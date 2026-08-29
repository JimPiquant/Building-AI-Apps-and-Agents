---
title: EXPERIMENTAL — Context Compaction
subtitle: Bound self-managed in-memory history without changing service-managed conversations
eyebrow: DAY 3 · MODULE 3 · 15 MIN · EXPERIMENTAL
tag: Day 3 · Module 3 · EXPERIMENTAL
deck: module-3-compaction.pptx
---

# Module 3 — EXPERIMENTAL Context Compaction

## EXPERIMENTAL — Context Compaction
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Say experimental twice: once in the title and once verbally. This is an awareness module, not a required lab dependency. Python compaction APIs can change. -->

- For self-managed in-memory history only

## Why compact at all?
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Compaction targets three pressures. It is not a quality improvement by default; every reduction can discard useful context, so measure outcomes. -->

- **Context window** — Long conversations eventually exceed model limits
- **Cost** — Larger prompts consume more input tokens
- **Latency** — More input tokens can slow each response
- **Trade-off** — Less history can also remove facts the agent needed

## How it works
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Compaction targets three pressures. It is not a quality improvement by default; every reduction can discard useful context, so measure outcomes. -->

- Compaction operates on a flat list of Message objects
- Messages are annotated with lightweight group metadata
- Strategies mutate those annotations in place to mark groups as excluded before the message list is projected to the model


## Choosing a strategy
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python&pivots=programming-language-python#choosing-a-strategy -->
<!-- notes: This is the doc's own "Choosing a strategy" table, verbatim, for the Python pivot. Six named strategies, ordered here as the doc lists them (not gentlest-to-harshest — that ordering is the earlier ladder slide's own framing). Walk aggressiveness low to high: ToolResult and SelectiveToolCall only touch tool chatter; Summarization costs a model call but preserves meaning; SlidingWindow and Truncation drop oldest groups outright; TokenBudgetComposedStrategy composes several of the above behind one token-budget goal. -->

| Strategy | Aggressiveness | Preserves context | Requires LLM | Best for |
|---|---|---|---|---|
| `ToolResultCompactionStrategy` | Low | High — collapses tool results into summary messages | No | Reclaiming space from verbose tool output |
| `SelectiveToolCallCompactionStrategy` | Low–Medium | Medium — fully excludes old tool-call groups | No | Removing tool history when results are no longer needed |
| `SummarizationStrategy` | Medium | Medium — replaces history with a summary | Yes | Long conversations where context matters |
| `SlidingWindowStrategy` | High | Low — drops oldest groups | No | Hard group-count limits |
| `TruncationStrategy` | High | Low — drops oldest groups | No | Emergency message- or token-budget backstops |
| `TokenBudgetComposedStrategy` | Configurable | Depends on child strategies | Depends | Layered compaction with a token-budget goal and multiple fallbacks |

## Applicability
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: This boundary is critical. Compaction mutates the local message list before it reaches the model. It has no effect where the service owns conversation context. -->

- **Applies**
  - Self-managed message history
  - In-memory history agents
  - Your process sends the full message list
- **No effect**
  - Foundry Agents
  - Responses API with `store=true`
  - Copilot Studio conversations

## EXPERIMENTAL Strategy ladder (least destructive to most)
<!-- layout: ladder -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Move from gentlest to most destructive. Python documents the named strategies shown here. SelectiveToolCall and ToolResult target tool chatter; Summarization uses another model call; SlidingWindow and Truncation discard old groups. -->

1. **Collapse tool results** — `ToolResultCompactionStrategy`
2. **Exclude selected calls** — `SelectiveToolCallCompactionStrategy`
3. **Summarize history** — `SummarizationStrategy` uses a model
4. **Keep a recent window** — `SlidingWindowStrategy`
5. **Hard backstop** — `TruncationStrategy`
6. **Compose a budget** — `TokenBudgetComposedStrategy`

## Grounded Python: keep recent groups
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: This snippet is intentionally small and matches the documented constructor. System messages are preserved by default. The count is non-system message groups, not user turns. -->

```python
from agent_framework import SlidingWindowStrategy

# EXPERIMENTAL: keep the newest 20 non-system groups.
strategy = SlidingWindowStrategy(
    keep_last_groups=20,
)
```

## DEMO 3.1 — SlidingWindowStrategy pruning old messages, live
<!-- layout: demo -->
<!-- demo-time: ~4 min -->
<!-- demo-reference: Runbook: demos/day3/module-3-demo-1-sliding-window.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/compaction/basics.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs compaction/basics.py as-is, no API key needed. -->

Build a long local message list, print the group count, apply the previous slide's exact `SlidingWindowStrategy(keep_last_groups=20)`, and print the group count again — the EXPERIMENTAL ladder's gentlest rung, proven on real data with no model call required.

## Compose by token budget
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Explain ordered degradation. TokenBudgetComposedStrategy runs children in order, can stop once the budget is met, and falls back to oldest-first exclusion when needed. -->

1. **Collapse** — Reclaim verbose tool-result space
2. **Summarize** — Preserve decisions with an extra model call
3. **Window** — Keep the most recent groups
4. **Fallback** — Exclude oldest groups until the token target is met

## Measure what compaction changes
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Encourage an eval before adoption. Track token and latency improvements alongside task quality, tool selection, and retention of important facts. -->

| Measure | Before / after question |
|---|---|
| Input tokens | Did the strategy reach the intended budget? |
| Latency and cost | Did the reduction materially help? |
| Task quality | Did answers or tool choices regress? |
| Fact retention | Are user decisions and constraints preserved? |
| Tool integrity | Are tool call/result groups still atomic? |

## EXPERIMENTAL takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: End with a clear non-requirement. The future Day 3 lab can succeed without compaction. Learners should adopt it only when they own in-memory history and have measurements. -->

- You use compaction only for self-managed in-memory history.
- You do not expect it to affect Foundry Agents, stored Responses, or Copilot Studio.
- You start gentle, preserve atomic groups, and keep a hard backstop.
- You evaluate quality as well as tokens, cost, and latency.
- You do not make this experimental feature a core lab requirement.
