// Build Day 2 module decks. Modules are added here as they're authored;
// speaker notes are bullet arrays per the theme.js convention.
// Markdown module plans in slides/day2/ remain the source of truth.

const path = require("path");
const pptxgen = require("pptxgenjs");
const T = require("./theme");

const OUT_DIR = path.resolve(__dirname, "..", "..", "decks", "day2");

// ---------- MODULE 1 — Foundry IQ Deep Dive ----------
function buildModule1() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 2 · MODULE 1 · 35 MIN",
    title: "Foundry IQ Deep Dive",
    subtitle: "Knowledge and grounding for your agents",
    footer: "Building AI Apps and Agents",
  }), [
    "Open Day 2 — Knowledge and Actions in depth",
    "Module 1 = Knowledge layer of the five-layer stack",
    "35 min live; light on code, heavy on architecture + trade-offs",
    "Attendees should leave with a clear picture of what IQ is and when to reach for it",
    "Custom RAG (Module 2) is the counterweight — don't teach it here",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 2 · Module 1", title: "Where we are in the stack",
    });
    T.addBullets(slide, [
      "Model — your Foundry-deployed model",
      "Runtime — Prompt agent, Hosted agent, or your own code + Responses API",
      "Actions — Modules 4–7 today",
      { text: "Knowledge ← this module and Module 2", indent: 0 },
      "Ops — Day 5",
    ], { y: contentTop, h: 3.0 });
    slide.addText("Knowledge answers: how does my agent know things beyond the model's training data?", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Reground attendees in the Day 1 five-layer stack",
      "Module 1 = Layer 4 Knowledge; Module 2 = Layer 4 continued (custom RAG)",
      "Modules 4–7 tackle Layer 3 Actions (function tools, Toolbox)",
      "The italicized line is the whole module's frame — say it out loud",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "What Foundry IQ is" });
    T.addBullets(slide, [
      "The managed knowledge and grounding layer of Foundry",
      "Turns scattered enterprise content into permission-aware, reusable knowledge bases",
      "Built on Azure AI Search under the hood — but you never write the retrieval code",
      "Same knowledge base can be shared by many agents",
    ], { y: 1.2, h: 2.7 });
    slide.addText("Source: learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 10, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "One-line pitch: managed RAG-as-a-service tuned for agents",
      "Emphasize 'you never write the retrieval code' — this is the developer benefit",
      "Second key point: reusable — one knowledge base, many agents",
      "Under the hood is AI Search, so investments in AI Search knowledge transfer",
      "Preview status: some IQ features are still in preview; check the note in Learn",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Three building blocks" });
    T.addTable(slide, [
      ["Component", "What it is"],
      ["Knowledge source", "Connection to one data store — blob container, SharePoint site, existing AI Search index, Fabric data agent, the web…"],
      ["Knowledge base", "Top-level resource an agent connects to. Wraps one or more knowledge sources plus retrieval parameters."],
      ["Agentic retrieval", "Engine that runs multi-query pipelines across all sources in a knowledge base and returns unified, ranked results."],
    ], { colW: [2.2, 7.0], rowH: 0.85, fontSize: 12 });
    slide.addText("An agent connects to one knowledge base. That knowledge base can span many knowledge sources.", {
      x: 0.4, y: 4.8, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Three-part vocabulary attendees must nail:",
      "  Knowledge source = one connection (many)",
      "  Knowledge base = the thing an agent connects to (one)",
      "  Agentic retrieval = the engine (behind the scenes)",
      "Agents point at ONE knowledge base; that KB spans many sources",
      "Common confusion: attendees try to attach multiple KBs to one agent — you attach one KB with multiple sources instead",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Supported knowledge sources" });
    T.addTwoColumn(slide,
      [
        "Search index (wrap an existing one)",
        "Azure Blob",
        "OneLake",
        "Azure SQL (preview)",
        "Indexed SharePoint (preview)",
        "File upload (preview)",
      ],
      [
        "Web (Bing) — public",
        "Remote SharePoint (preview)",
        "Fabric Data Agent (preview)",
        "Fabric Ontology (preview)",
        "Work IQ (preview)",
        "MCP server (preview)",
      ],
      { leftHeader: "Indexed", rightHeader: "Remote" }
    );
    slide.addText("Both flow through the same ranking pipeline. You mix indexed and remote in one knowledge base.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Left column: content is ingested into AI Search up front, queried locally",
      "Right column: content stays in the source system, retrieved at query time",
      "Preview labels move — verify current status before delivering",
      "Fabric Data Agent and Work IQ let you mix IQs (Foundry + Fabric + Work) via IQ",
      "MCP server as a knowledge source is preview — different from MCP tools (Day 3)",
      "Call out the ranking pipeline is unified — attendees think of these as one result set",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Indexed vs. remote — trade-offs" });
    T.addTable(slide, [
      ["", "Indexed", "Remote"],
      ["Content location", "Inside AI Search", "Stays in source system"],
      ["Query latency", "Low (local)", "Higher (round-trip)"],
      ["Freshness", "On indexer schedule", "Live"],
      ["Setup cost", "Indexer pipeline", "Just a connection"],
      ["Best for", "Docs, blob, structured content", "Live data, collab surfaces, third-party APIs"],
      ["Cost model", "Storage + queries", "Per query against source platform"],
    ], { y: contentTop, colW: [2.2, 3.5, 3.5], rowH: 0.45, fontSize: 12 });
    slide.addText("Rule of thumb: index anything you query hundreds of times per day; go remote for the rest.", {
      x: 0.4, y: 4.9, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Walk each row — ~5 sec per row",
      "The trade-off attendees should internalize: cost/latency (indexed) vs. freshness/simplicity (remote)",
      "Indexed also means you pay to keep an AI Search index warm",
      "Remote means every query hits the source — could rate-limit or bill per call",
      "The rule of thumb line is the takeaway",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 2 · Module 1", title: "Agentic retrieval — what happens on a query",
    });
    T.addBullets(slide, [
      "Plan — an LLM (optional) decomposes the question into sub-queries and picks which sources to hit",
      "Execute — sub-queries run in parallel (keyword, vector, or hybrid per source)",
      "Rank — unified reranker scores results across sources",
      "Return — top results plus source citations",
    ], { y: contentTop, h: 3.2 });
    slide.addText("This is more than 'vector search + LLM.' It's a small pipeline you get for free.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "This is the pitch — attendees compare to their own hand-rolled RAG mentally",
      "Four steps: plan, execute, rank, return",
      "LLM planning is optional (minimal effort skips it) — next slide covers this",
      "Parallel execution is a real perf win over serial retrieve-then-rerank",
      "The 'pipeline you get for free' framing lands the value prop",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Retrieval reasoning effort" });
    T.addProse(slide,
      "You control how much LLM planning happens per query.",
      { y: 1.15, h: 0.4, fontSize: 15 });
    T.addBullets(slide, [
      "minimal — no LLM planning. Fast, cheap. One direct query. GA.",
      "low — LLM plans the sub-queries and picks sources. Preview.",
      "medium — LLM plans plus iterates for deeper results. Preview.",
    ], { y: 1.7, h: 2.2 });
    slide.addText("Higher effort = better answers on complex questions, higher latency and cost. Choose per query, not per agent.", {
      x: 0.4, y: 4.15, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted,
    });
    slide.addText("Preview: verify status in Learn before wiring into production paths.", {
      x: 0.4, y: 4.9, w: 9.2, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Effort is per query — not fixed at agent level",
      "Simple lookups use minimal; complex multi-hop uses medium",
      "Attendees will overreach and use medium for everything — remind them of cost/latency",
      "Preview label on low/medium — check current status",
      "Real-world pattern: A/B test minimal vs. low on your actual query mix",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Permission-aware retrieval" });
    T.addBullets(slide, [
      "ACL sync — indexed sources pull access control lists from the source (SharePoint, OneLake) into the index",
      "Sensitivity labels — Microsoft Purview labels flow through blob / OneLake / indexed SharePoint (preview)",
      "Query-time enforcement — retrieval runs under the caller's Entra identity; only content the user is authorized to see comes back",
      "Same knowledge base, different answers per user — no per-tenant infrastructure",
    ], { y: contentTop, h: 3.2 });
    slide.addText("Single biggest reason to prefer Foundry IQ over hand-rolling RAG on AI Search for enterprise content.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "This is the enterprise-hardening pitch",
      "Hand-rolling per-user permission filtering on top of AI Search is a lot of work",
      "IQ does it at query time — caller's Entra identity flows through",
      "Sensitivity labels: preview; verify status before promising it in a design",
      "Ask attendees: 'anyone hit this problem before?' — usually a few nods from architects",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "When to use Foundry IQ" });
    T.addTwoColumn(slide,
      [
        "Content in a supported source (SharePoint, OneLake, blob, web, Fabric…)",
        "Multiple agents will share the knowledge base",
        "Need permission-aware answers per caller",
        "Want managed indexing, chunking, embeddings, refresh",
        "Want the agentic retrieval pipeline without writing it",
      ],
      [
        "Need control IQ doesn't yet give you (custom re-rankers, unusual chunk sizes, novel embeddings)",
        "Your source isn't a supported connector",
        "Already invested in an AI Search index with heavy customization",
        "Latency SLA below what IQ's pipeline delivers",
      ],
      { leftHeader: "Reach for IQ", rightHeader: "Reach for custom RAG (Module 2)" }
    );
    T.notes(slide, [
      "Left = today; right = Module 2 territory",
      "Two-way street: real systems often use IQ for most content + custom RAG for one specialty index",
      "Ask attendees which side their planned scenarios fall on — many will straddle",
      "Set up Module 2 by ending on 'if your case is on the right side, Module 2 covers it'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Working with knowledge bases in MAF" });
    T.addProse(slide,
      "From your MAF app, the knowledge base is just another dependency — no retrieval code in your agent:",
      { y: 1.15, h: 0.6, fontSize: 13 });
    T.addCode(slide, `from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="Answer with citations from the docs knowledge base.",
    # knowledge_base_id wired via Foundry project configuration
)`, { y: 1.85, h: 2.7 });
    slide.addText("Prompt / Hosted agents: KB attached in agent config. Path C: call the knowledge-base REST API or AI Search SDK.",
      { x: 0.4, y: 4.75, w: 9.2, h: 0.5, fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Reassure — 'you don't write retrieval code in your agent'",
      "For Prompt agent / Hosted agent, the KB is wired in the agent's config in Foundry",
      "For Path C (your own code), you either use the KB REST API directly or the AI Search SDK",
      "Lab today wires a KB to attendees' Day 1 Prompt agent",
      "Don't dwell on the C# equivalent here — just mention it exists",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "IaC-first: create from code" });
    T.addProse(slide,
      "Same operating norm as Day 1 — resource creation lives in code, not the portal.",
      { y: 1.15, h: 0.5, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Azure CLI — az search knowledge-source create ... (verify current command surface)",
      "REST — PUT https://<search>.search.windows.net/knowledgeSources/<name>?api-version=2026-04-01",
      "Python SDK — azure-search-documents client",
      "Portal — fine for exploration; not the workshop path",
    ], { y: 1.85, h: 2.6 });
    slide.addText("Attendees do the SDK path in today's lab.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Reinforce Day 1's Portal-for-learning / CLI-for-production framing",
      "Verify the exact CLI/REST surface before delivering — this space moves fast",
      "Lab uses the Python SDK (azure-search-documents) for creation",
      "Portal is still valid for exploration and debugging",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Adjacent IQ workloads" });
    T.addProse(slide, "Foundry IQ is one of three managed IQ layers.", { y: 1.15, h: 0.4, fontSize: 14 });
    T.addTable(slide, [
      ["IQ", "For", "In this workshop"],
      ["Foundry IQ", "Enterprise knowledge — SharePoint, OneLake, blob, web", "← today"],
      ["Fabric IQ", "Analytics — OneLake, Power BI, ontologies", "Available as a remote knowledge source (Fabric Data Agent, preview)"],
      ["Work IQ", "M365 collaboration signals — Teams, meetings, files", "Available as a remote knowledge source (preview)"],
    ], { y: 1.7, colW: [1.8, 3.7, 3.7], rowH: 0.7, fontSize: 12 });
    slide.addText("A knowledge base can reference all three. Not required for the workshop.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Awareness-only slide — attendees have probably heard 'Fabric IQ' and 'Work IQ' too",
      "The nice pitch: all three are addressable via Foundry IQ knowledge sources",
      "Not teaching Fabric IQ or Work IQ today — just placing them on the map",
      "If attendees ask 'what about Copilot Studio agents' — those can consume a Foundry IQ KB too (per Learn)",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 1", title: "Common traps" });
    T.addBullets(slide, [
      "Forgetting the knowledge source description — LLM uses it to pick sources at low/medium effort",
      "Wrong retrieval effort for the workload — medium on latency-sensitive UX; minimal on multi-hop questions",
      "No permission model — building on blob without ACL sync, discovering per-user filtering is required later",
      "Chunking mismatch — default chunking on structured docs that need semantic chunking",
      "Ignoring citations — attendees skip verifying the model actually cites the retrieval, hallucinations sneak back in",
    ], { y: contentTop, h: 3.3, fontSize: 13 });
    T.notes(slide, [
      "Pause here for questions — these are the traps attendees will hit in the lab and in production",
      "The description trap is subtle — encourage writing descriptions like tool docstrings (Day 1 Module 3)",
      "The permission trap is the design-time trap — decide up front, hard to retrofit",
      "The citation trap is why Module 3 (eval) exists — evaluate groundedness, not just answer text",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 2 · Module 1", title: "Takeaways",
    bullets: [
      "Foundry IQ = managed knowledge for agents. Knowledge sources, knowledge bases, agentic retrieval — three pieces.",
      "Indexed vs. remote is your first design choice. Index hot content, go remote for live data.",
      "Permission-aware retrieval at query time is the enterprise pitch. Hard to build; hard to skip.",
      "Retrieval reasoning effort trades latency for quality per-query.",
      "Create from code, not the portal.",
    ],
    next: "Custom RAG on AI Search — for the cases where IQ isn't the right answer yet.",
  }), [
    "Quick recap — five bullets",
    "Ask attendees to name the three building blocks out loud",
    "Bridge to Module 2 (Custom RAG) — 'IQ isn't always the answer'",
    "Time check — should be about 35 min in",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-1-foundry-iq.pptx") });
}

// ---------- MODULE 2 — Custom RAG on AI Search ----------
function buildModule2() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 2 · MODULE 2 · 40 MIN",
    title: "Custom RAG on AI Search",
    subtitle: "When Foundry IQ isn't the right answer",
    footer: "Building AI Apps and Agents",
  }), [
    "Second knowledge module — the counterweight to Module 1",
    "40 min — the longest module of Day 2",
    "Frame as complementary to IQ, not competitive",
    "Attendees should leave able to pick IQ vs. classic RAG per scenario",
    "This module is code-heavier than Module 1 — one code slide each for query and MAF tool wiring",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Why this module" });
    T.addProse(slide,
      "Module 1 introduced Foundry IQ — the managed knowledge layer. It's the right answer most of the time.",
      { y: contentTop, h: 0.6, fontSize: 15 });
    T.addProse(slide, "Sometimes it isn't. This module covers the tools you reach for when it isn't:",
      { y: contentTop + 0.7, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Your source isn't a supported IQ connector",
      "You need control over indexing, chunking, or ranking that IQ doesn't yet expose",
      "You're already deep into an AI Search index with heavy customization",
      "You have latency SLAs below what IQ's pipeline delivers",
    ], { y: contentTop + 1.15, h: 2.6 });
    slide.addText("Same platform under the hood — Azure AI Search. Different surface.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Set the frame — IQ is usually right; sometimes it isn't",
      "Four bullets = the diagnostic criteria for 'not IQ'",
      "Emphasize: this is the same platform (AI Search) either way",
      "The choice is IQ's managed surface vs. classic RAG's direct surface",
      "Not either-or — real systems mix",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "The classic RAG pattern — recap" });
    T.addProse(slide, "Your app orchestrates three steps:", { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Retrieve — send a query to AI Search, get back the top-K passages",
      "Augment — inject those passages into the prompt for your LLM",
      "Generate — LLM produces an answer grounded on what you retrieved",
    ], { y: contentTop + 0.5, h: 2.0 });
    T.addProse(slide,
      "Simple. Fast. Fewer moving parts than agentic retrieval. You own the query pipeline end-to-end.",
      { y: contentTop + 2.65, h: 0.55, fontSize: 13, italic: true });
    slide.addText("IQ hides steps 1 and 2 behind agentic retrieval; classic RAG puts you in the driver's seat.", {
      x: 0.4, y: 4.65, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "R-A-G — retrieve, augment, generate",
      "Attendees should recognize this from any RAG article they've read",
      "Contrast: IQ's pipeline plans + parallelizes for you (Module 1 slide on agentic retrieval)",
      "Classic RAG's win = simpler, faster, fewer failure modes",
      "Classic RAG's loss = you build it and eval it yourself",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Five RAG challenges — and how AI Search addresses them" });
    T.addTable(slide, [
      ["Challenge", "AI Search answer"],
      ["Query understanding — users' words rarely match your docs", "Hybrid search + semantic ranker"],
      ["Multi-source data — content is scattered", "Indexers pull from 10+ sources; skills pipeline preprocesses"],
      ["Token constraints — LLM context isn't infinite", "Chunking + top-K + scoring profiles"],
      ["Response time — users expect seconds", "Millisecond queries; single-shot; you control retries"],
      ["Security — private content stays private", "Document-level trimming, filter-based ACLs, private endpoints"],
    ], { colW: [4.2, 5.0], rowH: 0.55, fontSize: 12 });
    slide.addText("Module 1 solved these with IQ's LLM-driven pipeline. Classic RAG solves them with your own orchestration.", {
      x: 0.4, y: 4.9, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Same five challenges as Module 1 — you're showing the second solution to the same problems",
      "Walk each row briefly (~10 sec)",
      "For attendees who've built RAG before: this table is 'the answers you already know'",
      "For attendees who haven't: this is the map",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Content pipeline — indexers and skillsets" });
    T.addBullets(slide, [
      "Indexers — pull content from Azure Blob, OneLake, SharePoint, Cosmos, SQL, and other sources on a schedule; keep the index fresh",
      "Skillsets — apply transformations during indexing: OCR, image analysis, text splitting, embedding generation, custom skills",
      "Push API — when you'd rather pre-process content yourself and just load it in",
    ], { y: contentTop, h: 3.0 });
    slide.addText("Rule: prefer indexers + skillsets when your source is a supported connector. Push API for full control.", {
      x: 0.4, y: 4.65, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Three paths in — indexers, skillsets, push API",
      "Indexers + skillsets = the batteries-included path",
      "Skills include OCR, image analysis, text-split, embedding gen, custom Azure Function skills",
      "Push API when your source isn't supported or you have a heavy custom pipeline already",
      "For most workshop scenarios: indexer + integrated vectorization skill",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "The three query modes" });
    T.addTable(slide, [
      ["Mode", "What it does", "When"],
      ["Keyword (full text)", "Inverted index, BM25, exact-term matching", "Structured content, exact-match, shared vocabulary"],
      ["Vector", "Similarity over embeddings — matches concepts", "Conversational or vague queries, cross-language"],
      ["Hybrid", "Both in one query — merged and reranked", "Almost always. Best recall."],
    ], { y: contentTop, colW: [1.9, 3.7, 3.6], rowH: 0.65, fontSize: 12 });
    slide.addText("Default recommendation for classic RAG: hybrid search + semantic ranker. Every Learn reference lands there.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Three modes = three tools. Hybrid combines the first two.",
      "Keyword is not obsolete — exact-match queries (product SKUs, IDs) still crush keyword",
      "Vector without keyword can miss exact matches",
      "Hybrid gets you the best of both — this is the Learn default",
      "The lab uses hybrid + semantic ranker",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Hybrid search — how it actually works" });
    T.addCode(slide, `results = search_client.search(
    search_text="How do I set up a Prompt agent?",
    vector_queries=[VectorizableTextQuery(
        text="How do I set up a Prompt agent?",
        k_nearest_neighbors=5,
        fields="contentVector",
    )],
    query_type=QueryType.SEMANTIC,
    semantic_configuration_name="default",
    top=10,
)`, { y: 1.2, h: 3.1, fontSize: 12 });
    T.addBullets(slide, [
      "Same query, two lanes — keyword search on search_text; vector search on the same string embedded",
      "Reciprocal Rank Fusion (RRF) merges the two result lists",
      "Semantic ranker rescores the top 50 by learned relevance",
      "Returns the top-K to your app",
    ], { y: 4.45, h: 0.8, fontSize: 11 });
    T.notes(slide, [
      "One method call does hybrid + semantic ranker",
      "search_text = keyword lane; vector_queries = vector lane",
      "RRF is the merge algorithm — no LLM involved yet",
      "Semantic ranker (query_type=SEMANTIC) rescores the merged top 50",
      "This is the pipeline attendees will hand-roll in Part C of the lab — 20 lines",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Semantic ranker — the quiet weapon" });
    T.addProse(slide,
      "Turns query understanding from 'keyword lookup' into 'did this passage actually answer the question?'",
      { y: 1.15, h: 0.7, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Rescores your top 50 results using a learned model",
      "Extracts semantic captions — the sentence(s) that best answer the query",
      "Extracts semantic answers — extractive answer text, when the passage has one",
      "Same API call — set query_type=\"semantic\" and pick a semantic configuration",
    ], { y: 1.95, h: 2.4 });
    slide.addText("Cost: pennies per query at typical volumes. Quality lift: usually 15–30% higher answer relevance. Almost always on.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.55,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "This is the single highest-leverage feature in classic RAG",
      "Learned model — Microsoft trains + updates it",
      "Semantic captions = the actual sentence that answered — great for citations",
      "Semantic answers = extractive answer text when the passage is a Q&A style match",
      "Attendees often skip it thinking they'll save cost — the quality lift is huge",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Chunking strategy" });
    T.addProse(slide, "The single biggest lever for retrieval quality.",
      { y: contentTop, h: 0.4, fontSize: 14, italic: true, bold: true });
    T.addTable(slide, [
      ["Approach", "Pros", "Cons"],
      ["Fixed-size (e.g., 500 tokens)", "Simple, predictable", "Cuts across semantic boundaries"],
      ["Semantic (paragraph, section)", "Chunks respect meaning", "Uneven sizes; needs document structure"],
      ["Sliding window with overlap", "Preserves context across chunks", "Duplicates content; more storage"],
      ["Structured (per-record)", "Perfect for tabular / DB content", "N/A for unstructured text"],
    ], { y: 1.55, colW: [2.6, 3.3, 3.3], rowH: 0.55, fontSize: 12 });
    slide.addText("Start with fixed-size 500-token chunks with 100-token overlap. Tune from there based on your eval scores (Module 3).", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Say it out loud: chunking is the biggest quality lever",
      "Attendees will get stuck tuning prompts when the fix is bigger chunks / smaller chunks / better boundaries",
      "500 + 100 overlap is the safe starting point",
      "Semantic chunking (respecting section boundaries) is the next tuning step",
      "Module 3 shows how to measure whether your chunking is working",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Embedding models" });
    T.addBullets(slide, [
      "text-embedding-3-small — most workshop scenarios; cheap, fast, 1536-dim, good multilingual",
      "text-embedding-3-large — better recall on hard queries; 3072-dim; more storage/compute",
      "Integrated vectorization in AI Search — pipe raw text through indexers; the service embeds it for you",
      "Match query-time embedding to index-time embedding (same model, same dimensions)",
    ], { y: contentTop, h: 3.0 });
    slide.addText("Building today? text-embedding-3-small with integrated vectorization: 90% of the way with 10% of the code.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Two embedding models most attendees will pick between",
      "text-embedding-3-small = the sensible default",
      "text-embedding-3-large is a 2x storage cost — earn it with eval",
      "Integrated vectorization = AI Search calls the embedding model for you at index and query time",
      "Match dimensions rule = the #1 trap on this slide. Different dim = broken query.",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Custom RAG in your MAF agent" });
    T.addProse(slide,
      "Wire the search call into an MAF tool. The agent decides when to retrieve; your tool does the work.",
      { y: 1.15, h: 0.6, fontSize: 13 });
    T.addCode(slide, `from agent_framework import Agent, tool
from azure.search.documents import SearchClient

@tool(approval_mode="never_require")
def search_docs(query: str) -> str:
    """Search the docs index for content that answers a technical question.
    Use this whenever the user asks something specific about Foundry, MAF, or agents.
    Returns the top passages with citations."""
    results = search_client.search(
        search_text=query,
        vector_queries=[VectorizableTextQuery(text=query, k_nearest_neighbors=5, fields="contentVector")],
        query_type="semantic",
        semantic_configuration_name="default",
        top=5,
    )
    return format_results_with_citations(results)

agent = Agent(client=..., instructions="Cite sources from search_docs.", tools=[search_docs])`,
      { y: 1.85, h: 3.0, fontSize: 11 });
    slide.addText("Your tool docstring is the LLM's guide for when to call it. Day 1 Module 3 lesson pays off here.", {
      x: 0.4, y: 4.95, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "The MAF integration is trivial — wrap the search call in a @tool",
      "Agent decides when to call it (based on the docstring)",
      "Docstring is your control surface — good docstring = agent calls it correctly",
      "Format results with citations — attendees do this in the lab",
      "Same @tool decorator we teach in Module 6 — one primitive, two uses",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Security — document-level trimming" });
    T.addBullets(slide, [
      "Store user/group tags on each document at ingestion time",
      "Pass the caller's identity or group memberships as a filter at query time",
      "AI Search returns only documents the caller is authorized to see",
      "Same query, different results per user — the classic RAG equivalent of IQ's permission model",
    ], { y: contentTop, h: 2.8 });
    slide.addText("Trade-off vs. IQ: you build the ACL sync pipeline yourself. IQ syncs from SharePoint / OneLake for you.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Classic RAG can do permission-aware retrieval — but you build the ACL sync",
      "Store tags on each doc (user IDs, group IDs)",
      "Filter query with the caller's identity — AI Search does the intersection",
      "The unglamorous part: sync those tags when SharePoint/OneLake ACLs change",
      "This is why IQ's managed ACL sync is a big deal for enterprise content",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "When to choose classic RAG over Foundry IQ" });
    T.addTwoColumn(slide,
      [
        "You need GA features only — no preview surface for prod",
        "Existing orchestration or heavily-tuned index to preserve",
        "Fine-grained control over pipeline, ranking, filtering",
        "Very tight latency budget",
        "Source IQ doesn't yet connect to",
      ],
      [
        "Source is a supported IQ connector",
        "Multiple agents will share the knowledge base",
        "Need permission-aware answers per caller without building it",
        "Want the agentic retrieval pipeline for free",
      ],
      { leftHeader: "Classic RAG", rightHeader: "Foundry IQ" }
    );
    slide.addText("Not either-or in real systems — often IQ for most content, classic RAG for a specialty index.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Mirror of Module 1's decision framework",
      "Left column = the classic RAG signal set",
      "Right column = the IQ signal set (Module 1)",
      "Real systems mix — say it explicitly",
      "Ask: 'anyone see themselves needing both?' — expect nods",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Sample repos to steal from" });
    T.addBullets(slide, [
      "azure-search-openai-demo — reference RAG chat app; agentic-retrieval-updated; ~15-min deploy via azd",
      "azure-search-classic-rag — classic RAG quickstarts in REST, Python, .NET, Java, JS, TS",
      "azure-search-vector-samples — vector-search patterns beyond the basics",
      "microsoft/rag-time — classic RAG time-journey scenarios",
    ], { y: contentTop, h: 3.0 });
    slide.addText("Repos are the source of truth for working code; Learn docs for concepts. Both apply.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "These four repos cover most of what attendees will need to look at",
      "azure-search-openai-demo is the biggest — full azd-deployable chat app",
      "azure-search-classic-rag is the fastest way to see classic RAG in your language",
      "azure-search-vector-samples for edge cases (multimodal, custom analyzers)",
      "rag-time is more tutorial-flavored",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 2", title: "Common traps" });
    T.addBullets(slide, [
      "Skipping the semantic ranker — 'it costs money' is a bad reason at typical volumes. Turn it on.",
      "Wrong chunk size — 100-token chunks lose context; 4000-token chunks blow past LLM context. 500 is safe.",
      "Mismatched embedding models — index with -small, query with -large. Vector queries return garbage. Match dimensions.",
      "Not evaluating retrieval separately — end-to-end tests can't tell retrieval bugs from generation bugs. Module 3 fixes this.",
      "No filter-based security — ships without ACLs, retrofit is painful.",
    ], { y: contentTop, h: 3.3, fontSize: 12 });
    T.notes(slide, [
      "Same shape as Module 1's traps slide — five bullets, ~40 sec each",
      "Mismatched embedding models is the sneakiest — no error, just bad results",
      "The 'evaluate retrieval separately' bullet sets up Module 3",
      "The 'no filter-based security' bullet reinforces the classic RAG trade-off vs. IQ",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 2 · Module 2", title: "Takeaways",
    bullets: [
      "Classic RAG = you own the query pipeline. Same platform as IQ (Azure AI Search); different surface.",
      "Default recipe: hybrid search + semantic ranker. Rarely wrong.",
      "Chunk size is the biggest quality lever. Start at 500 tokens; tune with eval.",
      "Wire retrieval into a tool so the agent decides when to search; tool docstring is your control surface.",
      "Mix and match IQ and classic RAG in real systems.",
    ],
    next: "Evaluating retrieval — how you actually know if your knowledge layer works.",
  }), [
    "Quick recap — five bullets",
    "Emphasize: hybrid + semantic ranker is the recipe worth memorizing",
    "Bridge to Module 3: 'you can't tune what you don't measure'",
    "Time check — Modules 1+2 combined should be about 75 min in (halfway to lunch or first break)",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-2-custom-rag.pptx") });
}

// ---------- MODULE 3 — Evaluating Retrieval ----------
function buildModule3() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 2 · MODULE 3 · 25 MIN",
    title: "Evaluating Retrieval",
    subtitle: "Know if your knowledge layer actually works",
    footer: "Building AI Apps and Agents",
  }), [
    "Shortest module of Day 2 — 25 min",
    "Bridges the Knowledge modules (1–2) into the Actions modules (4–7)",
    "Sets up the eval habit that runs through Day 3, Day 4 anchor, Day 5 production",
    "Focus attendees on the two must-know evaluators: Retrieval + Groundedness",
    "Don't over-teach — Day 4 is the anchor",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Why evaluate retrieval separately" });
    T.addProse(slide, "Attendees who skip this step do one of two things:",
      { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Ship an agent that seems to work — until it doesn't, and they can't tell why",
      "Tune prompts forever, when the real problem was chunking or embeddings",
    ], { y: contentTop + 0.5, h: 1.5 });
    slide.addText("Retrieval failures and generation failures look identical from the outside. Evaluate separately, fix separately.", {
      x: 0.4, y: 3.3, w: 9.2, h: 0.7,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Day 4 anchors evaluation for full workflows. Today's module gets the habit started.",
      { x: 0.4, y: 4.7, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Frame the whole module in one line: 'evaluate retrieval separately'",
      "Two failure modes attendees will recognize — usually a few laughs",
      "The italicized line is the key insight — say it out loud",
      "Set expectation that Day 4 goes deeper on eval; today is the starter",
      "Don't dwell — get to the evaluators",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Two evaluation modes for RAG" });
    T.addTable(slide, [
      ["Mode", "What it evaluates", "Ground truth required"],
      ["Process evaluation", "The retrieval step itself — did we get relevant chunks?", "Depends on evaluator"],
      ["System evaluation", "The end-to-end response — did the agent answer correctly?", "Sometimes"],
    ], { colW: [2.0, 4.6, 2.6], rowH: 0.75, fontSize: 12 });
    T.addBullets(slide, [
      "Process eval finds the retrieval-side bug",
      "System eval confirms the whole thing works",
      "Attendees do a small dose of each in today's lab",
    ], { y: 3.7, h: 1.3 });
    T.notes(slide, [
      "Two modes = two questions",
      "Process = 'did retrieval get the right chunks?'",
      "System = 'did the agent answer correctly?'",
      "Both matter; today teaches one of each",
      "Ground truth (labeled correct answers) is optional for most evaluators",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "The Foundry evaluator catalog for RAG" });
    T.addTable(slide, [
      ["Evaluator", "Type", "Needs ground truth?"],
      ["Retrieval", "Process", "No — LLM judges context relevance"],
      ["Groundedness", "System", "No — LLM judges if response is grounded in context"],
      ["Groundedness Pro (preview)", "System", "No — Content Safety service, boolean"],
      ["Relevance", "System", "No — LLM judges if response addresses query"],
      ["Response Completeness (preview)", "System", "Yes — needs expected answer"],
      ["Document Retrieval", "Process", "Yes — needs query-relevance labels (qrels)"],
    ], { colW: [3.0, 1.5, 4.7], rowH: 0.45, fontSize: 11 });
    slide.addText("Start with the top four. Add ground truth when you're ready to invest in labels.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, [
      "Six evaluators — sorted lightest to heaviest ground-truth requirement",
      "Top four need no ground truth — LLM judges based on context",
      "Bottom two need ground truth (labeled correct answers or relevance judgments)",
      "Ground truth is expensive to produce — earn the investment",
      "Verify preview status before delivery — this space moves",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "The two must-know evaluators" });
    T.addProse(slide, "For today's lab and most real-world starting points:",
      { y: 1.15, h: 0.4, fontSize: 14, italic: true });

    // Two columns for the two evaluators
    T.addTwoColumn(slide,
      [
        "Input: query, retrieved context",
        "Output: 1–5 score (pass ≥ 3), plus reasoning",
        "Answers: 'Are the chunks we pulled actually relevant to the question?'",
      ],
      [
        "Input: query, response, retrieved context",
        "Output: 1–5 score (pass ≥ 3), plus reasoning",
        "Answers: 'Did the response stay in the context, or did the model fabricate?'",
      ],
      { y: 1.7, h: 2.7, leftHeader: "Retrieval (process)", rightHeader: "Groundedness (system)" }
    );

    slide.addText("Together, these two isolate retrieval-side vs. generation-side failure.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.45,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "These are the two evaluators the lab focuses on",
      "Neither needs ground truth — LLM judges based on the context",
      "Retrieval scores the retrieval; Groundedness scores the generation",
      "Together = complete diagnostic",
      "1–5 scale, default pass threshold 3",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Groundedness vs. Response Completeness" });
    T.addProse(slide, "Two sides of the same coin:",
      { y: contentTop, h: 0.3, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Groundedness = precision. Did the response contain anything not in the context? (Fabrication check.)",
      "Response Completeness = recall. Did the response leave anything out that the ground truth expected? (Coverage check.)",
    ], { y: 1.6, h: 1.9 });
    T.addProse(slide,
      "A high-groundedness, low-completeness response is accurate but partial. A low-groundedness, high-completeness response is comprehensive but making things up. Track both.",
      { y: 3.6, h: 1.1, fontSize: 13 });
    slide.addText("Response Completeness needs ground truth — invest when you have a benchmark corpus.",
      { x: 0.4, y: 4.8, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Precision vs. recall — attendees know these terms already",
      "Groundedness = 'nothing extra'; Completeness = 'nothing missing'",
      "You want high on both — but they trade off",
      "High-groundedness low-completeness = safe but useless",
      "Low-groundedness high-completeness = comprehensive but hallucinating",
      "Response Completeness needs ground truth — earn the investment",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Document Retrieval — the deep debug tool" });
    T.addProse(slide,
      "When retrieval quality is the bottleneck, this is your parameter-sweep evaluator.",
      { y: contentTop, h: 0.5, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Input: query-relevance labels (qrels) and the ranked retrieval output",
      "Output: NDCG, XDCG, Fidelity, Max Relevance, Holes at various k",
      { text: "Use it to answer:", indent: 0 },
      { text: "Should I use vector, keyword, or hybrid?", indent: 1 },
      { text: "What's the right top_k?", indent: 1 },
      { text: "Is 500-token chunking better than 1000?", indent: 1 },
    ], { y: 1.75, h: 2.8, fontSize: 12 });
    slide.addText("You need labeled data — a person judged which docs are relevant for each query. Worth it when tuning matters.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "This is the tuning evaluator — not for today's lab",
      "Attendees will use it when they're serious about retrieval quality",
      "Requires labeled data — someone graded 'this doc is a 4/5 for this query'",
      "NDCG is the classic search-quality metric",
      "Parameter sweep = run with vector/keyword/hybrid, top_k=5/10/20, chunk 500/1000, compare NDCG",
      "Introduce the concept, don't require it in the lab",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Configuring an evaluator (Python SDK)" });
    T.addCode(slide, `testing_criteria = [
    {
        "type": "azure_ai_evaluator",
        "name": "groundedness",
        "evaluator_name": "builtin.groundedness",
        "initialization_parameters": {"deployment_name": model_deployment},
        "data_mapping": {
            "context": "{{item.context}}",
            "response": "{{item.response}}",
        },
    },
    {
        "type": "azure_ai_evaluator",
        "name": "retrieval",
        "evaluator_name": "builtin.retrieval",
        "initialization_parameters": {"deployment_name": model_deployment},
        "data_mapping": {"query": "{{item.query}}", "context": "{{item.context}}"},
    },
]`, { y: 1.2, h: 3.6, fontSize: 11 });
    slide.addText("Same JSON shape for each evaluator. The data_mapping tells the evaluator where to find fields on your test dataset.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Show the shape — attendees will copy this into the lab",
      "Every evaluator has: type, name, evaluator_name, initialization_parameters, data_mapping",
      "The {{item.field}} syntax refers to fields on your JSONL test dataset (next slide)",
      "deployment_name = the model that judges (usually a smaller one than production)",
      "Attendees don't need to memorize the JSON — pattern-match it",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "The test dataset — smaller than you think" });
    T.addProse(slide, "A JSONL file, one line per test case:",
      { y: 1.15, h: 0.4, fontSize: 14 });
    T.addCode(slide, `{"query": "How do I set up a Prompt agent?",
 "context": "A Prompt agent is authored in the Foundry portal or SDK...",
 "response": "You create a Prompt agent by..."}
{"query": "What models does Foundry support?",
 "context": "Foundry hosts models from Azure OpenAI, Anthropic, Meta...",
 "response": "Foundry supports multiple models including..."}`,
      { y: 1.65, h: 2.4, fontSize: 11 });
    T.addBullets(slide, [
      "Start with 10–15 examples",
      "Enough signal to catch obvious regressions; small enough to actually maintain",
      "Add examples over time as you find failure modes",
    ], { y: 4.15, h: 1.0, fontSize: 12 });
    T.notes(slide, [
      "JSONL — one JSON object per line",
      "Fields match the data_mapping from the previous slide",
      "10–15 items = the useful floor",
      "Smaller than most attendees expect — don't overinvest before you know the eval works",
      "The dataset is a living artifact — grow it as production surfaces failures",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Reading the output" });
    T.addCode(slide, `{
  "type": "azure_ai_evaluator",
  "name": "Groundedness",
  "metric": "groundedness",
  "score": 4,
  "label": "pass",
  "reason": "The response is well-grounded without fabricating content.",
  "threshold": 3,
  "passed": true
}`, { y: contentTop, h: 2.7, fontSize: 12 });
    T.addBullets(slide, [
      "score — 1–5 numeric (or true/false for Pro)",
      "label / passed — pass or fail against the threshold",
      "reason — the LLM judge's explanation (read this when things fail)",
      "metric — which evaluator produced this row",
    ], { y: 4.05, h: 1.1, fontSize: 12 });
    slide.addText("The reason field is where debugging happens. Read it.", {
      x: 0.4, y: 5.2, w: 9.2, h: 0.3,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Four fields matter — score, label, reason, metric",
      "Most attendees only look at score — that's a mistake",
      "The reason field is the debugging surface",
      "Read the reasons on failures — that tells you what to fix",
      "Threshold defaults to 3 — you can override per evaluator",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "The iteration loop" });
    T.addProse(slide, "Same shape as Day 1's prompt-engineering loop:",
      { y: contentTop, h: 0.4, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Author an eval dataset (10–15 items)",
      "Run Retrieval + Groundedness against your current pipeline",
      "Read the failures — retrieval bug or generation bug?",
      "Change one thing (chunk size, top_k, prompt, model)",
      "Rerun. Compare scores.",
    ], { y: 1.55, h: 2.6 });
    slide.addText("Change one thing at a time. Three changes at once = you learned nothing about what worked.", {
      x: 0.4, y: 4.25, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Same discipline shows up Day 4 for multi-agent workflow eval.",
      { x: 0.4, y: 4.75, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "This slide's job: install the iteration habit",
      "Same five-step loop as Day 1 Module 3 (prompt engineering)",
      "The 'change one thing' rule is the discipline",
      "Attendees will resist — 'but I have three ideas' — insist",
      "The habit lands again Day 4 (multi-agent) and Day 5 (production)",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "LLM-as-judge caveats" });
    T.addProse(slide, "You're using an LLM to judge an LLM. Some caveats:",
      { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Judge bias — the judge model has preferences. Same prompt, different judges = different scores.",
      "Judge cost — every eval item is an extra LLM call. Budget accordingly.",
      "Judge drift — model updates can shift baseline scores. Version-pin your judge.",
      "Judge as a check, not truth — cross-check with the reason field and spot-check the actual failures.",
    ], { y: 1.55, h: 2.9, fontSize: 12 });
    slide.addText("Day 5 covers online eval and drift more deeply. Today: know the judge isn't infallible.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Honesty slide — don't oversell the judge",
      "Judge bias is real — same eval, different model, different scores",
      "Judge cost — pin the judge model to something cheap; don't use GPT-5.4 to judge GPT-5.4-mini output",
      "Drift is a real problem — pin your judge version",
      "The reason field cross-check is the antidote to blind trust in scores",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Common traps" });
    T.addBullets(slide, [
      "Testing end-to-end only — a bad answer might be retrieval OR generation; can't tell without process eval",
      "Test set too small — 3 items = coin flip; 10–15 is the useful floor",
      "Test set too large — every eval run costs LLM calls; 50 hand-labeled > 5,000 unlabeled",
      "Changing three things at once — you learn nothing about what worked",
      "Ignoring the reason field — score tells you if it failed; reason tells you why",
      "Judge model = production model — conflict of interest; use a different (usually smaller) judge",
    ], { y: contentTop, h: 3.5, fontSize: 12 });
    T.notes(slide, [
      "Same pattern as Modules 1 and 2 — a full slide of traps",
      "Six bullets, ~15 sec each",
      "The 'ignoring reason' bullet is worth reinforcing",
      "The 'judge = production' bullet is subtle — worth a beat",
      "Attendees who nail these six traps will do 80% of eval right in production",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 3", title: "Where eval shows up the rest of the week" });
    T.addBullets(slide, [
      "Day 3 (single-agent depth) — evaluator patterns extend to tool-use correctness",
      "Day 4 (multi-agent anchor) — trajectory eval, cost-per-successful-outcome, regression harness",
      "Day 5 (production) — online eval, drift detection, red-teaming",
      "Capstone — required elements include a golden set + eval scores",
    ], { y: contentTop, h: 2.5, fontSize: 13 });
    slide.addText("The habit that starts today runs through the whole week.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Continuity slide — attendees see where eval reappears",
      "Day 4 is the anchor — most eval depth lands there",
      "Day 5 pushes into production eval (drift, red-teaming)",
      "Capstone requires a golden set + eval score",
      "The through-line: eval is a workshop-wide theme, not a Day 5 topic",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 2 · Module 3", title: "Takeaways",
    bullets: [
      "Evaluate retrieval separately or you can't tell retrieval bugs from generation bugs.",
      "Foundry evaluators: Retrieval + Groundedness are the two must-know starting points.",
      "Groundedness (precision) + Response Completeness (recall) — track both when you have ground truth.",
      "Small test sets beat big untested claims — 10–15 hand-labeled items is the floor.",
      "Change one thing, then rerun — same iteration loop as prompt engineering.",
    ],
    next: "Tools layer — how agents do things beyond talking.",
  }), [
    "Quick recap — five bullets",
    "Emphasize: Retrieval + Groundedness as the two starter evaluators",
    "Bridge to Module 4 — 'we've covered Knowledge; now Actions'",
    "Time check — Modules 1+2+3 combined = ~100 min in",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-3-eval-retrieval.pptx") });
}

// ---------- Main runner ----------
async function main() {
  console.log("Building Day 2 decks…");
  await buildModule1();
  console.log("  module-1-foundry-iq.pptx");
  await buildModule2();
  console.log("  module-2-custom-rag.pptx");
  await buildModule3();
  console.log("  module-3-eval-retrieval.pptx");
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
