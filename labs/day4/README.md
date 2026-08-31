# Day 4 Lab — Multi-agent workflows and evaluation

<!-- TODO: one-line goal statement once Part A/B/C are authored. Draft:
turn the Day 3 single agent into a three-part progression — a Sequential
warm-up that exposes a real limitation, a custom workflow graph that fixes
it, and a Group Chat alternative compared against the fix — all evaluated
against the same golden set. -->

Three parts, same Planner/Retriever/Critic roles throughout — only the
orchestration mechanism changes:

| Part | Focus | Module(s) |
|---|---|---|
| **A** | Sequential (warm-up) — no correction | 2 |
| **B** | Custom graph — revision loop + required guardrail | 3, 6 |
| **C** | Group Chat swap — compare against Part B | 2, 5 |

Estimated time: <!-- TODO -->. Python only, per workshop policy.

## Prerequisites

- Day 3 lab complete and working (baseline single agent with memory,
  streaming, structured outputs, and MCP)
- A Foundry judge model deployment, for trajectory/cost evaluation
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant
- **(Optional stretch only)** Your own Azure DevOps setup from Day 3 —
  only needed if you build the optional Ticket agent. See
  [`labs/day3/README.md`'s Azure DevOps setup](../day3/README.md#azure-devops-setup)
  section; nothing new to provision for the core lab.

No Foundry IQ / Azure AI Search dependency: the Retriever role grounds
against a small bundle of local docs shipped in this repo
(`python/data/docs/*.md`, copied from Day 2), not a live knowledge base —
nothing to have kept provisioned since Day 2.

### Fill in `.env`

```bash
cp labs/day4/.env.example labs/day4/.env
# edit labs/day4/.env — see that file's comments for each value
```

### Sync the Python project

```bash
cd labs/day4/python
uv sync
uv run python agent.py   # sanity check — prints a greeting
```

If the sanity check fails, do NOT proceed. Fix your `.env` or Foundry access
first (or ask for help).

## Repo layout

```
labs/day4/
├── README.md                       # you're here
├── .env.example                    # copy to .env at this level
└── python/
    ├── pyproject.toml              # uv-managed
    ├── README.md                   # Python starter guide
    ├── agent.py                    # baseline sanity check
    ├── roles.py                    # shared: Planner/Retriever/Critic agent factories + structured-output models + the search_docs tool
    ├── data/
    │   ├── README.md                # provenance note (copied from Day 2)
    │   └── docs/                    # bundled local docs the Retriever's search_docs tool grounds against
    ├── part_a_sequential.py        # Part A: SequentialBuilder, no correction
    ├── part_b_custom_graph.py      # Part B: WorkflowBuilder + conditional edge + required guardrail
    ├── part_c_group_chat.py        # Part C: GroupChatBuilder swap, compared against Part B
    ├── tests/
    │   └── test_part_b_guardrail.py    # Part B: isolation tests for the loop-counter/guardrail logic
    └── evals/
        └── golden_set.jsonl        # shared across all 3 parts — build once, before Part A
```

---

## Part A — Sequential (warm-up)

**Goal:** stand up the shared Planner/Retriever/Critic roles for the first
time, wired together with the simplest orchestration builder there is —
and see, live, why Sequential can't be the whole answer.

**Time:** ~15 min (this file is provided complete; read and run it).

### Steps

1. Build the golden set first, if you haven't already —
   `evals/golden_set.jsonl` is shared across all 3 parts and already
   contains 15 questions grounded in the bundled local docs
   (`data/docs/*.md`, copied from Day 2 — nothing to provision).
2. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_a_sequential.py
   ```
3. Read the printed results in order:
   - `roles.py` builds the Planner, Retriever, and Critic as three
     separate agents, each with a `default_options={"response_format":
     ...}` structured output — Plan, RetrievalResult, and CriticVerdict.
     The Retriever grounds via `search_docs`, a plain local Python tool
     that searches the bundled docs — no MCP, no Azure resource.
   - `part_a_sequential.py` wires them into one workflow with
     `SequentialBuilder(participants=[planner, retriever, critic]).build()`
     — Module 2's simplest orchestration builder, a flat participants list,
     strict order, no loop.
   - Only the **first `GOLDEN_SET_LIMIT` (5) of the 15** golden-set
     questions run by default — each question is 3 live agent turns with
     a fresh workflow, so the full set is slow for a quick read-and-run.
     Parts B and C still run all 15. The first 5 rows are all clean
     `"expects_revision": false` questions, so **with the default limit
     Part A's own "no correction" result may not show up** — set
     `GOLDEN_SET_LIMIT = None` (or a higher number) at the top of the
     file if you want to see it live.
   - Most come back `APPROVED`. Any question the golden set marks
     `"expects_revision": true` comes back `NOT APPROVED`, and stays that
     way: there's nowhere for that verdict to go back to.
   - Finally, the same workflow gets wrapped with `workflow.as_agent()`
     and run once more — Module 1's "composition goes full circle" slide,
     now in code: the whole three-role pipeline, called just like a
     single agent.
4. That last "no correction" result IS Part A's point, not a bug to chase
   down: `SequentialBuilder`'s own docs are explicit that "Order Matters" —
   agents execute strictly in the order given, with no loop-back to an
   earlier participant. Part B rebuilds this same golden set against a
   custom `WorkflowBuilder` graph specifically to fix this.

**Definition of done:**
- Runs end-to-end on the golden set; the "no correction" limitation shows
  up in at least one result

---

## Part B — A custom graph fixes it

**Goal:** fix Part A's exact limitation — a genuine revision loop, with a
required budget guardrail so it can't run forever.

**Time:** ~25 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_b_custom_graph.py
   ```
2. Read the printed results in order:
   - `part_b_custom_graph.py` rebuilds the SAME three roles (unchanged
     from `roles.py`) on a custom `WorkflowBuilder` graph instead of
     `SequentialBuilder` — a genuine rewrite of the orchestration
     plumbing, not a small diff on Part A's code.
   - A conditional edge routes the Critic's not-approved verdicts to
     `revision_gate`, a small custom executor, instead of straight back
     to the Planner (Module 3's "Conditional edges in code" slide, the
     exact mechanic Sequential can't do).
   - `revision_gate` tracks a revision counter in workflow state
     (`ctx.set_state`/`get_state`) and either routes a new request back
     to the Planner with the Critic's feedback, or — once the budget
     (`MAX_REVISIONS = 3`) is exceeded — stops with a graceful
     `GuardrailStop` instead of looping forever. **This guardrail is
     required, not a stretch goal**: unlike `AgentLoopMiddleware`'s
     built-in `max_iterations`, a conditional edge has no automatic cap.
   - Every one of the same 15 golden-set questions runs through this
     graph once. Compare the results against Part A's: questions Part A
     marked `NOT APPROVED` with no way to recover should now come back
     either `APPROVED` (the revision loop worked) or
     `GUARDRAIL TRIPPED` (a genuinely hard question, stopped safely
     instead of burning tokens forever).
3. Read `part_b_custom_graph.py`'s module docstring for a grounding note
   worth knowing: the real conditional-edge/state API is slightly more
   involved than Module 3's simplified slide code — condition functions
   receive the raw `AgentExecutorResponse`, not a pre-parsed verdict, and
   they never get `ctx`, so the revision counter has to live in a small
   downstream executor (`revision_gate`) rather than inside the condition
   itself. The slide's code is the right *mental model*; this file is the
   real, confirmed shape.
4. Run the guardrail's isolation tests (no live Foundry call needed):
   ```bash
   uv run pytest tests/test_part_b_guardrail.py -v
   ```

**Definition of done:**
- Revision loop works; trajectory eval scores and cost per successful
  outcome captured
- Budget guardrail triggers cleanly in a stress test — **required, not
  stretch** (a conditional edge has no built-in `max_iterations`)

---

## Part C — Swap to Group Chat

<!-- TODO: Goal / Time / Steps, once part_c_group_chat.py is authored. -->

**Definition of done:**
- Rebuilt with Group Chat; same golden set re-run; delta vs. Part B
  quantified
- Reflection committed to the repo: which approach fit best, and why

---

## Troubleshooting

<!-- TODO -->

---

## What you'll build tomorrow (Day 5)

<!-- TODO -->
