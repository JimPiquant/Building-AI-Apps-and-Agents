---
title: OPTIONAL — Agent Harness + GitHub Copilot Agent
subtitle: Compare opinionated scaffolding with a separate coding-agent service integration
eyebrow: DAY 3 · MODULE 8 · OPTIONAL · 20 MIN
tag: Day 3 · Module 8 · OPTIONAL
deck: module-8-optional-harnesses.pptx
---

# Module 8 — OPTIONAL Agent Harness + GitHub Copilot Agent

## OPTIONAL — Agent Harness + GitHub Copilot Agent
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: Say that this module is optional and outside the 210-minute core. Learners already know the primitives; this compares an opinionated composition helper with a separate GitHub Copilot-backed Agent Framework integration. -->

- Awareness and comparison only · no required lab work

## OPTIONAL — Why look now?
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python -->
<!-- notes: The value is recognition, not a new required architecture. Learners can now identify the sessions, context providers, middleware, approvals, and evaluation decisions the harness composes. -->

- **No shortcut** — Harness does not replace your understanding of sessions, context providers, middleware, or evaluation
- **Harness shows scaffolding** — An opinionated, batteries-included composition
- **Copilot shows another backend** — A coding-oriented agent service/runtime
- **Optional by design** — Neither path replaces the primitives or is required for the Day 3 lab

## OPTIONAL — create_harness_agent architecture
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python -->
<!-- notes: The Harness composes existing Agent Framework building blocks; it does not define a second runtime. Python create_harness_agent takes a chat client and returns a configured normal Agent. -->

1. **Chat client** — Model connection you provide
2. **Chat pipeline** — Function loop, message injection, per-call history, compaction
3. **Providers** — Session instructions, todos, modes, file memory, optional capabilities
4. **Middleware** — Approval, observability, optional bounded looping
5. **Application UX** — Your app streams, displays progress, and collects approvals

## OPTIONAL — Capability and release boundaries
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python -->
<!-- notes: State current Python boundaries exactly. create_harness_agent is released. Background agents, file access, and looping remain experimental. Shell tooling comes from the pre-release agent-framework-tools package. Skills are opt-in in Python. -->

| Capability | Python harness status |
|---|---|
| create_harness_agent factory | Released |
| Todo tracking and plan/execute modes | Enabled by default |
| File memory | Enabled by default |
| Skills | Opt-in through provider or paths |
| Background agents, shared file access, looping | Experimental |
| Shell tooling | Pre-release `agent-framework-tools` package |

## OPTIONAL — GitHub Copilot is a separate agent integration
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python -->
<!-- notes: Correct the category error. GitHubCopilotAgent is a standard MAF agent service integration backed by the GitHub Copilot SDK. create_harness_agent expects a chat client. GitHubCopilotAgent is not documented as a chat client to pass into that factory. -->

- **Harness Agent**
  - `create_harness_agent(client=chat_client)`
  - Opinionated composition over a chat client
  - Returns a configured MAF Agent
- **GitHubCopilotAgent**
  - Separate MAF agent service integration
  - GitHub Copilot SDK owns its runtime/tool loop
  - Used directly as a standard MAF Agent

## OPTIONAL — GitHub Copilot capabilities
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: The Python integration supports sessions, streaming, context providers, function tools, Copilot SDK permissions, and MCP server configuration. Hosted Code Interpreter, File Search, and hosted Web Search are not exposed as those Agent Framework hosted tools. -->

- **Standard agent operations** — Run, stream, and reuse a session
- **Function tools** — Add custom callable tools
- **Coding runtime** — Shell, file operations, and URL fetching when permitted
- **MCP** — Local stdio and remote HTTP server configuration
- **Context providers** — Run before and after GitHub Copilot invocations

## OPTIONAL — Permissions are a hard boundary
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: By default the agent cannot execute shell commands, read or write files, or fetch URLs. Enabling those capabilities requires a permission handler. Official guidance recommends Docker or a dev container for agents with shell or file permissions. -->

1. **Default deny** — No shell, file read/write, or URL fetch
2. **Permission handler** — Your application approves or denies requests
3. **Least privilege** — Limit workspace, credentials, and network access
4. **Isolation** — Prefer Docker or a dev container for shell/file permissions
5. **Audit** — Record the request and decision

## OPTIONAL — No official direct composition pattern
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: Use precise wording: current official documentation presents these as separate construction paths and does not document passing GitHubCopilotAgent into create_harness_agent. Do not imply impossibility forever; say there is no official direct composition pattern today. -->

- **Do not teach** — `create_harness_agent(client=GitHubCopilotAgent(...))`
- **Why** — The factory contract is a chat client; GitHubCopilotAgent is an Agent
- **Supported view** — Choose one construction path for the application boundary
- **Future-proofing** — Re-check official docs if a composition API is released

## OPTIONAL — Choose the least opinionated fit
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: The decision is about who owns scaffolding and which backend capabilities you need. A plain Agent maximizes explicit control, Harness supplies general task scaffolding, and GitHubCopilotAgent integrates the Copilot coding runtime. -->

| Choice | Best fit | You still own |
|---|---|---|
| Plain Agent | Focused assistant with explicit composition | Every provider, tool, policy, and loop choice |
| Harness Agent | Long-running work needing opinionated scaffolding | Configuration, storage, permissions, UX, eval |
| GitHubCopilotAgent | Coding-oriented Copilot runtime capabilities | Permission handler, isolation, tools, eval |

## OPTIONAL — Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/harness?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot?tabs=python -->
<!-- notes: End without assigning lab work. Learners should recognize the options and their boundaries, then return to the core primitives when making a production design. -->

- You treat Harness as released, opinionated MAF scaffolding with experimental edges.
- You do not let scaffolding hide sessions, providers, middleware, approvals, or evaluation.
- You treat GitHubCopilotAgent as a separate standard MAF agent service integration.
- You isolate and explicitly permission shell and file capabilities.
- You do not assume an undocumented Harness + GitHubCopilotAgent composition.
