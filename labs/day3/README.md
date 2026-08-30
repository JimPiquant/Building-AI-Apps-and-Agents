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
- Be ready for a one-time browser sign-in prompt against your Azure DevOps
  tenant the first time you run Part C or Part D
  (`InteractiveBrowserCredential`, cached after that — see
  `python/ado_mcp.py`)

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

**Goal:** wrap Part A's plain agent with three cross-cutting controls that
don't touch the core instructions or tools — logging/timing, a request
guardrail, and a bounded retry around a flaky tool.

**Time:** ~15 min (this file is provided complete; read and run it).

### Steps

1. Run it:
   ```bash
   cd labs/day3/python
   uv run part_b_middleware.py
   ```
2. Read the printed runs in order:
   - **Run 1** is a plain request — only `[Logging]` lines print (start,
     finish, duration); the guardrail and retry middleware stay silent
     since neither condition triggers
   - **Run 2** asks about a password — `[Guardrail]` blocks it before the
     agent runs; `MiddlewareTermination` propagates out of `agent.run()`
     to the caller, same as `demos/day3/module-4-demo-2-guardrail-termination/`
   - **Run 3** calls a tool armed to fail twice then succeed — watch
     `[Retry]` print each attempt, then "succeeded on attempt 3"
   - **Run 4** calls the same tool armed to always fail — watch `[Retry]`
     stop at `MAX_RETRIES` and give up gracefully, instead of looping
     forever or crashing the request
3. Run the isolation tests (no Foundry credentials needed — these test the
   middleware logic directly with fake context objects):
   ```bash
   uv run pytest tests/test_part_b_middleware.py -v
   ```
4. Read through `part_b_middleware.py` itself, then
   `tests/test_part_b_middleware.py` — note how the tests never construct
   a real agent, only the exact attributes each middleware reads/writes.

**Definition of done:**
- Guard and failure path are observable; retry is bounded

---

## Part C — Read-only Azure DevOps MCP

**Goal:** prove that `X-MCP-Readonly: true` is a real server-side filter,
enforced by the Azure DevOps MCP endpoint itself — not something the
agent's own instructions merely promise.

**Time:** ~15 min (this file is provided complete; read and run it).

### Steps

1. Make sure your `.env` has `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT`,
   `AZURE_DEVOPS_TENANT_ID`, and `AZURE_DEVOPS_WORK_ITEM_ID` filled in —
   see Prerequisites above.
2. Run it:
   ```bash
   cd labs/day3/python
   uv run part_c_read_only.py
   ```
   The first run opens a browser for a one-time Entra sign-in against your
   Azure DevOps tenant (separate from the `az login` your Foundry calls
   use) — subsequent runs reuse the cached token.
3. Read the printed output in order:
   - **Read** — the agent gets the known work item and summarizes its
     title/state; verify this matches what's actually in your Azure
     DevOps project
   - **Write attempt** — the agent tries to add a comment to the same
     work item; the server rejects it because the MCP tool sent
     `X-MCP-Readonly: true` — read the response text to see how the
     rejection surfaces back through the agent (no exception, no crash)
4. Read through `ado_mcp.py`, then `part_c_read_only.py` — note how
   `build_read_only_ado_mcp()` is the only place `X-MCP-Readonly` is set;
   Part D reuses the same module with that flag flipped.

**Definition of done:**
- Read succeeds; dedicated project only

---

## Part D — Approved write

**Goal:** prove a write actually requires a human decision before it
executes, and that once approved, the mutation is real — the same
request Part C tried and had rejected now succeeds, but only after you
type `y`.

**Time:** ~15 min (this file is provided complete; read and run it).

### Steps

1. Run `part_c_read_only.py` first if you haven't — it shows the SAME
   request being rejected server-side, so you have a clean before/after
   comparison.
2. Run it:
   ```bash
   cd labs/day3/python
   uv run part_d_approved_write.py
   ```
3. When prompted `Approval requested for: wit_work_item_write` /
   `Arguments: ...` / `Approve? (y/n):`, read the exact arguments before
   deciding — type `y` to see the write go through, or `n` to see it
   rejected by your own decision instead of the server.
4. Read the "Read again" output — confirm the comment you approved is
   actually present on the work item now, both in the printed response
   and by checking the work item directly in Azure DevOps.
5. Read through `part_d_approved_write.py`'s `run_with_approval()`
   function, then `ado_mcp.build_write_enabled_ado_mcp()`'s default
   `approval_mode` — note that only `wit_work_item_write` is listed, so
   the verify-read in step 4 never paused for approval.

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
