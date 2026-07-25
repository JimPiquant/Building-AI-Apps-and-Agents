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
- **Part B** — Hosted agent (connect to a pre-deployed one; explore what Foundry manages)
- **Part C** — Your own code, calling the Responses API (MAF in Python or C#)

You'll ask each the same questions and compare where the runtime lives, who manages what, and how you'd choose between them.

---

## Environment check — before you start

Open a terminal and run:

```bash
az login
az account show --query name -o tsv
azd version              # Azure Developer CLI (used from Day 3 onward)
python --version         # 3.11+
dotnet --version         # 10.0+  (optional, if doing C#)
uv --version             # required for Python labs
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
│   ├── part_b_hosted_agent.py
│   └── part_c_responses_api.py
└── csharp/                      ← C# starter (Part C — Responses API from your own code)
    └── PartC_ResponsesApi/
```

---

## Success criteria — what "done" looks like

At the end of the lab you should have:

1. **Part A runs** — you created a Prompt agent in the Foundry portal (version 1.0) and your MAF app connects to it.
2. **Part B runs** — you connect to a pre-deployed Hosted agent in the sandbox and walk the portal to see what Foundry manages (endpoint, tracing, identity, an attached Toolbox tool).
3. **Part C runs** — your MAF app (Python or C#) calls the Responses API and handles multi-turn conversation, streaming, and non-streaming. (Stretch: zip and deploy as your own Hosted agent.)
4. **A short reflection** committed to your fork:
   - Which path felt fastest to iterate on and why?
   - What does Foundry Agent Service manage for you in Path A / Path B that you'd otherwise build yourself in Path C?
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
- Part B → about **30 min** (connect + portal exploration)
- Part C → about **45 min** (most of the code writing lives here; stretch deploy adds ~30 min)
- Reflection commit → about **10 min**

Total: about **2 hours** of async work. If you're going long, ping a facilitator — we'll help you scope down.

---

## Preview: your capstone project

The workshop ends with a **team capstone** — every attendee is on a team of 2–3. Starts at Day 5 close; **demo day is 2–3 weeks later** — a shared session where all teams present to Pradeep + Jim (and each other). Each team gets about 15 minutes (10 min demo + 5 min Q&A and coaching). Coaching and feedback, not competitive scoring.

**Required elements (each day of the workshop gives you a piece):**
- An MAF agent — Prompt agent, Hosted agent, or your own code + Responses API
- Grounded in a Foundry-deployed model
- At least one Toolbox tool, MCP server, or custom function tool
- At least one Foundry IQ knowledge source, or a custom RAG pipeline
- A golden set of ≥ 10 items and a captured evaluation score
- OTel traces visible in the Foundry portal or Application Insights
- Architecture diagram + README with 30-day next steps

**Start today.** Reflection question #4 asks what scenario your team would build — that's your capstone starter. Jot down 2–3 scenario ideas and potential teammates as the week unfolds.

---

## Takeaways

- Same functional agent, three hosting options.
- Focus on **feeling the difference**, not just making the code run.
- The reflection is the deliverable — not the code.
- Start noodling on your capstone scenario this week.

**End of Day 1 live content. Have fun with the lab.**
