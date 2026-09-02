# Day 4 Lab — Python starter

Start with the main [lab README](../README.md). This page is a map of the
directory.

## Files, in the order you touch them

| File | Part | Provided or authored |
|---|---|---|
| [`retrieval.py`](retrieval.py) | 0 | **Provided** — corpus search; run it as your setup check |
| [`agents.py`](agents.py) | 0 | **Provided** — Planner, Retriever, Critic + the shared types |
| [`trace.py`](trace.py) | A | **Provided** — prints the workflow event stream |
| [`part_a_sequential.py`](part_a_sequential.py) | A | **You write** — 2 TODOs |
| [`workflow_nodes.py`](workflow_nodes.py) | B | **Provided**, except `RevisionGate.decide` (Part B2) |
| [`part_b_graph.py`](part_b_graph.py) | B1 | **You write** — 3 TODOs |
| [`tests/test_guardrail.py`](tests/test_guardrail.py) | B2 | **Provided, ships failing** — the spec |
| [`part_c_group_chat.py`](part_c_group_chat.py) | C | **You write** — 1 TODO |
| [`evaluate.py`](evaluate.py) | C | **Provided** — the evaluation harness |
| [`greeting-workflow.yaml`](greeting-workflow.yaml) | D | **Provided** — the workflow Part D loads, authored as YAML |
| [`part_d_declarative.py`](part_d_declarative.py) | D | **Provided, optional** — no TODOs; needs Python 3.13, see the file's docstring |

## Commands

```bash
uv sync
uv run retrieval.py                              # setup check, no model call

uv run part_a_sequential.py                      # Part A
uv run part_b_graph.py                           # Part B1
uv run pytest tests/test_guardrail.py -v         # Part B2 — ships failing
uv run part_c_group_chat.py                      # Part C

uv run evaluate.py --part b --repetitions 3      # baseline
uv run evaluate.py --part b --part c --repetitions 3   # the comparison
uv run evaluate.py --part b --case r1            # one case, while debugging

uv run --python 3.13 part_d_declarative.py       # Part D (optional) — needs 3.13, see file docstring
```

## Which package is which

Four separate distributions, and the split causes the most common import
error in this lab:

| You import | Comes from |
|---|---|
| `Executor`, `WorkflowBuilder`, `WorkflowContext`, `handler`, `executor`, `AgentExecutor`, `WorkflowViz`, `Agent`, `Message` | `agent-framework-core` (via `agent-framework`) |
| `SequentialBuilder`, `GroupChatBuilder` | **`agent-framework-orchestrations`** |
| `FoundryChatClient` | `agent-framework-foundry` |
| `WorkflowFactory` | **`agent-framework-declarative`** (Part D, optional) |

`from agent_framework.orchestrations import SequentialBuilder` failing means
that middle package is missing. Re-run `uv sync`.

`agent-framework-declarative` doesn't yet support Python 3.14 — Part D's
docstring has the `uv run --python 3.13 ...` command that works around it.

## Two API details worth memorizing

**State access is synchronous; message passing is not.**

```python
ctx.set_state("k", v)              # no await
value = ctx.get_state("k", 0)      # no await
await ctx.send_message(msg)        # await
await ctx.yield_output(result)     # await
```

**There is one event class, discriminated by a string.** No
`ExecutorInvokedEvent` — branch on `event.type`:

```python
async for event in workflow.run(message, stream=True):
    if event.type == "executor_invoked":
        print(event.executor_id)
    elif event.type == "output":
        answer = event.data
```

Note `workflow.run(msg, stream=True)` is async-iterable and is *not*
awaited. The non-streaming form, `await workflow.run(msg)`, returns a
`WorkflowRunResult` with `.get_outputs()`. There is no `run_stream` method.

## Reference

- Day 4 Module 1 — Agents vs. Workflows
- Day 4 Module 2 — Orchestration Patterns
- Day 4 Module 3 — MAF Workflows (executors, edges, state, events)
- Day 4 Module 4 — Memory Strategies for Multi-Agent Systems
- Day 4 Module 5 — Evaluating Multi-Agent Systems
- Day 4 Module 6 — Multi-Agent Failure Modes
- Day 4 Module 7 — Day 4 Lab Kickoff
