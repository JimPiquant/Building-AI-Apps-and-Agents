# Day 2 Lab — Python starter

This directory holds the Python code for the Day 2 lab. Start here after you
`cp labs/day2/.env.example labs/day2/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no knowledge or tools |
| [`create_iq_source.py`](create_iq_source.py) | A | Uploads `data/docs/*.md` to a Foundry IQ knowledge source |
| [`part_a_grounded_agent.py`](part_a_grounded_agent.py) | A | Agent with IQ attached; produces the eval transcript |
| [`tools.py`](tools.py) | **B** | **You author** `create_ticket` and `lookup_status` here |
| [`mock_backend.py`](mock_backend.py) | B | Provided — in-memory ticket store; do NOT modify |
| [`part_b_wire_tools.py`](part_b_wire_tools.py) | B | Wires your tools into an agent for end-to-end runs |
| [`part_c_combined.py`](part_c_combined.py) | C | Combined agent — knowledge + tools + instruction iteration |

## Setup

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

## Reference

- Module 1 slides — Foundry IQ concepts
- Module 4 slides — the tools layer
- Module 6 slides — authoring patterns (this is your primary reference for
  filling in `tools.py`)
- Module 7 slides — combining knowledge and tools (the iteration guide for
  `part_c_combined.py`)
