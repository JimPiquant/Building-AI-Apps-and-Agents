# Day 3 Lab — Session, streaming, robustness, Azure DevOps MCP, and evaluation

Each part demonstrates one Day 3 primitive with its own standalone agent —
not a single assistant you extend part to part (unlike Day 2's lab). Run
each part, read the code, understand the contract it proves; the same
patterns are what you'd wire into a real production agent.

Five parts, composing every primitive from Day 3's lecture modules:

| Part | Focus | Module(s) |
|---|---|---|
| **A** | Session continuity + typed response | 1, 2 |
| **B** | Robustness (middleware) | 4 |
| **C** | Read-only Azure DevOps MCP | 5, 6 |
| **D** | Approved write | 5 |
| **E** | Evaluation | 7 |

Estimated time: **~75 min** (~15 min per part — every part is provided
complete; you run and read, not author from scratch), plus a one-time
Azure DevOps project setup below within the workshop's shared,
Entra-backed organization. Python only, per workshop policy.

## Prerequisites

- A working Foundry project and `az login` from Days 1-2 — each part here
  builds its own `FoundryChatClient`; no code from the Day 2 lab is imported
- The workshop's shared, Entra-backed Azure DevOps Services organization,
  plus your own dedicated project within it — **not** your organization's
  real production project
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

### Azure DevOps setup

The workshop provides **a shared, Entra-backed Azure DevOps Services
organization** — a test instance, not your organization's production
Azure DevOps — the same one Day 3's Module 6 demonstration used. You'll
be given sign-in details for it. Once you're signed in, create your own
dedicated project and work item within it (steps 2-3 below); skip step 1
entirely.

Don't have access to the shared organization (for example, working
through this lab outside the live session)? Do step 1 first to create
your own personal one instead — everything else below works identically
either way.

