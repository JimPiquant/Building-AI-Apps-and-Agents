# Capstone shared demo-day guide

**Window:** 2–3 weeks after the September 21, 2026 kickoff

**Exact date:** **TBD**; organizer/confirmation owner: ____________________

**Team format:** approximately 15 minutes total—about 10 minutes for the
presentation/demo and 5 minutes for Q&A and coaching

This is a shared learning review with no competitive ranking. It has no
deployment demonstration requirement. Multi-agent systems are welcome but not
mandatory.

## What the audience should learn

By the end of the team's slot, the audience should be able to answer:

1. Which user problem and bounded task did the team choose?
2. Why is the chosen agent/workflow and grounding shape the simplest useful
   design?
3. What changed from baseline to candidate on the same cases?
4. What did the trace, evaluator, failure case, and cost/latency evidence
   actually establish—and what remains unknown?
5. What will each attendee do in the next 30 days?

## Suggested 10-minute presentation/demo

| Time | Segment | Show | Owner | Evidence/link | Status |
|---:|---|---|---|---|---|
| 0:00–1:00 | Problem and scope | User, bounded task, desired outcome, and one explicit non-goal |  |  |  |
| 1:00–3:00 | Architecture and choices | Actual component diagram; agent versus workflow choice; model, action, and knowledge boundaries |  |  |  |
| 3:00–6:00 | Useful path + failure path | One end-to-end outcome, then one failure case and its selected control |  |  |  |
| 6:00–8:00 | Baseline versus candidate | Same ≥10 planned cases; captured initial/final Foundry evaluator results; per-case failure |  |  |  |
| 8:00–9:00 | Operations evidence | One OTel trace plus identity/safety/cost/latency observation and limitation |  |  |  |
| 9:00–10:00 | Decision and next steps | Trade-off, unresolved risk, README/architecture links, and individual 30-day actions |  |  |  |

Keep setup, sign-in, provisioning, permission changes, and deployment out of
the live slot.

## Required evidence board

| Item | What must be legible | Owner | Evidence/link | Status | Honest limitation to state |
|---|---|---|---|---|---|
| Architecture | MAF agent/runtime, Foundry model, tool boundary, knowledge path, ops evidence, identities/trust boundaries |  |  |  |  |
| Golden set | Dataset/version and at least 10 planned case IDs/categories |  |  |  | Ten cases are a workshop minimum |
| Initial/final evaluator result | Evaluator, settings, run IDs, score/labels, failed/error cases |  |  |  | Scale/threshold/support boundaries |
| OTel trace | Trace/run ID, relevant operations, duration/status, stop/failure path |  |  |  | Trace does not prove quality |
| Failure/control | Test condition, enforcement point, expected and observed outcome |  |  |  | Diagram/checklist does not prove execution |
| Cost/latency | Units, scope, assumptions, and quality condition |  |  |  | No universal saving claim |
| README + individual plans | Design/evaluation story and one 30-day plan per attendee |  |  |  | Open risks remain visible |

## Rehearsal and fallback checklist

| Check | Owner | Evidence/link | Status | Gap / next action |
|---|---|---|---|---|
| Rehearsal finishes the presentation/demo in ≤10 minutes |  | Timing record: |  |  |
| Every team member has a speaking or evidence-owner role |  | Run of show: |  |  |
| Demo uses bounded inputs and no customer secrets or personal data |  | Review note: |  |  |
| Exact model/runtime/dataset/evaluator versions are available |  | Manifest/note: |  |  |
| Captured fallback covers the same teaching payoff as the live path |  | Capture: |  |  |
| Capture is genuine and dated; synthetic/expected material is labeled |  | Label review: |  |  |
| Failure, error, and unsupported evaluator results remain visible |  | Results: |  |  |
| Presenter can return to the evidence board without troubleshooting live |  | Navigation plan: |  |  |

### If the live path fails

1. Stop after one bounded retry; do not spend the slot debugging.
2. State what failed and whether it is app, identity, model, tool, retrieval,
   telemetry, or evaluator evidence.
3. Switch to the genuine dated capture.
4. Say explicitly **recorded**, **synthetic**, or **expected** as applicable.
5. Preserve the intended comparison and limitation; never narrate a capture as
   a live cloud result.

## Five-minute Q&A and coaching

The facilitator selects questions that test evidence, not polish:

- **Agent vs workflow:** What specifically required explicit control flow? If
  nothing did, why not keep one agent?
- **Grounding:** Which retrieved evidence supports the answer? Is this a
  Foundry IQ knowledge base/source design or custom RAG?
- **Criteria vs tasks:** Which observable criterion did the implementation
  task satisfy?
- **Baseline vs candidate:** What stayed fixed, what changed, and can the delta
  be attributed?
- **Failure vs control:** Which test condition fired, where was the control
  enforced, and what retained evidence shows the outcome?
- **Residual risk:** What remains proposed, unsupported, failed, or not yet
  observed?

### Coaching record

| Feedback / question | Team response or decision | Follow-up owner | Evidence needed | Status / due |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Product concepts versus workshop format

The technical vocabulary comes from official Microsoft documentation:

- [MAF agents](https://learn.microsoft.com/agent-framework/concepts/agents/)
  and [workflows](https://learn.microsoft.com/agent-framework/concepts/workflows/)
- [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq)
  and [RAG](https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation)
- [Evaluation datasets](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets)
  and [agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)
- [Agent tracing](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)

The 2–3-person teams, ~15-minute slot, no ranking, evidence minimums,
no-deployment boundary, and 2–3-week/TBD schedule are workshop policy from
[`docs/day5-plan.md`](../../docs/day5-plan.md).

## Demo disposition

| Field | Entry |
|---|---|
| Presentation/demo owner |  |
| Q&A/evidence owner |  |
| Rehearsal date and duration |  |
| Evidence/link |  |
| Status |  |
| Known gaps stated on-slide |  |
| Final go/no-go owner |  |

A successful workshop demo is not a production-readiness certification.
