# Day 4 Lab — Python starter

This directory holds the Python code for the Day 4 lab. Start here after you
`cp labs/day4/.env.example labs/day4/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no workflow |
| [`roles.py`](roles.py) | A/B/C | Shared: Planner/Retriever/Critic agent factories, their structured-output models (`Plan`, `Evidence`, `RetrievalResult`, `Answer`, `CriticVerdict`), the local `search_docs` tool, `extract_verdict()`, and `load_golden_set()` |
| [`data/docs/`](data/docs/) | prereq | Bundled local docs (copied from Day 2) the Retriever's `search_docs` tool grounds against — no live knowledge base needed |
| [`evals/golden_set.jsonl`](evals/golden_set.jsonl) | prereq | ~15 questions, built once, reused by Parts A-C |
| [`part_a_workflow_basics.py`](part_a_workflow_basics.py) | A | Raw `WorkflowBuilder` graph — executors, edges, `output_from` — no loop, no golden set |
| [`part_b_orchestrations.py`](part_b_orchestrations.py) | B | Three constructions of the same roles: `SequentialBuilder`, a custom graph + guardrail (`revision_gate`, `finalize`), `GroupChatBuilder` + `orchestrator_agent` |
| [`tests/test_part_b_guardrail.py`](tests/test_part_b_guardrail.py) | B | Isolation tests for construction #2's `compute_next_step()` decision logic — no live Foundry call |
| [`part_c_evaluate.py`](part_c_evaluate.py) | C | Imports all three of Part B's `build_workflow_*()` functions; runs the golden set against each and reports a comparison |

## Setup

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

## Reference

- Module 1 slides — Agents vs. Workflows
- Module 3 slides — MAF Workflows (executors, edges, state, visualization) — Part A
- Module 2 slides — Orchestration Patterns (Sequential, Group Chat) — Part B
- Module 6 slides — Multi-Agent Failure Modes & Mitigations (the guardrail requirement) — Part B
- Module 4 slides — Memory Strategies for Multi-Agent Systems
- Module 5 slides — Evaluating Multi-Agent Systems — Part C
- Module 7 slides — Day 4 Lab Kickoff (the architecture this lab implements)
