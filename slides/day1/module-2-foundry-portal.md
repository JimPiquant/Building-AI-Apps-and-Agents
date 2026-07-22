---
marp: true
paginate: true
---

# Module 2 — Foundry Portal Tour
### Projects, models, deployments, connections, Toolbox, Foundry IQ

Day 1 · 45 minutes

---

## What you'll leave with

You'll be able to:
- Navigate a Foundry project confidently
- Find and deploy a model
- Test a model in the playground
- Locate your project endpoint (which you'll paste into your `.env` in the lab)
- Recognize Toolbox and Foundry IQ in the portal (deep-dive comes Days 2–3)

**This module is mostly a live walkthrough.** The slides below are your reference.

---

## The Foundry hierarchy

- **Tenant** — your Microsoft Entra tenant
- **Subscription** — Azure subscription that pays for resources
- **Resource group** — where Foundry resources live
- **Foundry project** — the unit of collaboration; the URL you'll paste into MAF as `project_endpoint`
- **Model deployments** — instances of a specific model made callable from your project

You always operate inside **a project**. Everything else hangs off it.

---

## Project endpoints

Every project has an endpoint that looks like:

```
https://<project-name>.services.ai.azure.com
```

You'll set this as `FOUNDRY_PROJECT_ENDPOINT` in every lab's `.env`.

MAF connects to Foundry using this endpoint plus a credential (usually `AzureCliCredential` in dev, managed identity in production).

---

## Model catalog

- Browse frontier models (OpenAI, Meta, Mistral, others depending on region)
- Filter by capability (chat, embeddings, vision, etc.)
- See region availability, pricing tier, context window

**Not every model is available in every region.** If a model isn't showing up, check region and quota.

---

## Model deployments

- A **deployment** is a named, callable instance of a specific model
- Each deployment has:
  - A **deployment name** (what you pass to MAF as `model=...`)
  - A **model version**
  - A **capacity** (tokens per minute)
  - A **region** (inherited from the project)

Rule of thumb: one deployment per (model, role) pair. Don't share a single deployment across production and dev.

---

## Playgrounds

- Chat playground — test a deployed model interactively
- Agent playground — test a **PromptAgent** or **HostedAgent** you've created in Foundry
- Prompt flow / evaluation playgrounds — for testing eval configurations

Use playgrounds to sanity-check *before* writing agent code. If it doesn't work in the playground, it won't work in MAF either.

---

## Connections

- **Connections** are how a Foundry project reaches other Azure resources (AI Search, storage, Fabric, etc.)
- Configure once per project; agents inherit them
- Auth via managed identity or service principal — never long-lived keys in production

We'll wire connections for Foundry IQ knowledge sources on **Day 2**.

---

## Foundry Toolbox (introduction)

- A curated catalog of ready-to-use tools an agent can attach to
- Includes things like: code interpreter, file search, Bing search, SharePoint, Fabric, Graph, and custom skills
- **Exposed to MAF over an MCP endpoint** — the same protocol we cover Day 3
- Attach Toolbox tools to a Foundry-hosted agent from the portal, or from code

Bookmark this. We use it lightly today and go deep Day 2.

---

## Foundry IQ (introduction)

- The **knowledge / grounding layer** of Foundry
- Unified retrieval across your enterprise sources — AI Search indexes, SharePoint, OneLake / Fabric, and more
- Alternative to hand-rolling a RAG pipeline per source
- Agents that use it get grounded answers with citations, without you writing the retrieval code

Also bookmark — this is Day 2's main course.

---

## Two axes to remember

Foundry helps agents with two very different things:

| Axis | Feature | What it does |
|------|---------|--------------|
| **Actions** — how the agent *does* things | Toolbox, MCP, function tools | Callable capabilities |
| **Knowledge** — how the agent *knows* things | Foundry IQ, RAG | Retrieval and grounding |

Days 2–3 map cleanly onto this pair.

---

## Common portal gotchas

- **Quota errors** on deployment → request a quota bump in the region before Day 1.
- **Missing role assignments** → attendees need at least `Azure AI User` on the project. If Foundry pages 401 or 403, this is usually it.
- **Region mismatch** → your model deployment must be in a region Foundry IQ / your AI Search index can reach.
- **Preview features moving** — Toolbox and parts of Foundry IQ are evolving fast; if a screenshot in these slides doesn't match reality, the code is still what you should trust.

---

## Live walkthrough (in the portal now)

Facilitator will demonstrate:
1. Sign into `ai.azure.com` and open a project
2. Deploy a model
3. Copy the project endpoint
4. Open the chat playground; send a test prompt
5. Show the Toolbox catalog and one entry
6. Show Foundry IQ landing page and one knowledge source (if pre-provisioned)

**Attendees:** do steps 1–4 on your own subscription before the module ends.

---

## Takeaways

- Everything in Foundry lives inside a **project**.
- Copy your **project endpoint** and one **model deployment name** — you'll need both in every lab.
- Toolbox and Foundry IQ are today's introductions; Days 2–3 make them real.
- If the portal pages don't work, check quota, region, and RBAC in that order.

**Next:** prompt engineering fundamentals — how to talk to your models before we wrap them in agents.
