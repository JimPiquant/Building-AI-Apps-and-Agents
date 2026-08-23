---
title: Streaming & Structured Outputs
subtitle: Deliver progress now and a validated value at completion
eyebrow: DAY 3 · MODULE 2 · 30 MIN
tag: Day 3 · Module 2
deck: module-2-streaming-structured.pptx
---

# Module 2 — Streaming & Structured Outputs

## Streaming & Structured Outputs
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Frame two distinct contracts: streaming improves perceived responsiveness, while structured output improves downstream reliability. You can combine them, but parsing happens only after completion. -->

- Stream typed updates; consume one validated final value

## One run API, two return shapes
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents?tabs=python -->
<!-- notes: The run method is the same. Without stream=True, await an AgentResponse. With stream=True, iterate a ResponseStream and optionally finalize it. -->

- **Non-streaming**
  - `await agent.run(...)`
  - Returns `AgentResponse`
  - Read `.text`, `.value`, and typed contents
- **Streaming**
  - `agent.run(..., stream=True)`
  - Returns `ResponseStream`
  - Iterate `AgentResponseUpdate` values

## Three ways to consume ResponseStream
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Pattern one is display-only iteration. Pattern two iterates and then finalizes. Pattern three skips display and lets get_final_response consume the stream. Pick based on the application's UX and data contract. -->

1. **Iterate only** — Render each update as it arrives
2. **Iterate + finalize** — Render updates, then await `get_final_response()`
3. **Finalize only** — Skip iteration; finalizer consumes the stream

## Updates carry typed contents
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents -->
<!-- notes: Avoid teaching a stream as just text chunks. Update.text is convenient, but contents can represent function calls, results, reasoning, usage, and other typed events supported by the client. Consumers should branch on content types they understand. -->

- **Text** — Convenient `update.text` for display
- **Function activity** — Calls and results can arrive as typed contents
- **Metadata** — Response IDs, roles, usage, and provider data may be present
- **Rule** — Ignore unknown types safely; do not flatten every event into text

## Put each option in the right lane
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Correct a common SDK-shape mistake. response_format is nested in options. Instructions and tools are direct run kwargs when overriding them for one invocation. -->

| Concern | Run shape | Why |
|---|---|---|
| Structured schema | `options={"response_format": TriageResult}` | Chat-client option |
| Per-run tools | `tools=[...]` | Direct agent run kwarg |
| Per-run instructions | `instructions="..."` | Direct agent run kwarg |
| Streaming | `stream=True` | Selects ResponseStream |
| Conversation continuity | `session=session` | Reuses AgentSession |

## Pydantic gives you a typed value
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: The model class becomes the requested schema when the underlying client supports structured outputs. On success, response.value is a TriageResult instance. Do not promise support for every model or agent type. -->

```python
from pydantic import BaseModel

class TriageResult(BaseModel):
    route: str
    summary: str
    needs_work_item: bool

response = await agent.run(
    request,
    options={"response_format": TriageResult},
)
triage: TriageResult = response.value
```

## JSON Schema works without a model class
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Use a mapping when the schema is dynamic or comes from configuration. In this mode response.value is parsed JSON, typically a dict or list, rather than a Pydantic instance. -->

```python
schema = {
    "type": "object",
    "properties": {"route": {"type": "string"}},
    "required": ["route"],
}

response = await agent.run(
    request, options={"response_format": schema}
)
result = response.value  # parsed JSON
```

## TriageResult fits your docs assistant
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Tie this to the workshop scenario. The assistant can answer from docs, request more information, or recommend an Azure DevOps work item. The typed result is an application contract, not permission to execute a write. -->

1. **Classify** — `route`: answer, clarify, or work_item
2. **Summarize** — concise issue statement for your UI
3. **Signal** — `needs_work_item` is a recommendation
4. **Authorize** — your app still controls whether a write is offered or approved

## Combine streaming and structure
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: This is the canonical combined pattern. You may display update.text, but the value you trust comes from the final response after the stream has completed. -->

```python
stream = agent.run(
    request,
    stream=True,
    session=session,
    options={"response_format": TriageResult},
)

async for update in stream:
    if update.text:
        render(update.text)

final = await stream.get_final_response()
triage = final.value
```

## Partial JSON is display data, not a value
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: A token prefix can be syntactically incomplete and semantically unstable. Do not parse or trigger business actions from partial JSON. Finalization assembles the response and applies structured-output parsing. -->

- **During the stream**
  - JSON may be incomplete
  - Fields may not have arrived
  - Do not parse or act
- **After completion**
  - Await `get_final_response()`
  - Read validated `.value`
  - Apply business rules and approvals

## Support follows the underlying client
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python | https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/model-providers/microsoft-foundry?tabs=python -->
<!-- notes: Keep the claim narrow. Agent supports structured outputs when paired with a compatible chat client and model. Examples in this course use FoundryChatClient where documented; attendees must verify the selected deployment supports the requested format. -->

- **Framework** — Agent forwards the response format through the client
- **Client** — Must implement compatible structured-output behavior
- **Model** — Must support the requested response format
- **Practice** — Test the exact deployment and handle invalid values

## Choose the response contract
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/running-agents?tabs=python | https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Ask which row fits each UI. A console can stream text; a workflow handoff should usually consume a structured final value; a rich UI can do both. -->

| Need | Pattern |
|---|---|
| Fastest simple code | Await AgentResponse |
| Progressive display | Iterate ResponseStream |
| Typed handoff | Await response and read `.value` |
| Progressive display + typed handoff | Iterate, then `get_final_response().value` |
| Dynamic contract | JSON Schema mapping |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/structured-outputs?tabs=python -->
<!-- notes: Close with the two-contract model. Preview compaction as a separate concern: it changes which history reaches a self-managed agent, not how a response stream is consumed. -->

- You use one run API and choose `AgentResponse` or `ResponseStream`.
- You treat updates as typed contents, not only text.
- You put `response_format` inside `options`.
- You parse structured output only after the stream completes.
- You verify support with your exact Foundry client and model.
