# Day 4 Lab — Multi-agent workflows and evaluation

Turn the Day 3 single agent into a multi-agent research workflow — three
parts, escalating sophistication: workflow basics, then orchestrations,
then evaluation. Same Planner/Retriever/Critic roles throughout — only
what runs them changes.

| Part | Focus | Module(s) |
|---|---|---|
| **A** | Workflow basics — a raw `WorkflowBuilder` graph, no loop | 3 |
| **B** | Orchestrations — `SequentialBuilder`, a custom graph + guardrail, `GroupChatBuilder` | 2, 3, 6 |
| **C** | Evaluate and compare — the golden set against all three constructions from Part B | 5 |

**A note on ordering**: the LECTURE teaches Module 2 (orchestration
patterns — the prebuilt templates) before Module 3 (workflow fundamentals
— the graph primitives underneath). This LAB deliberately runs the
opposite order: build the graph by hand first (Part A), then appreciate
what the prebuilt templates save you (Part B). Both are legitimate
teaching sequences; the lab's is "understand it, then appreciate the
shortcut" rather than "see the shortcut, then see what it's built from."

Estimated time: ~90 min (Part A ~20 min, Part B ~40 min, Part C ~30 min).
Python only, per workshop policy.

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
    ├── roles.py                    # shared: Planner/Retriever/Critic agent factories + structured-output models + the search_docs tool + extract_verdict + load_golden_set
    ├── data/
    │   ├── README.md                # provenance note (copied from Day 2)
    │   └── docs/                    # bundled local docs the Retriever's search_docs tool grounds against
    ├── part_a_workflow_basics.py   # Part A: raw WorkflowBuilder graph, no loop
    ├── part_b_orchestrations.py    # Part B: Sequential + custom graph/guardrail + Group Chat — three constructions of the same roles
    ├── part_c_evaluate.py          # Part C: golden set vs. all three of Part B's constructions
    ├── tests/
    │   └── test_part_b_guardrail.py    # Part B: isolation tests for the custom-graph loop-counter/guardrail logic
    └── evals/
        └── golden_set.jsonl        # shared across Parts A-C — built once
```

---

## Part A — Workflow basics

**Goal:** see how a workflow is actually built — executors, edges, and
what a workflow decides counts as its output — before Part B shows you
the prebuilt shortcuts.

**Time:** ~20 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_a_workflow_basics.py
   ```
