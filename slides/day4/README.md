# Day 4 — Multi-Agent Patterns + Evaluation Anchor

Seven module decks: **235 minutes core**, extended today from the original 210-minute plan (Module 3 grew 30m → 55m to fit its dense workflow-fundamentals content plus visualization, workflow-level observability, and a declarative-workflows mention; Module 1's exact time addition for its new Agent-to-Agent content is still being finalized). Each markdown file is the source of truth for slide content, citations, and presenter guidance. PowerPoint files are not yet generated — `scripts/build-decks/day4.js` doesn't exist yet; slide content is authored first, decks come next.

| # | Module | Time | Plan |
|---|---|---:|---|
| 1 | Agents vs. Workflows | 35m | [`module-1-agents-vs-workflows.md`](module-1-agents-vs-workflows.md) |
| 2 | Orchestration Patterns | 40m | [`module-2-orchestration-patterns.md`](module-2-orchestration-patterns.md) |
| 3 | MAF Workflows | 55m | [`module-3-workflow-fundamentals.md`](module-3-workflow-fundamentals.md) |
| 4 | Memory Strategies for Multi-Agent Systems | 25m | [`module-4-multi-agent-memory.md`](module-4-multi-agent-memory.md) |
| 5 | Evaluating Multi-Agent Systems — **EVALUATION ANCHOR** | 45m | [`module-5-evaluation.md`](module-5-evaluation.md) |
| 6 | Multi-Agent Failure Modes & Mitigations | 20m | [`module-6-failure-modes.md`](module-6-failure-modes.md) |
| 7 | Day 4 Lab Kickoff | 25m | [`module-7-lab-kickoff.md`](module-7-lab-kickoff.md) |

## Day 4 learning arc

You extend Day 3's single-agent runtime into multi-agent territory: choose between agents and workflows and compose across a boundary with A2A (Module 1), tour the five built-in orchestration patterns (Module 2), learn the graph primitives — executors, edges, events, state, human-in-the-loop, checkpoints, visualization, and workflow-level observability — that every pattern is built on (Module 3), design memory contracts between agents (Module 4), evaluate a multi-agent workflow's trajectory and cost, not just a single response (Module 5, this week's evaluation anchor), name and mitigate multi-agent failure modes (Module 6), then kick off the lab: turning the Day 3 docs assistant into a Planner/Retriever/Critic research workflow (Module 7).

## Source and locked-plan status

Curriculum source: `Publix_Building_AI_Apps_and_Agents_Curriculum_v0.7.docx` (Pradeep-approved). Module count, order, and the core lab spec (Planner/Retriever/Critic, golden set, trajectory eval, orchestration-pattern-swap experiment) are locked from that document. This session's additions on top of the locked plan:

- **Agent-to-Agent (A2A)** content in Module 1 — not in v0.7, added at the workshop author's explicit direction; exact time-budget mechanics within Module 1 still being finalized.
- **Module 3's time extended** from 30m to 55m to fit its content without cutting scope — the original workflow-fundamentals content (30m→45m), plus three additions closing gaps against the official [Workflow capabilities](https://learn.microsoft.com/en-us/agent-framework/workflows/) index: **visualization** (`WorkflowViz`/Mermaid/DOT), **workflow-level observability** (OTel spans, `edge_group.delivery_status` for debugging conditional edges), and a brief **declarative workflows** (YAML) mention flagged explicitly out of scope for this code-first week, matching Day 3's Agent Hooks precedent.
- The lab's exact implementation shape (a custom `WorkflowBuilder` graph vs. a prebuilt orchestration pattern for the Critic→Planner revision loop) is **intentionally left open** in Module 7's kickoff slides — a grounded proposal exists (see the session plan) but is on hold pending a decision.

Every substantive slide carries a source URL in its presenter notes, with on-slide citations where useful to attendees, matching Day 1–3's grounding discipline. Two terms on the Module 6 slides — "tool storm" and "quality drift" — are flagged explicitly as this workshop's own descriptive language, not verbatim framework vocabulary.

## Demonstrations and labs

Not yet authored. Per this workshop's established process (see Day 3), demos and labs are built after slide content is locked and reviewed.

## Regenerate

Not yet available — `scripts/build-decks/day4.js` has not been created. Slide markdown is the current source of truth; deck generation is a later step.
