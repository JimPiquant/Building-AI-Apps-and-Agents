# Module 5 · Demo 2 — approval_mode pauses a write tool for review

**Placement:** After **slide 8 — "approval_mode creates a human boundary"** (Module 5).

**Time:** ~5 min total (30s framing + 90s trigger the pause + 2 min review/approve + 30s payoff)

**Language:** Python (MAF SDK). Adapts the approval pause/resume mechanic
from the official
[`function_tool_with_approval.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/tools/function_tool_with_approval.py)
sample onto the `approval_mode` constructor option documented on
[`MCPStreamableHTTPTool`](https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest).
**No MCP-specific approval sample exists in the repo yet** — the plain
function-tool sample demonstrates the identical `user_input_requests` /
`to_function_approval_response()` pause-resume loop; this demo wires that
same loop to an MCP tool's `approval_mode` instead of a `@tool(...)`
decorator. Flagged explicitly because it's an adaptation, not a
direct unmodified sample run.

## What it shows

The previous slide's table said `always_require` on an MCP tool means
*"every exposed MCP tool needs approval"* and that *"a run that needs
approval returns a user-input request; the application displays the name
and arguments and resumes with the decision."* This demo makes that literal:

1. An `MCPStdioTool` (the same calculator server from Demo 5.1) is
   constructed with `approval_mode="always_require"`.
2. The agent is asked to calculate something. The run returns with
   `result.user_input_requests` populated instead of a final answer.
3. The demo prints the exact function name and arguments the model wants
   to call — the human review moment — then simulates an approval.
4. The agent is re-run with the approval response appended, and this time
   it completes.

**What this demo is NOT:** it does not cover the `never_require` or
per-tool mapping rows from the previous slide's table — those are lower-
friction variants; this demo intentionally shows the friction path so the
pause is visible.

## Setup checklist

Do this **before the module starts**:

- **`uvx` available** (same as Demo 5.1 — reuses `mcp-server-calculator`)
- **One script staged**:
  `demos/day3/module-5-demo-2-approval-mode/main.py`
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** and **`FOUNDRY_MODEL`** exported or in
  `.env`
- **`uv sync`** in `demos/day3/`
- **Dry-run once**, and decide ahead of time whether you'll type `y` at
  the interactive prompt live or narrate over a captured transcript —
  live keyboard input during a demo is fine but plan for it

### Reference `main.py`

```python
import asyncio
import os

from agent_framework import Agent, MCPStdioTool, Message
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    async with AzureCliCredential() as credential:
        client = FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
            model=os.environ.get("FOUNDRY_MODEL", "gpt-5.6-luna"),
            credential=credential,
        )
        agent = Agent(client=client, instructions="You are a helpful assistant.")

        async with MCPStdioTool(
            name="calculator",
            command="uvx",
            args=["mcp-server-calculator"],
            approval_mode="always_require",
        ) as mcp:
            query = "What is 47 times 89, plus 12?"
            result = await agent.run(query, tools=mcp)

            while result.user_input_requests:
                new_inputs = [query]
                for request in result.user_input_requests:
                    if request.function_call is None:
                        continue
                    print(f"\nApproval requested for: {request.function_call.name}")
                    print(f"Arguments: {request.function_call.arguments}")
                    approval = input("Approve? (y/n): ")
                    new_inputs.append(Message("assistant", [request]))
                    new_inputs.append(
                        Message("user", [request.to_function_approval_response(approval.lower() == "y")])
                    )
                result = await agent.run(new_inputs, tools=mcp)

            print("\nFinal:", result)


asyncio.run(main())
```

## Narration + steps

**Opening (30s):**
"The previous slide said `always_require` pauses every exposed MCP tool
for approval. Let's actually get paused."

**Step 1 — Trigger the pause (~90s)**

```bash
uv run python main.py
```

Let the first run return. Point at the printed approval request:

**Say:** *"The agent didn't answer. It came back asking permission —
here's the exact tool name and the exact arguments it wants to call.
This is the human boundary the slide described, made visible."*

**Step 2 — Review and approve (~2 min)**

Type `y` at the prompt (or narrate over a pre-recorded transcript if you
decided against live keyboard input). Let the second run complete.

**Say:** *"I approved. The loop re-ran the agent with that decision
attached, and now it completes normally. If I'd typed `n`, the tool
never fires — same shape as the guardrail termination you saw in Module
4, but driven by a human decision instead of a policy check."*

**Step 3 — Payoff aside (~30s)**

**Say:** *"This is the same pause/resume mechanic MAF documents for a
plain function tool — `user_input_requests`,
`to_function_approval_response()` — just pointed at an MCP tool's
`approval_mode` instead. The mechanic doesn't care where the tool comes
from."*

## Expected result

- First `agent.run()` call returns with `user_input_requests` populated,
  not a final answer
- The printed function name and arguments match the calculator tool call
  the model intended
- After approval, the second run completes and prints a correct answer
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Live keyboard input during a demo can feel awkward on stage — decide in
  advance whether to type live or narrate a captured transcript
- The model occasionally answers without a tool call at all (arithmetic
  it can do without help) — ask a calculation that clearly needs the tool
  if this happens in dry-run

Have these ready:
1. **Screenshot of the approval-request print** (name + arguments)
2. **Screenshot of the final approved result**

Story: *"This is what a clean approve-then-complete cycle looked like
from my dry run. The pattern is what matters — the run pauses, names
exactly what it wants to do, and only proceeds after a decision."*

Then advance the slide.

## Teaching payoff

*"`approval_mode` isn't a config flag you set and forget — it's a real
pause in the middle of a run, with the tool name and arguments in your
hands before anything executes. That's the human boundary this module
promised, on an MCP tool instead of a local function."*

## Reference

- [`function_tool_with_approval.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/tools/function_tool_with_approval.py) — the sample this demo's pause/resume loop is adapted from
- [`MCPStreamableHTTPTool` API reference](https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest) — documents `approval_mode` on MCP tool classes
- [Tool approval (Python)](https://learn.microsoft.com/en-us/agent-framework/agents/tools/tool-approval?tabs=python) — concept grounding
- Module 5 slide 8 ("approval_mode creates a human boundary") — the table this demo makes concrete
