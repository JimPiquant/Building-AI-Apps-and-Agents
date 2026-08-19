---
marp: true
paginate: true
---

# Module 3 — Prompts & Context Engineering
### Everything that goes into the model on every turn

Day 1 · 25 minutes

---

## Why this module

Agents don't make prompt engineering obsolete — they concentrate it.

Every agent has:
- **Instructions** (the system prompt) that define behavior
- **Tool descriptions** the model reads to decide *when* to call something
- **Structured output schemas** whose field names and doc strings are prompts too

Sloppy prompts here cascade through your whole workflow.

---

## Anatomy of a good system prompt

Four sections you almost always want:

1. **Role and scope** — who the agent is, what it may and may not help with
2. **How to respond** — tone, length, format, when to say "I don't know"
3. **How to use tools** — when to call which tool, and what to do with the result
4. **Boundaries and safety** — refusals, privacy, tenant scope

Keep it under ~500 words. If it's longer, your instructions are probably doing what tools or knowledge should be doing.

---

## Anti-patterns

- **The wall of rules.** 40 numbered "do not" statements. The model will still violate at least one.
- **The example dump.** Ten worked examples in the system prompt. Move to few-shot messages, not instructions.
- **Prompting the wrong layer.** "Search the docs for X" is a *tool call*, not a system-prompt sentence.
- **Vague identity.** "You are a helpful assistant." Every model already thinks that. Be specific.
- **Forgetting the audience.** A prompt for engineers looks different than one for store associates.

---

## Two techniques worth investing in

### 1. Structured instructions
Use short, labeled sections. Models attend better to `## Role` / `## Rules` / `## Output format` than to a wall of paragraphs.

### 2. Explicit output contracts
Tell the model *exactly* what shape you want. Better yet, use **structured outputs** (typed models — Day 3) so the shape is enforced, not requested.

---

## What's actually in the context window?

Prompts are one input. On every turn the model actually sees:

- **System instructions** — the agent's persona, rules, output format
- **The user message** — what the human just typed
- **Session history** — prior turns, the multi-turn memory
- **Tool outputs** — results from any tool the model called
- **Retrieved documents** — chunks pulled from RAG / Foundry IQ
- **Injected context** — anything a context provider added (user profile, time, memory)

The system prompt is what you write once. **Everything else is what you have to design.** That's context engineering.

*Grounded in [Learn — Adding Context Providers](https://learn.microsoft.com/agent-framework/journey/adding-context-providers).*

---

## Two ways to get information into the model

Not everything belongs in the prompt. MAF gives you two distinct mechanisms:

| Aspect | Tools | Context providers |
|---|---|---|
| **Trigger** | Reactive — model decides when to call | Proactive — runs on every invocation |
| **Control** | Model-driven (which tool, when, args) | Developer-driven (always available) |
| **Visibility** | Model must know a tool exists and judge it relevant | Injected transparently as part of the prompt |
| **Use case** | On-demand actions and lookups | Always-present context |
| **Token cost** | Only when the tool is called | Every invocation |

**Rule of thumb:** if the agent should have this information *every single time* it runs, use a **context provider**. If only *when relevant*, use a **tool**.

*Grounded in [Learn — Adding Context Providers](https://learn.microsoft.com/agent-framework/journey/adding-context-providers) — "Why not just use tools?"*

---

## The context lifecycle

Every `agent.run(...)` call has three phases. Context providers hook into the first and third.

```
┌──────────────────────────────────────────────────────────────┐
│  Caller: agent.run("What's the return policy?")              │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  BEFORE RUN — each provider injects context                  │
│    • History provider loads past messages                    │
│    • Memory provider retrieves relevant facts                │
│    • RAG provider searches knowledge base                    │
│    • Custom provider injects user profile, time, location    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AGENT CORE — model sees input + all injected context        │
│  and generates a response                                    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  AFTER RUN — each provider processes the response            │
│    • History provider saves new messages                     │
│    • Memory provider extracts facts to remember              │
│    • Custom provider updates session state                   │
└──────────────────────────────────────────────────────────────┘
```

You register providers once when creating the agent. They participate in every invocation without extra code.

*Diagram adapted from [Learn — Adding Context Providers](https://learn.microsoft.com/agent-framework/journey/adding-context-providers).*

---

## The tradeoffs

More context isn't automatically better. Five things to design for:

| Consideration | What can go wrong |
|---|---|
| **Token budget** | Injected context consumes tokens on every turn. Unbounded history + RAG + profiles → context truncated silently, important info lost. |
| **Retrieval latency** | Providers that hit databases, search indexes, APIs add latency to every invocation. Cache, pool connections, go async. |
| **Relevance** | Irrelevant context doesn't just waste tokens — it degrades responses by diluting the signal. |
| **Staleness** | Cached or preloaded context can become outdated. Design refresh cadence deliberately. |
| **Composability** | Multiple providers writing into the same context window interact in unexpected ways. Test them together, not just individually. |

**Compaction** (summarizing older history) is the escape valve when context grows. Day 3 memory module covers it.

*Grounded in [Learn — Adding Context Providers](https://learn.microsoft.com/agent-framework/journey/adding-context-providers) — "Considerations" table.*

---

## Iteration loop

Don't tune prompts in your head. Loop like this:

1. Pick a small **eval set** (5–20 realistic inputs with expected behaviors)
2. Run the current prompt against it
3. Read the failures
4. Change **one thing**
5. Rerun

You'll see this loop again Day 2 (retrieval eval) and Day 4 (workflow eval). The habit starts today.

---

## Prompts inside MAF

In MAF you write instructions once — at agent construction time:

```python
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions=(
        "## Role\n"
        "You are a technical documentation assistant.\n\n"
        "## Rules\n"
        "- Cite sources for factual claims.\n"
        "- Say 'I don't know' when you don't.\n"
    ),
)
```

For **Foundry PromptAgent**, the instructions and version live in the portal. That's the point of PromptAgent — instructions become a shipped artifact.

---

## Tool descriptions are prompts too

MAF sends every tool's docstring to the model. Write them like you'd write a prompt.

```python
@tool
def create_ticket(title: str, body: str, priority: str) -> str:
    """Create a support ticket.

    Use this when the user reports a problem that needs a human
    engineer to resolve. Do NOT use for questions you can answer
    from documentation. Priority must be one of low, med, high.
    """
    ...
```

Bad docstrings = the model calls the wrong tool at the wrong time.

---

## Takeaways

- Prompts still matter — you'll just write fewer of them, more carefully.
- Structure > prose. Contracts > pleas.
- Iterate against an eval set, not against your intuition.
- Every instruction, tool docstring, and output schema is a prompt.

**Next:** MAF 101 — the core primitives you'll use through the rest of the workshop.
