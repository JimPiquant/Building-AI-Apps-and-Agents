# Pre-Workshop Preparation — Days 1 and 2

Welcome. To get the most out of the first two days of the workshop, complete the
items below **before Day 1 starts**. Total effort: **~90–120 minutes** spread
across the week before the workshop — a mix of environment setup and light
pre-reading.

If you get stuck on anything here, ping the workshop coordinator or your
Publix internal channel **at least 24 hours before Day 1**. Don't wait until
kickoff — some of the setup steps (Azure quotas, tenant permissions) can take
a business day to resolve.

## What we'll cover on Days 1 and 2

- **Day 1 — Foundations.** Microsoft Foundry (the platform), Microsoft Agent
  Framework (MAF, the SDK), the three hosting styles, and building the first
  docs-assistant agent.
- **Day 2 — Knowledge + tools.** Grounding your agent with Foundry IQ, custom
  RAG on AI Search, evaluating retrieval, adding function tools, and combining
  knowledge with actions.

Both days end with hands-on labs on your own Foundry project.

---

## 1. Environment setup

Your workshop coordinator will confirm the exact accounts and subscriptions to
use. Use those, not your personal ones, unless you're told otherwise.

### Accounts and access

- **Azure subscription** — the MSDN subscription Publix has provided. Confirm
  you can sign in with `az login` and select the correct subscription with
  `az account set --subscription <name-or-id>`.
- **Foundry project** — you'll create your own project on Day 1 using the
  Azure CLI. Nothing to do here in advance except confirm your subscription
  is enabled for Foundry (`az provider show --namespace Microsoft.CognitiveServices`
  should return `Registered`). When you create the project on Day 1, connect
  an **Application Insights** resource so tracing works from day 1. If you
  use the portal quickstart, there's a checkbox during Foundry project
  creation that offers to create an App Insights resource for you — leave
  it enabled.
- **Quota check** — recommended model for the workshop is **`gpt-5.6-luna`**.
  Verify quota is available in a region you can deploy to. Your coordinator
  will share the region list before Day 1.

### Local tooling

Install everything below. If you already have most of these, just verify
versions.

| Tool | Version | Verify |
|---|---|---|
| **Azure CLI** (`az`) | latest | `az --version` |
| **Azure Developer CLI** (`azd`) | latest | `azd version` |
| **uv** (Python package/project manager) | latest | `uv --version` |
| **Python** | 3.11 or newer | `python3 --version` — or let `uv` install it (see below) |
| **Git** | any recent | `git --version` |
| **VS Code** with the Python extension | latest | Open VS Code, check extensions |

**Install links:**
- Azure CLI — https://learn.microsoft.com/cli/azure/install-azure-cli
- Azure Developer CLI — https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd
- uv — https://docs.astral.sh/uv/

**Bonus — let `uv` manage Python too.** You don't need to install Python separately;
once you have `uv`, it can install and upgrade Python versions for you:

```bash
uv python install 3.14     # install the latest 3.14
uv python list             # see what's installed and available
uv python upgrade 3.14     # upgrade to the current 3.14 patch release
```

