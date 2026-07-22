---
marp: true
paginate: true
---

# Module 7 — Lab Kickoff
### Two agents, same job

Day 1 · 25 minutes

---

## What you'll build

Same functional agent — a small **docs assistant** — three ways:

- **Part A** — client-side agent (Python or C#)
- **Part B** — Foundry PromptAgent (versioned, portal-configured)
- **Part C (bonus)** — Foundry HostedAgent (non-versioned)

You'll ask each the same questions and compare behavior, latency, and where thread state lives.

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
├── README.md               ← the lab instructions
├── python/                 ← Python starter templates
│   ├── part_a_client_side_agent.py
│   ├── part_b_foundry_prompt_agent.py
│   └── part_c_foundry_hosted_agent.py
└── csharp/                 ← C# starter (Part A)
    └── PartA_ClientSideAgent/
```

---

## Success criteria — what "done" looks like

At the end of the lab you should have:

1. Part A **runs** — a client-side agent responds to a multi-turn set of questions in both non-streaming and streaming modes.
2. Part B **runs** — you created a PromptAgent in the Foundry portal, tagged version 1.0, and MAF connects to it.
3. **A short reflection** committed to your fork:
   - Where did thread state live in Part A vs. Part B?
   - Which felt faster to iterate on?
   - Which would you pick for a shared, cross-team agent at Publix? Why?

Part C is a bonus and reinforces Part B.

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

- Part A → about **45 min** for most attendees
- Part B → about **45 min** including portal setup
- Part C → about **20 min**
- Reflection commit → about **10 min**

Total: about **2 hours** of async work. If you're going long, ping a facilitator — we'll help you scope down.

---

## Takeaways

- Same functional agent, three hosting styles.
- Focus on **feeling the difference**, not just making the code run.
- The reflection is the deliverable — not the code.

**End of Day 1 live content. Have fun with the lab.**
