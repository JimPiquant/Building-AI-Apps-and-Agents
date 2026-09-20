# Module 5 · Demo 1 — A regression blocks acceptance

## Objective

Apply a small, local **workshop-owned** acceptance rule to presenter-prepared
synthetic evaluation evidence. Show two independent block reasons:

1. a required final-answer fact regresses even though process checks pass; and
2. required evidence is missing, errored, or unsupported.

The wrapper demonstrates how a team might interpret documented evaluation
outputs. It is not a Microsoft-provided CI gate, certification, or universal
threshold.

## Placement and time

- **Placement:** after slide 6, "Required evidence fails closed"
- **Time:** 5 minutes total
  - 0:00–0:40 — orient to the ten-case snapshot
  - 0:40–1:40 — inspect the failing case and evaluator scales
  - 1:40–3:10 — run the local workshop gate
  - 3:10–4:20 — explain regression and unavailable evidence
  - 4:20–5:00 — assign the next action and owner

## Prerequisites

- A terminal with `python3`; no packages are required.
- This runbook open beside the terminal.
- No Azure credentials, network access, CI service connection, live agent,
  cloud evaluation, or Day 4 harness output.
- Treat every result below as presenter-prepared synthetic evidence modeled for
  teaching, not as an observed Foundry run.

## Exact setup

1. Open a terminal at any working directory. The command writes no files.
2. Increase the font so all block reasons are visible.
3. Copy the entire command below, but wait for the demo marker before running
   it.
4. Keep the evidence and expected-output sections ready as the no-terminal
   fallback.

```bash
python3 - <<'PY'
requirements = {
    "required_facts": 1.00,
    "task_completion": 0.90,
    "tool_call_success": 1.00,
    "tool_output_utilization": 0.90,
}

baseline = {
    "required_facts": {"status": "complete", "pass_rate": 1.00},
    "task_completion": {"status": "complete", "pass_rate": 0.90},
    "tool_call_success": {"status": "complete", "pass_rate": 1.00},
    "tool_output_utilization": {"status": "complete", "pass_rate": 1.00},
}

candidates = {
    "candidate_clean": {
        "required_facts": {"status": "complete", "pass_rate": 1.00},
        "task_completion": {"status": "complete", "pass_rate": 0.90},
        "tool_call_success": {"status": "complete", "pass_rate": 1.00},
        "tool_output_utilization": {"status": "complete", "pass_rate": 1.00},
    },
    "candidate_regression": {
        "required_facts": {"status": "complete", "pass_rate": 0.90},
        "task_completion": {"status": "complete", "pass_rate": 0.90},
        "tool_call_success": {"status": "complete", "pass_rate": 1.00},
        "tool_output_utilization": {"status": "complete", "pass_rate": 1.00},
    },
    "candidate_evidence_gap": {
        "required_facts": {"status": "complete", "pass_rate": 1.00},
        # task_completion is deliberately missing
        "tool_call_success": {"status": "error"},
        "tool_output_utilization": {"status": "unsupported"},
    },
}

def workshop_gate(candidate):
    blockers = []
    for metric, minimum in requirements.items():
        result = candidate.get(metric)
        if result is None:
            blockers.append(f"{metric}: missing")
            continue
        if result.get("status") != "complete":
            blockers.append(f"{metric}: {result.get('status', 'missing')}")
            continue
        rate = result.get("pass_rate")
        if not isinstance(rate, (int, float)):
            blockers.append(f"{metric}: score missing")
            continue
        if rate < minimum:
            blockers.append(
                f"{metric}: pass_rate {rate:.2f} < threshold {minimum:.2f}"
            )
        baseline_rate = baseline[metric]["pass_rate"]
        if rate < baseline_rate:
            blockers.append(
                f"{metric}: regression from {baseline_rate:.2f} to {rate:.2f}"
            )
    return blockers

print("LOCAL WORKSHOP GATE — INTERPRETS SYNTHETIC EVIDENCE")
for name, candidate in candidates.items():
    blockers = workshop_gate(candidate)
    print(f"\n{name}: {'BLOCK' if blockers else 'ACCEPT'}")
    for blocker in blockers:
        print(f"  - {blocker}")
PY
```

## Provided synthetic evidence

**Evidence label:** presenter-prepared synthetic snapshot. It represents a
baseline and candidates evaluated over the same ten workshop cases.

Ten cases are used because that is the capstone's **workshop minimum**. Ten
cases are not a Microsoft certification requirement, a claim of statistical
power, or proof of production readiness.

| Required metric | Check type and native interpretation | Baseline | Regression candidate | Workshop rule |
|---|---|---:|---:|---|
| `required_facts` | Deterministic Boolean per case | 10/10 pass | 9/10 pass | 10/10 and no baseline drop |
| `task_completion` | Judge result; binary after its own evaluator rule | 9/10 pass | 9/10 pass | At least 9/10 and no baseline drop |
| `tool_call_success` | Process result; binary per case | 10/10 pass | 10/10 pass | 10/10 and no baseline drop |
| `tool_output_utilization` | Process result; use its own documented rule | 10/10 pass | 10/10 pass | At least 9/10 and no baseline drop |

