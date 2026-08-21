# Module 1 · Demo 2 — Query planning in slow motion

**Placement:** After **slide 8 — "Retrieval reasoning effort — pick the level per question"** (Module 1).

**Time:** ~5 min total (30s framing + 3.5 min walk-through across two portals + 1 min payoff)

**Language:** Two portals — the Foundry Playground to run the agent question, and the **Azure AI Search** chat playground to see the query plan. No live code.

## What it shows

The unified ranking pipeline slide describes an abstract flow: query
planning → sub-searches → merging → citation stitching. This demo lets the
audience literally see each stage — but there's a portal trick you have to
know about first:

**Foundry IQ connects to your agent via MCP.** From the Foundry agent's
trace, IQ shows up as **exactly one MCP tool call**. That confirms
retrieval happened and returned some chunks, but the interesting decomposition
is opaque on the Foundry side.

The **query plan itself lives in Azure AI Search's chat playground**,
inside the knowledge base's own **activity log**. That's where you see the
sub-queries the planner generated, the searches it ran in parallel, and the
answer-synthesis pass at the end. Same knowledge base — two different
portals, two different levels of detail.

This demo pivots between the two:
- **Foundry Playground:** ask the multi-hop question, look at the agent's
  trace, and land the "IQ is one MCP call from the agent's view" point.
- **Azure AI Search chat playground:** ask the same question against the
  underlying knowledge base, open the **activity log**, and walk the
  planned sub-queries + reasoning stages one by one.

## Setup checklist

Do this **before the module starts**:

- **Demo 1's `contoso-docs-kb` is created and attached** to the docs-assistant
  agent (Module 1 · Demo 1 must have run first, or you did it manually
  in advance).

