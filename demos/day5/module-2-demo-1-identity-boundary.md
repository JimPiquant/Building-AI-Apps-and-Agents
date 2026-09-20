# Module 2 · Demo 1 — Identity boundary: an approved action can still be denied

## Objective

Use presenter-prepared reference evidence to identify the principal and
authorization check at each hop. Show that tool approval and OAuth consent
can both succeed while downstream document authorization correctly denies a
request, and that a session ID is not an ownership credential.

This is a **read-only walkthrough**. It makes no live RBAC or consent changes,
displays no tokens, uses no customer data, and assumes no attendee completed
an earlier lab.

## Placement and time

**Placement:** After **slide 7 — "Session state and documents need their own
boundaries"** (Module 2).

**Time:** ~7 minutes total.

| Segment | Time |
|---|---:|
| Frame the evidence | 0:45 |
| Trace the access map | 1:15 |
| Compare Alice and Bob | 2:30 |
| Test session continuation | 1:00 |
| Checkpoint and payoff | 1:30 |

## Prerequisites

- Module 2 slides open at slide 7.
- This runbook open at **Prepared inputs**; the embedded tables are the
  required fallback and need no network access.
- Presenter display set to hide notifications and unrelated applications.
- Optional only: a reviewed, redacted capture from a controlled presenter
  environment. It must show no token, secret, customer content, object ID,
  tenant ID, or personal identifier.
- No Azure portal IAM blade, OAuth consent dialog, token viewer, terminal, or
  customer system open for the walkthrough.

## Exact setup

1. Put the Module 2 deck on the presentation display and this runbook on the
   presenter display.
2. Rehearse the sequence using the three prepared inputs below; do not
   substitute live tenant data.
3. Present every embedded outcome with this visible label:
   **EXPECTED — synthetic reference evidence; not a captured cloud result**.
4. If an authentic controlled-environment capture is available, label it
   **CAPTURED — controlled presenter environment — YYYY-MM-DD** and verify
   that it matches the expected policy outcome. Otherwise, use only the
   embedded expected evidence.
5. Set a seven-minute timer. The demo has no login, command, or permission
   setup.

## Prepared inputs

All names, resources, IDs, and outcomes below are fictional. They describe the
expected policy behavior of the reference documentation assistant.

### Input A — access map

**EXPECTED — synthetic reference evidence; not a captured cloud result**

| Connection | Principal presented | Permission/check |
|---|---|---|
| Alice/Bob → agent endpoint | Alice or Bob user principal | Foundry Agent Consumer at this agent endpoint |
| Agent → knowledge tool | Configured agent/application principal plus user context | Tool approval and connection authentication |
| Client → Search index | Application/agent identity | Search Index Data Reader on the Search service |
| Query → restricted document | Alice or Bob user/group permission | Query-time ACL, RBAC permission metadata, or security filter |
| Client → saved session | Authenticated tenant + user + continuation ID | Application-owned session authorization and partition |

### Input B — same proposed lookup, different document permission

The synthetic request is: **"Summarize the engineering travel exception."**

| Check | Alice | Bob |
|---|---|---|
| Invoke agent | Allowed | Allowed |
| Proposed knowledge lookup approved | Yes | Yes |
| OAuth connection consent available | Yes | Yes |
| Application/agent can read the index | Yes | Yes |
| User may read `engineering-travel-exception` | **Allowed** | **Denied** |
| Expected application response | Evidence-limited summary with citation | Permission-safe denial; no restricted content |

### Input C — session continuation

| Request | Expected ownership check |
|---|---|
| Alice resumes `session-ref-104` | Allowed after Alice authenticates |
| Bob submits `session-ref-104` | Denied before state is loaded |
| Why | The ID selects state; Alice's authenticated ownership authorizes it |

## Actions and narration

### 1. Frame the evidence (0:00–0:45)

Advance to the demo marker.

**Say:** “Nothing here changes a role, opens a consent flow, or displays a
token. These are synthetic, presenter-prepared expected outcomes. We are
debugging the boundary, not performing the operation.”

