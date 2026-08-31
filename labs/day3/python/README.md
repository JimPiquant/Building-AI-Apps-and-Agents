# Day 3 Lab — Python starter

This directory holds the Python code for the Day 3 lab. Start here after you
`cp labs/day3/.env.example labs/day3/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no session, tools, or MCP |
| [`part_a_session_response.py`](part_a_session_response.py) | A | Session create/reuse, serialize/restore provided; **you author** `stream_typed_response()` |
| [`part_b_middleware.py`](part_b_middleware.py) | B | Logging/timing middleware, guardrail short-circuit, exception handling, bounded retry |
| [`ado_mcp.py`](ado_mcp.py) | C/D | Authenticated `MCPStreamableHTTPTool` client to your Azure DevOps organization |
| [`part_c_read_only.py`](part_c_read_only.py) | C | Read-only ADO MCP (`X-MCP-Readonly: true`) |
| [`part_d_approved_write.py`](part_d_approved_write.py) | D | Approval-gated write, re-read to verify the mutation |
| [`part_e_evaluate.py`](part_e_evaluate.py) | E | `evaluate_agent` / `ExpectedToolCall` / `LocalEvaluator` / `FoundryEvals` over the tool contract |

## Setup

Follow the Azure DevOps setup steps in the main
[lab README](../README.md#azure-devops-setup) — provision your own
dedicated organization/project, and seed a known work item ID.

```bash
uv sync
uv run python agent.py    # should print a greeting
```

If that greeting doesn't appear, you're not ready to start Part A. Check the
main [lab README](../README.md#prerequisites).

## Authoring exercises

Part A has one function you author yourself — `stream_typed_response()`
in `part_a_session_response.py` — instead of running provided-complete
code. Try it first; a completed reference lives in
[`../solutions/part_a_session_response.py`](../solutions/part_a_session_response.py)
if you get stuck or want to check your work.

## Part E evaluation model

`part_e_evaluate.py`'s optional Foundry cloud-evaluator section uses a
**separate** `FoundryChatClient` for the judge role, not the same client
the agent itself uses — deliberately, since reusing a production model as
its own judge is a documented conflict of interest (Day 2 Module 3).
Set `EVALUATION_MODEL` to that judge deployment's name in `.env`; it
falls back to `FOUNDRY_MODEL` if unset, but a dedicated judge deployment
is preferred:

```bash
EVALUATION_MODEL=gpt-5.6-luna uv run part_e_evaluate.py
```

This section is optional and wrapped so a missing deployment or quota
issue reports "unavailable" per case rather than failing the whole run —
the required `LocalEvaluator` results (this part's actual definition of
done) run first and are unaffected.

## Reference

- Module 1 slides — Sessions & Conversation State
- Module 2 slides — Streaming & Structured Outputs
- Module 4 slides — Middleware & Robust Agents
- Module 5 slides — MCP with Agent Framework
- Module 6 slides — Azure DevOps Remote MCP
- Module 7 slides — Evaluation
- Module 9 slides — Day 3 Lab Kickoff (the architecture this lab implements)
