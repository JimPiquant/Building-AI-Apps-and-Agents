---
title: Azure DevOps Remote MCP
subtitle: Use the GA hosted server with read-first controls and Foundry-managed continuity
eyebrow: DAY 3 · MODULE 6 · 35 MIN
tag: Day 3 · Module 6
deck: module-6-azure-devops-mcp.pptx
---

# Module 6 — Azure DevOps Remote MCP

## Azure DevOps Remote MCP
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/release-notes/2026/sprint-278-update | https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol -->
<!-- notes: Lead with the current status: the Azure DevOps Remote MCP Server became generally available in Sprint 278. The separate Foundry Add Tools catalog integration can still carry a preview label. -->

- Remote server: GA · Foundry catalog integration: preview label in current docs

## Keep the two status labels separate
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/release-notes/2026/sprint-278-update | https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol -->
<!-- notes: This resolves the known documentation discrepancy. GA describes the Azure DevOps hosted service. Preview describes the Azure DevOps entry in Foundry's Add Tools catalog. One does not automatically change the other. -->

- **Azure DevOps Remote MCP Server**
  - Generally available in Sprint 278
  - Azure DevOps hosts and updates it
  - Streamable HTTP endpoint
- **Foundry Add Tools catalog entry**
  - Current page says “Azure DevOps MCP Server (preview)”
  - Creates a project connection and tool selection
  - Track this integration label independently

## Remote first, local when auth blocks you
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Remote is the official recommendation when the client supports its Entra OAuth flow. Local remains available for clients that cannot authenticate to remote. -->

| Feature | Remote | Local |
|---|---|---|
| Hosting | Azure DevOps hosted | Your machine |
| Transport | Streamable HTTP | stdio |
| Installation | None | Node.js 20+ and npx |
| Authentication | Microsoft Entra ID OAuth | PAT or Microsoft Entra ID |
| Updates | Managed by Azure DevOps | Managed by you |

## Prerequisites are specific
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Remote supports Azure DevOps Services organizations backed by a Microsoft Entra tenant. Standalone MSA organizations are unsupported. Azure DevOps Server on-premises is not the remote service target. The signed-in user needs project membership and resource permissions. -->

- **Azure DevOps Services** — Active organization backed by Microsoft Entra
- **Not supported** — Standalone MSA organizations
- **Not the target** — On-premises Azure DevOps Server
- **Permissions** — Membership and access to every queried or changed resource

## The endpoint is organization-scoped
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Use the exact documented endpoint. The organization segment can be omitted, but then organization context must be supplied in each tool call; for workshop clarity, keep it in the URL. -->

```text
https://mcp.dev.azure.com/{organization}
```

```json
{
  "url": "https://mcp.dev.azure.com/{organization}",
  "type": "http"
}
```

## Filter broad toolsets or exact tools
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: X-MCP-Toolsets enables groups such as wit, repos, wiki, and pipelines. X-MCP-Tools enables exact names. The documentation says not to combine them, so choose one filtering mode. -->

- **X-MCP-Toolsets**
  - Group filter: `wit`, `repos`, `wiki`, `pipelines`, and others
  - Good for a bounded domain
  - Do not combine with X-MCP-Tools
- **X-MCP-Tools**
  - Exact tool-name allow-list
  - Good for least-privilege scenarios
  - Do not combine with X-MCP-Toolsets

## Read-only is a server-side filter
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: X-MCP-Readonly=true restricts the server to read-only operations. Combine it with a toolset filter for the first phase. It is a concrete server control, not merely a prompt instruction. -->

```json
{
  "headers": {
    "X-MCP-Toolsets": "wit",
    "X-MCP-Readonly": "true"
  }
}
```

## Work item tools are consolidated
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Use current exact names. Reads use wit_work_item with an action such as get, get_batch, my, or list_for_iteration. Creates and field updates use wit_work_item_write with create, update, update_batch, or add_child. Comments and links have separate write tools. -->

