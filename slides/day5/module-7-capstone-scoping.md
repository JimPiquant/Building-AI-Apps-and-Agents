---
title: Capstone Scoping Working Session
subtitle: Leave with a reviewable charter, an architecture sketch, and owned evidence
eyebrow: DAY 5 · MODULE 7
tag: Day 5 · Module 7
deck: module-7-capstone-scoping.pptx
---

# Module 7 — Capstone Scoping Working Session

## Capstone Scoping Working Session
<!-- layout: title -->
<!-- source: docs/day5-plan.md -->
<!-- notes: This is a customer-run working session with customer-controlled timing. Workshop outcome: each team leaves with a charter and five-layer sketch, explicit evidence to collect, and owners for unresolved dependencies. A completed lab or functioning agent is not required. Facilitators circulate throughout rather than postponing all review until the closing activity. -->

- Define · sketch · measure · challenge · record the disposition

## Narrow the scenario
<!-- layout: list -->
<!-- source: docs/day5-plan.md -->
<!-- notes: Facilitate, do not lecture. Ask each team for one sentence in the form “For [user], help with [bounded task] so that [observable outcome].” Then force one explicit non-goal. Capture skills, environment, data, quota, or permission gaps as owned dependencies; no prior lab or environment is required today. Before moving on, confirm that the problem, user, in-scope task, and non-goals are written. -->

- **Name the user** — who receives or acts on the result?
- **Bound one task** — what begins and ends inside the capstone?
- **State the outcome** — what observable change would make it useful?
- **Write non-goals** — what will this version deliberately not do?
- **Own the dependencies** — data, permissions, skills, environment, quota; assign an owner and next action

Output: a one-sentence problem statement, in-scope task, explicit non-goals, and owned dependencies.

## Sketch the five-layer workshop lens
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/architecture | docs/day5-plan.md -->
<!-- notes: The five-layer sketch is a workshop organizing lens, not Microsoft Foundry product architecture and not five Azure resources. Map each row to the real component or service the team expects to use, then mark identity/data/trust boundaries. Official Foundry architecture instead distinguishes the Foundry resource, projects, project assets, and independently governed connected Azure services. Before moving on, confirm that every layer has a component or an explicit not-applicable rationale and at least one trust boundary is marked. -->

| Workshop lens | Prompt for the sketch |
|---|---|
| **Model** | Name the Foundry deployment that supplies inference |
| **Runtime** | Name where the MAF agent or workflow executes |
| **Actions** | Name the Toolbox, MCP, or function-tool boundary |
| **Knowledge** | Name the Foundry IQ source or custom RAG path |
| **Ops** | Place identity, safety, evaluation, trace, latency, and cost evidence |

Label actual resources and trust boundaries. Do **not** draw five boxes and call them five Azure resources.

## Write criteria, not tasks
<!-- layout: compare -->
<!-- source: https://learn.microsoft.com/azure/foundry/observability/concepts/trace-agent-concept | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router | docs/day5-plan.md -->
<!-- notes: A task says what to implement; a success criterion says what observable evidence must meet which acceptance rule. Challenge “improve answer quality” by asking for cases, expected behavior, evaluator or human check, threshold, boundary, and evidence owner. Teams need 3–5 criteria and at least 10 planned golden-set cases. Thresholds are team decisions, not Microsoft defaults. Before moving on, confirm that each criterion names a metric or observation, unit where relevant, case boundary, acceptance rule, evidence, and owner. -->

- **Implementation task**
  - “Enable tracing”
  - “Add an evaluator”
  - “Configure a permission”
  - Describes work, not proof
- **Success criterion**
  - “For GS-04, the trace identifies the failed retrieval span”
  - “Across the same ≥10 cases, the final Foundry evaluator result meets the team-defined threshold and does not regress from the recorded initial result”
  - “The named boundary denies the restricted-document case”
  - Names the evidence and acceptance rule

## Define baseline and candidate
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/azure/foundry/agents/concepts/development-lifecycle | https://learn.microsoft.com/azure/foundry/observability/how-to/evaluation-datasets | https://learn.microsoft.com/azure/foundry/openai/how-to/evaluate-model-router | docs/day5-plan.md -->
<!-- notes: Baseline means the known configuration measured first; candidate means a named changed configuration measured against the same documented cases and evaluator settings. Record model/deployment, instructions, tools, knowledge version, evaluator configuration, and run IDs as applicable. Change one thing when practical so the delta is interpretable. Also assign team roles, Week 1 spike/baseline, Week 2 candidate/evaluation, and Week 2–3 rehearsal milestones. Before moving on, confirm that both configurations, the planned change, owners, and comparison evidence are named. -->

1. **Freeze the baseline** — Record configuration, cases, evaluator settings, trace link, and initial result
2. **Name one candidate change** — Instruction, tool, retrieval, control, or orchestration—not “everything”
3. **Hold the comparison stable** — Same documented cases and evaluator settings; record versions and run IDs
4. **Assign the checkpoints** — Week 1 spike/baseline · Week 2 candidate/final result · Week 2–3 rehearsal

Improvement is a measured delta against an acceptance rule, not a better-looking demo.

## Challenge, coach, and record disposition
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/rag-evaluators | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators | docs/day5-plan.md -->
<!-- notes: A failure case is a test condition, such as an unauthorized lookup or unsupported question. A control is the deliberately implemented behavior, such as deny, answer only from evidence, or route to an application-owned review path. Do not infer that a drawn control works. Peers challenge one failure path and one cost or permission risk, then record ready, changes required, or needs review. Every gap gets an owner, evidence request, status, and next action. Facilitators coach throughout. An unresolved charter must remain explicitly unresolved rather than being counted as approved. -->

- **Failure path** — Choose one failure case, its control, enforcement point, expected outcome, and verifying evidence
- **Risk check** — Challenge one permission or cost/latency assumption; name its owner and smallest test
- **Review** — Record `Reviewed—ready`, `Reviewed—changes required`, or `Needs review`
- **Close gaps** — Give every open item a status, owner, evidence request, and next action

Final checkpoint: charter + sketch + ≥10 planned cases + milestones + review disposition + individual 30-day next steps.