- **Verify the knowledge base has an LLM connected and reasoning effort ≥ Low.**
  Query planning only happens when both are true. If the KB is on
  **Minimal** reasoning effort, or has no chat-completion model attached,
  there is no query plan and no sub-queries — Foundry will still return
  chunks, but the activity log will be empty of `modelQueryPlanning`
  entries.

  **This is a demo-time requirement, not a production requirement.** As
  the previous slide made clear, Minimal is often the right choice for
  agent-consumed IQ (the agent's own LLM does the reasoning). For this
  demo we're temporarily raising effort to Low so the audience can watch
  the planner run.

  Check in the Azure portal → your **Azure AI Search** service →
  **Agentic retrieval** → **Knowledge bases** → open your KB → confirm:
    - A **Chat completion model** deployment is attached (e.g. a Foundry
      `gpt-5.6-luna` or another supported model — see Learn's [supported
      models list](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-create-knowledge-base#supported-models)).
    - **Retrieval reasoning effort** is set to **Low** (up to 3 sub-queries)
      or **Medium** (up to 5). Low is fine for this demo.

- **Have two browser tabs open, side by side:**
    - **Tab 1 — Foundry portal Playground** with your `docs-assistant`
      agent selected.
    - **Tab 2 — Azure AI Search portal** at your KB's chat playground:
      *your Search service* → **Agentic retrieval** → **Knowledge bases** →
      *your KB* → the built-in chat box. This is the tab where the
      activity log lives.

- **Warm up both pipelines** with a throw-away query in each tab at least
  an hour before your first module start. First-call latency after cold
  start can be 15+ seconds and would kill the demo pace.

- **Optional but nice:** enable **App Insights** on the Foundry project so
  the agent-side trace shows the MCP call cleanly. See Learn's
  [Set up tracing in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/observability/how-to/trace-agent-setup)
  guide — it's a one-time connection, no code changes. Not strictly
  required (the Playground shows the tool call inline), but it makes the
  "one MCP call" beat easier to point at.

## Narration + steps

**Opening (30s):**
"Slide said the ranking pipeline plans multiple sub-searches, runs them,
merges results, and stitches citations. That's easy to say. Let me show
you one running — and it means we hop between two portals, because Foundry
and Azure AI Search each expose a different slice of the same run."

### Step 1 — Ask the multi-hop question in the Foundry Playground (~45s)

In the **Foundry Playground** (Tab 1), ask the multi-hop question:

> *"If my rate limit increase request is stuck because my account is in
> payment_review, what does that mean and what should I do? Is there a
> billing impact I need to be aware of? What are the rate limits for
> the pro plan?"*

**Why this specific question:** it needs `rate-limits.md` (for the
rate-limit concept), `payment-review.md` (for the state and its meaning),
and `account-management.md` (for the escalation path). Three retrievals
from three different files. Single-hop retrieval would miss at least
one.

Wait for the response. The agent should reply with a multi-paragraph
answer that references all three concepts, with citations.

**Say (while the answer streams):** *"Notice this is one question but three
concepts — rate limits, payment_review state, and pro-plan billing. If
retrieval was just 'grab the top 3 chunks by cosine similarity,' this
would probably miss one of them."*

### Step 2 — Show the Foundry trace: it's one MCP call (~30s)

In the answer footer, click **View trace** (or navigate to the **Traces**
tab).

You'll see something like:

```
▶ agent_run
   ▶ tool_call: knowledge_base   (MCP)      ← IQ retrieval, opaque from here
      • result_count: N chunks
   ▶ chat_completion              (grounded answer generation)
   ▶ response_formatting          (citation attachment)
```

**Point at the `tool_call: knowledge_base` node and say:** *"From the
agent's perspective, IQ is one tool call. That's it. It reached out over
MCP, got back some chunks, and used them to answer. But 'reach out to IQ'
did a lot of work inside — planning, sub-searches, ranking — that isn't
visible on this side of the wire. Let me show you where that lives."*

### Step 3 — Same question in the Azure AI Search chat playground (~2 min)

Switch to **Tab 2 (Azure AI Search portal)**. You're already on your KB's
chat playground.

Paste the same multi-hop question into the chat box.

Wait for the answer. Then click the **debug icon** on the response — a
JSON **activity log** appears. It looks like this:

```json
[
  {
    "type": "modelQueryPlanning",
    "inputTokens": 1518,
    "outputTokens": 284,
    "elapsedMs": 3001
  },
  {
    "type": "azureBlob",
    "knowledgeSourceName": "contoso-docs",
    "count": 3,
    "elapsedMs": 456,
    "azureBlobArguments": {
      "search": "rate limit increase request status account payment_review"
    }
  },
  {
    "type": "azureBlob",
    "knowledgeSourceName": "contoso-docs",
    "count": 4,
    "elapsedMs": 596,
    "azureBlobArguments": {
      "search": "payment_review account state billing impact escalation"
    }
  },
  {
    "type": "azureBlob",
    "knowledgeSourceName": "contoso-docs",
    "count": 2,
    "elapsedMs": 472,
    "azureBlobArguments": {
      "search": "pro plan rate limits"
    }
  },
  {
    "type": "agenticReasoning",
    "retrievalReasoningEffort": { "kind": "low" },
    "reasoningTokens": 4832
  },
  {
    "type": "modelAnswerSynthesis",
    "inputTokens": 7514,
    "outputTokens": 1058,
    "elapsedMs": 12334
  }
]
```

Your exact numbers will differ. The **shape** is the point.

**Walk it aloud (in order):**

1. **`modelQueryPlanning`** — "This first entry is the planner running.
   The KB has a chat-completion model attached, and it just used ~1500
   input tokens to decompose my question. That's where the sub-queries
   are born."

2. **Three `azureBlob` entries** — "One per sub-query. Read the `search`
   field on each: this is the actual query text the planner generated
   for that shard. Notice they don't overlap — the planner split the
   concepts cleanly." Read the three `search` strings aloud.

3. **`agenticReasoning`** — "This entry shows how much reasoning budget
   we spent, and the effort level. `Low` here means up to three
   sub-queries. `Medium` would allow up to five. `Minimal` would skip
   the planner entirely and just do a single search."

4. **`modelAnswerSynthesis`** — "Final answer generation from the merged,
   ranked chunks. This is where the natural-language response gets
   written."

### Step 4 — Contrast with a single-hop question (~30s)

Ask this in the same AI Search chat box:

> *"What are the standard rate limits?"*

Open its activity log. You'll see:
- **One** `azureBlob` entry (not three)
- Same `modelQueryPlanning` header, but with a much smaller output
- Same `modelAnswerSynthesis` at the end

**Say:** *"Same pipeline, one sub-query. The planner adapted — this
question didn't need decomposing, so it didn't decompose. That's what
'planning' means. It's not always three sub-queries; some questions are
one."*

## Expected result

- **Foundry Playground answer** for the multi-hop question weaves rate
  limits, payment review, and pro-plan billing in one coherent
  response with citations.
- **Foundry trace** shows exactly one MCP `tool_call` for the knowledge
  base — no visible sub-query breakdown.
- **Azure AI Search activity log** for the multi-hop question shows a
  `modelQueryPlanning` entry, **three** `azureBlob` entries with distinct
  `azureBlobArguments.search` strings, an `agenticReasoning` entry, and a
  `modelAnswerSynthesis` entry.
- **Azure AI Search activity log** for the single-hop question shows the
  same shape but with **one** `azureBlob` entry.

## Fallback story if it breaks live

**Most likely failures:**
- Activity log is empty or missing `modelQueryPlanning` → the KB doesn't
  have an LLM connected, or reasoning effort is on `Minimal`. Fix the KB
  config, or switch to the fallback screenshot.
- `azureBlob` shows a `count` of 0 → the KB has no indexed content that
  matches, or ingestion didn't complete. Confirm Demo 1 finished
  successfully.
- Foundry trace UI is slow to load (~30s spinner) → skip the trace beat
  in Step 2, just say "from Foundry's view this is one MCP call" and
  jump to Step 3.
- Only one `azureBlob` on the multi-hop question → the planner decided
  it didn't need to split. Use it as a teaching point: "the planner
  chooses; here it decided this was answerable in one shot" — and pivot
  to the intended contrast in Step 4.

Have these ready:
1. A **screenshot of a good multi-hop activity log** with three
   `azureBlob` entries and their `search` strings visible
2. A **screenshot of a good single-hop activity log** for the contrast
   beat
3. A **saved Foundry answer** with clean citations

Story: *"The planner is model-driven, so its behavior varies slightly per
run. Here's an activity log from my dry-run where the decomposition is
clear — this is what your lab traces will look like when you inspect them
tomorrow."*

Then advance the slide.

## Teaching payoff

*"'Retrieval' isn't grep. Foundry gives you the summary — one MCP call
to IQ, some chunks come back. Azure AI Search gives you the mechanism —
a query plan, parallel sub-searches, semantic ranking, answer synthesis.
Both views are valid; the AI Search side is where you'd tune. When you
attach an IQ source in the lab, this pipeline is what you're delegating
to Foundry."*
