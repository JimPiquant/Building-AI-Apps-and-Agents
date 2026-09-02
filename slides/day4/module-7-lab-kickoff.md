---
title: Day 4 Lab Kickoff
subtitle: Four parts, one scenario — Sequential's ceiling, the graph that fixes it, bound the loop, then measure Group Chat against both
eyebrow: DAY 4 · MODULE 7 · 25 MIN
tag: Day 4 · Module 7
deck: module-7-lab-kickoff.pptx
---

# Module 7 — Day 4 Lab Kickoff

## Day 4 Lab Kickoff
<!-- layout: title -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: This lab composes every module from today: workflow primitives (3), orchestration patterns (2), memory contracts (4), and a trajectory evaluation with a cost metric (5), plus the guardrail from Module 6 — now a required deliverable, not a stretch goal. Note for presenters: the lab's own part order (basics, then orchestrations, then eval) deliberately runs opposite to today's lecture order (orchestration patterns in Module 2, before workflow fundamentals in Module 3) — build it by hand first, then appreciate the shortcut, is the lab's own teaching sequence. Part naming matches labs/day4/README.md exactly: A, B1, B2, C, plus an optional Part D (declarative workflows, added later, provided complete) — not the three-part A/B/C shape an earlier lab draft used. -->

- Turn the Day 3 single agent into a multi-agent research workflow — four parts, escalating sophistication, one shared evaluation

## What you'll build
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ -->
<!-- notes: Same Planner/Retriever/Critic roles across all four parts — the roles don't change, only what runs them does. The Summarizer role from an earlier draft was folded into the Critic to keep this lab digestible — the Critic both judges and produces the final answer. -->

- The **same three roles** — Planner, Retriever, Critic:
  - **Part A** — `SequentialBuilder`'s one-line shortcut, and the ceiling it runs into
  - **Part B1** — a custom `WorkflowBuilder` graph with a conditional edge that fixes it
  - **Part B2** — bound that loop, test-driven: a failing spec is the requirement, not a TODO comment
  - **Part C** — the same roles a third way, `GroupChatBuilder`, then measure all three constructions against one golden set
- **Optional stretch — Part D**: the same Agent Framework engine running a workflow authored as YAML instead of code, no TODOs, provided complete (needs Python 3.13)

