---
marp: true
paginate: true
---

# Module 1 — Foundry IQ Deep Dive
### Knowledge and grounding for your agents

Day 2 · 35 minutes

---

## Where we are in the stack

Day 1 introduced the five-layer stack. Today's Module 1 lives entirely at **Layer 4 — Knowledge**.

- **Model** — your Foundry-deployed model
- **Runtime** — Prompt agent, Hosted agent, or your own code + Responses API
- **Actions** — Modules 4–7 today
- **Knowledge** ← **this module** and Module 2
- **Ops** — Day 5

Knowledge is the answer to "how does my agent *know* things beyond the model's training data?"

---

## What Foundry IQ is

- The **managed knowledge and grounding layer** of Foundry
- Turns scattered enterprise content into permission-aware, reusable **knowledge bases** that agents ground answers on
- Built on **Azure AI Search** under the hood — but you never write the retrieval code
- Same knowledge base can be shared by many agents

*Source: [What is Foundry IQ?](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/what-is-foundry-iq)*

---

## Three building blocks

| Component | What it is |
|---|---|
| **Knowledge source** | A connection to one data store — a blob container, a SharePoint site, an existing AI Search index, a Fabric data agent, the web… |
| **Knowledge base** | The top-level resource an agent connects to. Wraps one or more knowledge sources plus retrieval parameters. |
| **Agentic retrieval** | The engine that runs multi-query pipelines across all sources in a knowledge base and returns unified, ranked results. |

An agent connects to **one knowledge base**. That knowledge base can span many knowledge sources.

---

## Supported knowledge sources

**Indexed** — content ingested into AI Search up front, queried locally:
- Search index (wrap an existing one)
- Azure Blob · OneLake · Azure SQL (preview) · Indexed SharePoint (preview) · File upload

**Remote** — content retrieved at query time from another platform:
- Web (Bing) — public
- Remote SharePoint · Fabric Data Agent · Fabric Ontology · Work IQ · MCP server — all preview

Both flow through the same ranking pipeline. Attendees mix indexed and remote in one knowledge base.

---

## Indexed vs. remote — trade-offs

| | Indexed | Remote |
|---|---|---|
| Content location | Inside AI Search | Stays in the source system |
| Query latency | Low (local) | Higher (round-trip) |
| Freshness | On indexer schedule | Live |
| Setup cost | Indexer pipeline | Just a connection |
| Best for | Docs, blob, structured content | Live data, org-collab surfaces, third-party APIs |
| Cost model | Storage + queries | Per query against source platform |

Rule of thumb: index anything you query hundreds of times per day; go remote for the rest.

---

## Agentic retrieval — what actually happens on a query

For each user question, the agentic retrieval engine:

1. **Plans** — an LLM (optional) decomposes the question into sub-queries and picks which sources to hit
2. **Executes** — sub-queries run in parallel (keyword, vector, or hybrid per source)
3. **Ranks** — unified reranker scores results across sources
4. **Returns** — top results plus source citations

Attendee takeaway: this is more than "vector search + LLM." It's a small pipeline you get for free.

---

## Retrieval reasoning effort

You control how much LLM planning happens per query.

- **`minimal`** — no LLM planning. Fast, cheap. One direct query. GA.
- **`low`** — LLM plans the sub-queries and picks sources. Preview.
- **`medium`** — LLM plans + iterates for deeper results. Preview.

Higher effort = better answers on complex questions, higher latency and cost. Choose per query, not per agent.

*Preview status: verify in [Set the retrieval reasoning effort](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-set-retrieval-reasoning-effort) before wiring into production paths.*

---

## Permission-aware retrieval

- **ACL sync** — indexed knowledge sources can pull access control lists from the source (SharePoint, OneLake) into the index
- **Sensitivity labels** — Microsoft Purview labels flow through blob / OneLake / indexed SharePoint ingestion (preview)
- **Query-time enforcement** — retrieval runs under the caller's Entra identity; only content the user is authorized to see comes back
- Same knowledge base, different answers per user — no per-tenant infrastructure

This is the single biggest reason to prefer Foundry IQ over hand-rolling RAG on AI Search for enterprise content.

---

## When Foundry IQ is the right answer

- Content sits in a supported source (SharePoint, OneLake, blob, web, Fabric…)
- Multiple agents will share the same knowledge base
- You need **permission-aware** answers per caller
- You want managed indexing, chunking, embeddings, and refresh
- You want the agentic-retrieval pipeline (multi-query, unified ranking) without writing it

## When to reach for custom RAG instead

- You need control IQ doesn't yet give you (custom re-rankers, unusual chunk sizes, novel embedding models)
- Your source isn't a supported connector
- You're already invested in an AI Search index with heavy customization
- Latency SLA below what IQ's pipeline delivers

Module 2 covers custom RAG on AI Search directly.

---

## Working with knowledge bases in MAF

From your MAF app, the knowledge base is *just another dependency* — no retrieval code in your agent:

```python
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="Answer with citations from the docs knowledge base.",
    # knowledge_base_id wired via Foundry project configuration
)
```

For Prompt agents / Hosted agents, the knowledge base is attached in the agent config. For "your own code" agents, you call the knowledge-base REST API or the AI Search SDK.

---

## IaC-first: create knowledge sources from code

Same operating norm as Day 1 — resource creation lives in code, not the portal.

- **Azure CLI** — `az search knowledge-source create ...` (verify current command surface)
- **REST** — `PUT https://<search>.search.windows.net/knowledgeSources/<name>?api-version=2026-04-01`
- **Python SDK** — `azure-search-documents` client
- **Portal** — fine for exploration; not the workshop path

Attendees do the SDK path in today's lab.

---

## Adjacent IQ workloads — for context

Foundry IQ is one of three managed IQ layers. Different aspects of your organization.

| IQ | For | Not what we're using today |
|---|---|---|
| **Foundry IQ** | Enterprise knowledge — SharePoint, OneLake, blob, web | ← today |
| **Fabric IQ** | Analytics — OneLake, Power BI, ontologies | Available as a *remote knowledge source* inside Foundry IQ (Fabric Data Agent, preview) |
| **Work IQ** | M365 collaboration signals — Teams, meetings, files | Available as a *remote knowledge source* (preview) |

You can mix them — a knowledge base can reference all three. Not required for the workshop.

---

## Common traps

- **Forgetting the knowledge source `description`** — the LLM uses it to decide when to query the source at `low`/`medium` effort. Blank description = bad selection.
- **Wrong retrieval effort for the workload** — using `medium` on latency-sensitive UX; using `minimal` on complex multi-hop questions.
- **No permission model** — building on blob without ACL sync, then discovering per-user filtering is required in production.
- **Chunking mismatch** — using default chunking on structured docs that need semantic chunking.
- **Ignoring citations** — attendees skip verifying that the model actually cites the retrieval, and hallucinations sneak back in.

---

## Takeaways

- **Foundry IQ = managed knowledge for agents.** Knowledge sources, knowledge bases, agentic retrieval — three pieces.
- **Indexed vs. remote** is your first design choice. Index hot content, go remote for live data.
- **Permission-aware retrieval** at query time is the enterprise pitch. Hard to build; hard to skip.
- **Retrieval reasoning effort** trades latency for quality per-query.
- **Create from code**, not the portal.

**Next:** Custom RAG on AI Search — for the cases where IQ isn't the right answer yet.
