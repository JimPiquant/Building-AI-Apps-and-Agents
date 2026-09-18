---
title: Identity and Security
subtitle: Follow the caller, then enforce least privilege at every boundary
eyebrow: DAY 5 · MODULE 3 · 30 MIN
tag: Day 5 · Module 3
deck: module-3-identity-security.pptx
---

# Module 3 — Identity and Security

## Identity and Security
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry -->
<!-- notes: Open with the outcome, not a product tour: we will follow the identity actually presented at each connection, then ask what that principal may do at that resource. No prior lab completion is assumed; all checkpoints use the presenter-prepared reference agent and evidence in the demo runbook. -->

- Authentication tells us **who** crossed a boundary; authorization decides **what** that identity may do there

## Authenticate first; authorize at each plane
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry -->
<!-- notes: Spend about three minutes here. Authentication establishes a principal; authorization evaluates that principal's permissions. Repeat the distinction on both Azure surfaces: control-plane RBAC actions govern resource management, while data-plane RBAC dataActions govern runtime use. Success on one surface says nothing about the other. -->

- **Authentication — who is calling?**
  - A user, application/service principal, managed identity, or agent identity presents a credential
  - A signed-in chat user is not automatically the caller at every later hop
- **Authorization — what may it do here?**
  - **Control plane:** RBAC actions manage resources, projects, and role assignments
  - **Data plane:** RBAC dataActions invoke models, agents, evaluations, and runtime capabilities
  - A valid identity can still receive a correct denial

## Follow the identity at every connection
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/concepts/agent-identity | https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry -->
<!-- notes: Walk left to right and ask “which principal is in this request?” Attended access can carry the user's delegated permissions through an on-behalf-of flow; unattended access uses the agent's application-only authority. The person named in the chat UI is context, not proof that downstream received that person's identity. -->

1. **End user** — authenticates to the client; only delegated permissions can travel onward
2. **Application caller** — invokes with delegated user access or its own workload identity
3. **Agent or tool principal** — authenticates on the tool connection; inspect, do not infer
4. **Downstream service** — checks principal, audience, role, scope, and data permission

The caller is the identity on **that connection**, not necessarily the person in the chat window.

## Current agent identity model—and the legacy wording
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/how-to/migrate-agent-applications | https://learn.microsoft.com/azure/foundry/agents/concepts/agent-identity -->
<!-- notes: Teach the migration page as the current behavior. Newly created agents get a unique Entra Agent Blueprint and Agent Identity at creation. Older agent-identity and MCP pages can still describe the legacy “shared project identity until publish” model; use agent.identity/instance_identity and the migration guide to identify what is actually running. A unique agent identity improves least privilege and auditability but does not automatically preserve end-user context. -->

- **New agent object model**
  - A newly created agent receives a unique Entra Agent Blueprint and Agent Identity by default
  - Its stable endpoint and identity exist from creation; publishing no longer creates the runtime identity
  - Assign downstream permissions to this actual agent identity
  - Unique identity isolates the agent—not its end users
- **Legacy agents and guidance**
  - A legacy agent has a null identity and uses the shared project identity
  - “Shared until published” describes the legacy Agent Application model
  - Re-create a legacy agent to obtain a unique identity; role assignments do not transfer

## Least privilege is role × scope × data rule
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry | https://learn.microsoft.com/azure/search/search-document-level-access-overview | https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup -->
<!-- notes: A role is the allowed action set; scope is where that assignment applies. This table is a workshop decision aid synthesized from the cited role and permission pages, not one universal role recipe. Point out that a single request can pass endpoint RBAC, index RBAC, and still fail document authorization. Use Foundry Agent Consumer—not a developer role—for invocation-only callers. -->

| Need | Principal | Boundary to check |
|---|---|---|
| Invoke the reference agent | End user or calling app | **Foundry Agent Consumer** at project or agent endpoint |
| Build and test agents | Developer | **Foundry User** at project scope |
| Retrieve restricted content | Agent/application plus user context | Index access **and** query-time document permission |
| Read traces | Operator | **Log Analytics Reader** at connected Application Insights; protected tables also need **Privileged Monitoring Data Reader** |

