# Day 5 — Production readiness + Capstone kickoff

Eight modules provide **241 minutes of scheduled content** inside a 246-minute
live block. The remaining five minutes are a flexible transition/overrun
allowance, not a hidden break or extra activity.

| # | Module | Time | Scheduled offset | Source |
|---|---|---:|---|---|
| 1 | Observability and tracing | 30m | 00:00–00:30 | [`module-1-observability-tracing.md`](module-1-observability-tracing.md) |
| 2 | Foundry Toolkit for VS Code | 21m | 00:30–00:51 | [`module-2-foundry-toolkit-vscode.md`](module-2-foundry-toolkit-vscode.md) |
| 3 | Identity and security | 30m | 00:51–01:21 | [`module-3-identity-security.md`](module-3-identity-security.md) |
| 4 | Responsible AI | 25m | 01:21–01:46 | [`module-4-responsible-ai.md`](module-4-responsible-ai.md) |
| 5 | Cost, latency, and model routing | 30m | 01:46–02:16 | [`module-5-cost-latency-routing.md`](module-5-cost-latency-routing.md) |
| 6 | Evaluation in production | 20m | 02:16–02:36 | [`module-6-production-evaluation.md`](module-6-production-evaluation.md) |
| 7 | Capstone briefing | 25m | 02:36–03:01 | [`module-7-capstone-briefing.md`](module-7-capstone-briefing.md) |
| 8 | Capstone scoping working session | 60m | 03:01–04:01 | [`module-8-capstone-scoping.md`](module-8-capstone-scoping.md) |
|  | **Scheduled content** | **241m** |  |  |
|  | Flexible transition/overrun allowance | 5m | 04:01–04:06 |  |

The approved agenda, pacing, technical boundaries, and workshop-policy
decisions are in [`docs/day5-plan.md`](../../docs/day5-plan.md).

## Direct delivery-deck locations

| Module | Delivered PPTX |
|---|---|
| 1 | [`decks/day5/module-1-observability-tracing.pptx`](../../decks/day5/module-1-observability-tracing.pptx) |
| 2 | [`decks/day5/module-2-foundry-toolkit-vscode.pptx`](../../decks/day5/module-2-foundry-toolkit-vscode.pptx) |
| 3 | [`decks/day5/module-3-identity-security.pptx`](../../decks/day5/module-3-identity-security.pptx) |
| 4 | [`decks/day5/module-4-responsible-ai.pptx`](../../decks/day5/module-4-responsible-ai.pptx) |
| 5 | [`decks/day5/module-5-cost-latency-routing.pptx`](../../decks/day5/module-5-cost-latency-routing.pptx) |
| 6 | [`decks/day5/module-6-production-evaluation.pptx`](../../decks/day5/module-6-production-evaluation.pptx) |
| 7 | [`decks/day5/module-7-capstone-briefing.pptx`](../../decks/day5/module-7-capstone-briefing.pptx) |
| 8 | [`decks/day5/module-8-capstone-scoping.pptx`](../../decks/day5/module-8-capstone-scoping.pptx) |

The Day 5 PPTX files are **delivered directly** at their deck locations. There
is **no Day 5 deck generator in this repository**; do not infer that the Day 4
generation commands apply to these files.

## Source and presenter-notes contract

Each slide's editable content and grounding are recorded in Markdown and include:

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

Future content changes start in Markdown, then update the corresponding direct
PPTX and repeat the source, notes, parity, structural, and visual checks.

## Starting assumption

Day 5 requires **no completed prior lab, attendee-owned Azure resource, local
environment, working personal agent, trace, or evaluation result**. Presenter
examples and the complete synthetic
[`labs/day5/evidence-pack.md`](../../labs/day5/evidence-pack.md) let every
attendee participate. The 60-minute scoping session needs only a team, a
candidate scenario, and a shared way to edit or sketch the charter.
