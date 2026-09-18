---
title: Evaluation in Production
subtitle: Connect curated tests, sampled traffic, scheduled checks, and accountable gates
eyebrow: DAY 5 · MODULE 6 · 20 MIN
tag: Day 5 · Module 6
deck: module-6-production-evaluation.pptx
---

# Module 6 — Evaluation in Production

## Evaluation in Production
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/agent-framework/agents/evaluation -->
<!-- notes: This module turns evaluation into an operating loop rather than a one-time score. Use the presenter-prepared ten-case evidence; attendees do not need to have completed Day 4 or produced a harness result. Emphasize that monitoring, tracing, and evaluation answer related but different questions. -->

- Production confidence comes from repeatable evidence, explicit decisions, and an owner for what happens next

## The evaluation contract: six nouns
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Define every noun before discussing dashboards. A dataset is a reusable collection; each test case contains an input and relevant context; ground truth is a reviewed expected answer or action where required. An evaluator produces a score or label, and a threshold turns that result into an application decision—none of those objects is automatically interchangeable with another. -->

1. **Dataset** — Reusable collection of representative cases
2. **Test case** — One input, context, and expected behavior
3. **Ground truth** — Reviewed expected answer or action when required
4. **Evaluator** — Criteria applied to compatible data
5. **Score** — Output on that evaluator's documented scale
6. **Threshold** — Explicit rule that maps evidence to a decision

## Deterministic and judge checks complement each other
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation | https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Deterministic checks are fast and repeatable for facts, schemas, exact tool paths, and policy rules. Judge-based checks can assess nuanced quality but introduce model, prompt, scale, threshold, cost, and variance considerations. Do not average unlike raw scales: preserve each evaluator's score, threshold, version, and pass rule before aggregating pass rates. -->

- **Deterministic checks**
  - Exact fields, required facts, schemas, and expected actions
  - Repeatable and inexpensive; checks encoded behavior
  - Fail clearly when required data is absent
- **Judge-based checks**
  - Nuanced relevance, completeness, adherence, and satisfaction
  - Model-assisted; record judge, prompt/rubric, scale, and threshold
  - Different evaluators can use binary, 1–5, 0–1, or custom scales

## Two independent evaluation axes
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators | https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators | https://learn.microsoft.com/azure/foundry/observability/how-to/cloud-evaluation -->
<!-- notes: System versus process identifies what aspect is judged; turn versus conversation identifies how much interaction is scored. They are independent axes, so a conversation-level system evaluator and a turn-level process evaluator can both be useful when supported. Successful tool execution does not prove that the final answer completed the task, and a good final answer does not prove the path was safe or efficient. -->

| Axis | First choice | Second choice | Question answered |
|---|---|---|---|
| What is judged? | System outcome | Process steps | Did it finish well, and did it act well? |
| How much is scored? | One turn | Whole conversation | One response, or the multi-turn interaction? |

## Three loops; two kinds of change
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/agent-framework/agents/evaluation -->
<!-- notes: Offline evaluation reruns a stable set around a proposed change. Continuous evaluation samples eligible production interactions, while scheduled evaluation reruns selected data over time; sampling can miss traffic and is not an inline safety gate. Call a change relative to a baseline a regression; call a distribution or behavior change observed over time drift, then segment the evidence before attributing a cause. -->

- **Offline loop** — Compare a candidate with a stable dataset and baseline
- **Sampled loop** — Evaluate an eligible subset of production interactions
- **Scheduled loop** — Rerun a dataset over time to expose change
- **Regression** — Worse behavior relative to an accepted baseline or change
- **Drift** — Traffic, data, or behavior changes over time

## Required evidence fails closed
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/cloud-evaluation | https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This acceptance table is workshop gate logic built on documented outputs, not a Microsoft-provided universal CI policy. Only a completed required result that satisfies its own evaluator-specific threshold can contribute a pass. Preflight evaluator/data mapping, turn-or-conversation level, target, and tool compatibility; missing, errored, or unsupported evidence blocks acceptance rather than disappearing from the denominator. -->

| Required result | Workshop gate treatment | Reason |
|---|---|---|
| Complete + meets its own threshold | Eligible to pass | Required evidence exists |
| Complete + below threshold | Block | Quality requirement failed |
| Missing | Block | No decision evidence |
| Error | Block | Evaluation did not complete |
| Unsupported | Block | Evaluator/data/tool combination is invalid |

## DEMO 6.1 — A regression blocks acceptance
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day5/module-6-demo-1-regression-gate.md -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/evaluation | https://learn.microsoft.com/azure/foundry/observability/how-to/cloud-evaluation | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets -->
<!-- notes: Run the self-contained local workshop gate over the runbook's presenter-prepared synthetic snapshot; there is no cloud wait and no Day 4 dependency. First show a candidate whose tools succeed but one required answer fact regresses, then show missing/error/unsupported evidence blocking a second candidate. State plainly that the wrapper is workshop logic interpreting evaluation outputs, not a built-in certification gate. -->

Apply a local acceptance rule to a ten-case synthetic baseline and candidate. A required-fact regression blocks one candidate despite passing process checks. Missing, errored, or unsupported required evidence blocks the other.

## Close the loop with compatible evidence
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/observability | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Ask who owns triage, who can change the prompt/model/tool, and who accepts residual risk. Retain dataset version, target version, evaluator configuration, raw results, normalized decision, and failing cases; then change one thing and rerun. The capstone's ten cases are a workshop minimum for starting this discipline—not Microsoft certification, statistical sufficiency, or production-readiness proof. -->

- Match evaluator requirements to the data shape, evaluation level, target, and tool types before running.
- Keep offline regression, sampled production evaluation, and scheduled drift checks as complementary loops.
- Preserve raw scores and evaluator-specific thresholds; aggregate decisions only after normalization.
- Treat missing, errored, and unsupported required evidence as blockers—not passes.
- Ten capstone cases are a **workshop minimum**, not certification or proof of production readiness.
