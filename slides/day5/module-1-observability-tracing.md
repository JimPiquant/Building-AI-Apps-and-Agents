---
title: Observability in Generative AI
subtitle: Compare client-side and server-side traces, explain latency, and govern telemetry
eyebrow: DAY 5 · MODULE 1 · 30 MIN
tag: Day 5 · Module 1
deck: module-1-observability-tracing.pptx
---

# Module 1 — Observability in Generative AI

## Observability in Generative AI
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/agent-framework/agents/observability?pivots=programming-language-python | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup -->
<!-- notes: Allow 1 minute. Introduce the two prepared paths used later in the demo. The official Agent Framework WeatherAgent sample creates client-side automatic spans for agent, model, and tool operations and adds one custom parent span around the chat session. The presenter-controlled Prompt agent demonstrates the server-side trace Foundry records after Application Insights is connected. No prior lab completion, attendee-owned agent, or attendee-owned Azure resource is assumed. The module asks what evidence lets an operator explain one run without mistaking operational health for answer quality. -->

- Compare a client-instrumented trace with a Foundry-managed server-side trace — then ask what neither can prove.

## Challenges with Agents
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow about 3 minutes within the existing opening discussion. Complex agent behavior can be difficult to debug because a response can involve many input-dependent and nested operations, each with substantial inputs and outputs. Tracing places the recorded primitives for one run in invocation order and exposes their recorded inputs and outputs for inspection. Emphasize “recorded”: a trace shows instrumented and exported operations, not unrecorded work or private model reasoning. Foundry tracing is generally available for prompt and hosted agents; workflow and external-agent tracing are preview. -->

- **Many steps** — A single response can involve enough operations that the complete path is difficult to follow
- **Variable sequence** — The steps and their order can change based on the user's input
- **Large stage data** — Inputs and outputs at each stage can require detailed inspection
- **Nested execution** — An agent can call a tool that invokes another process or tool, obscuring where an issue entered the run
- **Trace the recorded run** — View recorded primitives in invocation order and inspect each stage's inputs and outputs to understand and debug the behavior

## Three questions, three practices
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- notes: Allow 2 minutes. Observability is the umbrella ability to understand and troubleshoot behavior. Monitoring watches operational and quality signals over time; evaluation judges an output or action against explicit criteria. Stress that a request can have no exception and still produce a poor answer, while a good answer can still be too slow or costly. -->

- **Explain this behavior — observability**
  - Combine logs, metrics, traces, and evaluation signals to understand the system
  - Use a trace to investigate one execution path and its dependencies
- **Watch and judge — monitoring + evaluation**
  - Monitoring tracks signals and thresholds over time
  - Evaluation measures quality, safety, or task success against criteria
  - Error-free is not the same as correct, grounded, or useful

## Evidence from one agent run
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/agent-framework/agents/observability?pivots=programming-language-python -->
<!-- notes: Allow 2 minutes. Point to the WeatherAgent sample while defining the terms. A trace is one correlated execution journey; a span is one timed operation within it; attributes are key-value context on that operation. Agent Framework emits automatic spans for agent invocation, model chat, and function-tool execution. Application code can add custom spans with get_tracer().start_as_current_span(). Because the custom span is current while the agent runs, the automatic spans join the same trace beneath it. -->

- **Trace** — One execution journey across the operations recorded by instrumentation
- **Span** — One operation with start/end time, status, and relationships
- **Attribute** — Context such as model, tool, executor, or correlation metadata
- **Automatic span** — Agent Framework records agent, model, and tool operations
- **Custom span** — Application code adds business or scenario context around recorded work

## How telemetry reaches Foundry and Application Insights
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-framework | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 4 minutes. Instrumentation creates signals, semantic conventions give fields shared meanings, and an exporter sends the signals to a backend. Matching attribute names do not connect two processes; trace context must propagate. Separate Foundry-managed server-side traces from client-side MAF instrumentation around application code. Maturity is surface-specific, not a blanket label. -->

- **Instrument** — MAF and supported runtimes emit OpenTelemetry signals around recorded operations
- **Use conventions** — Shared names aid interpretation but names alone do not propagate trace context
- **Export** — A configured exporter sends telemetry to the selected backend
- **Inspect** — Foundry and Application Insights expose connected trace data; client and server coverage differ
- **Note** — Foundry tracing is GA for prompt and hosted agents; workflow and external-agent tracing is preview

## Server-side and client-side traces
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/trace-agent-setup?tabs=python#instrument-ai-agents -->
<!-- notes: Use this as the second half of the existing instrumentation discussion rather than adding time to the 30-minute module. Microsoft recommends starting with server-side tracing: after Application Insights is connected to the Foundry project, Foundry records supported hosted-agent and workflow activity without application code changes. Add client-side instrumentation when the team also needs visibility into application-owned logic surrounding an agent call. The Microsoft Foundry SDK and OpenTelemetry tracing packages provide that instrumentation, which must be configured and exported. Treat the two trace sources as complementary, and never imply that either source exposes uninstrumented work. Tracing is generally available for prompt and hosted agents; workflow and external-agent tracing are preview. -->

