---
title: Sessions & Conversation State
subtitle: Keep continuity without confusing state, history, context, and storage
eyebrow: DAY 3 · MODULE 1 · 35 MIN
tag: Day 3 · Module 1
deck: module-1-sessions-state.pptx
---

# Module 1 — Sessions & Conversation State

## Sessions & Conversation State
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Open with the contract: a session is the state container you pass across runs. Tell attendees this module separates four concepts that are often incorrectly called memory. -->

- Create, reuse, restore, and authorize conversation state

## What you will decide
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/ -->
<!-- notes: Preview the decision sequence. You first decide where history lives, then what context is injected, then how session state survives process restarts, and finally how ownership is enforced. -->

1. **History owner** — local process or backing service?
2. **Context needs** — what must run before and after each invocation?
3. **Persistence boundary** — what must survive a restart?
4. **Authorization boundary** — who owns each service conversation?

## AgentSession is the continuity container
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Walk the three Python fields. session_id is local identity, service_session_id points to service-managed state when present, and state is shared provider state. A session is agent and service specific. -->

- **session_id** — Local unique identifier for this session
- **service_session_id** — Remote conversation or response identifier when a service owns history
- **state** — Mutable dictionary shared with history and context providers
- **Scope** — Restore only with the compatible agent, provider, and owning user or tenant

## The lifecycle is explicit
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Emphasize every run receives session=. get_session resumes an existing service conversation. Serialization captures the session container; your application still chooses durable storage. -->

```python
from agent_framework import AgentSession

session = agent.create_session()
await agent.run("Remember this project.", session=session)
await agent.run("Which project?", session=session)

existing = agent.get_session(service_session_id=owned_service_id)

payload = session.to_dict()
resumed = AgentSession.from_dict(payload)
```

## Four concepts, four jobs
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python | https://learn.microsoft.com/en-us/agent-framework/hosting/self-hosting/ -->
<!-- notes: Do not let these terms collapse into one. HistoryProvider is a specialized ContextProvider. SessionStore belongs to self-host request handling and is not the same as message history. -->

| Concept | Job | Does not imply |
|---|---|---|
| AgentSession | Carries IDs and provider state across runs | Durable database |
| HistoryProvider | Loads and stores conversation messages | Authorization |
| ContextProvider | Adds context before and processes state after a run | Message history ownership |
| SessionStore | Self-host persistence keyed by an app continuation ID | General-purpose store shipped for every app |

## Choose who owns message history
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/compaction?tabs=python -->
<!-- notes: Local means your provider loads the message list and sends it to the model. Service-managed means a service_session_id links server-side state. Avoid configuring local compaction for a service-managed path because it has no effect there. -->

- **Local / self-managed**
  - Your HistoryProvider loads and stores messages
  - Your process sends the relevant history
  - You own retention, durability, and compaction
- **Service-managed**
  - The backing service keeps conversation state
  - AgentSession carries service_session_id
  - The service controls context management

## ContextProvider wraps each invocation
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python -->
<!-- notes: before_run can add instructions, messages, or tools through SessionContext. after_run observes successful request and response data and persists provider state. Keep per-session state in the session, not on a provider instance shared by users. -->

1. **Caller input** — Your app passes messages and session
2. **before_run** — Provider enriches SessionContext
3. **Agent execution** — Model and tools run
4. **after_run** — Provider processes output and saves state

## One provider loads messages
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python -->
<!-- notes: This is a Python-specific guardrail. Multiple providers can observe or store context, but only one should load messages. Otherwise history can be duplicated and token use becomes unpredictable. -->

- **Loader** — Exactly one HistoryProvider uses `load_messages=True`
- **Observers** — Additional history providers can use `load_messages=False`
- **Diagnostics** — Observers can store context messages for evaluation or audit
- **Why** — Two loaders can duplicate history and distort the model input

## Durability is an application choice
<!-- layout: ladder -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/storage?tabs=python | https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/conversations/redis_history_provider.py -->
<!-- notes: Offer storage categories, not a fictional universal MAF database. The official repo includes examples such as Redis-backed history. Production applications can implement providers or stores over Redis, SQL, Cosmos DB, blob, or another owned system. -->

1. **Serialize** — `session.to_dict()`
2. **Store** — Your trusted Redis, database, blob, or app store
3. **Resolve** — Load by an app-owned continuation ID
4. **Restore** — `AgentSession.from_dict(...)`
5. **Resume** — Pass `session=` on every run

## A service conversation ID is not authorization
<!-- layout: ladder -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Spend time here. Service IDs may be scoped to one backing project or key, not to each end user. A multi-tenant app must never accept a raw conversation ID as proof of ownership. -->

1. **Authenticated caller** — Trusted user and tenant claims
2. **App session ID** — Opaque client-visible identifier
3. **Ownership lookup** — Verify user or tenant owns the mapping
4. **Service ID** — Resolve server-side; never trust a client-supplied raw ID
5. **Run** — Resume only after authorization succeeds

## Decision guide
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python | https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/context-providers?tabs=python -->
<!-- notes: Use this as a design review checklist. The answer can combine rows: for example local history plus a custom preference provider plus an application session store. -->

| Need | Choose | Verify |
|---|---|---|
| Short-lived local chat | InMemoryHistoryProvider | Process loss is acceptable |
| Server-side conversation | Service-managed session | Service and provider support it |
| Dynamic memory or policy | ContextProvider | before_run/after_run state is session-scoped |
| Restart durability | App-owned persistence / self-host SessionStore | Encryption, retention, concurrency |
| Multi-tenant resume | Trusted ownership mapping | Raw service IDs never authorize |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python -->
<!-- notes: Close by asking attendees to name the history owner for their Day 2 assistant. Preview streaming: the same session is passed whether the run returns one response or a stream. -->

- You create one AgentSession and pass `session=` on every turn.
- You use `get_session(...)` only with an authorized, owned service conversation ID.
- You separate session state, message history, context enrichment, and self-host storage.
- You configure only one message-loading HistoryProvider.
- You persist and secure continuity at your application boundary.
