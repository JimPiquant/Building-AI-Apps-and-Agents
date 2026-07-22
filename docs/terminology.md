# Terminology — say the same words the docs say

We use the exact vocabulary from the [Foundry Agent Service overview](https://learn.microsoft.com/en-us/azure/foundry/agents/overview) and the [`microsoft/agent-framework`](https://github.com/microsoft/agent-framework) samples. If a slide or lab uses a term, it means what the docs mean.

## Three ways to run an agent with Foundry

Foundry Agent Service is a managed platform. You choose how much of it you use.

| Term | Meaning | How you connect / build from MAF (Python) |
|------|---------|-------------------------------------------|
| **Prompt agent** | A Foundry-authored agent. No app code, no compute — Foundry runs it. Authored in the Foundry portal, or programmatically via SDK / REST. | Author in the portal or via the SDK. Connect from your application code: `FoundryAgent(project_endpoint, agent_name, agent_version, credential)` |
| **Hosted agent** | Your agent code (Agent Framework, LangGraph, OpenAI Agents SDK, Anthropic Agent SDK, GitHub Copilot SDK, or your own), packaged as a container or a zip. Foundry runs the container with a managed endpoint, autoscale, dedicated Entra identity, and end-to-end observability. Under the hood the code calls the Responses API for models and platform tools. | Author with `agent_framework`. Package as container (or zip; Foundry builds the image). Deploy via portal or CLI. Connect from external code: `FoundryAgent(project_endpoint, agent_name, credential)` |
| **Calling the Responses API from your own code** | Not an agent type — a **usage pattern**. Your agent code runs in your own process (laptop, Container Apps, App Service, AKS, Functions) and calls Foundry's Responses API for models and platform tools. **Additive to Hosted agents, not an alternative** — the same MAF code can be repackaged as a Hosted agent later. | `Agent(client=FoundryChatClient(...), instructions=..., tools=...)` |

**Key insight.** Prompt agents and Hosted agents both **run inside Foundry Agent Service**; Foundry manages the runtime for you. The third pattern runs in *your* process and only *uses* Foundry (via the Responses API).

All three paths use the [**Responses API**](https://learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/responses-api) as the single model + tools entry point.

C# mapping: the equivalents live in `Microsoft.Agents.AI.Foundry`. `AIProjectClient(...).AsAIAgent(...)` is the C# way to write "my code calling the Responses API."

## What Foundry Agent Service manages for you

Prompt agents and Hosted agents both benefit from these platform-managed features:

- **Managed endpoint** — a stable URL you (or another agent) call
- **Autoscale** — scales with request volume; Hosted agents also scale container instances per session
- **Agent identity** — a dedicated Microsoft Entra identity per agent, no shared credentials
- **Observability** — end-to-end tracing, metrics, Application Insights integration
- **Content safety** — integrated guardrails and prompt injection / XPIA mitigation
- **Publishing** — versioning, stable endpoints, distribution through Teams / Microsoft 365 Copilot / the Entra Agent Registry

Platform tools available through the Responses API for all three paths:

- **[Foundry Toolbox](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox)** — curated tools exposed through a single MCP-compatible endpoint (web search, code interpreter, file search, SharePoint, Fabric, MCP servers, custom skills)
- **Managed memory / managed conversations** — Foundry-managed conversation state (Hosted agents also support BYO memory stores)
- **[Foundry IQ](https://learn.microsoft.com/en-us/azure/foundry/agents)** — the enterprise knowledge / grounding layer (Day 2 deep dive)

## Actions

| Term | Meaning |
|------|---------|
| **Function tool** | A local Python or C# function decorated with `@tool` (or the C# equivalent) that MAF exposes to the model. |
| **Toolbox tool** | A tool exposed via **Foundry Toolbox** — MAF consumes them over an MCP endpoint (e.g., `MCPStreamableHTTPTool`, `MCPSkillsSource`). |
| **MCP server** | Any server implementing the Model Context Protocol. MAF can consume them (`hosting-mcp` package in Python; `ModelContextProtocol` samples in .NET) and you can author your own. |

## Knowledge

| Term | Meaning |
|------|---------|
| **Foundry IQ** | The enterprise knowledge / grounding layer in Azure AI Foundry — unified retrieval over connected data sources. |
| **AI Search** | Azure AI Search. Underlies parts of Foundry IQ and can be used directly for custom RAG. |
| **RAG** | Retrieval-Augmented Generation. |

## Runtime primitives

| Term | Meaning |
|------|---------|
| **Agent** | The MAF primitive that wraps a chat client, instructions, and tools. Has `.run()` and streaming `.run(stream=True)`. |
| **Thread** | The conversation state a single agent operates on. |
| **Run** | One turn (user message → agent response). |
| **Chat client** | The typed client that talks to a specific model service (e.g., `FoundryChatClient`, `OpenAIChatClient`). |

## Things we don't say

- ❌ **"Client-side agent"** — not used in Learn or the samples repo. Say **"my code calling the Responses API"** or **"Responses API from my own process"** instead.
- ❌ **"PromptAgent"** as a PascalCase noun — the docs use **"Prompt agent"** (two words, sentence case). `FoundryAgent` is the MAF *class*; the *concept* is a Prompt agent.
- ❌ **"HostedAgent"** as a PascalCase noun — same story. It's a **"Hosted agent"** in prose; `FoundryAgent(agent_name)` (no version) is how you connect to one.
- ❌ Framing the choice as "versioned vs. non-versioned." Prompt agents and Hosted agents both support versioning through Agent Service publishing. The **real** distinction is *no code / your code in a container*.
