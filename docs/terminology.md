# Terminology — say the same words the docs say

We use the exact vocabulary from the Microsoft Foundry docs and the `microsoft/agent-framework` samples. If a slide or lab uses a term, it means what the docs mean.

## Agent hosting
| Term | Meaning | How you construct it (Python) |
|------|---------|-------------------------------|
| **Client-side agent** | You build it in your app code. In-process thread state. | `Agent(client=FoundryChatClient(...), instructions=..., tools=...)` |
| **Foundry PromptAgent** | Server-hosted, **versioned**, portal-configured. | `FoundryAgent(project_endpoint=..., agent_name=..., agent_version=..., credential=...)` |
| **Foundry HostedAgent** | Server-hosted, **non-versioned**. | `FoundryAgent(project_endpoint=..., agent_name=..., credential=...)` |
| **FoundryLocalClient** (aside) | Local runtime; not used in this workshop. | Referenced only. |

C# uses `AIProjectClient(...).AsAIAgent(...)` for the client-side pattern and the `Microsoft.Agents.AI.Foundry` types for hosted variants.

## Actions
| Term | Meaning |
|------|---------|
| **Function tool** | A local Python or C# function decorated with `@tool` (or the C# equivalent) that MAF exposes to the model. |
| **Toolbox tool** | A tool exposed via the **Foundry Toolbox** — MAF consumes them over an MCP endpoint (e.g., `MCPStreamableHTTPTool`, `MCPSkillsSource`). |
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
- ❌ *"Prompt agent"* to mean "in-process agent." Use **client-side agent**. **PromptAgent** is a specific Foundry-hosted type.
- ❌ *"Hosted agent"* as a generic term. Use **Foundry-hosted agent** (which covers both PromptAgent and HostedAgent), or name the specific type.
