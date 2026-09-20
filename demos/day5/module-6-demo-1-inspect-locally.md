# Module 6 · Demo 1 — Inspect the reference workflow locally

## Objective

Use the preview Agent Inspector to inspect streaming responses and tool
activity from a presenter-prepared agent that exposes the familiar
Planner/Retriever/Critic scenario over local HTTP/SSE. Establish that the
Inspector is a local runtime view, not a deployed endpoint and not an
automatic cloud-trace exporter.

The demo runs existing local code and uses existing model access. It does
not deploy, publish, provision, attach a Toolbox, change permissions, or
modify a Foundry resource.

## Placement and time box

- **Placement:** After slide 4, “Local prompt versus saved Foundry agent”
- **Time:** 6 minutes total
  - 45 seconds: verify target and configuration
  - 3 minutes 15 seconds: send and inspect one turn
  - 1 minute: continue the conversation and inspect identifiers
  - 1 minute: boundary checkpoint and close

## Prerequisites

Complete these before the session:

- The .NET Runtime required by Foundry Toolkit is installed.
- The installed Foundry Toolkit and `azd` Foundry extensions match the
  versions used in rehearsal. Record both versions.
- If the prepared wrapper uses a local model through Foundry Local, validate
  the local environment prerequisites before rehearsal. This module does not
  require a local model.
- `azd auth login` is complete for the presenter account if the prepared
  wrapper calls an existing cloud model.
- A presenter-prepared local agent wrapper implements the HTTP/SSE contract
  expected by Agent Inspector.
- The wrapper uses only the synthetic reference corpus and the synthetic
  prompt below.
- Any model endpoint or credential required by the wrapper is already
  configured outside source control. Never display keys or tokens.
- Ports `8087` and `8088` are available, or alternate ports are selected
  and rehearsed.
- Workflow visualization support has been verified for the prepared
  language and installed Toolkit version. If it is unavailable, plan to
  show the activity stream only.

Agent Inspector is preview. Detailed workflow visualization varies by
language and installed Toolkit version; do not promise parity that was not
verified during rehearsal.

## Exact setup

Use the presenter-prepared agent project; do not initialize a new project
live.

1. Open the prepared project folder in VS Code and select the intended
   existing Foundry project context, if the wrapper uses one.
2. In terminal 1, start the local agent without auto-opening the Inspector:

   ```bash
   azd ai agent run --no-inspector
   ```

3. Confirm the terminal reports that the agent is listening on
   `http://localhost:8088`. Do not substitute a deployed URL.
4. In terminal 2, launch the Inspector:

   ```bash
   azd ai inspector launch
   ```

5. Confirm the browser UI is served on `http://localhost:8087` and targets
   the local agent on `http://localhost:8088`.
6. In the wrapper configuration, identify the selected model by safe name
   and provider only. If it is a cloud model, prepare to state explicitly:
   “The agent is local; inference is not.”
7. Clear the Inspector to a fresh local session and keep the synthetic
   prompt ready to paste.
8. If Module 1 used an authentic run, keep its evidence closed during this
   demo. Opening Inspector does not automatically correlate or export this
   local run to that cloud trace.

If alternate ports are required, use the documented form and show the real
values:

```bash
azd ai inspector launch --port 9000 --inspector-port 9001
```

The agent must already be listening on the matching target port.

## Synthetic and prepared inputs

Use exactly this prompt against the same synthetic reference corpus as
Module 1:

> Using only the supplied synthetic Contoso Cloud Platform documents,
> explain the required response to an HTTP 429 and when an operator should
> escalate. Cite the source filenames. If the documents do not establish a
> detail, state the gap instead of inventing it.

For the continuation turn, use:

> Which cited document supports the escalation condition? Name only that
> filename and the evidence gap, if any.

Do not enter attendee, customer, employee, credential, or production data.

The prepared input set also includes the preconfigured local wrapper, the
synthetic corpus, a safe model/provider label, the recorded extension
versions, and an authentic rehearsal capture for fallback.

## Presenter actions and narration

### 0:00–0:45 — Verify what is local

Show the two localhost URLs and the safe model/provider label.

Say:

> The Inspector UI is local on port 8087 and the agent’s HTTP/SSE endpoint
> is local on port 8088. That does not tell us where inference runs. This
> prepared wrapper calls the model shown here. Local storage or a localhost
> runtime is not a claim that data or inference stays on this laptop.

Also say:

