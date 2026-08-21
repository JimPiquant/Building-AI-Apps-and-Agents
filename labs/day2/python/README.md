# Day 2 Lab — Python starter

This directory holds the Python code for the Day 2 lab. Start here after you
`cp labs/day2/.env.example labs/day2/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no knowledge or tools |
| [`foundry_iq.py`](foundry_iq.py) | A/C | Connects local agents to the IQ knowledge base you created in the portal, over authenticated MCP |
| [`part_a_grounded_agent.py`](part_a_grounded_agent.py) | A | Agent with IQ attached; produces the eval transcript |
| [`tools.py`](tools.py) | **B** | **You author** `create_ticket` and `lookup_status` here |
| [`mock_backend.py`](mock_backend.py) | B | Provided — in-memory ticket store; do NOT modify |
| [`part_b_wire_tools.py`](part_b_wire_tools.py) | B | Wires your tools into an agent for end-to-end runs |
| [`part_c_combined.py`](part_c_combined.py) | C | Combined agent — knowledge + tools + instruction iteration |

## Setup

Follow the portal setup steps in the main [lab README](../README.md#prerequisites-portal-setup-one-time-15-min):
create the storage account + blob container, upload the docs corpus, create
the Foundry IQ knowledge base in the Foundry portal, and grant the two RBAC
assignments (Storage Blob Data Reader → Search MI; Search Index Data Reader
→ Foundry project MI). The lab code here only *consumes* the knowledge base.

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

## Part A evaluation model

The model that answers the questions and the model that judges those answers
are separate choices. This teaching sample expects the judge to be a reasoning
model. Set `EVALUATION_MODEL` to its deployment name at `AZURE_OPENAI_ENDPOINT`:

```bash
EVALUATION_MODEL=gpt-5.6-luna uv run python evals/retrieval_eval.py
```

Use your deployment name, which can differ from the underlying model name. The
evaluation code sets `is_reasoning_model=True`, so do not use an older
non-reasoning deployment for `EVALUATION_MODEL`. Before running the evaluation,
rerun `part_a_grounded_agent.py`; its transcript includes the retrieved context
required for valid retrieval and groundedness scores.

## Reference

- Module 1 slides — Foundry IQ concepts
- Module 4 slides — the tools layer
- Module 6 slides — authoring patterns (this is your primary reference for
  filling in `tools.py`)
