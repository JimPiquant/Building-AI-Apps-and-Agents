# Module 1 · Demo 1 — Compare client-side and server-side traces

## Objective

Run two prepared agent paths and inspect the authentic trace from each:

1. Run Microsoft's official Agent Framework WeatherAgent sample and use its
   printed trace ID to compare the custom `Weather Agent Chat` parent span
   with automatic agent, model, and tool spans.
2. Run a synthetic prompt against the existing `docs-assistant` Prompt agent
   in the Foundry playground, then inspect the server-side trace that Foundry
   records without client-side instrumentation.

Both paths write telemetry to the Application Insights resource already
connected to the presenter's Foundry project. The demo does not provision,
deploy, publish, register, or reconfigure Azure resources.

## Placement and time box

- **Placement:** After “Workflow traces are graphs, not parent/child trees”
- **Time:** 8 minutes total
  - 30 seconds: frame the two trace paths
  - 2 minutes 45 seconds: run WeatherAgent and inspect its client-side trace
  - 3 minutes: run the Prompt agent and inspect its server-side trace
  - 1 minute 15 seconds: compare the recorded boundaries
  - 30 seconds: privacy boundary and handoff

## Prerequisites

Complete these before the session:

- A presenter-controlled, existing Foundry project already connected to
  Application Insights.
- A published `docs-assistant` Prompt agent, or another presenter-controlled
  Prompt agent with a stable name and version, that can run in the Foundry
  playground.
- A custom agent registered in Foundry with the OpenTelemetry agent ID
  `weather-agent`, matching the sample's `Agent.id`.
- Azure CLI authentication for the presenter and access to the Foundry
  project, model deployment, Prompt agent, Application Insights resource, and
  trace view.
- The **Log Analytics Reader** role on the connected Application Insights
  resource. If its Log Analytics tables are protected, also assign
  **Privileged Monitoring Data Reader**.
- `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` configured in the
  presenter environment. Never show their values on screen.
- `uv` or another PEP 723-compatible runner with network access for the
  dependencies declared in the sample.
- The provided sample at
  `demos/day5/assets/module-1-demo/foundry_tracing.py`.
- A successful rehearsal of both paths using the pinned Prompt-agent version,
  Agent Framework version, and Azure Monitor package versions, plus dated
  captures of both traces as the fallback.
- Browser and editor views opened in advance. Hide subscription IDs, tenant
  details, connection strings, tokens, and unrelated telemetry.

## Exact setup

1. Confirm that the Foundry project is connected to Application Insights and
   that you can query telemetry in **Agents** > **Traces**.
2. Open the published `docs-assistant` Prompt agent in the Foundry portal.
   Confirm its version and model, then keep its playground and the
   **Agents** > **Traces** view open in separate tabs.
3. Confirm that the custom-agent registration uses `weather-agent`.
4. Open `demos/day5/assets/module-1-demo/foundry_tracing.py` and point to:
   - `await client.configure_azure_monitor(...)`, which retrieves the
     project's Application Insights connection and configures Azure Monitor;
   - `get_tracer().start_as_current_span("Weather Agent Chat", ...)`, which
     creates the custom parent span;
   - `Agent(...)`, `agent.run(...)`, and `get_weather`, whose actual
     operations produce Agent Framework's automatic spans.
5. In the presenter terminal, configure the required environment variables
   without displaying their values.
6. Run:

   ```bash
   uv run demos/day5/assets/module-1-demo/foundry_tracing.py
   ```

7. Record the printed trace ID, UTC timestamp, Agent Framework version, and
   Azure Monitor OpenTelemetry version.
8. In Foundry or Application Insights, search for the printed trace ID.
   Confirm that the trace contains:
   - the custom `Weather Agent Chat` span;
   - automatic `invoke_agent WeatherAgent` spans;
   - automatic `chat <model>` spans;
   - `execute_tool get_weather` spans only for tool calls that actually ran;
   - real durations, status, hierarchy, and safe attributes.