## Part A — Sequential, and its ceiling
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/sequential -->
<!-- notes: Matches labs/day4/python/part_a_sequential.py's own docstring almost verbatim -- that file IS the ceiling narrative, not a paraphrase of it. No golden set in this part; that's Part C's job once there's something worth comparing (evaluate.py's docstring: "no scoring in this part"). -->

- `SequentialBuilder(participants=[planner, retriever, critic]).build()` — the three roles, wired in one line
- Run 1 (a single-document question): Planner, Retriever, Critic each run once, in order — clean
- Run 2 (a question spanning two documents): the Critic says `approved=false` with a precise reason — and the workflow ends anyway
- **The ceiling**: Sequential is forward-only — there's no edge from the Critic back to the Planner, so a correct rejection has nowhere to go. Part B1 fixes exactly this.

## Part B1 — The graph that fixes it
<!-- layout: code -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/sequential | https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges -->
<!-- notes: Rebuilding with a custom WorkflowBuilder graph is a genuine rewrite of the orchestration plumbing, not a small diff on Part A's code — set that expectation directly with attendees, per part_b_graph.py's own docstring ("This is a genuine rewrite, not a diff on Part A"). -->

```python
# Part A's shortcut — the ceiling this fixes
SequentialBuilder(participants=[planner, retriever, critic]).build()

# Part B1 — a custom graph with a loop-back edge
builder = WorkflowBuilder(start_executor=planner)
builder.add_edge(planner, retriever)
builder.add_edge(retriever, critic)
builder.add_edge(critic, planner, condition=lambda result: not result.approved)
```

Same three roles, same shape — one new edge. When the Critic doesn't approve, the graph now has somewhere to send that verdict: back to the Planner.

## Part C — Group Chat, and bound it too
<!-- layout: flow -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/group-chat -->
<!-- notes: GroupChatBuilder's orchestrator_agent parameter is a real Agent, not a plain function — it decides who speaks next by reading the shared conversation, not by evaluating a Python condition. Matches part_c_group_chat.py's own docstring and TODO comments, including the termination_condition example (8 assistant turns). Card titles kept short on purpose — longer titles here used to overflow into the body text below (a real rendering bug in addCard, fixed at the theme level for every deck, not just worked around by shortening these). -->

1. **Rebuild** — same three roles as plain participants, now with `GroupChatBuilder(participants=[...], orchestrator_agent=..., termination_condition=...)`
2. **Orchestrator picks** — an LLM agent reads the shared conversation and picks who speaks next; no condition function to write
3. **Shared context** — the Planner already sees the Critic's rejection when re-selected, because the whole conversation is shared — no manual `to_revision` adapter needed
4. **Bound it too** — `termination_condition` is required for the same reason Part B2's was: stop once there have been 8 assistant turns, a reasonable ceiling for three roles and up to two revision passes

## Part B2 — Bound the loop
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Grounded directly in tests/test_guardrail.py's own docstring and the three tests it specifies. MAX_REVISIONS=2 and the capped=True field name are the lab's actual code, not illustrative — confirmed against workflow_nodes.py and the test file. -->

- Part B1's gate loops whenever `approved` is false — for a Critic that never approves (a genuinely ungroundable question), that's forever
- **Test-driven, not authored from scratch**: `tests/test_guardrail.py` ships failing — it IS the specification; edit `RevisionGate.decide` in `workflow_nodes.py` until all three tests pass
- The bound: stop at `MAX_REVISIONS` (2 revisions), stop gracefully — a low-confidence `Answer` with `capped=True`, never an exception — and a Critic that DOES approve still short-circuits immediately
- Not the same job as `WorkflowBuilder(max_iterations=...)`: that's a whole-graph backstop (defaults to 100 supersteps, and simply stops with no answer); this is a domain rule that ends the run deliberately, with an answer a caller can use. Keep both.

## Part C — Evaluate and compare
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: evaluate.py imports build_sequential_workflow / build_graph_workflow / build_group_chat_workflow from three separate files (part_a_sequential.py, part_b_graph.py, part_c_group_chat.py) — one function per part, not "Part B's three functions", which was this slide's old (inaccurate) framing. The comparison table's actual columns, per evaluate.py's own report() function, are pass rate, cost/success, and a raw revisions count — there is no separate "guardrail-trip rate" column. -->

- Imports one `build_*_workflow()` function each from `part_a_sequential.py`, `part_b_graph.py`, and `part_c_group_chat.py` — no new orchestration code
- Runs the SAME golden-set slice against **all three constructions**: Sequential, custom graph, Group Chat
- Reports a comparison table: pass rate (as a range across repetitions), cost per success, and total revisions — side by side for all three
- **Reflect** — which approach fit best, and why — write it down, it's part of Done

## Build one golden set, use it for Part C
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Same discipline as Day 3 Part E, at workflow scale — Module 5's own framing. Matches the lab's own current golden_set.jsonl and README exactly (8 cases across 4 branches) — updated from an earlier ~15-question, 3-branch spec after the lab's restructure. Parts A and B1/B2's own demos use one hand-picked question each, not the golden set — the golden set's job is Part C's statistical comparison. -->

- Same discipline as Day 3 Part E, at workflow scale: real queries, expected outcomes, not synthetic passes
- The lab's own golden set: 8 cases across 4 branches — small on purpose, since every case runs against all 3 constructions × 3 repetitions (~72 workflow runs already)
- Cover the workflow's real branches: grounded (clean single-document lookup), revision (spans documents, needs the loop), no_retrieval (general knowledge, no tools), and partial (corpus answers half — naming the gap is correct, inventing the rest is a failure)
- Build it once, before Part C — every construction runs against the exact same set, so the comparison means something

## Run the trajectory evaluation
<!-- layout: list -->
<!-- source: https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Rewritten to match evaluate.py's own "WHAT IT MEASURES" docstring exactly — all four of these ARE implemented and printed, deterministic and local, no judge model required for the core comparison. The previous version of this slide claimed cost-per-outcome was "not implemented" — it is; PartResult.cost_per_success is real, working code. --foundry is an optional extra pass that also sends the same trajectories to Foundry's cloud evaluators. -->

- **Task success** — deterministic, local, no judge model: the answer contains what `must_mention` requires and cites what `expected_citations` requires
- **Citation accuracy** — did it cite the documents the answer actually needs (and cite NOTHING on a no-retrieval question)?
- **Trajectory** — the ordered tool calls against `expected_actions`; the same ground truth Foundry's Task Navigation Efficiency evaluator consumes when you add `--foundry`
- **Cost per success** — total tokens across every agent, divided by the cases that passed; a construction that succeeds cheaply beats one that succeeds expensively at the same pass rate

## Prerequisites
<!-- layout: cards -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation -->
<!-- notes: Mirrors Day 3 Module 9's prerequisites-card style. Matches labs/day4/README.md's own prerequisites list, including the Foundry judge model being for the optional --foundry cloud pass only — the core comparison (pass rate, cost/success, revisions) is local and deterministic, no judge model required. Card 4 corrects an earlier stretch-goal claim about an Azure DevOps Ticket agent that was never built into this lab; there is no ADO-related lab content. Part D is real and optional -- provided complete, not authored. -->

1. **Day 3 lab complete** — a working single agent with memory, streaming, structured outputs, and MCP
2. **Bundled reference docs** — included in the repo (`labs/day4/python/data/docs/`); nothing to provision, no live knowledge base required
3. **A Foundry judge model deployment** — optional: only for `evaluate.py --foundry`'s cloud evaluator pass; the core comparison is local and deterministic
4. **(Optional) Python 3.13** — only for Part D's declarative workflow; `agent-framework-declarative` doesn't yet support 3.14. Parts A-C need whatever Python 3.11+ you're already using

## Definition of done
<!-- layout: table -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/agents/evaluation | https://learn.microsoft.com/en-us/agent-framework/agents/looping -->
<!-- notes: Reworded for the A/B1/B2/C structure — each row now matches labs/day4/README.md's own per-part "Definition of done" bullets almost verbatim, rather than paraphrasing a since-superseded 3-part (A/B/C) shape. The Part B2 guardrail is a required deliverable, not a stretch goal. The last row replaces an earlier "Ticket agent files a real ADO work item" stretch claim that was never built into this lab -- there is no ADO-related lab content -- with Part D, which is real, optional, and provided complete. -->

| Area | Done when |
|---|---|
| Part A | Both runs complete and print a trace you can read; you can explain why Run 2 ends without fixing itself |
| Part B1 | The graph runs end-to-end and the Mermaid diagram shows the loop-back edge; you can point to the one line that closes the cycle |
| Part B2 | All of `tests/test_guardrail.py` passes — **required**, not stretch |
| Part C | The `GroupChatBuilder` construction runs end-to-end with a working termination bound; you've run the 3-repetition comparison |
| Reflection | Which construction you'd actually ship, and why — committed to the repo |
| Part D (optional) | `uv run --python 3.13 part_d_declarative.py` prints `Hello, Alice!` |

## Takeaways
<!-- layout: takeaways -->
<!-- source: https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/ | https://learn.microsoft.com/azure/foundry/concepts/evaluation-evaluators/agent-evaluators -->
<!-- notes: Close the core Day 4 live time here. Learners have every primitive from Modules 1-6 before starting the lab. Reworded for the A/B1/B2/C structure — Part B2's guardrail is test-driven, a distinct authoring mode from Parts A/B1/C's TODOs, worth naming explicitly. -->

- You start with the fastest correct orchestration and find its ceiling before you fix it — Part A's `SequentialBuilder`, then Part B1's custom graph, deliberately in that order.
- You build the same three roles three different ways — Sequential, a custom graph, Group Chat — and watch the same limitation get fixed two different ways.
- You build the guardrail Module 6 argued for as a test-driven spec, not an afterthought — Part B2's failing test IS the requirement, required for both loops this lab can trigger.
- You measure every construction against the same golden set in one dedicated evaluation pass, so the differences you see are real, not noise.