1. **(Only if you don't have access to the shared organization) Create
   your own, signed in with your work/school (Entra) account** — this is
   the step that matters: signing in with a personal Microsoft account
   creates an MSA-based organization, which the Azure DevOps remote MCP
   server does not support (Module 6's own "Prerequisites" slide: "Not
   supported — Standalone MSA organizations"). Signing in with your
   work/school account instead **automatically connects** the new
   organization to that Entra tenant.
   1. Go to [https://dev.azure.com](https://dev.azure.com) and sign in
      with your work/school account.
   2. Select **New organization**.
   3. Enter a name, pick a hosting geography, select an Azure subscription
      for billing, then **Continue**.
   4. Note the organization name — this is your `AZURE_DEVOPS_ORG`.
   (Already have a non-Entra organization instead? See
   [Connect your organization to Microsoft Entra ID](https://learn.microsoft.com/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops)
   rather than creating a new one.)
2. **Create your own dedicated project** in the organization (the shared
   one you were given, or the one you just created) — name it something
   like `day3-lab-<yourname>` so it's clearly yours within a shared org.
   This is your `AZURE_DEVOPS_PROJECT`.
3. **Create one work item.** Open the project → **Boards** → **New Work
   Item** → **Task** (or **Bug**). Give it any title. Note its numeric ID
   — this is your `AZURE_DEVOPS_WORK_ITEM_ID`. This is the item Part C
   reads and Part D mutates; have a reset/cleanup plan (or just accept it
   ends up with a "reviewed" comment on it). Since your project is your
   own within the organization, this work item is yours alone — no
   collision with other attendees sharing the same organization.
4. **Find your Entra tenant ID** — this is your `AZURE_DEVOPS_TENANT_ID`:
   ```bash
   az account show --query tenantId -o tsv
   ```
   (Or Azure portal → Microsoft Entra ID → Overview → Tenant ID, if the
   organization is backed by a different tenant than your current `az
   login` session.)

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
        └── tool_contract_golden_set.jsonl  # Part E: read, approved write, no-tool cases (rejected-write deferred)
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

**Goal:** see that `X-MCP-Readonly: true` is a real server-side filter,
enforced by the Azure DevOps MCP endpoint itself — the server withholds
the write tools from discovery, rather than the agent's own instructions
merely promising not to use them.

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
   - **Write request** — the agent is asked to add a comment to the same
     work item and reports that it cannot. Because the MCP tool sent
     `X-MCP-Readonly: true`, the server left every write tool out of the
     list it advertised, so no write was attempted and none was rejected —
     the capability was withheld before the model ever saw it (no
     exception, no crash)
4. Read through `ado_mcp.py`, then `part_c_read_only.py` — note how
   `_build_ado_mcp()` sets `X-MCP-Readonly` for both paths and
   `build_read_only_ado_mcp()` is simply its `readonly=True` caller;
   Part D reuses the same module with that flag flipped. The headers are
   the only filtering in play — there is no client-side allow-list.

**Definition of done:**
- Read succeeds; dedicated project only

---

## Part D — Approved write

**Goal:** prove a write actually requires a human decision before it
executes, and that once approved, the mutation is real — the same
request Part C could not carry out now succeeds, but only after you
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
3. When prompted `Approval requested for: wit_work_item_comment_write` /
   `Arguments: ...` / `Approve? (y/n):`, read the exact arguments before
   deciding — type `y` to see the write go through, or `n` to see it
   stopped by your own decision instead of by the server's filter. Note
   the tool named in the prompt: adding a comment routes through
   `wit_work_item_comment_write`, not `wit_work_item_write`.
4. Read the "Read again" output — confirm the comment you approved is
   actually present on the work item now, both in the printed response
   and by checking the work item directly in Azure DevOps.
5. Read through `part_d_approved_write.py`'s `run_with_approval()`
   function, then `ado_mcp.build_write_enabled_ado_mcp()`'s default
   `approval_mode` — note that both write tools are listed
   (`wit_work_item_write` and `wit_work_item_comment_write`) while
   `wit_work_item` is not, which is why the verify-read in step 4 never
   paused for approval. Gating only `wit_work_item_write` would have let
   this comment write through unreviewed.

**Definition of done:**
- Write requires approval; dedicated project only

---

## Part E — Evaluate the tool contract

**Goal:** prove `evaluate_agent`/`LocalEvaluator` actually catch a
regression, rather than trusting a single manual run — this is the same
"evaluate → iterate → re-evaluate" muscle Day 2's lab built, now against
Day 3's tool-selection contract.

**Time:** ~15 min (this file is provided complete; read and run it).

**Note:** only 3 of Module 9's 4 named golden cases are implemented here
(read, approved write, no-tool) — the "rejected write" case was
deliberately deferred; see the "On the missing 'rejected write' case"
section of `part_e_evaluate.py`'s module docstring for why.

### Steps

1. Run it:
   ```bash
   cd labs/day3/python
   uv run part_e_evaluate.py
   ```
2. Read the printed results in order — each golden case runs 3 times
   (`num_repetitions`) and reports the observed pass rate, not a single
   pass/fail bit:
   - **Read case** — `Get work item 42.` should pass consistently
   - **Write case** — `Update work item 42: mark it reviewed.` should
     pass consistently
   - **No-tool case** — a general knowledge question; passes only if the
     agent made zero tool calls (a custom evaluator, not the built-in
     checks — see the module docstring for why)
3. Read the optional "Foundry cloud evaluators" section at the end — if
   your `EVALUATION_MODEL` deployment isn't set up, this section reports
   "unavailable" per case and does not fail the run. If it succeeds, each
   result prints a `report_url` — **open it in a browser** to see that
   evaluation run persisted in the Foundry portal. You can also get there
   by hand: [https://ai.azure.com](https://ai.azure.com) → your project →
   **Evaluation** in the left pane → select the run for row-level detail
   (query, response, ground truth, evaluator scores, token usage).
4. Read through `part_e_evaluate.py` — note the documented judgment call
   in its module docstring: using a separate judge client
   (`EVALUATION_MODEL`) rather than reusing the agent's own client as its
   judge, to avoid the conflict of interest Day 2 Module 3 named.

**Definition of done:**
- Expected tool/action/args are reported; no universal pass threshold claimed

---

## Troubleshooting

| Part | Symptom | Check first |
|---|---|---|
| A | `part_a_session_payload.json` fails to reload / looks stale | Delete it and rerun from scratch — it's overwritten each run, so a file left over from an earlier interrupted attempt is the usual cause |
| A, B | Auth error on the first Foundry call | `az login` session expired — rerun `az login` and select the correct subscription |
| C, D | Sign-in or consent fails | Confirm the organization is Entra-backed (not an MSA org) and that your tenant's enterprise app consent policy allows the Azure DevOps MCP server — Module 6's own failure-modes table names this exact check first |
| C, D | Expected tool is missing | Check the `X-MCP-Readonly` and `X-MCP-Toolsets` headers in `ado_mcp.py` against what the server actually exposes — those two headers are the only filtering in play; there is no client-side allow-list |
| C, D | Tool call returns forbidden | Your signed-in user needs membership and resource permissions on the specific project/work item, not just the organization |
| D | Approval loop hangs or resubmits the original query | Confirm you're reusing one `agent.create_session()` across both `agent.run()` calls and sending only `Message("user", approval_responses)` on resume — not replaying the original query text |
| D | A write you expected to require approval goes straight through | The tool performing the write may not be one you listed in `always_require_approval`. This lab lists both `wit_work_item_write` and `wit_work_item_comment_write` for exactly that reason — a comment routes through the comment tool, not the field-update tool. If you extend the lab to other write tools, add each one by name |
| E | A golden case's pass/fail flips between runs | Expected — this is the same model nondeterminism Module 7 names directly; `num_repetitions=3` exists so you see the distribution, not a single sample |
| E | "Foundry evaluation unavailable" printed for every case | `run_foundry_evals()` is wrapped so this can't fail the lab — check `EVALUATION_MODEL` (or `FOUNDRY_MODEL` as its fallback) is a deployed model name your Foundry project can reach |

---

## What you'll build tomorrow (Day 4)

Day 3 kept every demonstration to a single agent — deeper tool use, but
still one agent making its own decisions. Day 1's architecture map already
places Day 4 as the week's **multi-agent** day, and Day 2's evaluation
module named it the **evaluation anchor**: the habit you started today
(golden cases, repeated runs, tool-call correctness) extends to
trajectory evaluation, cost-per-successful-outcome, and a regression
harness — now applied across multiple cooperating agents instead of one.
