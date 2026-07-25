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

## Foundry resource architecture

Foundry organizes AI workloads through a layered architecture. Four things to keep straight:

- **Foundry resource** — the top-level Azure resource (`Microsoft.CognitiveServices/accounts`, kind `AIServices`). This is the **governance boundary**: model deployments, security & networking, and connections all live here.
- **Project** — a subresource inside a Foundry resource (`.../projects`). This is the **development boundary**: teams prototype, build agents, and run evaluations here, reusing the deployments and connections configured at the resource level.
- **Project assets** — files, agents, evaluations, and related artifacts scoped to a project.
- **Connected resources** — separate Azure services (Storage, Key Vault, Azure AI Search, Fabric, …) that the Foundry resource **references through connections**. Each has its own governance boundary; you manage its networking and access policies independently.

You always operate inside a **project**, but the project is nested inside a Foundry resource that owns the runtime and governance.

## What lives where + starter RBAC

**Foundry resource level:**
- Model deployments
- Security & networking (private link, managed VNet, content safety)
- Connections to connected resources
- Resource-scoped RBAC roles

**Project level:**
- Agents (Prompt agents, Hosted agents)
- Files
- Evaluations
- Project-scoped RBAC assignments

**Starter RBAC for the lab.** Assign every developer **Foundry User** at the Foundry resource scope. That covers Day 1 lab access. Fine-grained project-scoped roles come later. (Foundry User was previously named *Azure AI User*; you may see either during the rollout.)

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

- How a Foundry resource **references** other Azure services — AI Search, Storage, Key Vault, Fabric, and more
- Each **connected resource** is a separate Azure resource with its own networking and access policies
- Configured on the Foundry resource; **projects inherit them**
- Auth via managed identity or service principal — never long-lived keys in production
- We wire connections for Foundry IQ knowledge sources on Day 2

*If a connection fails, remember to check the target resource's own network/access policies, not just Foundry's.*

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

## Observability — preview

- Every agent run in Foundry emits a **trace** — no code to enable, built-in for Prompt and Hosted agents
- A trace records: model calls, tool invocations, decisions, latency, tokens, and errors
- View traces in the Foundry portal (Tracing / Observability), or ship them to Application Insights
- OpenTelemetry semantics under the hood — same spans you'd expect from any OTel-instrumented service
- You'll open a real trace in Part B of today's lab; **Day 5 goes deep** on production observability

---

## Two axes to remember

Foundry helps agents with two very different things:

| Axis | Feature | What it does |
|------|---------|--------------|
| **Actions** — how the agent *does* things | Toolbox, MCP, function tools | Callable capabilities |
| **Knowledge** — how the agent *knows* things | Foundry IQ, RAG | Retrieval and grounding |

Days 2–3 map cleanly onto this pair.

---

## Portal for learning · CLI for production

The portal is a great teacher and a great debugger. For creating resources and shipping changes, real teams use code.

**Use the portal for:**
- Exploring what Foundry can do
- Sanity-checking a prompt in the playground
- Inspecting a trace when something goes wrong
- Monitoring dashboards and metrics

**Use `az` / `azd` / SDK for:**
- Creating projects, deployments, agents
- Wiring connections to Storage / Key Vault / AI Search
- Deploying Hosted agents (zip + portal is a shortcut; `azd` / `az` is the norm)
- Anything that needs a repeatable, reviewable change

*Publix operating norm: resource creation and programmatic operations live in code. Every lab this week reflects that — Day 1's Part A creates the Prompt agent from the SDK; Day 5's deployment content leads with `az` / `azd`.*

---

## Common portal gotchas

- **Quota errors** on deployment → request a quota bump in the region before Day 1.
- **Missing role assignments** → attendees need at least `Foundry User` (previously *Azure AI User*) at the **Foundry resource scope**. If Foundry pages 401 or 403, this is usually it.
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

- Everything in Foundry lives inside a **project** — which itself lives inside a **Foundry resource** that owns governance (deployments, security, connections).
- Copy your **project endpoint** and one **model deployment name** — you'll need both in every lab.
- Toolbox and Foundry IQ are today's introductions; Days 2–3 make them real.
- If the portal pages don't work, check quota, region, and RBAC in that order.

**Next:** prompt engineering fundamentals — how to talk to your models before we wrap them in agents.
