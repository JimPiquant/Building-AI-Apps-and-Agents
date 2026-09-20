# Capstone team charter

Use this template during the customer-run Day 5 scoping session. Keep unknowns
visible and assign them. A reviewed charter is a scope agreement—not evidence
that the system is implemented, safe, supported, or production ready.

## Before you start: two kinds of guidance

### Microsoft product concepts

- An [MAF agent](https://learn.microsoft.com/agent-framework/concepts/agents/)
  combines a model or remote-agent connection with instructions, tools, and
  run context behind an agent interface.
- An [MAF workflow](https://learn.microsoft.com/agent-framework/concepts/workflows/)
  defines explicit execution paths across agents or ordinary code. Every
  workflow step need not be an agent.
- [RAG](https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation)
  retrieves relevant content and supplies it as grounding data.
- In [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq),
  a **knowledge base** defines retrieval behavior and references one or more
  **knowledge sources**, which connect to indexed or remote content.
- [Traces](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
  record operations and timing; [evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)
  judge supplied interactions against specific criteria.

### Workshop policy

The team size, capstone minimums, checkpoints, demo format, and dates below
come from [`docs/day5-plan.md`](../../docs/day5-plan.md). They are not
Microsoft product requirements or a readiness standard.

- Teams have **2–3 members; no solo path**.
- The solution needs at least one MAF agent using a Foundry-deployed model,
  one Toolbox/MCP/custom MAF function-tool integration, and Foundry IQ or
  custom RAG.
- Plan at least 10 golden-set cases; retain initial/final Foundry evaluator
  results and OTel trace evidence.
- Multi-agent is optional. Day 5 has **no deployment deliverable**.
- Demo day is 2–3 weeks after September 21; exact date **TBD**.

### Status vocabulary

Use: **Proposed**, **In progress**, **Not yet observed**, **Evidence
captured**, **Reviewed**, or **Blocked**. “Evidence captured” must link to an
artifact; it is not a claim that the result passed.

---

## 1. Team and logistics

| Field | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Team name |  |  |  |  |
| Member 1 / role |  |  |  |  |
| Member 2 / role |  |  |  |  |
| Member 3 / role *(optional)* |  |  |  |  |
| Charter editor |  |  |  |  |
| Technical/evidence reviewer |  |  |  |  |
| Kickoff | September 21, 2026 | Organizer | `docs/day5-plan.md` | Reviewed |
| Demo window | 2–3 weeks after kickoff; exact date **TBD** |  |  | Proposed |
| Organizer responsible for confirming exact date |  |  | Calendar/invitation |  |
| Coaching check-in 1 |  |  |  |  |
| Coaching check-in 2 *(optional)* |  |  |  |  |

Team-size check: **2–3 members and no solo attendee:** __________

## 2. Problem, user, scope, and non-goals

Complete the sentence:

> For **[user]**, help with **[bounded task]** so that **[observable outcome]**.

| Field | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Primary user/persona |  |  |  |  |
| Current problem and consequence |  |  |  |  |
| In-scope user task |  |  |  |  |
| Observable user outcome |  |  |  |  |
| In-scope data/content |  |  |  |  |
| Explicit non-goal 1 |  |  |  |  |
| Explicit non-goal 2 |  |  |  |  |
| Starting point available | ☐ Provided example ☐ Existing code ☐ New spike |  |  |  |
| Prior-lab/environment gap to plan for *(not a Day 5 prerequisite)* |  |  |  |  |
| Deployment | **Not a Day 5 deliverable** | Workshop owner | `docs/day5-plan.md` | Reviewed |

## 3. Agent versus workflow decision

Choose the smallest control shape that satisfies the user need. A single agent
can qualify; do not add agents merely to resemble the Day 4 reference.

| Decision | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Chosen shape | ☐ Single MAF agent ☐ MAF workflow with agent/code steps ☐ Multi-agent workflow |  |  |  |
| What the model may decide |  |  |  |  |
| What code/workflow must decide |  |  |  |  |
| Why explicit order/branch/gate is or is not needed |  |  |  |  |
| If multi-agent: what distinct responsibility requires each agent? |  |  |  |  |
| Simplest alternative considered |  |  |  |  |

## 4. Architecture sketch

Attach or link the architecture diagram here: _______________________________

### Foundry/Azure resource mapping

Microsoft Foundry product architecture distinguishes a top-level Foundry
resource, projects, project assets, and independently governed connected Azure
services. Record the real mapping rather than treating the five workshop
layers as five Azure resources.

| Product/resource boundary | Planned component or `TBD` | Identity / trust boundary | Owner | Evidence/link | Status |
|---|---|---|---|---|---|
| Foundry resource / model deployment |  |  |  |  |  |
| Foundry project / project assets |  |  |  |  |  |
| Connected Azure or external services |  |  |  |  |  |
| Application runtime boundary |  |  |  |  |  |
| Telemetry/evaluation stores |  |  |  |  |  |

Reference: [Microsoft Foundry architecture](https://learn.microsoft.com/azure/foundry/concepts/architecture).

### Five-layer workshop lens

> **Workshop lens, not product architecture.** Use these rows to organize the
> design, then map them to actual components and governance boundaries above.

| Layer | Planned design | Actual component/service | Key trust, data, or failure boundary | Owner | Evidence/link | Status |
|---|---|---|---|---|---|---|
| **Model** | Foundry-deployed model and why |  |  |  |  |  |
| **Runtime** | MAF agent/workflow execution |  |  |  |  |  |
| **Actions** | Toolbox, MCP, or function tool |  |  |  |  |  |
| **Knowledge** | Foundry IQ or custom RAG |  |  |  |  |  |
| **Ops** | Identity, safety, evaluation, tracing, latency, cost |  |  |  |  |  |

### Grounding design

| Question | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Approach | ☐ Foundry IQ ☐ Custom RAG |  |  |  |
| Knowledge base *(Foundry IQ, if used)* |  |  |  |  |
| Knowledge source(s) or custom source/index |  |  |  |  |
| Retrieval evidence returned to the model |  |  |  |  |
| Freshness/version approach |  |  |  |  |
| Query-time document authorization approach |  |  |  |  |
| Unsupported/insufficient evidence response |  |  |  |  |

## 5. Success criteria—not implementation tasks

“Enable tracing” is a task. “For GS-04, identify the failed retrieval span in
the retained trace” is an observable criterion. Write **3–5 criteria** with
metric/unit, boundary, cases, acceptance rule, evidence, and owner. Thresholds
are team/workshop decisions, not Microsoft defaults.

| ID | Observable success criterion | Metric/unit or observation | Boundary + case(s) | Acceptance rule | Evidence/link | Owner | Status |
|---|---|---|---|---|---|---|---|
| SC-01 |  |  |  |  |  |  |  |
| SC-02 |  |  |  |  |  |  |  |
| SC-03 |  |  |  |  |  |  |  |
| SC-04 *(optional)* |  |  |  |  |  |  |  |
| SC-05 *(optional)* |  |  |  |  |  |  |  |

Implementation tasks that support—but do not replace—the criteria:

| Task | Criterion served | Owner | Evidence/link | Status |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## 6. Golden-set outline — at least 10 planned cases

Ground truth is a reviewed expected answer/action/source where the evaluator
needs it; a prior model response is not automatically truth. Include happy
paths, ambiguity, incomplete evidence, permission/safety boundaries, and tool
or budget failures relevant to the scenario.

| ID | Category | Prompt/task intent | Expected behavior / ground-truth source | Evaluator or human check | Failure path/control exercised | Owner | Status |
|---|---|---|---|---|---|---|---|
| GS-01 |  |  |  |  |  |  | Proposed |
| GS-02 |  |  |  |  |  |  | Proposed |
| GS-03 |  |  |  |  |  |  | Proposed |
| GS-04 |  |  |  |  |  |  | Proposed |
| GS-05 |  |  |  |  |  |  | Proposed |
| GS-06 |  |  |  |  |  |  | Proposed |
| GS-07 |  |  |  |  |  |  | Proposed |
| GS-08 |  |  |  |  |  |  | Proposed |
| GS-09 |  |  |  |  |  |  | Proposed |
| GS-10 |  |  |  |  |  |  | Proposed |
| GS-11+ *(optional)* |  |  |  |  |  |  |  |

Dataset/version name: ____________________

Ground-truth reviewer: ____________________

Sensitive-data handling: ____________________

Reference: [Evaluation datasets in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets).

## 7. Baseline versus candidate comparison

A **baseline** is the known configuration measured first. A **candidate** is a
named changed configuration measured on the same documented cases and
evaluator settings. Record versions and run IDs so a delta can be attributed.

| Configuration field | Initial baseline | Final candidate | Owner | Evidence/link | Status |
|---|---|---|---|---|---|
| Configuration/version ID |  |  |  |  |  |
| Foundry model deployment |  |  |  |  |  |
| MAF agent/workflow version |  |  |  |  |  |
| Instructions |  |  |  |  |  |
| Tool/MCP/Toolbox configuration |  |  |  |  |  |
| Knowledge/index/source version |  |  |  |  |  |
| Evaluator + judge/configuration |  | **Same unless change is explicitly studied** |  |  |  |
| Dataset/version |  | **Same** |  |  |  |
| Intended single change | Baseline |  |  |  |  |

| Comparison evidence | Initial result | Final result | Acceptance rule | Owner | Evidence/link | Status |
|---|---|---|---|---|---|---|
| Foundry evaluator score/label |  |  |  |  |  |  |
| Per-case failures/errors |  |  |  |  |  |  |
| OTel trace/run ID |  |  |  |  |  |  |
| End-to-end latency |  |  |  |  |  |  |
| Usage/cost with units and assumptions |  |  |  |  |  |  |
| Decision |  |  |  |  |  |  |

Missing, errored, or unsupported required evaluation evidence is not a pass.

## 8. Failure cases versus controls

A **failure case** is a test condition. A **control** is the deliberately
implemented behavior at a named enforcement point. A box on the architecture
diagram is not evidence that the control worked.

| Failure case / test condition | Selected control + enforcement point | Expected outcome | Evidence that would verify it | Owner | Status |
|---|---|---|---|---|---|
| Unauthorized lookup |  |  |  |  |  |
| Unsafe or untrusted retrieved/tool content |  |  |  |  |  |
| Unsupported or insufficient-evidence question |  |  |  |  |  |
| Tool failure, timeout, or budget limit |  |  |  |  |  |
| Scenario-specific case |  |  |  |  |  |

## 9. Roles, milestones, risks, and dependencies

### Responsibility map

| Responsibility | Named owner | Backup/reviewer | Evidence/link | Status |
|---|---|---|---|---|
| Product/problem scope |  |  |  |  |
| MAF model/runtime |  |  |  |  |
| Tool/action integration |  |  |  |  |
| Knowledge/RAG |  |  |  |  |
| Identity/safety |  |  |  |  |
| Evaluation/tracing/cost |  |  |  |  |
| README/architecture/demo |  |  |  |  |

### Approved relative checkpoints

| Checkpoint | Required outcome | Target date | Owner | Evidence/link | Status |
|---|---|---|---|---|---|
| **Today** | Reviewed charter or explicitly tracked changes/needs-review disposition | September 21, 2026 |  |  |  |
| **Week 1** | Confirm skills/environment; working spike; ≥10 planned cases; initial Foundry evaluator result |  |  |  |  |
| **Week 2** | Improve controls/quality; rerun same cases; final result; document trade-offs and OTel evidence |  |  |  |  |
| **Week 2–3** | README, architecture, individual 30-day plans, rehearsal, shared demo | Exact demo date **TBD** |  |  |  |

### Risk and dependency log

| Risk/dependency/assumption | Impact | Smallest resolution test/action | Owner | Evidence/link | Status |
|---|---|---|---|---|---|
| Data/content access |  |  |  |  |  |
| Identity/permission |  |  |  |  |  |
| Model/region/quota/preview |  |  |  |  |  |
| Skills/environment/prior-lab gap |  |  |  |  |  |
| Evaluation/telemetry cost or support |  |  |  |  |  |
| Coaching/review availability |  |  |  |  |  |

## 10. Deliverables and evidence

A **deliverable** is built or written; **evidence** is a retained observation
that supports a claim. Track both.

| Required workshop item | Kind | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Working solution with ≥1 MAF agent using a Foundry-deployed model | Deliverable |  |  |  |
| Toolbox, MCP, or custom MAF function-tool integration | Deliverable + observed tool evidence |  |  |  |
| Foundry IQ or custom RAG | Deliverable + retrieval evidence |  |  |  |
| ≥10 planned golden-set cases | Deliverable |  |  |  |
| Initial/final captured Foundry evaluator result | Evidence |  |  |  |
| OTel trace visible in Foundry tracing or Application Insights | Evidence |  |  |  |
| Architecture diagram | Deliverable |  |  |  |
| README: problem, decisions, evaluation story, trade-offs, and links to personalized 30-day plans | Deliverable |  |  |  |
| One personalized 30-day plan per attendee | Deliverable |  |  |  |
| ~15-minute shared demo/Q&A | Deliverable event |  |  |  |

## 11. Review disposition

Select exactly one:

- ☐ **Reviewed—ready to start the spike**
- ☐ **Reviewed—changes required before the spike**
- ☐ **Needs review** *(coaching capacity/time did not permit sign-off)*

| Field | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Review rationale |  | Reviewer |  |  |
| Required changes / unresolved items |  |  |  |  |
| Decision owner |  |  |  |  |
| Next review/check-in |  |  | Calendar/invitation |  |
| Demo-day date confirmation owner |  |  |  |  |
| Charter version/date |  | Charter editor |  |  |

Team representative: ____________________

Reviewer/coach: ____________________

Date: ____________________

Link each attendee's
[`30-day-next-steps-template.md`](30-day-next-steps-template.md) here:

- Member 1: ____________________
- Member 2: ____________________
- Member 3 *(optional)*: ____________________
