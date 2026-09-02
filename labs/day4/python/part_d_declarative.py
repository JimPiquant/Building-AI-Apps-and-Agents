"""
Day 4 Lab — Part D — Declarative workflows.

PROVIDED COMPLETE. No TODOs -- read it, run it, and see how a workflow
written as data (YAML) compares to the graphs you built in code in Part B1.

GOAL
Parts A through C all build workflows in Python: executors and edges wired
together with WorkflowBuilder calls. Agent Framework also supports
declarative workflows -- the same execution engine, but the graph is
authored as YAML and loaded at runtime with `WorkflowFactory` instead of
constructed in code.

This part loads `greeting-workflow.yaml`, a four-action workflow
(SetVariable, SetVariable, SendActivity, SetVariable) that builds a greeting
for whatever name it is given, and runs it the same way Part A ran
SequentialBuilder.

WHAT YOU SHOULD SEE
`WorkflowFactory.create_workflow_from_yaml_path(...)` parses the YAML into a
`Workflow` object, then `workflow.run({"name": "Alice"})` executes it.
Console output is:

    Loaded workflow: greeting-workflow
    ----------------------------------------
    Output: Hello, Alice!

The greeting text comes entirely from the YAML's `SetVariable` and
`SendActivity` actions and their `=Concat(...)` expression -- nothing here
is Python-specific.

PYTHON VERSION
`agent-framework-declarative` does not yet support Python 3.14. Run this
file with Python 3.13 explicitly:

    uv run --python 3.13 part_d_declarative.py

The `--python 3.13` flag rebuilds this lab's virtual environment (`.venv`)
against 3.13, and every later bare `uv run` in this folder keeps using that
3.13 environment -- not just this one invocation. If you want the rest of
the lab back on 3.14 afterward, rebuild the venv the same way, pointed at
any file in the lab:

    uv run --python 3.14 part_a_sequential.py

TRY NEXT (optional)
`greeting-workflow.yaml`'s four actions are deliberately the smallest
possible example. The declarative schema also has action kinds for a
`ConditionGroup`/`If` branch, an `InvokeAzureAgent` call (register an agent
with `WorkflowFactory` the same way Parts A-C build one, then have the YAML
call it instead of just concatenating strings), a `Foreach` loop, and
`RequestExternalInput`/`WaitForHumanInput` for a human-in-the-loop pause.
Any one of those would make a more interesting stretch than string
concatenation -- see `agent_framework_declarative`'s own executor modules
for the exact field names each action kind expects.

RUN WITH
    uv run --python 3.13 part_d_declarative.py
"""

from __future__ import annotations

import asyncio
from pathlib import Path

from agent_framework.declarative import WorkflowFactory


async def main() -> None:
    """Run the greeting workflow."""
    # Create a workflow factory
    factory = WorkflowFactory()

    # Load the workflow from YAML
    workflow_path = Path(__file__).parent / "greeting-workflow.yaml"
    workflow = factory.create_workflow_from_yaml_path(workflow_path)

    print(f"Loaded workflow: {workflow.name}")
    print("-" * 40)

    # Run with a name input
    result = await workflow.run({"name": "Alice"})
    for output in result.get_outputs():
        print(f"Output: {output}")
    for output in result.get_intermediate_outputs():
        print(f"Intermediate: {output}")


if __name__ == "__main__":
    asyncio.run(main())
