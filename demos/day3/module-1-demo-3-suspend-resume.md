# Module 1 · Demo 3 — Suspend/resume: service-managed vs. in-memory

**Placement:** After **slide 5 — "Built-in storage modes"** (Module 1).

**Time:** ~5 min total (30s framing + 2 min service-managed run + 2 min
in-memory run + 30s payoff)

**Language:** Python (MAF SDK). Runs the official
[`suspend_resume_session.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/conversations/suspend_resume_session.py)
sample **as-is, with zero adaptation** — the strongest grounding available
for a Day 3 demo.

## What it shows

The previous slide's table drew a hard line between two storage modes:
**local session state** vs. **service-managed storage**. This demo makes
that line visible by running the identical suspend/resume sequence — same
two lines of code, `session.to_dict()` then `AgentSession.from_dict()` —
against two different backends in the same script:

- **`suspend_resume_service_managed_session()`** — a `FoundryChatClient`
  agent. Foundry owns the conversation server-side; the session payload
  still round-trips through the same two calls.
- **`suspend_resume_in_memory_session()`** — an `OpenAIChatCompletionClient`
  agent. There is no backing service tracking history; the payload itself
  is the only place the conversation lives.

Both paths ask "What do you remember about me?" after a suspend/resume
cycle, and both answer correctly — proving the API contract is identical
even though what's actually *inside* the serialized payload is
completely different per backend.

**What this demo is NOT:** it doesn't explain compaction, storage
durability, or authorization — those are separate slides/modules. This
demo isolates one question: does `to_dict()`/`from_dict()` behave the
same regardless of who owns history? Yes — and seeing the *payload
contents* differ between the two backends is the point.

## Setup checklist

Do this **before the module starts**:

- **Clone the sample** (or have `agent-framework` checked out locally) —
  file: `python/samples/02-agents/conversations/suspend_resume_session.py`
- **`az login`** completed, correct subscription selected (for the
  Foundry path)
- **`FOUNDRY_PROJECT_ENDPOINT`** exported or in `.env` (the sample's
  `FoundryChatClient(credential=credential)` call uses the default
  environment-based configuration — no explicit `project_endpoint=`
  kwarg needed if the env var is set)
- **`OPENAI_API_KEY`** available for the in-memory comparison path — **this
  is a real prerequisite decision point.** If a personal/team OpenAI key
  isn't something you want to expose in a Publix-facing session, either:
  (a) use a low-spend/rate-limited test key reserved for this one call, or
  (b) narrate the in-memory half from a captured dry-run screenshot instead
  of running it live, and only run the Foundry half live. Decide before
  the day, not mid-module.
- **`uv sync`** wherever the sample lives — installs `agent-framework`,
  `agent-framework-openai`, `azure-identity`, `python-dotenv`
- **Dry-run once**, both paths, to confirm both API paths are reachable
  from the presenter machine that day

## Narration + steps

**Opening (30s):**
"The last slide said: decide who owns history — your process, or a
backing service. Let's run the exact same suspend/resume code against
both, so you can see the contract hold steady while the internals
completely change."

**Step 1 — Run the sample (~30s to start)**

```bash
uv run python suspend_resume_session.py
```

**Step 2 — Service-managed half (~2 min)**

Let the Foundry section run. Read the output aloud:
- "Serialized session: {...}" — point at the shape: an id plus Foundry's
  own conversation reference
- The resumed run answering "Alice, pizza" correctly

**Say:** *"Foundry is tracking this conversation server-side. What we
serialized is mostly a pointer back to that server state — small
payload, but it only means something if Foundry still has the
underlying conversation."*

**Step 3 — In-memory half (~2 min)**

Let the OpenAI section run. Read the output aloud, then diff it mentally
against Step 2's payload:
- The serialized payload here is larger / self-contained — it likely
  carries the actual message history, not just a pointer
- The resumed run still answers "Alice, pizza" correctly

**Say:** *"Same two method calls. Completely different payload contents.
Nothing outside this process remembers this conversation — the JSON
blob you just saw IS the conversation."*

**Step 4 — Payoff (~30s)**

**Say:** *"This is exactly the previous slide's decision, proven live:
local/self-managed means your payload carries the message list and you
own retention. Service-managed means your payload carries a reference and
the backend owns retention. Same API. Different ownership. Pick
deliberately."*

## Expected result

- Both suspend/resume calls succeed and correctly recall "Alice" and
  "pizza" after resuming
- The two printed `serialized_session` payloads are visibly different in
  size/shape (Foundry: mostly a reference; OpenAI: substantive message
  content)
- Total elapsed clock: under 5 minutes

## Fallback story if it breaks live

**Most likely failures:**
- Missing or expired `OPENAI_API_KEY` — auth error on the in-memory half
  only; the Foundry half is unaffected
- `az login` session expired — auth error on the Foundry half only
- Rate limiting on either backend

Have these ready:
1. **Screenshot of the full console output** from a successful dry run,
   both halves
2. **A one-line note** on which payload was larger and why, in case you
   need to explain the diff without a live side-by-side

Story: *"This is what a clean run of both halves looks like from my
dry run last night. The pattern is what matters — same API, different
ownership, visible in the payload shape."*

Then advance the slide.

## Teaching payoff

*"You just watched the exact same two lines of code mean two different
things depending on who owns history. That's not an implementation detail
to memorize — it's the decision the previous slide asked you to make for
your own application, made concrete."*

## Reference

- [`suspend_resume_session.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/conversations/suspend_resume_session.py) — the exact, unmodified sample this demo runs
- [Sessions & conversation state (Python)](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/session?tabs=python) — concept grounding
- [Storage (Python)](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/conversations/storage?tabs=python) — the "Built-in storage modes" table the preceding slide now quotes verbatim
- Module 1 slide 5 ("Built-in storage modes") — the table this demo makes concrete
