# Capstone evidence and delivery checklist

Use this as the team index from charter approval through demo day. Enter a
status, owner, and link for every row; do not turn an empty evidence cell into
a check mark.

> This checklist records **workshop requirements** from
> [`docs/day5-plan.md`](../../docs/day5-plan.md). Completing it is not a
> Microsoft certification or proof of production readiness, security,
> compliance, supportability, or statistical sufficiency.

## Header

| Field | Entry |
|---|---|
| Team / capstone |  |
| Checklist owner |  |
| Current version/date |  |
| Charter |  |
| Repository/README |  |
| Architecture diagram |  |
| Demo day | 2–3 weeks after September 21, 2026; exact date **TBD** |
| Date-confirmation owner |  |

### Status vocabulary

Use **Proposed**, **In progress**, **Not yet observed**, **Evidence captured**,
**Reviewed**, or **Blocked**. “Evidence captured” means the link exists; the
evidence may still show a failure.

## 1. Team and scope

| Requirement/decision | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|
| Team has 2–3 members; no solo path |  | Charter team table |  |  |
| User, bounded task, outcome, and explicit non-goals are written |  |  |  |  |
| Prior-lab, environment, data, permission, and quota gaps are owned—not treated as Day 5 prerequisites |  |  |  |  |
| Simplest viable agent/workflow shape is justified |  |  |  |  |
| Multi-agent decision is explicit; multi-agent is **not mandatory** |  |  |  |  |
| Day 5 scope contains **no deployment deliverable** |  | Charter scope |  |  |

## 2. Required solution elements

| Workshop requirement | Product-concept reference | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|---|
| At least one MAF agent is in the running solution | [MAF agents](https://learn.microsoft.com/agent-framework/concepts/agents/) |  |  |  |  |
| That MAF agent uses a Foundry-deployed model | [Foundry runtime components](https://learn.microsoft.com/azure/foundry/agents/concepts/runtime-components) |  |  |  |  |
| At least one Foundry Toolbox tool, MCP server, or custom MAF function tool is integrated | [Foundry Toolbox](https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview) |  |  |  |  |
| Foundry IQ or a custom RAG pipeline retrieves grounding evidence | [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq) · [RAG](https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation) |  |  |  |  |
| Knowledge base versus knowledge source—or custom equivalent—is named precisely | [Foundry IQ components](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq#components) |  |  |  |  |
| One meaningful failure case and selected control/enforcement point are implemented or honestly marked unobserved | [Foundry authentication](https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry) · [RAG evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators) |  |  |  |  |

## 3. Required evidence

| Workshop requirement | Owner | Evidence/link | Status | Review note / gap |
|---|---|---|---|---|
| Golden set has at least 10 planned cases with expected behavior or ground-truth sources |  | Dataset/version: |  | Ten is a teaching minimum, not statistical assurance |
| Initial Foundry evaluator score/labels are captured with evaluator configuration and run ID |  |  |  | Missing/error/unsupported is not a pass |
| Final Foundry evaluator score/labels are captured after a named change |  |  |  |  |
| Initial/final comparison uses the same documented cases and evaluator settings, or explains any intentional difference |  |  |  |  |
| Per-case failures and errors are retained—not hidden by the aggregate |  |  |  |  |
| OTel trace is visible in Foundry tracing or Application Insights |  | Trace/run ID: |  |  |
| Trace shows relevant model/tool/retrieval/workflow timing and stop/failure path |  |  |  | A trace does not prove answer quality |
| Identity, safety, latency, and usage/cost observations name units, scope, and limitations |  |  |  |  |
| A required unavailable evaluation or control blocks acceptance |  |  |  |  |

Product references:
[evaluation datasets](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets),
[agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators),
and [agent tracing](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept).

## 4. Required attendee deliverables

| Deliverable | Minimum content | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|---|
| Architecture diagram | Actual components, five-layer workshop lens, identities/trust boundaries, and evidence locations |  |  |  |  |
| README | Problem, scope/non-goals, design decisions, agent/workflow and grounding choices, evaluation story, observed trade-offs, known gaps, and links to personalized 30-day plans |  |  |  |  |
| Team charter | Criteria, cases, roles, milestones, risks, review disposition |  |  |  |  |
| Personalized 30-day plan | One plan per attendee, each with owner/evidence/status fields |  |  |  |  |
| Demo fallback | Genuine capture or explicitly labeled synthetic/expected material |  |  |  |  |

The five-layer sketch is a **workshop lens**, not five Azure resources or
Microsoft Foundry's product architecture. Map it to the
[Foundry resource/project hierarchy](https://learn.microsoft.com/azure/foundry/concepts/architecture).

## 5. Approved checkpoints

| Checkpoint | Expected result | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|---|
| Day 5 | Reviewed charter, or explicit changes-required/needs-review disposition |  |  |  |  |
| Week 1 | Skills/environment confirmed, working spike, ≥10 planned cases, initial evaluator result |  |  |  |  |
| Week 2 | Controls/quality iteration, same-case rerun, final result, OTel evidence, trade-off note |  |  |  |  |
| Week 2–3 | README/diagram/plans complete, rehearsal and fallback complete |  |  |  |  |
| Demo day | Shared ~10-minute presentation/demo + ~5-minute Q&A/coaching |  |  |  | Exact date TBD |

## 6. Demo handoff

| Readiness question | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|
| Can the team state the user problem and non-goals in under one minute? |  |  |  |  |
| Does the diagram distinguish product resources from the five-layer lens? |  |  |  |  |
| Does the live path show one useful outcome and one failure/control outcome? |  |  |  |  |
| Are initial/final evaluator results and one trace legible and labeled? |  |  |  |  |
| Are recorded, synthetic, expected, and live observations labeled honestly? |  |  |  |  |
| Does each attendee have a linked 30-day plan? |  |  |  |  |
| Does the story fit ~10 minutes, leaving ~5 minutes for Q&A/coaching? |  | Rehearsal timing: |  |  |

## Current disposition

| Field | Entry |
|---|---|
| Disposition | ☐ In progress ☐ Blocked by evidence ☐ Ready to rehearse ☐ Rehearsed—known gaps retained |
| Decision owner |  |
| Evidence/link |  |
| Status |  |
| Open failures / residual risks |  |
| Next action and due date |  |

“Ready to rehearse” and “rehearsed” are delivery states, not production
readiness claims.
