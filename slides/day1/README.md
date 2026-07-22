# Day 1 — Foundations: Foundry + MAF + Toolbox + Foundry IQ

Seven module plans, in delivery order. **These markdown files are the source of truth for module content and speaker-note text** — the `.pptx` decks in [`decks/day1/`](../../decks/day1/) are generated from these plans by [`scripts/build-decks/day1.js`](../../scripts/build-decks/day1.js).

If you edit content, edit the markdown here **and** update the corresponding module function in the deck generator so the two stay in sync.

| # | Module | Time | Plan | Deck |
|---|--------|------|------|------|
| 1 | Azure AI landscape & decision framework | 25m | [`module-1-landscape.md`](module-1-landscape.md) | [`decks/day1/module-1-landscape.pptx`](../../decks/day1/module-1-landscape.pptx) |
| 2 | Foundry portal tour | 45m | [`module-2-foundry-portal.md`](module-2-foundry-portal.md) | [`decks/day1/module-2-foundry-portal.pptx`](../../decks/day1/module-2-foundry-portal.pptx) |
| 3 | Prompt engineering fundamentals | 25m | [`module-3-prompt-engineering.md`](module-3-prompt-engineering.md) | [`decks/day1/module-3-prompt-engineering.pptx`](../../decks/day1/module-3-prompt-engineering.pptx) |
| 4 | MAF 101 | 40m | [`module-4-maf-101.md`](module-4-maf-101.md) | [`decks/day1/module-4-maf-101.pptx`](../../decks/day1/module-4-maf-101.pptx) |
| 5 | The agent stack, end-to-end | 35m | [`module-5-agent-stack.md`](module-5-agent-stack.md) | [`decks/day1/module-5-agent-stack.pptx`](../../decks/day1/module-5-agent-stack.pptx) |
| 6 | Client-side vs. Foundry-hosted agents | 35m | [`module-6-hosting-styles.md`](module-6-hosting-styles.md) | [`decks/day1/module-6-hosting-styles.pptx`](../../decks/day1/module-6-hosting-styles.pptx) |
| 7 | Guided walkthrough + lab kickoff | 25m | [`module-7-lab-kickoff.md`](module-7-lab-kickoff.md) | [`decks/day1/module-7-lab-kickoff.pptx`](../../decks/day1/module-7-lab-kickoff.pptx) |

Total live time: **230 min** (leaves ~10 min buffer against the 240-min budget).

## Regenerate the decks

```bash
cd scripts/build-decks
npm install
node day1.js
```
