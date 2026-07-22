# Day 1 Lab — Two agents, same job

Build the same small docs assistant three ways: as a **client-side agent**, as a **Foundry PromptAgent**, and (bonus) as a **Foundry HostedAgent**. Compare where thread state lives, how you iterate on each, and which you'd choose for a shared production scenario.

Estimated time: **~2 hours async**.

## Prerequisites

- You completed the [prereqs self-check](../../docs/prereqs.md).
- `az login` works against the Publix tenant.
- You have a Foundry project and know its **project endpoint** and **at least one model deployment name** (both were surfaced in Module 2).
- You've cloned this repo and are working from `labs/day1/`.

## Choose your language

- **Python**: all three parts implemented — [`python/`](python/)
- **C#**: Part A implemented — [`csharp/PartA_ClientSideAgent/`](csharp/PartA_ClientSideAgent/). Parts B and C in Cohort 1 are **Python-only**; C# equivalents exist in the `microsoft/agent-framework` samples under `dotnet/samples/02-agents/AgentProviders/foundry/`. See the [terminology doc](../../docs/terminology.md) for the C# API mapping.

You can mix — do Part A in C# if you prefer, then switch to Python for Parts B and C.

## Environment file

Both languages read from a `.env` in `labs/day1/`. Copy the example:

```bash
cp labs/day1/.env.example labs/day1/.env
```

Then fill in the values described inside. Never commit `.env`.

---

## Part A — Client-side agent (~45 min)

**What you'll do:** build a client-side agent in code with `Agent` + `FoundryChatClient` (Python) or `AIProjectClient.AsAIAgent(...)` (C#). Run it non-streaming and streaming. Have a short multi-turn conversation.

**Steps**
1. Fill in `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL` in `.env`.
2. Python: `cd labs/day1/python && pip install -r requirements.txt && python part_a_client_side_agent.py`
3. C#: `cd labs/day1/csharp/PartA_ClientSideAgent && dotnet run`
4. Ask the questions in the "Reflection prompts" section at the bottom of the starter file. Save the transcript.

**Definition of done for Part A**
- The agent responds to at least three multi-turn prompts.
- You see streaming output work (tokens print incrementally).
- You can articulate where thread state is stored.

---

## Part B — Foundry PromptAgent (~45 min)

**What you'll do:** create a **PromptAgent** in the Foundry portal, publish version `1.0`, then connect to it from MAF using `FoundryAgent(agent_name, agent_version)`.

**Portal steps** (facilitator will demo the first one live)
1. Open your Foundry project → **Agents** → **New PromptAgent**.
2. Name it `docs-assistant`. Instructions: same system prompt you used in Part A.
3. Attach the model deployment you used in Part A.
4. Publish version `1.0`.

**Code steps**
1. Set `FOUNDRY_PROMPT_AGENT_NAME=docs-assistant` and `FOUNDRY_PROMPT_AGENT_VERSION=1.0` in `.env`.
2. Run `python part_b_foundry_prompt_agent.py`.
3. Ask the same multi-turn questions you used in Part A. Save the transcript.

**Definition of done for Part B**
- Your PromptAgent shows up in the portal under **Agents**.
- MAF connects to it and responds to prompts.
- You can articulate what "versioned agent" means in practice — what would you change to publish `1.1`?

---

## Part C — Foundry HostedAgent (bonus, ~20 min)

**What you'll do:** create a **HostedAgent** (no version), connect via `FoundryAgent(agent_name)`, and compare with Part B.

**Portal steps**
1. Foundry project → **Agents** → **New HostedAgent**.
2. Name it `docs-assistant-hosted`. Same instructions + model.

**Code steps**
1. Set `FOUNDRY_HOSTED_AGENT_NAME=docs-assistant-hosted` in `.env`.
2. Run `python part_c_foundry_hosted_agent.py`.

**Definition of done for Part C**
- Both agents (PromptAgent and HostedAgent) exist in your project.
- MAF connects to each via the same `FoundryAgent` class — the only difference is whether you pass `agent_version`.

---

## Reflection — the actual deliverable

Add a file `labs/day1/reflection.md` in your fork of this repo answering:

1. **Where did thread state live** in Part A vs. Part B? How would that change your deployment story?
2. **Which felt faster to iterate on** — editing instructions in your Python file vs. editing them in the Foundry portal? Why?
3. **For a Publix scenario you know**, which hosting style would you pick and why? Consider: how many apps consume the agent, who owns the prompt, and how change is reviewed.
4. **What did we not do today** that you'd want to try before making this a real project? (This seeds Days 2–5.)

Commit that file and push to your fork. Reflection > code.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `az login` fine but MAF 401 | Missing `Azure AI User` role on project | Ask a facilitator to assign it |
| `FOUNDRY_PROJECT_ENDPOINT` not found | `.env` missing or wrong path | Copy from `.env.example`; run from `labs/day1/` |
| `Model not found` | Deployment name mismatch | Copy the exact deployment name from Portal → Deployments |
| Agent hangs on first run | Region / quota issue | Check Portal → Diagnostics; may need capacity bump |
| Streaming prints nothing | Terminal buffering | Ensure `flush=True` (already in template) |

If none of these apply, ping the workshop channel with the exact error and the file you're running.