## Approval, OAuth consent, and authorization are three checks
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/how-to/mcp-authentication | https://learn.microsoft.com/azure/foundry/agents/concepts/agent-identity -->
<!-- notes: Approval answers whether this proposed tool call may proceed. OAuth consent grants the application's requested delegated scopes for this user. The downstream service still authenticates and authorizes the token it receives. Shared key, agent-identity, or project-managed-identity connections do not preserve user context; OAuth identity passthrough is the documented individual-authentication option, with tenant and audience constraints. Never place a personal credential in a shared project connection. -->

1. **Tool approval** — allow the proposed call; no resource permission is created
2. **OAuth consent** — grant requested delegated scopes to the application
3. **Token presentation** — send a token for the downstream service's audience
4. **Authorization** — check principal, role/scope, and document permission

An approved, consented call can still be **correctly denied**.

## Session state and documents need their own boundaries
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/agent-framework/hosting/self-hosting/#secure-session-continuation | https://learn.microsoft.com/azure/foundry/agents/how-to/foundry-iq-connect | https://learn.microsoft.com/azure/search/search-document-level-access-overview -->
<!-- notes: A continuation ID is an opaque lookup key, not an ownership credential. Authenticate the caller, authorize access to the referenced state, and partition persisted state by tenant, user, or workspace before loading it. Likewise, project or index access is not document access. Foundry IQ and native Search ACL/RBAC enforcement have preview API and SDK requirements; security filters are a separate, API-agnostic custom-RAG pattern. Permission metadata must survive chunking and stay refreshed. -->

- **Session continuation**
  - An ID locates state; it does **not** prove ownership
  - Authenticate the caller, authorize the reference, then load tenant/user/workspace state
- **Document retrieval**
  - Project or index access does **not** authorize every document
  - Carry user/group permissions into query-time filtering and projected chunks
  - Choose security filters or supported native ACL/RBAC enforcement (preview)

## DEMO 3.1 — An approved action can still be denied
<!-- layout: demo -->
<!-- demo-time: ~7 min -->
<!-- demo-reference: Runbook: demos/day5/module-3-demo-1-identity-boundary.md -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/how-to/mcp-authentication | https://learn.microsoft.com/agent-framework/hosting/self-hosting/#secure-session-continuation | https://learn.microsoft.com/azure/foundry/agents/how-to/foundry-iq-connect | https://learn.microsoft.com/azure/search/search-document-level-access-overview -->
<!-- notes: Use only the runbook's presenter-prepared, synthetic access map and explicitly labeled expected outcomes. Alice and Bob may both invoke and approve a lookup, but only Alice's user permission allows the restricted document; Bob also cannot reuse Alice's continuation ID. Do not make live RBAC or consent changes, display tokens, or imply the expected table is a captured cloud result. Close with the phrase “the reference agent we examined.” -->

Trace Alice and Bob through the same reference documentation agent. Both can invoke it, approve the lookup, and have a valid connection; only Alice is authorized for the restricted document. Then show why Bob cannot turn Alice's session ID into ownership. Identify the principal and enforcement point—not merely the denial text.

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry | https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry | https://learn.microsoft.com/azure/foundry/agents/how-to/migrate-agent-applications | https://learn.microsoft.com/agent-framework/hosting/self-hosting/#secure-session-continuation | https://learn.microsoft.com/azure/search/search-document-level-access-overview -->
<!-- notes: Run the closing checkpoint: “OAuth consent and tool approval succeeded, but Bob's retrieval was denied. What do we inspect?” Expected answer: the principal actually presented downstream, its role and scope, and Bob's document permission. Reinforce that this conclusion comes from the reference agent we examined; attendees need no previous lab result. -->

- Follow the actual principal at every connection; authenticate and authorize again at each resource.
- Least privilege combines role, scope, and data rules. Invocation-only callers usually need Foundry Agent Consumer—not a developer role.
- Tool approval, OAuth consent, and downstream authorization are independent decisions.
- A unique agent identity does not isolate end users; session IDs and index access do not prove ownership or document permission.
