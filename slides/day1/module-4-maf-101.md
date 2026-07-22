---
marp: true
paginate: true
---

# Module 4 — MAF 101
### Core primitives, in Python and C#

Day 1 · 40 minutes

---

## What MAF is

The **Microsoft Agent Framework** is Microsoft's SDK for building agents. It gives you:

- One vocabulary — `Agent`, chat client, tool, thread, run
- Python (`agent_framework`) and C# (`Microsoft.Agents.AI`) with matching concepts
- First-class Foundry integration (`agent_framework.foundry` / `Microsoft.Agents.AI.Foundry`)
- Streaming, memory, structured outputs, tools, MCP, multi-agent, eval — all in one place

**MAF is the successor to Semantic Kernel and AutoGen for new work.**

---

## The primitives

| Primitive | What it is |
|-----------|------------|
| **Chat client** | A typed client that talks to a specific model service (e.g. `FoundryChatClient`) |
| **Agent** | Wraps a chat client with instructions and tools |
| **Thread** | The conversation state one agent operates on |
| **Run** | One turn (user message → agent response), non-streaming or streaming |
| **Tool** | A callable capability the model can invoke |
| **Message** | Individual user / assistant / tool messages that make up a thread |

You'll use all six every day this week.

---

## The simplest possible Python agent

```python
import asyncio
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="HelloAgent",
        instructions="You are a friendly assistant. Keep answers brief.",
    )
    result = await agent.run("What is the capital of France?")
    print(result)

asyncio.run(main())
```

That's it. Deployed model + credential + instructions.

---

## The simplest possible C# agent

```csharp
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

var endpoint = Environment.GetEnvironmentVariable("FOUNDRY_PROJECT_ENDPOINT")!;
var model = Environment.GetEnvironmentVariable("FOUNDRY_MODEL") ?? "gpt-4o";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(model: model,
               name: "HelloAgent",
               instructions: "You are a friendly assistant. Keep answers brief.");

Console.WriteLine(await agent.RunAsync("What is the capital of France?"));
```

Same shape, same primitives.

---

## Non-streaming vs. streaming

**Python:**

```python
# non-streaming: wait for the whole answer
result = await agent.run("Tell me a fun fact.")
print(result)

# streaming: process tokens as they arrive
async for chunk in agent.run("Tell me a fun fact.", stream=True):
    if chunk.text:
        print(chunk.text, end="", flush=True)
```

**C#:**

```csharp
Console.WriteLine(await agent.RunAsync("Tell me a fun fact."));

await foreach (var update in agent.RunStreamingAsync("Tell me a fun fact."))
{
    Console.Write(update);
}
```

Streaming matters for UX; we come back to it Day 3.

---

## Multi-turn conversations

Threads carry conversation state across runs. A single `agent` can be invoked repeatedly and remember prior turns:

```python
# Same agent, multiple runs on the same thread
r1 = await agent.run("My name is Alex.")
r2 = await agent.run("What's my name?")   # answer: Alex
```

Under the hood MAF is managing the thread for you. You can create explicit threads when you need to (Day 3 memory module).

---

## Authentication

Every MAF sample uses **Azure identity**, not API keys:

- **Dev on your laptop:** `AzureCliCredential()` — signs in via `az login`
- **CI / prod:** `DefaultAzureCredential()` or (better) an explicit `ManagedIdentityCredential`

**Never** commit API keys or connection strings. This gets enforced Day 5 in the identity module.

---

## Packages you'll touch this week

| Concern | Python package | C# package |
|---------|---------------|-----------|
| Core | `agent-framework` | `Microsoft.Agents.AI` |
| Foundry client | `agent-framework-foundry` | `Microsoft.Agents.AI.Foundry` |
| Foundry hosting | `agent-framework-foundry-hosting` | (via `Microsoft.Agents.AI.Foundry`) |
| AI Search | `agent-framework-azure-ai-search` | `Azure.Search.Documents` |
| MCP hosting | `agent-framework-hosting-mcp` | `ModelContextProtocol` samples |

Full pinned versions live in [`manifests/versions.md`](../../manifests/versions.md).

---

## The bridge to the next two modules

You've now seen a **client-side agent** — built with `Agent` + `FoundryChatClient` in Python, or `AIProjectClient.AsAIAgent(...)` in C#.

There's another way to run an agent: **have Foundry host it for you**. That's a **PromptAgent** or a **HostedAgent** in Foundry, connected via `FoundryAgent`.

Both matter. **Module 6** compares them.

Before that, **Module 5** gives us the mental model that ties everything together.

---

## Takeaways

- MAF's primitives are small and stable: chat client, agent, thread, run, tool, message.
- Python and C# APIs mirror each other closely.
- Auth is Azure identity end-to-end. No keys.
- The client-side agent you just saw is one of two hosting styles — hosted variants come in Module 6.

**Next:** the five-layer agent stack we'll refer to every day this week.
