# Day 2 Lab — Docs assistant with ticket triage + evaluation

Extend the Day 1 docs assistant into a **support triage** agent that:

1. Answers product questions from documentation (Day 1 baseline)
2. Files a support ticket when the docs don't cover it (Module 6)
3. Looks up the status of an existing ticket (Module 6)
4. Is measured with a **retrieval eval** and a **tool-use eval** (Module 3)

Estimated time: **~2 hours async**. Python only — C# for Day 2 is out of scope
per the workshop policy.

## Prerequisites

- Day 1 lab complete and working
- `uv` installed (from Day 1)
- `az login` works against your Azure tenant
- Same Foundry project and model deployment you used on Day 1 (recommended:
  **`gpt-5.4-mini`**)

Set up your environment:

```bash
cp labs/day2/.env.example labs/day2/.env
# edit labs/day2/.env — carry over your Day 1 endpoint and model
cd labs/day2/python
uv sync
uv run python agent.py   # sanity check — prints a greeting
```

If the sanity check fails, do NOT proceed. Fix your `.env` or Foundry access
first (or ask a TA for a paired debug).

## Repo layout

```
labs/day2/
├── README.md                     # you're here
├── .env.example                  # copy to .env
├── data/docs/                    # 10 mock product docs (provided)
├── python/
│   ├── pyproject.toml            # uv-managed
│   ├── agent.py                  # baseline sanity check
│   ├── create_iq_source.py       # Part A: uploads docs to Foundry IQ
│   ├── part_a_grounded_agent.py  # Part A: agent with IQ attached
│   ├── mock_backend.py           # provided in-memory ticket store
│   ├── tools.py                  # Part B: YOU author create_ticket + lookup_status
│   ├── part_b_wire_tools.py      # Part B: agent with your tools attached
│   └── part_c_combined.py        # Part C: combined agent
├── tests/
│   ├── test_tools.py             # Part B: isolation tests (mostly provided)
│   └── test_golden_set.py        # Part B/C: tool-use eval runner
└── evals/
    ├── retrieval_eval.py         # Part A: Retrieval + Groundedness scorer
    ├── tools_golden_set.jsonl    # Part B: YOU author 6 rows
    └── combined_golden_set.jsonl # Part C: 3 starter rows provided
```

---

## Part A — Knowledge grounding + retrieval eval

**Goal:** move the assistant from prompt-only to grounded in docs.

**Time:** ~40 min.

### Steps

1. Create the IQ knowledge source from the provided docs corpus:
   ```bash
   cd labs/day2/python
   uv run python create_iq_source.py
   ```
   This uploads the 10 markdown files in `data/docs/` and creates a Foundry IQ
   knowledge source named `contoso-docs` (or whatever you set in
   `FOUNDRY_IQ_KNOWLEDGE_NAME`).

2. Run the grounded agent to produce a transcript:
   ```bash
   uv run python part_a_grounded_agent.py
   ```
   The five queries (3 answerable + 2 not) are written to
   `evals/part_a_transcript.jsonl`.

3. Score the transcript with Foundry evaluators:
   ```bash
   uv run python ../evals/retrieval_eval.py
   ```
   Results are written to `evals/part_a_baseline.json`.

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
   uv run pytest ../tests/test_tools.py -v
   ```
   The first four tests should pass. The fifth (`invalid_priority`) is marked
   skip until you add the Pydantic schema — unskip it once you do.

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
   uv run pytest ../tests/test_golden_set.py -v
   ```

### Definition of done

- Isolation tests: **all pass** (including the un-skipped `invalid_priority`)
- Golden-set eval: **6/6** rows pass

If a row fails, don't rewrite the code — **tighten the tool descriptions** in
`tools.py`. That's the Module 7 failure-mode-2 fix.

---

## Part C — Combine knowledge + tools

**Goal:** the agent picks the right composition order.

**Time:** ~30 min.

### Steps

1. **Read** `python/part_c_combined.py` — the `COMBINED_INSTRUCTIONS` string is
   the Module 7 four-line template. This is where you'll iterate.

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
   composition order. Reference: Module 7 failure modes 1–3.

### Definition of done

- All three combined-golden-set queries produce the **expected trace order**

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `create_iq_source.py` hangs at "uploading" | Slow tenant ingest | Wait — first upload can take 60–90s per file |
| `azure.identity` DefaultAzureCredential errors | Not logged in | `az login` and retry |
| `FOUNDRY_IQ_KNOWLEDGE_NAME not set` | Missed step in Part A | Add `FOUNDRY_IQ_KNOWLEDGE_NAME=contoso-docs` to `.env` |
| `test_tools.py` — `NotImplementedError` | Tools not authored yet | Complete Part B, Step 1 |
| `test_golden_set.py` — every row fails | Tool descriptions too vague | Tighten descriptions per Module 7 failure mode 2 |
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
