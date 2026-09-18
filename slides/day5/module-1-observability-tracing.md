---
title: Observability and Tracing
subtitle: Follow one request, explain the delay, and protect what telemetry records
eyebrow: DAY 5 · MODULE 1 · 30 MIN
tag: Day 5 · Module 1
deck: module-1-observability-tracing.pptx
---

# Module 1 — Observability and Tracing

## Observability and Tracing
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 1 minute. Reintroduce the presenter-prepared technical-documentation assistant: Planner scopes the request, Retriever gathers evidence, and Critic either requests one bounded revision or stops. No prior lab completion is assumed. The module asks what evidence lets an operator explain one run without mistaking operational health for answer quality. -->

- Follow one presenter-prepared request from workflow entry to answer — then ask what the trace still cannot prove.

## Three questions, three practices
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- notes: Allow 4 minutes. Observability is the umbrella ability to understand and troubleshoot behavior. Monitoring watches operational and quality signals over time; evaluation judges an output or action against explicit criteria. Stress that a request can have no exception and still produce a poor answer, while a good answer can still be too slow or costly. -->

- **Explain this behavior — observability**
  - Combine logs, metrics, traces, and evaluation signals to understand the system
  - Use a trace to investigate one execution path and its dependencies
- **Watch and judge — monitoring + evaluation**
  - Monitoring tracks signals and thresholds over time
  - Evaluation measures quality, safety, or task success against criteria
  - Error-free is not the same as correct, grounded, or useful

## Name the evidence inside one request
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 4 minutes. Point to the supplied reference run while defining the terms. A trace is the journey of one execution; a span is one timed operation within it; attributes are key-value context on that operation. The console event list can be useful evidence, but without trace context, instrumentation, and export it is not automatically a distributed trace. -->

- **Trace** — One execution journey across the operations recorded by instrumentation
- **Span** — One operation with start/end time, status, and relationships
- **Attribute** — Context such as model, tool, executor, or correlation metadata
- **Console event list** — Application output; useful, but not automatically a cloud trace

## From instrumentation to a trace backend
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-framework | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 4 minutes. Instrumentation creates signals, semantic conventions give fields shared meanings, and an exporter sends the signals to a backend. Matching attribute names do not connect two processes; trace context must propagate. Separate Foundry-managed server-side traces from client-side MAF instrumentation around application code. Maturity is surface-specific, not a blanket label. -->

- **Instrument** — MAF and supported runtimes emit OpenTelemetry signals around recorded operations
- **Use conventions** — Shared names aid interpretation; names alone do not propagate trace context
- **Export** — A configured exporter sends telemetry to the selected backend
- **Inspect** — Foundry and Application Insights expose connected trace data; client and server coverage differ
- **Label maturity** — Foundry tracing is GA for prompt and hosted agents; workflow and external-agent tracing is preview

## Workflow causality is not always nesting
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/azure/foundry/agents/concepts/runtime-components | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 3 minutes. In MAF workflows, a message-send span can be a child of the sending executor, while the receiving executor is linked to that send because the work is causally related but not nested. A conversation persists dialogue across turns; a response records processing output; neither identifier should be substituted for a trace ID. Streaming exposes partial output before completion, but the documentation does not promise one span per token. -->

- **Execution relationships**
  - Parent/child means work is nested inside another operation
  - OpenTelemetry links preserve causal handoffs and fan-in without claiming nesting
  - Routing attributes can explain delivered, buffered, or dropped workflow messages
- **Identifier boundaries**
  - A conversation holds history across turns; it is not one trace
  - A response ID is not a trace ID
  - First streamed output is not workflow completion; do not expect a span per token

## DEMO 1.1 — Follow one request
<!-- layout: demo -->
<!-- demo-time: ~6 min -->
<!-- demo-reference: Runbook: demos/day5/module-1-demo-1-follow-one-request.md -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup -->
<!-- notes: Allow 6 minutes. Use the runbook's read-only, presenter-prepared evidence from one synthetic Planner/Retriever/Critic request. Compare its console events with its authentic exported trace, follow the retrieval and Critic decision, identify the longest recorded operation, and finish by asking what separate evidence establishes answer quality. Never improvise missing spans or identifiers. -->

Follow the same synthetic request through console events and an authentic exported trace. Find the retrieval operation, the recorded revision-or-stop decision, and the longest span. Then separate the latency finding from the reviewed or evaluated answer-quality evidence.

## Telemetry is another data store
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 3 minutes. Treat prompts, outputs, tool arguments, and results as sensitive unless proven otherwise. Prefer durations, status, stable identifiers, and bounded categorical metadata. Capture payloads only for a justified case with synthetic content, then apply telemetry access controls, retention, and sampling. More data also means more ingestion and retention cost. -->

| Decision | Default stance | Reason |
|---|---|---|
| Payloads | Omit, redact, or minimize | Prompts, outputs, tool arguments, and results can contain sensitive data |
| Metadata | Keep only useful context | Duration, status, operation type, and safe identifiers often answer the question |
| Access + retention | Restrict, sample, and expire deliberately | Trace storage follows Application Insights access, retention, and billing |
| Demo content | Use synthetic inputs | Troubleshooting value never justifies copying secrets or personal data |

## Checkpoint: slow is not the same as wrong
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- notes: Allow 3 minutes. Use only the values actually visible in the prepared evidence. Ask where the delay occurred: the answer is the longest relevant span and its child or linked operations. Ask whether the final answer was good: the trace alone cannot establish that; use an appropriate evaluator or reviewed answer. Also remind the room that traces expose recorded operations, not guaranteed access to a model's private reasoning. -->

- **Where did time go?** — Compare span durations and relationships; the supplied trace points to retrieval
- **Did anything fail?** — Check status and error attributes; a long operation can still succeed
- **Was the answer good?** — Use an evaluator or reviewed answer against explicit criteria
- **What remains unknown?** — Unrecorded work and private model reasoning are not guaranteed trace evidence

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/agent-framework/workflows/observability -->
<!-- notes: Allow 2 minutes. Ask for the four-part operational story: instrument, propagate context, export, inspect. Then ask which evidence answers latency versus quality. Close by handing off to Module 2: the telemetry contract stays the same, but the next question is which VS Code surface should an architect use during development. -->

- Observability explains behavior; monitoring watches signals over time; evaluation judges quality or safety.
- A trace contains spans, and spans carry attributes; console events are not automatically cloud traces.
- OpenTelemetry links express causal workflow handoffs without inventing parent/child nesting.
- Instrumentation, context propagation, and export are separate responsibilities.
- Minimize sensitive payloads, and govern telemetry access, sampling, retention, and cost.
