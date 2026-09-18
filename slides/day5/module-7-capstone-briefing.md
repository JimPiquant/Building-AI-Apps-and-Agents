---
title: Capstone Briefing
subtitle: Choose a useful scope, build the smallest credible solution, and collect evidence
eyebrow: DAY 5 · MODULE 7 · 25 MIN
tag: Day 5 · Module 7
deck: module-7-capstone-briefing.pptx
---

# Module 7 — Capstone Briefing

## Capstone Briefing
<!-- layout: title -->
<!-- source: docs/day5-plan.md -->
<!-- notes: Allow 3 minutes. Clearly label this as workshop policy: teams will create a useful, reviewed capstone over the next 2–3 weeks, not compete in a hackathon. No completed lab, attendee-owned environment, or Day 5 deployment deliverable is assumed. The evidence pack and templates provide a complete starting point. -->

- One useful scenario · one bounded failure path · evidence someone else can review

## Agent or workflow: choose who controls the path
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/agent-framework/concepts/agents/ | https://learn.microsoft.com/agent-framework/concepts/workflows/ | https://learn.microsoft.com/agent-framework/journey/workflows -->
<!-- notes: Allow 4 minutes. An MAF agent combines model-backed behavior with instructions and tools, so the model can choose a next action. An MAF workflow defines an explicit, inspectable path across agents or ordinary code. Explicit flow does not make model output deterministic, and more agents do not make a design better. Checkpoint: a single MAF agent with a read-only tool can qualify; multi-agent is not mandatory. -->

- **Agent**
  - Combines model behavior, instructions, tools, and run context
  - The model can choose whether and how to use an available tool
  - Start here when one bounded agent can satisfy the user need
- **Workflow**
  - Connects agents or ordinary code through explicit execution paths
  - The developer defines ordering, branches, gates, and handoffs
  - Add it only when the process itself needs that control

## Grounding is retrieved evidence—not a model location
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation | https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq | docs/day5-plan.md -->
<!-- notes: Allow 4 minutes. Separate product concepts from the workshop choice. A Foundry-deployed model supplies inference; it does not give the model private or current enterprise facts. RAG retrieves relevant content and adds it to model input as grounding data. In Foundry IQ, a knowledge base defines retrieval behavior and references one or more knowledge sources, which connect to indexed or remote content. Workshop policy accepts either Foundry IQ or a custom RAG pipeline. Retrieved content can still be incomplete, stale, unsafe, or unauthorized. -->

| Term | Use it precisely |
|---|---|
| **Foundry-deployed model** | Supplies inference; its location does not ground the answer |
| **RAG / grounding** | Retrieves evidence and adds it to the model input |
| **Foundry IQ** | A knowledge base defines retrieval behavior and references knowledge sources |
| **Workshop choice** | Use Foundry IQ **or** custom RAG; test the retrieved evidence |

## Build the deliverable—and bring separate evidence
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | docs/day5-plan.md -->
<!-- notes: Allow 6 minutes. This matrix is workshop policy informed by documented product evidence; it is not a Microsoft production-readiness standard. A deliverable is what the team built or documented. Evidence is a retained observation that lets a reviewer test a claim. Ten cases are a teaching minimum, not statistical assurance. The capstone requires a captured Foundry evaluator result before and after a change, plus OTel trace evidence visible in Foundry tracing or Application Insights. A README or checked box cannot substitute for those observations. -->

| Required workshop element | What it answers |
|---|---|
| **MAF agent + Foundry-deployed model** | What runs and performs inference? |
| **Tool boundary + Foundry IQ or custom RAG** | What acts, and what evidence grounds the response? |
| Architecture diagram + README | What was designed, decided, and left out? |
| ≥10 cases + captured **initial/final evaluator results** + **OTel trace** | What behavior changed, and what execution was observed? |
| 30-day plan + shared demo | Who owns the next step, and can others review the evidence? |

## Scope small; pass the approved checkpoints
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/agent-framework/journey/workflows | docs/day5-plan.md -->
<!-- notes: Allow 5 minutes. Resolve everyone into a 2–3-person team with no solo path, then coach to one user problem, one small action or knowledge boundary, 3–5 measurable success criteria, and one meaningful failure case. Week 1 ends with a working spike and initial evaluator baseline. Week 2 changes one thing, strengthens controls, and records the final comparison. Week 2–3 is rehearsal and the shared demo: about 10 minutes to present/demonstrate plus 5 minutes for Q&A and coaching, on a date still TBD. There is no Day 5 deployment deliverable; deployment is not a hidden checkpoint. -->

1. **Today · team + charter** — Form a team of 2–3 (no solo); name one user, task, non-goals, owners, and dependencies
2. **Today · design** — Choose the simplest agent/workflow shape and one failure case
3. **Week 1 · baseline** — Produce a working spike, ≥10 planned cases, and the initial evaluator result
4. **Week 2 · candidate** — Change one thing; rerun the same cases and retain controls, traces, and final result
5. **Week 2–3 · share** — Finish the README and architecture; rehearse ~10m demo + 5m Q&A; exact date TBD

No prior lab/environment requirement. No multi-agent requirement. No Day 5 deployment deliverable.

## Official resources: where to go next
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/agent-framework/concepts/agents/ | https://learn.microsoft.com/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation | https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators | https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept -->
<!-- notes: Allow 3 minutes. Present these as direct official starting pages, not a complete bibliography. Agents/workflows help choose the control shape; RAG/Foundry IQ ground the knowledge design; evaluation datasets and tracing establish reusable evidence. The repository's docs/resources.md remains the curated index and will be expanded independently. Close by having each already-formed team name its candidate, provisional evidence owners, and known gaps, then open the charter template for Module 8. -->

- **Choose the control shape** — MAF agent concepts · MAF workflow concepts
- **Design grounding** — RAG and indexes · Foundry IQ knowledge bases and sources
- **Plan repeatable evidence** — Evaluation datasets · Agent evaluators
- **Interpret operations** — Agent tracing, spans, attributes, and exporters
- **Keep the curated index** — `docs/resources.md` remains the workshop's maintained resource list

Next: name the candidate and evidence owners, record known gaps, and open the charter.
