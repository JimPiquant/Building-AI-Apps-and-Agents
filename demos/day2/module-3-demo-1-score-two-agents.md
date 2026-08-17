# Module 3 · Demo 1 — Score two agents live

**Placement:** After the *"the two must-know evaluators (Retrieval + Groundedness)"* slide (Module 3 · slide 8).

**Time:** ~4 min total (30s setup narration + 2.5 min run + 1 min diff-and-payoff)

**Language:** Python — reuses `labs/day2/python/evals/retrieval_eval.py` with a tiny driver script.

## What it shows

The slide introduces Retrieval and Groundedness as the two evaluators worth
memorizing. This demo runs both against **two agents on the same query set**
and shows the score delta:

- **Agent A**: docs-assistant WITH `contoso-docs-kb` attached (grounded)
- **Agent B**: docs-assistant WITHOUT any knowledge source (baseline)

Same instructions, same questions, same evaluators — only the knowledge
source differs. The score delta becomes the argument for grounding.

The audience sees eval as a **lever they can pull to prove a design
decision**, not just an exam at the end.

## Setup checklist

Do this **before the module starts**:

- **Both agents exist and work**:
  - `docs-assistant` with `contoso-docs-kb` attached (grounded)
  - `docs-assistant-baseline` — identical instructions, no knowledge source
- **Two transcripts pre-computed**:
  - `demos/day2/scratch/module-3-demo-1/grounded-transcript.jsonl`
  - `demos/day2/scratch/module-3-demo-1/baseline-transcript.jsonl`
  Both produced from the same 5-question set used in `part_a_grounded_agent.py`
  (3 answerable + 2 not).
- **`EVALUATION_MODEL`** env var set to your reasoning-model deployment name
- **A dry-run of `retrieval_eval.py`** against both transcripts, so you know
  the numbers to expect. Typical result at cohort 1 grounding: grounded ≈ 0.85
  retrieval / 0.90 groundedness; baseline ≈ 0.10 retrieval / 0.55
  groundedness. Your numbers will differ; know them going in.
- **A split terminal window** — one pane per agent's eval run.
- **The results dashboard slide** ready in a second monitor / window so you
  can slot the numbers in live.

Optional but nice: pre-authored table on a slide with `Retrieval` / `Groundedness`
rows and `Grounded` / `Baseline` columns, values written in as placeholders
you'll fill in verbally.

## Narration + steps

**Opening (30s):**
"You just saw what Retrieval and Groundedness measure. Let me show you why
they matter. I have two agents — same prompt, same questions, one with IQ,
one without. Watch what the evaluators say."

**Step 1 — Show the two transcripts side by side (~30s)**

In the terminal:

```bash
cat scratch/module-3-demo-1/grounded-transcript.jsonl | head -2
cat scratch/module-3-demo-1/baseline-transcript.jsonl | head -2
```

Point at the two answers to the same first question. Grounded answer should
be specific and cited; baseline answer will be hedged or generic.

**Say:** *"Same question, two answers. Your intuition says the grounded one
is better — but 'better' is vague. The evaluators put a number on it."*

**Step 2 — Run the eval on the grounded transcript (~45s)**

In the left pane:
```bash
EVALUATION_MODEL=$EVALUATION_MODEL \
uv run python evals/retrieval_eval.py \
    --transcript scratch/module-3-demo-1/grounded-transcript.jsonl
```

While it runs (~30s):

*"This is `retrieval_eval.py` — the same script you'll run in Part A of
the lab. It's calling Foundry's Retrieval evaluator and Groundedness
evaluator against each row of the transcript. Both evaluators are
LLM-as-judge, so they take a few seconds per row."*

**Step 3 — Run the eval on the baseline transcript (~45s)**

In the right pane:
```bash
EVALUATION_MODEL=$EVALUATION_MODEL \
uv run python evals/retrieval_eval.py \
    --transcript scratch/module-3-demo-1/baseline-transcript.jsonl
```

While it runs, keep talking:

*"Notice I'm running the exact same evaluator with the exact same
question set. Only the transcript changed. This is 'process eval' —
the retrieval piece isolated from everything else."*

**Step 4 — Show the results (~60s)**

Both panes finish. Read the four numbers aloud. Slot them into the
placeholder table on your slide (or write them on a whiteboard, or just
call them out).

Typical shape:

| Metric | Grounded | Baseline | Delta |
|---|---|---|---|
| Retrieval | 0.85 | 0.10 | +0.75 |
| Groundedness | 0.90 | 0.55 | +0.35 |

**Say:**
- *"Retrieval jumps 8×. That makes sense — the baseline has no docs to
  retrieve from, so anything above zero is a lucky guess by the judge model.*
- *"Groundedness only jumps 1.6×. The baseline answer isn't ungrounded — it's
  hedged, which the judge scores as partial credit. Groundedness alone
  doesn't tell you retrieval is broken.*
- *"You need BOTH metrics. That's the point of the slide before."*

## Expected result

- Grounded transcript scores meaningfully higher on Retrieval than baseline
- Grounded transcript scores meaningfully higher on Groundedness than baseline
- The delta between the two metrics is different (larger for Retrieval than
  for Groundedness) — that's the "you need both" argument, live

## Fallback story if it breaks live

**Most likely failures:**
- Judge model rate-limits (evaluators fan out to the judge; can throttle)
- Judge model returns a JSON parse error
- Foundry Evaluation SDK version drift

Have these ready:
1. A **screenshot of the two-pane output** from your dry run, both terminals
   showing the completed scores.
2. A **saved `part_a_baseline.json`** and `baseline_transcript_scores.json`
   with the numbers already in the table.

Story: *"Because the evaluators are LLM-as-judge, they hit the judge model
per row, and the judge has its own rate limits. This screenshot is from my
dry run last night — the numbers are the same shape. You'll run this
yourselves in Part A of the lab."*

Then advance the slide.

## Teaching payoff

*"Eval isn't the last thing you do — it's the lever you use to prove
your design decision. Attaching IQ moved Retrieval by 8× and Groundedness
by 1.6×. That's the value of the retrieval layer, in numbers. The lab
teaches you to run this loop yourself."*
