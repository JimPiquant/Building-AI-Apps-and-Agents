---
marp: true
paginate: true
---

# Module 4 — Tools Layer Deep Dive
### How agents *do* things beyond talking

Day 2 · 35 minutes

---

## Where we are in the stack

Modules 1–3 covered **Knowledge**. Modules 4–7 cover **Actions**.

- **Model** — your Foundry-deployed model
- **Runtime** — Prompt agent, Hosted agent, your own code + Responses API
- **Actions** ← **Modules 4–7**
- **Knowledge** — Modules 1–3
- **Ops** — Day 5

Actions are how the agent *does* things. Retrieval was how it *knows* things.

---

## Module 4's job

This module is the **framing module** for Actions.

- **Module 4** — what function calling is, why tools work, tool schema anatomy, error contracts, streaming — the concepts you need to reason about any tool
- **Module 5** — Foundry Toolbox (managed tools you attach)
- **Module 6** — authoring your own function tools in MAF
- **Module 7** — combining knowledge + tools (bringing it together)

You leave Module 4 knowing *how tool calling works under the hood*. Module 6 turns that into code.

---

## The function-calling model in one picture

```
User: "What's the weather in Amsterdam?"

  ↓
Agent calls model with:
  - system prompt (instructions)
  - user message
  - list of tool schemas [{name, description, params}, ...]

  ↓
Model returns: tool_call(name="get_weather", args={"location": "Amsterdam"})

  ↓
Agent invokes get_weather("Amsterdam") locally, gets: "cloudy, 15°C"

  ↓
Agent calls model again with tool result appended to conversation

  ↓
Model returns: "The weather in Amsterdam is cloudy with a high of 15°C."
```

The model never runs your code. It emits *intent* — your process runs the code. This is the fundamental contract.

---

## Why this works — the model as decision-maker

The model doesn't know how to check the weather. It knows:

