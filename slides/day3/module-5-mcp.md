---
title: MCP with Agent Framework
subtitle: Discover and invoke external tools through a controlled client boundary
eyebrow: DAY 3 · MODULE 5 · 30 MIN
tag: Day 3 · Module 5
deck: module-5-mcp.pptx
---

# Module 5 — MCP with Agent Framework

## MCP with Agent Framework
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: MCP standardizes how an application discovers and invokes tools exposed by a server. Keep the focus on the MAF client boundary, not undocumented wire-level protocol details. -->

- Connect, constrain, approve, and clean up external tools

## The client/server loop
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: The MAF MCP tool is the client. It connects, discovers server tools, converts them into agent-callable functions, invokes selected tools, and returns typed results to the agent loop. -->

1. **Connect** — Your MAF MCP tool opens the configured transport
2. **Discover** — The client loads tools exposed by the server
3. **Select** — The model chooses from the allowed tool schemas
4. **Invoke** — The client calls the server with validated arguments
5. **Synthesize** — The agent uses the returned content

## Pick the transport that matches the server
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: These are the three documented Python classes. WebSocket support requires the mcp[ws] optional package. Transport choice follows the server; it is not an application preference you can swap unilaterally. -->

| MAF type | Connection | Use when |
|---|---|---|
| MCPStdioTool | Local child process over stdin/stdout | You launch and trust a local server |
| MCPStreamableHTTPTool | Remote HTTP with streamable responses/SSE | A hosted endpoint exposes MCP over HTTP |
| MCPWebsocketTool | WebSocket | The server explicitly provides a WebSocket endpoint |

## Local stdio is a child-process boundary
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Use only commands and packages you have reviewed and pinned. The official pattern uses an async context manager so the local process and connection are closed. -->

```python
async with MCPStdioTool(
    name="calculator",
    command="uvx",
    args=["mcp-server-calculator"],
) as mcp:
    result = await agent.run(
        "Calculate the total.",
        tools=mcp,
    )
```

## DEMO 5.1 — Local stdio MCP tool call, end to end
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-5-demo-1-stdio-mcp.md -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Runs the previous slide's exact MCPStdioTool + mcp-server-calculator pattern live; no matching sample file exists in the repo's 02-agents/mcp folder, so this demo is grounded directly in the Learn doc's own documented code. -->

Run the previous slide's exact code live: connect to a local `mcp-server-calculator` child process, watch the agent discover and invoke a tool through it, and close the connection — client/server loop end to end.

## Remote HTTP belongs behind explicit auth
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python | https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest -->
<!-- notes: The documented FoundryChatClient sample uses MCPStreamableHTTPTool for a remote endpoint. Do not put tokens in slide code or source control; use a provider that acquires or refreshes credentials. -->

```python
async with MCPStreamableHTTPTool(
    name="docs",
    url="https://learn.microsoft.com/api/mcp",
    allowed_tools=["microsoft_docs_search"],
) as mcp:
    result = await agent.run(
        "Find the current guidance.",
        tools=mcp,
    )
```

## header_provider has two call shapes
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: During a tool call, header_provider receives function_invocation_kwargs. Ambient requests such as initialization, discovery, and pings receive an empty dictionary. Therefore connection-time auth cannot depend only on a per-run value. -->

- **Tool-call request**
  - Receives `function_invocation_kwargs`
  - Can derive request-scoped headers
  - Keep secrets outside model-visible arguments
- **Ambient request**
  - Receives `{}`
  - Includes initialization, discovery, and pings
  - Provider must still acquire required connection auth

## Reduce the model's tool surface
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest | https://learn.microsoft.com/en-us/agent-framework/agents/tools/controlling-tool-availability?tabs=python -->
<!-- notes: allowed_tools is a documented MCP constructor option. Progressive exposure is a separate experimental Python function-loop feature, not an MCP transport feature. Use it only if you need staged discovery and accept its experimental status. -->

- **allowed_tools** — Expose an explicit MCP allow-list
- **Clear names** — Avoid collisions by selecting or wrapping distinct tool names
- **Progressive exposure — EXPERIMENTAL** — Add tools for the next loop iteration only
- **Reset** — Progressive tool changes re-arm on each new agent run

## approval_mode creates a human boundary
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest | https://learn.microsoft.com/en-us/agent-framework/agents/tools/tool-approval?tabs=python -->
<!-- notes: approval_mode can require approval for all tools, waive it for all tools, or apply a per-tool mapping on the MCP tool. A run that needs approval returns a user-input request; the application displays the name and arguments and resumes with the decision. -->

| Setting | Effect | Appropriate use |
|---|---|---|
| `always_require` | Every exposed MCP tool needs approval | Unknown or high-risk server |
| `never_require` | Calls proceed without approval | Trusted, low-risk read tools |
| Per-tool mapping | Different rules by tool name | Read automatically; review writes |

## DEMO 5.2 — approval_mode pauses a write tool for review
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day3/module-5-demo-2-approval-mode.md -->
<!-- source: https://learn.microsoft.com/en-us/python/api/agent-framework-core/agent_framework.mcpstreamablehttptool?view=agent-framework-python-latest | https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/tools/function_tool_with_approval.py -->
<!-- notes: Placeholder marker slide — the runbook has full narration, setup, and fallback plan. Adapts the approval pause/resume mechanic from function_tool_with_approval.py onto an MCP tool's approval_mode constructor option; no MCP-specific approval sample exists in the repo yet, so the API reference is the primary grounding source for the MCP-side wiring. -->

Set `approval_mode="always_require"` on the MCP tool and run a request that needs it: the run pauses with a user-input request naming the tool and arguments, and only resumes after an explicit approval decision — the same pause/resume mechanic the official function-tool sample demonstrates, wired onto an MCP tool.

## Security is broader than authentication
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Treat remote tool descriptions, annotations, and results as untrusted input. Review the operator, data sharing, retention, costs, and permissions. Prefer first-party hosted servers over proxies when available. -->

- **Trust** — Review the server operator and package provenance
- **Least privilege** — Narrow identity scopes and allowed_tools
- **Prompt injection** — Treat tool metadata and results as untrusted
- **Audit** — Log selected tool, arguments, approval, result status, and caller

## Always close the lifecycle
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Async context managers are not cosmetic. They close transports, sessions, and local child processes even when an exception occurs. Nest credential, MCP tool, and agent lifecycles deliberately. -->

1. **Acquire credential**
2. **Open MCP tool**
3. **Open agent**
4. **Run and handle approvals**
5. **Exit contexts in reverse order**

## Local or remote?
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Choose remote when a trusted service hosts and updates the endpoint. Choose local when the server is local-only or the client cannot complete remote authentication. Local means you own package and process security. -->

| Question | Prefer local stdio | Prefer remote HTTP |
|---|---|---|
| Who hosts it? | Your process or workstation | Trusted service provider |
| Updates | You pin and manage | Provider manages |
| Authentication | Local environment / server mechanism | Headers or service identity |
| Network | No remote endpoint required | Endpoint must be reachable |
| Operational burden | Higher | Lower |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools?tabs=python -->
<!-- notes: Transition to the official Azure DevOps remote server. It is a strong example of remote-first hosting, Entra authentication, server-side filtering, and distinct read/write tools. -->

- You let the server transport determine the MAF MCP class.
- You constrain discovery with an explicit allow-list.
- You design header_provider for both tool-call and ambient requests.
- You require approval for risky operations and inspect arguments.
- You use async context managers to clean up every connection.
