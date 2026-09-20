# Day 5 — Production readiness + Capstone kickoff

Six instructor-led modules provide **156 minutes of scheduled technical
content**. Module 7 is a customer-run capstone scoping working session; the
customer controls its duration and internal pacing.

| # | Module | Time | Scheduled offset | Source |
|---|---|---:|---|---|
| 1 | Observability and tracing | 30m | 00:00–00:30 | [`module-1-observability-tracing.md`](module-1-observability-tracing.md) |
| 2 | Identity and security | 30m | 00:30–01:00 | [`module-2-identity-security.md`](module-2-identity-security.md) |
| 3 | Responsible AI | 25m | 01:00–01:25 | [`module-3-responsible-ai.md`](module-3-responsible-ai.md) |
| 4 | Cost, latency, and model routing | 30m | 01:25–01:55 | [`module-4-cost-latency-routing.md`](module-4-cost-latency-routing.md) |
| 5 | AI evaluations for agentic systems | 20m | 01:55–02:15 | PPTX-only replacement |
| 6 | Foundry Toolkit for VS Code | 21m | 02:15–02:36 | [`module-6-foundry-toolkit-vscode.md`](module-6-foundry-toolkit-vscode.md) |
| 7 | Capstone scoping working session | Customer controlled | After Module 6 | [`module-7-capstone-scoping.md`](module-7-capstone-scoping.md) |
|  | **Instructor-led content** | **156m** |  |  |

The approved agenda, pacing, technical boundaries, and workshop-policy
decisions are in [`docs/day5-plan.md`](../../docs/day5-plan.md).

## Direct delivery-deck locations

| Module | Delivered PPTX |
|---|---|
| 1 | [`decks/day5/module-1-observability-tracing.pptx`](../../decks/day5/module-1-observability-tracing.pptx) |
| 2 | [`decks/day5/module-2-identity-security.pptx`](../../decks/day5/module-2-identity-security.pptx) |
| 3 | [`decks/day5/module-3-responsible-ai.pptx`](../../decks/day5/module-3-responsible-ai.pptx) |
| 4 | [`decks/day5/module-4-cost-latency-routing.pptx`](../../decks/day5/module-4-cost-latency-routing.pptx) |
| 5 | [`decks/day5/module-5-production-evaluation.pptx`](../../decks/day5/module-5-production-evaluation.pptx) |
| 6 | [`decks/day5/module-6-foundry-toolkit-vscode.pptx`](../../decks/day5/module-6-foundry-toolkit-vscode.pptx) |
| 7 | [`decks/day5/module-7-capstone-scoping.pptx`](../../decks/day5/module-7-capstone-scoping.pptx) |

The Day 5 PPTX files are **delivered directly** at their deck locations. There
is **no Day 5 deck generator in this repository**; do not infer that the Day 4
generation commands apply to these files.

## Source and presenter-notes contract

Except for the owner-supplied Module 5 replacement, each slide's editable
content and grounding are recorded in Markdown and include:

1. one parser-supported `<!-- layout: ... -->` declaration;
2. an exact official Microsoft Learn URL in `<!-- source: ... -->` for every
   technical concept, with additional sources separated by ` | `; or
   `docs/day5-plan.md` only when the slide is clearly workshop policy or
   logistics; and
3. substantive `<!-- notes: ... -->` guidance covering the example,
   facilitation move, scope, and limitation.

The delivered deck keeps a readable primary source on-slide and carries every
supporting URL into presenter notes as a `GROUNDING SOURCE:` entry. Workshop
minimums, dates, team rules, and locally chosen acceptance gates must remain
labeled as workshop policy—not Microsoft product requirements.

Future authored content changes start in Markdown, then update the corresponding
direct PPTX and repeat the source, notes, parity, structural, and visual checks.
Module 5 is maintained directly as a PPTX delivery artifact.

## Starting assumption

Day 5 requires **no completed prior lab, attendee-owned Azure resource, local
environment, working personal agent, trace, or evaluation result**. Presenter
examples and the complete synthetic
[`labs/day5/evidence-pack.md`](../../labs/day5/evidence-pack.md) let every
attendee participate. The customer-run scoping session needs only a team, a
candidate scenario, and a shared way to edit or sketch the charter.