9. Bookmark and capture that exact trace as the fallback. Do not combine
   identifiers or spans from different runs.
10. In the Prompt-agent playground, start a new conversation and submit this
    synthetic prompt:

    > In one sentence, explain why trace telemetry needs access controls.

11. After the response completes, record the UTC timestamp and the response
    ID if the portal exposes it.
12. Open **Agents** > **Traces**. Refresh after ingestion, search by the
    response ID when available, or identify the newest trace by agent,
    timestamp, duration, and status.
13. Open the trace and step through its spans. If conversation results are
    available, open the conversation to show the response and ordered actions
    associated with the trace.
14. Bookmark and capture that exact Prompt-agent trace as the second fallback.
    Keep its identifiers separate from the WeatherAgent trace.

Both paths use synthetic prompts. The WeatherAgent sample intentionally
enables sensitive-data capture, so prompt, response, tool-argument, or
tool-result attributes may be visible. Keep both paths in a controlled
presenter environment.

## Prepared evidence contract

The live paths and fallbacks must use authentic telemetry. Label each capture
as **WeatherAgent client-side trace** or **Prompt-agent server-side trace**,
then include:

- **Observed evidence**
- run date/time and environment label
- trace ID and, when available, response ID
- agent name and version
- Agent Framework and Azure Monitor package versions for the WeatherAgent run
- whether the view is the live trace or a capture from the rehearsed run

Do not redraw missing spans, copy IDs between unrelated runs, or claim that a
tool ran when no `execute_tool` span exists. A documentation-based schematic
is allowed only as a fallback and must be labeled **Illustrative structure —
not an observed run**.

## Presenter actions and narration

### 0:00–0:30 — Frame the two paths

Show the WeatherAgent sample beside the prepared Prompt-agent playground.

Say:

> First we will inspect a client-side Agent Framework trace with automatic and
> custom spans. Then we will run a Prompt agent in Foundry and inspect the
> server-side trace that Foundry records without changing application code.

### 0:30–1:20 — Inspect the client-side instrumentation

Point first to `configure_azure_monitor()`, then to
`start_as_current_span()`.

Say:

> Configure Azure Monitor establishes the exporter and enables Agent
> Framework instrumentation. The framework supplies the standard operation
> spans. The explicit tracer call adds application-defined context around
> the whole chat session.

Point out that `enable_sensitive_data=True` is intentional for these
synthetic prompts, not a recommended production default. Also note that
`approval_mode="never_require"` is for sample brevity.

### 1:20–2:00 — Run WeatherAgent

Run the prepared command and keep the printed trace ID visible.

Say:

> The sample makes three agent calls in one session. The first two invite
> weather-tool use; the third does not. We will trust the emitted spans rather
> than assume which choices the model made.

### 2:00–3:15 — Inspect the WeatherAgent trace

Search by the printed trace ID and:

1. Open the `Weather Agent Chat` span.
2. Expand the automatic `invoke_agent`, `chat`, and any `execute_tool`
   children.
3. Compare real durations and status.
4. Open one safe attribute set and identify which context came from the
   framework versus the custom span.

Say:

> The custom span gives this sequence a business-readable boundary. The
> automatic spans explain the agent, model, and tool work inside it. Their
> shared trace ID and hierarchy let us inspect the complete recorded path.

### 3:15–4:00 — Run the Prompt agent

In the prepared Prompt-agent playground, start a new conversation and submit
the synthetic prompt.

Say:

> This Prompt agent runs inside Foundry. With Application Insights connected,
> Foundry records a server-side trace without adding tracing code to this
> playground interaction.

Keep the completed response visible long enough to establish which run you
will look for. Note the UTC timestamp and response ID if shown.

### 4:00–6:15 — Inspect the Prompt-agent trace

Open **Agents** > **Traces**, refresh, and select the matching recent trace.
If ingestion has not completed, switch immediately to the rehearsed capture.

