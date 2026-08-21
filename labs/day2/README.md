# Day 2 Lab — Docs assistant with ticket triage + evaluation

Extend the Day 1 docs assistant into a **support triage** agent that:

1. Answers product questions from documentation (Day 1 baseline)
2. Files a support ticket when the docs don't cover it (Module 6)
3. Looks up the status of an existing ticket (Module 6)
4. Is measured with a **retrieval eval** and a **tool-use eval** (Module 3)

Estimated time: **~2 hours of lab work**. Python only — C# for Day 2 is out of scope
per the workshop policy.

## Prerequisites

Before you start, you need:

- Day 1 lab complete and working
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant
- Same Foundry project and model deployment you used on Day 1 (recommended: **`gpt-5.6-luna`**)
- The one-time portal setup below

### Portal setup — one-time, ~15 min

Part A of this lab uses a Foundry IQ knowledge base backed by an Azure Blob
Storage container. Everything is created **in the Azure and Foundry portals**
— the lab code just consumes the knowledge base's MCP endpoint. Reference:
[Create a blob knowledge source](https://learn.microsoft.com/azure/search/agentic-knowledge-source-how-to-blob).

#### 1. Create the Azure Storage account and blob container

1. In the [Azure portal](https://portal.azure.com), **Create a resource** →
   **Storage account**. Standard tier, LRS is fine for the workshop.
2. After deployment, open the storage account → **Data storage → Containers**
   → **+ Container**. Name it `contoso-docs`.
3. Open the `contoso-docs` container and use **Upload** to add every file
   from `labs/day2/python/data/docs/` (10 markdown files).

#### 2. Create the Foundry IQ knowledge base (Foundry portal)

1. Open the [Foundry portal](https://ai.azure.com) → your project → Build → 
   **Knowledge**.
2. Click the **Create new resource** link to create an AI Search resource. 
   Give it a unique name, like `contoso-kb-yourname`.
3. Select **+ Create a knowledge base**. Name it `contoso-docs`. In the
   **Description** field, paste:
   > *"General Contoso developer API product documentation. Does NOT contain
   > account-specific state (orders, tickets, entitlements)."*
4. Choose and deploy a chat completion model.
5. **Add sources → + Azure Blob Storage**. Point at the storage account and
   `contoso-docs` container from step 1. Authentication: **System-assigned
   managed identity**. Embedding model: **text-embedding-3-small** (or any
   embedding model already deployed in your project).
6. **Chat completion model:** leave blank (we run at **Minimal** reasoning
   effort — the agent's own LLM does the reasoning; see Module 1 slide 8).
7. **Retrieval reasoning effort: Minimal.** Output mode: **Extractive data.**
8. Create the knowledge base.

#### 3. Grant RBAC (Azure portal — IAM)

Three role assignments, in two places:

| Role | Assigned to (member) | Scope |
|---|---|---|
| **Storage Blob Data Reader** | the **Search service's** system-assigned managed identity | the **storage account** you created in step 1 |
| **Search Index Data Reader** | the **Foundry project's** system-assigned managed identity | the **Search service** connected to your project |
| **Cognitive Services OpenAI User** | the **Search service's** system-assigned managed identity | the **Foundry project** connected to your project |

To assign each role:
1. Open the target resource (storage account for row 1; Search service for row 2).
2. **Access control (IAM) → + Add → Add role assignment**.
3. Select the role → **Next**.
4. **Members** tab → **Assign access to: Managed identity → + Select members**
   → filter by the correct managed identity (the Search service MI, or the
   Foundry project MI). Select it and confirm.
5. **Review + assign**.

Role propagation can take a few minutes. If retrieval returns 403 in Part A,
wait a bit and retry.

#### 4. Verify in the Foundry portal

1. Foundry portal → your project → **Knowledge → contoso-docs**. Confirm
   ingestion completed (green status on the source). If it's still running,
   give it a minute for a 10-file corpus.
2. Open the Foundry **Playground** with any agent from Day 1, attach
   `contoso-docs` as a knowledge source, and ask *"How do I generate an API
   key?"* You should see a grounded answer with a citation to
   `getting-started.md` or similar.

If verify fails, don't proceed. Fix the RBAC or ingestion state first (or
ask for help).

#### 5. Fill in `.env`

```bash
cp labs/day2/.env.example labs/day2/.env
# edit labs/day2/.env with values for FOUNDRY_PROJECT_ENDPOINT,
# FOUNDRY_MODEL, AZURE_SEARCH_ENDPOINT, FOUNDRY_IQ_KNOWLEDGE_NAME, and
# EVALUATION_MODEL.
```

- `AZURE_SEARCH_ENDPOINT` is the Search service URL from its Overview page —
  `https://<search-service>.search.windows.net`. No trailing slash.
- `FOUNDRY_IQ_KNOWLEDGE_NAME` matches the knowledge base name from step 2
  (`contoso-docs` if you kept the default).

#### 6. Sync the Python project

```bash
cd labs/day2/python
uv sync
uv run python agent.py   # sanity check — prints a greeting
```

If the sanity check fails, do NOT proceed. Fix your `.env` or Foundry access
first (or ask help).

## Repo layout

```
labs/day2/
├── README.md                       # you're here
├── .env.example                    # copy to .env at this level
└── python/
    ├── pyproject.toml              # uv-managed
    ├── README.md                   # Python starter guide (also linked below)
    ├── agent.py                    # baseline sanity check
    ├── foundry_iq.py               # Part A/C: authenticated MCP client to your IQ knowledge base
    ├── part_a_grounded_agent.py    # Part A: agent with IQ attached
    ├── mock_backend.py             # provided in-memory ticket store
    ├── tools.py                    # Part B: YOU author create_ticket + lookup_status
    ├── part_b_wire_tools.py        # Part B: agent with your tools attached
    ├── part_c_combined.py          # Part C: combined agent
    ├── data/docs/                  # 10 mock product docs (uploaded to blob during portal setup)
    ├── tests/
    │   ├── test_tools.py           # Part B: isolation tests (mostly provided)
    │   └── test_golden_set.py      # Part B/C: tool-use eval runner
    └── evals/
        ├── retrieval_eval.py       # Part A: Retrieval + Groundedness scorer
        ├── tools_golden_set.jsonl  # Part B: YOU author 6 rows
        └── combined_golden_set.jsonl # Part C: 3 starter rows provided
```

---

## Part A — Knowledge grounding + retrieval eval

**Goal:** move the assistant from prompt-only to grounded in docs.

**Time:** ~40 min (portal setup is a prerequisite, done above).

### Steps

1. Run the grounded agent to produce a transcript:
   ```bash
   uv run python part_a_grounded_agent.py
   ```
   The five queries (3 answerable + 2 not) are written to
   `evals/part_a_transcript.jsonl`.

2. Score the transcript with Foundry evaluators:
   ```bash
   EVALUATION_MODEL=gpt-5.6-luna uv run python evals/retrieval_eval.py
   ```
   Results are written to `evals/part_a_baseline.json`. See
   [`python/README.md`](python/README.md#part-a-evaluation-model) for notes on
   the `EVALUATION_MODEL` setting.

### Definition of done

- **Retrieval** score >= **0.7** on the answerable set (3 queries)
- **Groundedness** score >= **0.8** across all 5 queries

If you don't hit the bar, tighten the agent instructions or the knowledge source
description in `part_a_grounded_agent.py` and re-run.

---

## Part B — Author function tools + tool-use eval

**Goal:** add real actions to the assistant.

**Time:** ~50 min.

### Steps

1. **Author the two tools** in `python/tools.py`. The file has scaffolding and
   step-by-step TODO comments. Start with bare functions (Module 6 Pattern 1),
   then upgrade to `@tool` + Pydantic schema (Pattern 3).

2. **Test in isolation** — before wiring anything to an agent:
   ```bash
   cd labs/day2/python
   uv run pytest tests/test_tools.py -v
   ```
   Three tests run; two are skipped by default. Enable each skipped test as
   you reach the step it validates (Pydantic schema for one, error contract
   for the other) — instructions are inline in the test file. Until you
   author `tools.py`, the three active tests will fail with
   `NotImplementedError` — that's expected.

3. **Wire the tools to an agent** — nothing to code here, just run:
   ```bash
   uv run python part_b_wire_tools.py
   ```
   Confirms the agent can call your tools end-to-end.

4. **Author the golden set** — open `evals/tools_golden_set.jsonl` and add
   6 rows:
   - 2 queries that should call `create_ticket`
   - 2 queries that should call `lookup_status` (use ticket IDs `12345` and
     `12346` — seeded in `mock_backend.py`)
   - 2 queries that should call NO tool (`expected_tool: null`)

5. **Run the tool-use eval:**
   ```bash
   uv run pytest tests/test_golden_set.py -v
   ```

### Definition of done

- Isolation tests: **all five run and pass** (both `@pytest.mark.skip` decorators removed)
- Golden-set eval: **6/6** rows pass

If a row fails, don't rewrite the code — **tighten the tool descriptions** in
`tools.py`.

---

## Part C — Combine knowledge + tools

**Goal:** the agent picks the right composition order.

**Time:** ~30 min.

### Steps

1. **Read** `python/part_c_combined.py` — the `COMBINED_INSTRUCTIONS` string is
   the instruction template you'll iterate on.

2. **Run** it and inspect the answers:
   ```bash
   uv run python part_c_combined.py
   ```
   The three driver queries map to the three cases in
   `evals/combined_golden_set.jsonl`:
   - `retrieve_then_act` — docs classify, then create_ticket fires
   - `act_then_retrieve` — lookup_status first, then docs explain state
   - `docs_only` — no tool call, docs answer directly

3. **Iterate** on `COMBINED_INSTRUCTIONS` until each query hits the expected
   composition order. Tighten tool + knowledge-source descriptions first;
   revise instructions second.

### Definition of done

- All three combined-golden-set queries produce the **expected trace order**

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Agent gets 403 from IQ MCP endpoint | RBAC not propagated yet, or Foundry project MI missing Search Index Data Reader | Verify **Search Index Data Reader** on the Search service is assigned to the Foundry project's managed identity; wait a few minutes for propagation |
| Blob ingestion never completes / stays in `queued` | Search MI missing storage read access | Verify **Storage Blob Data Reader** on the storage account is assigned to the Search service's managed identity |
| Knowledge base returns 0 results | Ingestion incomplete, empty container, or wrong `FOUNDRY_IQ_KNOWLEDGE_NAME` | Foundry portal → Knowledge → your KB — confirm ingestion is green; confirm the name in `.env` matches |
| `azure.identity` DefaultAzureCredential errors | Not logged in | `az login` and retry |
| `test_tools.py` — `NotImplementedError` | Tools not authored yet | Complete Part B, Step 1 |
| `test_golden_set.py` — every row fails | Tool descriptions too vague | Tighten the tool descriptions in `tools.py` |
| Model calls `create_ticket` for every query | Description too broad | Add explicit "Do NOT use for general product questions" clause |
| Model never calls `lookup_status` | Instructions default to docs too strongly | Add explicit trigger in tool description |
| `.env` values not picked up | Loading wrong file | Check `python-dotenv` is loading `labs/day2/.env` (not `labs/day1/.env`) |
| Long p95 in Part C | Naive "try everything" order | Add explicit "Default source" line to instructions |

If you're 15 min stuck on something not in this table, flag it in the workshop
Slack channel.

---

## What you'll build tomorrow (Day 3)

- `create_ticket` becomes a real **Azure DevOps MCP** call
- `lookup_status` becomes a real Azure DevOps MCP query
- Same conceptual pattern you built today — different backend

Everything you build today carries forward.
