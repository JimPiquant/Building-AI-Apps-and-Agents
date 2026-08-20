# Day 1 Lab — Three ways to run an agent with Foundry

Build the same small docs assistant three ways: as a **Prompt agent** (Part A), as a **Hosted agent** (Part B), and as **your own code calling the Responses API** (Part C). Compare where the runtime lives, what Foundry manages for you, and how you'd choose between them.

Estimated time: **~2 hours of lab work**.

## Prerequisites

- You completed the [prereqs self-check](../../docs/prereqs.md).
- `az login` works against your Azure tenant.
- You have a Foundry project and know its **project endpoint** and **at least one model deployment name** (surfaced in Module 2).
- You've cloned this repo and are working from `labs/day1/`.
- **`uv`** (Python package/project manager) is installed. If you don't have it:
  ```bash
  # macOS / Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Windows (PowerShell)
  irm https://astral.sh/uv/install.ps1 | iex
  ```

  **Bonus — let `uv` manage Python too.** You don't need to install Python separately;
  `uv` can install and upgrade Python versions for you:
  ```bash
  uv python install 3.14     # install the latest 3.14
  uv python list             # see what's installed and available
  uv python upgrade 3.14     # upgrade to the current 3.14 patch release
  ```
  A `pyproject.toml` with `requires-python = ">=3.11"` will pick up whatever
  matching interpreter `uv` has. See the [uv Python guide](https://docs.astral.sh/uv/guides/install-python/).

  See the [`uv` utility note](../../README.md#a-note-about-the-uv-utility) in the top-level README for what `uv sync` and `uv run` do.

## Language

All Day 1 labs are **Python**. Reference C# samples for every path live in the [`microsoft/agent-framework`](https://github.com/microsoft/agent-framework) repo under `dotnet/samples/` — the workshop slides show both Python and C# code side-by-side, but the hands-on lab work in this repo is Python-only.

### Python starter files

| File | Part | What it does |
|---|---|---|
| [`python/create_prompt_agent.py`](python/create_prompt_agent.py) | A (run once) | Creates the `docs-assistant` Prompt agent via the Azure AI Projects SDK |
| [`python/part_a_prompt_agent.py`](python/part_a_prompt_agent.py) | A | Connects to the Prompt agent you just created and runs multi-turn prompts |
| [`python/part_b_hosted_agent.py`](python/part_b_hosted_agent.py) | B | Connects to your deployed Hosted agent |
| [`python/part_c_responses_api.py`](python/part_c_responses_api.py) | C | Your own code calling the Foundry Responses API |

All are run with `uv run python <file>` from `labs/day1/python/`, after `uv sync` in that directory.

## Environment file

Copy the example:

```bash
cp labs/day1/.env.example labs/day1/.env
```

> **Note:** dotfiles (files whose names start with `.`) are hidden by default in Finder / File Explorer. If you're using a GUI file manager, enable "show hidden files" — or just use your terminal.
>   - macOS Finder: `Cmd+Shift+.` toggles hidden files
>   - Windows Explorer: View → Show → Hidden items
>   - VS Code: hidden files are visible by default in the Explorer view

Fill in the values described inside. Never commit `.env`.

---

## Part A — Prompt agent (~45 min, including one-time Azure setup)

**What you'll do:** create a **Foundry resource** and **Foundry project** in Azure (one-time), then create a **Prompt agent** in that project from **code** using the Azure AI Projects SDK, and finally connect to it from an MAF app. You write **no runtime code** for the agent itself — Foundry runs it.

This workshop targets IaC-first teams: labs create Foundry resources from the command line and SDKs, not the portal. A portal alternative is provided at the end and is fine for exploration.

### Pre-work — one-time Azure setup (~15 min)

You need a Foundry resource + a Foundry project + a deployed model before you can create the Prompt agent. Do this once; you'll reuse the same resource and project across every day of the workshop.

Follow the official Learn tutorial (**Azure CLI** tab):

**[Quickstart: Create Foundry resources with the Azure CLI](https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources?tabs=azurecli)**

Key decisions to make as you follow it:
- **Model deployment name:** recommended **`gpt-5.6-luna`** — good balance of capability and cost for this workshop's scenarios. Any equivalent chat-capable model will also work.
- **Region:** pick a region where your target model has quota (the tutorial explains how to check).
- **Application Insights:** connect one to your Foundry project so tracing works from Day 1. **If you use the portal quickstart**, there's a checkbox that offers to create an Application Insights resource for you during Foundry project creation — leave it enabled. If you use the CLI path, follow the [tracing setup guide](https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/trace-agent-setup) after your project is created (Agents → Traces → Connect, or Manage → Resource details → Connected resources → Add connection → Application Insights).
- Record the **project endpoint** URL and the **deployment name** — you'll paste them into `.env` next.

When you're done, populate `.env`:

```bash
FOUNDRY_PROJECT_ENDPOINT=https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>
FOUNDRY_MODEL=gpt-5.6-luna           # or your chosen deployment name
FOUNDRY_PROMPT_AGENT_NAME=docs-assistant
```

### Create the Prompt agent from code

1. `cd labs/day1/python && uv sync`
2. `uv run python create_prompt_agent.py`
   - This calls `client.agents.create_version(...)` with a `PromptAgentDefinition` (instructions + model) and prints the resulting agent name and version.
3. Copy the printed version into `.env` as `FOUNDRY_PROMPT_AGENT_VERSION` (typically `1` on first run).
4. **See your new agent in the portal.** Open [https://ai.azure.com](https://ai.azure.com) → your project → **Agents**. You should see `docs-assistant` v1 in the list. Open it — the instructions, model, and version you set in code are all visible in the portal.

### Connect to it and run

5. `uv run python part_a_prompt_agent.py`
   - Connects to the Prompt agent you just created and runs a set of multi-turn prompts.

### Alternative: create the agent in the portal *(useful for exploration; not the norm for real work)*

Instead of the SDK step:
1. Foundry portal → your project → **Agents** → **New agent** (top-right) → **Build an agent**.
2. Name it `docs-assistant`. Use the docs-assistant system prompt from `create_prompt_agent.py` as the instructions.
3. Attach your model deployment and publish version `1`.
4. Skip step 2 above; run `uv run python part_a_prompt_agent.py` directly.

> **Portal vocabulary note:** the portal's *"Build an agent"* creates a **Prompt agent** (configuration-only, no code) — that's what you want here. *"Code an agent"* is used for **Hosted agents**. *"Link external agent"* is a separate scenario not used in this workshop.

### Definition of done for Part A
- Your Foundry resource + project exist and have a deployed model.
- Your Prompt agent shows up in the Foundry portal under **Agents** (regardless of which path you used to create it).
- Your MAF app connects to it and gets responses.
- You can articulate what "versioned Prompt agent" means in practice: what changes to publish `2`, and what happens to consumers pinned to `1`?
- (If you used the SDK path) you understand why IaC-first teams prefer code creation: the `create_prompt_agent.py` script is repeatable, reviewable, and CI-friendly. The portal isn't.

---

## Part B — Hosted agent (~45 min, including deploy)

**What you'll do:** deploy your own **Hosted agent** to the Foundry Agent Service in your Foundry project using the Azure Developer CLI (`azd`), then connect to it from your MAF app and walk the portal to see what Foundry manages for you: managed endpoint, tracing, dedicated Entra identity, content safety.

This is where Foundry stops being "model host" and starts being "agent app + tooling host."

### Deploy the Hosted agent

Follow the step-by-step guide: **[`part_b_deploy_hosted_agent.md`](part_b_deploy_hosted_agent.md)**.

Summary of what you'll do in that guide:
- Create a `docs-assistant-hosted/main.py` that wraps an MAF `Agent` in a `ResponsesHostServer` (essentially the Part C code, packaged for hosting).
- Use `azd ai agent init` to configure the deployment interactively (project, entry point, runtime, protocol).
- Run `azd provision && azd deploy` to package and deploy to Foundry Agent Service. Foundry builds the container image from your source.
- Verify with `azd ai agent invoke docs-assistant-hosted 'what are you able to do?'`.

Estimated time for the deploy portion: ~20 min (mostly waiting on the container build).

### Connect from MAF and explore the portal

1. Set `FOUNDRY_HOSTED_AGENT_NAME=docs-assistant-hosted` in `.env`.
2. Run `uv run python part_b_hosted_agent.py`.
3. Ask the multi-turn questions from the starter. Save the transcript.
4. In the Foundry portal, walk through:
   - The Hosted agent's **managed endpoint** URL (the URL your code just called).
   - **Tracing / observability** — open the most recent run's trace. You should see: the model call, any tool invocations, decisions the agent made, latency for each step, and token counts. Click into a tool call to see its arguments and return value. This is the same tracing you'd get with any OTel-instrumented service; Foundry emits spans automatically for Prompt and Hosted agents.
   - **Agent identity** — the dedicated Microsoft Entra identity for this agent.
   - **Content safety** filters that ran on the response.

### Definition of done for Part B
- Your Hosted agent is deployed and shows up in the Foundry portal under **Agents**.
- Your MAF app connects to it and gets responses.
- You've spent time in the portal for the agent and can name at least three things Foundry manages that you'd have to build yourself in Part C.

---

## Part C — Your own code, calling the Responses API (~45 min)

**What you'll do:** build an MAF app in your language of choice that runs in **your** process and calls the Foundry Responses API for models and tools. Your code owns the runtime; Foundry serves the models plus platform tools.

**Steps**
1. Confirm `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` are set in `.env`.
2. `cd labs/day1/python && uv sync && uv run python part_c_responses_api.py`
3. Complete the multi-turn prompts in the starter file. Save the transcript.

> **How the session shows up here.** Turn 2's prompt — *"Of those, which should I build first and why?"* — only makes sense if the agent still has turn 1's list of three features in view. That's what the `session=session` argument on both `agent.run()` calls does: MAF replays the prior turn's messages into the context on turn 2, so the model can reason about *"those"* without you re-sending the list. The `session` object **is** the mechanism populating that context. Drop the `session=session` argument on turn 2 and re-run — the answer degrades to a generic "here's what to build first" that has nothing to do with your turn 1 list. That's the difference the reflection prompt about *"where thread state is stored"* is pointing at.

**Definition of done for Part C**
- The agent responds to at least three multi-turn prompts.
- You see streaming output work (tokens print incrementally).
- You can articulate where thread state is stored, and what it would take to move this same code inside a Hosted agent (Part B).

**Stretch (optional, ~30 min)**
Extend your Part C code with a custom function tool (e.g. `get_current_time()` or `lookup_something()`) and observe the tool call appear in the trace when you run again. Both function tools and Foundry IQ knowledge sources get deep coverage on Days 2–3, so this is just a taste.

---

## Reflection — the actual deliverable

Add a file `labs/day1/reflection.md` in your fork of this repo answering:

1. **Which path felt fastest to iterate on** — Part A (portal edits), Part B (zip upload), or Part C (code redeploy)? Why?
2. **What does Foundry Agent Service manage for you** in Parts A and B that you'd have to build or wire up yourself in Part C? List at least three concrete things.
3. **For a scenario you know**, which of the three paths would you pick? Consider: who owns the prompt, how many apps consume the agent, and what identity/observability you'd need.
4. **What scenario would your team build for your capstone?** Jot down 2–3 candidate ideas — real work you'd want to sharpen with an agent — and any teammates you'd want to work with. You'll form teams and pick one scenario during Day 5's capstone scoping session; this is where you start.

Commit that file and push to your fork. Reflection > code.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `az login` fine but MAF 401 | Missing `Azure AI User` role on the project | Ask a instructor to assign it |
| `FOUNDRY_PROJECT_ENDPOINT` not found | `.env` missing or wrong path | Copy from `.env.example`; run from `labs/day1/` |
| `Model not found` | Deployment name mismatch | Copy the exact deployment name from Portal → Deployments |
| Prompt agent connection fails on version | You didn't publish version 1 in the portal | Publish, then retry |
| Hosted agent 404 | `FOUNDRY_HOSTED_AGENT_NAME` doesn't match your deployed agent | Check the exact name in the portal, and confirm `azd deploy` succeeded |
| Python — package missing | `uv sync` from `labs/day1/python/` | Install uv first if needed |

If none of these apply, ping the workshop channel with the exact error and the file you're running.
