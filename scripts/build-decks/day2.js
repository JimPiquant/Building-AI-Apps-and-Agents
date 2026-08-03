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

// ---------- Main runner ----------
async function main() {
  console.log("Building Day 2 decks…");
  await buildModule1();
  console.log("  module-1-foundry-iq.pptx");
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
