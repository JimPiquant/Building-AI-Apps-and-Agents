# Module 5 · Demo 1 — Consume a hosted toolbox from your agent

**Placement:** After **slide 5 — "Why toolbox, and not just tools=[...] on the agent"** (Module 5).

**Time:** ~5 min total (30s framing + 90s show + 2 min run + 60s payoff)

**Language:** Python (MAF SDK). No portal path — a toolbox is created via
SDK/`azd`/Foundry Toolkit and consumed by writing a small MCP-client
snippet in your agent. This demo is the "consumer side."

## What it shows

Module 5 has just argued: *"Why toolbox, and not just `tools=[...]` on the
agent?"* The answer on the slide is that Toolbox eliminates the "author,
package, deploy, secure, patch" ceremony a function tool would need.
This demo makes that concrete on the consumer side — a pre-created
toolbox, and a small `MCPStreamableHTTPTool` snippet that hooks the
toolbox into an MAF agent. The audience sees that consuming a hosted
toolbox is a code-level attach, not a click-through picker in the
portal. The toolbox author did the heavy lifting; the consumer writes
~15 lines.

**What this demo is NOT:** it does not walk creating or publishing a
toolbox (Module 5 slides 6–8 cover authoring; the Learn doc has a
YAML/SDK step-by-step). It picks up at *"a toolbox already exists —
here's how the agent code hooks into it."*

## Setup checklist

Do this **before the module starts**:

- **A pre-created, published toolbox** in your Foundry project. Pick a
  safe, deterministic tool for the demo — options confirmed by the
  Learn doc:
  - `web_search` (MCP tool via Bing)
  - `azure_ai_search` (against a small pre-indexed corpus)
  - A `time`-style utility (custom MCP server the presenter runs)

  If you don't already have one from prior workshop prep, follow the
  [Learn Toolbox quickstart](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox?pivots=python)
  to publish a version. Publish this **once** before Day 2 — not live
  in the module.

- **The toolbox's MCP consumer endpoint URL** in hand. Format from
  Learn:
  ```
  https://<account>.services.ai.azure.com/api/projects/<project>/toolboxes/<toolbox-name>/versions/<version>/mcp?api-version=v1
  ```
  Retrieve via `azd ai toolbox show <toolbox-name> --output json`
  (the `endpoint` field) or from the **Foundry Toolkit for VS Code**
  sidebar (**My Resources → project → Tools → Toolboxes**).

- **RBAC set correctly.** From the Learn Prerequisites: your identity
  needs the **Foundry User** role on the project. If your dry-run
  errors with 401/403, this is usually why.

