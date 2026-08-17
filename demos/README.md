# Demonstrations

Live demos that punctuate the lecture material to make abstract concepts
concrete. Each demo has its own markdown file with:

- Working title and slide placement
- Time budget (setup / demo / recovery)
- Pre-workshop setup checklist (what you need to bake in advance)
- Narration + step-by-step walk-through
- Expected result the audience should see
- Fallback story if the demo breaks live
- Teaching payoff (the one line to land)

## Structure

```
demos/
├── README.md               # you're here
└── dayN/                   # per-day demos
    ├── README.md           # per-day environment prereqs
    └── module-N-demo-N-<slug>.md
```

## Days

- [Day 2 demos](day2/README.md) — 10 demos across all 8 modules
- Day 1 demos — none yet (Day 1 lab is short enough that lecture flow doesn't need breaks)
- Day 3+ demos — not authored yet

## Presenter conventions

- **Pre-bake everything.** A live demo that hits an unexpected setup step
  breaks the concept you're teaching. Do it once with the presenter
  environment before the workshop.
- **Have a screenshot fallback.** Screenshots of the successful state
  captured during a dry run, filed with the demo, ready to present if
  the live version fails.
- **Time-box.** Each demo has a stated budget. If you're over by 2×,
  stop, land the payoff verbally, move on.
- **Rehearse each demo end-to-end at least once against the actual
  presentation environment** before the workshop.
