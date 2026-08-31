# Day 3 Lab — Solutions

Completed reference implementations for the lab's authoring exercises —
the functions you're asked to write yourself instead of running
provided-complete code.

**Try the exercise yourself first.** These files exist to check your work
or unblock you if you're stuck, not to be copy-pasted before you've
attempted it — the point of an authoring exercise is the attempt.

| File | What it completes |
|---|---|
| [`part_a_session_response.py`](part_a_session_response.py) | Part A's `stream_typed_response()` (streaming + a typed `TriageResult`) |
| [`part_b_middleware.py`](part_b_middleware.py) | Part B's `GuardrailMiddleware.process()` and `resilient_tool_middleware()` (test-first — see `tests/test_part_b_middleware.py`) |

Everything else in each file (session handling, agent construction,
models) is identical to the sibling lab file one directory up — only the
function(s) named above differ from the lab's stub.

This folder lives inside `labs/day3/python/` (alongside `pyproject.toml`)
specifically so solution files run in the exact same `uv`-managed virtual
environment as the lab files — no separate setup, no relative-path
juggling:

```bash
cd labs/day3/python
uv run python solutions/part_a_session_response.py
uv run python solutions/part_b_middleware.py
```

Part B's solution also passes `tests/test_part_b_middleware.py` — the
tests import from `part_b_middleware` by module name, so to check the
solutions version against them, temporarily point the import at
`solutions/part_b_middleware.py` or copy it over the lab stub in a
scratch checkout. The normal workflow is to make YOUR OWN
`part_b_middleware.py` (one directory up) pass those tests, not to run
them against this reference copy.
