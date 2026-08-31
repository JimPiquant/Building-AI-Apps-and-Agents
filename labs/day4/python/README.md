# Day 4 Lab — Python starter

This directory holds the Python code for the Day 4 lab. Start here after you
`cp labs/day4/.env.example labs/day4/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no workflow |
| [`roles.py`](roles.py) | A/B/C | Shared: Planner/Retriever/Critic agent factories + the `Answer` model |
| [`evals/golden_set.jsonl`](evals/golden_set.jsonl) | prereq | ~15 questions, built once, reused by all 3 parts |
| [`part_a_sequential.py`](part_a_sequential.py) | A | `SequentialBuilder`, no correction — the limitation, live |
| [`part_b_custom_graph.py`](part_b_custom_graph.py) | B | `WorkflowBuilder` + conditional edge + required budget guardrail |
| [`part_c_group_chat.py`](part_c_group_chat.py) | C | `GroupChatBuilder` + custom `orchestrator_agent`, compared against Part B |

## Setup

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

## Reference

- Module 1 slides — Agents vs. Workflows
- Module 2 slides — Orchestration Patterns (Sequential, Group Chat)
- Module 3 slides — MAF Workflows (conditional edges, workflow state)
- Module 4 slides — Memory Strategies for Multi-Agent Systems
- Module 5 slides — Evaluating Multi-Agent Systems
- Module 6 slides — Multi-Agent Failure Modes & Mitigations (the guardrail requirement)
- Module 7 slides — Day 4 Lab Kickoff (the architecture this lab implements)
