---
title: Foundry Toolkit for VS Code
subtitle: Pick the right development surface without confusing storage, inference, or runtime capabilities
eyebrow: DAY 5 · MODULE 2 · 21 MIN
tag: Day 5 · Module 2
deck: module-2-foundry-toolkit-vscode.pptx
---

<!-- additional module grounding: https://code.visualstudio.com/docs/intelligentapps/overview -->

# Module 2 — Foundry Toolkit for VS Code

## Foundry Toolkit for VS Code
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://code.visualstudio.com/docs/intelligentapps/overview -->
<!-- notes: Allow 1 minute. Position Toolkit as the current VS Code extension for discovering, building, testing, deploying, evaluating, and monitoring AI apps and agents across local and cloud resources. It supports Foundry, external-provider, and local models. Foundry Toolkit is the current name for AI Toolkit and includes capabilities previously provided by the separate Foundry extension. The presenter environment requires the .NET Runtime; validate Foundry Local prerequisites only if showing a local model, which this module does not require. The goal is surface selection, not a feature tour or deployment exercise. Continue with the presenter-prepared reference workflow; no attendee project, agent, or prior lab output is required. -->

- Use one VS Code workspace to discover, build, inspect, evaluate, deploy, and monitor — then verify the target behind each surface.

## How the Toolkit workspace is organized
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/get-started-projects-visual-studio-code#how-the-toolkit-workspace-is-organized | https://code.visualstudio.com/docs/intelligentapps/overview#_explore-foundry-toolkit -->
<!-- notes: Allow 2 minutes. Foundry Toolkit separates resources that you have from actions that you can take. My Resources groups Local Resources, Your Foundry Project, and Connected Resources. Developer Tools groups work into Discover, Build, and Monitor. Help and Feedback links to documentation, release information, issue reporting, and the community. Exact entries can change as the extension evolves, so use the installed Toolkit view as the authoritative inventory. -->

- **My Resources — what you have**
  - Local Resources
  - Your Foundry Project
  - Connected Resources
- **Developer Tools — what you can do**
  - Discover
  - Build
  - Monitor
- **Help and Feedback — where to get guidance**
  - Documentation and What's New
  - Report Issues
  - Join Community

## Toolkit, Toolbox, and coding skills
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview | https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill -->
<!-- notes: Allow 2 minutes. Toolkit is the VS Code extension. Toolbox is a managed, reusable collection exposed through an MCP-compatible endpoint; browsing a tool or toolbox neither attaches it nor grants downstream authorization. A Foundry coding skill guides Copilot or another coding agent through development work; it is not automatically a tool or skill available to the customer-facing agent. Prompt-agent Toolbox attachment is preview and off by default. -->

- **Toolkit** — VS Code extension with My Resources and Developer Tools for the development workflow
- **Toolbox** — A managed reusable tool collection behind one MCP-compatible endpoint
- **Foundry coding skill** — Reusable guidance used by Copilot or another coding agent during development
- **Boundary** — Discovery is not attachment, approval, authorization, or a runtime capability

## Local prompt versus saved Foundry agent
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle -->
<!-- notes: Allow 2 minutes. Read the columns as capability boundaries, not a maturity ranking. A locally stored prompt can still use a cloud model, so storage location does not identify where inference runs. Local prompts have their own local-tool, structured-output, and dataset-evaluation paths. A saved Foundry agent creates immutable versions and enables version-linked conversations, tracing, generated client code, and service evaluation paths. Unsaved edits are drafts; save before relying on version evidence, and verify which version generated evaluation code actually targets. -->

- **Locally stored prompt**
  - May still call a cloud model; local storage is not local inference
  - Local tools, structured output, and dataset evaluation follow local-prompt paths
  - No Foundry agent version or Foundry conversation-history record
- **Saved Foundry agent**
  - Save creates an immutable version; unsaved edits remain a draft
  - Tools and evaluation options follow Foundry-agent capabilities
  - Save before version-linked conversations, tracing, evaluation, or generated client code

## DEMO 2.1 — Inspect the reference workflow locally
<!-- layout: demo -->
<!-- demo-time: ~6 min -->
<!-- demo-reference: Runbook: demos/day5/module-2-demo-1-inspect-locally.md -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector | https://learn.microsoft.com/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code | https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://code.visualstudio.com/docs/intelligentapps/overview -->
<!-- notes: Allow 6 minutes. Agent Inspector is a preview, browser-based view of a presenter-prepared local HTTP/SSE agent. Show streaming response and tool activity, and show workflow visualization only if the rehearsed language and installed Toolkit version support it. The localhost target is not a deployed endpoint, and opening Inspector does not automatically export the cloud trace seen in Module 1. -->

Open the preview Agent Inspector against the prepared agent on localhost. Send the same synthetic scenario, inspect streaming and tool activity, and show workflow visualization only where rehearsed support exists. Keep the boundary explicit: local HTTP/SSE inspection is not a deployed Foundry endpoint or automatic cloud trace export.

## DEMO 2.2 — Trace local code in Toolkit
<!-- layout: demo -->
<!-- demo-time: ~6 min -->
<!-- demo-reference: Runbook: demos/day5/module-2-demo-2-trace-local-code.md -->
<!-- source: https://code.visualstudio.com/docs/intelligentapps/tracing | https://learn.microsoft.com/agent-framework/agents/observability -->
<!-- notes: Allow 6 minutes. Open Developer Tools > Monitor > Tracing and start the Toolkit's local OTLP collector before running the prepared Agent Framework WeatherAgent sample. The sample exports to the collector on localhost:4317; refresh the trace list and inspect the Weather Agent Chat trace, automatic agent/model/tool spans, durations, status, and metadata. Content capture is enabled only for the synthetic weather prompts used in this controlled demonstration. Local trace storage is separate from Application Insights, and the configured Foundry model still performs inference remotely. Stop the collector and remove the local demo traces during cleanup. -->

Start the Toolkit's local OTLP collector, run the prepared Agent Framework weather sample, and refresh the Tracing view. Open the `Weather Agent Chat` trace and inspect the agent, model, and tool spans. Keep the boundary explicit: the traces are stored locally, but the configured Foundry model can still perform inference remotely.

## Foundry Toolkit: Foundry Features in VS Code
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector | https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code | https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill | https://code.visualstudio.com/docs/intelligentapps/overview -->
<!-- notes: Allow 2 minutes. Run the checkpoint: point to a locally stored prompt configured with an existing cloud model and ask whether its storage location proves that data and inference remain on the laptop or that its evaluation view matches a saved Foundry agent. Both answers are no; inspect the model endpoint and configuration type. Exact Toolkit features vary by installed version, so use the extension view as the inventory and do not promise unsupported workflow visualization. -->

- **Discover** — Compare models in Model Catalog and find MCP servers or toolboxes in Tool Catalog.
- **Build** — Configure prompt agents, inspect a local HTTP/SSE runtime, and deploy only through the intended Foundry path.
- **Monitor** — Use tracing and evaluation for observed evidence; a development view is not proof of runtime quality.
- **My Resources** — Reopen project evaluations, conversations, logs, traces, models, and agents.
- **Verify the target** — Check storage, model endpoint, saved version, attached tools, authorization, and telemetry destination.
