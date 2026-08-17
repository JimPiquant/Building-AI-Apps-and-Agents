# Module 1 · Demo 2 — Query planning in slow motion

**Placement:** After the *"unified ranking pipeline"* slide (Module 1 · slide 6).

**Time:** ~5 min total (30s setup narration + 3.5 min walk-through + 1 min payoff)

**Language:** Portal + Foundry trace viewer. No live code.

## What it shows

The unified ranking pipeline slide describes an abstract flow: query planning
→ sub-searches → merging → citation stitching. This demo takes a deliberately
multi-hop question, sends it to an IQ-attached agent, then opens the Foundry
trace viewer so the audience can literally see each stage in the pipeline
executed against real data.

The magic is in the **query planning** step: attendees will see IQ decompose
their single natural-language question into multiple sub-queries, run each
one against the source, and stitch the results back together with citations.
This is the pipeline slide, but live.

## Setup checklist

Do this **before the module starts**:

- **Demo 1's `contoso-docs-kb` is created and attached** to the docs-assistant
  agent (Module 1 · Demo 1 must have run first, or you did it manually
  in advance).
- The **Foundry portal is at your project**, with the **Traces** section
  bookmarked or already open in a second tab.
- **Tracing is enabled** for the project. Verify at
  Portal → Project → Settings → Observability → Tracing = On. Should be
  on by default; check anyway.
- **Warm up the pipeline** by running one throw-away query at least an hour
  before your first module start. First-call latency after cold start
  can be 15+ seconds and would kill the demo pace.
- The Playground page has your `docs-assistant` agent selected.

## Narration + steps

**Opening (30s):**
"Slide said the ranking pipeline plans multiple sub-searches, runs them,
merges results, and stitches citations. That's easy to say. Let me show you
one running."

**Step 1 — Ask a multi-hop question (~30s)**

In the Playground, ask the following (paste it, don't type live — you want
the demo to move):

> *"If my rate limit increase request is stuck because my account is in
> payment_review, what does that mean and what should I do?"*

**Why this specific question:** it needs `rate-limits.md` (for the rate-limit
concept), `payment-review.md` (for the state and its meaning), and possibly
`account-management.md` (for the escalation path). Three retrievals from
three different files. Single-hop retrieval would miss at least one.

Wait for the response. The agent should reply with a multi-paragraph answer
that references all three concepts, with citations.

**Say (while the answer streams):** *"Notice this is one question but three
concepts — rate limits, payment_review state, and what to do. If retrieval
was just 'grab the top 3 chunks by cosine similarity,' this would probably
miss one of them."*

**Step 2 — Open the trace (~2.5 min)**

1. In the answer footer, click **View trace** (or navigate: Traces → most
   recent trace).
2. Expand the trace tree.

You'll see something like:

```
▶ agent_run
   ▶ knowledge_query_planning       ← the interesting part
      • sub_query_1: "rate limit increase request status"
      • sub_query_2: "payment_review meaning"
      • sub_query_3: "account payment review escalation"
   ▶ knowledge_retrieval
      • sub_query_1 → 3 chunks from rate-limits.md
      • sub_query_2 → 4 chunks from payment-review.md
      • sub_query_3 → 2 chunks from account-management.md
   ▶ knowledge_merge_and_rank
      • 9 chunks → 5 ranked
   ▶ chat_completion (model call with grounding)
   ▶ response_formatting (adds citations)
```

Actual node names differ slightly — walk what you actually see.

**Walk it aloud (in order):**

1. **Query planning:** "This is the important one. The model here isn't your
   answer model. IQ has its own planner that turned my single question into
   three sub-queries. This is what 'medium retrieval effort' spent its budget
   on."

2. **Sub-searches:** "Three parallel searches against the vector store, one
   per sub-query. Each returned its own top chunks."

3. **Merge and rank:** "9 candidate chunks in, 5 out. This is the unified
   ranker on the slide — it's picking the top chunks across all sub-queries,
   not just returning the top-3 per sub-query."

4. **Model call:** "Now the answer model gets the 5 chunks as context. This
   is the only step where your model runs."

5. **Citations:** "Citations get attached after the answer is generated,
   pinned to which chunks each sentence came from. That's what appears in
   the playground answer as `[1]`, `[2]`, `[3]`."

**Step 3 — Ask a single-hop question for contrast (~30s)**

Ask: *"What are the standard rate limits?"*

Open its trace. The `knowledge_query_planning` step now shows just **one
sub-query**. Same pipeline, but IQ decided the question didn't need
decomposing.

**Say:** *"Same pipeline, one sub-query. The planner adapts to the
question. That's what 'planning' means — it's not always three
sub-queries. Some questions are one."*

## Expected result

- Playground answer for the multi-hop question weaves rate limits, payment
  review, and escalation in a single coherent response with 3+ citations
- Trace for the multi-hop question shows 3 planned sub-queries
- Trace for the single-hop question shows 1 sub-query
- Audience sees the same 5-node trace shape both times

## Fallback story if it breaks live

**Most likely failures:**
- Trace UI is slow to load (~30s spinner)
- Trace shows fewer sub-queries than expected (planner decides it's not needed)
- Answer comes back without citations (rare, but happens on cold start)

Have these ready:
1. A **screenshot of a good multi-hop trace** with 3 sub-queries visible
2. A **screenshot of a good single-hop trace** for the contrast beat
3. A **saved answer** with clean citations

Story: *"The planner is model-driven, so its behavior varies slightly per
run. Here's a trace from my dry-run where the decomposition is clear — this
is what your lab traces will look like when you inspect them tomorrow."*

Then advance the slide.

## Teaching payoff

*"'Retrieval' isn't grep. IQ is planning against the question, running
multiple sub-searches, and merging them before your answer model even
runs. When you attach an IQ source in the lab, this pipeline is what
you're delegating to Foundry."*
