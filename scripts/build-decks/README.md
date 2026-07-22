# Deck generators

These scripts generate the `.pptx` files under `decks/dayN/` from Node.js.
The **source of truth for slide *content* and *speaker notes*** is the markdown under `slides/dayN/`.
The `.pptx` files are for delivery; the markdown is for review, editing, and reference.

## Regenerate

```bash
cd scripts/build-decks
npm install
node day1.js
```

The script writes to `decks/day1/*.pptx`.

## Design principles
- **Content only.** No stock imagery, no clipart, no accent lines under titles.
- **Sandwich structure.** Dark navy title/section slides; light body slides.
- **One motif.** Thin left-edge navy bar on body slides; module tag top-right.
- **Code as code.** Monospace, subtle gray fill; no syntax coloring gimmicks.

If you add a new visual pattern, add a helper for it in `theme.js` and reuse it — do not one-off styles.
