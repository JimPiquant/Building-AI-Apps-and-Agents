// Build all 7 module decks for Day 1.
// Speaker notes are populated on every slide from the corresponding section
// in slides/day1/module-N-*.md — the markdown remains the source of truth.

const path = require("path");
const pptxgen = require("pptxgenjs");
const T = require("./theme");

const OUT_DIR = path.resolve(__dirname, "..", "..", "decks", "day1");

// ---------- MODULE 1 — Azure AI Landscape ----------
function buildModule1() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 1 · 25 MIN",
    title: "Azure AI Landscape",
    subtitle: "Where MAF, Foundry, and Copilot Studio fit",
    footer: "Building AI Apps and Agents",
  }), [
    "Say: this module is a compass, not code",
    "Audience: senior devs + solution architects — respect their experience",
    "Set expectation: decisions first, code starts Module 4",
    "Time: 25 min total — keep it moving",
    "Nothing in this module needs a demo",
  ]);

  {
    const { slide, contentTop, contentW } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "Why this module",
    });
    T.addProse(slide, "By the end of this workshop you'll be building agents. Before writing code, you need to know which surface to build on — and when. Today's decisions have outsized impact on cost, control, and portability.",
      { y: contentTop, w: contentW, h: 3.5, fontSize: 18 });
    T.notes(slide, [
      "Frame the whole module in one sentence: 'before you write a line of code, decide which surface to build on'",
      "Reassure: this module is short (25 min), light on code",
      "Ask: who's already been sold on a specific approach?",
      "If hands go up, promise you'll cover fit vs. their situation",
      "Move quickly — the payoff slides come next",
    ]);
  }

  // --- NEW 2026-08-19: define what an agent is before we start using the word ---
  // Grounded in https://learn.microsoft.com/agent-framework/journey/from-llms-to-agents
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "What is an agent?" });
    T.addProse(slide,
      "A raw LLM call is stateless. Every request starts from scratch — no memory of prior turns, no tools wired up, no persistent identity, no guardrails.",
      { y: contentTop, h: 0.9, fontSize: 15 });
    T.addProse(slide,
      "That's fine for a single question. For anything real, you'd be reinventing the same plumbing for every application:",
      { y: contentTop + 0.95, h: 0.6, fontSize: 13, italic: true });
    T.addTable(slide, [
      ["Raw LLM call", "Agent"],
      ["Full control over every API parameter", "Opinionated abstractions that handle common patterns"],
      ["No memory, no tools, no identity", "Persistent identity + tools + session + middleware"],
      ["You wire up state, tool dispatch, retry logic", "Framework handles the loop"],
      ["Tightly coupled to one provider", "Swap providers without changing app code"],
    ], { colW: [4.4, 4.8], rowH: 0.55, fontSize: 12 });
    slide.addText("An agent wraps an LLM with the structure needed to build real applications — persistent identity, instructions, tools, memory, and a runtime loop that orchestrates it all.", {
      x: 0.4, y: 5.05, w: 9.2, h: 0.7,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "NEW 2026-08-19: Module 1 previously used 'agent' without defining it",
      "This slide defines it before we build with it",
      "The definition is a direct quote from Learn — 'agent wraps an LLM with the structure...'",
      "Left column of the trade-off table = MAF's docs 'raw LLM call' side",
      "Right column = what MAF gives you (which the NEXT slide diagrams)",
      "Anchor: 'you're not here to write raw LLM calls; the workshop teaches how to compose the right side of that table'",
      "Source: aka.ms/agent-framework/journey/from-llms-to-agents",
    ]);
  }

  // --- NEW 2026-08-19: the 'What an agent adds' diagram from the Learn doc ---
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "What an agent adds" });

    // Outer "Agent" container
    const outerX = 1.0, outerY = 1.2, outerW = 8.0, outerH = 3.8;
    slide.addShape("rect", {
      x: outerX, y: outerY, w: outerW, h: outerH,
      fill: { color: T.COLORS.white },
      line: { color: T.COLORS.navy, width: 2 },
    });
    slide.addText("Agent", {
      x: outerX + 0.1, y: outerY + 0.05, w: 1.5, h: 0.35,
      fontFace: T.FONTS.title, fontSize: 13, bold: true, color: T.COLORS.navy, margin: 0,
    });

    // Row 1 — three small boxes (Instructions, Tools, Session)
    const row1Y = outerY + 0.5, row1H = 0.9;
    const innerLeft = outerX + 0.3;
    const innerW = outerW - 0.6;
    const smallW = (innerW - 0.4) / 3;
    ["Instructions", "Tools", "Session"].forEach((label, i) => {
      const x = innerLeft + i * (smallW + 0.2);
      slide.addShape("rect", {
        x, y: row1Y, w: smallW, h: row1H,
        fill: { color: T.COLORS.ice },
        line: { color: T.COLORS.navy, width: 1 },
      });
      slide.addText(label, {
        x, y: row1Y, w: smallW, h: row1H,
        fontFace: T.FONTS.title, fontSize: 15, bold: true, color: T.COLORS.navy,
        align: "center", valign: "middle", margin: 0,
      });
    });

    // Row 2 — Middleware Pipeline
    const midY = row1Y + row1H + 0.25;
    const midH = 0.7;
    slide.addShape("rect", {
      x: innerLeft, y: midY, w: innerW, h: midH,
      fill: { color: T.COLORS.ice },
      line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("Middleware Pipeline", {
      x: innerLeft, y: midY, w: innerW, h: midH,
      fontFace: T.FONTS.title, fontSize: 15, bold: true, color: T.COLORS.navy,
      align: "center", valign: "middle", margin: 0,
    });

    // Row 3 — LLM Provider (swappable)
    const provY = midY + midH + 0.25;
    const provH = 0.7;
    slide.addShape("rect", {
      x: innerLeft, y: provY, w: innerW, h: provH,
      fill: { color: T.COLORS.ice },
      line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("LLM Provider (swappable)", {
      x: innerLeft, y: provY, w: innerW, h: provH,
      fontFace: T.FONTS.title, fontSize: 15, bold: true, color: T.COLORS.navy,
      align: "center", valign: "middle", margin: 0,
    });

    // Caption + citation below the box
    slide.addText("The rest of the workshop works with one or more of these layers directly.", {
      x: 0.4, y: 5.1, w: 9.2, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy, align: "center",
    });
    slide.addText("Diagram: Microsoft Learn · aka.ms/agent-framework/journey/from-llms-to-agents", {
      x: 0.4, y: 5.5, w: 9.2, h: 0.25,
      fontFace: T.FONTS.body, fontSize: 9, italic: true, color: T.COLORS.muted, align: "center",
    });

    T.notes(slide, [
      "Diagram + table adapted verbatim from Learn — From LLMs to Agents",
      "Walk each layer aloud (this is what the audience needs to leave with):",
      "  Instructions — persona, constraints, output format. Set once, applied to every call.",
      "  Tools — the ability to act (call APIs, query databases, run code). Framework handles the tool-call loop.",
      "  Session — conversation history and multi-turn state. Agent remembers what happened before.",
      "  Middleware — intercept requests/responses for logging, guardrails, caching, behavioral overrides.",
      "  LLM Provider — swappable backend. Foundry, OpenAI, Anthropic — without rewriting agent code.",
      "Say: 'this week you'll write code that composes each of these boxes'",
      "Day 4 covers middleware in depth; Day 3 covers tools + session; Day 5 covers guardrails + providers",
    ]);
  }
  // --- end 2026-08-19 additions ---

  // ===== DEMO 1.2 · What an agent adds (live diff) =====
  T.notes(T.demoSlide(pres, {
    tag: "Day 1 · Module 1 · Demo",
    title: "What an agent adds — live diff",
    time: "~4 min",
    description: "Two terminal panes, same question. Left: raw LLM call — no tool, no session, no memory. Right: MAF Agent with get_current_time tool + explicit session. Left says it can't get the time and forgets Turn 1; right calls the tool, gets the real time, and recalls the earlier question. Makes the 'agent wraps LLM' diagram tangible.",
    reference: "Runbook: demos/day1/module-1-demo-2-agent-diff.md",
  }), [
    "DEMO 1.2 · ~4 min",
    "Split terminal, both panes ready",
    "Left = raw_llm.py, right = agent_with_context.py",
    "Question in both: 'What time is it right now, and remember I asked you this.'",
    "Left Turn 1: model hedges (no real-time info); Turn 2: forgets",
    "Right Turn 1: calls get_current_time, prints real ISO timestamp; Turn 2: recalls specific earlier question",
    "Point at the diff: same-size code, different capability",
    "Fallback: pre-recorded video at demos/day1/recordings/module1-demo2-agent-diff.mp4",
    "Payoff line: 'Every layer on the previous slide is doing real work in the right pane.'",
  ]);


  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "Three surfaces you can build on" });
    T.addTable(slide, [
      ["Surface", "Audience", "Sweet spot"],
      ["Copilot Studio", "Makers, business analysts", "Low-code agents for M365, Teams, Power Platform"],
      ["Microsoft Foundry", "Developers", "Full model + agent platform on Azure"],
      ["Microsoft Agent Framework (MAF)", "Developers", "The SDK your app code uses to build agents on top of Foundry"],
    ], { colW: [3.0, 2.8, 3.4], rowH: 0.75 });
    T.notes(slide, [
      "The three surfaces are complementary, not competitive",
      "Copilot Studio → makers, business analysts, M365 destinations",
      "Foundry → developer platform on Azure",
      "MAF → the SDK your code uses on top of Foundry",
      "Be explicit: 'if your target audience is makers, this is not your workshop'",
      "Do not disparage Copilot Studio — it's the right tool for a different job",
      "This workshop is for the developer audience",
    ]);
  }

  {
    const { slide, contentTop, contentW } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "Same three ingredients across every surface",
    });
    // Three surface cards along the top
    const cardY = 1.3, cardH = 1.4, cardW = 2.9, gap = 0.25;
    const startX = (10 - (3 * cardW + 2 * gap)) / 2;
    const cards = [
      { name: "Copilot Studio", note: "SaaS · low-code" },
      { name: "Foundry Agent Service", note: "PaaS · managed runtime" },
      { name: "MAF + containers", note: "IaaS · you own everything" },
    ];
    cards.forEach((c, i) => {
      const x = startX + i * (cardW + gap);
      slide.addShape("rect", {
        x, y: cardY, w: cardW, h: cardH,
        fill: { color: T.COLORS.white },
        line: { color: T.COLORS.navy, width: 1 },
      });
      slide.addText(c.name, {
        x: x + 0.1, y: cardY + 0.15, w: cardW - 0.2, h: 0.5,
        fontFace: T.FONTS.title, fontSize: 18, bold: true, color: T.COLORS.navy, align: "center", margin: 0,
      });
      slide.addText(c.note, {
        x: x + 0.1, y: cardY + 0.75, w: cardW - 0.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, color: T.COLORS.muted, align: "center", margin: 0,
      });
    });
    // "All need:" label
    slide.addText("All three need:", {
      x: 0.4, y: 3.05, w: 9.2, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted, align: "center", margin: 0,
    });
    // Three ingredient pills
    const pillY = 3.5, pillH = 0.8, pillW = 2.6, pillGap = 0.35;
    const pillStartX = (10 - (3 * pillW + 2 * pillGap)) / 2;
    ["Model", "Instructions", "Tools"].forEach((label, i) => {
      const x = pillStartX + i * (pillW + pillGap);
      slide.addShape("roundRect", {
        x, y: pillY, w: pillW, h: pillH,
        fill: { color: T.COLORS.navy }, line: { type: "none" }, rectRadius: 0.15,
      });
      slide.addText(label, {
        x, y: pillY, w: pillW, h: pillH,
        fontFace: T.FONTS.title, fontSize: 22, bold: true, color: T.COLORS.white, align: "center", valign: "middle", margin: 0,
      });
    });
    slide.addText("Same ingredients everywhere. What changes is how much code you write and who owns the runtime.", {
      x: 0.4, y: 4.7, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.navy, align: "center",
    });
    T.notes(slide, [
      "Anchor slide — the payoff for the whole module",
      "Every agent needs three things: Model, Instructions, Tools",
      "That's true whether you're in Copilot Studio, Foundry, or writing raw MAF code",
      "What changes across surfaces: how much code you write, who owns the runtime",
      "Sets up the next slide's IaaS/PaaS/SaaS spectrum",
      "Pause for questions here — this is where the mental model clicks or doesn't",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "A decision framework, visualized" });
    // Top axis with two labels
    slide.addText("More control, more code", {
      x: 0.4, y: 1.25, w: 4.4, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 13, bold: true, color: T.COLORS.navy, align: "left", margin: 0,
    });
    slide.addText("Faster to build, less customization", {
      x: 5.2, y: 1.25, w: 4.4, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 13, bold: true, color: T.COLORS.navy, align: "right", margin: 0,
    });
    // The bar itself — 3 segments across 8.8 inches
    const barY = 1.8, barH = 0.7, barX = 0.6, barTotal = 8.8;
    const segW = barTotal / 3;
    const segments = [
      { label: "IaaS", fill: "0F1A44" },   // deepest navy
      { label: "PaaS", fill: T.COLORS.navy },
      { label: "SaaS", fill: "6B7BB0" },   // lighter navy
    ];
    segments.forEach((s, i) => {
      slide.addShape("rect", {
        x: barX + i * segW, y: barY, w: segW, h: barH,
        fill: { color: s.fill }, line: { color: T.COLORS.white, width: 1 },
      });
      slide.addText(s.label, {
        x: barX + i * segW, y: barY, w: segW, h: barH,
        fontFace: T.FONTS.title, fontSize: 22, bold: true, color: T.COLORS.white, align: "center", valign: "middle", margin: 0,
      });
    });
    // Under-bar surface labels
    const labels = [
      "Containers + OSS frameworks",
      "Foundry Agent Service + MAF",
      "Copilot Studio",
    ];
    labels.forEach((label, i) => {
      slide.addText(label, {
        x: barX + i * segW, y: barY + barH + 0.1, w: segW, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, bold: true, color: T.COLORS.navy, align: "center", margin: 0,
      });
    });
    // Descriptions
    const descs = [
      "You own everything. Not covered.",
      "Managed runtime; you own the agent code. This workshop.",
      "Portal-first, low-code. Not covered.",
    ];
    descs.forEach((d, i) => {
      slide.addText(d, {
        x: barX + i * segW + 0.1, y: barY + barH + 0.55, w: segW - 0.2, h: 1.4,
        fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
      });
    });
    // Callout at bottom
    slide.addShape("rect", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.5,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "This workshop lives in PaaS territory. ", options: { bold: true } },
      { text: "You write real code; you don't run the infrastructure." },
    ], {
      x: 0.55, y: 4.78, w: 8.9, h: 0.44,
      fontFace: T.FONTS.body, fontSize: 14, color: T.COLORS.navy, margin: 0,
    });
    T.notes(slide, [
      "Piggyback on vocabulary attendees already know",
      "IaaS = OSS frameworks + containers you run",
      "PaaS = Foundry Agent Service + MAF (this workshop)",
      "SaaS = Copilot Studio",
      "Say clearly: 'this workshop lives in PaaS territory'",
      "PaaS = you write real code, you don't run the infrastructure",
      "This slide replaces a bullet list — the visual lands harder, let it breathe",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "When is an agent the right answer?" });
    slide.addText("Not every LLM problem needs an agent. Match complexity to need.", {
      x: 0.4, y: 1.2, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted, margin: 0,
    });
    // Three stops horizontally, connected by an arrow line
    const stopY = 1.9, stopH = 2.5, stopW = 2.9, stopGap = 0.25;
    const stopStartX = (10 - (3 * stopW + 2 * stopGap)) / 2;
    // Arrow across the bottom of the stops
    slide.addShape("line", {
      x: stopStartX + 0.3, y: stopY + stopH + 0.15, w: 3 * stopW + 2 * stopGap - 0.6, h: 0,
      line: { color: T.COLORS.navy, width: 2, endArrowType: "triangle" },
    });
    slide.addText("Reach for the leftmost pattern that actually solves your problem", {
      x: stopStartX, y: stopY + stopH + 0.4, w: 3 * stopW + 2 * stopGap, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted, align: "center", margin: 0,
    });

    const stops = [
      {
        name: "Direct LLM call",
        eg: "\"Summarize this document.\"",
        traits: "No tools · no iteration · cheap · easy to eval",
      },
      {
        name: "Single agent with tools",
        eg: "\"Answer with sources; open a ticket if needed.\"",
        traits: "Iteration · tool calls · harder to eval",
      },
      {
        name: "Multi-agent workflow",
        eg: "\"Plan → retrieve → verify → act.\"",
        traits: "Multiple roles · costly · new failure modes",
      },
    ];
    stops.forEach((s, i) => {
      const x = stopStartX + i * (stopW + stopGap);
      slide.addShape("rect", {
        x, y: stopY, w: stopW, h: stopH,
        fill: { color: T.COLORS.white }, line: { color: T.COLORS.navy, width: 1 },
      });
      slide.addText(s.name, {
        x: x + 0.15, y: stopY + 0.15, w: stopW - 0.3, h: 0.5,
        fontFace: T.FONTS.title, fontSize: 16, bold: true, color: T.COLORS.navy, align: "center", margin: 0,
      });
      slide.addText(s.eg, {
        x: x + 0.15, y: stopY + 0.75, w: stopW - 0.3, h: 0.9,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
      });
      slide.addText(s.traits, {
        x: x + 0.15, y: stopY + 1.75, w: stopW - 0.3, h: 0.7,
        fontFace: T.FONTS.body, fontSize: 11, color: T.COLORS.muted, align: "center", valign: "top", margin: 0,
      });
    });
    T.notes(slide, [
      "Prevents the #1 anti-pattern: 'everything must be an agent'",
      "Match complexity to need — not every LLM problem needs orchestration",
      "Direct LLM call: summarize this doc — cheap, easy to eval",
      "Single agent w/ tools: iterative work that needs to *do* something",
      "Multi-agent workflow: distinct roles, hand-offs — costly, new failure modes",
      "Rule: reach for the leftmost pattern that solves the problem",
      "Ask 2–3 attendees: 'what pattern does your current use case actually need?'",
      "This connects directly to Day 4 (multi-agent) — plant the flag",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "What Foundry gives you",
    });
    T.addBullets(slide, [
      "Model deployments (frontier and open models)",
      "Playgrounds — chat, agent, evaluation",
      "Foundry Agent Service — runtime for Prompt agents (portal-authored, no code) and Hosted agents (your code, containerized, Foundry-run)",
      "Responses API — the single model + tools entry point; call it from your own code running anywhere",
      "Foundry Toolbox — curated tool/connector catalog, exposed via MCP",
      "Foundry IQ — enterprise knowledge and grounding layer",
      "Evaluators, tracing, and safety",
    ], { y: contentTop });
    T.notes(slide, [
      "Preview only — resist the urge to teach any of these",
      "Prompt agents / Hosted agents → Module 6 today",
      "Toolbox → Day 2 (Actions layer)",
      "Foundry IQ → Day 2 (Knowledge layer)",
      "Responses API → Module 6 today, deeper in Days 2–3",
      "Evaluators / tracing → Day 4 and Day 5",
      "This slide's job: land the vocabulary once so nothing feels new later",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "What MAF gives you",
    });
    T.addBullets(slide, [
      "One SDK for authoring agents — Python and C#",
      "One vocabulary: agents, sessions, tools, runs",
      "First-class streaming, memory, structured outputs",
      "Multi-agent orchestration primitives",
      "Consumes Foundry Toolbox and MCP servers",
      "The successor to Semantic Kernel and AutoGen patterns (both out of scope)",
    ], { y: contentTop });
    T.notes(slide, [
      "One vocabulary is the key selling point of MAF",
      "Same primitives (agent, session, tool, run) in Python and C#",
      "For attendees coming from SK or AutoGen: acknowledge the lineage",
      "Say: 'SK is still supported, not the forward path for new work'",
      "Say: 'AutoGen was the research predecessor to MAF'",
      "Don't disparage — attendees have shipped code with both",
      "MAF absorbed the lessons; the surface is cleaner",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "What we will and won't cover" });
    T.addTwoColumn(slide,
      [
        "Foundry (portal, deployments, connections)",
        "MAF — two hosting families (Foundry-hosted and self-hosted), covered in Module 6",
        "Toolbox and Foundry IQ",
        "MCP consumption and (stretch) authoring",
        "Evaluation at every layer",
        "Production concerns: observability, identity, cost",
      ],
      [
        "Copilot Studio (different audience)",
        "Semantic Kernel (MAF is the forward direction)",
        "AutoGen (research-lineage predecessor)",
        "Third-party frameworks (LangChain, CrewAI, etc.)",
        "Model fine-tuning, distillation, training",
        "On-prem / air-gapped deployments",
      ],
      { leftHeader: "Covered", rightHeader: "Out of scope" }
    );
    T.notes(slide, [
      "Set explicit expectations about scope",
      "If someone came expecting Copilot Studio depth: not this workshop",
      "If someone came expecting fine-tuning or model training: not this workshop",
      "Copilot Studio, SK, AutoGen, LangChain, CrewAI — all out of scope",
      "Explain why: MAF is the forward direction for production agent code",
      "Redirect anyone who needs the excluded topics to appropriate resources",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "Roadmap — how the week hangs together",
    });
    T.addTable(slide, [
      ["Day", "Theme"],
      ["1", "Foundations: the stack; three hosting options; first working agents"],
      ["2", "Grounding (Foundry IQ + custom RAG) and tools in depth"],
      ["3", "Single-agent depth: memory, streaming, structured outputs, MCP"],
      ["4", "Multi-agent patterns + evaluation as a first-class activity"],
      ["5", "Production concerns; capstone project kickoff"],
    ], { colW: [0.8, 8.4], rowH: 0.5, y: contentTop });
    T.notes(slide, [
      "Preview the 5-day arc in 60 seconds",
      "Days 1–3 build on the same 'docs assistant' reference project",
      "Day 4 turns the single agent into a multi-agent workflow",
      "Day 5 covers production + capstone kickoff",
      "Every day maps to the four-layer stack (Module 5)",
      "Post-workshop: capstone project reviewed 1:1",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 1", title: "Takeaways",
    bullets: [
      "Three surfaces target different audiences: Copilot Studio, Foundry, MAF.",
      "This workshop lives at Foundry + MAF.",
      "MAF is Microsoft's forward direction for agent SDKs; SK and AutoGen are not.",
    ],
    next: "A working tour of the Foundry portal — projects, models, deployments, Toolbox, Foundry IQ.",
  }), "Recap in 60 seconds. Take one or two questions max, then transition.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-1-landscape.pptx") });
}