> This Inspector endpoint is not a deployed Foundry endpoint.

### 0:45–4:00 — Send one turn and inspect activity

Paste the synthetic prompt and send it.

As the run progresses:

1. Point out that response fragments arrive over SSE.
2. Open the recorded tool activity and identify the retrieval request and
   result using only the synthetic corpus.
3. Point out the final response separately from intermediate activity.
4. If rehearsed workflow visualization is available, open it and identify
   Planner, Retriever, Critic, and the observed route.
5. If visualization is unavailable, stay on the activity stream and say
   that support differs by language and installed version.

Say:

> Agent Inspector exposes local request, response, streaming, and tool
> activity while we iterate. It does not change the code or configuration.
> The activity shown here is runtime evidence, not proof of answer quality.

Do not narrate private chain-of-thought. Describe only displayed operations,
messages, tool calls, statuses, and outputs.

### 4:00–5:00 — Continue the conversation

Record the real local conversation or session ID shown by the Inspector,
then send the continuation prompt.

Say:

> Reusing this conversation ID continues local dialogue history. It is not
> a trace ID, and it does not make this local run the same execution as the
> prepared cloud trace from Module 1.

Point out whether the tool is called again based on the actual activity. Do
not claim that a call was skipped or reused unless the Inspector shows it.

### 5:00–6:00 — Run the surface checkpoint

Ask:

> If this prompt is stored locally while its configuration uses a cloud
> model, does local storage prove local inference?

Expected response: no; inspect the model endpoint to determine where inference
runs.

Then ask:

> Would opening Agent Inspector create a deployed endpoint or automatically
> export a cloud trace?

Expected response: no. It targets the local HTTP/SSE agent. Telemetry export
requires separate instrumentation and exporter configuration.

Close with:

> Use Toolkit to select the development surface. Use Toolbox to manage a
> reusable runtime tool collection. Use Copilot coding skills as development
> guidance. None of those labels substitutes for inspecting the actual
> model, agent version, attached tools, authorization, or telemetry target.

## Expected observations

- The Inspector UI is served locally and targets a local HTTP/SSE agent.
- Response fragments stream before final completion.
- The Inspector exposes recorded tool activity for the synthetic retrieval.
- Workflow visualization appears only if the rehearsed language and
  installed version support it.
- A continued turn reuses a local conversation or session identifier; that
  identifier is not presented as a trace ID.
- The model can still be cloud-hosted even though the wrapper and Inspector
  are local.
- No deployed endpoint, cloud trace, Foundry agent version, Toolbox
  attachment, or authorization grant is created by opening Inspector.

The exact answer and tool-call count can vary. Narrate the behavior actually
observed rather than a predetermined success story.

## Fallback

If the local server, SSE stream, model call, or Inspector UI fails, use a
captured walkthrough from the same rehearsed setup. The capture must show:

- **Observed evidence** label
- Toolkit and `azd` extension versions
- localhost UI and agent targets
- real conversation/session ID
- actual streamed response and tool activity
- whether workflow visualization was supported
- capture date and environment label

If no authentic successful rehearsal exists, do not fabricate an Inspector
session. Show the official Inspector documentation and label the sequence
**Documented interface — not an observed run**. State that streaming, tool
activity, and visualization were not verified in the presenter environment.

If only workflow visualization fails, continue with the authentic activity
stream and name the limitation; do not substitute an invented graph.

## Cleanup

1. Clear the synthetic local conversation if the Inspector offers that
   action.
2. Close the Inspector browser tab.
3. Stop `azd ai inspector launch` with `Ctrl+C`.
4. Stop `azd ai agent run --no-inspector` with `Ctrl+C`.
5. Confirm ports `8087` and `8088` are no longer serving the demo.
6. Close terminals that display local identifiers.
7. Leave existing Foundry projects, model deployments, agent versions,
   Toolbox resources, permissions, and telemetry configuration unchanged.

## Official sources

- [Foundry Toolkit for Visual Studio Code](https://code.visualstudio.com/docs/intelligentapps/overview)
- [Microsoft Foundry Toolkit for Visual Studio Code overview](https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code)
- [Inspect a local agent with Agent Inspector](https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector)
- [Create hosted agent workflows in Toolkit](https://learn.microsoft.com/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code)
- [Create prompt agents and local prompts in Toolkit](https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code)
- [Use the Microsoft Foundry Skill in coding agents](https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill)
- [What is Toolbox in Foundry?](https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview)
