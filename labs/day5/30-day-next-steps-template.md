# Personalized 30-day next-steps plan

Complete one copy **per attendee**. Team deliverables do not replace an
individual plan. Choose actions that extend observed capstone evidence or close
an explicitly owned gap; do not add deployment merely to satisfy Day 5,
because deployment is not a Day 5 deliverable.

## Plan header

| Field | Entry |
|---|---|
| Attendee / owner |  |
| Team / capstone |  |
| Role or capability focus |  |
| Plan start date |  |
| Day 30 date |  |
| Manager/peer/coach |  |
| Capstone README |  |
| Evidence baseline |  |

### Status vocabulary

Use **Proposed**, **In progress**, **Not yet observed**, **Evidence captured**,
**Reviewed**, **Blocked**, or **Done**. “Done” requires the evidence/link named
in the row; it is not a general readiness claim.

## 1. Personal baseline

| Prompt | Response | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Skill or practice I can demonstrate now |  |  |  |  |
| Evidence I personally produced or interpreted |  |  |  |  |
| Highest-priority gap |  |  |  |  |
| Dependency outside my control |  |  |  |  |
| Product/preview/region/support boundary to verify |  |  |  |  |

## 2. Three 30-day outcomes

Write observable outcomes, not activities. “Read tracing docs” is an activity;
“annotate a retained trace and identify the slow/failed operation” is an
outcome.

| Priority | Observable personal outcome by Day 30 | Acceptance rule | Evidence/link | Owner | Status |
|---:|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |

## 3. Action plan

| Window | Action | Outcome served | Evidence to retain | Owner | Dependency / reviewer | Status |
|---|---|---|---|---|---|---|
| **Days 1–7** |  |  |  |  |  |  |
| **Days 1–7** |  |  |  |  |  |  |
| **Days 8–14** |  |  |  |  |  |  |
| **Days 8–14** |  |  |  |  |  |  |
| **Days 15–21** |  |  |  |  |  |  |
| **Days 15–21** |  |  |  |  |  |  |
| **Days 22–30** |  |  |  |  |  |  |
| **Days 22–30** |  |  |  |  |  |  |

Possible evidence-shaped actions:

- review one OTel trace and correlate its model/tool/retrieval operations;
- add or review a permission-denied or unsupported-answer case;
- expand a golden set from the ten-case teaching minimum using reviewed user
  failures;
- rerun the same evaluator configuration after one change and retain the
  initial/final result;
- document a latency/cost/quality trade-off with units and assumptions; or
- verify a model, region, runtime, permission, or preview boundary in official
  documentation and the target environment.

## 4. Baseline-to-candidate learning loop

| Field | Entry | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Baseline configuration and result |  |  |  |  |
| One change I will own |  |  |  |  |
| Cases/evaluator settings held constant |  |  |  |  |
| Candidate result |  |  |  |  |
| What improved, regressed, or stayed unknown |  |  |  |  |
| Decision / next experiment |  |  |  |  |

## 5. Failure case and control follow-through

| Failure case/test condition | Control/enforcement point to verify | Expected outcome | Evidence needed | Owner | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

Remember: the failure case is the test condition; the control is the chosen
behavior. Writing the control in this plan does not show that it works.

## 6. Check-ins

| Checkpoint | Date | Reviewer | Evidence/link | Status | Decision / next action |
|---|---|---|---|---|---|
| Week 1 |  |  |  |  |  |
| Week 2 |  |  |  |  |  |
| Week 3 |  |  |  |  |  |
| Day 30 review |  |  |  |  |  |

## 7. Day 30 reflection

| Prompt | Response | Owner | Evidence/link | Status |
|---|---|---|---|---|
| Strongest new evidence |  |  |  |  |
| Assumption disproved or refined |  |  |  |  |
| Open failure, risk, or unsupported surface |  |  |  |  |
| Practice to adopt with my team |  |  |  |  |
| Next 30-day outcome |  |  |  |  |

## Product concepts versus workshop policy

Use official Microsoft documentation when an action depends on a product
concept or supported surface:

- [MAF agent concepts](https://learn.microsoft.com/agent-framework/concepts/agents/)
- [MAF workflow concepts](https://learn.microsoft.com/agent-framework/concepts/workflows/)
- [Agent tracing](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
- [Evaluation datasets](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets)
- [Agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)

The requirement to include a personalized 30-day plan, like the capstone team
size, evidence minimums, demo format, dates, and no-deployment boundary, is
workshop policy from [`docs/day5-plan.md`](../../docs/day5-plan.md)—not a
Microsoft product requirement.

Attendee/owner: ____________________

Reviewer/coach: ____________________

Day 30 review date: ____________________
