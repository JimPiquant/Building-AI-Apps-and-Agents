# Day 4 Lab — Multi-agent workflows and evaluation

Turn Day 3's single agent into a multi-agent research pipeline. The same
Planner/Retriever/Critic roles run three genuinely different ways — you
author each construction yourself — then you evaluate all three against a
shared golden set to find out which one actually performs best.

| Part | Focus | Module(s) |
|---|---|---|
| **A** | `SequentialBuilder` — the fastest correct orchestration, and its ceiling | 2 |
| **B1** | The graph that fixes it — a custom `WorkflowBuilder` graph with a revision loop | 3 |
| **B2** | Bound the loop — a required guardrail, test-driven | 6 |
| **C** | Change one thing, measure it — swap in `GroupChatBuilder`, then evaluate all three | 2, 5 |
| **D** | *(optional)* The same idea, authored as YAML instead of code — declarative workflows | 3 |

Parts A, B1, and C are **authoring exercises** — you complete TODOs in a
starter file. Part B2 is **test-driven** — a failing test is the
specification, and you edit one method until it passes. Part D is
**provided complete** — no TODOs, nothing to author, just run it and read
the YAML. Worked answers for every authored part live in
`python/solutions/`; try each part yourself first.

Estimated time: ~2 hours (Part A ~20 min, Part B1 ~45 min, Part B2 ~20 min,
Part C ~35 min). Python only, per workshop policy. Part D is optional and
not included in this estimate (~10 min to read and run).

## Prerequisites

- Day 3 lab complete and working (baseline single agent with memory,
  streaming, structured outputs, and MCP)
- A Foundry judge model deployment, for the optional `--foundry` cloud
  evaluation pass
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant

No Foundry IQ / Azure AI Search dependency: the Retriever role grounds
against a small bundle of local docs shipped in this repo
(`python/data/docs/*.md`) — a purpose-built Contoso Cloud Platform
corpus, not a live knowledge base. Nothing to have kept provisioned since
Day 2.

### Fill in `.env`

```bash
cp labs/day4/.env.example labs/day4/.env
# edit labs/day4/.env — see that file's comments for each value
```

### Sync the Python project

```bash
cd labs/day4/python
uv sync
uv run retrieval.py   # setup check — no model call, just prints the corpus
```

If that fails, do NOT proceed. Fix your `uv sync` first (or ask for help).

## Repo layout

```
labs/day4/
├── README.md                     # you're here
├── .env.example                  # copy to .env at this level
└── python/
    ├── pyproject.toml            # uv-managed — agent-framework, agent-framework-orchestrations, agent-framework-foundry, agent-framework-declarative (Part D)
    ├── README.md                 # Python starter guide — package map, API quick reference
    ├── retrieval.py              # provided — corpus search; run as your setup check
    ├── agents.py                 # provided — Planner/Retriever/Critic factories + shared types (Plan, Findings, Answer, CriticResult)
    ├── trace.py                  # provided — prints the workflow event stream
    ├── part_a_sequential.py      # Part A — you write, 2 TODOs
    ├── workflow_nodes.py         # provided, except RevisionGate.decide (Part B2) — the graph's typed adapters + the gate
    ├── part_b_graph.py           # Part B1 — you write, 3 TODOs
    ├── part_c_group_chat.py      # Part C — you write, 1 TODO
    ├── evaluate.py               # provided — the evaluation harness
    ├── part_d_declarative.py     # Part D (optional) — provided complete, needs Python 3.13
    ├── greeting-workflow.yaml    # Part D's workflow, authored as YAML instead of code
    ├── data/
    │   └── docs/                 # bundled Contoso Cloud Platform docs the Retriever's search_docs tool grounds against
    ├── evals/
    │   ├── golden_set.jsonl      # 8 cases across 4 branches — shared by Parts A/B/C via evaluate.py
    │   └── stress_case.json      # the ungroundable question that motivates Part B2's guardrail test
    ├── tests/
    │   └── test_guardrail.py     # Part B2's spec — ships failing
    └── solutions/                # worked answers for every authored part — try yourself first
```

---

## Part A — Sequential, and its ceiling

**Goal:** watch a Microsoft Agent Framework workflow execute, then find the
wall that `SequentialBuilder` runs into.

**Time:** ~20 min. Two TODOs in `part_a_sequential.py`.

