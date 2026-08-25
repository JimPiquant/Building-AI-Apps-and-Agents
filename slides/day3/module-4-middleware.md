---
title: Middleware & Robust Agents
subtitle: Add cross-cutting controls without burying them in tools or prompts
eyebrow: DAY 3 · MODULE 4 · 35 MIN
tag: Day 3 · Module 4
deck: module-4-middleware.pptx
---

# Module 4 — Middleware & Robust Agents

## Middleware & Robust Agents
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Position middleware as code-level interception around agent, tool, and model calls. It complements prompts; it is not a prompt substitute. -->

- Observe, guard, recover, and terminate at the right layer

## Three layers fire at different frequencies
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: This frequency model drives both correctness and cost. Agent middleware runs once around a run. Function middleware runs for every invoked tool. Chat middleware runs for every model request, including tool-loop follow-ups. -->

| Type | Intercepts | Typical frequency |
|---|---|---|
| Agent middleware | Whole agent run | Once per run |
| Function middleware | One function/tool invocation | Once per invoked tool |
| Chat middleware | Request to the model client | Every model call; often several per run |

## Pick agent-level or run-level scope
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/agent-vs-run-scope?tabs=python -->
<!-- notes: Agent-level controls are persistent and outermost. Run-level middleware is request-specific and sits inside agent-level middleware. Use run scope for diagnostics or policy variations that truly belong to one request. -->

- **Agent-level**
  - Configured once on the Agent
  - Applies to every run
  - Best for baseline security, telemetry, and policy
- **Run-level**
  - Passed to one `agent.run(...)`
  - Applies only to that invocation
  - Best for targeted diagnostics or request policy

## Middleware executes like an onion
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Read the documented order left to right and then back out. With A1, A2 and R1, R2: A1 enters first and exits last. The innermost component is the agent execution. -->

- **Request path**
  - A1 enters, then A2
  - R1 enters, then R2
  - Agent executes at the center
- **Response path**
  - R2 exits, then R1
  - A2 exits, then A1
  - The outermost layer finishes last

## DEMO 4.1 — The onion, printed
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-4-demo-1-onion-order.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/middleware/agent_and_run_level_middleware.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs agent_and_run_level_middleware.py as-is. -->

Run the official `agent_and_run_level_middleware.py` sample live: printed enter/exit lines match the previous slide's onion diagram exactly — agent-level middleware outermost, run-level middleware inside it, the agent execution at the center.

## Coordinate through context.metadata
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/shared-state?tabs=python -->
<!-- notes: Use metadata for request-scoped coordination such as a correlation ID or start timestamp. Choose collision-resistant keys and do not put secrets or durable session state there. -->

1. **Outer middleware** — Set correlation ID and start time
2. **Inner middleware** — Read or enrich shared metadata
3. **Tool/model interceptors** — Attach trace context and decisions
4. **Outer unwind** — Read results and emit one summary

## Logging and timing: the smallest useful pattern
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/defining-middleware?tabs=python -->
<!-- notes: The shared context is mutated directly; call_next takes no context argument. A try/finally ensures timing is emitted when downstream execution fails. -->

```python
async def timing(context, call_next):
    started = perf_counter()
    context.metadata["trace_id"] = new_trace_id()
    try:
        await call_next()
    finally:
        record_duration(
            perf_counter() - started,
            context.metadata["trace_id"],
        )
```

## Guardrails can short-circuit
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/termination?tabs=python -->
<!-- notes: The safe termination contract has two actions: set context.result to the response you want returned, then raise MiddlewareTermination. Do not simply return and assume the run is terminated. -->

1. **Inspect** — Evaluate request, identity, quota, or policy
2. **Allow** — Await `call_next()` when the request is permitted
3. **Set result** — Supply a controlled AgentResponse when blocked
4. **Raise** — `MiddlewareTermination` ends the pipeline deliberately

## Termination has an explicit result
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/termination?tabs=python -->
<!-- notes: Keep this conceptual rather than inventing policy logic. The exact AgentResponse construction is in the official sample; the invariant is context.result before MiddlewareTermination if the caller should receive a custom response. -->

