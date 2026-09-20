# Module 6 · Demo 2 — Trace local code in Toolkit

## Objective

Use Foundry Toolkit's local Tracing monitor to collect and inspect
OpenTelemetry spans from a presenter-prepared Microsoft Agent Framework
WeatherAgent running as local code. Show the automatic agent, model, and tool
spans alongside the custom `Weather Agent Chat` span.

The Toolkit stores this trace locally. The sample still calls the configured
Foundry model remotely, so local collection is not a claim of local inference.
The demo does not connect or modify Application Insights.

## Placement and time box

- **Placement:** After Demo 6.1, “Inspect the reference workflow locally”
- **Time:** 6 minutes total
  - 45 seconds: open Tracing and start the collector
  - 1 minute: inspect the local export configuration
  - 2 minutes: run WeatherAgent
  - 1 minute 30 seconds: refresh and inspect the trace
  - 45 seconds: state the data boundary and clean up

## Prerequisites

Complete these before the session:

- The current public Foundry Toolkit extension and its .NET Runtime
  prerequisite are installed.
- Python 3.11 or later and `uv` are installed.
- Azure CLI authentication is complete for the presenter account.
- `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` are configured outside
  source control. Never display their values.
- Ports `4317` and `4318` are available for the Toolkit collector.
- The prepared sample exists at
  `demos/day5/assets/module-6-demo/foundry_tracing_toolkit.py`.
- The sample and pinned Agent Framework version have been rehearsed against
  the installed Toolkit version.
- A dated capture of a successful local trace is available as fallback.

Use only the sample's synthetic weather questions. To show supported prompt,
response, and tool content in this controlled demonstration, set
`TOOLKIT_TRACE_SENSITIVE_DATA=true` in the presenter's ignored `.env` file.
Leave it unset or set it to `false` for normal use.

## Exact setup

1. Open the Foundry Toolkit view in VS Code.
2. Select **Developer Tools** > **Monitor** > **Tracing**.
3. Select **Start Collector** and confirm the local OTLP endpoints:
   - gRPC: `http://localhost:4317`
   - HTTP traces: `http://localhost:4318/v1/traces`
4. Open `foundry_tracing_toolkit.py` and point out:
   - `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_PROTOCOL`;
   - `configure_otel_providers(...)`, called before the client and agent are
     created;
   - the custom `Weather Agent Chat` span;
   - the `Agent`, `agent.run`, and `get_weather` operations that generate
     automatic Agent Framework spans.
5. From the repository root, run:

   ```bash
   uv run demos/day5/assets/module-6-demo/foundry_tracing_toolkit.py
   ```

6. Let all three synthetic questions complete so the exporter can send its
   buffered telemetry.

## Presenter actions and narration

### 0:00–0:45 — Start the local collector

Open the Tracing monitor and select **Start Collector**.

Say:

> The Toolkit provides the local OTLP collector and trace viewer. It does not
> instrument the application automatically; our Agent Framework setup emits
> the spans and exports them here.

### 0:45–1:45 — Verify the export target

Show the local endpoint and the content-capture setting without exposing the
Foundry project endpoint or credentials.

Say:

> The trace destination is local. The model destination is separate: this
> sample still calls the configured Foundry model.

### 1:45–3:45 — Run WeatherAgent

Run the sample and point out the printed trace ID. Let the weather questions
and tool calls complete.

Do not claim a fixed number of tool spans. The model decides whether to invoke
the tool for each question, and the sample intentionally varies weather
values.

### 3:45–5:15 — Inspect the trace

Return to **Tracing**, select **Refresh**, and open the newest
`Weather Agent Chat` trace.

Inspect:

1. the custom parent span;
2. automatic agent and model spans;
3. `get_weather` tool spans that actually ran;
4. duration, status, and metadata for one span;
5. **Input + Output** only when the controlled content-capture setting
   supplied those fields.

Say:

> A trace groups the recorded operations for this request. Missing input or
> output content can be an intentional privacy setting, not a collection
> failure.

### 5:15–6:00 — State the boundary and clean up

Say:

> These traces are stored in the Toolkit's local trace database. They are not
> uploaded to Application Insights, and stopping the collector does not stop
> the agent or its remote model calls.

Stop the collector and delete the local demo traces from the Toolkit.

## Expected observations

- The collector starts on the documented local OTLP endpoints.
- The sample prints one trace ID for the custom parent span.
- The Tracing view shows the custom span plus supported automatic agent,
  model, and tool spans.
- Span durations, status, and metadata are available.
- Input and output content appears only when the instrumentation and explicit
  controlled content-capture setting provide it.
- No cloud trace or Application Insights connection is created by this demo.

## Fallback

If the collector does not start, confirm that ports `4317` and `4318` are
free and inspect the Toolkit output. If the application succeeds but no trace
appears, confirm that instrumentation runs before client construction, the
endpoint and protocol match, and buffered telemetry has time to flush.

If live collection still fails, use the dated capture from the same script,
Toolkit version, and pinned dependencies. Label it **Recorded local trace**.
Do not substitute an Application Insights trace or claim that a console log is
the Toolkit trace.

## Cleanup

1. Select **Stop Collector**.
2. Delete the synthetic demo traces from the Toolkit trace list.
3. Close terminals that display the trace ID.
4. Leave `TOOLKIT_TRACE_SENSITIVE_DATA=false` after the controlled demo.
5. Leave the Foundry project, model deployment, Application Insights
   connection, and permissions unchanged.

## Official sources

- [Tracing in Foundry Toolkit](https://code.visualstudio.com/docs/intelligentapps/tracing)
- [Agent Framework observability](https://learn.microsoft.com/agent-framework/agents/observability)