1. Confirm the Prompt-agent name, timestamp, duration, and status.
2. Step through the spans in invocation order.
3. If shown, open the associated conversation and identify the response and
   ordered actions for this run.
4. Keep the Prompt-agent trace ID separate from the WeatherAgent trace ID.

Say:

> This is platform-managed server-side evidence for the Prompt-agent run. It
> shows the operations Foundry recorded inside its hosted boundary. The
> WeatherAgent trace showed application-owned context as well because the
> client added a custom parent span.

### 6:15–7:30 — Compare the recorded boundaries

Place the two trace overviews side by side or switch between the prepared tabs.

Say:

> Both are authentic OpenTelemetry traces stored through the project's
> Application Insights connection. The Prompt-agent trace starts with
> Foundry's server-side coverage. The WeatherAgent path adds client-side
> instrumentation, including a business-readable custom boundary. Neither
> trace proves answer quality or exposes unrecorded work.

### 7:30–8:00 — Close on the data boundary

Point to one safe captured prompt or tool attribute, then return to the two
trace overviews.

Say:

> The WeatherAgent sample enables sensitive-data capture so that trace is easy
> to inspect. In a real system, leave payload capture off unless there is a
> justified need and the telemetry access, retention, sampling, and cost
> controls are appropriate.

## Expected observations

- One `Weather Agent Chat` custom span groups the sample's three agent calls.
- Each agent call creates an automatic `invoke_agent WeatherAgent` span.
- Each model request creates an automatic `chat <model>` span.
- Each tool invocation that actually runs creates an automatic
  `execute_tool get_weather` span.
- The printed trace ID identifies the correlated trace shown in Foundry or
  Application Insights.
- Running the Prompt agent creates a separate server-side trace after
  Application Insights is connected; no client-side tracing code is required.
- The Prompt-agent trace can be located by recent time and agent, or by
  response ID when the portal exposes it.
- The two traces demonstrate different recorded boundaries and must retain
  separate identifiers.
- Durations and statuses explain recorded execution behavior; they do not
  establish answer quality.

## Fallback

Use the dated capture from the corresponding authentic rehearsed run if
execution, ingestion, the portal, or authorization fails. Keep the
observed-evidence label, agent/version, timestamp, trace ID, hierarchy,
durations, and status visible.

Prompt-agent traces can take a few minutes to appear. If the live playground
response succeeds but its trace is not yet visible, say that ingestion is
delayed and switch to the prepared Prompt-agent capture. Do not imply that the
capture belongs to the live response.

If no authentic WeatherAgent trace was obtained during rehearsal:

1. Do not run the sample live.
2. Show the two instrumentation points in the official sample.
3. Show the official documentation's automatic span names and a schematic
   labeled **Illustrative structure — not an observed run**.
4. State that no runtime hierarchy, duration, status, or tool-call behavior
   was observed.

Never fabricate a successful trace, tool call, duration, or correlation ID.

If no authentic Prompt-agent trace was obtained during rehearsal:

1. Do not promise the portal trace live.
2. Run the Prompt agent only if showing the playground interaction is still
   useful.
3. Show the official tracing setup documentation and state that no
   Prompt-agent runtime trace was observed in the rehearsal environment.

## Cleanup

- Close the Prompt-agent playground, trace, and evidence tabs.
- Close any local capture containing identifiers or captured payloads.
- Sign out of the presenter-only portal session if the device will be
  shared.
- Clear the presenter terminal and unset the two environment variables if
  they were configured only for the demo.
- Leave the existing Foundry project, custom-agent registration, Application
  Insights connection, roles, retention, and sampling unchanged.

## Official sources

- [Official Agent Framework Foundry tracing sample](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/observability/foundry_tracing.py)
- [Microsoft Agent Framework agent observability](https://learn.microsoft.com/agent-framework/agents/observability)
- [Set up tracing in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup)
- [Quickstart: Create a prompt agent](https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent)
- [Agent tracing overview](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
