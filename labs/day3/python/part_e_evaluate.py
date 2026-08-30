"""
Day 3 Lab — Part E — Evaluate the tool contract.

You'll build this in Part E:

    - Author golden cases in evals/tool_contract_golden_set.jsonl: a read
      case, an approved-write case, a rejected-write case, and a no-tool
      case (Module 9's "Golden cases" list).
    - For each case, define the expected tool call (name, action, key
      arguments) with ExpectedToolCall.
    - Run LocalEvaluator(tool_calls_present, tool_call_args_match) against
      each case via evaluate_agent(...) (Module 7's pattern; see
      demos/day3/module-7-demo-1-eval-catches-wrong-tool/main.py).
    - Set num_repetitions > 1 to observe consistency across independent
      runs — report the observed rate, do not invent a universal pass
      threshold (Module 7's "Use Repetitions to handle nondeterminism").
    - Optionally add FoundryEvals for tool_selection / tool_input_accuracy
      where available (requires an azure-ai-projects project client and
      EVALUATION_MODEL from your .env).

--------------------------------------------------------------------------
Definition of done for Part E (from Module 9's "Definition of done and
guardrails" slide):
  - Expected tool/action/args are reported for each golden case; no
    universal pass threshold is claimed — only the observed rate across
    repetitions
--------------------------------------------------------------------------

TODO: implement build_agent(), load_golden_cases(), and main() below,
following Module 7's evaluation slides and
demos/day3/module-7-demo-1-eval-catches-wrong-tool/main.py as reference
code. This exercises the same wit_work_item / wit_work_item_write tool
pair Part C/D use, so the ground truth should reuse ado_mcp.py's tools
where practical rather than a separate mock.
"""
from __future__ import annotations

import asyncio


async def main() -> None:
    raise NotImplementedError(
        "Part E: author golden cases, then run evaluate_agent with LocalEvaluator "
        "(and optionally FoundryEvals) against each one."
    )


if __name__ == "__main__":
    asyncio.run(main())
