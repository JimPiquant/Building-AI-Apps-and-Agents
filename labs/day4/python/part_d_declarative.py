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