```python
if blocked(context.messages):
    context.result = AgentResponse(
        messages=[Message("assistant", ["I can't process this request."])]
    )
    raise MiddlewareTermination()

await call_next()
```

## DEMO 4.2 — Guardrail blocks a request, live
<!-- layout: demo -->
<!-- demo-time: ~4 min -->
<!-- demo-reference: Runbook: demos/day3/module-4-demo-2-guardrail-termination.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/middleware/atr_validation_middleware.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs atr_validation_middleware.py (FunctionMiddleware + MiddlewareTermination, real deny-list fallback with no extra install required). -->

Run the official `atr_validation_middleware.py` sample live: a benign query passes through normally, then a query matching a deny-list rule is blocked before the tool executes — `context.result` set, `MiddlewareTermination` raised, exactly as the previous slide's code shows.

## Handle exceptions where you can add value
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/exception-handling?tabs=python -->
<!-- notes: A middleware should either recover deliberately or re-raise. Avoid swallowing exceptions and returning accidental success. Log sanitized context, preserve cancellation, and keep retry scope narrow. -->

| Failure | Layer | Response |
|---|---|---|
| Invalid tool arguments | Function | Reject or normalize before execution |
| Transient model/service error | Chat or agent | Bounded retry if the operation is safe |
| Policy violation | Agent or function | Controlled result + termination |
| Unknown exception | Nearest useful layer | Record, clean up, re-raise |

## Retry must be bounded and idempotent
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/exception-handling?tabs=python -->
<!-- notes: Make the risk explicit: retrying a write tool can duplicate side effects. Limit attempts, retry only classified transient failures, honor cancellation, and use idempotency where the backend supports it. -->

1. **Classify** — Retry only known transient failures
2. **Check safety** — Read or idempotent operation?
3. **Back off** — Delay with a fixed maximum attempt count
4. **Stop** — Surface the last failure; never loop forever

## Built-in OTel is not custom middleware
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/observability?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Use built-in observability for standard traces, metrics, and spans. Write middleware when you need application-specific policy or transformation. Do not recreate OpenTelemetry plumbing unless you have a concrete gap. -->

- **Built-in observability**
  - Standard OpenTelemetry integration
  - Agent/model/tool spans and metrics
  - Prefer for baseline telemetry
- **Custom middleware**
  - Domain policy and validation
  - Result transformation or short-circuit
  - Add only what standard instrumentation does not provide

## Ordering and performance trade-offs
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Chat middleware is the easiest place to accidentally multiply work because it runs per model call. Put cheap rejects outside expensive work. Keep middleware focused so ordering remains auditable. -->

- **Outermost first** — Authentication and cheap rejection
- **Per-call cost** — Chat and function middleware can run many times
- **Mutation risk** — Document which layer changes messages, options, or results
- **Streaming** — Preserve streaming behavior; do not buffer unless required

## OPTIONAL awareness: Agent Hooks
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/agent-hooks?tabs=python -->
<!-- notes: Clearly separate this experimental awareness item from normal middleware. Agent Hooks provide a standardized fail-closed governance boundary spanning agent, chat, and function stages, including streaming and persistence coordination. Do not make Hooks part of the core lab. -->

- **Normal middleware**
  - General interception and composition
  - App-defined ordering and behavior
  - Core pattern for this workshop
- **Agent Hooks — EXPERIMENTAL**
  - Standardized fail-closed governance boundary
  - Coordinates agent, chat, and function stages
  - Awareness only; verify current API before adoption

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python -->
<!-- notes: Ask attendees which middleware type would validate Azure DevOps write arguments. The answer is function middleware, with an agent-level policy deciding whether writes are enabled for the run. -->

- You place controls at agent, function, or chat frequency intentionally.
- You use agent-level scope for baselines and run-level scope for one request.
- You reason about onion order before you register middleware.
- You set `context.result` and raise `MiddlewareTermination` to short-circuit.
- You keep retries bounded, classified, and safe for side effects.
