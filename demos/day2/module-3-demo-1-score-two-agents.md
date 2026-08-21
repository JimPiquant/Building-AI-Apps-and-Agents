# Module 3 · Demo 1 — Score two agents live

**Placement:** After **slide 5 — "Where to start — Retrieval and Groundedness"** (Module 3).

**Time:** ~4 min total (30s setup narration + 2.5 min run + 1 min diff-and-payoff)

**Language:** Python — reuses `labs/day2/python/evals/retrieval_eval.py` with a tiny driver script.

## What it shows

The slide positions **Retrieval** (process eval) and **Groundedness**
(system eval) as the two zero-setup starting points for RAG evaluation
— neither requires ground-truth labels. This demo runs
`retrieval_eval.py` against **two transcripts on the same query set**:

- **Grounded transcript**: docs-assistant WITH `contoso-docs-kb` attached
- **Baseline transcript**: docs-assistant WITHOUT any knowledge source

Same instructions, same 5 questions, one variable — the knowledge source.
What actually happens is even more interesting than a score delta: the
evaluator produces real scores for the grounded transcript, and **refuses
to score the baseline transcript at all** because every row's `context`
field is empty. That refusal is a real production signal — the eval
script is intentionally designed to say *"there's no retrieval, fix that
first"* rather than emit a misleading low score.

The audience sees eval as **a signal about the retrieval layer**, not
just a scoring tool.

## Setup checklist

Do this **before the module starts**:

- **The demo folder is self-contained** at `demos/day2/module-3-demo-1-score-two-agents/`:
  - `pyproject.toml` — eval-only deps (`azure-ai-evaluation`, `azure-identity`, `python-dotenv`)
  - `retrieval_eval.py` — a lightly-adapted copy of the lab's script that takes a transcript filename as a CLI arg
  - `part_a_grounded_transcript.jsonl` — docs-assistant WITH `contoso-docs-kb` attached
  - `part_a_baseline_transcript.jsonl` — plain docs-assistant, no knowledge source

  Both transcripts were captured by running the Day 2 lab's
  `part_a_grounded_agent.py` twice against the same 5-question set
  (3 answerable + 2 not).

- **`.env` file created** in the demo folder with these two values:

    ```
    AZURE_OPENAI_ENDPOINT=https://<your-foundry>.services.ai.azure.com
    EVALUATION_MODEL=gpt-5.6-luna
    ```

  The endpoint is the resource root (no `/openai` suffix). The
  evaluation model is the deployment name of a reasoning model
  available at that endpoint.

- **`uv sync` completed** in the demo folder to install eval deps.

- **A dry-run of `retrieval_eval.py` against the grounded transcript** so
  you know the numbers to expect. Scores are on a **1–5 scale**.
  Thresholds in the lab: Retrieval ≥ **3.5**, Groundedness ≥ **4.0**.
  Grounded scores clear both thresholds comfortably. Know your exact
  numbers going in.

- **Confirm the baseline refusal behavior in your dry-run** too.
  `retrieval_eval.py` hard-fails when any answerable row has empty
  context — the exact message is *"The transcript has no retrieved
  context. Attach a knowledge source to the agent and re-capture the
  transcript before evaluating it."* Exit code is non-zero. This is
  the demo's reveal; don't be surprised by it during the live run.

- **A split terminal window** — one pane per eval run.