- **Server-side traces — start here**
  - Foundry enables tracing after an Application Insights resource is connected to the project
  - No application code changes are required for supported agents hosted in Foundry
  - Use these traces to inspect activity inside the Foundry-hosted boundary
- **Client-side traces — extend the view**
  - Add instrumentation when custom application logic surrounds the agent call
  - Use the Microsoft Foundry SDK with OpenTelemetry tracing packages
  - Configure collection and export; end-to-end examples can target Azure Monitor or the console

## Workflow traces are graphs, not parent/child trees
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/azure/foundry/agents/concepts/runtime-components | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 2 minutes. In MAF workflows, a message-send span can be a child of the sending executor, while the receiving executor is linked to that send because the work is causally related but not nested. A conversation persists dialogue across turns; a response records processing output; neither identifier should be substituted for a trace ID. Streaming exposes partial output before completion, but the documentation does not promise one span per token. -->

- **Execution relationships**
  - Parent/child means work is nested inside another operation
  - OpenTelemetry links preserve causal handoffs and fan-in without claiming nesting
  - Routing attributes can explain delivered, buffered, or dropped workflow messages
- **Identifier boundaries**
  - A conversation holds history across turns; it is not one trace
  - A response ID is not a trace ID
  - First streamed output is not workflow completion

## DEMO 1.1 — Compare client-side and server-side traces
<!-- layout: demo -->
<!-- demo-time: ~8 min -->
<!-- demo-reference: Runbook: demos/day5/module-1-demo-1-standard-custom-traces.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/observability/foundry_tracing.py | https://learn.microsoft.com/agent-framework/agents/observability?pivots=programming-language-python | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup | https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent -->
<!-- notes: Allow 8 minutes. Step 1: run the provided copy of Microsoft's WeatherAgent sample and use its printed trace ID to compare the custom Weather Agent Chat parent with the automatic invoke_agent, chat, and any execute_tool spans that were actually emitted. Step 2: run a synthetic prompt against the prepared docs-assistant Prompt agent in the Foundry playground, then open Agents > Traces and inspect the matching server-side trace. If ingestion is delayed, switch to the labeled capture from the rehearsed Prompt-agent run. Compare the recorded boundaries: Foundry records the hosted Prompt-agent path without client-side tracing code, while the WeatherAgent path adds application-owned context. Keep the two trace IDs separate, use synthetic prompts, and do not improvise missing spans or identifiers. -->

1. Run the official WeatherAgent sample and inspect its custom parent plus automatic spans.
2. Run the prepared Prompt agent in the Foundry playground, then inspect its server-side trace in **Agents** > **Traces**.

Compare what Foundry records automatically with the application context added by client-side instrumentation.

## Treat trace telemetry as governed data
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 3 minutes. Treat prompts, outputs, tool arguments, and results as sensitive unless proven otherwise. Prefer durations, status, stable identifiers, and bounded categorical metadata. Capture payloads only for a justified case with synthetic content, then apply telemetry access controls, retention, and sampling. More data also means more ingestion and retention cost. -->

| Decision | Default stance | Reason |
|---|---|---|
| Payloads | Omit, redact, or minimize | Prompts, outputs, tool arguments, and results can contain sensitive data |
| Metadata | Keep only useful context | Duration, status, operation type, and safe identifiers often answer the question |
| Access + retention | Restrict, sample, and expire deliberately | Trace storage follows Application Insights access, retention, and billing |
| Demo content | Use synthetic inputs | Troubleshooting value never justifies copying secrets or personal data |

## Separate latency, failure, and answer quality
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- notes: Allow 3 minutes. Use only the values actually visible in the WeatherAgent trace. Ask where the delay occurred: the answer comes from the relevant automatic or custom span durations and their relationships, not from an assumed tool or model bottleneck. Ask whether the final answer was good: the trace alone cannot establish that; use an appropriate evaluator or reviewed answer. Also remind the room that traces expose recorded operations, not guaranteed access to a model's private reasoning. -->

- **Where did time go?** — Compare actual agent, model, tool, and custom-span durations
- **Did anything fail?** — Check status and error attributes; a long operation can still succeed
- **Was the answer good?** — Use an evaluator or reviewed answer against explicit criteria
- **What remains unknown?** — Unrecorded work and private model reasoning are not guaranteed trace evidence

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/agent-framework/agents/observability?pivots=programming-language-python | https://learn.microsoft.com/agent-framework/workflows/observability -->
<!-- notes: Allow 2 minutes. Ask for the four-part operational story: instrument, propagate context, export, inspect. Then ask which evidence answers latency versus quality. Close by handing off to Module 2: the telemetry contract stays the same, but the next question is which identity crosses each resource boundary. -->

- Observability explains behavior; monitoring watches signals over time; evaluation judges quality or safety.
- A trace contains spans, and spans carry attributes that describe recorded operations.
- Agent Framework emits automatic spans; custom spans add application-defined context.
- Context propagation correlates boundaries; links express causal handoffs without inventing nesting.
- Minimize sensitive payloads, and govern telemetry access, sampling, retention, and cost.
