# Day 5 attendee artifacts

Day 5 has **no coding lab and no deployment exercise**. The customer-run
capstone session uses the charter and scoping artifacts below, with timing
controlled by the customer. A separate 30-minute production-readiness
checklist is optional and occurs **outside the 156-minute instructor-led
technical block**.

You can use every artifact without completing a prior lab, installing a local
environment, owning Azure resources, or bringing a working agent. When you do
not have system evidence, use the complete synthetic reference pack and mark
your own state **Not yet observed**.

## Artifact map

| Artifact | Use |
|---|---|
| [`production-readiness-checklist.md`](production-readiness-checklist.md) | Optional, guided 30-minute review of evidence and gaps; not a coding exercise or certification |
| [`evidence-pack.md`](evidence-pack.md) | Complete, clearly synthetic reference evidence for tracing, identity, safety, evaluation, and cost |
| [`capstone-charter-template.md`](capstone-charter-template.md) | Team scope, architecture, criteria, cases, milestones, owners, and review disposition |
| [`capstone-checklist.md`](capstone-checklist.md) | Track the required workshop elements and retained evidence |
| [`demo-day-guide.md`](demo-day-guide.md) | Prepare the shared ~15-minute presentation, demo, Q&A, and coaching |
| [`30-day-next-steps-template.md`](30-day-next-steps-template.md) | Create one personalized follow-through plan per attendee |

## Optional 30-minute evidence review

This activity is optional, outside live time, and deliberately requires no
commands, permission changes, provisioning, or code.

| Step | Time | Action |
|---|---:|---|
| Select system and evidence | 3m | Use your candidate or the synthetic reference pack |
| Observability and evaluation | 8m | Interpret one trace, sensitive-data decision, evaluator, and acceptance blocker |
| Identity and safety | 8m | Map one permission boundary, negative case, control, and expected response |
| Cost and latency | 8m | Record a baseline, a bound, and one routing/caching trade-off to test |
| Prioritize | 3m | Choose three next actions with owners and evidence needed |

Completing the table proves only that a review occurred. It does **not** prove
that a control is implemented, effective, production-ready, secure, compliant,
or supported in every model, region, runtime, or preview surface.

## Capstone workshop requirements

Teams consist of **2–3 people, with no solo path**. Each solution includes:

- at least one MAF agent using a Foundry-deployed model;
- at least one Foundry Toolbox tool, MCP server, or custom MAF function tool;
- Foundry IQ or a custom RAG pipeline;
- at least 10 planned golden-set cases and captured initial/final Foundry
  evaluator results;
- OTel trace evidence visible in Foundry tracing or Application Insights;
- an architecture diagram, README, and personalized 30-day next steps; and
- a shared demo approximately 15 minutes long: about 10 minutes for the
  presentation/demo and 5 minutes for Q&A and coaching.

Multi-agent orchestration is **not mandatory**. Day 5 adds **no deployment
deliverable**. Demo day is 2–3 weeks after the September 21 kickoff; the exact
date is **TBD**.

## Product concepts versus workshop policy

Microsoft documentation defines product concepts such as an MAF agent or
workflow, RAG, a Foundry IQ knowledge base and knowledge source, traces, and
evaluators:

- [MAF agent concepts](https://learn.microsoft.com/agent-framework/concepts/agents/)
- [MAF workflow concepts](https://learn.microsoft.com/agent-framework/concepts/workflows/)
- [RAG and indexes](https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation)
- [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq)
- [Agent tracing](https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept)
- [Agent evaluators](https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators)

The team size, ten-case teaching minimum, capstone evidence set, checkpoints,
demo format, dates, and no-deployment boundary are **workshop policy** from
[`docs/day5-plan.md`](../../docs/day5-plan.md), not Microsoft readiness
requirements.
