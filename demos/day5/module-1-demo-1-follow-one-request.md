# Module 1 · Demo 1 — Follow one request

## Objective

Follow one synthetic Planner/Retriever/Critic request from application
events into authentic exported telemetry, identify where elapsed time was
spent and which branch ran, and separate that operational finding from
answer-quality evidence.

The demo is read-only. It does not deploy, provision, reconnect, or modify
Azure resources.

## Placement and time box

- **Placement:** After slide 5, “Workflow causality is not always nesting”
- **Time:** 6 minutes total
  - 40 seconds: frame the evidence
  - 50 seconds: inspect console events
  - 2 minutes 40 seconds: follow the exported trace
  - 1 minute 10 seconds: latency-versus-quality checkpoint
  - 40 seconds: privacy and handoff

## Prerequisites

Complete these before the session:

- A presenter-controlled, existing Foundry project already connected to
  Application Insights. Do not create or connect a resource during the
  demo.
- Read-only access sufficient to view the selected trace. Confirm access
  before attendees arrive.
- A presenter-prepared Planner/Retriever/Critic reference workflow with
  actual MAF instrumentation and export configured. A terminal event stream
  alone is not sufficient.
- One rehearsed run generated only from the synthetic input below.
- The exact framework/runtime version used for the run recorded with the
  evidence. Span names differ by language and version.
- Browser tabs or locally stored captures opened in advance. Hide
  subscription IDs, tenant details, connection strings, tokens, and
  unrelated telemetry.

Foundry tracing is generally available for prompt and hosted agents.
Foundry workflow and external-agent tracing are preview; say so when the
selected evidence uses either preview surface.

## Exact setup

1. In the controlled presenter environment, run the already-instrumented
   reference workflow once with the synthetic prompt below.
2. Record the real UTC timestamp, trace ID, framework/runtime version, and
   any conversation or response IDs emitted by that run. Do not add an ID
   that the runtime did not emit.
3. Preserve the console output from that same run and label it
   **Application event stream — not a cloud trace**.
4. In Foundry or Application Insights, locate the ingested trace by its
   real trace ID and timestamp. Confirm that the selected run actually
   contains:
   - the workflow or request operation;
   - recorded Planner, Retriever, and Critic operations, using the names
     emitted by the installed runtime;
   - a retrieval operation;
   - either a recorded revision path or a recorded stop path;
   - real duration and status fields;
   - a causal link or routing attribute if the runtime emitted one.
5. Bookmark the trace detail at the root operation. Also capture the same
   view as a fallback, including the trace ID, timestamp, duration, and
   status. Redact sensitive infrastructure metadata without changing
   measured values.
6. Prepare separate quality evidence for the final answer: an authentic
   evaluator result or a clearly identified human review against the
   prompt criteria. Keep it visually separate from the trace.
7. Rehearse the six-minute path. If retrieval was not the longest relevant
   operation in the real run, narrate whichever operation actually was;
   never alter a duration to fit the teaching story.

## Synthetic and prepared inputs

Use exactly this presenter-prepared prompt against the synthetic reference
corpus:

> Using only the supplied synthetic Contoso Cloud Platform documents,
> explain the required response to an HTTP 429 and when an operator should
> escalate. Cite the source filenames. If the documents do not establish a
> detail, state the gap instead of inventing it.

The answer text and corpus contain no customer, employee, credential, or
production data.

The prepared input set also includes the instrumented reference workflow,
the synthetic corpus, the console capture from this exact run, the matching
exported trace, and the separate authentic evaluation or review record.

## Prepared evidence contract

The primary path uses authentic telemetry from the rehearsed run. Label each
artifact with:

- **Observed evidence**
- run date/time and environment label
- trace ID where present
- framework/runtime version
- whether the view is a console event stream, exported trace, or evaluation

Do not redraw missing spans, copy IDs between unrelated runs, or create
success-shaped sample output. A documentation-based schematic is allowed
only as a fallback and must be labeled **Illustrative structure — not an
observed run**.

## Presenter actions and narration

### 0:00–0:40 — Frame the request

Show the synthetic prompt and the three prepared roles.

Say:

> This is the reference workflow we examined: Planner scopes, Retriever
> gathers evidence, and Critic either requests a bounded revision or stops.
> You do not need a prior lab or your own Azure resources. We are reading one
> prepared run, not generating new traffic.

### 0:40–1:30 — Start with console events

Show the console capture from the selected run. Point to the recorded
executor or workflow events and any real correlation identifier.

Say:

> This list is useful application evidence, but printing events does not
> make them a distributed trace. The next view exists because the
> application was instrumented, trace context was carried, and an exporter
> sent telemetry to the configured backend.

If no trace ID appears in the console output, say so. Do not imply that a
conversation ID or response ID is the trace ID.

### 1:30–4:10 — Follow the exported trace

Open the bookmarked trace at its root and take these actions:

1. Read the real trace ID, total duration, and final status.
2. Expand the recorded operations in execution order.
3. Point out the retrieval operation and compare its duration with the
   other recorded operations.
4. Locate the Critic decision and the observed revision or stop route.
5. If present, point to the OpenTelemetry link or routing attribute that
   relates a send to downstream executor processing.

Say:

> A trace is this request journey. Each timed operation is a span; its
> attributes add safe context. A workflow handoff can be causally linked
> without pretending that the receiving executor was nested inside the
> send. I am using the span and attribute names this runtime actually
> emitted, not promising identical names in every language or release.

Do not claim one span per streamed token. If the view shows first-response
and completion timing, name them as different measurements.

### 4:10–5:20 — Run the checkpoint

Ask:

> Which evidence tells us where the delay occurred?

Expected response: the relevant span durations and their relationships.

Then ask:

> Does a successful trace prove the answer was correct and grounded?

Show the separate evaluator result or human review.

Say:

> No. The trace explains recorded behavior. Evaluation or review judges the
> answer against criteria. An error-free run can still be wrong, and the
> trace is not a guaranteed view of private model reasoning.

### 5:20–6:00 — Close on the data boundary

Point to the minimized attributes and the redaction label.

Say:

> Telemetry is another data store. Prefer duration, status, operation type,
> and safe identifiers. Capture prompts, tool arguments, or results only
> when justified, with synthetic content and appropriate access, retention,
> sampling, and cost controls.

## Expected observations

- The console event stream and exported trace are visibly distinct.
- One trace represents the selected execution; spans represent recorded
  operations and attributes provide context.
- The actual longest relevant span identifies the observed latency
  hotspot, even if every status is successful.
- The observed Critic route is supported by a recorded operation, link, or
  routing attribute. If the runtime did not emit that evidence, the demo
  states the limitation.
- A conversation ID, response ID, and trace ID retain their separate roles.
- The quality judgment comes from evaluation or review, not from the
  absence of trace errors.

## Fallback

Use the captured evidence from the same authentic rehearsed run if the
portal is unavailable, ingestion is delayed, or authorization expires.
Keep the observed-evidence labels, timestamp, trace ID, version, durations,
and status visible.

If no authentic exported trace was obtained during rehearsal:

1. Do not present the console output as cloud telemetry.
2. Show the official documentation’s trace/span/attribute model and a
   schematic labeled **Illustrative structure — not an observed run**.
3. State which observations cannot be made without authentic telemetry.
4. Still run the delay-versus-quality question conceptually, without
   claiming that retrieval was slow or that the answer passed.

Never fabricate a successful trace, evaluator result, revision, or
correlation ID.

## Cleanup

- Close the trace and evidence tabs.
- Close any local capture containing identifiers.
- Sign out of the presenter-only portal session if the device will be
  shared.
- Leave the existing Foundry project, Application Insights connection,
  roles, retention, and sampling unchanged.
- Do not delete telemetry or create a replacement run.

## Official sources

- [Observability in generative AI](https://learn.microsoft.com/azure/foundry/concepts/observability)
- [Agent tracing overview](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
- [Microsoft Agent Framework agent observability](https://learn.microsoft.com/agent-framework/agents/observability)
- [Microsoft Agent Framework workflow observability](https://learn.microsoft.com/agent-framework/workflows/observability)
- [Set up tracing in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup)
- [Configure tracing for AI agent frameworks](https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-framework)
