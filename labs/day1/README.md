# Day 1 Lab — Three ways to run an agent with Foundry

Build the same small docs assistant three ways: as a **Prompt agent** (Part A), as a **Hosted agent** (Part B), and as **your own code calling the Responses API** (Part C). Compare where the runtime lives, what Foundry manages for you, and how you'd choose between them.

Estimated time: **~2 hours async**.

## Prerequisites

- You completed the [prereqs self-check](../../docs/prereqs.md).
- `az login` works against the Publix tenant.
- You have a Foundry project and know its **project endpoint** and **at least one model deployment name** (surfaced in Module 2).
- You've cloned this repo and are working from `labs/day1/`.

## Choose your language

- **Python**: all three parts implemented under [`python/`](python/).
- **C#**: **Part C** implemented under [`csharp/PartC_ResponsesApi/`](csharp/PartC_ResponsesApi/). Parts A and B are Python-only for Cohort 1; C# reference samples for those paths live in the `microsoft/agent-framework` repo — see [`csharp/README.md`](csharp/README.md).

You can mix — Part C in C# is fine, then switch to Python for Parts A and B.

## Environment file

Copy the example:

```bash
cp labs/day1/.env.example labs/day1/.env
```

Fill in the values described inside. Never commit `.env`.

---

## Part A — Prompt agent (~30 min)

**What you'll do:** create a **Prompt agent** in your Foundry project from **code** (using the Azure AI Projects SDK), then connect to it from an MAF app. You write **no runtime code** for the agent itself — Foundry runs it.

Publix is an IaC-first shop: workshop labs create Foundry resources from the command line and SDKs, not the portal. The portal path is provided as an alternative and is fine for exploration.

**Steps (SDK path — primary)**
1. Confirm `FOUNDRY_PROJECT_ENDPOINT`, `FOUNDRY_MODEL`, and `FOUNDRY_PROMPT_AGENT_NAME=docs-assistant` are set in `.env`.
2. `cd labs/day1/python && uv sync`
3. `uv run python create_prompt_agent.py`
   - This calls `client.agents.create_version(...)` with a `PromptAgentDefinition` (instructions + model + temperature) and prints the resulting agent name and version.
4. Copy the printed version into `.env` as `FOUNDRY_PROMPT_AGENT_VERSION` (typically `1.0` on first run).
5. `uv run python part_a_prompt_agent.py`
   - Connects to the Prompt agent you just created and runs the multi-turn prompts.

**Alternative: portal path** *(useful for exploration; not the norm for real work)*
1. Foundry portal → your project → **Agents** → **New Prompt agent**.
2. Name it `docs-assistant`. Instructions: same system prompt used in `create_prompt_agent.py`.
3. Attach the model deployment from Module 2 and publish version `1.0`.
4. Skip the SDK step above; run `uv run python part_a_prompt_agent.py` directly.

**Definition of done for Part A**
- Your Prompt agent shows up in the Foundry portal under **Agents** (regardless of which path you used to create it).
- Your MAF app connects to it and gets responses.
- You can articulate what "versioned Prompt agent" means in practice: what changes to publish `1.1`, and what happens to consumers pinned to `1.0`?
- (If you used the SDK path) you understand why an IaC-first shop like Publix prefers code creation: the `create_prompt_agent.py` script is repeatable, reviewable, and CI-friendly. The portal isn't.

---

## Part B — Hosted agent (~30 min)

**What you'll do:** connect to a **Hosted agent** that was pre-deployed to the shared Foundry Agent Service sandbox. Walk the portal to see what Foundry manages for you: managed endpoint, tracing, dedicated Entra identity, attached Toolbox tools, content safety. This is where Foundry stops being "model host" and starts being "agent app + tooling host."

