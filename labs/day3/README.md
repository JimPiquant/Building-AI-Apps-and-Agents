# Day 3 Lab — Session, streaming, robustness, Azure DevOps MCP, and evaluation

<!-- TODO: one-line goal statement once the docs-assistant extension scope for
Day 3 is finalized. Draft: extend the Day 2 support-triage assistant with
owned session continuity, a typed triage response, cross-cutting middleware,
a real Azure DevOps MCP backend (replacing Day 2's mock tools), and an
evaluation harness for exact tool-call correctness. -->

Five parts, composing every primitive from Day 3's lecture modules:

| Part | Focus | Module(s) |
|---|---|---|
| **A** | Session continuity + typed response | 1, 2 |
| **B** | Robustness (middleware) | 4 |
| **C** | Read-only Azure DevOps MCP | 5, 6 |
| **D** | Approved write | 5 |
| **E** | Evaluation | 7 |

Estimated time: <!-- TODO --> . Python only, per workshop policy.

## Prerequisites

<!-- TODO: finalize once Part C/D setup is authored. Known requirements per
Module 9's "Prerequisites for the future lab" slide: -->

- Day 2 lab complete and working (baseline docs assistant, `FoundryChatClient`)
- Your own Entra-backed Azure DevOps Services organization, plus a dedicated
  workshop project within it — **not** a shared/production org
- A known work item ID in that project (seed one; have a reset/cleanup plan
  for Part D, which mutates it)
- Read access first; write access separately approved (see Part D)
- A Foundry project + judge model deployment for Part E's `FoundryEvals`
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant

### Azure DevOps setup — TODO

<!-- TODO: one-time portal/CLI setup steps for provisioning the dedicated ADO
org/project and the work item fixture, mirroring the level of detail in
labs/day2/README.md's "Portal setup" section. -->

### Fill in `.env`

```bash
cp labs/day3/.env.example labs/day3/.env
# edit labs/day3/.env — see that file's comments for each value
```

### Sync the Python project

```bash
cd labs/day3/python
uv sync
uv run python agent.py   # sanity check — prints a greeting
```

If the sanity check fails, do NOT proceed. Fix your `.env` or Foundry access
first (or ask for help).

## Repo layout

```
labs/day3/
├── README.md                       # you're here
├── .env.example                    # copy to .env at this level
└── python/
    ├── pyproject.toml              # uv-managed
    ├── README.md                   # Python starter guide
    ├── agent.py                    # baseline sanity check
    ├── part_a_session_response.py  # Part A: session, serialize/restore, stream, typed TriageResult
    ├── part_b_middleware.py        # Part B: logging/timing, guardrail short-circuit, exception handling, bounded retry
    ├── ado_mcp.py                  # Part C/D: authenticated MCPStreamableHTTPTool client to Azure DevOps
    ├── part_c_read_only.py         # Part C: read-only ADO MCP (X-MCP-Readonly: true)
    ├── part_d_approved_write.py    # Part D: approval-gated write, re-read to verify
    ├── part_e_evaluate.py          # Part E: evaluate_agent / ExpectedToolCall / LocalEvaluator / FoundryEvals
    ├── tests/
    │   └── test_part_b_middleware.py   # Part B: isolation tests for guardrail/retry behavior
    └── evals/
        └── tool_contract_golden_set.jsonl  # Part E: read, approved write, rejected write, no-tool cases
```

---

## Part A — Session continuity + typed response

**Goal:** prove two contracts hold before building anything else on top of
them — session state survives a serialize/restore round trip, and a single
streamed run can end with a validated typed value.

**Time:** ~15 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day3/python
   uv run python part_a_session_response.py
   ```
2. Read the printed turns in order:
   - **Turns 1-2** create a session and tell the agent a fact
     (`session.to_dict()` is written to `part_a_session_payload.json`)
   - **Turn 3** reloads that payload from disk with `AgentSession.from_dict()`
     and asks about the fact from turn 1 — the correct answer proves the
     restored session retains state from before the "restart"
   - **Turn 4** runs on that same restored session with `stream=True` and
     `options={"response_format": TriageResult}` — watch the text stream,
     then see the finalized `TriageResult` printed after
3. Read through `part_a_session_response.py` itself — this is the pattern
   Part B's middleware wraps around, so understand it before moving on.

**Definition of done** (from Module 9's "Definition of done and guardrails" slide):
- Session: restored turn retains intended state; ownership mapping verified
- Structured stream: UI updates, final typed value; no partial JSON actions

---

## Part B — Robustness (middleware)

<!-- TODO: Goal / Time / Steps, once part_b_middleware.py is authored. -->

**Definition of done:**
- Guard and failure path are observable; retry is bounded

---

## Part C — Read-only Azure DevOps MCP

<!-- TODO: Goal / Time / Steps, once part_c_read_only.py is authored. -->

**Definition of done:**
- Read succeeds; dedicated project only

---

## Part D — Approved write

<!-- TODO: Goal / Time / Steps, once part_d_approved_write.py is authored. -->

**Definition of done:**
- Write requires approval; dedicated project only

---

## Part E — Evaluate the tool contract

<!-- TODO: Goal / Time / Steps, once part_e_evaluate.py and
evals/tool_contract_golden_set.jsonl are authored. -->

**Definition of done:**
- Expected tool/action/args are reported; no universal pass threshold claimed

---

## Troubleshooting

<!-- TODO -->

---

## What you'll build tomorrow (Day 4)

<!-- TODO -->
