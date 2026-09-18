---
title: Cost, Latency, and Model Routing
subtitle: Measure the workload, choose the route, and define when work stops
eyebrow: DAY 5 · MODULE 5 · 30 MIN
tag: Day 5 · Module 5
deck: module-5-cost-latency-routing.pptx
---

# Module 5 — Cost, Latency, and Model Routing

## Cost, Latency, and Model Routing
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/how-to/latency | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router -->
<!-- notes: Frame the module around one architecture decision: meet an explicit quality floor while measuring latency and cost in their own units. Use the presenter-prepared reference-agent evidence; nobody needs a Day 4 lab result or an attendee-owned deployment. There is no promised saving or universally best route. -->

- A cheaper request is not cheaper per successful outcome when it misses the requirement

## Measure the signal you mean
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/how-to/latency | https://learn.microsoft.com/agent-framework/workflows/observability -->
<!-- notes: Spend about four minutes separating the signals. TTFT describes responsiveness and TTLT describes model completion; neither automatically includes retrieval, tools, queues, retries, or later model calls in a workflow. Streaming can improve perceived responsiveness without shortening completion, while throughput answers a capacity question rather than a single-request timing question. -->

| Signal | Meaning | Use it to ask |
|---|---|---|
| Latency | Elapsed time for one request or operation | How long did this request take? |
| Throughput | Work completed per unit time | How much load can the system sustain? |
| TTFT | Time from model request to first token | When does a streamed response begin? |
| TTLT | Time from model request to last token | When does that model call finish? |
| Workflow completion | End-to-end time across model, retrieval, tools, and revisions | When is the usable outcome ready? |

## Tokens are usage—not dollars
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router -->
<!-- notes: Token telemetry is a useful usage proxy, not a bill. To estimate currency, record model and version, input/output/cache categories, rate units, currency, and pricing date, then include non-model services and evaluation overhead separately. Cost per successful outcome also needs a defensible success count; with zero successes it is undefined rather than zero. -->

- **Usage** — Input, output, and cached-token fields describe model work
- **Price** — Apply the correct model/version rate, currency, and pricing date
- **Whole-system cost** — Add retrieval, tools, telemetry, evaluation, and hosting
- **Efficiency** — Compare cost per accepted outcome, not tokens per request alone

## Prompt cache ≠ response cache
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/how-to/prompt-caching | https://learn.microsoft.com/azure/search/search-document-level-access-overview -->
<!-- notes: Prompt caching reuses temporary computation for matching input prefixes; the model still generates a response. A response cache reuses an application-stored answer and therefore needs an explicit key, freshness policy, authorization check, and invalidation strategy. Cache support, retention, reads, writes, and charges are model- and deployment-specific, so verify them rather than generalizing. -->

- **Prompt caching**
  - Reuses computation for matching input prefixes
  - Still generates a new model response
  - Observe cache-token fields; support and charges vary
- **Application response caching**
  - Reuses a previously stored final answer
  - Must enforce freshness, tenant/user access, and invalidation
  - Is an application architecture choice—not prompt caching

## Three model choices, three control points
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/concepts/model-router | https://learn.microsoft.com/azure/foundry/openai/concepts/model-router-how-it-works | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router -->
<!-- notes: Keep the product boundary precise. Foundry model router analyzes the request and selects an eligible model before generation according to its configured mode and pool; it is not an application quality checker that grades an answer and retries on a stronger model. Application-owned escalation can do that, but its quality check, retry budget, history handling, and failure response are your design. -->

- **Fixed deployment** — One known model handles every request; simplest baseline
- **Managed model router** — Selects an eligible model at request time before generation
- **Application escalation** — Evaluates an outcome, then may retry through application logic
- **Adoption decision** — Compare representative quality, cost, latency, and policy evidence

## History determines portability
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/agent-framework/concepts/agents/runtime-model-routing | https://learn.microsoft.com/azure/foundry/openai/concepts/model-router-how-it-works -->
<!-- notes: A model switch is not a history transfer. Caller-managed messages can be replayed when the destination supports their roles, content, tool calls, and results; a service-owned conversation or response ID refers to state at its originating service and scope. The documented MAF routing helper is experimental .NET; Python support is unavailable, so this is architecture guidance rather than a Python demo. -->

| History model | Caller has | Routing consequence |
|---|---|---|
| Caller-managed | Relevant messages in application-controlled storage | Can replay them to a compatible destination |
| Service-managed | A service-specific conversation or response ID | ID does not carry history to another service |
| MAF routing helper | Experimental `.NET` routing client | Python support is currently unavailable |

## Batch is a separate lane
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/how-to/batch | https://learn.microsoft.com/azure/foundry/concepts/architecture -->
<!-- notes: Batch processing accepts asynchronous groups of requests and returns results later; it is suitable when a user is not waiting. It does not reduce the interactive request's first-token latency. Before choosing it, verify supported models, data location, quota, turnaround, and current pricing for the exact deployment rather than repeating a generic savings claim. -->

- **Interactive path**
  - A caller waits for this response
  - Measure first-token and completion latency separately
  - Stream when early visibility helps the experience
- **Batch path**
  - Queue asynchronous work and retrieve results later
  - Use separate workload, quota, and turnaround assumptions
  - Not a technique for lower interactive latency

## DEMO 5.1 — Read the cost of another revision
<!-- layout: demo -->
<!-- demo-time: ~5 min -->
<!-- demo-reference: Runbook: demos/day5/module-5-demo-1-revision-cost.md -->
<!-- source: https://learn.microsoft.com/agent-framework/agents/observability | https://learn.microsoft.com/agent-framework/workflows/observability | https://learn.microsoft.com/agent-framework/agents/evaluation | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router -->
<!-- notes: Use only the runbook's presenter-prepared synthetic evidence: two bounded runs of the same case, one draft-only and one with a single revision. Read first-visible and completion time, input/output/cache usage, the explicit illustrative rate card, the outcome check, and the stop reason. Do not launch a router, deploy a model, wait on a cloud evaluation, or imply that this one case guarantees savings. -->

Compare one synthetic request with zero and one allowed revision. The extra pass costs more time and tokens but supplies the missing fact. Choose from quality, time, estimated cost, and stop reason—not one metric.

## A budget is a policy—not a promise
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router | https://learn.microsoft.com/agent-framework/agents/evaluation | https://learn.microsoft.com/azure/foundry/concepts/observability -->
<!-- notes: Close in three minutes. A revision or turn cap bounds one dimension of work; it does not cap every token, tool charge, evaluator call, elapsed second, or Azure invoice. Ask for a stop policy that preserves correctness: return a bounded partial answer, defer asynchronous work, or route to an application-owned review path with an explicit owner. -->

1. **Set the quality floor** — Define what an acceptable outcome must contain
2. **Measure in units** — Record latency, usage, currency assumptions, and success
3. **Bound each dimension** — Revisions, tokens, tools, elapsed time, and evaluator work
4. **Stop deliberately** — Return partial evidence, defer, or escalate through application policy