- **When** to use a weather tool (based on the tool description)
- **What arguments** to pass (based on the parameter schema and descriptions)
- **What to do with the result** (based on the tool's return value and shape)

The model is picking from a menu of tools you defined. Your tool schema *is* the menu. Bad schema = bad picks.

*Source: [Using function tools with an agent (MAF)](https://learn.microsoft.com/en-us/agent-framework/tutorials/agents/function-tools)*

---

## Tool schema anatomy

Every function tool exposes four things to the model:

| Field | What the model uses it for |
|---|---|
| **Name** | Referenced when calling — should be a clean identifier |
| **Description** | The primary "when to call this" signal |
| **Parameter schema** | Types, required/optional, per-param descriptions |
| **Return type** | What comes back after the tool runs |

The description carries more weight than most attendees realize. Modules 3 and 6 both come back to this.

---

## In MAF — the shortest possible tool

Python — any function is a tool:

```python
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    return f"The weather in {location} is cloudy with a high of 15°C."

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    instructions="You are a helpful weather assistant.",
    tools=[get_weather],
)
```

Docstring becomes the description. Pydantic `Field(description=...)` becomes the parameter description. Type hints become the schema.

You'll see this again in Module 6 with more depth. Note the shape now.

---

## In MAF — the C# equivalent

Same shape, different syntax:

```csharp
[Description("Get the weather for a given location.")]
static string GetWeather(
    [Description("The location to get the weather for.")] string location)
    => $"The weather in {location} is cloudy with a high of 15°C.";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: "gpt-5.4-mini",
        instructions: "You are a helpful assistant",
        tools: [AIFunctionFactory.Create(GetWeather)]);
```

Attribute-based description; `AIFunctionFactory.Create` wraps the method. Same primitives, same model-facing contract.

---

## The @tool decorator — when you want control

Explicit name, description, and other options via `@tool`:

```python
from agent_framework import tool

@tool(name="weather_tool", description="Retrieves weather information for any location")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    return f"The weather in {location} is cloudy with a high of 15°C."
```

Use when:
- The function's Python name isn't what you want the model to see
- You want the description in one place instead of a docstring
- You need parameters like `approval_mode` (Day 5) or explicit schemas (next slide)

Both patterns coexist — implicit for simple tools, `@tool` when you need control.

---

## Explicit schemas

When you need full control, pass a Pydantic model or a raw JSON schema:

```python
class WeatherInput(BaseModel):
    location: Annotated[str, Field(description="The city name")]
    unit: Annotated[str, Field(description="celsius or fahrenheit")] = "celsius"

@tool(name="get_weather", description="Get current weather.", schema=WeatherInput)
def get_weather(location: str, unit: str = "celsius") -> str:
    return f"Weather in {location} is 22 degrees {unit}."
```

Use when:
- You want the schema documented in one place (not spread across type hints)
- You're generating tools programmatically
- You need enum constraints, min/max, or other validation the type system can't express

---

## Runtime context — hidden from the model

Some values shouldn't be model-visible: the calling user, the session, a database handle.

```python
@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
    ctx: FunctionInvocationContext,
) -> str:
    user_id = ctx.kwargs.get("user_id", "unknown")
    print(f"Getting weather for user: {user_id}")
    return f"The weather in {location} is cloudy with a high of 15°C."

# Caller passes runtime context via function_invocation_kwargs
await agent.run("What's the weather in Amsterdam?",
    function_invocation_kwargs={"user_id": "user_123"})
```

`ctx` is injected by the framework. It's hidden from the schema the model sees.

Use for logging, personalization, tenancy — anything the model shouldn't be told about.

---

## Tool description patterns that work

The description is a mini-prompt. Same discipline as Day 1 Module 3.

**Structure:**
1. **What** it does — one clear sentence
2. **When** to use it — the condition that triggers this tool
3. **When *not*** to use it — differentiate from other tools
4. Parameter descriptions — what each param means, valid values, examples

```python
@tool
def create_ticket(title: str, body: str, priority: str) -> str:
    """Create a support ticket for a problem that needs a human engineer.

    Use this when the user reports a problem you cannot answer from
    documentation. Do NOT use for questions you can answer directly.

    Priority must be one of: low, med, high.
    """
    ...
```

Bad descriptions = the model calls the wrong tool at the wrong time.

---

## Streaming tool progress

For long-running tools, don't block the user. MAF streams tool-call events alongside model tokens:

```python
async for event in agent.run("Look up my account status", stream=True):
    if event.type == "tool_call_start":
        print(f"→ calling {event.tool_name}({event.args})")
    elif event.type == "tool_call_result":
        print(f"← {event.tool_name} returned")
    elif event.text:
        print(event.text, end="", flush=True)
```

Tool call, tool result, tokens — all in one async stream. Attendees see this fire in Module 6's lab.

Day 3 goes deeper on streaming UX and cancellation.

---

## Error contracts

Your tool will fail. What does it return?

- **String describing the error** — model can incorporate ("I couldn't reach the weather service, try again in a moment")
- **Structured error object** — model can retry with different args or route to a different tool
- **Raise an exception** — MAF surfaces it back to the model with the exception message

Rule of thumb: **return errors as data**, not exceptions, when you want the model to decide what to do next. Raise when the failure is unrecoverable.

Day 3 covers robust agents in depth — retries, timeouts, guardrails.

---

## Approval mode

For tools with side effects (create a ticket, send an email, delete a record), you don't always want the model to fire them autonomously.

```python
@tool(approval_mode="always_require")
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email. Requires user approval before firing."""
    ...
```

Three modes:
- **`never_require`** — safe / idempotent tools (read-only, side-effect-free)
- **`always_require`** — every call needs human approval
- **Heuristic** — MAF's default: approve safe patterns, prompt on risky ones

Day 5 (Responsible AI) revisits this for production HITL patterns.

---

## Three kinds of tools you'll encounter

| Kind | What it is | Where |
|---|---|---|
| **Function tool** | Your Python or C# code, exposed to the model | Module 6 today |
| **Foundry Toolbox tool** | Managed tool in the Foundry catalog (Bing, code interpreter, SharePoint…) | Module 5 today |
| **MCP tool** | Any tool exposed by an MCP server, local or remote | Day 3 |

All three go through the same function-calling contract. Same schema shape. Same tool call → tool result flow. The differences are: **who wrote the code**, **where it runs**, and **who authenticates it**.

---

## The tool-vs-knowledge decision

Attendees will build things where they could reasonably use either:

- "Should I make this a **tool call** to search my docs, or attach a **knowledge base**?"

Rule of thumb:
- **Tool** when the retrieval is one option among many (agent decides)
- **Knowledge** when the retrieval should happen on every relevant query (retrieval is grounding, not action)

You can have both. Common pattern: knowledge base for background grounding + function tools for actions the agent takes.

Module 7 revisits this with instruction-design patterns.

---

## Common traps

- **Vague tool descriptions** — "gets data" — model has no signal for when to call
- **Overlapping tools** — two tools with fuzzy descriptions; model picks wrong one
- **Too many tools** — 30 tools registered; model gets confused. Rule: <10 per agent, split if needed.
- **Side effects in "read" tools** — model calls `check_status` and it also logs, mutates state, or bills. Keep side effects in tools clearly marked as write operations.
- **Missing parameter descriptions** — model guesses arg values. Bad guesses = bugs.
- **Silent exceptions** — tool raises, model doesn't know why. Return errors as data.

---

## Takeaways

- **Function calling = the model picks tools from a menu you defined.** Bad menu = bad picks.
- **Tool schema is a prompt.** Name, description, parameter descriptions all matter.
- **In MAF, any Python function or C# method can be a tool** — decorators and attributes give you finer control.
- **Runtime context via `ctx`** keeps sensitive values out of the model.
- **Return errors as data, not exceptions,** when you want the model to recover.
- **All tools (function, Toolbox, MCP) share the same contract** — different origins, same shape.

**Next:** Foundry Toolbox — managed tools you attach without writing.
