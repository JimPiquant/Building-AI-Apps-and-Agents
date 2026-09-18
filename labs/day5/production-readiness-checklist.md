# Optional production-readiness evidence checklist

**Time:** 30 minutes, outside the Day 5 live agenda

**Mode:** Read and record; no coding, commands, provisioning, deployments, or
permission changes

**Starting point:** Your capstone candidate **or** the complete synthetic
[`evidence-pack.md`](evidence-pack.md); no prior lab or environment required

> This is an evidence-review aid, not a Microsoft standard, release gate,
> security review, certification, or claim of production readiness. A checked
> row proves nothing beyond the recorded evidence. Use **Not yet observed**
> when a control has not actually been exercised.

## Review header

| Field | Value |
|---|---|
| System/scenario |  |
| Reviewer(s) |  |
| Review date |  |
| Evidence source | ☐ Synthetic reference pack ☐ Candidate system ☐ Mixed |
| Evidence window/version |  |
| Decision owner |  |

### Status vocabulary

Use one value in every Status cell:

- **Observed** — retained evidence shows the stated outcome.
- **Proposed** — design or control is planned but not exercised.
- **Not yet observed** — no sufficient evidence exists.
- **Blocked** — evidence is required but unavailable, errored, or unsupported.
- **Not applicable** — include a written rationale; do not use for a required
  capstone element.

## 1. Select the system and evidence — 3 minutes

| ID | Review question | Status | Evidence/link | Owner | Gap / next action |
|---|---|---|---|---|---|
| S-01 | Is the scenario and user boundary named? |  |  |  |  |
| S-02 | Is each artifact labeled observed, proposed, or synthetic? |  |  |  |  |
| S-03 | Are version, time window, and environment recorded where they affect interpretation? |  |  |  |  |

## 2. Observability and evaluation — 8 minutes

| ID | Review question | Status | Evidence/link | Owner | Gap / next action |
|---|---|---|---|---|---|
| O-01 | Can one request be correlated across agent/model, retrieval, tool, and workflow operations using trace/run identifiers? |  |  |  |  |
| O-02 | Does the trace identify duration, status, and the failed or skipped step without claiming to expose private model reasoning? |  |  |  |  |
| O-03 | Are prompt, response, tool argument/result, and attribute capture minimized or redacted, with access/retention ownership named? |  |  |  |  |
| E-01 | Is the reusable case set/version named, including expected behavior or reviewed ground truth? |  |  |  |  |
| E-02 | Is each evaluator's supported input, scale/label, threshold, and limitation recorded? |  |  |  |  |
| E-03 | Were baseline and candidate run on the same documented cases and evaluator settings, with initial/final results retained? |  |  |  |  |
| E-04 | Does an unavailable, errored, or unsupported required evaluation block acceptance rather than become a pass? |  |  |  |  |
| E-05 | Is outcome quality checked separately from tool/process success? |  |  |  |  |

Checkpoint: write one sentence naming the strongest evidence and one sentence
naming what the evidence **does not** establish.

## 3. Identity and safety — 8 minutes

| ID | Review question | Status | Evidence/link | Owner | Gap / next action |
|---|---|---|---|---|---|
| I-01 | Is the actual principal named at each model, tool, knowledge, state, and telemetry connection? |  |  |  |  |
| I-02 | Are required role/action and scope recorded separately for each boundary? |  |  |  |  |
| I-03 | Does a denied-access case verify the downstream enforcement point—including document access where relevant? |  |  |  |  |
| I-04 | Are tool approval, OAuth consent, and downstream authorization treated as separate decisions? |  |  |  |  |
| R-01 | Is there a test for unsafe direct input and a named serving-time/application response? |  |  |  |  |
| R-02 | Is retrieved/tool content treated as untrusted input, with an indirect-injection case? |  |  |  |  |
| R-03 | Does an unsupported question produce an evidence-limited response or an explicitly owned review path? |  |  |  |  |
| R-04 | Are detection, filtering/enforcement, offline evaluation, and authorization recorded separately? |  |  |  |  |

Checkpoint: for one negative case, write **failure case → control/enforcement
point → expected outcome → retained evidence**.

## 4. Cost and latency — 8 minutes

| ID | Review question | Status | Evidence/link | Owner | Gap / next action |
|---|---|---|---|---|---|
| C-01 | Is end-to-end latency separated from model, retrieval, and tool timing? |  |  |  |  |
| C-02 | Are model/version, input/output/cache usage, repetitions, and pricing assumptions retained with any monetary estimate? |  |  |  |  |
| C-03 | Is cost interpreted with task success (for example, cost per successful case), not token count alone? |  |  |  |  |
| C-04 | Are revision/turn, token, elapsed-time, and tool-call bounds named independently? |  |  |  |  |
| C-05 | Is one managed-routing, application-escalation, prompt-cache, or response-cache trade-off framed as a hypothesis to evaluate—not a guaranteed saving? |  |  |  |  |
| C-06 | Are telemetry, retrieval, and evaluator overhead included in the operating-cost discussion? |  |  |  |  |

Checkpoint: record the baseline, one proposed change, the metric/unit, and the
quality condition that prevents a cheaper but worse candidate from passing.

## 5. Prioritize three next actions — 3 minutes

| Priority | Action | Current status | Evidence needed to close | Owner | Due/checkpoint |
|---:|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |

## Review disposition

| Field | Entry |
|---|---|
| Disposition | ☐ Evidence review complete—gaps remain ☐ Changes required ☐ Blocked pending evidence |
| Decision and rationale |  |
| Residual risks / unknowns |  |
| Decision owner |  |
| Evidence/link |  |
| Status |  |
| Next review date |  |

“Evidence review complete” is deliberately **not** “production ready.”

## Concept references

- [Agent tracing overview](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
- [Evaluation datasets](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets)
- [Agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)
- [Foundry authentication and authorization](https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry)
- [RAG evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators)
- [Evaluate model routing for a workload](https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router)
