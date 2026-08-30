"""
Day 3 Lab — Part B — Robustness (middleware).

You'll build this in Part B:

    - Add logging/timing middleware that observes every function call
      (Module 4's function-frequency middleware pattern).
    - Short-circuit one blocked request with a guardrail: set
      context.result and raise MiddlewareTermination BEFORE call_next(),
      so the blocked tool never runs (see
      demos/day3/module-4-demo-2-guardrail-termination/).
    - Handle a classified exception raised inside a tool or the agent loop
      without crashing the whole request.
    - Demonstrate a bounded retry policy — a fixed, small retry count, not
      an unbounded loop.

--------------------------------------------------------------------------
Definition of done for Part B (from Module 9's "Definition of done and
guardrails" slide):
  - Middleware: the guard path and the failure path are both observable
    (e.g. via logging); the retry is bounded, not unbounded
--------------------------------------------------------------------------

TODO: implement the middleware classes and build_agent() below, following
Module 4's slides and demos/day3/module-4-demo-1-onion-order/ +
demos/day3/module-4-demo-2-guardrail-termination/ as reference code.
"""
from __future__ import annotations

import asyncio


async def main() -> None:
    raise NotImplementedError("Part B: author logging/timing middleware, a guardrail, and a bounded retry here.")


if __name__ == "__main__":
    asyncio.run(main())
