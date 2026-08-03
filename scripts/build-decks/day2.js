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

// ---------- MODULE 4 — Tools Layer Deep Dive ----------
function buildModule4() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 2 · MODULE 4 · 35 MIN",
    title: "Tools Layer Deep Dive",
    subtitle: "How agents do things beyond talking",
    footer: "Building AI Apps and Agents",
  }), [
    "Framing module for Actions layer",
    "35 min — concepts and API surface, not lab code (that's Module 6)",
    "Attendees leave knowing HOW function calling works under the hood",
    "Bridge from Knowledge (Modules 1–3) to Actions (Modules 4–7)",
    "Some code slides but they're for understanding — Module 6 is the hands-on",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Where we are in the stack" });
    T.addProse(slide,
      "Modules 1–3 covered Knowledge. Modules 4–7 cover Actions.",
      { y: contentTop, h: 0.5, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Model — your Foundry-deployed model",
      "Runtime — Prompt agent, Hosted agent, your own code + Responses API",
      { text: "Actions ← Modules 4–7", indent: 0 },
      "Knowledge — Modules 1–3",
      "Ops — Day 5",
    ], { y: contentTop + 0.7, h: 2.7 });
    slide.addText("Actions = how the agent DOES things. Retrieval = how it KNOWS things.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Re-anchor in the five-layer stack",
      "Half of Day 2 (Modules 1–3) covered Knowledge",
      "Modules 4–7 now cover Actions",
      "The italic line — Actions vs Knowledge in one sentence",
      "Set expectation: Modules 4–7 build on each other",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Module 4's job" });
    T.addProse(slide, "This module is the framing module for Actions.",
      { y: contentTop, h: 0.4, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Module 4 (this one) — what function calling is, tool schema, error contracts, streaming — the concepts",
      "Module 5 — Foundry Toolbox (managed tools you attach)",
      "Module 6 — authoring your own function tools in MAF",
      "Module 7 — combining knowledge + tools (bringing it together)",
    ], { y: contentTop + 0.55, h: 2.8, fontSize: 13 });
    slide.addText("You leave Module 4 knowing HOW tool calling works under the hood. Module 6 turns that into code.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Set expectation — this is concepts, not lab code",
      "Attendees will see code snippets for understanding, not to type in",
      "Module 6 is where hands-on tool authoring happens",
      "The 4-module structure is deliberate — don't jump ahead",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "The function-calling model in one picture" });
    T.addCode(slide, `User: "What's the weather in Amsterdam?"

  → Agent calls model with:
       - system prompt (instructions)
       - user message
       - list of tool schemas [{name, description, params}, ...]

  → Model returns: tool_call(name="get_weather", args={"location": "Amsterdam"})

  → Agent invokes get_weather("Amsterdam") LOCALLY, gets: "cloudy, 15°C"

  → Agent calls model again with tool result appended

  → Model returns: "The weather in Amsterdam is cloudy with a high of 15°C."`,
      { y: 1.2, h: 3.5, fontSize: 11 });
    slide.addText("The model never runs your code. It emits INTENT — your process runs the code. This is the fundamental contract.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Walk each arrow — 15 seconds per line",
      "Emphasize: 'the model never runs your code'",
      "This is the fundamental contract of function calling",
      "The model emits intent (tool_call); your process executes",
      "Second model call includes the tool result — that's how the final answer gets grounded",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Why this works — the model as decision-maker" });
    T.addProse(slide, "The model doesn't know how to check the weather. It knows:",
      { y: contentTop, h: 0.5, fontSize: 14 });
    T.addBullets(slide, [
      "When to use a weather tool (based on the tool description)",
      "What arguments to pass (based on the parameter schema and descriptions)",
      "What to do with the result (based on the tool's return value and shape)",
    ], { y: contentTop + 0.6, h: 2.0 });
    T.addProse(slide,
      "The model is picking from a menu of tools you defined. Your tool schema IS the menu. Bad schema = bad picks.",
      { y: 3.65, h: 1.0, fontSize: 14, italic: true, bold: true });
    T.notes(slide, [
      "Reframe: the model is a decision-maker, not an executor",
      "Three things the model uses: description, param schema, return shape",
      "Attendees who nail this understand why 'schema is a prompt' matters",
      "The 'menu' metaphor — well-designed menu = right choices",
      "Set up the next few slides on schema anatomy",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Tool schema anatomy" });
    T.addProse(slide, "Every function tool exposes four things to the model:",
      { y: 1.15, h: 0.4, fontSize: 14 });
    T.addTable(slide, [
      ["Field", "What the model uses it for"],
      ["Name", "Referenced when calling — should be a clean identifier"],
      ["Description", "The primary 'when to call this' signal"],
      ["Parameter schema", "Types, required/optional, per-param descriptions"],
      ["Return type", "What comes back after the tool runs"],
    ], { y: 1.7, colW: [2.5, 6.7], rowH: 0.55, fontSize: 12 });
    slide.addText("The description carries more weight than most attendees realize. Modules 3 and 6 both come back to this.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Four fields — name, description, params, return",
      "Description is the biggest lever — most attendees underinvest",
      "Parameter schemas can carry type hints, enums, min/max",
      "Return type shapes how the model uses the result",
      "Same as Day 1 Module 3's 'docstring quality = model tool-use quality'",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "In MAF — the shortest possible tool" });
    T.addProse(slide, "Python — any function is a tool:", { y: 1.15, h: 0.35, fontSize: 13 });
    T.addCode(slide, `def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    return f"The weather in {location} is cloudy with a high of 15°C."

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    instructions="You are a helpful weather assistant.",
    tools=[get_weather],
)`, { y: 1.55, h: 2.8, fontSize: 11 });
    slide.addText("Docstring → description. Field(description=...) → parameter description. Type hints → schema.", {
      x: 0.4, y: 4.4, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    slide.addText("Module 6 goes deeper on authoring. Note the shape now.", {
      x: 0.4, y: 4.8, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Simplest possible tool — just a Python function passed to tools=",
      "Docstring becomes the description",
      "Annotated[type, Field(description=...)] becomes the parameter description",
      "Type hints define the schema",
      "No decorator needed for the simple case",
      "Preview Module 6 — this is what attendees will build later today",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "In MAF — the C# equivalent" });
    T.addProse(slide, "Same shape, different syntax:", { y: 1.15, h: 0.35, fontSize: 13 });
    T.addCode(slide, `[Description("Get the weather for a given location.")]
static string GetWeather(
    [Description("The location to get the weather for.")] string location)
    => $"The weather in {location} is cloudy with a high of 15°C.";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: "gpt-5.4-mini",
        instructions: "You are a helpful assistant",
        tools: [AIFunctionFactory.Create(GetWeather)]);`, { y: 1.55, h: 2.7, fontSize: 11 });
    slide.addText("Attribute-based description; AIFunctionFactory.Create wraps the method. Same primitives, same model-facing contract.", {
      x: 0.4, y: 4.4, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "For attendees who write C# — same primitives, different syntax",
      "[Description(...)] attribute on method and parameter",
      "AIFunctionFactory.Create wraps the method into an AIFunction",
      "Lab is Python-only — this slide is for lecture reference",
      "The model-facing contract is identical: same name, description, params, return",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "The @tool decorator — when you want control" });
    T.addProse(slide, "Explicit name, description, and other options via @tool:", { y: 1.15, h: 0.4, fontSize: 13 });
    T.addCode(slide, `from agent_framework import tool

@tool(name="weather_tool", description="Retrieves weather information for any location")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    return f"The weather in {location} is cloudy with a high of 15°C."`,
      { y: 1.6, h: 2.0, fontSize: 12 });
    T.addBullets(slide, [
      "The function's Python name isn't what you want the model to see",
      "You want the description in one place (not a docstring)",
      "You need parameters like approval_mode (Day 5) or explicit schemas (next slide)",
    ], { y: 3.75, h: 1.4, fontSize: 12 });
    T.notes(slide, [
      "Two patterns: implicit (docstring) or explicit (@tool)",
      "Both coexist — pick per tool",
      "@tool gives you control over what the model sees",
      "Also unlocks approval_mode, explicit schemas, etc.",
      "Attendees will see both patterns in the lab",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Explicit schemas" });
    T.addProse(slide, "When you need full control, pass a Pydantic model or a raw JSON schema:",
      { y: 1.15, h: 0.4, fontSize: 13 });
    T.addCode(slide, `class WeatherInput(BaseModel):
    location: Annotated[str, Field(description="The city name")]
    unit: Annotated[str, Field(description="celsius or fahrenheit")] = "celsius"

@tool(name="get_weather", description="Get current weather.", schema=WeatherInput)
def get_weather(location: str, unit: str = "celsius") -> str:
    return f"Weather in {location} is 22 degrees {unit}."`,
      { y: 1.6, h: 2.2, fontSize: 12 });
    T.addBullets(slide, [
      "Schema documented in one place (not spread across type hints)",
      "Generating tools programmatically",
      "Need enum constraints, min/max, or validation type hints can't express",
    ], { y: 3.95, h: 1.2, fontSize: 12 });
    T.notes(slide, [
      "Explicit schemas = maximum control",
      "Pydantic model or raw JSON schema dict — both work",
      "Use when you need constraints (enum, min/max, format) beyond type hints",
      "Also useful when generating tools programmatically at startup",
      "Most attendees start with implicit schemas — graduate to this later",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Runtime context — hidden from the model" });
    T.addProse(slide,
      "Some values shouldn't be model-visible: the calling user, session, DB handle.",
      { y: 1.15, h: 0.4, fontSize: 13 });
    T.addCode(slide, `@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
    ctx: FunctionInvocationContext,
) -> str:
    user_id = ctx.kwargs.get("user_id", "unknown")
    return f"The weather in {location} is cloudy with a high of 15°C."

await agent.run("What's the weather in Amsterdam?",
    function_invocation_kwargs={"user_id": "user_123"})`,
      { y: 1.6, h: 2.6, fontSize: 11 });
    slide.addText("ctx is injected by the framework. Hidden from the schema the model sees. Use for logging, personalization, tenancy.", {
      x: 0.4, y: 4.35, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Pattern: model-facing args vs. framework-facing context",
      "ctx: FunctionInvocationContext — MAF fills this in",
      "The model never sees ctx in the schema",
      "Use for user_id, tenant, session, DB handles, feature flags",
      "Caller passes runtime values via function_invocation_kwargs",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Tool description patterns that work" });
    T.addProse(slide, "The description is a mini-prompt. Same discipline as Day 1 Module 3.",
      { y: 1.15, h: 0.4, fontSize: 13, italic: true });
    T.addBullets(slide, [
      "What it does — one clear sentence",
      "When to use it — the condition that triggers this tool",
      "When NOT to use it — differentiate from other tools",
      "Parameter descriptions — meaning, valid values, examples",
    ], { y: 1.65, h: 2.0, fontSize: 12 });
    T.addCode(slide, `@tool
def create_ticket(title: str, body: str, priority: str) -> str:
    """Create a support ticket for a problem that needs a human engineer.

    Use this when the user reports a problem you cannot answer from
    documentation. Do NOT use for questions you can answer directly.

    Priority must be one of: low, med, high.
    """`, { y: 3.7, h: 1.6, fontSize: 11 });
    T.notes(slide, [
      "Four-part structure works for most tools",
      "'When NOT to use' differentiates from overlapping tools",
      "Same discipline attendees learned Day 1 Module 3 (prompt engineering)",
      "Bad descriptions = wrong tool at wrong time",
      "The create_ticket example carries into today's Part B lab",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Streaming tool progress" });
    T.addProse(slide, "For long-running tools, don't block the user. MAF streams tool-call events alongside model tokens:",
      { y: 1.15, h: 0.6, fontSize: 12 });
    T.addCode(slide, `async for event in agent.run("Look up my account status", stream=True):
    if event.type == "tool_call_start":
        print(f"→ calling {event.tool_name}({event.args})")
    elif event.type == "tool_call_result":
        print(f"← {event.tool_name} returned")
    elif event.text:
        print(event.text, end="", flush=True)`, { y: 1.85, h: 2.3, fontSize: 12 });
    slide.addText("Tool call, tool result, tokens — all in one async stream. Day 3 covers streaming UX and cancellation.", {
      x: 0.4, y: 4.3, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Streaming isn't just for tokens — tool events stream too",
      "Three event types: tool_call_start, tool_call_result, text",
      "UX pattern: show 'checking your account…' while the tool runs",
      "Day 3 goes deeper on streaming (backpressure, cancellation, error events)",
      "Attendees see this fire in Module 6's lab today",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Error contracts" });
    T.addProse(slide, "Your tool will fail. What does it return?", { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "String describing the error — model can incorporate ('couldn't reach the service, try again')",
      "Structured error object — model can retry with different args or route to a different tool",
      "Raise an exception — MAF surfaces it back to the model with the exception message",
    ], { y: 1.6, h: 2.2, fontSize: 12 });
    slide.addText("Rule of thumb: return errors as data when you want the model to recover. Raise when the failure is unrecoverable.", {
      x: 0.4, y: 3.9, w: 9.2, h: 0.55,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Day 3 covers robust agents in depth — retries, timeouts, guardrails.",
      { x: 0.4, y: 4.65, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, [
      "Errors matter — every tool WILL fail eventually",
      "Three options: string, structured error, exception",
      "The rule: 'errors as data' when the model should recover",
      "Raise exceptions only when nothing sensible can be done",
      "Day 3 covers full robust-agent patterns",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Approval mode" });
    T.addProse(slide,
      "For tools with side effects (create ticket, send email, delete record), you don't always want the model to fire them autonomously.",
      { y: contentTop, h: 0.7, fontSize: 12 });
    T.addCode(slide, `@tool(approval_mode="always_require")
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email. Requires user approval before firing."""
    ...`, { y: 1.75, h: 1.4, fontSize: 12 });
    T.addBullets(slide, [
      "never_require — safe / idempotent tools (read-only, no side effects)",
      "always_require — every call needs human approval",
      "Heuristic — MAF's default: approve safe patterns, prompt on risky ones",
    ], { y: 3.3, h: 1.5, fontSize: 12 });
    slide.addText("Day 5 (Responsible AI) revisits this for production HITL patterns.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Side effects = things you can't undo",
      "Three approval modes — pick per tool",
      "never_require for read-only tools",
      "always_require for anything that writes",
      "Default heuristic is smart but not psychic — override for risky tools",
      "Day 5 covers full production HITL patterns",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Three kinds of tools you'll encounter" });
    T.addTable(slide, [
      ["Kind", "What it is", "Where"],
      ["Function tool", "Your Python or C# code, exposed to the model", "Module 6 today"],
      ["Foundry Toolbox tool", "Managed tool in the Foundry catalog (Bing, code interpreter, SharePoint…)", "Module 5 today"],
      ["MCP tool", "Any tool exposed by an MCP server, local or remote", "Day 3"],
    ], { colW: [2.2, 5.5, 2.0], rowH: 0.7, fontSize: 12 });
    slide.addText("All three go through the same function-calling contract. Same schema shape. Same tool call → tool result flow.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    slide.addText("Differences: who wrote the code, where it runs, who authenticates it.", {
      x: 0.4, y: 4.95, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Three tool origins, one contract",
      "Function tool — you wrote the code, runs in your process",
      "Toolbox tool — Microsoft (or whoever) wrote it, managed by Foundry",
      "MCP tool — any MCP server, local or remote",
      "The model doesn't care where the code lives — sees the same schema",
      "Attendees will see all three across today (function + Toolbox) and Day 3 (MCP)",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "The tool-vs-knowledge decision" });
    T.addProse(slide,
      "Attendees will build things where either could work: 'should I make this a tool call to search docs, or attach a knowledge base?'",
      { y: contentTop, h: 0.8, fontSize: 12 });
    T.addBullets(slide, [
      "Tool when the retrieval is one option among many (agent decides)",
      "Knowledge when the retrieval should happen on every relevant query (retrieval is grounding, not action)",
    ], { y: 2.1, h: 1.6, fontSize: 13 });
    slide.addText("You can have both. Common pattern: knowledge base for background grounding + function tools for actions.", {
      x: 0.4, y: 4.0, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    slide.addText("Module 7 revisits this with instruction-design patterns.", {
      x: 0.4, y: 4.7, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Common attendee question — 'should search be a tool or a knowledge base?'",
      "Tool = 'agent may choose to call'",
      "Knowledge = 'retrieval always happens for grounding'",
      "Both together is the common production pattern",
      "Module 7 covers instruction patterns for combining them",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 4", title: "Common traps" });
    T.addBullets(slide, [
      "Vague tool descriptions — 'gets data' — model has no signal for when to call",
      "Overlapping tools — two tools with fuzzy descriptions; model picks wrong one",
      "Too many tools — 30 tools registered; model gets confused. Rule: <10 per agent.",
      "Side effects in 'read' tools — check_status also logs, mutates, or bills. Keep side effects in write-tagged tools.",
      "Missing parameter descriptions — model guesses arg values. Bad guesses = bugs.",
      "Silent exceptions — tool raises, model doesn't know why. Return errors as data.",
    ], { y: contentTop, h: 3.5, fontSize: 12 });
    T.notes(slide, [
      "Six traps — same pattern as Modules 1–3",
      "The 'too many tools' bullet is worth pausing on — most attendees overload",
      "'Side effects in read tools' is subtle — worth an example",
      "Silent exceptions was already covered in the error-contracts slide",
      "Attendees who avoid these six do 80% of tool design right in production",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 2 · Module 4", title: "Takeaways",
    bullets: [
      "Function calling = the model picks tools from a menu you defined. Bad menu = bad picks.",
      "Tool schema is a prompt. Name, description, parameter descriptions all matter.",
      "In MAF, any Python function or C# method can be a tool — decorators and attributes give finer control.",
      "Runtime context via ctx keeps sensitive values out of the model.",
      "Return errors as data, not exceptions, when you want the model to recover.",
      "All tools (function, Toolbox, MCP) share the same contract — different origins, same shape.",
    ],
    next: "Foundry Toolbox — managed tools you attach without writing.",
  }), [
    "Six-bullet recap — the biggest concept load of Day 2",
    "Emphasize: 'schema is a prompt' — repeat it",
    "Bridge to Module 5 — 'sometimes you don't write the tool at all'",
    "Time check — Modules 1+2+3+4 combined = ~135 min in",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-4-tools-layer.pptx") });
}

// ---------- MODULE 5 — Foundry Toolbox in Practice ----------
function buildModule5() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 2 · MODULE 5 · 25 MIN",
    title: "Foundry Toolbox in Practice",
    subtitle: "Managed tools you attach without writing",
    footer: "Building AI Apps and Agents",
  }), [
    "Second Actions-layer module",
    "25 min target — 2-min/slide check suggests this may run long (~30–34 min)",
    "Coverage over trim per Jim's direction",
    "Attendees leave able to author + attach a toolbox to an agent",
    "Bridge: Module 4 covered function-calling; this covers the FIRST tool origin",
  ]);

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Where we are in Actions" });
    T.addProse(slide, "Module 4 covered the function-calling contract — same for every tool.",
      { y: contentTop, h: 0.5, fontSize: 14, italic: true });
    T.addBullets(slide, [
      "Module 5 (this one) — Toolbox tools — Microsoft-managed catalog of tools you attach without writing",
      "Module 6 — Custom function tools you author in MAF",
      "Module 7 — Combining knowledge + tools",
    ], { y: contentTop + 0.7, h: 2.4, fontSize: 13 });
    slide.addText("Toolbox is where you say: 'I need my agent to search the web. I don't need to build a web-search tool.'", {
      x: 0.4, y: 4.35, w: 9.2, h: 0.6,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Re-anchor in Actions modules",
      "Three tool origins — Toolbox is the first",
      "The italic line = the pitch in one sentence",
      "Contrast with Module 6 (custom code) coming next",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "What Foundry Toolbox is" });
    T.addBullets(slide, [
      "A curated catalog of ready-to-use tools an agent can attach to",
      "A project-scoped resource — one toolbox per set of tools you want to reuse",
      "Exposed to MAF over an MCP endpoint — same MCP protocol as Day 3",
      "Versioned — publish v1, iterate to v2, consumers pin (or use the default)",
      "Managed by Microsoft (or your organization) — you don't own the runtime",
    ], { y: contentTop, h: 2.9 });
    slide.addText("One toolbox can contain many tools. Multiple agents can consume the same toolbox.", {
      x: 0.4, y: 4.35, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Five bullets = the essentials",
      "Project-scoped — you have one Foundry project = one toolbox catalog",
      "MCP-based — sets up the connection to Day 3's MCP module",
      "Versioned — same discipline as Prompt agents (Day 1 Module 6)",
      "Multiple agents consume one toolbox = key reuse benefit",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "The tools available in the catalog" });
    T.addTable(slide, [
      ["Category", "Examples"],
      ["Web", "Web search (Bing), Bing Custom Search"],
      ["Code", "Code interpreter (sandboxed Python)"],
      ["Data & search", "Azure AI Search, File search"],
      ["Enterprise", "SharePoint, Microsoft Fabric, WorkIQ"],
      ["Custom", "Any MCP server (local or remote), Skills"],
      ["Discovery", "Tool search (intent-based routing)"],
    ], { y: contentTop, colW: [2.4, 6.8], rowH: 0.42, fontSize: 12 });
    slide.addText("Two worth extra attention: MCP tools (attach any MCP server) and Toolbox search (LLM-driven routing).", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Six categories — walk them quickly",
      "MCP tool = key extensibility point (Day 3 connection)",
      "Toolbox search = the 'too many tools' solution",
      "Enterprise tools (SharePoint, Fabric) require project connections",
      "Verify current catalog vs. Learn — this space moves",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Why toolbox, and not just tools=[...] on the agent" });
    T.addProse(slide, "Function tools attach to a specific agent. Toolboxes are reusable across agents.",
      { y: 1.15, h: 0.5, fontSize: 13, italic: true });
    T.addTable(slide, [
      ["Question", "Function tools", "Toolbox"],
      ["Where is the code?", "In your app", "In Foundry / MCP server"],
      ["Who runs it?", "Your process", "Foundry or the MCP server"],
      ["Auth to internal systems?", "Your code", "Project connections + MI"],
      ["Shared across agents?", "Copy code", "One toolbox, many agents"],
      ["Versioned?", "With your app", "First-class in Foundry"],
      ["Governance?", "You audit", "Central catalog, RBAC, rai_config"],
    ], { y: 1.75, colW: [2.4, 3.3, 3.5], rowH: 0.4, fontSize: 11 });
    slide.addText("Toolbox wins on reuse, governance, and platform auth. Function tools win on flexibility.", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Six-question comparison table",
      "The last row (governance) is the enterprise pitch",
      "Function tools = flexibility; toolbox = platform-managed auth + reuse",
      "Attendees will need both in real systems — not either/or",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Toolbox anatomy" });
    T.addProse(slide, "A toolbox is a project resource with:",
      { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Name — identifier",
      "Description — human-readable",
      "Tools — a list of tool entries (each with its own config)",
      "Connections — project connections the toolbox references (AI Search, MCP server, Bing…)",
      "Skills — Foundry skills packaged as MCP resources",
      "Policies — optional RAI policy applied at the toolbox level",
      "Versions — the whole thing is versioned; one version is the default",
    ], { y: contentTop + 0.5, h: 3.2, fontSize: 12 });
    slide.addText("Same 'publish version, consumers pin' pattern as Prompt agents from Day 1.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Seven parts — the toolbox spec",
      "Connections are separate objects — YAML references by name",
      "Skills are Foundry-specific — MCP-packaged expertise",
      "RAI policy at toolbox level = central content-safety enforcement",
      "Versioning is first-class — same discipline as Prompt agents",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Two authoring paths" });
    T.addBullets(slide, [
      { text: "Portal", indent: 0 },
      { text: "Click-through UI in the Foundry portal for exploration", indent: 1 },
      { text: "IaC-first (workshop path)", indent: 0 },
      { text: "azd ai CLI or SDK", indent: 1 },
      { text: "Two-step flow:", indent: 1 },
      { text: "1. Create the connections (one per credential record)", indent: 2 },
      { text: "2. Create the toolbox from a YAML file", indent: 2 },
    ], { y: contentTop, h: 3.0, fontSize: 12 });
    slide.addText("YAML references connections by name. Credentials never live in YAML — they live in connections.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Two paths — portal for learning, azd for production (Day 1's operating norm)",
      "Two-step flow: connections first, THEN toolbox",
      "This split is intentional — YAML is checkable into source; credentials aren't",
      "azd ai is the same CLI attendees used for Day 1 Part B (Hosted agent deploy)",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "A minimal toolbox YAML" });
    T.addCode(slide, `# my-toolbox.yaml
description: Docs assistant helper toolbox

tools:
  - type: web_search
    name: web

  - type: code_interpreter
    container: { type: auto }
    name: code

  - type: toolbox_search   # intent-based routing over the tools above`,
      { y: 1.2, h: 2.6, fontSize: 12 });
    T.addProse(slide, "Create it:", { y: 3.9, h: 0.3, fontSize: 12 });
    T.addCode(slide, `azd ai project set $PROJECT_ENDPOINT
azd ai toolbox create my-toolbox --from-file ./my-toolbox.yaml`,
      { y: 4.25, h: 0.85, fontSize: 12 });
    T.notes(slide, [
      "Three tools attached — no custom code, no credentials in file",
      "web_search + code_interpreter are Microsoft-managed",
      "toolbox_search is the intent-based router — helps when many tools",
      "First version becomes default automatically",
      "The azd command is what attendees run in the lab",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Adding a tool that needs a connection" });
    T.addProse(slide, "For tools that reach external systems, register a connection first:",
      { y: 1.15, h: 0.4, fontSize: 12 });
    T.addCode(slide, `azd ai connection create my-search-conn \\
  --kind cognitive-search \\
  --target https://<search>.search.windows.net \\
  --auth-type project-managed-identity`, { y: 1.6, h: 1.3, fontSize: 12 });
    T.addProse(slide, "Then reference by name in the toolbox YAML:", { y: 3.0, h: 0.3, fontSize: 12 });
    T.addCode(slide, `tools:
  - type: azure_ai_search
    name: search
    azure_ai_search:
      indexes:
        - project_connection_id: my-search-conn
          index_name: docs-index`, { y: 3.35, h: 1.5, fontSize: 12 });
    slide.addText("Managed identity means the toolbox authenticates as itself — no long-lived keys.", {
      x: 0.4, y: 4.9, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Two-step pattern: connection, then tool that references it",
      "Managed identity = the toolbox has its own Entra identity",
      "No API keys in YAML, no keys checked into source",
      "This is the Day 1 IaC-first operating norm in action",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Attaching an MCP server as a Toolbox tool" });
    T.addProse(slide, "Any MCP server (public URL or your own) can be a toolbox tool:",
      { y: 1.15, h: 0.4, fontSize: 13 });
    T.addCode(slide, `tools:
  - type: mcp
    server_label: myserver
    server_url: https://your-mcp-server.example.com
    require_approval: never
    project_connection_id: my-mcp-conn`, { y: 1.6, h: 1.8, fontSize: 12 });
    T.addBullets(slide, [
      "Auth flows through the connection — keys, OAuth, Entra tokens all supported",
      "Same MCP protocol as Day 3 — Toolbox is one way to wire an MCP server in",
    ], { y: 3.55, h: 1.2, fontSize: 12 });
    slide.addText("Day 3 wires the Azure DevOps MCP server directly (not through Toolbox) — same protocol, different attachment.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 11, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Preview of Day 3 — this is one way to attach MCP servers",
      "Day 3's approach: direct MAF wiring (no toolbox)",
      "Both work; toolbox route gives you governance and reuse",
      "require_approval='never' for safe tools; 'always' for anything with side effects",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Consuming a toolbox — the two endpoints" });
    T.addProse(slide, "A toolbox exposes two MCP endpoints:", { y: contentTop, h: 0.4, fontSize: 13 });
    T.addTable(slide, [
      ["Role", "Endpoint", "Use"],
      ["Consumer", "{project}/toolboxes/{name}/mcp?api-version=v1", "Always default version. Agents connect here."],
      ["Developer", "{project}/toolboxes/{name}/versions/{v}/mcp?api-version=v1", "Version-pinned. For testing before promoting."],
    ], { y: 1.65, colW: [1.6, 4.7, 2.9], rowH: 0.85, fontSize: 11 });
    slide.addText("Rule of thumb: agents use the consumer endpoint. Promote new versions without redeploying the agent.", {
      x: 0.4, y: 4.4, w: 9.2, h: 0.55,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Two endpoints — same information",
      "Consumer = default version = production path",
      "Developer = version-pinned = testing path",
      "Rule: agents point at consumer, humans test at developer",
      "Promote new toolbox version = live update for all agents on the consumer endpoint",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Attaching a toolbox to an agent (MAF, Python)" });
    T.addCode(slide, `from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework.foundry.toolbox import FoundryToolbox
from azure.identity import AzureCliCredential

toolbox = FoundryToolbox(
    project_endpoint="https://<foundry-resource>.services.ai.azure.com/api/projects/<your-project>",
    name="my-toolbox",
    credential=AzureCliCredential(),
)

agent = Agent(
    client=FoundryChatClient(credential=AzureCliCredential()),
    name="DocsAssistant",
    instructions="Use the toolbox tools to answer questions and cite sources.",
    tools=[toolbox],   # ← one line to attach all toolbox tools
)`, { y: 1.2, h: 3.5, fontSize: 11 });
    slide.addText("toolbox behaves as a tool collection. All its tools become available via the Module 4 function-calling contract.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "One line — tools=[toolbox] — attaches everything",
      "Under the hood: MCP handshake, tool schemas fetched, wired to function calling",
      "Attendees do this in the lab — very few lines of code",
      "Point back to Module 4 — same contract, different origin",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Attaching a toolbox to a Prompt agent" });
    T.addProse(slide, "For Prompt agents, the toolbox is attached in the agent configuration, not from code:",
      { y: contentTop, h: 0.55, fontSize: 13 });
    T.addBullets(slide, [
      "Portal: Agents → your agent → Tools → Add Toolbox → select → save",
      "SDK: pass toolbox reference in PromptAgentDefinition(..., toolbox=...)",
      "YAML: reference the toolbox in the agent's declarative definition",
    ], { y: 1.85, h: 2.0, fontSize: 12 });
    slide.addText("Consuming agent code (FoundryAgent(agent_name=..., agent_version=...)) stays the same. All Prompt-agent version consumers automatically get the new tools.", {
      x: 0.4, y: 4.0, w: 9.2, h: 0.7,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    slide.addText("Same pattern for Hosted agents — configuration, not code.", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "For Prompt / Hosted agents: toolbox lives in configuration",
      "Agent code that connects to the Prompt agent doesn't change",
      "Portal, SDK, YAML — three ways to attach",
      "Powerful pattern: update toolbox, all agents get new tools",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Governance you get from toolbox" });
    T.addProse(slide, "Because toolboxes are a first-class Foundry resource:",
      { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "RBAC — who can create, update, and consume a toolbox is Entra-controlled",
      "Audit — toolbox versions and consumption tracked centrally",
      "RAI policy — apply a Responsible AI policy at the toolbox level (policies.rai_config)",
      "Central catalog — one place to see every managed tool in the project",
    ], { y: 1.55, h: 2.6, fontSize: 12 });
    slide.addText("The platform answer to: 'how do we stop developers from wiring random tools into production agents?'", {
      x: 0.4, y: 4.35, w: 9.2, h: 0.55,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Governance = the enterprise pitch",
      "Four benefits: RBAC, audit, RAI, catalog",
      "The italic line is the CIO-worthy framing",
      "For attendees who work in regulated environments — this is why they'd choose Toolbox over function tools",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Versioning workflow" });
    T.addProse(slide, "Standard workflow attendees will use:", { y: contentTop, h: 0.4, fontSize: 14 });
    T.addBullets(slide, [
      "Create v1 → automatically the default → agents consume via the consumer endpoint",
      "Author v2 (add a tool, tighten a description, swap an MCP connection)",
      "Test against the developer endpoint (/versions/2/mcp) before promotion",
      "Promote v2 to default when validated → agents pick it up on their next call, no code change",
    ], { y: 1.55, h: 2.6, fontSize: 12 });
    slide.addText("The promote step is the 'ship' moment. Same discipline as Prompt agent versioning from Day 1.", {
      x: 0.4, y: 4.45, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, [
      "Four-step workflow — attendees will run this in production",
      "Test at developer endpoint, promote to default",
      "No agent redeploy — the consumer endpoint always serves default",
      "Same publish discipline as Prompt agents (Day 1 Module 6)",
    ]);
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "When to build a function tool instead" });
    T.addTwoColumn(slide,
      [
        "Logic doesn't fit any Toolbox catalog entry",
        "Runtime context Toolbox model can't express (per-user filtering, session state)",
        "Prototyping fast — don't want to publish a toolbox yet",
        "Tool talks to something inside your app's process (in-memory cache, local model)",
      ],
      [
        "Tool is a shared capability across agents",
        "Want central governance, RBAC, and audit",
        "Integrates with a supported enterprise system (SharePoint, Fabric, Bing, AI Search, MCP)",
        "Want versioning as a first-class concern",
      ],
      { leftHeader: "Custom function tool (Module 6)", rightHeader: "Foundry Toolbox" }
    );
    slide.addText("Mix both. Real agents often have tools=[my_function_tool, my_toolbox].", {
      x: 0.4, y: 4.85, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, [
      "Decision framework — left vs. right",
      "Function tools = flexibility, quick prototyping",
      "Toolbox = shared, governed, enterprise-integrated",
      "The bottom line = mix. Sets up Module 6 next.",
    ]);
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 2 · Module 5", title: "Common traps" });
    T.addBullets(slide, [
      "Credentials in the YAML — don't. Use connections. YAML is checked into source.",
      "Consumer vs. developer endpoint confusion — agents = consumer; test = developer.",
      "Not testing before promoting — v2 is default the moment you promote. Test /versions/2/mcp first.",
      "Too many tools in one toolbox — ≤10 per agent applies. Use toolbox_search when >10.",
      "Assuming toolbox tools are free — some have per-call costs (Bing, code interpreter). Budget.",
      "Skipping RAI policy — toolbox is the right place to enforce content safety centrally. Use it.",
    ], { y: contentTop, h: 3.5, fontSize: 12 });
    T.notes(slide, [
      "Six traps — same pattern as prior modules",
      "The credentials-in-YAML trap is the biggest — attendees WILL try to shortcut",
      "Endpoint confusion catches everyone once",
      "'Cost' bullet is real — Bing has per-call pricing",
      "RAI policy is the governance win most attendees skip",
    ]);
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 2 · Module 5", title: "Takeaways",
    bullets: [
      "Foundry Toolbox = a curated catalog of managed tools you attach without writing.",
      "Toolbox tools are exposed over MCP — same protocol as Day 3.",
      "Two-step authoring: connections first, then a YAML that references them by name.",
      "Two endpoints: consumer (default version) and developer (version-pinned).",
      "Toolbox wins on reuse, governance, platform-managed auth. Function tools win on flexibility.",
      "Mix both — real agents often have custom + toolbox tools together.",
    ],
    next: "Authoring your own function tools in MAF — hands-on.",
  }), [
    "Six-bullet recap",
    "Bridge to Module 6 — the hands-on tool authoring",
    "Time check — Modules 1+2+3+4+5 = ~160 min in against 240 budget",
  ]);

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-5-foundry-toolbox.pptx") });
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
  await buildModule4();
  console.log("  module-4-tools-layer.pptx");
  await buildModule5();
  console.log("  module-5-foundry-toolbox.pptx");
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
