# Module 7 · Demo 1 — Retrieve-then-act with a trace

**Placement:** After the *retrieve-then-act pattern* slide with the login-500 example (Module 7 · slide 3).

**Time:** ~5 min total (30s setup narration + 3 min run + 90s trace walk-through)

**Language:** Python — uses `labs/day2/python/part_c_combined.py` (the completed lab solution).

## What it shows

The slide just described retrieve-then-act with the "user reports a 500 on
login → agent classifies from docs → files a ticket with the right
priority" example. This demo runs that exact flow live, opens the Foundry
trace viewer, and walks the audience through the **specific ordering of
steps** in the trace:

1. Knowledge retrieval fires FIRST.
2. Model reasons over the retrieved chunk.
3. `create_ticket` fires SECOND, with the classification the docs suggested.

The abstract pattern from the slide becomes a real trace with real timestamps.

## Setup checklist

Do this **before the module starts**:

- **Part C of Day 2's lab is fully working** on the presenter machine.
  Confirm by running `uv run python part_c_combined.py` end-to-end at
  least once beforehand.
- **The combined agent has the Module 7 four-line instruction template**
  (the version that steers retrieve-then-act correctly).
- **Ticket backend is fresh** — `mock_backend.py`'s `BACKEND` is
  module-scoped and stays populated across runs while the process is up,
  but restarting Python resets it. Restart before the demo so the new
  ticket ID is predictable (usually `20000`).
- **Tracing is enabled** in your Foundry project (Portal → Project →
  Observability → Tracing = On).
- Have a **saved trace URL from a dry run** ready as fallback.
- **Terminal** at `labs/day2/python/`, `uv sync`'d.
- **Second monitor / tab** on the Foundry Traces page for your project.

## Narration + steps

**Opening (30s):**
"That's retrieve-then-act as a slide. Let me show you the actual
timestamps. I've got a fully-wired agent from Part C — docs attached,
tools attached, four-line instructions from this module. I'll ask the
login-500 question and open the trace."

**Step 1 — Fire the question (~45s)**

In the terminal, run a one-shot version of the combined agent. If you
prefer to keep it in `part_c_combined.py`, edit `DRIVER_QUERIES` to just
the login-500 case for the demo. Or use an inline harness — a Python
REPL or a small `demo.py` script:

```python
import asyncio
from part_c_combined import build_combined_agent

async def main():
    agent = build_combined_agent()
    response = await agent.run(
        "I keep getting 500 errors when I POST /login. Please file a ticket."
    )
    print(response)

asyncio.run(main())
```

Run it. Wait for the response. The agent should:
- Reference the troubleshooting doc's classification of 500 errors
- Create a ticket with priority `high` (from the docs' guidance)
- Include the classification in the ticket body

**Say (while it's running, ~15s):** *"This is one call. Under the hood,
the agent is going to make several decisions in a specific order. The
lecture said the order matters. Let's see it."*

**Step 2 — Open the trace (~90s)**

1. Foundry portal → Traces → most recent.
2. Expand the trace tree.

You'll see something like:

```
▶ agent_run  (t=0s)
   ▶ knowledge_retrieval           (t=0.4s)  ← FIRST
      • retrieved: troubleshooting-login.md (chunk about 500 errors)
   ▶ chat_completion (round 1)     (t=1.2s)
      • model plans: "docs say 500 = auth service; file ticket"
   ▶ tool_call: create_ticket      (t=2.1s)  ← SECOND
      • args: {title: "Auth service 500...", priority: "high", body: "..."}
   ▶ tool_result                    (t=2.3s)
      • "Created ticket 20000"
   ▶ chat_completion (round 2)     (t=2.5s)
      • model summarizes for the user
```

Node names differ slightly across Foundry versions — walk what you see.

**Walk it aloud (30s per beat):**

1. **Retrieval fires first.** *"Look at the timestamp. Retrieval was
   step 1. The agent didn't call `create_ticket` first and then look up
   docs — it retrieved, then reasoned, then acted. That's what the
   'retrieve-then-act' order looks like."*

2. **The model reasoned over the retrieved chunk.** *"Round 1 of the
   chat completion is where the model decided WHICH tool to call and
   WITH WHAT ARGUMENTS. That decision came from the retrieved doc.
   Priority `high` isn't hallucinated — it's from the troubleshooting
   doc."*

3. **The tool call fires with the classification embedded.** *"Look at
   the args. The ticket title mentions the classification. That's the
   docs shaping the tool call. Without retrieval-first, you'd get a
   ticket that says 'Login fails' — accurate but useless."*

4. **The tool result flows back for a final round.** *"Round 2 of the
   completion is just the model formatting the response for the user.
   The interesting decisions are already made."*

## Expected result

- Terminal shows the agent responding with a ticket ID and a
  classification-aware summary
- Trace shows knowledge_retrieval BEFORE tool_call:create_ticket
- Ticket `create_ticket` args include priority `high` and a title/body
  that references the auth service or 500 classification
- The whole sequence takes ~3–5 seconds

## Fallback story if it breaks live

**Most likely failures:**
- Model picks priority `med` instead of `high` (instructions weren't tight enough on that run — LLM variance)
- Model calls `create_ticket` without retrieving first (instructions drifted)
- Trace viewer is slow (>30s to load)

Have these ready:
1. A **saved trace URL** from a successful dry run (right-click → copy link
   in the trace tree; it stays valid for weeks).
2. A **screenshot of the annotated trace** with the timestamps highlighted.
3. A **screenshot of the tool call args** showing priority `high` and the
   classification-aware title.

Story: *"Live agent output has LLM variance. Here's the trace I captured
last night — same shape every time we've run it. Retrieval, reason, act.
That's what the pattern looks like."*

Then advance the slide.

## Teaching payoff

*"'Order matters' isn't just theory. The trace shows retrieval before
action. When you get to Part C of the lab, this is what a working
combined agent looks like. When it goes wrong — you look at the trace
and the order tells you which failure mode you're in."*