Raw evaluator outputs remain attached to the evidence. The local wrapper uses
normalized per-case pass rates only **after** each evaluator applies its own
scale and threshold. It never compares a raw 1–5 score directly with a 0–1
score or with a Boolean.

**Failing regression case**

| Field | Baseline | Candidate |
|---|---|---|
| Case | `c07` — sustained 429 response guidance | Same input |
| Ground truth | Must contain `Sev2` and `Retry-After` | Same reviewed expectation |
| Final answer | Contains both required facts | Contains `Sev2`; omits `Retry-After` |
| Tool execution | All required calls complete | All required calls complete |
| Deterministic result | Pass | **Fail** |
| Task Completion judge | Pass | Pass |

The judge and deterministic check disagree. That is evidence to inspect, not a
reason to discard either result. Under this stated policy, the required-fact
failure blocks acceptance.

**Evidence-gap candidate**

- `task_completion`: result is missing.
- `tool_call_success`: evaluation status is `error`.
- `tool_output_utilization`: `unsupported` because this synthetic candidate's
  recorded tool/data shape is incompatible with that required evaluator.
- The output is not counted as zero, ignored, or treated as a pass; the gate
  names all three unavailable results and blocks.

## Actions and narration

### 1. Orient to the contract (0:00–0:40)

Point across the evidence table.

**Say:**

> "This is a reusable ten-case dataset. Each row has a test case, reviewed
> ground truth where needed, an evaluator, its native result, and a threshold.
> The pass rate shown here is a normalized decision, not a shared raw scale."

### 2. Inspect the failing case (0:40–1:40)

Point to case `c07`.

**Say:**

> "Every required tool call succeeds, but the answer omits `Retry-After`.
> Process success does not establish system completion. The deterministic check
> fails while the judge passes, so our explicit required-fact rule decides this
> high-value case."

State that system/process and turn/conversation are different axes; this case
uses a final-turn system check plus process evidence from the same interaction.

### 3. Run the local gate (1:40–3:10)

Run the staged command.

Expected output:

```text
LOCAL WORKSHOP GATE — INTERPRETS SYNTHETIC EVIDENCE

candidate_clean: ACCEPT

candidate_regression: BLOCK
  - required_facts: pass_rate 0.90 < threshold 1.00
  - required_facts: regression from 1.00 to 0.90

candidate_evidence_gap: BLOCK
  - task_completion: missing
  - tool_call_success: error
  - tool_output_utilization: unsupported
```

**Say:**

> "The clean candidate demonstrates the rule can accept. The next candidate is
> blocked by a measured regression. The last one is blocked because required
> evidence never became valid. This Python function is our workshop policy—not
> a built-in Foundry CI decision."

### 4. Explain the compatibility preflight (3:10–4:20)

**Say:**

> "Before scheduling any evaluator, confirm its required fields, turn or
> conversation level, target, and supported tool types. Unsupported is not a
> low quality score; it means this evaluator cannot supply the required
> evidence for this data."

Also distinguish the operating loops:

- Offline: compare this candidate with the baseline before acceptance.
- Sampled production: inspect a subset of eligible real interactions.
- Scheduled: rerun selected data over time.
- Regression: the candidate fell below its baseline.
- Drift: the traffic, data, or behavior changes over time; investigate segments
  before assigning a cause.

### 5. Close with ownership (4:20–5:00)

**Say:**

> "The owner now inspects `c07`, changes one thing, reruns the same versioned
> set, and retains both results. A separate owner must resolve the incompatible
> evaluator or choose a supported alternative. Nothing passes because evidence
> vanished."

## Expected observations

- A successful tool trajectory can coexist with an incomplete final answer.
- Deterministic and judge checks can disagree because they encode different
  criteria and limitations.
- Raw evaluator scales are not interchangeable; thresholds belong to the
  evaluator and use case.
- A regression is relative to a baseline. Drift is change over time and does
  not, by itself, identify a cause.
- Missing, errored, and unsupported required results all block this workshop
  gate.
- Compatibility across evaluator, data mapping, evaluation level, target, and
  tool type must be checked before results are trusted.
- Ten cases satisfy this workshop's capstone minimum only; they do not certify
  the system.

## Fallback

If `python3` is unavailable or the terminal cannot be displayed, show the
expected-output block directly. Walk the audience through the three decisions
in order: ACCEPT proves the rule has a positive path; BLOCK identifies the
regression; BLOCK names missing/error/unsupported evidence.

Do not start a cloud evaluation as a fallback. Do not wait for a portal run.
The supplied snapshot and expected output are the authoritative demo evidence.

## Cleanup

- The command creates no files, datasets, cloud runs, CI connections, or Azure
  resources.
- Close the terminal and return to slide 8.
- Retain no attendee or customer content; the request, scores, and identifiers
  are synthetic.

## Official sources

- [Observability in generative AI](https://learn.microsoft.com/azure/foundry/concepts/observability)
- [MAF evaluation](https://learn.microsoft.com/agent-framework/agents/evaluation)
- [Cloud evaluation with the Foundry SDK](https://learn.microsoft.com/azure/foundry/observability/how-to/cloud-evaluation)
- [Evaluation datasets in Foundry](https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets)
- [Built-in evaluators](https://learn.microsoft.com/azure/foundry/concepts/built-in-evaluators)
- [Agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)
