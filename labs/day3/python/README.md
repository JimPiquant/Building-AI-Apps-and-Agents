# Day 3 Lab — Python starter

This directory holds the Python code for the Day 3 lab. Start here after you
`cp labs/day3/.env.example labs/day3/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no session, tools, or MCP |
| [`part_a_session_response.py`](part_a_session_response.py) | A | Session create/reuse, serialize/restore, stream, typed `TriageResult` |
| [`part_b_middleware.py`](part_b_middleware.py) | B | Logging/timing middleware, guardrail short-circuit, exception handling, bounded retry |
| [`ado_mcp.py`](ado_mcp.py) | C/D | Authenticated `MCPStreamableHTTPTool` client to your Azure DevOps organization |
| [`part_c_read_only.py`](part_c_read_only.py) | C | Read-only ADO MCP (`X-MCP-Readonly: true`) |
| [`part_d_approved_write.py`](part_d_approved_write.py) | D | Approval-gated write, re-read to verify the mutation |
| [`part_e_evaluate.py`](part_e_evaluate.py) | E | `evaluate_agent` / `ExpectedToolCall` / `LocalEvaluator` / `FoundryEvals` over the tool contract |

## Setup

Follow the Azure DevOps setup steps in the main
[lab README](../README.md#azure-devops-setup--todo) — provision your own
dedicated organization/project, and seed a known work item ID.

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

<!-- TODO: Part E evaluation-model notes, once part_e_evaluate.py is
authored — mirror labs/day2/python/README.md's "Part A evaluation model"
section, adapted for FoundryEvals(project_client=..., model=...) instead of
azure-ai-evaluation's is_reasoning_model flag. -->

## Reference

- Module 1 slides — Sessions & Conversation State
- Module 2 slides — Streaming & Structured Outputs
- Module 4 slides — Middleware & Robust Agents
- Module 5 slides — MCP with Agent Framework
- Module 6 slides — Azure DevOps Remote MCP
- Module 7 slides — Evaluation
- Module 9 slides — Day 3 Lab Kickoff (the proposed architecture this lab implements)
