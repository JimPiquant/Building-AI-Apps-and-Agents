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
- A Foundry IQ knowledge source — the same one your Day 2/3 docs
  assistant already grounds against
- A Foundry judge model deployment, for trajectory/cost evaluation
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant
- **(Optional stretch only)** Your own Azure DevOps setup from Day 3 —
  only needed if you build the optional Ticket agent. See
  [`labs/day3/README.md`'s Azure DevOps setup](../day3/README.md#azure-devops-setup)
  section; nothing new to provision for the core lab.

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
    ├── roles.py                    # shared: Planner/Retriever/Critic agent factories + Answer model
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
   contains 15 questions grounded in your Day 2 docs.
2. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_a_sequential.py
   ```
3. Read the printed results in order:
   - `roles.py` builds the Planner, Retriever, and Critic as three
     separate agents, each with a `default_options={"response_format":
     ...}` structured output — Plan, RetrievalResult, and CriticVerdict.
   - `part_a_sequential.py` wires them into one workflow with
     `SequentialBuilder(participants=[planner, retriever, critic]).build()`
     — Module 2's simplest orchestration builder, a flat participants list,
     strict order, no loop.
   - Every one of the 15 golden-set questions runs through the workflow
     exactly once. Most come back `APPROVED`. At least one — the golden
     set marks a few with `"expects_revision": true` — comes back
     `NOT APPROVED`, and stays that way: there's nowhere for that verdict
     to go back to.
4. That last point IS Part A's point, not a bug to chase down:
   `SequentialBuilder`'s own docs are explicit that "Order Matters" —
   agents execute strictly in the order given, with no loop-back to an
   earlier participant. Part B rebuilds this same golden set against a
   custom `WorkflowBuilder` graph specifically to fix this.

**Definition of done:**
- Runs end-to-end on the golden set; the "no correction" limitation shows
  up in at least one result

---

## Part B — A custom graph fixes it

<!-- TODO: Goal / Time / Steps, once part_b_custom_graph.py is authored. -->

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
