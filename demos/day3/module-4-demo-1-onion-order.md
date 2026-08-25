# Module 4 · Demo 1 — The onion, printed

**Placement:** After **slide 3 — "Middleware executes like an onion"** (Module 4).

**Time:** ~5 min total (30s framing + 90s Run 1 + 90s Run 2 + 60s payoff)

**Language:** Python (MAF SDK). Runs the official
[`agent_and_run_level_middleware.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/middleware/agent_and_run_level_middleware.py)
sample as-is.

## What it shows

The previous slide diagrammed the onion order in the abstract: agent-level
middleware outermost (A1, A2), run-level middleware inside it (R1, R2),
agent execution at the center — enter left-to-right, exit right-to-left.
This sample builds exactly that shape and prints every enter/exit line as
it happens:

- **Agent-level** (applied to every run): `SecurityAgentMiddleware`,
  `performance_monitor_middleware`, `function_logging_middleware`
- **Run-level** (Run 2 only): `HighPriorityMiddleware`, passed to that one
  `agent.run(..., middleware=[...])` call

Run 1 (no run-level middleware) shows only the agent-level prints. Run 2
(with `HighPriorityMiddleware`) shows the agent-level prints wrapping the
run-level prints, in the exact nesting order the diagram promised.

**What this demo is NOT:** it does not cover chat middleware or function
middleware frequency in depth — `function_logging_middleware` appears
here only as a fourth agent-level layer riding along; Module 4's earlier
frequency table already covers that distinction conceptually.

## Setup checklist

Do this **before the module starts**:

- **Clone or vendor the sample** into
  `demos/day3/module-4-demo-1-onion-order/agent_and_run_level_middleware.py`
  (unmodified copy)
- **`az login`** completed, correct subscription selected
- **`FOUNDRY_PROJECT_ENDPOINT`** exported or in `.env`
- **`uv sync`** — installs `agent-framework`, `agent-framework-foundry`,
  `azure-identity`, `python-dotenv`
- **Dry-run once** to confirm the print ordering is legible on your
  terminal font size — there's a lot of console output across 4 runs

## Narration + steps

**Opening (30s):**
"The last slide's diagram claimed a specific order: agent middleware
enters first, run middleware enters next, the agent executes, then
everything unwinds in reverse. Let's watch it print, line by line."

**Step 1 — Run 1: agent-level only (~90s)**

```bash
uv run python agent_and_run_level_middleware.py
```

Let Run 1 print. Point at the three prefixed lines:
`[SecurityMiddleware]`, `[PerformanceMonitor]`, `[FunctionLog]`.

**Say:** *"No run-level middleware yet. Just the three agent-level layers
wrapping the call. Notice `[PerformanceMonitor]`'s timing print only
appears AFTER `call_next()` returns — that's the unwind half of the
onion."*

**Step 2 — Run 2: agent + run-level (~90s)**

Let Run 2 print. Point at `[HighPriority]` appearing nested inside the
agent-level prints.

**Say:** *"Same three agent-level layers, still outermost. Now
`HighPriorityMiddleware` — passed only to THIS run — sits inside them.
Enter order: security, performance, function-log, then high-priority.
Exit order: high-priority first, then the agent-level layers unwind in
reverse. That's the diagram, printed."*

**Step 3 — Payoff aside (~60s)**

**Say:** *"This is why the frequency table on the earlier slide matters.
Agent-level middleware you register once runs on every single call whether
you remember it or not. Run-level middleware is scoped — it only wraps the
one request you attached it to. Get this backwards and you'll either pay
for logging on every call you didn't want, or miss a guardrail on the one
call you needed it most."*

## Expected result

- Run 1 prints exactly the three agent-level middleware entries/exits,
  in registration order on entry and reverse order on exit
- Run 2 additionally prints `HighPriorityMiddleware`'s entry/exit nested
  inside the agent-level layers
- Total elapsed clock: under 5 minutes (the sample also runs Runs 3–4;
  stop after Run 2 to stay on time, or let it continue if the room wants
  the caching-middleware payoff too)

## Fallback story if it breaks live

**Most likely failures:**
- Terminal output wraps or scrolls too fast to read the enter/exit order
  clearly — consider a larger font or slowing down between runs with a
  manual pause
- `FoundryChatClient` auth hiccup (expired `az login` session)

Have these ready:
1. **Screenshot of Run 1's full console output**
2. **Screenshot of Run 2's full console output**, with the nesting
   visually annotated (e.g., indentation added in a text editor) if the
   raw terminal output is hard to read live

Story: *"This is what the print order looked like from my dry run — read
top to bottom for enter order, and the last few lines bottom-to-top for
exit order. The nesting is the whole point."*

Then advance the slide.

## Teaching payoff

*"The onion diagram wasn't decorative. Every layer really does enter in
registration order and exit in reverse — and now you've seen the actual
print statements prove it, not just a slide."*

## Reference

- [`agent_and_run_level_middleware.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/middleware/agent_and_run_level_middleware.py) — the exact, unmodified sample this demo runs
- [Middleware overview (Python)](https://learn.microsoft.com/en-us/agent-framework/concepts/agents/middleware/?tabs=python) — concept grounding
- Module 4 slide 3 ("Middleware executes like an onion") — the diagram this demo proves live