**Setup (facilitator does this ahead of Day 1)**
- Package a small MAF agent (essentially the Part C starter code) as a zip and upload it to Foundry Agent Service via the portal. Foundry builds the container image from the zip.
- Name the deployment `docs-assistant-hosted`.
- Attach one Foundry Toolbox tool to it (e.g., **web search**) so attendees can see a platform tool in the traces.

**Attendee steps**
1. Set `FOUNDRY_HOSTED_AGENT_NAME=docs-assistant-hosted` in `.env`.
2. Run `uv run python part_b_hosted_agent.py`.
3. Ask the multi-turn questions from the starter. Save the transcript.
4. In the Foundry portal, walk through:
   - The Hosted agent's **managed endpoint** URL (the URL your code just called).
   - **Tracing / observability** — open the most recent run's trace. You should see: the model call, any tool invocations (including the attached Toolbox tool), decisions the agent made, latency for each step, and token counts. Click into a tool call to see its arguments and return value. This is the same tracing you'd get with any OTel-instrumented service; Foundry emits spans automatically for Prompt and Hosted agents.
   - **Agent identity** — the dedicated Microsoft Entra identity for this agent.
   - The attached **Toolbox tool** and its call in the trace.
   - **Content safety** filters that ran on the response.

**Definition of done for Part B**
- Your MAF app connects to the pre-deployed Hosted agent and gets responses.
- You've spent time in the portal for that agent and can name at least three things Foundry manages that you'd have to build yourself in Part C.

---

## Part C — Your own code, calling the Responses API (~45 min)

**What you'll do:** build an MAF app in your language of choice that runs in **your** process and calls the Foundry Responses API for models and tools. Your code owns the runtime; Foundry serves the models plus platform tools.

**Steps**
1. Confirm `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` are set in `.env`.
2. Python: `cd labs/day1/python && uv sync && uv run python part_c_responses_api.py`
3. C#: `cd labs/day1/csharp/PartC_ResponsesApi && dotnet run`
4. Complete the multi-turn prompts in the starter file. Save the transcript.

**Definition of done for Part C**
- The agent responds to at least three multi-turn prompts.
- You see streaming output work (tokens print incrementally).
- You can articulate where thread state is stored, and what it would take to move this same code inside a Hosted agent (Part B).

**Stretch (optional, ~30 min)**
Take *your* Part C code, zip it, upload it via the Foundry portal as your own Hosted agent, and connect to your deployment the same way you did in Part B. Notice what Foundry adds around the same MAF code.

---

## Reflection — the actual deliverable

Add a file `labs/day1/reflection.md` in your fork of this repo answering:

1. **Which path felt fastest to iterate on** — Part A (portal edits), Part B (zip upload), or Part C (code redeploy)? Why?
2. **What does Foundry Agent Service manage for you** in Parts A and B that you'd have to build or wire up yourself in Part C? List at least three concrete things.
3. **For a Publix scenario you know**, which of the three paths would you pick? Consider: who owns the prompt, how many apps consume the agent, and what identity/observability you'd need.
4. **What scenario would you build for your capstone?** Jot down 2–3 candidate ideas — real work you'd want to sharpen with an agent. You'll refine one of these during Day 5's capstone scoping session; this is where you start.

Commit that file and push to your fork. Reflection > code.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `az login` fine but MAF 401 | Missing `Azure AI User` role on the project | Ask a facilitator to assign it |
| `FOUNDRY_PROJECT_ENDPOINT` not found | `.env` missing or wrong path | Copy from `.env.example`; run from `labs/day1/` |
| `Model not found` | Deployment name mismatch | Copy the exact deployment name from Portal → Deployments |
| Prompt agent connection fails on version | You didn't publish version 1.0 in the portal | Publish, then retry |
| Hosted agent 404 | `FOUNDRY_HOSTED_AGENT_NAME` doesn't match the pre-deployed agent | Check the exact name in the portal |
| Python — package missing | `uv sync` from `labs/day1/python/` | Install uv first if needed |

If none of these apply, ping the workshop channel with the exact error and the file you're running.