A `pyproject.toml` with `requires-python = ">=3.11"` (which is what the lab
projects declare) will pick up whatever matching interpreter `uv` has. See
the [uv Python guide](https://docs.astral.sh/uv/guides/install-python/).

### Corporate network

- Confirm you can install packages from `pypi.org`. If your corporate proxy blocks it, work with IT to allow-list it **before Day 1**.
- Confirm you can reach `learn.microsoft.com`, `github.com`, and `ai.azure.com`.

### Sanity check script (do this the day before the workshop)

Run each command; every one should succeed.

```bash
az login
az account show                    # confirms subscription
az cognitiveservices account list   # confirms Foundry-adjacent access
python3 --version                   # 3.11+
uv --version
git --version
azd version
```

If any of these fail or return an error, resolve **before Day 1**.

---

## 2. Prerequisite knowledge — self-check

You should already be comfortable with the items below. The full self-check
lives in [`docs/prereqs.md`](../docs/prereqs.md); this is the summary tailored
to Days 1 and 2.

### Azure fundamentals
- `az login` and switching subscriptions
- Creating resource groups; understanding regions
- **Azure AI Search** — creating an index, running a basic query (concepts)
- **Managed Identity** — system-assigned vs. user-assigned; assigning roles
- **RBAC** — assigning a role at the resource-group level
- Reading a **Bicep** or **ARM** template well enough to know what it deploys

### Development
- Terminal-comfortable on your OS
- Python 3.11+ with `uv`
- Git — clone, branch, commit, push
- VS Code with the Python extension

### AI / LLM basics
- You've used a chatbot enough to know what a system prompt vs. user prompt is
- Loose familiarity with the terms *token*, *embedding*, *RAG*, *tool call*.
  Deep understanding is not required — that's what Day 2 is for.

### Not required
- Prior **Foundry** experience
- Prior **Microsoft Agent Framework (MAF)** experience
- Copilot Studio, Semantic Kernel, or AutoGen experience — out of scope
- Deep prompt engineering background

**If you need to close a gap**, see the Microsoft Learn paths in
[`docs/prereqs.md#if-you-need-to-close-a-gap`](../docs/prereqs.md).

---

## 3. Pre-reading (~60 min total)

You do not need to memorize anything below — the point is to arrive with
vocabulary, not expertise. Skim the required readings; the optional ones are
there if you want deeper context or if a specific area is new to you.

### Required (~40 min)

#### Microsoft Foundry — what it is
- **[What is Microsoft Foundry?](https://learn.microsoft.com/azure/foundry/what-is-foundry)**
  *(~10 min)* — The one-pager on the platform. Focus on the difference between
  Foundry resources, projects, and model deployments. You'll create all three
  on Day 1.
- **[Overview of Microsoft Foundry Models](https://learn.microsoft.com/azure/foundry/concepts/foundry-models-overview)**
  *(~10 min)* — The model catalog and how deployments work. You don't need to
  compare every model — knowing why we picked `gpt-5.6-luna` for the workshop
  is enough.

#### Microsoft Agent Framework (MAF) — the SDK you'll use all week
- **[Microsoft Agent Framework overview](https://learn.microsoft.com/agent-framework/overview/)**
  *(~15 min)* — The framework that runs your agent code. Read the "Why Agent
  Framework?" section closely. If you've used **Semantic Kernel** or
  **AutoGen** before, the migration notes are worth a glance — MAF is the
  forward direction from both.
- Skim the "Getting started" section — you'll follow this pattern on Day 1.
  Don't run the code yet.

#### Foundry IQ — the knowledge feature we teach on Day 2 Module 1
- **[Foundry agent knowledge overview](https://learn.microsoft.com/azure/foundry/concepts/agent-knowledge)**
  *(~5 min)* — Skim only. We'll teach this in depth on Day 2.

### Optional (~20 min) — deeper context if you want it

- **[Prompt engineering techniques](https://learn.microsoft.com/azure/ai-services/openai/concepts/prompt-engineering)**
  *(~10 min)* — Useful if "system prompt vs. user prompt" was the outer edge
  of your prompt engineering knowledge. Day 1 has a prompt-engineering module,
  so you'll get this in class too.
- **[RAG (Retrieval-Augmented Generation) overview on Azure](https://learn.microsoft.com/azure/ai-services/openai/concepts/use-your-data)**
  *(~10 min)* — Useful if you've never wired retrieval to an LLM before. Day 2
  Module 2 goes deep on this pattern using Azure AI Search.

### Not required — read after the workshop if curious

Don't read these before Day 1 — they'll make more sense after Day 2.
- Microsoft Agent Framework GitHub repo — `github.com/microsoft/agent-framework`
- Microsoft Foundry samples repo — `github.com/microsoft-foundry/foundry-samples`

---

## 4. Practical logistics

- **Clone the workshop repo** the day before Day 1 — the link will be shared
  in the pre-workshop email. You'll work in `labs/day1/` on Day 1 and
  `labs/day2/` on Day 2. Do **not** fill in any `.env` values until Day 1 —
  we'll walk through what goes where.
- **Have your terminal, VS Code, and a browser open** at the start of Day 1.
- **Recommended screen setup:** one screen for the workshop call/slides, one
  for your code editor + terminal. If you only have one screen, split it
  50/50; you'll be switching between the two often.
- **Camera-on is appreciated** for the live sessions but not required.
- Sessions are recorded; if you miss one, you can catch up on the recording
  and jump in for the next.

---

## 5. Day-of checklist

Print this or keep it open in a tab on Day 1 morning:

- [ ] `az login` still works (tokens expire; refresh the morning of)
- [ ] `az account show` shows the correct subscription
- [ ] Workshop repo cloned and you can `cd` to `labs/day1/`
- [ ] Python 3.11+ + `uv` installed and on your `PATH`
- [ ] Azure CLI + Azure Developer CLI installed
- [ ] VS Code open with the Python extension enabled
- [ ] Coffee ☕

If any of these is red on Day 1 morning, message the workshop channel
immediately — we can pair you with a helper before Module 1 starts.

---

## Questions before the workshop?

Post in the pre-workshop Teams channel or email your workshop coordinator.
Small issues resolved before Day 1 save an hour of live-session time.

See you at kickoff.
