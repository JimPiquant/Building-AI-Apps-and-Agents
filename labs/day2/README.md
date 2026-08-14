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
- An Azure AI Search service configured for Foundry IQ (see below)

### Azure AI Search setup

For this workshop, create one reusable Search service in the Azure portal. This
keeps the billable service lifecycle separate from the lab script. Use Bicep or
Terraform instead for shared or production environments.

#### Create the Search service in the Azure portal

1. Open the [Azure portal](https://portal.azure.com), select **Create a
   resource**, search for **Azure AI Search**, and select **Create**.
2. On **Basics**, select your subscription and resource group, then enter a
   globally unique service name. The resulting endpoint is
   `https://<service-name>.search.windows.net`.
3. Choose a [region that supports agentic retrieval](https://learn.microsoft.com/azure/search/search-region-support).
   Prefer the same region as the Foundry resource to reduce latency.
4. Select **Change Pricing Tier** and choose **Basic** or higher. Basic is the
   smallest tier that supports the managed identity required by this lab.
5. Select **Review + create**, then **Create**. After deployment completes,
   select **Go to resource**.

#### Configure identity and access

1. On the Search service, open **Settings > Identity**, turn the system-assigned
   identity **On**, and select **Save**.
2. Open **Settings > Keys** and set **API access control** to **Role-based access
   control** or **Both**.
3. Open **Access control (IAM) > Add > Add role assignment** and assign these
   roles on the Search service:

   | Assignee | Scope | Role |
   |---|---|---|
   | Your user account | Search service | Search Service Contributor |
   | Your user account | Search service | Search Index Data Contributor |
   | Your user account | Search service | Search Index Data Reader |

4. Open the Foundry resource in the Azure portal. Under **Access control (IAM)**,
   assign **Cognitive Services User** to the Search service's managed identity.

The first two roles let the provisioning script create objects and upload the
documents. The reader role lets the local agent call the IQ MCP endpoint. The
Search identity uses the Foundry model for query planning and answer synthesis.

Add the Search service URL and the Foundry resource's Azure OpenAI endpoint to
`.env`:

```dotenv
AZURE_SEARCH_ENDPOINT=https://<search-service>.search.windows.net
AZURE_OPENAI_ENDPOINT=https://<foundry-resource>.openai.azure.com
```

`AZURE_OPENAI_ENDPOINT` must be the resource root. Do not append `/openai`.

Role assignments can take several minutes to propagate. Foundry IQ agentic
retrieval and model calls can incur usage charges in addition to the Search
service tier.

#### Create the index and Foundry IQ objects

Do not use **Import data** to create the index manually. After the service and
roles are ready, run the lab provisioning script. It creates or updates the
`contoso-docs-index` schema, uploads the Markdown documents, and creates the
knowledge source and knowledge base:

```bash
cd labs/day2/python
uv run python create_iq_source.py
```

To verify it in the Azure portal, open the Search service. Under **Search
management > Indexes**, the `contoso-docs-index` index should contain 10
documents. Under **Agentic retrieval > Knowledge bases**, you should see
`contoso-docs`; it isn't automatically added to the knowledge assets of your
Foundry project. If you changed `FOUNDRY_IQ_KNOWLEDGE_NAME`, these objects use
that name as their prefix.

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
├── README.md                       # you're here
├── .env.example                    # copy to .env at this level
└── python/
    ├── pyproject.toml              # uv-managed
    ├── README.md                   # Python starter guide (also linked below)
    ├── agent.py                    # baseline sanity check
    ├── create_iq_source.py         # Part A: creates Search index + IQ objects
    ├── foundry_iq.py               # Part A/C: authenticated MCP client to IQ
    ├── part_a_grounded_agent.py    # Part A: agent with IQ attached
    ├── mock_backend.py             # provided in-memory ticket store
    ├── tools.py                    # Part B: YOU author create_ticket + lookup_status
    ├── part_b_wire_tools.py        # Part B: agent with your tools attached
    ├── part_c_combined.py          # Part C: combined agent
    ├── data/docs/                  # 10 mock product docs (provided)
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

**Time:** ~40 min.

### Steps

1. Create the IQ index, knowledge source, and knowledge base from the provided
   docs corpus:
   ```bash
   cd labs/day2/python
   uv run python create_iq_source.py
   ```
   This uploads the 10 markdown files to Azure AI Search and creates a Foundry IQ
   knowledge base named `contoso-docs` (or whatever you set in
   `FOUNDRY_IQ_KNOWLEDGE_NAME`). Re-running the script updates the same objects.

2. Run the grounded agent to produce a transcript:
   ```bash
   uv run python part_a_grounded_agent.py
   ```
   The five queries (3 answerable + 2 not) are written to
   `evals/part_a_transcript.jsonl`.

3. Score the transcript with Foundry evaluators:
   ```bash
   EVALUATION_MODEL=gpt-5.4-mini uv run python evals/retrieval_eval.py
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
   All five tests should pass.

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

- Isolation tests: **all pass** (all five)
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
| `create_iq_source.py` returns `403` | Search RBAC is missing or still propagating | Verify the roles in **Azure AI Search setup**, then retry after several minutes |
| Knowledge-base creation fails during model access | Search identity cannot call the Foundry model | Assign Cognitive Services User to the Search managed identity on the Foundry resource |
| Agent cannot connect to the IQ MCP endpoint | Local user lacks retrieval access | Assign Search Index Data Reader to your user on the Search service |
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
