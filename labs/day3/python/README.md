# Day 3 Lab — Python starter

This directory holds the Python code for the Day 3 lab. Start here after you
`cp labs/day3/.env.example labs/day3/.env` and fill in your values.

## Files (in the order you'll touch them)

| File | Part | What it does |
|---|---|---|
| [`agent.py`](agent.py) | prereq | Baseline sanity check — plain MAF agent, no session, tools, or MCP |
| [`part_a_session_response.py`](part_a_session_response.py) | A | Session create/reuse, serialize/restore provided; **you author** `stream_typed_response()` |
| [`part_b_middleware.py`](part_b_middleware.py) | B | Logging/timing provided; **you author** `GuardrailMiddleware.process()` + `resilient_tool_middleware()`, test-first |
| [`ado_mcp.py`](ado_mcp.py) | C/D | Authenticated `MCPStreamableHTTPTool` client to your Azure DevOps organization |
| [`part_c_read_only.py`](part_c_read_only.py) | C | Read-only ADO MCP (`X-MCP-Readonly: true`) |
| [`part_d_approved_write.py`](part_d_approved_write.py) | D | Approval-gated write, re-read to verify the mutation |
| [`part_e_evaluate.py`](part_e_evaluate.py) | E | `evaluate_agent` / `ExpectedToolCall` / `LocalEvaluator` / `FoundryEvals` over the tool contract |
| [`part_f_optional_harness.py`](part_f_optional_harness.py) | F *(optional)* | `create_harness_agent` vs. plain `Agent` — awareness/comparison only, provided complete |
| [`tests/test_part_b_middleware.py`](tests/test_part_b_middleware.py) | B | Self-check tests — run these FIRST (see them fail cleanly), then author until 5/5 pass |
| [`solutions/`](solutions/) | A, B | Completed reference for each part's authoring exercise — try it yourself first |

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

Two parts have you author real code instead of running provided-complete
files — a completed reference for each lives in `solutions/`; try each
one yourself first.

- **Part A**: `stream_typed_response()` in `part_a_session_response.py`.
  Reference: [`solutions/part_a_session_response.py`](solutions/part_a_session_response.py).
- **Part B**: `GuardrailMiddleware.process()` and
  `resilient_tool_middleware()` in `part_b_middleware.py` — **test-first**.
  Run `uv run pytest tests/test_part_b_middleware.py -v` before writing
  any code; you should see all 5 tests reported as `FAILED` with a clear
  `NotImplementedError` message (not a crash or import error) pointing at
  what to implement. Author each function, rerunning the tests as you go,
  until all 5 pass. Reference:
  [`solutions/part_b_middleware.py`](solutions/part_b_middleware.py).

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

## Part F (optional)

`part_f_optional_harness.py` is stretch content for anyone who finishes
Parts A-E early — not required, not graded, provided complete (nothing to
author). It compares a plain `Agent` against the same chat client wrapped
with `create_harness_agent`, matching Module 8's own "awareness and
comparison only" framing. See that file's module docstring for what it
deliberately leaves out (web search, looping, skills, shell tooling,
`GitHubCopilotAgent`) and why.

## Reference

- Module 1 slides — Sessions & Conversation State
- Module 2 slides — Streaming & Structured Outputs
- Module 4 slides — Middleware & Robust Agents
- Module 5 slides — MCP with Agent Framework
- Module 6 slides — Azure DevOps Remote MCP
- Module 7 slides — Evaluation
- Module 8 slides — OPTIONAL Agent Harness + GitHub Copilot Agent (Part F)
- Module 9 slides — Day 3 Lab Kickoff (the architecture this lab implements)