| Tool | Example actions | Risk |
|---|---|---|
| `wit_work_item` | `get`, `get_batch`, `my`, `list_for_iteration` | Read-only |
| `wit_work_item_write` | `create`, `update`, `update_batch`, `add_child` | Write |
| `wit_work_item_comment_write` | `add`, `update` | Write |
| `wit_work_item_link_write` | `link`, `unlink`, `link_to_pull_request` | Write |

## Use a read-first, approved-write sequence
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/agent-framework/agents/tools/tool-approval?tabs=python -->
<!-- notes: This is the lab safety pattern, not a claim that the server automatically approves writes. First retrieve the current item. Then construct the proposed mutation. Show the exact tool and arguments. Execute only after an explicit approval path. -->

1. **Read** — `wit_work_item(action="get", ...)`
2. **Compare** — Show current values and proposed change
3. **Approve** — Caller reviews tool name and arguments
4. **Write** — `wit_work_item_write(action="update", ...)`
5. **Verify** — Read the item again and record the result

## Two supported paths — not one wizard
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol | https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox -->
<!-- notes: Keep these as separate documented patterns. Foundry documents the Azure DevOps catalog path for Foundry agents. Separately, Toolbox documentation exposes an MCP endpoint that a MAF client can consume. Do not imply one portal wizard automatically produces the full local-MAF path. -->

- **Foundry agent path**
  - Add Tools → Catalog → Azure DevOps
  - Authenticate through a project connection
  - Select the smallest required tool subset
- **Local MAF path**
  - Consume an existing Toolbox MCP endpoint
  - Authenticate to the Toolbox with supported Entra auth
  - Treat upstream MCP credentials as Toolbox-managed

## OAuth consent belongs to the connection path
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol -->
<!-- notes: The Foundry documentation explains project connections and an expected CONSENT_REQUIRED response for OAuth-backed toolbox connections. It does not document a complete direct local MAF OAuth flow to the Azure DevOps endpoint, so do not teach one. -->

- **Project connection** — Stores authentication details instead of app code
- **Consent** — First OAuth-backed toolbox call can return `CONSENT_REQUIRED`
- **Retry** — Complete the consent URL, then retry the call
- **Boundary** — Do not claim an undocumented direct local MAF-to-ADO OAuth recipe

## Failure modes tell you where to look
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server-troubleshooting?view=azure-devops -->
<!-- notes: Diagnose in layers. Authentication failures differ from permission failures, discovery filters, and invalid consolidated actions. Avoid widening access until you know which layer failed. -->

| Symptom | Check first |
|---|---|
| Sign-in or consent fails | Entra-backed org, tenant policy, enterprise app consent |
| Tool is missing | X-MCP-Toolsets / X-MCP-Tools / read-only filters |
| Tool returns forbidden | Signed-in user's project and resource permissions |
| Write tool unavailable | X-MCP-Readonly and exact tool allow-list |
| Invalid operation | Current tool name plus documented `action` |

## Workshop guardrails
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops | https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol -->
<!-- notes: These are the guardrails the future lab will enforce. Use a disposable workshop project, start read-only, minimize tools, require approval for writes, and retain an audit trail. -->

- **Scope** — Dedicated workshop project and least-privilege user
- **Discover** — `wit` only, read-only first
- **Approve** — Explicit review before every write
- **Audit** — Caller, tool, action, arguments, decision, and verification result

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/azure/devops/release-notes/2026/sprint-278-update | https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops -->
<!-- notes: Recap the exact facts. Transition to evaluation: the next module checks whether the agent chose wit_work_item or wit_work_item_write with the expected action and arguments. -->

- You treat the remote server GA status separately from the Foundry catalog preview label.
- You choose remote first when your client supports Entra OAuth.
- You filter with Toolsets or exact Tools, never both.
- You start with `X-MCP-Readonly: true`.
- You use consolidated tool names and inspect each `action`.