### Steps

1. Read `agents.py` and `retrieval.py` first — both are provided complete.
   `agents.py` builds the Planner, Retriever, and Critic, and defines the
   typed contracts they exchange (`Plan`, `Findings`, `Answer`,
   `CriticResult`). `retrieval.py` is the local, deterministic
   `search_docs` tool the Retriever calls — no network, no vector store,
   no Azure resource.
2. Complete the two TODOs in `part_a_sequential.py`:
   - Build a `SequentialBuilder` workflow with the three agents as
     participants, in order Planner → Retriever → Critic.
   - Run a second, FRESH workflow instance against a question that spans
     two documents (reusing the first instance risks leaking state
     between runs — Module 3's state-isolation trap).
3. Run it:
   ```bash
   uv run part_a_sequential.py
   ```
4. Read what happens on Run 2: the Critic can say `approved=false` with a
   precise reason, and the workflow ends anyway. `SequentialBuilder` is
   forward-only — there is no edge back to the Planner for that rejection
   to travel along. Part B fixes exactly this.

**Definition of done:**
- Both runs complete and print a trace you can read
- You can explain, in your own words, why Run 2 ends without fixing
  itself

---

## Part B1 — The graph that fixes it

**Goal:** rebuild Part A's three roles as an explicit `WorkflowBuilder`
graph with a conditional edge that routes an unapproved answer back to
the Planner.

**Time:** ~45 min. Three TODOs in `part_b_graph.py`. This is a genuine
rewrite, not a diff on Part A — you declare every node and every edge
yourself.

### Steps

1. Read `workflow_nodes.py` first — it's provided complete except for one
   method. It defines the small typed adapters (`to_plan`, `to_findings`,
   `to_revision`, `finalize`) that parse each agent's JSON text response
   and build the next agent's request, plus the `RevisionGate` executor
   that decides whether to loop back or finish.
2. Complete the three TODOs in `part_b_graph.py`:
   - Wrap each of the three agents in an `AgentExecutor`.
   - Wire the forward path: planner → `to_plan` → retriever →
     `to_findings` → critic → gate.
   - Wire the loop: two conditional edges out of the gate
     (`needs_revision` / `is_final`), and close the cycle by pointing
     `to_revision` back at the planner node.
3. Run it:
   ```bash
   uv run part_b_graph.py
   ```
4. Read the printed Mermaid graph (paste it into
   [mermaid.live](https://mermaid.live)) and confirm the edge back to the
   planner is really there. Compare the trace against Part A's — if the
   revision loop fired, the planner appears twice.

**Definition of done:**
- The graph runs end-to-end and the Mermaid diagram shows the loop-back
  edge
- You can point to the one line that closes the cycle

---

## Part B2 — Bound the loop

**Goal:** `RevisionGate` currently loops back on every unapproved result,
forever, for a question the corpus cannot answer. Give it a bound.

**Time:** ~20 min. One method to edit: `RevisionGate.decide` in
`workflow_nodes.py`.

### Steps

1. Run the spec — it ships failing:
   ```bash
   uv run pytest tests/test_guardrail.py -v
   ```
2. Read the test file. It is the specification: the loop must stop at
   `MAX_REVISIONS`, stopping must be graceful (a low-confidence `Answer`,
   not an exception), and a Critic that DOES approve must still
   short-circuit immediately.
3. Edit `RevisionGate.decide`: before incrementing the revision counter
   and sending the work back, stop once `revision` has already reached
   `MAX_REVISIONS` and finish with `should_revise=False`, `capped=True`,
   and an honestly low-confidence answer.
4. Re-run the test until all three pass.
5. Optional: `evals/stress_case.json` is the question that motivates this
   part — nothing in the corpus answers it, and nothing ever will.

**Definition of done:**
- All of `tests/test_guardrail.py` passes
- You can explain why the bound belongs in the gate (which has workflow
  state) and not in the edge condition (which only sees the message)

---

## Part C — Change one thing, measure it

**Goal:** you have a working Part B. Now find out whether a different
orchestration is actually better — a question aggregate measurement can
answer and reading a single trace cannot.

**Time:** ~35 min. One TODO in `part_c_group_chat.py`, then run the
evaluation harness.

### Steps

1. Complete the TODO in `part_c_group_chat.py`: build the same three
   roles with `GroupChatBuilder` instead of a graph — an `orchestrator_agent`
   picks who speaks next, turn by turn, until a `termination_condition`
   fires (your bound, for the same reason Part B2's was required).
2. Run it once to see it work:
   ```bash
   uv run part_c_group_chat.py
   ```
3. Run the comparison that matters:
   ```bash
   uv run evaluate.py --part b --part c --repetitions 3
   ```
   Add `--part a` to include Part A in the comparison, `--foundry` to
   also send trajectories to Foundry's cloud evaluators, or `--case r1`
   to debug a single golden-set case.
4. Read the printed range, not just the midpoint. With eight cases and
   three agents per run, a one-case swing is roughly 12 percentage
   points. If Part B's and Part C's ranges overlap, the honest
   conclusion is "no measurable difference at this sample size" — look
   at cost per success and revision count instead.

**Definition of done:**
- The GroupChatBuilder construction runs end-to-end with a working
  termination bound
- You've run the 3-repetition comparison and written down which
  construction you'd actually ship, and why

---

## Part D — Declarative workflows (optional)

**Goal:** see the same execution engine run a workflow authored as data
(YAML) instead of code, for contrast with Parts A-C.

**Time:** ~10 min. Provided complete — no TODOs.

### Steps

1. This part needs Python 3.13 — `agent-framework-declarative` doesn't yet
   support 3.14. Run it with the interpreter pinned explicitly:
   ```bash
   uv run --python 3.13 part_d_declarative.py
   ```
   This rebuilds `.venv` against 3.13, and every later bare `uv run` in this
   folder keeps using that environment. If you want the rest of the lab
   back on 3.14 afterward, rebuild the venv the same way against any other
   lab file: `uv run --python 3.14 part_a_sequential.py`.
2. Read `greeting-workflow.yaml` alongside the output. `WorkflowFactory`
   parses the YAML's four actions (`SetVariable`, `SetVariable`,
   `SendActivity`, `SetVariable`) into the same kind of `Workflow` object
   Part A and B1 build in code.
3. Read `part_d_declarative.py`'s own docstring for what a more interesting
   declarative workflow could look like — it names several of the
   schema's other action kinds (`InvokeAzureAgent`, `ConditionGroup`/`If`,
   `Foreach`, `RequestExternalInput`/`WaitForHumanInput`) as optional
   stretch ideas.

Part D is not evaluated by `evaluate.py` and isn't part of the Part A/B/C
comparison — it's a separate, self-contained demonstration of an
alternative authoring surface for the same execution engine.

---

## Troubleshooting

| Symptom | Check first |
|---|---|
| `ImportError` on `SequentialBuilder` or `GroupChatBuilder` | They ship in `agent-framework-orchestrations`, a separate package from `agent-framework`. Re-run `uv sync` |
| `NotImplementedError` when running `evaluate.py` for a part | That part's TODOs aren't finished yet — `evaluate.py` reports this clearly rather than a stack trace |
| Auth error on the first Foundry call | `az login` session expired — rerun `az login` and select the correct subscription |
| `search_docs` returns "No docs matched" for everything | Confirm you're running from `labs/day4/python/` — `data/docs/` is resolved relative to `retrieval.py`'s own location, not your shell's cwd |
| Part B1 or Part C hangs, or runs much longer than expected | Expected for the revision-branch golden-set cases — a bounded loop can still take `MAX_REVISIONS` full rounds. Use `--case` to isolate one question while debugging |
| A golden-set result flips between runs | Expected — model nondeterminism. `evaluate.py --repetitions 3` exists precisely so you don't trust a single run |
| Import or runtime error running `part_d_declarative.py` | Check the Python version — `agent-framework-declarative` doesn't yet support 3.14. Rebuild the venv with `uv run --python 3.13 part_d_declarative.py` |

---

## What you'll build tomorrow (Day 5)

Day 5 traces directly back to today's work:
- Module 1 traces multi-agent hand-offs by name — the same Planner→
  Retriever→Critic pattern you built two ways today.
- Module 4 revisits budget guardrails — today's required `MAX_REVISIONS`
  cap and Part C's termination condition are the concrete anchor.
- Module 5's CI regression harness is the same eval→change→re-eval
  discipline Part C practiced today, now wired into a pipeline.
- The capstone requires a golden set + a captured eval score — Part C's
  comparison output is your model for what that looks like.