- **The results dashboard slide** (or whiteboard) ready with a
  Retrieval / Groundedness × Grounded / Baseline matrix — leave the
  Baseline cells empty (they won't be filled).

## Narration + steps

**Opening (30s):**
"You just saw what Retrieval and Groundedness measure. Let me show you
why they matter — with two transcripts. Same 5 questions, one from an
agent with IQ attached, one from an agent with nothing attached. Watch
what the evaluator does with each."

**Step 1 — Show the two transcripts side by side (~30s)**

Both terminal panes start in the demo folder:

```bash
cd demos/day2/module-3-demo-1-score-two-agents
head -1 part_a_grounded_transcript.jsonl | jq '{query, answer, context_length: (.context | length)}'
head -1 part_a_baseline_transcript.jsonl | jq '{query, answer, context_length: (.context | length)}'
```

Point at the two answers to the same first question ("How do I generate
an API key?"). Grounded answer is specific, cites the docs, and includes
concrete steps. Baseline answer is literally *"I don't have that
information"* — the agent honestly refuses because it has no docs to
ground in. Context length delta (~27,000 vs 0) makes the underlying
"retrieval fed the model" story visible without dumping 27 KB of chunks
on the screen.

**Say:** *"Same question, two answers. One agent had 27 KB of retrieved
chunks in the context field. The other had zero. Watch what happens when
I ask the evaluator to score each."*

**Step 2 — Score the grounded transcript (~45s)**

In the left pane:

```bash
uv run python retrieval_eval.py part_a_grounded_transcript.jsonl
```

While it runs (~30s):

*"This is `retrieval_eval.py` — the same evaluator wiring you'll use in
Part A of the lab. It's calling Foundry's Retrieval and Groundedness
evaluators against each row of the grounded transcript. LLM-as-judge,
so it takes a few seconds per row."*

Read the scores aloud when it finishes. Both should clear thresholds
(Retrieval ≥ 3.5, Groundedness ≥ 4.0). Slot the numbers into the
Grounded column of your matrix.

**Step 3 — Try to score the baseline transcript (~30s)**

In the right pane:

```bash
uv run python retrieval_eval.py part_a_baseline_transcript.jsonl
```

The command exits almost immediately — no LLM calls, no scoring. The
error message reads:

> `The transcript has no retrieved context. Attach a knowledge source to the agent and re-capture the transcript before evaluating it.`

**Say (pause for a beat):** *"Look at that. The evaluator refused to
score my baseline transcript. It didn't return a low number. It didn't
return zero. It refused to run at all."*

**Step 4 — Land the reframe (~60s)**

*"Notice what the eval script is telling me. It's not saying 'your agent
is bad.' It's saying 'you have no retrieved context to evaluate.' That
is a design choice — a low score on empty context would be misleading.
It could be read as 'the retrieval layer is slightly bad' when the
truth is 'the retrieval layer doesn't exist.'*

*"This is the retrieval evaluator functioning as a signal about the
architecture, not as a scoring tool. It says: attach a knowledge source
first. Then come back and I'll score you.*

*"Now look at the two numbers in the grounded column. Those are real.
Retrieval [~4.5], Groundedness [~4.7]. Both above threshold, because
context was there and the answer used it."*

## Expected result

- Grounded transcript run: completes cleanly, both scores clear
  thresholds (Retrieval ≥ 3.5, Groundedness ≥ 4.0). A
  `part_a_grounded_transcript.result.json` is written next to the
  transcript.
- Baseline transcript run: **exits non-zero within a second** with the
  "no retrieved context" message — no LLM calls, no scores emitted, no
  result file written.
- Audience takes away: eval is a signal about **whether retrieval is
  happening**, not just a score for how well it's happening

## Fallback story if it breaks live

**Most likely failures:**
- Judge model rate-limits during the grounded run (evaluators fan out to
  the judge; can throttle)
- Judge model returns a JSON parse error on one row of the grounded run
- The baseline refusal doesn't happen (someone edited the guard;
  transcript has stray context)

Have these ready:
1. **A screenshot of the grounded eval output** from your dry run,
   showing all scores completed.
2. **A screenshot of the baseline eval error** — the exact
   `"no retrieved context"` message. This one is the money shot.
3. **A saved `part_a_grounded_transcript.result.json`** from the
   grounded run with the numbers already in the matrix.

Story: *"Because the evaluators are LLM-as-judge, they hit the judge
model per row. This is what the runs look like when it works. Same
shape every time — grounded scores here, and the baseline gets refused
right there."*

Then advance the slide.

## Teaching payoff

*"Eval isn't the last thing you do — it's the lever you use to prove
your design decision. It's also a signal about your architecture.
Grounded transcript: real scores. Baseline transcript: the evaluator
refused to score at all, because there's nothing to score when
retrieval doesn't happen. The lab teaches you to run this loop
yourself — and to trust what it tells you."*
