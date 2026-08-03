---
marp: true
paginate: true
---

# Module 7 — Combining Knowledge + Tools
### The pattern that brings Day 2 together

Day 2 · 25 minutes

---

## Where we are

Today you learned two families of capabilities:

- **Knowledge (Modules 1–3):** Foundry IQ, custom RAG on AI Search, retrieval eval
- **Actions (Modules 4–6):** the tools layer, Toolbox, authoring custom function tools

Real agents use **both**. This module is about how they interact — and how they fail when combined naively.

---

## The two composition orders

Every agent turn that touches both knowledge and tools follows one of two orders:

| Pattern | Sequence | Best for |
|---|---|---|
| **Retrieve-then-act** | Get grounded context first, then call a tool | Actions that depend on facts (policies, entitlements, docs) |
| **Act-then-retrieve** | Call a tool to fetch state, then reason over it | User-specific state (my orders, my tickets, my quota) |

Most real workflows are one or the other. Some are both, in sequence.

The **agent's instructions** are what steer which order it picks.

---

## Retrieve-then-act (the docs-assistant pattern)

```
User: "My login keeps failing with a 500 — can you file a ticket?"

1. Model retrieves: "Login troubleshooting" doc chunk
2. Model reads: doc says "500 errors mean auth service is down"
3. Model calls: create_ticket(title="Auth service 500", priority="high",
                              body="Confirmed via login troubleshooting doc")
```

Knowledge shapes the tool call. The ticket is **better** because retrieval ran first.

**Instruction cue:** *"Before creating tickets, consult the documentation to classify the problem accurately."*

---

## Act-then-retrieve (the lookup-first pattern)

```
User: "Why is my order still processing?"

1. Model calls: lookup_order_status(order_id from ctx)
2. Tool returns: {status: "held", reason: "payment_review"}
3. Model retrieves: "Payment review" policy doc
4. Model answers: grounded explanation of what "payment_review" means
```

The tool provides the **fact**; retrieval provides the **explanation**.

**Instruction cue:** *"For account-specific questions, look up the current state first, then explain using policy documentation."*

---

## When to attach retrieval as a tool vs. a hosted knowledge source

Two ways to expose knowledge to an MAF agent:

| Approach | How | When |
|---|---|---|
| **Hosted knowledge (Foundry IQ)** | Attached at agent creation | Fully-managed retrieval, no custom logic needed |
| **Retrieval as a function tool** | `@tool` wraps your AI Search / custom RAG code | Custom scoring, filtering, hybrid strategies, per-tenant scoping |

The model doesn't care which one you pick — both look like "knowledge available to me." The **operational** trade-off is what you're picking.

**Rule:** start with hosted IQ; drop to a custom retrieval tool when you need control IQ doesn't give you.

---

## Instruction patterns for combining

Well-written instructions tell the model **which order** to prefer:

```
You are a support assistant.

For product questions, use the documentation knowledge source.

For account-specific questions (orders, tickets, entitlements),
look up the current state with the lookup_* tools BEFORE explaining.

When creating tickets, first check documentation for the correct
category, then call create_ticket with that category.

If you don't find an answer in documentation and no tool applies,
say "I don't have that information."
```

Four lines carry the whole policy: default source, state-first, retrieve-before-act, refusal fallback.

---

## Failure mode 1 — Tool called before retrieval

Symptom: agent creates a ticket without checking docs, ticket has wrong category/priority.

Root cause: the instructions don't say "check docs first."

Fix:
- Add explicit ordering to instructions
- Golden set: add a query that requires the retrieve-then-act order; assert doc chunk appears in trace before tool call

Trace check (Day 5 preview):
```
step 1: model retrieved  ← should exist BEFORE step 2
step 2: model called create_ticket
```

---

## Failure mode 2 — Retrieval used when a tool should have been called

Symptom: user asks "What's my order status?" → agent quotes a general policy doc instead of calling `lookup_order_status`.

Root cause: tool description is too narrow, or knowledge source description is too broad.

Fixes (in order of preference):
1. Tighten the knowledge source description (e.g. *"General product documentation. Does NOT contain account-specific state."*)
2. Broaden the tool description with concrete triggers (*"Use whenever the user references their own orders, tickets, or account."*)
3. Add a golden-set entry that fails until (1) and (2) are correct

---

## Failure mode 3 — Both fire, model gets confused

Symptom: agent retrieves AND calls a tool for a simple question, then produces a rambling answer combining both.

Root cause: instructions don't set a **default** source. Model tries everything.

Fix — set a default and constrain:

```
Default source: documentation.
Only call a tool when the user references their own account
or asks you to perform an action.
```

Explicit defaults are cheap and prevent 80% of "why is this so slow?" complaints.

---

## Cost + latency implications

Each pattern has a different cost/latency profile:

| Pattern | Extra LLM calls | Extra retrieval calls | Extra tool calls |
|---|---|---|---|
| Retrieve-then-act | +0 | +1 | +1 |
| Act-then-retrieve | +0 | +1 | +1 |
| Both (retrieve + act + retrieve) | +1 (reasoning between) | +2 | +1 |
| Neither steered → model tries all | +1–2 | +1–2 | +1–2 |

Naive prompts hit the last row. Well-steered prompts hit rows 1–2.

**Latency-visible impact:** the last row can easily double p95 time-to-first-token.

---

## Approval gates in combined flows

Recall from Module 4: `approval_mode="always_require"` prompts for human approval before a tool call.

In a combined flow, that gate falls **after retrieval** but **before the tool call**:

```
1. Retrieve docs → (no gate)
2. Model formulates create_ticket call → GATE
3. User approves → tool executes
4. Model summarizes result
```

Design point: put gates on the **action**, not the retrieval. Retrieval is safe by default; actions have side effects.

---

## When to use MAF vs. Foundry Agent Service — the combined lens

You saw this framing on Day 1. Combining knowledge + tools sharpens it:

| Use... | When... |
|---|---|
| **Foundry Agent Service (Prompt agents)** | Hosted retrieval + hosted tools cover your needs; you want the portal + REST surface |
| **MAF in-process** | You need custom retrieval, custom tools, or fine-grained control over the composition order |

Publix will mix both — a Prompt agent for the docs-Q&A path, an MAF agent for the ticket-triage path that needs custom logic.

---

## Takeaways

- **Two orders:** retrieve-then-act and act-then-retrieve. Pick per workflow.
- **Instructions steer order.** Four lines is often enough.
- **Three failure modes:** tool-before-retrieval, retrieval-when-tool-expected, both-fire. All fix with description tightening.
- **Set a default source.** Prevents naive "try everything" behavior.
- **Approval gates go on the action**, not on retrieval.
- **MAF for custom composition; Prompt agents when hosted defaults fit.**

**Next:** Module 8 — Day 2 lab kickoff. You'll build the docs-assistant with a ticket-triage tool and evaluate both retrieval and tool selection.
