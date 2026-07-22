---
marp: true
paginate: true
---

# Module 7 — Lab Kickoff
### Two agents, same job

Day 1 · 25 minutes

---

## What you'll build

Same underlying docs-assistant behavior — three ways to run an agent with Foundry:

- **Part A** — Prompt agent (created in the portal, no code to maintain)
- **Part B** — Your own code, calling the Responses API (MAF in Python or C#)
- **Part C** — Hosted agent (connect to a pre-deployed one; explore what Foundry manages)

You'll ask each the same questions and compare where the runtime lives, who manages what, and how you'd choose between them.

---

## Environment check — before you start

Open a terminal and run:

```bash
az login
az account show --query name -o tsv
python --version         # 3.11+
dotnet --version         # 10.0+  (optional, if doing C#)
```

You should also have:
- `FOUNDRY_PROJECT_ENDPOINT` (from Module 2 — the portal tour)
- A model deployment name in that project (e.g. `gpt-4o` or `gpt-5.4-mini`)

If any of the above fails, flag it now — we'll get you unstuck before the async portion.

---

## Repo and starter templates

Clone the workshop repo:

```bash
git clone https://github.com/JimPiquant/Building-AI-Apps-and-Agents.git
cd Building-AI-Apps-and-Agents
```

Day 1 lab lives under `labs/day1/`:

```
labs/day1/
├── README.md                    ← the lab instructions
├── python/                      ← Python starter templates (uv-managed)
│   ├── part_a_prompt_agent.py
│   ├── part_b_responses_api.py
│   └── part_c_hosted_agent.py
└── csharp/                      ← C# starter (Part B — Responses API from your own code)
    └── PartB_ResponsesApi/
```

---

## Success criteria — what "done" looks like

At the end of the lab you should have:

1. **Part A runs** — you created a Prompt agent in the Foundry portal (version 1.0) and your MAF app connects to it.
2. **Part B runs** — your MAF app (Python or C#) calls the Responses API and handles multi-turn conversation, streaming, and non-streaming.
3. **Part C runs** — you connect to a pre-deployed Hosted agent in the sandbox, walk the portal to see what Foundry manages (endpoint, tracing, identity, an attached Toolbox tool), and (stretch) deploy your own.
4. **A short reflection** committed to your fork:
   - Which path felt fastest to iterate on and why?
   - What does Foundry Agent Service manage for you in Path A / Path C that you'd otherwise build yourself in Path B?
   - Which path would you pick for a shared, cross-team agent at Publix? Why?

---

## How to get help during the lab

- **Blocking issue?** Post in the shared workshop channel.
- **Environment / RBAC / quota?** Flag in chat — those are usually 5-minute fixes.
- **Code stuck?** Pair up. The lab is designed to be doable, not solo-only.

The instructor is on for questions during the async portion; response times vary.

---

## Common early gotchas (skim before you start)

- **`az login` succeeded but MAF still 401s** → you may not have `Azure AI User` on the project. Ask a facilitator.
- **`FOUNDRY_PROJECT_ENDPOINT` not set** → copy from `.env.example` to `.env` and paste the value from Module 2.
- **Model deployment name mismatch** → the deployment name is not the same as the model name; check the portal.
- **Python — package missing** → run `pip install -r labs/day1/python/requirements.txt` from the repo root.

---

## Time expectations

- Part A → about **30 min** (portal setup + connection code)
- Part B → about **45 min** (most of the code writing lives here)
- Part C → about **30 min** (connect + portal exploration; stretch deploy adds ~30 min)
- Reflection commit → about **10 min**

Total: about **2 hours** of async work. If you're going long, ping a facilitator — we'll help you scope down.

---

## Takeaways

- Same functional agent, three hosting styles.
- Focus on **feeling the difference**, not just making the code run.
- The reflection is the deliverable — not the code.

**End of Day 1 live content. Have fun with the lab.**