2. Read the printed results in order:
   - `roles.py` builds the Planner, Retriever, and Critic as three
     separate agents, each with a `default_options={"response_format":
     ...}` structured output — Plan, RetrievalResult, and CriticVerdict.
     The Retriever grounds via `search_docs`, a plain local Python tool
     that searches the bundled docs — no MCP, no Azure resource.
   - `part_a_workflow_basics.py` wires them into a graph by hand:
     `AgentExecutor` wraps each role, `WorkflowBuilder` + `add_edge`
     connects them straight-line (planner → retriever → critic), and
     `output_from=[critic]` designates the Critic's response as the
     workflow's one output.
   - Read the module docstring's grounding note on `output_from`: every
     `AgentExecutor`, by default, yields its own response as a workflow
     output — not just the last one in the chain. Without `output_from`,
     this 3-executor graph would produce THREE outputs, not one. This is
     exactly what `SequentialBuilder` (Part B) does for you under the
     hood.
   - The graph runs on a single sample question and prints the Critic's
     verdict — no golden set here, no evaluation. That's Part C's job.
   - Finally, `WorkflowViz(workflow).to_mermaid()` renders the graph as
     text (Module 3's "Visualize the graph you just built" slide) — paste
     it into [mermaid.live](https://mermaid.live) to see the three
     executors and two edges you just wired.

**Definition of done:**
- The graph runs end-to-end and prints the Critic's structured verdict
- The rendered Mermaid diagram matches the graph described above

---

## Part B — Orchestrations

**Goal:** build the SAME three roles three genuinely different ways —
`SequentialBuilder`'s shortcut, a custom graph that fixes its limitation,
and `GroupChatBuilder`'s alternative fix.

**Time:** ~40 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_b_orchestrations.py
   ```
2. Read the three constructions in order, all run against the same hard
   question (one that needs at least one revision):
   - **Construction #1 — `SequentialBuilder`.** The exact graph Part A
     built by hand, in one line:
     `SequentialBuilder(participants=[planner, retriever, critic]).build()`.
     Same limitation: the Critic runs once, and a rejected verdict has
     nowhere to go.
   - **Construction #2 — a custom `WorkflowBuilder` graph.** A
     conditional edge routes not-approved verdicts to `revision_gate`, a
     small custom executor, instead of straight back to the Planner
     (Module 3's "Conditional edges in code" slide, the exact mechanic
     Sequential can't do). `revision_gate` tracks a revision counter in
     workflow state (`ctx.set_state`/`get_state`) and either loops back
     to the Planner with the Critic's feedback, or — once the budget
     (`MAX_REVISIONS = 3`) is exceeded — stops with a graceful
     `GuardrailStop` instead of looping forever. **This guardrail is
     required, not a stretch goal**: unlike `AgentLoopMiddleware`'s
     built-in `max_iterations`, a conditional edge has no automatic cap.
   - **Construction #3 — `GroupChatBuilder`.** The same three roles as
     plain participants, coordinated by an LLM `orchestrator_agent`
     instead of a Python condition function — it decides who speaks
     next by reading the shared conversation. Its `termination_condition`
     parameter is itself the guardrail here (a message-count cap,
     `MAX_GROUP_CHAT_MESSAGES`) — no separate custom executor needed,
     because GroupChatBuilder gives you exactly one hook to control
     termination, not a graph of edges.
3. Read the module docstring's two grounding notes: one on why the real
   conditional-edge/state API (construction #2) is more involved than
   Module 3's simplified slide code, and one on why construction #3's
   participants are plain `Agent` instances (not `AgentExecutor`-wrapped
   like construction #2's) — both confirmed against Microsoft Learn's own
   tutorials and SDK samples, not assumed.
4. Run the guardrail's isolation tests (no live Foundry call needed):
   ```bash
   uv run pytest tests/test_part_b_guardrail.py -v
   ```
   These test construction #2's `compute_next_step()` specifically —
   construction #3's guardrail is a plain message-count check with no
   separate logic worth isolating.

**Definition of done:**
- All three constructions run end-to-end on the same hard question
- Constructions #2 and #3 both visibly recover from construction #1's
  limitation
- Budget guardrail triggers cleanly in a stress test — **required, not
  stretch**, for both constructions #2 and #3

---

## Part C — Evaluate and compare

**Goal:** run the golden set against all three of Part B's constructions
and see which one actually performs best — not just "which one has a
loop."

**Time:** ~30 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day4/python
   uv run python part_c_evaluate.py
   ```
2. Read the printed results in order:
   - `part_c_evaluate.py` builds nothing new — it imports Part B's three
     `build_workflow_*()` functions directly.
   - Only the **first `GOLDEN_SET_LIMIT` (5) of the 15** golden-set
     questions run by default, against EACH of the three constructions
     (15 total workflow runs) — both multi-round constructions can take
     up to 4 full planner/retriever/critic rounds per question, so this
     is the slowest part of the lab. Set `GOLDEN_SET_LIMIT = None` (or
     higher) locally for the full comparison.
   - Each construction gets its own summary (approved count, and for
     construction #2 specifically, guardrail-trip count — construction
     #3's guardrail has no distinct signal from a plain rejection, see
     the module docstring for why).
   - A final comparison table puts all three side by side.
3. Read the module docstring's "what this file does NOT do" note: no
   token-cost tracking, no cost-per-successful-outcome metric, no
   LLM-judged trajectory score. Module 5's slides name these as things a
   full evaluation harness would include; this lab's scope stops at
   "did the Critic approve, and did the guardrail behave" — flagged as a
   real extension, not silently assumed out of scope.
4. Write down your own answer to the printed reflection question — which
   construction fit best for this scenario, and why. This is part of
   Done, not an afterthought.

**Definition of done:**
- All three constructions run against the same golden-set slice
- A comparison table reports approved rate (and, for construction #2,
  guardrail-trip rate) side by side
- Reflection committed to the repo: which approach fit best, and why

---

## Troubleshooting

| Symptom | Check first |
|---|---|
| `NotImplementedError` when running any part | You're looking at a stub file from an earlier stage of this lab's authoring — pull the latest `main` |
| Auth error on the first Foundry call | `az login` session expired — rerun `az login` and select the correct subscription |
| `search_docs` returns "No docs matched" for everything | Confirm you're running from `labs/day4/python/` — `data/docs/` is resolved relative to `roles.py`'s own location, not your shell's cwd |
| Part B or Part C hangs or runs much longer than expected | Expected for hard questions — both multi-round constructions can take up to `MAX_REVISIONS`/`MAX_GROUP_CHAT_MESSAGES`-worth of live agent turns per question. Reduce `GOLDEN_SET_LIMIT` in Part C, or pick an easier `SAMPLE_QUERY` in Part B, if you're short on time |
| Part C's comparison table shows 0 approved everywhere | Check `FOUNDRY_MODEL`/`FOUNDRY_PROJECT_ENDPOINT` are the same values that worked for Part A — Part C reuses the same credential/client pattern, just runs it 3x |
| A golden-set result flips between runs | Expected — model nondeterminism, same as Day 3 Module 7's own point; no single run is trusted as ground truth |

---

## What you'll build tomorrow (Day 5)

Day 5 traces directly back to today's work:
- Module 1 traces multi-agent hand-offs by name — the same Planner→
  Retriever→Critic pattern you built three ways today.
- Module 4 revisits budget guardrails — today's required
  `MAX_REVISIONS`/`MAX_GROUP_CHAT_MESSAGES` caps are the concrete anchor.
- Module 5's CI regression harness is the same eval→change→re-eval
  discipline Part C practiced today, now wired into a pipeline.
- The capstone requires a golden set + a captured eval score — Part C's
  comparison table is your model for what that looks like.
