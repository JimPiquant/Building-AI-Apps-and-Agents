---
title: Conversations & Memory
subtitle: Keep continuity without confusing state, history, context, and storage
eyebrow: DAY 3 · MODULE 1 · 35 MIN
tag: Day 3 · Module 1
deck: module-1-sessions-state.pptx
---

# Module 1 — Conversations & Memory

## Conversations & Memory
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Open with the contract: a session is the state container you pass across runs. Tell attendees this module separates four concepts that are often incorrectly called memory. -->

- Create, reuse, restore, and authorize conversation state

## What AgentSession contains
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: This is the doc's own "What AgentSession contains" table, verbatim, for the Python pivot, plus the doc's closing Important callout on scope. Three fields only — session_id is local identity, service_session_id points to service-managed state when a service owns history, and state is shared provider state. The fourth bullet is the doc's own safety rule: a session is agent/provider specific, and a service-side session id must only be restored for the user or tenant that owns it. -->

- **session_id** — Local unique identifier for this session
- **service_session_id** — Remote service session identifier, such as a conversation or response ID, when service-managed history is used
- **state** — Mutable dictionary shared with context/history providers
- **Sessions are agent/service-specific** — Reusing a session with a different agent configuration or provider can lead to invalid context; restore a service-side session id only for the user or tenant that owns it

