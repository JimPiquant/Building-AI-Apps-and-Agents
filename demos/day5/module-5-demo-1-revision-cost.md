# Module 5 · Demo 1 — Read the cost of another revision

## Objective

Use presenter-prepared synthetic evidence to compare two bounded executions of
the same request. Read outcome quality, first-visible time, workflow completion,
token usage, an explicitly illustrative currency estimate, and the stop reason
together. The point is a defensible trade-off—not a savings claim.

This demo does **not** deploy or call a model router, create a model deployment,
submit a batch job, wait for a cloud evaluation, or depend on Day 4 lab output.

## Placement and time

- **Placement:** after slide 7, "Batch is a separate lane"
- **Time:** 5 minutes total
  - 0:00–0:30 — frame the request and evidence
  - 0:30–1:30 — replay the local calculator
  - 1:30–3:15 — compare latency, usage, and outcome
  - 3:15–4:30 — interpret cost per successful outcome
  - 4:30–5:00 — name the stop policy and transition

## Prerequisites

- A terminal with `python3` available; no packages are required.
- This runbook open beside the terminal at a readable zoom.
- No Azure subscription, credentials, network access, attendee files, or prior
  workshop lab completion.
- Rehearse from the evidence below. It is intentionally synthetic and must not
  be described as telemetry observed from Azure or from a specific model.

## Exact setup

1. Open a terminal at any working directory. The command writes no files.
2. Increase the terminal font until one result line remains readable.
3. Copy the complete command below, but do not run it until the demo marker.
4. Keep the "Provided synthetic evidence" table visible as the fallback.

```bash
python3 - <<'PY'
rates = {
    "uncached_input_usd_per_1m": 2.00,
    "cached_input_usd_per_1m": 1.00,
    "output_usd_per_1m": 8.00,
}
runs = [
    {
        "name": "draft_only",
        "input_tokens": 2000,
        "cached_input_tokens": 0,
        "output_tokens": 300,
        "first_visible_seconds": 1.1,
        "completion_seconds": 4.6,
        "successes": 0,
    },
    {
        "name": "one_revision",
        "input_tokens": 3400,
        "cached_input_tokens": 600,
        "output_tokens": 550,
        "first_visible_seconds": 1.2,
        "completion_seconds": 8.9,
        "successes": 1,
    },
]

print("ILLUSTRATIVE WORKSHOP FIGURES — NOT AZURE PRICING OR OBSERVED TELEMETRY")
for run in runs:
    uncached = run["input_tokens"] - run["cached_input_tokens"]
    estimated_usd = (
        uncached * rates["uncached_input_usd_per_1m"]
        + run["cached_input_tokens"] * rates["cached_input_usd_per_1m"]
        + run["output_tokens"] * rates["output_usd_per_1m"]
    ) / 1_000_000
    tokens = run["input_tokens"] + run["output_tokens"]
    outcome = "PASS" if run["successes"] else "FAIL"
    per_success = (
        f"USD {estimated_usd:.4f}"
        if run["successes"]
        else "undefined (0 successes)"
    )
    print(
        f"{run['name']:12} | outcome={outcome} | "
        f"first_visible={run['first_visible_seconds']:.1f} s | "
        f"complete={run['completion_seconds']:.1f} s | "
        f"tokens={tokens} | estimated_cost=USD {estimated_usd:.4f} | "
        f"cost/success={per_success}"
    )
PY
```

## Provided synthetic evidence

**Evidence label:** workshop-only synthetic example. Currency estimates use the
illustrative rate card below; they are not Azure prices, quotes, forecasts, or
guarantees.

**Same request in both runs**

> A Premium customer has received sustained 429 responses for 15 minutes.
> State the incident severity and the client change we should recommend.

**Deterministic acceptance rule**

- The answer must contain both `Sev2` and `Retry-After`.
- The check is case-sensitive only in this display; a real harness should
  normalize deliberately.

| Evidence | Draft only: revision cap 0 | One revision: revision cap 1 |
|---|---:|---:|
| Required facts found | `Sev2` only — **FAIL** | `Sev2` + `Retry-After` — **PASS** |
| Model calls | 3 calls | 5 calls |
| Tool calls | 2 calls | 3 calls |
| Input tokens | 2,000 tokens | 3,400 tokens |
| Cached input subset | 0 tokens | 600 tokens |
| Output tokens | 300 tokens | 550 tokens |
| First visible application output | 1.1 seconds from request start | 1.2 seconds from request start |
| Workflow completion | 4.6 seconds from request start | 8.9 seconds from request start |
| Stop reason | Revision budget exhausted | Required-fact check passed |

**Illustrative rate card used only by this demo**