// ---------- MODULE 2 — Foundry Portal Tour ----------
function buildModule2() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 2 · 45 MIN",
    title: "Foundry Portal Tour",
    subtitle: "Projects, models, deployments, connections, Toolbox, Foundry IQ",
    footer: "Building AI Apps and Agents",
  }), [
    "Mostly a live walkthrough — share screen early",
    "Slides are attendee reference, not primary teaching",
    "Have the Foundry portal open before this module starts",
    "Have at least one existing project + model deployment ready to show",
    "Time budget: 45 min — 25 in portal, 20 on slides for reference",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 2", title: "What you'll leave with",
    });
    T.addBullets(slide, [
      "Navigate a Foundry project confidently",
      "Find and deploy a model",
      "Test a model in the playground",
      "Locate your project endpoint (you'll paste this into your .env in the lab)",
      "Recognize Toolbox and Foundry IQ (deep-dive comes Days 2–3)",
    ], { y: contentTop });
    T.notes(slide, [
      "Goal: recognize the surfaces, not master any of them",
      "Attendees just need to feel oriented enough for Modules 4–6",
      "Deep material lands Days 2–3 (IQ, Toolbox) and Module 6 today (agent types)",
      "Attendees should walk out with: their project endpoint + one deployment name",
    ]);
  }

  {
    // Foundry resource architecture — canonical diagram from Microsoft Learn
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Foundry resource architecture" });

    // Center the image in the content area.
    // Native aspect 1800x1158 (1.554); target height 3.6" → width ~5.60"
    const imgH = 3.6;
    const imgW = imgH * (1800 / 1158);
    const imgX = (10 - imgW) / 2;
    const imgY = 1.2;
    slide.addImage({
      path: path.resolve(__dirname, "..", "..", "slides", "day1", "assets", "foundry-architecture.png"),
      x: imgX, y: imgY, w: imgW, h: imgH,
      altText: {
        title: "Foundry resource hierarchy",
        description: "Diagram showing a Foundry resource governance boundary containing model deployments, security settings, connections, and two projects. Connected resources — Storage, Key Vault, and Azure AI Search — are shown as separate governance boundaries.",
        name: "FoundryArchitecture",
      },
    });

    // Attribution caption
    slide.addText("Diagram: Microsoft Learn · aka.ms/foundry/architecture", {
      x: 0.4, y: imgY + imgH + 0.05, w: 9.2, h: 0.25,
      fontFace: T.FONTS.body, fontSize: 9, italic: true, color: T.COLORS.muted, align: "center", margin: 0,
    });

    // Bottom takeaway callout
    slide.addShape("rect", {
      x: 0.4, y: 5.05, w: 9.2, h: 0.5,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "Four layers to know: ", options: { bold: true } },
      { text: "Foundry resource → project → project assets → connected resources. Connected resources have their own networking and access policies." },
    ], {
      x: 0.55, y: 5.08, w: 8.9, h: 0.44,
      fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.navy, valign: "middle", margin: 0,
    });

    T.notes(slide, [
      "Canonical diagram from Microsoft Learn — walk it in this order:",
      "(1) Foundry resource = the outer box = governance boundary",
      "  → contains: model deployments, security & networking, connections",
      "(2) Project = the inner dashed box = development boundary",
      "  → contains: agents, files, evaluations (project assets)",
      "(3) Connected resources on the right (Storage, Key Vault, AI Search)",
      "  → separate Azure resources, separate governance boundaries",
      "  → Foundry references them via connections, doesn't own them",
      "Emphasize: 'connected resources have their own networking and access policies'",
      "Common failure: Foundry connection works, but the target resource's firewall blocks — check the target resource's own policies",
    ]);
  }

  // ===== DEMO 2.1 · Create a Foundry project, live =====
  T.notes(T.demoSlide(pres, {
    tag: "Day 1 · Module 2 · Demo",
    title: "Create a Foundry project, live",
    time: "~5 min",
    description: "Portal path from + New project → App Insights checkbox → gpt-5.6-luna deployment → project endpoint visible. Then a 90-second look at the az CLI equivalent for the IaC-first path. Attendees who haven't done pre-work realize this is a 5-minute click-through, not a day of Azure ceremony.",
    reference: "Runbook: demos/day1/module-2-demo-1-create-project.md",
  }), [
    "DEMO 2.1 · ~5 min",
    "Do NOT use the project the labs will use — create a separate demo project",
    "Portal: ai.azure.com → + New project → name it → SELECT App Insights checkbox",
    "  Call the checkbox out explicitly — this is what the pre-work doc mentions",
    "Then Deployments → + Deploy model → gpt-5.6-luna → deployment name gpt-5.6-luna",
    "Then a 90s aside showing the az CLI equivalent (do NOT run live)",
    "Portal walkthrough: Overview endpoint URL, Deployments, Connected resources, Agents (empty)",
    "Fallback: pre-created backup project + screenshots",
    "Payoff line: 'Five minutes, one project, App Insights connected. That's Part A's pre-work.'",
    "POST-WORKSHOP: az cognitiveservices account delete + az group delete for the demo project (cost)",
  ]);


  {
    // What lives where + RBAC starter
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "What lives where · starter RBAC" });
    T.addTwoColumn(slide,
      [
        "Model deployments",
        "Security & networking",
        "Connections to connected resources",
        "Resource-scoped RBAC roles (Foundry User, Foundry Owner)",
      ],
      [
        "Agents (Prompt agents, Hosted agents)",
        "Files",
        "Evaluations",
        "Project-scoped RBAC assignments",
      ],
      { leftHeader: "Foundry resource level", rightHeader: "Project level" }
    );
    slide.addShape("rect", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.6,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "Starter RBAC: ", options: { bold: true } },
      { text: "assign every developer " },
      { text: "Foundry User", options: { bold: true } },
      { text: " at the Foundry resource scope. That covers Day 1 lab access. Fine-grained project-scoped roles come later." },
    ], {
      x: 0.55, y: 4.6, w: 8.9, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.navy, valign: "middle", margin: 0,
    });
    T.notes(slide, [
      "Starter RBAC for the lab: Foundry User at the Foundry resource scope",
      "Foundry User was previously named Azure AI User — attendees may see either during rollout",
      "RBAC scopes at BOTH resource level and project level",
      "Day 1 lab access is covered by the resource-scope assignment",
      "401 / 403 in the lab almost always = missing Foundry User at resource scope",
      "If instructor hears '401' in chat: 'check RBAC first, then endpoint, then deployment name'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Project endpoints" });
    T.addProse(slide, "Every Foundry project has an endpoint like:", { y: 1.15, h: 0.4, fontSize: 15 });
    T.addCode(slide, "https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>", { y: 1.55, h: 0.6, fontSize: 18 });
    T.addProse(slide,
      "Set this as FOUNDRY_PROJECT_ENDPOINT in every lab's .env. MAF connects with this endpoint plus a credential — AzureCliCredential in dev, managed identity in production.",
      { y: 2.4, h: 1.5, fontSize: 15 });
    T.notes(slide, [
      "Show attendees where the project endpoint lives in the portal",
      "Path (verify live — portal wording moves): Overview → Endpoints and keys",
      "Have them copy it now — they'll need it in every lab",
      "Format: https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
      "Never commit this to source control — it belongs in .env",
      "The credential (AzureCliCredential) authenticates against this endpoint",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Model catalog" });
    T.addBullets(slide, [
      "Browse frontier models (OpenAI, Meta, Mistral, others by region)",
      "Filter by capability — chat, embeddings, vision, etc.",
      "See region availability, pricing tier, context window",
      "Not every model is available in every region — check region and quota first",
    ], { y: contentTop });
    T.notes(slide, [
      "Common gotcha: attendee picks a model, hits a region availability wall",
      "Not every model is available in every region",
      "Not every model has capacity in every region even when available",
      "Sequence: pick region → confirm model availability → confirm quota → deploy",
      "If attendee can't deploy: check region and quota first, not model choice",
      "Ignite 2026 will likely shift which models are where — check current state before workshop",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Model deployments" });
    T.addBullets(slide, [
      "A deployment is a named, callable instance of a specific model",
      { text: "Each deployment has:", indent: 0 },
      { text: "Deployment name — what you pass to MAF as model=…", indent: 1 },
      { text: "Model version", indent: 1 },
      { text: "Capacity — tokens per minute", indent: 1 },
      { text: "Region — inherited from the project", indent: 1 },
      "Rule of thumb: one deployment per (model, role) pair. Don't share prod and dev.",
    ], { y: contentTop, fontSize: 14 });
    T.notes(slide, [
      "The #1 confusion in the Day 1 lab: deployment name ≠ model name",
      "Model name: 'gpt-5.6-luna'",
      "Deployment name: whatever *you* named the deployment in the portal",
      "In MAF, you pass the DEPLOYMENT name as model= — not the model name",
      "In the .env file, FOUNDRY_MODEL = the deployment name",
      "Have attendees copy the exact deployment name from Portal → Deployments now",
      "Rule of thumb: one deployment per (model, role) pair — don't share prod and dev",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Playgrounds" });
    T.addBullets(slide, [
      "Chat playground — test a deployed model interactively",
      "Agent playground — test a Prompt agent or Hosted agent you've created in Foundry",
      "Prompt flow / evaluation playgrounds — for testing eval configurations",
      "Use playgrounds to sanity-check before writing agent code",
      "If it doesn't work in the playground, it won't work in MAF either",
    ], { y: contentTop });
    T.notes(slide, [
      "This slide is really a debugging tip",
      "Reinforce: iterate in the playground BEFORE writing agent code",
      "If a prompt doesn't work in the playground, it won't work in MAF",
      "Cheap iteration loop: playground → prompt fix → playground → deploy",
      "Attendees who skip this waste a lot of time debugging things that were prompt issues",
      "Three playgrounds worth knowing: chat, agent, evaluation",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Connections" });
    T.addBullets(slide, [
      "How a Foundry resource references other Azure services — AI Search, Storage, Key Vault, Fabric, and more",
      "Each connected resource is a separate Azure resource with its own networking and access policies",
      "Configured on the Foundry resource; projects inherit them",
      "Auth via managed identity or service principal — never long-lived keys in production",
      "We wire connections for Foundry IQ knowledge sources on Day 2",
    ], { y: contentTop });
    T.notes(slide, [
      "Reinforce the architecture diagram: connections = Foundry pointing at connected resources",
      "Connected resources have their OWN governance boundaries",
      "When a connection fails, check the target resource's policies first",
      "Auth: managed identity or service principal — NO long-lived keys in production",
      "Configured on the Foundry resource; projects inherit them",
      "We'll wire IQ knowledge-source connections on Day 2",
    ]);
  }

  T.notes(T.sectionSlide(pres, "Toolbox and Foundry IQ", "Introductions only — Days 2–3 go deep"),
    "Transition to portal areas we introduce today and revisit later.");

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Foundry Toolbox (intro)" });
    T.addBullets(slide, [
      "Curated catalog of ready-to-use tools an agent can attach to",
      "Includes: code interpreter, file search, Bing search, SharePoint, Fabric, Graph, custom skills",
      "Exposed to MAF over an MCP endpoint (same protocol as Day 3)",
      "Attach Toolbox tools to a Foundry-hosted agent from the portal, or from code",
    ], { y: contentTop });
    T.notes(slide, [
      "Bookmark: Toolbox = curated tool/connector catalog for agents",
      "We use it lightly today (Part B of the lab) and go deep Day 2",
      "Interesting fact for later: Toolbox is exposed via an MCP endpoint under the hood",
      "That ties Toolbox and Day 3's MCP topic together neatly",
      "Toolbox samples: web search, code interpreter, file search, SharePoint, Fabric, Graph",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Foundry IQ (intro)" });
    T.addBullets(slide, [
      "The knowledge / grounding layer of Foundry",
      "Unified retrieval across enterprise sources — AI Search indexes, SharePoint, OneLake / Fabric, and more",
      "Alternative to hand-rolling a RAG pipeline per source",
      "Agents that use it get grounded answers with citations, without you writing retrieval code",
    ], { y: contentTop });
    T.notes(slide, [
      "Bookmark: Foundry IQ = enterprise knowledge and grounding layer",
      "Day 2 is IQ's main course — don't teach it here",
      "The pitch: unified retrieval across your enterprise data",
      "Alternative to building a RAG pipeline per source",
      "Grounded answers with citations, without writing retrieval code",
      "Preview status — call out that some parts are moving fast",
    ]);
  }

  // Observability introduction (Day 1 intro; deep dive is Day 5)
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Observability" });
    T.addBullets(slide, [
      "Every agent run in Foundry emits a trace — no code to enable, built-in for Prompt and Hosted agents",
      "A trace records: model calls, tool invocations, decisions, latency, tokens, and errors",
      "View traces in the Foundry portal (Tracing / Observability), or ship them to Application Insights",
      "OpenTelemetry semantics under the hood — same spans you'd expect from any OTel-instrumented service",
      "You'll open a real trace in Part B of today's lab; Day 5 goes deep on production observability",
    ], { y: contentTop });
    slide.addText("Tracing for Prompt and Hosted agents is GA. Workflow and external-agent tracing is preview — relevant Day 4+.", {
      x: 0.4, y: 5.35, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "GROUNDING FIX 2026-08-19: Prompt/Hosted tracing is GA, not preview",
      "Only Workflow + external-agent tracing is preview — comes in Day 4+",
      "Awareness slide — Day 5 goes deep",
      "Point out: attendees don't have to configure anything for Prompt or Hosted agents; tracing is on by default",
      "  BUT: they must have Application Insights connected to the project first (see pre-work checklist)",
      "For Path C (your own code), you enable OTel yourself — Day 5 covers this",
      "A trace makes the abstract concrete: attendees literally SEE their model + tool calls",
      "Best debugging tool most attendees haven't tried yet",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Two axes to remember" });
    T.addTable(slide, [
      ["Axis", "Feature", "What it does"],
      ["Actions — how the agent does things", "Toolbox, MCP, function tools", "Callable capabilities"],
      ["Knowledge — how the agent knows things", "Foundry IQ, RAG", "Retrieval and grounding"],
    ], { colW: [3.5, 2.7, 3.0], rowH: 0.9, fontSize: 14 });
    T.notes(slide, [
      "The two-axis mental model attendees should carry all week",
      "Actions = how the agent DOES things — Toolbox, MCP, function tools",
      "Knowledge = how the agent KNOWS things — Foundry IQ, RAG",
      "Day 2 = Knowledge deep dive",
      "Day 3 = Actions deep dive (MCP)",
      "When something breaks, ask: is this an Actions problem or a Knowledge problem?",
    ]);
  }

  // New: Portal for learning · CLI for production — codifies the operating norm
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Portal for learning · CLI for production" });
    T.addProse(slide,
      "The portal is a great teacher and a great debugger. For creating resources and shipping changes, real teams use code.",
      { y: 1.15, h: 0.55, fontSize: 14, italic: true });
    T.addTwoColumn(slide,
      [
        "Exploring what Foundry can do",
        "Sanity-checking a prompt in the playground",
        "Inspecting a trace when something goes wrong",
        "Monitoring dashboards and metrics",
      ],
      [
        "Creating projects, deployments, agents",
        "Wiring connections to Storage / Key Vault / AI Search",
        "Deploying Hosted agents (zip + Foundry portal is a shortcut; azd / az is the norm)",
        "Anything that needs a repeatable, reviewable change",
      ],
      { y: 1.85, h: 2.8, leftHeader: "Use the portal for", rightHeader: "Use az / azd / SDK for" }
    );
    slide.addShape("rect", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.5,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "IaC-first operating norm: ", options: { bold: true } },
      { text: "resource creation and programmatic operations live in code. Every lab this week reflects that." },
    ], {
      x: 0.55, y: 4.78, w: 8.9, h: 0.44,
      fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.navy, valign: "middle", margin: 0,
    });
    T.notes(slide, [
      "Codifies the IaC-first operating norm — attendees should nod along",
      "Portal is fine for: exploring, playground, tracing, monitoring",
      "Code is the norm for: creating anything, deploying anything, changing anything",
      "az CLI = the general Azure command line",
      "azd = Azure Developer CLI, higher-level (deploy an app end-to-end)",
      "SDK = for programmatic operations from your code (creating agents, indexes, etc.)",
      "Terraform is a common default for IaC-first teams — out of scope for this workshop's content",
      "In today's lab: Part A creates the Prompt agent with the SDK, not the portal",
      "Day 5 deployment: az / azd paths lead, not portal deploy",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Common portal gotchas" });
    T.addBullets(slide, [
      "Quota errors on deployment — request a bump in the region before Day 1",
      "Missing role assignments — you need at least Foundry User (previously Azure AI User) at the Foundry resource scope; 401/403 usually means this",
      "Region mismatch — model deployment region must be reachable by IQ / AI Search",
      "Preview features move — Toolbox and parts of IQ are evolving; trust running code over screenshots",
    ], { y: contentTop });
    T.notes(slide, [
      "Give attendees the diagnostic sequence in a fixed order:",
      "  1. Quota — is your region out of capacity?",
      "  2. RBAC — do you have Foundry User at the resource scope?",
      "  3. Region — does the model live in your region?",
      "This ordering catches ~90% of Day 1 lab failures",
      "Preview features move — trust running code over screenshots",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Live walkthrough (in the portal now)" });
    T.addBullets(slide, [
      "Sign into ai.azure.com and open a project",
      "Deploy a model",
      "Copy the project endpoint",
      "Open the chat playground; send a test prompt",
      "Show the Toolbox catalog and one entry",
      "Show the Foundry IQ landing page and one pre-provisioned knowledge source",
    ], { y: contentTop });
    slide.addText("Try it yourself: do steps 1–4 on your own sub before the module ends.", {
      x: 0.4, y: 4.6, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Screen share the portal — this is a live demo, not a slide read",
      "Move steadily, don't linger",
      "Ask attendees to do steps 1–4 alongside you",
      "Ask them to raise a hand (or emoji in chat) if they hit a block",
      "Fix blocks in real time — do NOT let them accumulate to the lab",
      "Steps 5–6 (Toolbox, IQ) are demo-only for today",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 2", title: "Takeaways",
    bullets: [
      "Everything in Foundry lives inside a project.",
      "Copy your project endpoint and one model deployment name — you'll need both in every lab.",
      "Toolbox and Foundry IQ are today's introductions; Days 2–3 make them real.",
      "If portal pages don't work: quota → RBAC → region, in that order.",
    ],
    next: "Prompt engineering fundamentals — how to talk to models before we wrap them in agents.",
  }), "Short recap. Confirm everyone has their project endpoint copied.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-2-foundry-portal.pptx") });
}

// ---------- MODULE 3 — Prompt Engineering Fundamentals ----------
function buildModule3() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 3 · 30 MIN",
    title: "Prompts & Context Engineering",
    subtitle: "Everything that goes into the model on every turn",
    footer: "Building AI Apps and Agents",
  }), [
    "Renamed 2026-08-19: was 'Prompt Engineering Fundamentals', now covers full context engineering",
    "Time bumped from 25 min to 30 min to accommodate the four new context slides",
    "Original prompt-engineering content is unchanged — 4 new slides inserted mid-module",
    "Goal: acknowledge that prompting still matters, teach the disciplines that matter most, then broaden to everything in the context window",
    "If you run over 30 min, cut the anti-patterns slide OR the tradeoffs slide (but keep the tools-vs-providers distinction)",
  ]);

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Why this module" });
    T.addProse(slide,
      "Agents don't make prompt engineering obsolete — they concentrate it.",
      { y: 1.2, h: 0.5, fontSize: 18, italic: true });
    T.addBullets(slide, [
      "Instructions — the system prompt that defines behavior",
      "Tool descriptions the model reads to decide when to call something",
      "Structured output schemas whose field names and docstrings are prompts too",
    ], { y: 1.9, h: 2.5 });
    slide.addText("Sloppy prompts here cascade through your whole workflow.", {
      x: 0.4, y: 4.5, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 15, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Frame the module in one line: 'agents don't kill prompt engineering, they concentrate it'",
      "Prompts are now everywhere in your codebase, not just chat",
      "System prompts / instructions",
      "Tool descriptions (the model reads every docstring)",
      "Structured output schemas (field names + docstrings are prompts too)",
      "Discipline stays. Surface area gets bigger.",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Anatomy of a good system prompt" });
    T.addBullets(slide, [
      "Role and scope — who the agent is, what it may and may not help with",
      "How to respond — tone, length, format, when to say 'I don't know'",
      "How to use tools — when to call which tool, and what to do with the result",
      "Boundaries and safety — refusals, privacy, tenant scope",
    ], { y: contentTop });
    slide.addText("Under ~500 words. Longer often means tools or knowledge should be doing the work instead.", {
      x: 0.4, y: 4.5, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Four labeled sections is a strong default for a system prompt",
      "  1. Role and scope",
      "  2. How to respond (tone, length, format, 'I don't know')",
      "  3. How to use tools (when, which, what to do with the result)",
      "  4. Boundaries and safety (refusals, privacy, tenant scope)",
      "Keep it under ~500 words",
      "If longer, ask: 'should this be a tool or a knowledge source instead?'",
      "If time permits, walk through the docs-assistant instructions from the lab",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Anti-patterns" });
    T.addBullets(slide, [
      "The wall of rules — 40 numbered 'do not' statements. Something always gets violated.",
      "The example dump — ten worked examples in the system prompt. Move to few-shot messages.",
      "Prompting the wrong layer — 'search the docs for X' is a tool call, not a system-prompt line.",
      "Vague identity — 'you are a helpful assistant.' Every model already thinks that.",
      "Forgetting the audience — a prompt for engineers looks different than one for associates.",
    ], { y: contentTop });
    T.notes(slide, [
      "This is where senior devs perk up — they've hit these",
      "Ask: 'anyone recognize one of these from a past project?' (usually a few nods)",
      "Wall of rules: the more you list, the more the model ignores at least one",
      "Example dump in system prompt: move to few-shot messages",
      "Prompting the wrong layer: 'search the docs' is a tool call, not a prompt",
      "Vague identity: every model already thinks it's helpful — be specific",
      "Forgetting the audience: an engineer's prompt ≠ a store associate's prompt",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Two techniques worth investing in" });
    T.addTwoColumn(slide,
      [
        "Short, labeled sections beat a wall of paragraphs",
        "Models attend better to ## Role / ## Rules / ## Output format",
        "Consistent structure helps you diff prompts across versions",
      ],
      [
        "Tell the model exactly what shape you want",
        "Better yet — use structured outputs (typed models — Day 3)",
        "The shape is enforced, not requested",
      ],
      { leftHeader: "1. Structured instructions", rightHeader: "2. Explicit output contracts" }
    );
    T.notes(slide, [
      "Two techniques worth investing in this week:",
      "  1. Structured instructions — labeled sections beat prose walls",
      "  2. Explicit output contracts — tell the model exactly what shape",
      "Structure lands through the rest of the workshop",
      "Structured outputs (typed models) deepens on Day 3",
      "Best practice: define the shape, don't ask for it",
    ]);
  }

  // --- NEW 2026-08-19: broaden Module 3 from 'prompt engineering' to 'context engineering' ---
  // Grounded in https://learn.microsoft.com/agent-framework/journey/adding-context-providers

  // C1 — What's actually in the context window?
  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 3", title: "What's actually in the context window?",
    });
    T.addProse(slide, "Prompts are one input. On every turn the model actually sees:",
      { y: contentTop, h: 0.5, fontSize: 15 });
    T.addBullets(slide, [
      "System instructions — the agent's persona, rules, output format",
      "The user message — what the human just typed",
      "Session history — prior turns, the multi-turn memory",
      "Tool outputs — results from any tool the model called",
      "Retrieved documents — chunks pulled from RAG / Foundry IQ",
      "Injected context — anything a context provider added (user profile, time, memory)",
    ], { y: 1.7, h: 2.8, fontSize: 13 });
    slide.addText("The system prompt is what you write once. Everything else is what you have to design. That's context engineering.", {
      x: 0.4, y: 4.6, w: 9.2, h: 0.7,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/journey/adding-context-providers", {
      x: 0.4, y: 5.4, w: 9.2, h: 0.25,
      fontFace: T.FONTS.body, fontSize: 9, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "NEW 2026-08-19: framing slide that broadens Module 3 beyond just system prompts",
      "The system prompt is important — but it's ~10% of what the model sees",
      "The rest — history, tool outputs, retrieved chunks, injected context — is where real engineering happens",
      "Set up the tools-vs-providers slide next",
      "Anchor: 'if you only tune the system prompt, you're missing 90% of the surface area'",
    ]);
  }

  // C2 — Two ways to get information into the model (tools vs context providers)
  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 3", title: "Two ways to get information into the model",
    });
    T.addProse(slide, "Not everything belongs in the prompt. MAF gives you two distinct mechanisms:",
      { y: contentTop, h: 0.5, fontSize: 14 });
    T.addTable(slide, [
      ["Aspect", "Tools", "Context providers"],
      ["Trigger", "Reactive — model decides when to call", "Proactive — runs on every invocation"],
      ["Control", "Model-driven (which tool, when, args)", "Developer-driven (always available)"],
      ["Visibility", "Model must judge tool relevance", "Injected as part of the prompt"],
      ["Use case", "On-demand actions and lookups", "Always-present context"],
      ["Token cost", "Only when the tool is called", "Every invocation"],
    ], { colW: [1.5, 3.7, 4.0], rowH: 0.55, fontSize: 11 });
    slide.addText("Rule of thumb: if the agent should have this info every single time, use a provider. If only when relevant, use a tool.", {
      x: 0.4, y: 5.2, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "The killer distinction of this module — memorize this table",
      "Tools are reactive; context providers are proactive",
      "Both are legitimate; the choice is about pattern not preference",
      "Common failure: teams stuff everything into system prompt because they don't know providers exist",
      "Common failure #2: teams write a 'tool' for something that should be a provider — costs latency + inconsistency",
      "The rule of thumb is a direct quote from the Learn doc",
    ]);
  }

  // C3 — The context lifecycle (before-run injection / core / after-run extraction) diagram
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "The context lifecycle" });

    T.addProse(slide, "Every agent.run(...) call has three phases. Context providers hook into the first and third.",
      { y: 1.05, h: 0.4, fontSize: 13, italic: true });

    // Three stacked boxes with arrows between
    const boxX = 1.4, boxW = 7.2;

    // Box 1 — Before run
    const b1Y = 1.55, b1H = 1.15;
    slide.addShape("rect", {
      x: boxX, y: b1Y, w: boxW, h: b1H,
      fill: { color: T.COLORS.ice }, line: { color: T.COLORS.navy, width: 1.5 },
    });
    slide.addText("BEFORE RUN — providers inject context", {
      x: boxX + 0.15, y: b1Y + 0.05, w: boxW - 0.3, h: 0.3,
      fontFace: T.FONTS.title, fontSize: 12, bold: true, color: T.COLORS.navy, margin: 0,
    });
    slide.addText("• History provider loads past messages\n• Memory provider retrieves relevant facts\n• RAG provider searches knowledge base\n• Custom provider injects user profile, time, location", {
      x: boxX + 0.15, y: b1Y + 0.35, w: boxW - 0.3, h: b1H - 0.4,
      fontFace: T.FONTS.body, fontSize: 11, color: T.COLORS.ink, margin: 0,
    });

    // Arrow 1
    slide.addShape("downArrow", {
      x: (boxX + boxW / 2) - 0.15, y: b1Y + b1H + 0.02, w: 0.3, h: 0.22,
      fill: { color: T.COLORS.navy }, line: { color: T.COLORS.navy, width: 0 },
    });

    // Box 2 — Agent core
    const b2Y = b1Y + b1H + 0.35, b2H = 0.7;
    slide.addShape("rect", {
      x: boxX, y: b2Y, w: boxW, h: b2H,
      fill: { color: T.COLORS.white }, line: { color: T.COLORS.navy, width: 1.5 },
    });
    slide.addText("AGENT CORE — model sees input + all injected context, generates response", {
      x: boxX + 0.15, y: b2Y, w: boxW - 0.3, h: b2H,
      fontFace: T.FONTS.title, fontSize: 12, bold: true, color: T.COLORS.navy,
      align: "center", valign: "middle", margin: 0,
    });

    // Arrow 2
    slide.addShape("downArrow", {
      x: (boxX + boxW / 2) - 0.15, y: b2Y + b2H + 0.02, w: 0.3, h: 0.22,
      fill: { color: T.COLORS.navy }, line: { color: T.COLORS.navy, width: 0 },
    });

    // Box 3 — After run
    const b3Y = b2Y + b2H + 0.35, b3H = 1.0;
    slide.addShape("rect", {
      x: boxX, y: b3Y, w: boxW, h: b3H,
      fill: { color: T.COLORS.ice }, line: { color: T.COLORS.navy, width: 1.5 },
    });
    slide.addText("AFTER RUN — providers process the response", {
      x: boxX + 0.15, y: b3Y + 0.05, w: boxW - 0.3, h: 0.3,
      fontFace: T.FONTS.title, fontSize: 12, bold: true, color: T.COLORS.navy, margin: 0,
    });
    slide.addText("• History provider saves new messages\n• Memory provider extracts facts to remember\n• Custom provider updates session state", {
      x: boxX + 0.15, y: b3Y + 0.35, w: boxW - 0.3, h: b3H - 0.4,
      fontFace: T.FONTS.body, fontSize: 11, color: T.COLORS.ink, margin: 0,
    });

    slide.addText("You register providers once when creating the agent. They participate in every invocation.", {
      x: 0.4, y: 5.35, w: 9.2, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.muted, align: "center",
    });
    slide.addText("Diagram: Microsoft Learn · aka.ms/agent-framework/journey/adding-context-providers", {
      x: 0.4, y: 5.7, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });

    T.notes(slide, [
      "Adapt Learn's ASCII lifecycle diagram to real shapes",
      "Two hook points: BEFORE (inject) and AFTER (extract)",
      "This is a critical mental model — walk through one full turn aloud:",
      "  1. User asks 'what's the return policy?'",
      "  2. BEFORE: history provider adds last 3 turns; RAG provider searches for 'return policy' chunks",
      "  3. Model gets all of that + the question, generates 'You can return items within 30 days...'",
      "  4. AFTER: history provider saves both messages; memory provider might note the user asked about returns",
      "Register once; automatic every run",
      "Day 3 and Day 5 build on this pattern — memory, tracing, evaluation all hook into these phases",
    ]);
  }

  // ===== DEMO 3.2 · Tool vs. context provider =====
  T.notes(T.demoSlide(pres, {
    tag: "Day 1 · Module 3 · Demo",
    title: "Tool vs. context provider — which fires when?",
    time: "~4 min",
    description: "Same agent, same question, two configurations. Left pane wires get_user_orders as a tool — model decides to call, latency shows. Right pane injects the same data via a context provider — data was already in the prompt, answer is instant. Latency delta + reasoning delta prove the tools-vs-providers distinction.",
    reference: "Runbook: demos/day1/module-3-demo-2-tool-vs-provider.md",
  }), [
    "DEMO 3.2 · ~4 min",
    "Split terminal, left = tool_path.py, right = provider_path.py",
    "Same question: 'What is my most recent order?'",
    "Left: model reasons, calls get_user_orders, ~2-4s round trip",
    "Right: provider already injected the data — ~1-2s straight to answer",
    "Read both elapsed times aloud from the printed output",
    "Fallback: pre-recorded video at demos/day1/recordings/module3-demo2-tool-vs-provider.mp4",
    "Payoff line: 'Always-needed data goes in a provider. Sometimes-needed data is a tool.'",
    "PRE-DELIVERY CHECK: verify ChatContextProvider / before_invoke API against current Learn docs",
  ]);


  // C6 — The tradeoffs
  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 3", title: "The tradeoffs",
    });
    T.addProse(slide, "More context isn't automatically better. Five things to design for:",
      { y: contentTop, h: 0.5, fontSize: 14 });
    T.addTable(slide, [
      ["Consideration", "What can go wrong"],
      ["Token budget", "Injected context consumes tokens every turn. Unbounded → truncation, important info lost."],
      ["Retrieval latency", "Providers hitting DBs / search / APIs add latency to every call. Cache, pool, async."],
      ["Relevance", "Irrelevant context doesn't just waste tokens — it degrades responses by diluting signal."],
      ["Staleness", "Cached or preloaded context goes stale. Design refresh cadence deliberately."],
      ["Composability", "Multiple providers writing the same window interact unexpectedly. Test them together."],
    ], { colW: [2.3, 6.9], rowH: 0.6, fontSize: 11 });
    slide.addText("Compaction (summarizing older history) is the escape valve when context grows. Day 3 memory module covers it.", {
      x: 0.4, y: 5.35, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Direct from Learn's Considerations table",
      "Read each row and give a real-world example:",
      "  Token budget: 'I had a customer whose RAG returned 8K tokens per turn — the actual conversation didn't fit'",
      "  Latency: 'if your provider hits a slow DB, every turn is now that slow'",
      "  Relevance: 'more chunks isn't better — noise crowds out signal in the ranking'",
      "  Staleness: 'user profile was cached at agent creation; six months later, still saying they lived in Boston'",
      "  Composability: 'RAG returned the answer; history had a wrong claim from 3 turns ago; model believed history'",
      "Compaction as escape valve — pointer to Day 3",
      "This slide lands the 'engineering' word in context engineering",
    ]);
  }

  // --- end 2026-08-19 additions ---

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Iteration loop" });
    T.addBullets(slide, [
      "Pick a small eval set (5–20 realistic inputs with expected behaviors)",
      "Run the current prompt against it",
      "Read the failures",
      "Change one thing",
      "Rerun",
    ], { y: contentTop });
    slide.addText("You'll see this loop again on Day 2 (retrieval eval) and Day 4 (workflow eval). The habit starts today.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "The iteration loop is the most important slide in this module",
      "5 steps: eval set → run → read failures → change ONE thing → rerun",
      "Push hard on 'change one thing'",
      "Attendees will conflate multiple edits, then can't tell what worked",
      "The habit starts today — Day 2 (retrieval eval) and Day 4 (workflow eval) reinforce",
      "Show: 'don't tune prompts in your head'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Prompts inside MAF" });
    T.addCode(slide, `from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions=(
        "## Role\\n"
        "You are a technical documentation assistant.\\n\\n"
        "## Rules\\n"
        "- Cite sources for factual claims.\\n"
        "- Say 'I don't know' when you don't.\\n"
    ),
)`, { y: 1.2, h: 3.8 });
    T.notes(slide, [
      "For a client-side / Path C agent, instructions live in your code (this slide)",
      "For a Prompt agent (Path A, Module 6), instructions live in the portal",
      "For a Hosted agent (Path B), instructions live in your code but Foundry runs it",
      "Either way: write instructions with structure, not prose",
      "Attendees see all three variants in the lab today",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 3", title: "Tool descriptions are prompts too" });
    T.addCode(slide, `@tool
def create_ticket(title: str, body: str, priority: str) -> str:
    """Create a support ticket.

    Use this when the user reports a problem that needs a human
    engineer to resolve. Do NOT use for questions you can answer
    from documentation. Priority must be one of low, med, high.
    """
    ...`, { y: 1.2, h: 3.5 });
    slide.addText("Bad docstrings = the model calls the wrong tool at the wrong time.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "THE point most attendees haven't internalized",
      "MAF sends EVERY tool docstring to the model as part of the prompt",
      "Bad docstring = model calls the wrong tool at the wrong time",
      "Good docstring reads like a mini-prompt: what it does, when to use it, when NOT to use it",
      "Show the create_ticket example — walk through what makes each line necessary",
      "This is a Day 3 topic really, but planting it now pays off Day 2",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 3", title: "Takeaways",
    bullets: [
      "Prompts still matter — you'll just write fewer of them, more carefully.",
      "Structure > prose. Contracts > pleas.",
      "Iterate against an eval set, not intuition.",
      "Every instruction, tool docstring, and output schema is a prompt.",
    ],
    next: "MAF 101 — the core primitives you'll use through the rest of the workshop.",
  }), "Quick recap and move on. Prompt engineering is a discipline we practice all week, not one we teach once.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-3-prompt-engineering.pptx") });
}