## The lifecycle is explicit
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Emphasize every run receives session=. get_session(service_session_id=...) is for when the backing service already has conversation state (the doc's own framing) — it's a different resumption path than AgentSession.from_dict(), which restores a locally-serialized session. Serialization captures the session container; your application still chooses durable storage. -->

```python
from agent_framework import AgentSession

session = agent.create_session()
await agent.run("Remember this project.", session=session)
await agent.run("Which project?", session=session)

existing = agent.get_session(service_session_id=owned_service_id)

payload = session.to_dict()
resumed = AgentSession.from_dict(payload)
```

## DEMO 1.1 — Serialize, kill the process, restore the session
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-1-demo-1-serialize-restore.md -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Run the exact create_session / to_dict / from_dict pattern from the previous slide live, with a simulated process restart between serialize and restore. -->

Run the previous slide's exact code live: create a session, run two turns, serialize with `session.to_dict()`, simulate a fresh process, restore with `AgentSession.from_dict()`, and continue the same conversation — proving the session container, not the process, carries continuity.

## Four concepts, four jobs
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python | https://learn.microsoft.com/en-us/agent-framework/hosting/self-hosting/ -->
<!-- notes: Do not let these terms collapse into one. HistoryProvider is a specialized ContextProvider. SessionStore belongs to self-host request handling and is not the same as message history — the self-hosting doc draws this exact line: SessionStore persists session metadata/provider state, a separate HistoryProvider persists the conversation messages, and durable hosts keep them apart because appending messages beats rewriting a growing session object every turn. Converted from a table to a list because this specific 4-row comparison is a workshop synthesis across three Learn pages, not a literal table in any one of them — the individual facts below are still doc-sourced. -->

- **AgentSession** — Carries the session id, provider state, and (when present) a service session id across runs — not a durable database by itself
- **HistoryProvider** — Loads and stores conversation messages — not an authorization mechanism
- **ContextProvider** — Enriches context before a run and processes state after a run — does not itself own message history (a HistoryProvider is a specialized ContextProvider)
- **SessionStore** — Self-host helper that saves, retrieves, and deletes sessions by an app-selected key; the default implementation is process-local with no eviction policy
  - Persists session metadata and provider state, not the conversation itself
  - A separate HistoryProvider persists the actual messages — durable hosts keep these separate because appending messages beats rewriting a growing session object every turn

## Built-in storage modes
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/storage?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: This is the storage doc's own "Built-in storage modes" table, verbatim. Local session state means your provider loads the message list and sends it to the model — you own retention and compaction (Module 3). Service-managed storage means AgentSession.service_session_id points to state the backend already keeps; a local compaction strategy has no effect on that path. -->

| Mode | What is stored | Typical usage |
|---|---|---|
| Local session state | Full chat history in `AgentSession.state` (for example via `InMemoryHistoryProvider`) | Services that don't require server-side conversation persistence |
| Service-managed storage | Conversation state in the service; `AgentSession.service_session_id` points to it | Services with native persistent conversation support |

## DEMO 1.3 — Suspend/resume: service-managed vs. in-memory
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-1-demo-3-suspend-resume.md -->
<!-- source: https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/conversations/suspend_resume_session.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs the official suspend_resume_session.py sample as-is; no adaptation. -->

Run the official `suspend_resume_session.py` sample side by side: the same suspend/resume calls behave differently depending on who owns history — Foundry's service-managed session vs. an OpenAI in-memory session — making the previous slide's local-vs-service-managed distinction concrete.

## ContextProvider wraps each invocation
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python -->
<!-- notes: Name the actual Python methods instead of the generic "enriches SessionContext" — extend_instructions, extend_tools, and extend_middleware are the doc's own API surface for before_run. Keep per-session state in the session, not on a provider instance shared by users — the provider instance is shared across every session. -->

- **1. Caller input** — Your app passes messages and `session` to `agent.run(...)`
- **2. before_run** — Provider can call `context.extend_instructions(source_id, ...)`, `context.extend_tools(source_id, ...)`, or `context.extend_middleware(source_id, ...)` to enrich this one invocation
- **3. Agent execution** — Model and tools run with the enriched instructions, tools, and middleware
- **4. after_run** — Provider reads `context.input_messages` (and the response) to decide what state to persist for next time

## One provider loads messages
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/storage?tabs=python -->
<!-- notes: This is a Python-specific guardrail, named exactly: "In Python, you can configure multiple history providers, but only one should use load_messages=True." The storage doc adds the companion flag for the observer case — store_context_messages=True — and names the concrete use case: an audit/eval history provider. -->

- **Loader** — Exactly one HistoryProvider is configured with `load_messages=True`
- **Observers** — Additional history providers use `load_messages=False`; set `store_context_messages=True` so they still capture context from other providers alongside input/output
- **Why one loader** — Two loaders can duplicate history and distort what the model sees
- **Typical use** — An audit/eval history provider that observes without affecting primary history loading

## Durability is an application choice
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/storage?tabs=python | https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/conversations/redis_history_provider.py -->
<!-- notes: The first three bullets are the storage doc's own "Key guidance" list for a third-party/custom history provider, verbatim. The fourth is a separate, real opt-in flag from the same doc's "Per-service-call local history persistence" section — not previously covered — for keeping local history aligned with a tool-calling loop's multiple model calls. RedisHistoryProvider in the official repo is a concrete example of a trusted store implementing this guidance. -->

- **Store messages under a session-scoped key** — one session's history shouldn't leak into another's
- **Keep returned history within model context limits** — apply a compaction strategy (Module 3) or a reducer if it grows too large
- **Persist provider-specific identifiers in the session state** — not as a side-channel your app has to track by hand
- **Per-service-call persistence is opt-in** — `require_per_service_call_history_persistence=True` runs local history providers around every model call inside a tool loop, not just once after the full `agent.run()` completes

## A service conversation ID is not authorization
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/hosting/self-hosting/ | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: The opening line and the 4-step list are the self-hosting doc's own "Secure session continuation" guidance, verbatim (Python zone). Spend time here. Service IDs may be scoped to one backing project or key, not to each end user — session.md's own OpenAI-specific warning makes the same point about resp_*/conv_* IDs. A multi-tenant app must never accept a raw conversation ID as proof of ownership. -->

- **Not proof of ownership** — "A continuation ID identifies a session to resume; it doesn't prove that the caller owns that session."
- **1. Authenticate the caller**
- **2. Authorize the caller to access the referenced state**
- **3. Partition durable state by the authenticated tenant, user, or workspace**
- **4. Persist session and checkpoint state only after the run or stream has completed**

## Decision guide
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python -->
<!-- notes: Use this as a design review checklist. The answer can combine rows: for example local history plus a custom preference provider plus an application session store. Converted from a table to a list — this five-row matrix is a workshop-authored recap of concepts taught earlier in the module, not a table that appears verbatim in either cited doc. Kept because it adds real value as an end-of-module decision tool, distinct from the Takeaways recap. -->

- **Short-lived local chat** — InMemoryHistoryProvider; verify process loss is acceptable
- **Server-side conversation** — Service-managed session; verify the service and provider both support it
- **Dynamic memory or policy** — ContextProvider; verify before_run/after_run state is session-scoped
- **Restart durability** — App-owned persistence, or a self-host SessionStore; verify encryption, retention, and concurrency
- **Multi-tenant resume** — A trusted ownership mapping; verify raw service IDs are never treated as authorization

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Close by asking attendees to name the history owner for their Day 2 assistant. Preview streaming: the same session is passed whether the run returns one response or a stream. -->

- You create one AgentSession and pass `session=` on every turn.
- You use `get_session(...)` only with an authorized, owned service conversation ID.
- You separate session state, message history, context enrichment, and self-host storage.
- You configure only one message-loading HistoryProvider.
- You persist and secure continuity at your application boundary.
