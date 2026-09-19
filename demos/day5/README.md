# Day 5 demonstrations

Six presenter demonstrations support Modules 1–6. Their **37 minutes are
already inside** the 150-minute technical block; none adds time to the agenda.
They use presenter-prepared examples so attendees need no completed lab,
working agent, local environment, Azure resource, trace, or evaluator result.

All six presenter runbooks are included at the paths below.

## Approved roster and runbook paths

| ID | Approved runbook name | Approved path | Time | Planned evidence and fallback |
|---|---|---|---:|---|
| 1.1 | **Compare client-side and server-side traces** | [`demos/day5/module-1-demo-1-standard-custom-traces.md`](module-1-demo-1-standard-custom-traces.md) | 8m | Run the official WeatherAgent sample and inspect its client-side automatic/custom spans, then run a Prompt agent in the Foundry playground and inspect its server-side trace; use separate dated captures if export or ingestion is delayed |
| 2.1 | **Inspect the reference workflow locally** | [`demos/day5/module-2-demo-1-inspect-locally.md`](module-2-demo-1-inspect-locally.md) | 6m | Inspect local traffic, streaming, tool activity, and only a supported workflow view; use a recording from the pinned Toolkit/runtime if the UI or graph is unavailable |
| 3.1 | **Identity boundary: an approved action can still be denied** | [`demos/day5/module-3-demo-1-identity-boundary.md`](module-3-demo-1-identity-boundary.md) | 7m | Read prepared principal/permission and denied-action evidence; use official permission tables plus clearly labeled expected outcomes if authentic captures are unavailable |
| 4.1 | **Safety boundary: detection, filtering, and evidence** | [`demos/day5/module-4-demo-1-safety-boundary.md`](module-4-demo-1-safety-boundary.md) | 6m | Compare model detection/filtering with a separate offline groundedness result; use prepared results or Microsoft's published examples, never a live adversarial scan |
| 5.1 | **Read the cost of another revision** | [`demos/day5/module-5-demo-1-revision-cost.md`](module-5-demo-1-revision-cost.md) | 5m | Compare captured outcome, usage, duration, and stop reason for bounded runs; do not deploy a new model or router live |
| 6.1 | **A regression blocks acceptance** | [`demos/day5/module-6-demo-1-regression-gate.md`](module-6-demo-1-regression-gate.md) | 5m | Compare saved baseline/candidate results and the workshop gate decision; use a captured pipeline walkthrough rather than wait for a cloud job |

## Shared setup rules

Every runbook contains its slide placement, time box, exact official source
URLs, setup checklist, narration, expected observations, failure/fallback path,
and teaching payoff.

Before delivery:

1. Pin and record the Python SDK/runtime, model/deployment, Toolkit extension,
   API surface, and relevant region or preview constraints.
2. Use a controlled presenter environment and synthetic content whenever
   prompts, tool arguments, identity examples, or safety payloads are visible.
3. Rehearse each path within its time box. Keep stable correlation identifiers
   across the prepared evidence for Modules 1, 5, and 6.
4. Confirm the Foundry project/Application Insights connection and read access
   before the tracing demo. Opening Agent Inspector is not evidence that cloud
   trace export is configured.
5. Stage captures before class. Never grant roles, walk through OAuth consent,
   change customer permissions, run an adversarial scan, provision a resource,
   or create a deployment during the live block.
6. Remove or mask credentials, tokens, personal data, and customer content.
   Treat telemetry as another governed data store.

## Fallback and truthfulness rules

- Prefer a genuine, dated capture from the rehearsed environment. A recording
  or screenshot must be labeled **recorded**, not narrated as a live result.
- A simulated denial or safety result must be labeled **synthetic/expected**.
  Do not invent an “observed” cloud outcome when authentic evidence is absent.
- A local deterministic check is not a Foundry cloud evaluation, and a console
  event list is not automatically an exported distributed trace.
- If a required evaluator is missing, errored, or unsupported, show it as
  unavailable and let the workshop gate block acceptance; never convert it to
  a pass.
- Keep offline evaluator results separate from serving-time filters and
  application-owned fallback behavior.
- If the live system diverges from the capture, explain the version, region,
  permission, preview, or model boundary instead of substituting a
  successful-looking result.

## Technical references

- [MAF agent observability](https://learn.microsoft.com/agent-framework/agents/observability)
- [MAF workflow observability](https://learn.microsoft.com/agent-framework/workflows/observability)
- [Agent tracing overview](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
- [Foundry Toolkit overview](https://learn.microsoft.com/azure/foundry/how-to/develop/get-started-projects-visual-studio-code)
- [Foundry authentication and authorization](https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry)
- [Foundry guardrails and controls](https://learn.microsoft.com/azure/foundry/guardrails/guardrails-overview)
- [Agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)