### 2. Trace the access map (0:45–2:00)

Show **Input A** and move down one row at a time.

**Say:** “At every arrow, ask two questions: which principal authenticated on
this connection, and what role, scope, or data rule authorizes it? The person
in the chat window is not automatically the caller at the Search service.”

Point out that endpoint access, index access, and document access are three
different checks.

### 3. Compare Alice and Bob (2:00–4:30)

Show **Input B**. Reveal the rows from top to bottom.

**Say:** “Both users can invoke the agent. Both approve the proposed lookup.
Both already completed the connection's OAuth consent. The workload can read
the index. None of those facts grants Bob access to this document.”

Point to the document-permission row.

**Say:** “This is the decisive check: the user permission carried into
query-time document filtering. Alice is included; Bob is excluded. Bob's
denial is expected authorization behavior, not failed authentication.”

Ask: “If both users were denied, what would you inspect first?” Accept:
the actual principal on the knowledge connection, its Search role and scope,
and whether user context reached document filtering.

### 4. Test session continuation (4:30–5:30)

Show **Input C**.

**Say:** “A continuation ID is an opaque lookup key. It is not a bearer
credential and does not prove ownership. The application authenticates Bob,
combines identity with the session boundary, and refuses to load Alice's
state.”

### 5. Checkpoint and payoff (5:30–7:00)

Ask: “Approval and consent succeeded, but Bob's retrieval was denied. Which
identity and permission do we inspect?”

Expected answer:

1. The principal actually presented to the downstream service.
2. Its role and assignment scope.
3. Bob's document permission at query time.
4. For continued state, Bob's authenticated ownership—not the session ID
   alone.

**Close:** “For the reference agent we examined, approval allowed an attempt;
authorization decided the result. Follow the principal all the way to the
enforcement point.”

## Expected observations

These are **expected policy observations**, not claims of a live or captured
run:

- Alice and Bob can pass agent-endpoint authorization independently of
  document authorization.
- Approval allows a proposed tool call to proceed; it grants no Search or
  document permission.
- OAuth consent permits requested delegated access; the downstream service
  still authorizes the resulting request.
- Search Index Data Reader permits index access but doesn't override
  per-document permissions.
- A shared workload identity alone can't create Alice/Bob document isolation.
- A continuation ID identifies state but doesn't prove that the caller owns
  it.

## Fallback

The embedded tables are the primary offline-safe fallback.

- If an optional controlled-environment capture is missing, stale, or
  unreadable, do not describe it as observed. Show Inputs A–C and retain the
  **EXPECTED** label.
- If the display fails, narrate the four checkpoint questions from the
  Module 2 takeaways slide.
- If asked for tenant-specific roles or output, state that this demo proves a
  reasoning method only; validate the customer's actual principal, role,
  scope, document control, and API version separately.

Never improvise a live role assignment, consent grant, token inspection, or
document lookup.

## Cleanup

1. Close any optional local capture.
2. Return to the Module 2 takeaways slide.
3. Confirm no portal, consent, or token window was opened and no cloud state
   changed.
4. Remove no resources; there are none to clean up.

## Sources

- [Authentication and authorization in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry)
- [Role-based access control for Microsoft Foundry](https://learn.microsoft.com/azure/foundry/concepts/rbac-foundry)
- [Set up authentication for MCP tools](https://learn.microsoft.com/azure/foundry/agents/how-to/mcp-authentication)
- [Agent identity concepts](https://learn.microsoft.com/azure/foundry/agents/concepts/agent-identity)
- [Migrate agent applications to the new identity model](https://learn.microsoft.com/azure/foundry/agents/how-to/migrate-agent-applications)
- [Secure session continuation](https://learn.microsoft.com/agent-framework/hosting/self-hosting/#secure-session-continuation)
- [Connect a Foundry IQ knowledge base](https://learn.microsoft.com/azure/foundry/agents/how-to/foundry-iq-connect)
- [Document-level access control in Azure AI Search](https://learn.microsoft.com/azure/search/search-document-level-access-overview)
