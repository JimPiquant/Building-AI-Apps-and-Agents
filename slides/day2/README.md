# Day 2 — Grounding & Tools: Knowledge and Actions in depth

Eight modules total (~240 min live · budget). Each markdown file is the source of truth for module content and speaker-note text. The `.pptx` decks in [`decks/day2/`](../../decks/day2/) are generated from these plans by [`scripts/build-decks/day2.js`](../../scripts/build-decks/day2.js).

| # | Module | Time | Plan | Deck |
|---|--------|------|------|------|
| 1 | Foundry IQ deep dive — knowledge and grounding | 35m | [`module-1-foundry-iq.md`](module-1-foundry-iq.md) | [`decks/day2/module-1-foundry-iq.pptx`](../../decks/day2/module-1-foundry-iq.pptx) |
| 2 | Custom RAG when you need it — AI Search + vector stores | 40m | [`module-2-custom-rag.md`](module-2-custom-rag.md) | [`decks/day2/module-2-custom-rag.pptx`](../../decks/day2/module-2-custom-rag.pptx) |
| 3 | Evaluating retrieval | 25m | [`module-3-eval-retrieval.md`](module-3-eval-retrieval.md) | [`decks/day2/module-3-eval-retrieval.pptx`](../../decks/day2/module-3-eval-retrieval.pptx) |
| 4 | Tools layer deep dive — function calling model | 35m | (pending) | (pending) |
| 5 | Foundry Toolbox in practice | 25m | (pending) | (pending) |
| 6 | Authoring custom function tools in MAF | 35m | (pending) | (pending) |
| 7 | Combining knowledge + tools | 25m | (pending) | (pending) |
| 8 | Lab kickoff | 20m | (pending) | (pending) |

Total live time: **240 min** (right at budget; if we overrun, Module 3 or 5 is the trim candidate).

## What attendees build in the lab
A grounded, tool-using **docs assistant** — the Day 1 agent extended with a Foundry IQ knowledge source and two custom function tools (mock issue tracker; Day 3 swaps to real ADO MCP). Then run a small retrieval eval before/after iteration.

## Regenerate the decks
```bash
cd scripts/build-decks
npm install
node day2.js
```
