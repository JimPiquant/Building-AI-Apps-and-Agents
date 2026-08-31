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

Everything else in each file (session handling, agent construction,
models) is identical to the sibling lab file one directory up — only the
function named above differs from the lab's stub.

This folder lives inside `labs/day3/python/` (alongside `pyproject.toml`)
specifically so solution files run in the exact same `uv`-managed virtual
environment as the lab files — no separate setup, no relative-path
juggling:

```bash
cd labs/day3/python
uv run python solutions/part_a_session_response.py
```