- **The [maintained MAF Foundry Toolbox sample](https://aka.ms/foundry-toolbox-maf)
  cloned** into the presenter environment. The sample provides the
  `_ToolboxAuth` httpx-auth helper that wraps `DefaultAzureCredential`
  as a bearer-token provider for the MCP endpoint. Learn shows the
  pattern but does not inline this helper — you use the sample.

- **`.env`** populated at the sample directory:
  ```
  FOUNDRY_PROJECT_ENDPOINT=https://<account>.services.ai.azure.com/api/projects/<project>
  TOOLBOX_ENDPOINT=<full MCP endpoint from step above>
  AZURE_AI_MODEL_DEPLOYMENT_NAME=gpt-5.6-luna
  ```

- **`uv sync`** in the sample directory — installs `agent-framework`,
  `agent-framework-foundry`, `azure-identity`, `httpx`.

- **Dry-run once**, end-to-end, on the presenter machine. Note the
  cold-start latency for the first tool call — can be 5–10s.

- **Screenshot fallbacks** captured during your dry run:
  - `azd ai toolbox show` output showing your toolbox and endpoint
  - The ~15-line consumer snippet you'll walk
  - A successful agent response citing a toolbox tool call
  - A trace showing the tool-call span

## Narration + steps

**Opening (30s):**
"The prior slide argued: 'why toolbox, and not just `tools=[...]` on
the agent?' The answer was that Toolbox eliminates the ceremony a real
production function tool would need. That claim lives or dies on the
consumer side. Let me show you what it takes to consume one from an
MAF agent — with a toolbox that someone else has already published."

**Step 1 — Show the toolbox exists (~30s)**

In the terminal:

```bash
azd ai toolbox show <your-toolbox-name> --output json
```

Point at the `endpoint` field. It's an MCP URL — same protocol as
Day 3.

**Say:** *"This toolbox was published before today. Whoever published
it dealt with auth, hosting, versioning, governance. I don't. All I
need is this endpoint."*

**Step 2 — Walk the ~15 lines that attach it to an agent (~90s)**

Open `main.py` in the [maintained MAF sample](https://aka.ms/foundry-toolbox-maf).
Highlight the key three-block pattern from Learn:

```python
# 1. Auth — wrap DefaultAzureCredential as an httpx bearer-token provider
credential = DefaultAzureCredential()
token_provider = get_bearer_token_provider(credential, "https://ai.azure.com/.default")
http_client = httpx.AsyncClient(auth=_ToolboxAuth(token_provider), timeout=120.0)

# 2. Wire the toolbox MCP endpoint as an MAF tool
mcp_tool = MCPStreamableHTTPTool(
    name="toolbox",
    url=os.environ["TOOLBOX_ENDPOINT"],
    http_client=http_client,
    load_prompts=False,
)

# 3. Give it to the agent — same shape as any other MAF tool
agent = chat_client.as_agent(
    name="toolbox-demo-agent",
    instructions="You are a helpful assistant with access to Foundry toolbox tools.",
    tools=[mcp_tool],
)
```

**Say (block by block):**
- *"Block 1: auth. `DefaultAzureCredential` gets a token, and we wrap
  it in an httpx auth helper. That `_ToolboxAuth` class lives in the
  maintained sample — Learn shows the pattern, the sample ships the
  glue.*
- *"Block 2: one line that turns the toolbox endpoint into an MAF
  tool object. That's it. Under the hood, `MCPStreamableHTTPTool` will
  hit the endpoint, list the available tools via MCP `tools/list`,
  and expose each one to the agent.*
- *"Block 3: pass it in the `tools=[]` list. From here down, the
  agent doesn't know or care that these are hosted — it looks like a
  local function tool to the model."*

**Step 3 — Run it (~90s)**

```bash
uv run python main.py
```

The sample's `main.py` will prompt-loop or run a fixed query
depending on how it's set up. Either way, ask a question that will
exercise a toolbox tool. If the toolbox includes `web_search`:

> *"What's the current latest release version of Microsoft Agent
> Framework?"*

Watch the response. First run has cold-start latency (~5–10s for the
first tool call), subsequent runs are faster. When the response
appears, point at the tool-call attribution.

**Say:** *"Look at that. The agent picked the toolbox tool, made
the call, incorporated the result. Same shape as a function tool.
Different origin — I wrote zero tool code today."*

**Step 4 — Show the tool call in the trace (~30s, optional)**

If Application Insights tracing is connected to your project (see
demos 1.2 / 7.1 setup notes), open the trace for the last run and
point at the toolbox tool-call span.

**Say:** *"Tool call, tool result, model synthesis. Standard function-
calling loop. Toolbox is one hop away — MCP over HTTPS to a hosted
endpoint — but from the agent's point of view it's just another
tool."*

## Expected result

- `azd ai toolbox show` returns the toolbox with an `endpoint` field
- The MAF consumer script (~15 lines of substance) runs cleanly
- The agent responds with a tool-use answer citing a toolbox tool
- Trace shows the toolbox tool-call span

## Fallback story if it breaks live

**Most likely failures:**
- **401/403 on first MCP call** — RBAC not propagated yet, or your
  identity missing Foundry User. Cannot be fixed live.
- **Cold-start latency spikes** (>30s on first call) — infrastructure,
  not code
- **Tool discovery empty** (`tools/list` returns `[]`) — toolbox
  version not the default, or promoted version doesn't include the
  tool
- **`_ToolboxAuth` import error** — sample not synced or wrong
  branch checked out

Have these ready:
1. **Screenshot of `azd ai toolbox show`** with the endpoint visible
2. **Screenshot of `main.py`** with the three-block pattern
3. **Screenshot of a successful agent response** from your dry run,
   with the toolbox tool-call cited
4. **Screenshot of the trace** showing the tool-call span

Story: *"Consuming an MCP endpoint hits network + auth on the first
call, so first-call latency can spike. This is what a successful run
looks like from my dry run last night — same three-block consumer,
same tool-call shape. You'll see this pattern again on Day 3 when we
consume a real Azure DevOps MCP server, so the muscle memory carries."*

Then advance the slide.

## Teaching payoff

*"'Toolbox' isn't magic. It's an MCP endpoint. Consuming it from an
MAF agent is auth + one `MCPStreamableHTTPTool` object + the same
`tools=[]` list you'd use for any other tool. The value is in what
you DIDN'T do: no tool authoring, no packaging, no hosting, no
per-tool auth wiring, no versioning story. When you finish Day 2 and
go home to write a real agent, this is your first check — is there a
published toolbox already?"*

## Reference

- [Create and manage a toolbox in Foundry (Python pivot)](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox?pivots=python) — the doc this demo is grounded in
- [Maintained MAF Foundry Toolbox sample](https://aka.ms/foundry-toolbox-maf) — includes the `_ToolboxAuth` helper
- Module 5 slides 6–8 — toolbox authoring (creates the artifact this demo consumes)