// Continued in the next commit — modules 4–7...

// ---------- MODULE 4 — MAF 101 ----------
function buildModule4() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 4 · 40 MIN",
    title: "MAF 101",
    subtitle: "Core primitives, in Python and C#",
    footer: "Building AI Apps and Agents",
  }), [
    "Most code-dense module of Day 1 — 40 min",
    "Move at a steady pace; don't linger on any one snippet",
    "Modules 5–6 use everything shown here — reassure attendees they'll see it again",
    "Attendees don't need to memorize APIs; they need to recognize the shape",
    "If they take away one thing: the six primitives (next slide)",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "What MAF is" });
    T.addBullets(slide, [
      "Microsoft's SDK for building agents",
      "One vocabulary — Agent, chat client, tool, session, run",
      "Python (agent_framework) and C# (Microsoft.Agents.AI) with matching concepts",
      "First-class Foundry integration",
      "Streaming, memory, structured outputs, tools, MCP, multi-agent, eval — one place",
      "The successor to Semantic Kernel and AutoGen for new work",
    ], { y: contentTop });
    T.notes(slide, [
      "MAF = Microsoft's SDK for building agents (the WHAT)",
      "One vocabulary in Python and C# — this is the key value prop",
      "First-class Foundry integration",
      "For attendees coming from SK or AutoGen: MAF is the forward direction",
      "Cleaner primitives, single SDK, active investment",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "The primitives" });
    T.addTable(slide, [
      ["Primitive", "What it is"],
      ["Chat client", "Typed client that talks to a specific model service (e.g. FoundryChatClient)"],
      ["Agent", "Wraps a chat client with instructions and tools"],
      ["Session", "Carries conversation history across multiple agent.run() calls; create with agent.create_session(), pass as session="],
      ["Run", "One turn (user → agent), non-streaming or streaming"],
      ["Tool", "A callable capability the model can invoke"],
      ["Message", "Individual user / assistant / tool messages in a session"],
    ], { colW: [2.2, 7.0], rowH: 0.5 });
    T.notes(slide, [
      "Six primitives — write them on a whiteboard if you can",
      "  Chat client, Agent, Session, Run, Tool, Message",
      "The rest of the workshop uses all six",
      "Ask: 'do any of these names collide with your team's vocabulary?'",
      "  (some teams may already use 'session' or 'run' differently in their codebases)",
      "If yes, agree on how you'll disambiguate for the week",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "The simplest possible Python agent" });
    T.addCode(slide, `import asyncio
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

async def main():
    agent = Agent(
        client=FoundryChatClient(credential=AzureCliCredential()),
        name="HelloAgent",
        instructions="You are a friendly assistant. Keep answers brief.",
    )
    result = await agent.run("What is the capital of France?")
    print(result)

asyncio.run(main())`, { y: 1.2, h: 3.9 });
    T.notes(slide, [
      "Say: 'that's it — deployed model + credential + instructions'",
      "Emphasize how small this is compared to hand-rolled agent code",
      "No boilerplate for tool wiring, message parsing, streaming",
      "AzureCliCredential = 'sign in via az login' — no API keys",
      "This is the code attendees will run in Part C of the lab today",
      "Walk the imports first, then the Agent(...) construction, then .run()",
    ]);
  }

  // ===== DEMO 4.1 · The 6-line agent =====
  T.notes(T.demoSlide(pres, {
    tag: "Day 1 · Module 4 · Demo",
    title: "The 6-line agent",
    time: "~3 min",
    description: "Live-type an empty scratch directory into a running MAF agent. Six lines from the previous slide — plus uv init, uv sync, and two env vars — get you a real answer from your Foundry-deployed model. Proves there's no ceremony.",
    reference: "Runbook: demos/day1/module-4-demo-1-six-line-agent.md · Scratch files: demos/day1/module-4-demo-1-six-line-agent/",
  }), [
    "DEMO 4.1 · ~3 min",
    "Open a clean terminal, cd to a fresh scratch dir",
    "  mkdir scratch && cd scratch",
    "  uv init --bare",
    "  paste pyproject.toml + main.py from the runbook",
    "  uv sync",
    "  export FOUNDRY_PROJECT_ENDPOINT=...",
    "  export FOUNDRY_MODEL=gpt-5.6-luna",
    "  uv run main.py",
    "Expected: model prints a brief answer about Paris",
    "Fallback: pre-recorded video at demos/day1/recordings/module4-demo1-six-line-agent.mp4",
    "Payoff line: 'That's the whole surface area — Agent + FoundryChatClient + AzureCliCredential.'",
  ]);


  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "The simplest possible C# agent" });
    T.addCode(slide, `using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

var endpoint = Environment.GetEnvironmentVariable("FOUNDRY_PROJECT_ENDPOINT")!;
var model = Environment.GetEnvironmentVariable("FOUNDRY_MODEL") ?? "gpt-5.6-luna";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(model: model,
               name: "HelloAgent",
               instructions: "You are a friendly assistant. Keep answers brief.");

Console.WriteLine(await agent.RunAsync("What is the capital of France?"));`, { y: 1.2, h: 3.8 });
    T.notes(slide, [
      "Point out: same shape as Python — this is MAF's design goal",
      "AIProjectClient(...).AsAIAgent(...) = C# way to write 'my code calling the Responses API'",
      "For attendees writing C#: everything shown in Python this week has a C# equivalent",
      "For attendees writing Python: the C# code should feel readable",
      "Version pinning: check manifests/versions.md if there's any doubt",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Non-streaming vs. streaming" });
    T.addCode(slide, `# Python
result = await agent.run("Tell me a fun fact.")
print(result)

async for chunk in agent.run("Tell me a fun fact.", stream=True):
    if chunk.text:
        print(chunk.text, end="", flush=True)

// C#
Console.WriteLine(await agent.RunAsync("Tell me a fun fact."));

await foreach (var update in agent.RunStreamingAsync("Tell me a fun fact."))
{
    Console.Write(update);
}`, { y: 1.2, h: 3.9, fontSize: 12 });
    T.notes(slide, [
      "Non-streaming vs. streaming — show the diff in shape",
      "Non-streaming: wait for the full response, one call",
      "Streaming: process chunks as they arrive (async iterator)",
      "Streaming matters for UX — perceived latency drops significantly",
      "Day 3 goes deeper: tool-progress events, cancellation, back-pressure",
      "In the lab today: attendees will see streaming print chunks live",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Multi-turn conversations" });
    T.addProse(slide, "AgentSession carries conversation state across runs. Create one with agent.create_session() and pass it to every agent.run() call.",
      { y: 1.15, h: 0.7, fontSize: 15 });
    T.addCode(slide, `session = agent.create_session()

r1 = await agent.run("My name is Alex.", session=session)
r2 = await agent.run("What's my name?", session=session)   # answer: Alex`,
      { y: 1.9, h: 1.5, fontSize: 15 });
    T.addProse(slide,
      "You create a session once and pass it to each run. MAF maintains the conversation history in that session object for you. Without session=, each call is stateless. Day 3 covers explicit session management (persistence, compaction, replay).",
      { y: 3.55, h: 1.6, fontSize: 14 });
    T.notes(slide, [
      "GROUNDING FIX 2026-08-19: session=session is REQUIRED for multi-turn",
      "Previously this code snippet omitted session= and would silently return wrong answer",
      "Attendees WILL ask: 'where does that session state live?'",
      "Answer depends on which family (Module 6):",
      "  Foundry-hosted (Prompt agent or Hosted agent): server-side in Foundry",
      "  Self-hosted (your code + Responses API): in your process",
      "This is the bridge to Module 6 — Module 5 first, then Module 6",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Authentication" });
    T.addBullets(slide, [
      "Every MAF sample uses Azure identity, not API keys",
      "Dev on your laptop: AzureCliCredential() — signs in via az login",
      "CI / production: DefaultAzureCredential() or, preferably, an explicit ManagedIdentityCredential",
      "Never commit API keys or connection strings — enforced on Day 5",
    ], { y: contentTop });
    T.notes(slide, [
      "Table stakes topic, but attendees WILL bring keys from other codebases",
      "Restate clearly: NO API keys in this workshop's code",
      "Dev on laptop: AzureCliCredential — signs in via az login",
      "Production: DefaultAzureCredential or explicit ManagedIdentityCredential",
      "If you see a Foundry API key in a code review: reject the PR",
      "Day 5 revisits this in the Identity module — plant the flag",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Packages you'll touch this week" });
    T.addTable(slide, [
      ["Concern", "Python package", "C# package"],
      ["Core", "agent-framework", "Microsoft.Agents.AI"],
      ["Foundry client", "agent-framework-foundry", "Microsoft.Agents.AI.Foundry"],
      ["Foundry hosting", "agent-framework-foundry-hosting", "(via Microsoft.Agents.AI.Foundry)"],
      ["AI Search", "agent-framework-azure-ai-search", "Azure.Search.Documents"],
      ["MCP hosting", "agent-framework-hosting-mcp", "ModelContextProtocol samples"],
    ], { colW: [1.9, 3.6, 3.7], rowH: 0.42, fontSize: 12 });
    T.notes(slide, [
      "Package cheat sheet — attendees don't need to memorize",
      "Point them at manifests/versions.md for the frozen versions",
      "Manifest freeze for current baseline; refreshed post-Ignite",
      "Ask attendees NOT to chase newer packages during the workshop",
      "If something breaks with a newer package version, downgrade to the manifest",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Bridge to the next two modules" });
    T.addProse(slide,
      "You've now seen the MAF primitives that let your process call the Foundry Responses API — Agent + FoundryChatClient (Python) or AIProjectClient.AsAIAgent (C#).",
      { y: 1.2, h: 1.0, fontSize: 16 });
    T.addProse(slide,
      "That's the self-hosted path — one of two hosting families for Agent Framework agents. The other family — Foundry-hosted — has two flavors: Prompt agents (configuration only) and Hosted agents (your code, containerized, run by Foundry). All are connected via FoundryAgent.",
      { y: 2.4, h: 1.2, fontSize: 16 });
    T.addProse(slide,
      "Module 5 gives us the mental model that ties everything together. Module 6 walks both hosting families in detail.",
      { y: 3.8, h: 1.0, fontSize: 15, italic: true });
    T.notes(slide, [
      "This is a bridge slide — don't teach hosting here, save for Module 6",
      "One sentence: 'you've now seen the primitives; Module 5 gives you the map, Module 6 shows the two hosting families'",
      "Foreshadow the families: Foundry-hosted (Prompt agent + Hosted agent) and self-hosted (your code + Responses API)",
      "Attendees should feel: 'oh, there's more than one place this code can run'",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 4", title: "Takeaways",
    bullets: [
      "MAF's primitives are small and stable: chat client, agent, session, run, tool, message.",
      "Python and C# APIs mirror each other closely.",
      "Auth is Azure identity end-to-end. No keys.",
      "The pattern you just saw — your code calling the Responses API — is the self-hosted family. Module 6 covers both families in detail.",
    ],
    next: "The five-layer agent stack we'll refer to through the rest of the workshop.",
  }), "Recap. If code slides ran long, cut the takeaways to 30 seconds.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-4-maf-101.pptx") });
}

// ---------- MODULE 5 — The Agent Stack ----------
function buildModule5() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 5 · 35 MIN",
    title: "The Agent Stack",
    subtitle: "The mental model we use",
    footer: "Building AI Apps and Agents",
  }), [
    "This is the 'compass' module of Day 1",
    "If attendees leave with only ONE thing from Day 1, it should be the five layers",
    "The rest of the workshop refers back — repeat that promise",
    "Ask attendees to write down the five words on paper",
    "Time budget: 35 min — half the module is Layer 1–5 slides, half is 'where each day lives' + 'why this matters'",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "The five-layer stack" });
    T.addBullets(slide, [
      "Model — the deployed model",
      "Runtime — where the agent runs (Prompt agent, Hosted agent, or your own code calling the Responses API)",
      "Actions — how it does things (tools, Toolbox, MCP)",
      "Knowledge — how it knows things (Foundry IQ, RAG)",
      "Ops — identity, tracing, evaluation, cost, deployment",
    ], { y: contentTop, fontSize: 18 });
    slide.addText("Keep this five-word list in your head all week.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 15, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Say the five words twice, slowly:",
      "  Model, Runtime, Actions, Knowledge, Ops",
      "Ask attendees to write them down",
      "Reinforce: 'the rest of the workshop fits into these five layers'",
      "Reinforce: 'every agent you build fits into these five layers'",
      "Every subsequent slide in this module drills into one layer",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 1 — Model" });
    T.addProse(slide, "Where it lives: your Foundry project, as a model deployment.",
      { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Which model? (frontier vs. efficient, cost vs. capability)",
      "What deployment capacity? (tokens per minute)",
      "Which region?",
    ], { y: 1.8, h: 2.0 });
    T.addProse(slide,
      "Day 5 covers model routing — small model first, escalate on low confidence.",
      { y: 4.3, h: 0.6, fontSize: 14, italic: true });
    T.notes(slide, [
      "Keep this slide short — attendees already saw model deployments in Module 2",
      "Three decisions at this layer:",
      "  which model, what capacity, which region",
      "Day 5 revisits: model routing (small first, escalate on low confidence)",
      "One tip: name deployments by (model, role) not just model",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 2 — Runtime" });
    T.addProse(slide, "Where the agent code and state live. Two hosting families:", { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Foundry-hosted · Prompt agent — portal- or SDK-authored, no code, Foundry runs it",
      "Foundry-hosted · Hosted agent — your code, packaged as a container, Foundry runs the container",
      "Self-hosted — your process runs your code and calls Foundry for models and tools",
    ], { y: 1.8, h: 2.2 });
    T.addProse(slide,
      "Module 6 is entirely about this choice. Each family has a sweet spot.",
      { y: 4.3, h: 0.6, fontSize: 14, italic: true });
    T.notes(slide, [
      "Tee up Module 6 — two hosting families (Foundry-hosted and self-hosted)",
      "Foundry-hosted has two flavors: Prompt agent (config only) and Hosted agent (your code, containerized)",
      "Self-hosted: your own code calling the Responses API",
      "Don't teach them now — Module 6 does that in 35 min",
      "Just plant the flag: 'this is a real decision point'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 3 — Actions" });
    T.addProse(slide, "How the agent affects the world.", { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Function tools — Python or C# functions you write, decorated for MAF",
      "Foundry Toolbox — curated tools exposed via an MCP endpoint (Bing, Fabric, SharePoint, code interpreter, …)",
      "MCP servers — the open protocol; MAF can consume any MCP server and you can author your own",
      "Skills — portable packages of instructions + reference material + optional scripts, with progressive disclosure",
    ], { y: 1.8, h: 2.4 });
    T.addProse(slide,
      "Day 2: function tools and Toolbox. Day 3: MCP end-to-end. Skills: awareness only in this workshop — see the dedicated slide below.",
      { y: 4.3, h: 0.75, fontSize: 13, italic: true });
    T.notes(slide, [
      "Actions = capability = what the agent can DO",
      "Knowledge (next slide) = grounding = what the agent KNOWS",
      "Keep these two concepts distinct — attendees conflate them",
      "Four sources of actions in this Actions layer: function tools, Toolbox, MCP, Skills",
      "  Function tools + Toolbox = Day 2",
      "  MCP end-to-end = Day 3",
      "  Skills = awareness-only in this workshop (dedicated slide next)",
      "When something breaks: 'is this an Actions bug or a Knowledge bug?'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 4 — Knowledge" });
    T.addProse(slide, "How the agent grounds its answers.", { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Foundry IQ — enterprise knowledge / grounding layer; unified retrieval across AI Search, SharePoint, OneLake / Fabric",
      "Custom RAG — AI Search or a vector store you drive yourself, when you need control IQ doesn't yet give you",
    ], { y: 1.8, h: 2.2 });
    T.addProse(slide, "Day 2 deep dive: both, plus when to prefer one over the other.",
      { y: 4.3, h: 0.6, fontSize: 14, italic: true });
    T.notes(slide, [
      "Knowledge = grounding = what the agent knows",
      "Foundry IQ = the easy path — unified retrieval across enterprise sources",
      "Custom RAG = when you need control IQ doesn't give you yet",
      "Not a binary — mix in a real system",
      "Day 2 is IQ's deep dive with a hands-on comparison",
      "Rule: reach for IQ first, drop to custom RAG when you have a specific reason",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 5 — Ops" });
    T.addProse(slide, "The unglamorous layer that makes agents production-worthy.",
      { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Identity — Entra, managed identity, RBAC",
      "Tracing — OTel spans of every model call, tool invocation, and decision; view in the Foundry portal or ship to App Insights",
      "Evaluation — retrieval, single-agent, multi-agent, continuous",
      "Cost & latency — model tiers, caching, batching, routing",
      "Deployment — Container Apps, Functions, AKS",
    ], { y: 1.8, h: 2.8 });
    T.addProse(slide, "Day 5 owns most of this — but evaluation is threaded through every day.",
      { y: 4.75, h: 0.5, fontSize: 14, italic: true });
    T.notes(slide, [
      "Ops = the unglamorous layer that makes agents production-worthy",
      "Five sub-layers: identity, tracing, evaluation, cost/latency, deployment",
      "Emphasize: evaluation is NOT a Day-5 topic",
      "Eval appears through the rest of the workshop (Days 2, 3, 4, 5)",
      "Day 4 is the eval anchor module",
      "Day 5 covers the rest of Ops (identity, tracing, cost, deployment)",
    ]);
  }

  // --- NEW 2026-08-19: Skills — packaging expertise for reuse (Option B) ---
  // Grounded in https://learn.microsoft.com/agent-framework/journey/adding-skills
  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 5", title: "Skills — packaging expertise for reuse",
    });
    T.addProse(slide,
      "A skill is a portable package that bundles instructions, reference material, and optional scripts into a single unit that any agent can discover and load on demand.",
      { y: contentTop, h: 0.9, fontSize: 13 });
    T.addTable(slide, [
      ["", "Tool", "Skill"],
      ["What it provides", "A single callable action", "Instructions + reference material + optional scripts"],
      ["How agent uses it", "Calls it when it needs to act", "Loads it when task matches; reads instructions; may call scripts"],
      ["Context cost", "Tool schema always in the prompt", "Only name + description (~100 tokens) upfront; full content on demand"],
      ["Portability", "Tied to the agent that registers it", "Self-contained package any compatible agent can discover"],
      ["Best for", "Individual actions (query a DB, send an email)", "Domain expertise (expense policies, code review guidelines)"],
    ], { colW: [1.7, 3.4, 4.1], rowH: 0.55, fontSize: 10 });
    slide.addText("Rule of thumb: tools are verbs (search, book, validate). Skills are expertise (travel booking knowledge, expense policy knowledge). Agents use tools to act and skills to know how to act.", {
      x: 0.4, y: 5.15, w: 9.2, h: 0.6,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/journey/adding-skills", {
      x: 0.4, y: 5.7, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });
    T.notes(slide, [
      "NEW 2026-08-19: covers skills at awareness level (not taught deeper in this workshop)",
      "",
      "PRESENTER GUIDANCE — When to use skills vs. other patterns:",
      "(summarizing Learn — https://learn.microsoft.com/agent-framework/journey/adding-skills#when-to-use-skills-vs-other-patterns)",
      "",
      "  Individual tools — best for one-off actions that don't need shared context.",
      "    Example: a get_weather function tool.",
      "  Skills — best for domain expertise with instructions, references, and optional scripts.",
      "    Example: an 'expense-report' skill with policy docs, validation scripts,",
      "    and step-by-step filing instructions.",
      "",
      "Progressive disclosure — the mechanism that keeps skills context-cheap:",
      "  1. Advertise — skill name + description (~100 tokens) in system prompt every run",
      "  2. Load — full instructions loaded only when task matches (< 5000 tokens recommended)",
      "  3. Read resource — supplementary files (FAQs, templates) fetched only when needed",
      "",
      "Under the hood: skills are built on top of tools. MAF exposes load_skill and",
      "read_skill_resource as tool calls; the agent invokes them to progressively load content.",
      "",
      "Common pitfalls to warn about:",
      "  Overly broad skills — 'everything-about-finance' → too long, unfocused. Keep skills to one domain.",
      "  Skipping security review — skill instructions inject into context; scripts execute code.",
      "    Treat skills like third-party deps.",
      "  Ignoring progressive disclosure — 2000-line SKILL.md defeats the point. Keep instructions",
      "    concise; move detail to separate resource files.",
      "",
      "This workshop: awareness only. Attendees leave knowing skills exist and when to reach for them.",
      "Not taught deeper in Days 2-5 for the current cohort. Candidate topic for Cohort 2.",
    ]);
  }
  // --- end 2026-08-19 additions ---

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Where each day lives on the stack" });
    T.addTable(slide, [
      ["Day", "Model", "Runtime", "Actions", "Knowledge", "Ops"],
      ["1", "✓", "✓ (both flavors)", "tease", "tease", "—"],
      ["2", "✓", "✓", "deep", "deep", "eval"],
      ["3", "✓", "deep", "deep (MCP)", "✓", "eval"],
      ["4", "✓", "multi-agent", "✓", "✓", "eval anchor"],
      ["5", "routing", "✓", "✓", "✓", "deep"],
    ], { y: contentTop, colW: [0.6, 1.4, 2.0, 1.9, 1.9, 1.4], rowH: 0.45, fontSize: 12 });
    T.notes(slide, [
      "Every topic in the workshop fits into these five columns",
      "If a topic feels orphaned to attendees, ask them to flag it",
      "Walk the table row by row (~15 seconds per row)",
      "Point out: 'eval' appears in every row from Day 2 onward",
      "Day 4 = the multi-agent + eval anchor day",
      "Day 5 = the Ops-heavy day",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Why this matters" });
    T.addBullets(slide, [
      "Diagnose problems by layer — 'the agent isn't grounded' is a Knowledge problem, not a Model problem",
      "Estimate cost and risk — adding an MCP server is an Actions + Ops concern, not a model concern",
      "Communicate cleanly with stakeholders — product, ops, security all live at different layers",
    ], { y: contentTop });
    slide.addText("Bring this back to your team as a shared vocabulary.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "This is a soft-skills slide disguised as an architecture slide",
      "The five layers give attendees vocabulary to talk to product / ops / security",
      "'The agent isn't grounded' = Knowledge problem, not Model problem",
      "'Adding an MCP tool' = Actions + Ops concern, not Model concern",
      "Attendees will use this to argue for budget and roadmap items later",
      "Encourage them to bring the vocabulary back to their teams",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 5", title: "Takeaways",
    bullets: [
      "Five layers: Model, Runtime, Actions, Knowledge, Ops.",
      "Every day of the workshop, and every real agent you build, fits into these.",
      "When something breaks or costs too much, ask which layer first.",
    ],
    next: "Module 6 zooms into Layer 2 (Runtime) — the two hosting families for Agent Framework agents.",
  }), "Ask two attendees to name the five layers out loud. Cheap check for retention.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-5-agent-stack.pptx") });
}

// ---------- MODULE 6 — Three ways to run an agent with Foundry ----------
function buildModule6() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 6 · 35 MIN",
    title: "Hosting Agent Framework agents",
    subtitle: "Foundry-hosted and self-hosted — pick what your app needs to own",
    footer: "Building AI Apps and Agents",
  }), [
    "REFRAMED 2026-08-19: was 'Three ways to run an agent with Foundry'",
    "New framing per Learn docs: two hosting families (Foundry-hosted, self-hosted)",
    "Under Foundry-hosted there are two flavors: Prompt agents + Hosted agents",
    "Learn ground truth:",
    "  https://learn.microsoft.com/agent-framework/hosting/",
    "  https://learn.microsoft.com/agent-framework/hosting/foundry-hosted-agent",
    "  https://learn.microsoft.com/agent-framework/hosting/self-hosting/",
    "Time budget: 35 min. Now 15 body slides so pace matters",
    "Anchor: 'first choose who operates the infrastructure; that's the hosting model. Protocol is a separate choice.'",
  ]);

  // NEW slide 1 — Where the agent process lives (taxonomy overview)
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Where the agent process lives" });

    T.addProse(slide, "First choose who operates the infrastructure. Hosting model is separate from the protocol clients use to reach your agent.",
      { y: 1.05, h: 0.55, fontSize: 13, italic: true });

    // Left column — Foundry-hosted
    const lx = 0.55, ly = 1.75, lw = 4.35;
    // Family header box
    slide.addShape("rect", {
      x: lx, y: ly, w: lw, h: 0.85,
      fill: { color: T.COLORS.navy }, line: { type: "none" },
    });
    slide.addText("Foundry-hosted", {
      x: lx, y: ly, w: lw, h: 0.45,
      fontFace: T.FONTS.title, fontSize: 16, bold: true, color: T.COLORS.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("Microsoft-managed · GA", {
      x: lx, y: ly + 0.45, w: lw, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.ice, align: "center", valign: "middle", margin: 0,
    });
    // Sub-flavor 1: Prompt agent
    slide.addShape("rect", {
      x: lx + 0.3, y: ly + 1.05, w: lw - 0.6, h: 0.95,
      fill: { color: T.COLORS.ice }, line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("Prompt agent", {
      x: lx + 0.3, y: ly + 1.05, w: lw - 0.6, h: 0.4,
      fontFace: T.FONTS.title, fontSize: 14, bold: true, color: T.COLORS.navy, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("Configuration only — no code", {
      x: lx + 0.3, y: ly + 1.45, w: lw - 0.6, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
    });
    // Sub-flavor 2: Hosted agent
    slide.addShape("rect", {
      x: lx + 0.3, y: ly + 2.1, w: lw - 0.6, h: 0.95,
      fill: { color: T.COLORS.ice }, line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("Hosted agent", {
      x: lx + 0.3, y: ly + 2.1, w: lw - 0.6, h: 0.4,
      fontFace: T.FONTS.title, fontSize: 14, bold: true, color: T.COLORS.navy, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("Your MAF code, containerized · Foundry runs it", {
      x: lx + 0.3, y: ly + 2.5, w: lw - 0.6, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
    });

    // Right column — Self-hosted
    const rx = 5.1, rw = 4.35;
    slide.addShape("rect", {
      x: rx, y: ly, w: rw, h: 0.85,
      fill: { color: T.COLORS.navy }, line: { type: "none" },
    });
    slide.addText("Self-hosted", {
      x: rx, y: ly, w: rw, h: 0.45,
      fontFace: T.FONTS.title, fontSize: 16, bold: true, color: T.COLORS.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("You run the process · Python prerelease", {
      x: rx, y: ly + 0.45, w: rw, h: 0.35,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.ice, align: "center", valign: "middle", margin: 0,
    });
    slide.addShape("rect", {
      x: rx + 0.3, y: ly + 1.05, w: rw - 0.6, h: 2.0,
      fill: { color: T.COLORS.ice }, line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("Your app + hosting packages", {
      x: rx + 0.3, y: ly + 1.05, w: rw - 0.6, h: 0.4,
      fontFace: T.FONTS.title, fontSize: 14, bold: true, color: T.COLORS.navy, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("agent-framework-hosting + protocol packages\n(Responses / A2A / MCP / Telegram)\n\nYour app owns routing, auth, storage,\ndeployment, scaling", {
      x: rx + 0.35, y: ly + 1.5, w: rw - 0.7, h: 1.5,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
    });

    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/hosting", {
      x: 0.4, y: 5.55, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });

    T.notes(slide, [
      "NEW 2026-08-19: taxonomy overview slide, grounded in Learn hosting/",
      "Two families. Under Foundry-hosted, two flavors.",
      "Prompt agent = configuration only (Foundry Agent Service concept)",
      "Hosted agent = your MAF code, containerized (uses agent-framework-foundry-hosting package)",
      "Self-hosted = your app, your runtime, using agent-framework-hosting-* packages if you want protocol endpoints",
      "Repeat the hosting-vs-protocol split — hosting = WHO runs. Protocol = HOW clients reach.",
      "Diagram grounded in the top-level hosting/ Learn doc",
    ]);
  }

  // SLIDE 2 — Foundry-hosted family (evolved)
  {
    const { slide } = T.bodySlide(pres, {
      tag: "Day 1 · Module 6", title: "Foundry-hosted family",
    });
    T.addProse(slide, "Microsoft-managed hosting. Generally available today.",
      { y: 1.15, h: 0.4, fontSize: 14, italic: true, bold: true });

    T.addBullets(slide, [
      "What Foundry runs: the container, autoscale, session persistence, platform integration",
      "What you own: agent code (Hosted flavor) or configuration (Prompt flavor), plus Foundry settings",
      "Choose Foundry-hosted when: you want Microsoft-managed hosting and don't need application-level control over the runtime",
    ], { y: 1.75, h: 1.5, fontSize: 12 });

    T.addTable(slide, [
      ["Flavor", "What's inside", "Best for"],
      ["Prompt agent", "Configuration only — instructions, model, tools. Versioned.", "Fast start, internal tools, no custom orchestration"],
      ["Hosted agent", "Your MAF code, packaged as a container (or zip, Foundry builds the image)", "Agents with custom code — with managed hosting"],
    ], { y: 3.4, colW: [1.8, 4.4, 3.0], rowH: 0.6, fontSize: 11 });

    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/hosting/foundry-hosted-agent", {
      x: 0.4, y: 5.55, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });

    T.notes(slide, [
      "First of the two families — Foundry-hosted",
      "GA — production ready today",
      "Two flavors under this family",
      "The two-row table is what attendees should memorize",
      "Anchor: 'Foundry runs the container. You own the code or configuration.'",
      "Next two slides drill into Prompt agent then Hosted agent",
    ]);
  }

  // SLIDE 3 — Foundry-hosted · Prompt agent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Foundry-hosted · Prompt agent" });
    T.addProse(slide,
      "A Prompt agent is defined entirely as configuration: instructions, model, tools. Author via the SDK / REST (IaC-first norm, CI/CD-friendly), as a declarative YAML definition, or in the Foundry portal (fine for exploration). Foundry runs it — no application code to maintain, no compute to manage.",
      { y: 1.15, h: 0.9, fontSize: 13 });
    T.addCode(slide, `from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    agent_name="docs-assistant",
    agent_version="1.0",
    credential=AzureCliCredential(),
)
result = await agent.run("What is Foundry IQ?")`, { y: 2.15, h: 2.55 });
    slide.addText("Best for: fast start, internal tools, production agents that don't need custom orchestration.",
      { x: 0.4, y: 4.85, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Foundry-hosted · Prompt agent = 'start here' recommendation",
      "Zero code, zero compute — just configuration",
      "Two authoring modes: SDK/REST/YAML (IaC-first norm, CI/CD-friendly) or Foundry portal (exploration)",
      "Best for: fast start, internal tools, agents without custom orchestration",
      "Attendees do this in Part A of the lab today",
    ]);
  }

  // SLIDE 4 — Foundry-hosted · Hosted agent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Foundry-hosted · Hosted agent" });
    T.addProse(slide,
      "Your MAF code (or LangGraph, or the OpenAI / Anthropic Agents SDK), packaged as a container or a source zip. Foundry runs the container with managed endpoint, autoscale, dedicated Entra identity, end-to-end observability, and content safety. Author-time package: agent-framework-foundry-hosting (prerelease). Exposes your agent via the Foundry Responses or Invocations protocol.",
      { y: 1.15, h: 1.5, fontSize: 12 });
    T.addCode(slide, `# From any client — including another agent — connect by name:
from agent_framework.foundry import FoundryAgent

agent = FoundryAgent(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    agent_name="docs-assistant-hosted",
    credential=AzureCliCredential(),
)`, { y: 2.7, h: 1.9, fontSize: 12 });
    slide.addText("Best for: agents that call into your own custom code, custom orchestration, and any scenario where you want Foundry to handle hosting, scaling, and identity.",
      { x: 0.4, y: 4.75, w: 9.2, h: 0.55, fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Foundry-hosted · Hosted agent = 'Foundry as agent APP host'",
      "Your code (MAF, LangGraph, OpenAI Agents SDK, or your own)",
      "Packaged as container (or zip; Foundry builds the image)",
      "Package: agent-framework-foundry-hosting (prerelease). Exposes agent via Foundry Responses or Invocations protocol.",
      "Foundry runs it with: managed endpoint, autoscale, dedicated Entra identity, observability",
      "Best for: production agents with custom code that need managed hosting + identity",
      "Attendees see this in Part B of the lab today",
    ]);
  }

  // SLIDE 5 — What Foundry manages for you (kept, small title tweak)
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "What Foundry manages for you" });
    T.addTwoColumn(slide,
      [
        "Agent logic (MAF or other frameworks)",
        "Instructions and tool wiring",
        "Any custom business code",
        "Your unit tests and CI",
        { text: "That's it.", indent: 0 },
      ],
      [
        "Managed endpoint (a stable URL)",
        "Autoscale — container instances per session and request volume",
        "Dedicated Microsoft Entra identity per agent",
        "End-to-end tracing — every model call, tool invocation, decision; App Insights integration built in",
        "Content safety and prompt-injection mitigation",
        "Foundry Toolbox tools (web search, code interpreter, MCP servers, …)",
        "Managed conversations / memory (BYO also supported)",
      ],
      { leftHeader: "What you write", rightHeader: "What Foundry gives you" }
    );
    T.notes(slide, [
      "The answer to 'why not just run my own container in ACA or AKS?'",
      "Foundry hosts your app runtime AND the tooling around it in ONE place",
      "What you write: agent logic, instructions, tools, tests, CI",
      "What Foundry gives you: everything else on the right column",
      "This applies to both Prompt agents and Hosted agents in the Foundry-hosted family",
    ]);
  }

  // NEW SLIDE 6 — Self-hosted family (bridge)
  {
    const { slide } = T.bodySlide(pres, {
      tag: "Day 1 · Module 6", title: "Self-hosted family",
    });
    T.addProse(slide,
      "You run the agent process in your own web app, container, service, or runtime. Your application owns routing, identity, authorization, request policy, storage, deployment, scaling.",
      { y: 1.15, h: 0.8, fontSize: 13 });
    T.addProse(slide, "Agent Framework provides hosting helpers, not a server:",
      { y: 2.0, h: 0.35, fontSize: 13, italic: true });
    T.addBullets(slide, [
      "Python: agent-framework-hosting (session state) plus protocol packages (-hosting-responses, -hosting-a2a, -hosting-mcp, -hosting-telegram). Prerelease.",
      "C#: Microsoft.Agents.AI.Hosting (session store, DI integration) plus protocol packages. Prerelease.",
      "What MAF gives you: AgentState / SessionStore (Python) or AddAIAgent / AgentSessionStore (C#), plus protocol integrations",
      "Your app plugs these into its own framework (FastAPI, ASP.NET Core, Django, Azure Functions, …)",
    ], { y: 2.45, h: 2.4, fontSize: 11 });
    slide.addText("Choose self-hosted when: you need application-level control or must integrate with existing infrastructure.", {
      x: 0.4, y: 5.05, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/hosting/self-hosting", {
      x: 0.4, y: 5.55, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });
    T.notes(slide, [
      "NEW 2026-08-19: bridge slide into the second family",
      "Framing: MAF gives you HELPERS, not a full server",
      "Your app owns routing, auth, storage, deployment, scaling",
      "Python packages: agent-framework-hosting + -hosting-{responses|a2a|mcp|telegram}. All prerelease.",
      "C# packages: Microsoft.Agents.AI.Hosting + Microsoft.Agents.AI.Hosting.OpenAI / .AspNetCore. Prerelease.",
      "Anchor: 'you need application-level control' — that's the reason to reach for self-hosting",
    ]);
  }

  // SLIDE 7 — Self-hosted · Python (was Path C)
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Self-hosted · Python — Agent + Responses API" });
    T.addProse(slide,
      "The simplest self-hosted form: your app calls agent.run(...) directly. Your process. Your runtime. No protocol endpoint yet.",
      { y: 1.15, h: 0.7, fontSize: 13 });
    T.addCode(slide, `from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="You are a helpful docs assistant. Cite sources.",
)
result = await agent.run("What is Foundry IQ?")`, { y: 1.95, h: 2.75 });
    slide.addText("Additive to Foundry-hosted — the same MAF code can be repackaged as a Foundry-hosted Hosted agent later. No rewrite.",
      { x: 0.4, y: 4.85, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, [
      "Self-hosted · Python = most common developer path",
      "Your MAF app in your own process (laptop, ACA, App Service, AKS, Functions)",
      "You manage the runtime; Foundry serves the model + tools via Responses API",
      "This is the simplest self-hosted form — no protocol endpoint, app calls agent.run() directly",
      "For protocol endpoints (Responses / A2A / MCP / Telegram), see the next-next slide",
      "KEY POINT: this code becomes a Foundry-hosted Hosted agent by packaging, NOT by rewriting",
      "Best for: embedding in existing apps, prototyping, full runtime control",
    ]);
  }

  // SLIDE 8 — Self-hosted · C# equivalent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Self-hosted · C# equivalent" });
    T.addCode(slide, `using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

AIAgent agent = new AIProjectClient(
        new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: model,
        name: "DocsAssistant",
        instructions: "You are a helpful docs assistant. Cite sources.");

Console.WriteLine(await agent.RunAsync("What is Foundry IQ?"));`, { y: 1.2, h: 3.6 });
    slide.addText("Same shape. Same primitives. Same \"your process calls Foundry's Responses API\" pattern.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "AIProjectClient(...).AsAIAgent(...) = C#'s way to write self-hosted",
      "Python and C# APIs mirror closely",
      "Same primitives, same shape, same 'process calls Foundry' pattern",
      "For C# devs: this is what self-hosted looks like in .NET",
    ]);
  }

  // NEW SLIDE 9 — Self-hosting: pick a protocol
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Self-hosting: pick a protocol" });
    T.addProse(slide,
      "If clients need to reach your self-hosted agent over the network, add a protocol integration package. Same agent target, different clients.",
      { y: 1.15, h: 0.7, fontSize: 13 });
    T.addTable(slide, [
      ["Protocol", "Python package", "C# package", "Use for"],
      ["OpenAI Responses / Chat", "agent-framework-hosting-responses", "Microsoft.Agents.AI.Hosting.OpenAI", "Any OpenAI-compatible client"],
      ["Agent-to-Agent (A2A)", "agent-framework-hosting-a2a", "(protocol integration)", "Discovery + messaging between agents"],
      ["Model Context Protocol", "agent-framework-hosting-mcp", "(protocol integration)", "Expose agent as an MCP tool"],
      ["Telegram Bot API", "agent-framework-hosting-telegram", "—", "Native Telegram bot"],
    ], { y: 1.95, colW: [1.9, 3.2, 2.7, 1.4], rowH: 0.55, fontSize: 10 });
    slide.addText("Rule of thumb: hosting model = who runs it. Protocol = how clients reach it. Pick them separately.", {
      x: 0.4, y: 5.05, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Source: Microsoft Learn · aka.ms/agent-framework/hosting", {
      x: 0.4, y: 5.55, w: 9.2, h: 0.22,
      fontFace: T.FONTS.body, fontSize: 8, italic: true, color: T.COLORS.muted, align: "center",
    });
    T.notes(slide, [
      "NEW 2026-08-19: separates the hosting model choice from the protocol choice",
      "One self-hosted app can expose SEVERAL protocols against the same agent target",
      "Four common protocols today: Responses, A2A, MCP, Telegram",
      "Foundry-hosted agents also expose Responses + Invocations — same protocol, different host",
      "Rule of thumb slide callout: hosting = WHO runs. Protocol = HOW clients reach.",
    ]);
  }

  // SLIDE 10 — Compare at a glance (updated table)
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Compare at a glance" });
    T.addTable(slide, [
      ["Concern", "Foundry · Prompt", "Foundry · Hosted", "Self-hosted"],
      ["Runtime code to maintain", "None", "Yours", "Yours"],
      ["Compute to manage", "None", "Container (Foundry)", "Yours"],
      ["Managed endpoint", "Yes", "Yes", "You provide"],
      ["Autoscale", "Yes", "Yes", "You handle"],
      ["Agent identity (Entra)", "Yes", "Yes, dedicated", "You handle"],
      ["Iteration speed", "Portal + publish", "Portal upload / redeploy", "Edit + restart"],
      ["Portability off Foundry", "Low", "Medium", "High"],
    ], { y: contentTop, colW: [2.6, 2.0, 2.2, 2.4], rowH: 0.42, fontSize: 12 });
    T.notes(slide, [
      "Walk down each row — ~10 seconds per row",
      "Self-hosted is the most portable — but you handle endpoint/scale/identity",
      "Foundry-hosted · Prompt is the least portable — Foundry-only by construction",
      "Foundry-hosted · Hosted is middle — portable code, non-portable Foundry-managed features",
      "The 'iteration speed' row: Prompt slowest (publish), Self-hosted fastest (edit + restart)",
    ]);
  }

  // SLIDE 11 — Decision guide (updated bullets)
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Decision guide (rough cuts)" });
    T.addBullets(slide, [
      "Getting started, or building a scoped internal tool with no custom logic? → Foundry-hosted · Prompt agent",
      "Shipping a production agent with custom code that needs managed hosting, Entra identity, observability? → Foundry-hosted · Hosted agent",
      "Regulated agent that needs managed content safety, a stable endpoint, and dedicated identity? → either Foundry-hosted flavor",
      "Embedding an agent inside an existing app you already run somewhere? → Self-hosted",
      "Prototyping quickly on your laptop before you decide on hosting? → Self-hosted",
      "Need to integrate with existing infrastructure — auth, tenancy, storage — that you already control? → Self-hosted",
    ], { y: contentTop, fontSize: 13 });
    slide.addText("Mix and match — real systems combine both families.",
      { x: 0.4, y: 5.05, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Ask: 'anyone see their scenario fitting more than one row?'",
      "Many will — that's the point",
      "Real systems mix both families",
      "Example: shared read-only Prompt agent + custom orchestration Hosted agent + embedded self-hosted assistant",
      "There is no wrong answer if you're honest about the constraints",
    ]);
  }

  // SLIDE 12 — Common gotchas (updated + new gotcha)
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Common gotchas" });
    T.addBullets(slide, [
      "\"Prompt agent = client-side\" — wrong. A Prompt agent is Foundry-managed. There's no client-side runtime for it at all.",
      "\"Hosted agent = my code running anywhere in Azure\" — wrong. Hosted agent specifically means your code as a container run by Foundry Agent Service. Your own container in your App Service that calls Responses is self-hosted, not Foundry-hosted.",
      "\"Self-hosted means no MAF hosting packages\" — wrong. Self-hosting is where the agent-framework-hosting-* packages live.",
      "Assuming portability off Foundry — Prompt is Foundry-only by construction. Hosted keeps Foundry-managed features behind the endpoint. Self-hosted is the most portable.",
      "Mixing hosting model with protocol — hosting model = who runs it. Protocol = how clients reach it. Both families expose Responses.",
    ], { y: contentTop, fontSize: 12 });
    T.notes(slide, [
      "The first three gotchas are the terminology collisions this module was designed to fix",
      "  1. 'Prompt agent = client-side' → wrong; Prompt agent is Foundry-managed",
      "  2. 'Hosted agent = my code anywhere in Azure' → wrong; specifically means Foundry-run container",
      "  3. 'Self-hosted means no MAF hosting packages' → wrong; that's exactly where they live",
      "Reinforce all three — attendees will trip on this in the weeks after the workshop",
      "Portability gotcha: Prompt is Foundry-only; Hosted keeps managed features behind the endpoint",
      "Hosting/protocol split — pick each separately",
    ]);
  }

  // SLIDE 13 — Same MAF code, different destinations (kept, light updates)
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Same MAF code, different destinations" });
    slide.addText("Self-hosted MAF code can be repackaged as a Foundry-hosted Hosted agent later. The MAF code you write does not change.", {
      x: 0.4, y: 1.2, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted, margin: 0,
    });
    const leftX = 0.4, leftW = 3.0, cardsY = 1.9, leftH = 2.5;
    slide.addShape("rect", {
      x: leftX, y: cardsY, w: leftW, h: leftH,
      fill: { color: T.COLORS.white }, line: { color: T.COLORS.navy, width: 1 },
    });
    slide.addText("Local dev on your laptop", {
      x: leftX + 0.15, y: cardsY + 0.15, w: leftW - 0.3, h: 0.4,
      fontFace: T.FONTS.title, fontSize: 15, bold: true, color: T.COLORS.navy, align: "center", margin: 0,
    });
    slide.addText([
      { text: "uv run from a terminal", options: { bullet: true, breakLine: true } },
      { text: "F5 in VS Code", options: { bullet: true, breakLine: true } },
      { text: "Fast iteration", options: { bullet: true, breakLine: true } },
      { text: "No cloud round-trip for logic", options: { bullet: true } },
    ], {
      x: leftX + 0.2, y: cardsY + 0.7, w: leftW - 0.35, h: leftH - 0.85,
      fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.ink, valign: "top", paraSpaceAfter: 4,
    });
    const arrY = cardsY + leftH / 2;
    slide.addShape("line", {
      x: leftX + leftW + 0.15, y: arrY, w: 1.4, h: 0,
      line: { color: T.COLORS.navy, width: 3, endArrowType: "triangle" },
    });
    slide.addText("Same MAF code", {
      x: leftX + leftW + 0.1, y: arrY - 0.4, w: 1.5, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 11, bold: true, italic: true, color: T.COLORS.navy, align: "center", margin: 0,
    });
    slide.addText("no rewrite", {
      x: leftX + leftW + 0.1, y: arrY + 0.1, w: 1.5, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 10, italic: true, color: T.COLORS.muted, align: "center", margin: 0,
    });
    const rightX = 5.4, rightW = 4.2, destH = 0.72, destGap = 0.12;
    const dests = [
      { name: "Foundry Agent Service (Hosted)", sub: "zip → portal → Foundry-hosted managed" },
      { name: "Azure Container Apps or AKS", sub: "Self-hosted — you own the container" },
      { name: "App Service or Azure Functions", sub: "Self-hosted — event-driven or HTTP" },
    ];
    dests.forEach((d, i) => {
      const y = cardsY + i * (destH + destGap);
      slide.addShape("rect", {
        x: rightX, y, w: rightW, h: destH,
        fill: { color: T.COLORS.panel }, line: { color: T.COLORS.border, width: 0.5 },
      });
      slide.addText(d.name, {
        x: rightX + 0.15, y: y + 0.08, w: rightW - 0.3, h: 0.3,
        fontFace: T.FONTS.title, fontSize: 12, bold: true, color: T.COLORS.navy, margin: 0,
      });
      slide.addText(d.sub, {
        x: rightX + 0.15, y: y + 0.38, w: rightW - 0.3, h: 0.3,
        fontFace: T.FONTS.body, fontSize: 10, italic: true, color: T.COLORS.muted, margin: 0,
      });
    });
    slide.addShape("rect", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.5,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "Prototype self-hosted. Decide destination later. ", options: { bold: true } },
      { text: "Foundry-specific features (Toolbox, IQ, agent identity) become available on Foundry-hosted." },
    ], {
      x: 0.55, y: 4.6, w: 8.9, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 11, color: T.COLORS.navy, valign: "middle", margin: 0,
    });
    T.notes(slide, [
      "Anti-lock-in reassurance — attendees worry about being trapped",
      "The MAF code you write is portable across both families",
      "BUT: Foundry-specific FEATURES (Toolbox skills, IQ, agent identity) stay behind the Foundry endpoint",
      "Be honest about that coupling — don't oversell portability",
      "Practical advice: prototype self-hosted, promote to Foundry-hosted later",
      "The 'same code, different destination' pitch is the platform's design",
    ]);
  }

  // SLIDE 14 — What you'll do in the lab (retitled parts)
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "What you'll do in the lab" });
    T.addBullets(slide, [
      "Part A — Foundry-hosted Prompt agent: create in your Foundry project, connect from your MAF app",
      "Part B — Foundry-hosted Hosted agent: deploy your own with azd; connect and walk the portal (endpoint, tracing, dedicated identity, content safety)",
      "Part C — Self-hosted: build an MAF app in Python that runs in your process and calls Responses",
      "Stretch (Part C): extend your code with a custom function tool or a Foundry IQ knowledge source (deep dive on Days 2–3)",
    ], { y: contentTop, fontSize: 13 });
    slide.addText("Same underlying docs-assistant behavior, both hosting families. You'll feel the trade-offs.",
      { x: 0.4, y: 4.75, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, [
      "Bridge to Module 7 (lab kickoff)",
      "Three parts map to the two families:",
      "  Part A + B = Foundry-hosted (Prompt + Hosted flavors)",
      "  Part C = Self-hosted",
      "Part A: Prompt agent (~30 min)",
      "Part B: Hosted agent — deploy your own with azd (~45 min)",
      "Part C: self-hosted code + Responses API (~45 min)",
      "Stretch: zip your Part C code and deploy as your own Foundry-hosted Hosted agent",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 6", title: "Takeaways",
    bullets: [
      "Two hosting families: Foundry-hosted (Microsoft-managed, GA) and self-hosted (your app owns the runtime).",
      "Under Foundry-hosted: Prompt agents (configuration only) and Hosted agents (your MAF code, containerized).",
      "Same MAF code can move between self-hosted and Foundry-hosted without a rewrite.",
      "Hosting model and protocol are separate choices — Responses / A2A / MCP / Telegram can layer on top of either family.",
      "Foundry Agent Service manages more than models — endpoint, identity, observability, Toolbox tools, memory, content safety.",
    ],
    next: "Lab walkthrough and environment check.",
  }), "Two-minute recap. Confirm no vocabulary confusion before moving to the lab. Attendees should be able to say 'Foundry-hosted' and 'self-hosted' out loud correctly.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-6-hosting-options.pptx") });
}
// ---------- MODULE 7 — Lab kickoff ----------
function buildModule7() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 7 · 25 MIN",
    title: "Lab Kickoff",
    subtitle: "Two agents, same job",
    footer: "Building AI Apps and Agents",
  }), [
    "Short module — 25 min",
    "Objective: every attendee leaves live session with a GREEN LIGHT on env",
    "Async lab starts immediately after",
    "The reflection is the deliverable, not the code",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "What you'll build" });
    T.addBullets(slide, [
      "The same small docs assistant, three ways",
      "Part A — Prompt agent (created in the portal, no code to maintain)",
      "Part B — Hosted agent (deploy your own with azd; explore what Foundry manages)",
      "Part C — Your own code calling the Responses API (MAF in Python or C#)",
      "Ask each the same questions and compare behavior, latency, and where session state lives",
    ], { y: contentTop });
    T.notes(slide, [
      "Emphasize: reflection > code",
      "reflection.md is the actual deliverable",
      "Attendees who write 3 solid reflection answers > attendees who complete all 3 parts",
      "Preview the 4 reflection questions — don't wait for them to read the lab",
      "Same underlying docs-assistant behavior three ways",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Environment check — before you start" });
    T.addCode(slide, `az login
az account show --query name -o tsv
azd version              # Azure Developer CLI (used from Day 3 onward)
python --version         # 3.11+
uv --version             # required for Python labs`, { y: 1.2, h: 2.2 });
    T.addBullets(slide, [
      "FOUNDRY_PROJECT_ENDPOINT (from the portal tour)",
      "A model deployment name in that project (recommended: gpt-5.6-luna)",
    ], { y: 3.4, h: 1.5 });
    slide.addText("If anything fails, flag it now — get unblocked before the lab.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, [
      "Live show-of-hands moment",
      "Ask: 'raise your hand if az login didn't work'",
      "Ask: 'raise your hand if python --version doesn't show 3.11+'",
      "Ask: 'raise your hand if you don't have your project endpoint yet'",
      "Fix issues in real time — do NOT let them accumulate to the lab",
      "If more than 20% of attendees are stuck, delay the lab kickoff",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Repo and starter templates" });
    T.addCode(slide, `git clone https://github.com/JimPiquant/Building-AI-Apps-and-Agents.git
cd Building-AI-Apps-and-Agents/labs/day1

# copy env template and fill in your values
cp .env.example .env`, { y: 1.2, h: 1.5 });
    T.addProse(slide, "Day 1 lab lives under labs/day1/.",
      { y: 2.85, h: 0.3, fontSize: 13, italic: true });
    T.addCode(slide, `labs/day1/
├── README.md                 ← the lab instructions
└── python/                   ← Python starter templates (uv)
    ├── pyproject.toml
    ├── part_a_prompt_agent.py
    ├── part_b_hosted_agent.py
    └── part_c_responses_api.py`, { y: 3.2, h: 2.1, fontSize: 12 });
    T.notes(slide, [
      "Walk through the file layout so nothing feels mysterious",
      "Show the actual repo URL live: github.com/JimPiquant/Building-AI-Apps-and-Agents",
      "Explain uv briefly: 'uv sync creates a .venv and installs deps'",
      "Point out .env.example → copy to .env → fill in",
      "Never commit .env",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Success criteria — what 'done' looks like" });
    T.addBullets(slide, [
      "Part A runs — you created a Prompt agent in the Foundry portal (version 1.0) and your MAF app connects to it",
      "Part B runs — you deploy your own Hosted agent with azd and walk the portal to see what Foundry manages",
      "Part C runs — your MAF app calls the Responses API and handles multi-turn, streaming, and non-streaming",
      "A short reflection.md committed to your fork:",
      { text: "What does Foundry manage for you in Parts A and B that you'd handle yourself in Part C?", indent: 1 },
      { text: "Which felt faster to iterate on?", indent: 1 },
      { text: "Which would you pick for a shared cross-team production agent? Why?", indent: 1 },
    ], { y: contentTop });
    T.notes(slide, [
      "The reflection is the deliverable, not the code output",
      "Focus on TRADE-OFFS between paths, not on maximum coverage",
      "Four questions to answer:",
      "  1. Which path felt fastest to iterate on and why?",
      "  2. What does Foundry manage in A/B that you'd handle in C?",
      "  3. For a scenario you know, which path would you pick?",
      "  4. What would you want to try next?",
      "Attendee who completes Parts A + C with good reflection > attendee who completes all 3 with none",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "How to get help" });
    T.addBullets(slide, [
      "Blocking issue? Post in the workshop channel",
      "Environment / RBAC / quota? Usually a 5-minute fix — flag in chat",
      "Code stuck? Pair up — lab is designed to be doable, not solo-only",
      "Instructor is on for questions during the lab",
    ], { y: contentTop });
    T.notes(slide, [
      "Set the norm: asking questions is encouraged, not embarrassing",
      "First-hour blocker rate matters more than final completion rate",
      "Channels: workshop chat for blockers, pair programming for stuck code",
      "Instructor is on during the lab",
      "If stuck > 20 min on the same thing, ping the channel",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Common early gotchas (skim before you start)" });
    T.addBullets(slide, [
      "az login succeeded but MAF still 401s — need the Foundry User role on the Foundry RESOURCE (not the project). Fix in Access Control (IAM) on the resource.",
      "FOUNDRY_PROJECT_ENDPOINT not set — copy from .env.example, paste from portal",
      "Model deployment name mismatch — deployment name is not the same as model name",
      "Python — package missing — run uv sync from labs/day1/python/ (do not use pip install)",
    ], { y: contentTop, fontSize: 14 });
    T.notes(slide, [
      "GROUNDING FIX 2026-08-19: role is 'Foundry User' (not old 'Azure AI User'); scope is the RESOURCE (not the project)",
      "Look-before-you-leap slide — this saves you 15 identical questions later",
      "Walk through the 4 gotchas quickly",
      "az login OK but 401 → Foundry User role at Foundry resource scope (portal IAM on the resource)",
      "FOUNDRY_PROJECT_ENDPOINT not found → copy from .env.example",
      "Model deployment name mismatch → not the same as the model name",
      "Python packages missing → uv sync from labs/day1/python/ — NOT pip install",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Time expectations" });
    T.addBullets(slide, [
      "Part A → about 30 min (portal setup + connection)",
      "Part B → about 45 min (deploy your own Hosted agent via azd + connect + portal exploration)",
      "Part C → about 45 min (most of the code writing lives here; stretch deploy adds ~30 min)",
      "Reflection commit → ~10 min",
      "Total: ~2 hours of lab work",
    ], { y: contentTop });
    slide.addText("Going long? Ping an instructor — we'll help you scope down.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Set realistic expectations before they start",
      "Part A: ~30 min · Part B: ~30 min · Part C: ~45 min",
      "Reflection commit: ~10 min",
      "Total: ~2 hours of lab work",
      "Attendees who hit 90 min on Part C should ping the channel",
      "Going long often means an env or RBAC issue, not a code issue",
    ]);
  }

  // Capstone preview — plant the seed on Day 1 so attendees marinate on scenarios all week
  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 7", title: "Preview: your capstone project",
    });
    T.addProse(slide,
      "The workshop ends with a team capstone. Start thinking about your scenario — every day gives you a piece.",
      { y: contentTop, h: 0.5, fontSize: 13, italic: true });

    // Two-column: what it is + what to be watching for
    T.addTwoColumn(slide,
      [
        "Teams of 2–3",
        "Starts at Day 5 close · demo day 2–3 weeks later",
        "Shared demo day — teams present to the workshop owners and participants",
        "~15 min per team (10 demo + 5 Q&A)",
        "Coaching and feedback — no scoring",
        "Your team's choice of scenario",
      ],
      [
        "An MAF agent — Foundry-hosted or self-hosted",
        "Grounded in a Foundry-deployed model",
        "≥1 Toolbox tool, MCP server, or function tool",
        "≥1 Foundry IQ source or custom RAG",
        "Golden set of ≥10 items + captured eval score",
        "OTel traces in the portal or App Insights",
        "Architecture diagram + README with 30-day next steps",
      ],
      { y: 1.65, h: 3.15, leftHeader: "The format", rightHeader: "Required elements" }
    );

    slide.addShape("rect", {
      x: 0.4, y: 5.0, w: 9.2, h: 0.5,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "Start today: ", options: { bold: true } },
      { text: "reflection question #4 asks what scenario your team would build — that's your capstone starter." },
    ], {
      x: 0.55, y: 5.03, w: 8.9, h: 0.44,
      fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.navy, valign: "middle", margin: 0,
    });

    T.notes(slide, [
      "Plant the seed on Day 1 — attendees have all week to marinate on scenarios",
      "Everyone on a team of 2–3 — no solo path this time",
      "Timeline: 2–3 weeks between Day 5 close and demo day",
      "Workshop timing: workshop ends wk of Oct 12; demo day lands wk of Nov 2 or Nov 9",
      "Format: shared demo day, not 1:1 reviews",
      "  ~15 min per team (10 demo + 5 Q&A / coaching)",
      "  The workshop owners and participants attend; attendees also see each other's work",
      "Character stays coaching + feedback — no ranking, no scoring",
      "Every required element maps to a day of the workshop:",
      "  MAF agent → Day 1",
      "  Grounding + tools → Day 2",
      "  MCP / production shape → Day 3",
      "  Multi-agent + eval → Day 4",
      "  Observability + deployment → Day 5",
      "Point out reflection question 4 explicitly — it's the seed",
      "Ask attendees to jot down 2–3 scenario ideas + potential teammates by end of the week",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 7", title: "Takeaways",
    bullets: [
      "Same underlying docs-assistant behavior — three hosting options with Foundry.",
      "Focus on feeling the difference — not just making the code run.",
      "The reflection is the deliverable, not the code.",
      "Start noodling on your capstone scenario this week.",
    ],
    next: "End of Day 1 live content. Have fun with the lab.",
  }), [
    "Sign-off · Day 1 wrap",
    "Encourage attendees to start the lab in a small pair or group if lab time doesn't line up individually",
    "Reinforce the capstone seed one more time",
    "Confirm no vocabulary confusion (Prompt agent / Hosted agent / Path C) before releasing",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-7-lab-kickoff.pptx") });
}

// ---------- Main runner ----------
async function main() {
  console.log("Building Day 1 decks…");
  await buildModule1();
  console.log("  module-1-landscape.pptx");
  await buildModule2();
  console.log("  module-2-foundry-portal.pptx");
  await buildModule3();
  console.log("  module-3-prompt-engineering.pptx");
  await buildModule4();
  console.log("  module-4-maf-101.pptx");
  await buildModule5();
  console.log("  module-5-agent-stack.pptx");
  await buildModule6();
  console.log("  module-6-hosting-styles.pptx");
  await buildModule7();
  console.log("  module-7-lab-kickoff.pptx");
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
