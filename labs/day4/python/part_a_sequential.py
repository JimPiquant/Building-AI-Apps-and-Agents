"""
Day 4 Lab — Part A — Sequential (warm-up).

You'll build this in Part A:

    - Build the shared Planner/Retriever/Critic roles (roles.py) into a
      workflow using plain SequentialBuilder — the simplest orchestration
      pattern, no loop (Module 2's "Sequential in code" slide).
    - The Critic runs ONCE: check passes -> emit the Answer; check fails
      -> the workflow just returns as-is, no correction. This is the
      point of Part A, not a bug to fix here.
    - Run it against the golden set (evals/golden_set.jsonl) and observe
      it fail on questions that need a second pass.

--------------------------------------------------------------------------
Definition of done for Part A (from labs/day4/README.md):
  - Runs end-to-end on the golden set; the "no correction" limitation
    shows up in at least one result
--------------------------------------------------------------------------

TODO: implement build_workflow() below using
agent_framework.orchestrations.SequentialBuilder and the shared roles
from roles.py, following Module 2's Sequential orchestration slides and
demos/day3's single-agent patterns as a starting point for the Retriever's
knowledge-source grounding.
"""
from __future__ import annotations

import asyncio

from agent_framework.orchestrations import SequentialBuilder

from roles import build_critic, build_planner, build_retriever


def build_workflow():
    """Part A: Planner -> Retriever -> Critic, no correction."""
    raise NotImplementedError("Build the SequentialBuilder workflow here.")


async def main() -> None:
    raise NotImplementedError("Part A: build the workflow, run it against evals/golden_set.jsonl, and print the results.")


if __name__ == "__main__":
    asyncio.run(main())
