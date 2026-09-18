---
title: Foundry Toolkit for VS Code
subtitle: Pick the right development surface without confusing storage, inference, or runtime capabilities
eyebrow: DAY 5 · MODULE 2 · 15 MIN
tag: Day 5 · Module 2
deck: module-2-foundry-toolkit-vscode.pptx
---

# Module 2 — Foundry Toolkit for VS Code

## Foundry Toolkit for VS Code
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code -->
<!-- notes: Allow 1 minute. Position Toolkit as a VS Code development extension that brings local and Foundry resources into one workspace. The goal is surface selection, not a feature tour or deployment exercise. Continue with the presenter-prepared reference workflow; no attendee project, agent, or prior lab output is required. -->

- Use the right surface for one development question — and know what that surface does not prove.

## Toolkit, Toolbox, and coding skills
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview | https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill -->
<!-- notes: Allow 2 minutes. Toolkit is the VS Code extension. Toolbox is a managed, reusable collection exposed through an MCP-compatible endpoint; browsing a tool or toolbox neither attaches it nor grants downstream authorization. A Foundry coding skill guides Copilot or another coding agent through development work; it is not automatically a tool or skill available to the customer-facing agent. Prompt-agent Toolbox attachment is preview and off by default. -->

- **Toolkit** — VS Code extension with My Resources and Developer Tools for the development workflow
- **Toolbox** — A managed reusable tool collection behind one MCP-compatible endpoint
- **Foundry coding skill** — Reusable guidance used by Copilot or another coding agent during development
- **Boundary** — Discovery is not attachment, approval, authorization, or a runtime capability

## Name the object before choosing the view
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/concepts/runtime-components | https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code -->
<!-- notes: Allow 2 minutes. A model performs inference. An agent adds reusable instructions and tools around a model. A conversation persists history across turns. The storage badge describes where a prompt configuration is kept, not where inference runs. Model Playground is for model interactions; agent investigation must also account for instructions, tools, conversations, and runtime activity. -->

- **Model** — Performs inference for a prompt and selected parameters
- **Agent** — Combines model-driven behavior with instructions and tools
- **Conversation** — Persists dialogue history across turns
- **Storage badge** — Says where the prompt configuration is stored, not where the model computes

## Local prompt versus saved Foundry agent
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle -->
<!-- notes: Allow 2 minutes. Read the columns as capability boundaries, not a maturity ranking. A Local badge can sit beside a cloud model. Local prompts have their own local-tool, structured-output, and dataset-evaluation paths. A saved Foundry agent creates immutable versions and enables version-linked conversations, tracing, generated client code, and service evaluation paths. Unsaved edits are drafts; save before relying on version evidence, and verify which version generated evaluation code actually targets. -->

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
<!-- source: https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector | https://learn.microsoft.com/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code | https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code -->
<!-- notes: Allow 6 minutes. Agent Inspector is a preview, browser-based view of a presenter-prepared local HTTP/SSE agent. Show streaming response and tool activity, and show workflow visualization only if the rehearsed language and installed Toolkit version support it. The localhost target is not a deployed endpoint, and opening Inspector does not automatically export the cloud trace seen in Module 1. -->

Open the preview Agent Inspector against the prepared agent on localhost. Send the same synthetic scenario, inspect streaming and tool activity, and show workflow visualization only where rehearsed support exists. Keep the boundary explicit: local HTTP/SSE inspection is not a deployed Foundry endpoint or automatic cloud trace export.

## Choose the surface — then verify the target
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code | https://learn.microsoft.com/azure/foundry/agents/how-to/agent-inspector | https://learn.microsoft.com/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code | https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill -->
<!-- notes: Allow 2 minutes. Run the checkpoint: point to a Local badge beside an existing cloud model and ask whether data necessarily stays on the laptop and whether its evaluation view matches a saved Foundry agent. Both answers are no; inspect the model endpoint and configuration type. Exact Toolkit features vary by installed version, so use the extension view as the inventory and do not promise unsupported workflow visualization. -->

- Discover models in Model Catalog and compare prompts and parameters in Model Playground; do not deploy one here.
- Configure instructions and attached tools in Agent Builder; save before depending on a Foundry version.
- Inspect a prepared local HTTP/SSE runtime with Agent Inspector; it is not the deployed-agent endpoint.
- Find existing evaluations, conversations, logs, and traces under project resources; cloud traces remain Foundry/Application Insights evidence.
- Treat Copilot coding skills as development guidance and agent tools as runtime capabilities — never interchange them.