| Category | Illustrative unit rate |
|---|---:|
| Uncached input | USD 2.00 per 1,000,000 tokens |
| Cached input | USD 1.00 per 1,000,000 tokens |
| Output | USD 8.00 per 1,000,000 tokens |

The estimate excludes retrieval, tools, evaluator calls, telemetry ingestion,
storage, hosting, taxes, negotiated pricing, and every other service charge.
`cached_input_tokens` is a subset of input tokens, not an additional token
count.

## Actions and narration

### 1. Frame the comparison (0:00–0:30)

**Say:**

> "These are presenter-prepared synthetic runs of the same case. The only
> policy change is whether one revision is allowed. Every number has a unit;
> the dollar rate card is illustrative, not Azure pricing."

Point to the deterministic acceptance rule before showing any cost.

### 2. Replay the calculator (0:30–1:30)

Run the staged command.

Expected output:

```text
ILLUSTRATIVE WORKSHOP FIGURES — NOT AZURE PRICING OR OBSERVED TELEMETRY
draft_only   | outcome=FAIL | first_visible=1.1 s | complete=4.6 s | tokens=2300 | estimated_cost=USD 0.0064 | cost/success=undefined (0 successes)
one_revision | outcome=PASS | first_visible=1.2 s | complete=8.9 s | tokens=3950 | estimated_cost=USD 0.0106 | cost/success=USD 0.0106
```

**Say:**

> "Tokens are the measured usage input. Dollars appear only after this
> explicit, hypothetical rate card is applied."

### 3. Separate responsiveness from completion (1:30–2:15)

Point to `first_visible` and then `complete`.

**Say:**

> "The first visible output changes little, but the workflow finishes later
> because another retrieval and revision occur. First-token responsiveness and
> completion are different. Two isolated runs tell us nothing about
> throughput."

The evidence uses application-level first-visible time. Do not relabel it as a
model deployment's Azure Monitor TTFT metric.

### 4. Put quality beside usage (2:15–3:15)

Point to `outcome`, `tokens`, and the two required facts.

**Say:**

> "The revision consumes more input and output tokens, and the run is slower.
> It also supplies the required client guidance. Token minimization by itself
> would select the failed answer."

### 5. Interpret cost per success (3:15–4:30)

**Say:**

> "The draft-only estimate is a lower cost per request, but it has zero
> accepted outcomes, so cost per successful outcome is undefined—not zero.
> The revised run has one accepted outcome at an illustrative USD 0.0106.
> This one case does not establish a production average or guarantee savings."

Mention that real comparisons need representative cases, repeated runs, actual
rates, and the non-model costs excluded above.

### 6. Name the stopping decision (4:30–5:00)

**Say:**

> "Both runs are bounded. One stops because its revision budget is exhausted;
> the other stops because its acceptance check passes. A production policy also
> needs token, tool, elapsed-time, and evaluator budgets plus a deliberate
> partial-answer, defer, or review path."

Transition to the final module slide: a bound controls one dimension, not the
entire invoice or outcome.

## Expected observations

- The revision run has nearly the same first-visible time but a longer
  completion time.
- The revision run uses more tokens and has a higher illustrative estimated
  cost per request.
- The cheaper request fails its explicit quality rule; with zero successes,
  its cost per successful outcome is undefined.
- Prompt-cache usage is an input-computation signal. Nothing here reuses a
  final response.
- The two runs do not measure throughput and do not establish a general
  routing, caching, or savings result.
- An iteration cap does not bound all model tokens, tool charges, elapsed time,
  evaluator cost, or total Azure spend.

## Fallback

If `python3` is unavailable or the terminal cannot be displayed, show the
expected-output block and the evidence table in this runbook. Read the two
lines in the same order: outcome, responsiveness, completion, tokens,
illustrative estimate, then cost per success. No cloud fallback is necessary.

If challenged on current pricing, reiterate that the rate card is fabricated
for arithmetic only and open the current Azure pricing page after the module;
do not replace the figures during the live demo or present them as a quote.

## Cleanup

- The command creates no files, resources, deployments, datasets, or
  environment variables.
- Close the terminal and return to slide 9.
- Retain no attendee or customer data; all displayed content is synthetic.

## Official sources

- [Performance and latency](https://learn.microsoft.com/azure/foundry/openai/how-to/latency)
- [Prompt caching](https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching)
- [MAF agent observability](https://learn.microsoft.com/agent-framework/agents/observability)
- [MAF workflow observability](https://learn.microsoft.com/agent-framework/workflows/observability)
- [MAF evaluation](https://learn.microsoft.com/agent-framework/agents/evaluation)
- [Evaluate model router for your workload](https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router)
