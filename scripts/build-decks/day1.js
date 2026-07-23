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
  }), "Set the stage. Attendees include senior devs and architects who need a compass before hands-on. Emphasize this is decision-first, code-later.");

  {
    const { slide, contentTop, contentW } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "Why this module",
    });
    T.addProse(slide, "By the end of this workshop you'll be building agents. Before writing code, you need to know which surface to build on — and when. Today's decisions have outsized impact on cost, control, and portability.",
      { y: contentTop, w: contentW, h: 3.5, fontSize: 18 });
    T.notes(slide, "This slide is the frame. Reassure that this module is short (25 min) and light on code. Set expectation: decisions today, code Module 4+.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "Three surfaces you can build on" });
    T.addTable(slide, [
      ["Surface", "Audience", "Sweet spot"],
      ["Copilot Studio", "Makers, business analysts", "Low-code agents for M365, Teams, Power Platform"],
      ["Microsoft Foundry", "Developers", "Full model + agent platform on Azure"],
      ["Microsoft Agent Framework (MAF)", "Developers", "The SDK your app code uses to build agents on top of Foundry"],
    ], { colW: [3.0, 2.8, 3.4], rowH: 0.75 });
    T.notes(slide, "Copilot Studio and Foundry can be complementary. This workshop = Foundry + MAF. Make it explicit: 'if your target audience is makers, this is not your workshop.'");
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
    T.notes(slide, "Anchor slide. Emphasize that the problem shape is the same across all three; the layer of abstraction is what shifts. Sets up the next slide's spectrum framing.");
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
    T.notes(slide, "Use the familiar IaaS/PaaS/SaaS trio — attendees already know it. This replaces a bullet list and lands harder. Emphasize 'this workshop = PaaS.'");
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
    T.notes(slide, "This slide prevents the anti-pattern of building an agent for what should be a plain LLM call. Ask attendees which pattern their current use case actually needs.");
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
    T.notes(slide, "Preview only. Prompt agents, Hosted agents, Toolbox, and Foundry IQ each get their own module or day. Don't dive into any of them here.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, {
      tag: "Day 1 · Module 1", title: "What MAF gives you",
    });
    T.addBullets(slide, [
      "One SDK for authoring agents — Python and C#",
      "One vocabulary: agents, threads, tools, runs",
      "First-class streaming, memory, structured outputs",
      "Multi-agent orchestration primitives",
      "Consumes Foundry Toolbox and MCP servers",
      "The successor to Semantic Kernel and AutoGen patterns (both out of scope)",
    ], { y: contentTop });
    T.notes(slide, "Emphasize 'one vocabulary' — attendees coming from SK / AutoGen will spot the lineage. Call SK 'still supported, not the forward path.' Don't disparage.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 1", title: "What we will and won't cover" });
    T.addTwoColumn(slide,
      [
        "Foundry (portal, deployments, connections)",
        "MAF — three ways to run an agent (Prompt agent, Hosted agent, Responses API from your own code)",
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
    T.notes(slide, "This is important framing. Attendees with adjacent expectations need to know we're not going there today.");
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
    T.notes(slide, "Preview the arc. Mention every day builds on the same 'docs assistant' reference project.");
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
  }), "This module is mostly a live walkthrough. Slides are attendee reference. Have your portal open, share screen early.");

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
    T.notes(slide, "Set expectations: recognize, not master. The goal is to make Modules 4–6 make sense in context.");
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

    T.notes(slide, "Diagram from Microsoft Learn (foundry/concepts/architecture). Walk the four layers explicitly: (1) Foundry resource is the governance boundary — deployments, security, connections. (2) Projects are development boundaries nested inside. (3) Project assets are files, agents, evaluations. (4) Connected resources (Storage, Key Vault, AI Search) are separate Azure resources with their own governance — you manage networking and access for them independently.");
  }

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
    T.notes(slide, "Foundry User role was previously called Azure AI User — attendees may see either name during the rollout. RBAC scopes at both resource and project level; 401/403 in the lab almost always means missing Foundry User at the resource scope.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Project endpoints" });
    T.addProse(slide, "Every Foundry project has an endpoint like:", { y: 1.15, h: 0.4, fontSize: 15 });
    T.addCode(slide, "https://<project-name>.services.ai.azure.com", { y: 1.55, h: 0.6, fontSize: 18 });
    T.addProse(slide,
      "Set this as FOUNDRY_PROJECT_ENDPOINT in every lab's .env. MAF connects with this endpoint plus a credential — AzureCliCredential in dev, managed identity in production.",
      { y: 2.4, h: 1.5, fontSize: 15 });
    T.notes(slide, "Show them where to grab this from the portal. Overview page → 'Endpoints and keys' or similar (verify current wording live).");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Model catalog" });
    T.addBullets(slide, [
      "Browse frontier models (OpenAI, Meta, Mistral, others by region)",
      "Filter by capability — chat, embeddings, vision, etc.",
      "See region availability, pricing tier, context window",
      "Not every model is available in every region — check region and quota first",
    ], { y: contentTop });
    T.notes(slide, "Common gotcha — attendees pick a model, hit a region wall. Encourage confirming region + quota before deploying.");
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
    T.notes(slide, "Deployment name != model name. Common source of confusion in the lab. Emphasize.");
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
    T.notes(slide, "This is a debugging tip masquerading as a portal feature. Reinforce: iterate in the playground first.");
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
    T.notes(slide, "Reinforce the architecture slide: connections are Foundry's way of pointing at connected resources, which live under their own governance boundaries. If a Foundry-side connection fails, check the target resource's own network/access policies, not just Foundry's.");
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
    T.notes(slide, "Bookmark this. We use it lightly today and go deep Day 2. Note: Toolbox = MCP under the hood; ties into Day 3 nicely.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Foundry IQ (intro)" });
    T.addBullets(slide, [
      "The knowledge / grounding layer of Foundry",
      "Unified retrieval across enterprise sources — AI Search indexes, SharePoint, OneLake / Fabric, and more",
      "Alternative to hand-rolling a RAG pipeline per source",
      "Agents that use it get grounded answers with citations, without you writing retrieval code",
    ], { y: contentTop });
    T.notes(slide, "This is Day 2's main course. Just plant the flag.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Two axes to remember" });
    T.addTable(slide, [
      ["Axis", "Feature", "What it does"],
      ["Actions — how the agent does things", "Toolbox, MCP, function tools", "Callable capabilities"],
      ["Knowledge — how the agent knows things", "Foundry IQ, RAG", "Retrieval and grounding"],
    ], { colW: [3.5, 2.7, 3.0], rowH: 0.9, fontSize: 14 });
    T.notes(slide, "Actions vs. Knowledge is the compass for Days 2–3. Actions maps to Day 3 (MCP). Knowledge maps to Day 2 (Foundry IQ, RAG).");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 2", title: "Common portal gotchas" });
    T.addBullets(slide, [
      "Quota errors on deployment — request a bump in the region before Day 1",
      "Missing role assignments — attendees need at least Foundry User (previously Azure AI User) at the Foundry resource scope; 401/403 usually means this",
      "Region mismatch — model deployment region must be reachable by IQ / AI Search",
      "Preview features move — Toolbox and parts of IQ are evolving; trust running code over screenshots",
    ], { y: contentTop });
    T.notes(slide, "Give attendees the diagnostic sequence: quota → RBAC → region. In that order.");
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
    slide.addText("Attendees: do steps 1–4 on your own sub before the module ends.", {
      x: 0.4, y: 4.6, w: 9.2, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, "Screen share your portal. Move steadily. Ask attendees to raise a hand if they can't complete steps 1–4 during the demo.");
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
    eyebrow: "DAY 1 · MODULE 3 · 25 MIN",
    title: "Prompt Engineering Fundamentals",
    subtitle: "The parts that still matter when you're building agents",
    footer: "Building AI Apps and Agents",
  }), "This is the second-shortest module of Day 1. Don't over-invest — attendees will be doing prompting all week.");

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
    T.notes(slide, "Frame it: 'prompts are everywhere in agents.' The engineering discipline stays; the surface area changes.");
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
    T.notes(slide, "Four labeled sections is a good default. Show real examples during content review if time permits.");
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
    T.notes(slide, "This is where senior devs perk up. Ask if anyone has hit these before — usually a few nods.");
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
    T.notes(slide, "Both techniques appear again — structure is used every day; structured outputs deepens Day 3.");
  }

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
    T.notes(slide, "Push hard on 'change one thing.' Attendees will conflate multiple edits and be surprised the eval doesn't tell them what worked.");
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
    T.notes(slide, "For a Prompt agent, the instructions live in the portal as a versioned artifact — set up in Module 6, seen again in Part A of the lab.");
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
    T.notes(slide, "This is the point most attendees haven't internalized — MAF sends every tool docstring to the model. Docstring quality = model tool-use quality.");
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 3", title: "Takeaways",
    bullets: [
      "Prompts still matter — you'll just write fewer of them, more carefully.",
      "Structure > prose. Contracts > pleas.",
      "Iterate against an eval set, not intuition.",
      "Every instruction, tool docstring, and output schema is a prompt.",
    ],
    next: "MAF 101 — the core primitives you'll use every day this week.",
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
  }), "The most code-dense module of Day 1. Move at a steady pace; call out that Modules 5–6 use everything you show here.");

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "What MAF is" });
    T.addBullets(slide, [
      "Microsoft's SDK for building agents",
      "One vocabulary — Agent, chat client, tool, thread, run",
      "Python (agent_framework) and C# (Microsoft.Agents.AI) with matching concepts",
      "First-class Foundry integration",
      "Streaming, memory, structured outputs, tools, MCP, multi-agent, eval — one place",
      "The successor to Semantic Kernel and AutoGen for new work",
    ], { y: contentTop });
    T.notes(slide, "For attendees coming from SK / AutoGen — reassure that MAF is the forward direction with cleaner primitives.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "The primitives" });
    T.addTable(slide, [
      ["Primitive", "What it is"],
      ["Chat client", "Typed client that talks to a specific model service (e.g. FoundryChatClient)"],
      ["Agent", "Wraps a chat client with instructions and tools"],
      ["Thread", "The conversation state one agent operates on"],
      ["Run", "One turn (user → agent), non-streaming or streaming"],
      ["Tool", "A callable capability the model can invoke"],
      ["Message", "Individual user / assistant / tool messages in a thread"],
    ], { colW: [2.2, 7.0], rowH: 0.5 });
    T.notes(slide, "Six primitives. Every day this week uses them. Pause to ask if the names conflict with anything the audience already uses.");
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
    T.notes(slide, "That's it. Deployed model + credential + instructions. Emphasize how small this is.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "The simplest possible C# agent" });
    T.addCode(slide, `using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

var endpoint = Environment.GetEnvironmentVariable("FOUNDRY_PROJECT_ENDPOINT")!;
var model = Environment.GetEnvironmentVariable("FOUNDRY_MODEL") ?? "gpt-4o";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(model: model,
               name: "HelloAgent",
               instructions: "You are a friendly assistant. Keep answers brief.");

Console.WriteLine(await agent.RunAsync("What is the capital of France?"));`, { y: 1.2, h: 3.8 });
    T.notes(slide, "Same shape as Python. AIProjectClient.AsAIAgent(...) is C#'s way to write 'my code calling the Responses API'.");
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
    T.notes(slide, "Streaming matters for UX; we come back to it Day 3 with tool-progress events and cancellation.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Multi-turn conversations" });
    T.addProse(slide, "Threads carry conversation state across runs. A single agent can be invoked repeatedly and remember prior turns.",
      { y: 1.15, h: 0.7, fontSize: 15 });
    T.addCode(slide, `r1 = await agent.run("My name is Alex.")
r2 = await agent.run("What's my name?")   # answer: Alex`, { y: 1.9, h: 1.0, fontSize: 16 });
    T.addProse(slide,
      "Under the hood MAF is managing the thread for you. You can create explicit threads when you need to — covered in Day 3 memory module.",
      { y: 3.1, h: 1.2, fontSize: 14 });
    T.notes(slide, "Attendees will ask 'where does that state live?' — for your own MAF process, in the process; for Foundry-hosted Prompt or Hosted agents, server-side (Module 6).");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Authentication" });
    T.addBullets(slide, [
      "Every MAF sample uses Azure identity, not API keys",
      "Dev on your laptop: AzureCliCredential() — signs in via az login",
      "CI / production: DefaultAzureCredential() or, preferably, an explicit ManagedIdentityCredential",
      "Never commit API keys or connection strings — enforced on Day 5",
    ], { y: contentTop });
    T.notes(slide, "This is table stakes but attendees will still bring keys from other codebases. Restate: no keys in this workshop's code.");
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
    T.notes(slide, "Version freeze lives in manifests/versions.md. Attendees should not chase newer packages during the workshop.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 4", title: "Bridge to the next two modules" });
    T.addProse(slide,
      "You've now seen the MAF primitives that let your process call the Foundry Responses API — Agent + FoundryChatClient (Python) or AIProjectClient.AsAIAgent (C#).",
      { y: 1.2, h: 1.0, fontSize: 16 });
    T.addProse(slide,
      "That's one of three ways to run an agent with Foundry. The other two — Prompt agents (portal-authored, no code) and Hosted agents (your code, containerized, run by Foundry) — live inside Agent Service and are connected via FoundryAgent.",
      { y: 2.4, h: 1.2, fontSize: 16 });
    T.addProse(slide,
      "Module 5 gives us the mental model that ties everything together. Module 6 walks all three paths in detail.",
      { y: 3.8, h: 1.0, fontSize: 15, italic: true });
    T.notes(slide, "Foreshadow. Don't dive into hosting details here — save for Module 6.");
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 4", title: "Takeaways",
    bullets: [
      "MAF's primitives are small and stable: chat client, agent, thread, run, tool, message.",
      "Python and C# APIs mirror each other closely.",
      "Auth is Azure identity end-to-end. No keys.",
      "The pattern you just saw — your code calling the Responses API — is one of three ways to run an agent. Module 6 covers all three.",
    ],
    next: "The five-layer agent stack we'll refer to every day this week.",
  }), "Recap. If code slides ran long, cut the takeaways to 30 seconds.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-4-maf-101.pptx") });
}

// ---------- MODULE 5 — The Agent Stack ----------
function buildModule5() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 5 · 35 MIN",
    title: "The Agent Stack",
    subtitle: "The mental model we use every day this week",
    footer: "Building AI Apps and Agents",
  }), "The 'compass' module. If they leave with only one thing from Day 1, it should be this five-layer model.");

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
    T.notes(slide, "Say the five words twice. Ask attendees to write them down. Every day this week refers back.");
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
    T.notes(slide, "Keep it short — attendees have already been through the portal on this.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 2 — Runtime" });
    T.addProse(slide, "Where the agent code and state live. Two choices:", { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Prompt agent — portal- or SDK-authored, no code, Foundry runs it",
      "Hosted agent — your code, packaged as a container, Foundry runs the container",
      "Your own code calling the Responses API — your process runs your code and calls Foundry for models and tools",
    ], { y: 1.8, h: 2.2 });
    T.addProse(slide,
      "Module 6 is entirely about this choice. Both are legitimate; each has a sweet spot.",
      { y: 4.3, h: 0.6, fontSize: 14, italic: true });
    T.notes(slide, "Tee up Module 6.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 3 — Actions" });
    T.addProse(slide, "How the agent affects the world.", { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Function tools — Python or C# functions you write, decorated for MAF",
      "Foundry Toolbox — curated tools exposed via an MCP endpoint (Bing, Fabric, SharePoint, code interpreter, …)",
      "MCP servers — the open protocol; MAF can consume any MCP server and you can author your own",
    ], { y: 1.8, h: 2.4 });
    T.addProse(slide,
      "Day 2: function tools and Toolbox. Day 3: MCP end-to-end.",
      { y: 4.3, h: 0.6, fontSize: 14, italic: true });
    T.notes(slide, "Actions = capability. Knowledge (next slide) = memory. Keep them distinct.");
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
    T.notes(slide, "IQ = the easy path. Custom RAG = when you need control. Not a binary — mix.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Layer 5 — Ops" });
    T.addProse(slide, "The unglamorous layer that makes agents production-worthy.",
      { y: 1.15, h: 0.5, fontSize: 16 });
    T.addBullets(slide, [
      "Identity — Entra, managed identity, RBAC",
      "Tracing — OpenTelemetry, Foundry tracing, App Insights",
      "Evaluation — retrieval, single-agent, multi-agent, continuous",
      "Cost & latency — model tiers, caching, batching, routing",
      "Deployment — Container Apps, Functions, AKS",
    ], { y: 1.8, h: 2.8 });
    T.addProse(slide, "Day 5 owns most of this — but evaluation is threaded through every day.",
      { y: 4.75, h: 0.5, fontSize: 14, italic: true });
    T.notes(slide, "Emphasize: eval is not a Day-5 topic. It appears every day.");
  }

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
    T.notes(slide, "Nothing in the workshop lives outside these five columns. If something feels orphaned, tell us.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 5", title: "Why this matters" });
    T.addBullets(slide, [
      "Diagnose problems by layer — 'the agent isn't grounded' is a Knowledge problem, not a Model problem",
      "Estimate cost and risk — adding an MCP server is an Actions + Ops concern, not a model concern",
      "Communicate cleanly with stakeholders — product, ops, security all live at different layers",
    ], { y: contentTop });
    slide.addText("Bring this back to Publix as a shared vocabulary.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy,
    });
    T.notes(slide, "This is a soft-skills slide disguised as an architecture slide. Attendees will use it to argue for budget and roadmap items.");
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 5", title: "Takeaways",
    bullets: [
      "Five layers: Model, Runtime, Actions, Knowledge, Ops.",
      "Every day of the workshop, and every real agent you build, fits into these.",
      "When something breaks or costs too much, ask which layer first.",
    ],
    next: "Module 6 zooms into Layer 2 (Runtime) — the three ways to run an agent with Foundry.",
  }), "Ask two attendees to name the five layers out loud. Cheap check for retention.");

  return pres.writeFile({ fileName: path.join(OUT_DIR, "module-5-agent-stack.pptx") });
}

// ---------- MODULE 6 — Three ways to run an agent with Foundry ----------
function buildModule6() {
  const pres = T.newDeck(new pptxgen());

  T.notes(T.titleSlide(pres, {
    eyebrow: "DAY 1 · MODULE 6 · 35 MIN",
    title: "Three ways to run an agent with Foundry",
    subtitle: "Prompt agents, Hosted agents, and calling the Responses API from your own code",
    footer: "Building AI Apps and Agents",
  }), "Terminology-heavy module. Get the words right — these are the actual Foundry Agent Service terms and appear in every future day. All three paths use the Responses API; what changes is where the code runs and how much of the runtime Foundry manages.");

  {
    const { slide } = T.bodySlide(pres, {
      tag: "Day 1 · Module 6", title: "Foundry Agent Service — you pick how much of it to use",
    });
    const cardY = 1.25, cardH = 2.6, cardW = 3.0, gap = 0.15;
    const startX = (10 - (3 * cardW + 2 * gap)) / 2;
    const cards = [
      { name: "Path A · Prompt agent",
        where: "Runs in Foundry",
        managed: "Foundry manages everything (no code, no compute)" },
      { name: "Path B · Hosted agent",
        where: "Your code, run by Foundry",
        managed: "Foundry manages endpoint, autoscale, identity, observability" },
      { name: "Path C · Your code + Responses API",
        where: "Runs in your process",
        managed: "You manage the runtime; Foundry serves the model + tools" },
    ];
    cards.forEach((c, i) => {
      const x = startX + i * (cardW + gap);
      slide.addShape("rect", {
        x, y: cardY, w: cardW, h: cardH,
        fill: { color: T.COLORS.white },
        line: { color: T.COLORS.navy, width: 1 },
      });
      slide.addText(c.name, {
        x: x + 0.1, y: cardY + 0.15, w: cardW - 0.2, h: 0.55,
        fontFace: T.FONTS.title, fontSize: 15, bold: true, color: T.COLORS.navy, align: "center", valign: "middle", margin: 0,
      });
      slide.addText(c.where, {
        x: x + 0.1, y: cardY + 0.85, w: cardW - 0.2, h: 0.35,
        fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted, align: "center", margin: 0,
      });
      slide.addText(c.managed, {
        x: x + 0.15, y: cardY + 1.35, w: cardW - 0.3, h: 1.1,
        fontFace: T.FONTS.body, fontSize: 12, color: T.COLORS.ink, align: "center", valign: "top", margin: 0,
      });
    });
    slide.addShape("rect", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.6,
      fill: { color: T.COLORS.ice }, line: { type: "none" },
    });
    slide.addText([
      { text: "Shared entry point: ", options: { bold: true } },
      { text: "the Responses API. All three paths call it for models and platform tools." },
    ], {
      x: 0.55, y: 4.6, w: 8.9, h: 0.5,
      fontFace: T.FONTS.body, fontSize: 13, color: T.COLORS.navy, valign: "middle", margin: 0,
    });
    T.notes(slide, "Anchor slide. Reinforce: Responses API is the shared entry point. What changes across the three paths is where the code lives and who manages the runtime. Ordering goes from most-Foundry-managed to least.");
  }

  // Path A — Prompt agent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Path A — Prompt agent" });
    T.addProse(slide,
      "A Prompt agent is defined entirely as configuration: instructions, model, tools. Author in the Foundry portal, via SDK / REST, or as a declarative YAML definition. Foundry runs it — no application code to maintain, no compute to manage.",
      { y: 1.15, h: 0.9, fontSize: 13 });
    T.addCode(slide, `from agent_framework.foundry import FoundryAgent
from azure.identity import AzureCliCredential

agent = FoundryAgent(
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant",
    agent_version="1.0",
    credential=AzureCliCredential(),
)
result = await agent.run("What is Foundry IQ?")`, { y: 2.15, h: 2.55 });
    slide.addText("Best for: fast start, internal tools, production agents that don't need custom orchestration.",
      { x: 0.4, y: 4.85, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted });
    T.notes(slide, "Learn's recommended 'start here' path. Zero infrastructure and the fastest way to see an agent working.");
  }

  // Path B — Hosted agent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Path B — Hosted agent" });
    T.addProse(slide,
      "Your agent code (MAF, LangGraph, OpenAI Agents SDK, or your own), packaged as a container or a source zip. Foundry runs the container with a managed endpoint, autoscale, dedicated Entra identity, and end-to-end observability. Under the hood, your code calls the Responses API.",
      { y: 1.15, h: 1.3, fontSize: 12 });
    T.addCode(slide, `# From any client — including another agent — connect by name:
from agent_framework.foundry import FoundryAgent

agent = FoundryAgent(
    project_endpoint="https://<project>.services.ai.azure.com",
    agent_name="docs-assistant-hosted",
    credential=AzureCliCredential(),
)`, { y: 2.5, h: 2.05, fontSize: 12 });
    slide.addText("Best for: agents that call into your own custom code, custom orchestration, and any scenario where you want Foundry to handle hosting, scaling, and identity.",
      { x: 0.4, y: 4.7, w: 9.2, h: 0.55, fontFace: T.FONTS.body, fontSize: 12, italic: true, color: T.COLORS.muted });
    T.notes(slide, "Path B is where Foundry stops being 'model host' and starts being 'agent app host + platform tooling.' Attendees see this in Part B of the lab.");
  }

  // What Foundry manages for a Hosted agent (comes right after Path B)
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "What Foundry manages for a Hosted agent" });
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
        "End-to-end tracing + App Insights integration",
        "Content safety and prompt-injection mitigation",
        "Foundry Toolbox tools (web search, code interpreter, MCP servers, …)",
        "Managed conversations / memory (BYO also supported)",
      ],
      { leftHeader: "What you write", rightHeader: "What Foundry gives you" }
    );
    T.notes(slide, "Answer to 'why not just run my own container?' — Foundry hosts your app runtime AND the tooling around it in one place.");
  }

  // Path C — Your code + Responses API
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Path C — Your own code, calling the Responses API" });
    T.addProse(slide,
      "Your MAF app runs in your process — laptop, Container Apps, App Service, AKS, Functions — and calls Foundry's Responses API. You own the runtime.",
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
    slide.addText("Additive to Path B — the same MAF code can be repackaged as a Hosted agent later. No rewrite.",
      { x: 0.4, y: 4.85, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, "The most common developer path. Emphasize the additive relationship with Path B — Path C code becomes a Hosted agent by packaging, not rewriting.");
  }

  // Path C — C# equivalent
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Path C — C# equivalent" });
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
    T.notes(slide, "AIProjectClient.AsAIAgent(...) is C#'s way to write Path C. Python and C# APIs mirror.");
  }

  // Compare at a glance
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Compare at a glance" });
    T.addTable(slide, [
      ["Concern", "A · Prompt", "B · Hosted", "C · Your code"],
      ["Runtime code to maintain", "None", "Yours", "Yours"],
      ["Compute to manage", "None", "Container (Foundry)", "Yours"],
      ["Managed endpoint", "Yes", "Yes", "You provide"],
      ["Autoscale", "Yes", "Yes", "You handle"],
      ["Agent identity (Entra)", "Yes", "Yes, dedicated", "You handle"],
      ["Iteration speed", "Portal + publish", "Portal upload / redeploy", "Edit + restart"],
      ["Portability off Foundry", "Low", "Medium", "High"],
    ], { y: contentTop, colW: [2.6, 2.0, 2.4, 2.2], rowH: 0.42, fontSize: 12 });
    T.notes(slide, "Walk down each row. Emphasize how Path C is the most portable but requires you to handle endpoint, scaling, identity yourself.");
  }

  // Decision guide
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Decision guide (rough cuts)" });
    T.addBullets(slide, [
      "Getting started, or building a scoped internal tool with no custom logic? → Path A (Prompt agent)",
      "Shipping a production agent with custom code that needs managed hosting, Entra identity, and observability? → Path B (Hosted agent)",
      "Regulated agent that needs managed content safety, a stable endpoint, and dedicated identity? → Path A or Path B",
      "Embedding an agent inside an existing app you already run somewhere? → Path C (your code + Responses API)",
      "Prototyping quickly on your laptop before you decide on hosting? → Path C",
    ], { y: contentTop, fontSize: 14 });
    slide.addText("Mix and match — real systems combine paths.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4,
        fontFace: T.FONTS.body, fontSize: 13, italic: true, color: T.COLORS.muted });
    T.notes(slide, "Ask the audience whether their scenario fits more than one row — many will. That's the point.");
  }

  // Common gotchas
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Common gotchas" });
    T.addBullets(slide, [
      "\"Prompt agent = client-side\" — wrong. A Prompt agent is Foundry-managed. There's no client-side runtime for it at all.",
      "\"Hosted agent = my code running anywhere in Azure\" — wrong. Hosted agent specifically means your code as a container run by Foundry Agent Service. Your own container in your own App Service is Path C, not Path B.",
      "Assuming portability off Foundry — Path A is Foundry-only by construction. Path B keeps Foundry-managed features (Toolbox, IQ, portal connections) behind the managed endpoint. Path C is the most portable.",
      "Mixing up authentication — all three use Azure identity; the credential authenticates to different things.",
    ], { y: contentTop, fontSize: 13 });
    T.notes(slide, "The first two gotchas are the terminology collisions the module was designed to fix. Reinforce.");
  }

  // Same MAF code, different destinations
  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "Same MAF code, different destinations" });
    slide.addText("Path C code can be repackaged as a Path B Hosted agent later. The MAF code you write does not change.", {
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
      { name: "Foundry Agent Service (Path B)", sub: "zip → portal → managed Hosted agent" },
      { name: "Azure Container Apps or AKS", sub: "Path C — you own the container" },
      { name: "App Service or Azure Functions", sub: "Path C — event-driven or HTTP triggers" },
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
      { text: "Prototype locally in Path C. Decide destination later. ", options: { bold: true } },
      { text: "Foundry-specific features (Toolbox skills, IQ, agent identity) become available on Path A or Path B." },
    ], {
      x: 0.55, y: 4.6, w: 8.9, h: 0.4,
      fontFace: T.FONTS.body, fontSize: 11, color: T.COLORS.navy, valign: "middle", margin: 0,
    });
    T.notes(slide, "Anti-lock-in reassurance for the agent code. Foundry-specific *features* remain the coupling — call that out honestly.");
  }

  // What you'll do in the lab
  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 6", title: "What you'll do in the lab" });
    T.addBullets(slide, [
      "Part A — Prompt agent: create in the Foundry portal, connect from your MAF app",
      "Part B — Hosted agent: connect to a pre-deployed Hosted agent in the sandbox; walk the portal to see what Foundry manages (endpoint, tracing, identity, Toolbox tool, content safety)",
      "Part C — Your own code + Responses API: build an MAF app in Python (or C#) that runs in your process",
      "Stretch (Part C): zip your Part C code and deploy it as your own Hosted agent",
    ], { y: contentTop, fontSize: 14 });
    slide.addText("Same underlying docs-assistant behavior three ways. You'll feel the trade-offs.",
      { x: 0.4, y: 4.55, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, "Bridge to Module 7 lab kickoff. Attendees should feel prepared.");
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 6", title: "Takeaways",
    bullets: [
      "Foundry gives you three hosting options, with the Responses API as the shared entry point.",
      "Prompt agent = configuration only. Hosted agent = your code, Foundry-run. Path C = your code, you run it.",
      "Foundry Agent Service manages more than models — endpoint, identity, observability, Toolbox tools, memory, content safety.",
      "Path C code is portable — you can promote it to a Hosted agent later without a rewrite.",
    ],
    next: "Lab walkthrough and environment check.",
  }), "Two-minute recap. Confirm no vocabulary confusion before moving to the lab.");

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
  }), "Short module. Objective: everyone leaves the live session with a green light on their environment. Async lab starts immediately after.");

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "What you'll build" });
    T.addBullets(slide, [
      "The same small docs assistant, three ways",
      "Part A — Prompt agent (created in the portal, no code to maintain)",
      "Part B — Hosted agent (connect to a pre-deployed one; explore what Foundry manages)",
      "Part C — Your own code calling the Responses API (MAF in Python or C#)",
      "Ask each the same questions and compare behavior, latency, and where thread state lives",
    ], { y: contentTop });
    T.notes(slide, "Emphasize reflection > code. The reflection.md is the actual deliverable.");
  }

  {
    const { slide } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Environment check — before you start" });
    T.addCode(slide, `az login
az account show --query name -o tsv
python --version         # 3.11+
dotnet --version         # 10.0+ (optional, if doing C#)
uv --version             # required for Python labs`, { y: 1.2, h: 1.9 });
    T.addBullets(slide, [
      "FOUNDRY_PROJECT_ENDPOINT (from the portal tour)",
      "A model deployment name in that project (e.g., gpt-4o or gpt-5.4-mini)",
    ], { y: 3.4, h: 1.5 });
    slide.addText("If anything fails, flag it now — get unblocked before the async portion.",
      { x: 0.4, y: 4.9, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, bold: true, color: T.COLORS.navy });
    T.notes(slide, "Do a live show-of-hands: 'raise your hand if az login didn't work.' Fix issues in real time before they leave the room.");
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
├── python/                   ← Python starter templates (uv)
│   ├── pyproject.toml
│   ├── part_a_prompt_agent.py
│   ├── part_b_hosted_agent.py
│   └── part_c_responses_api.py
└── csharp/PartC_ResponsesApi/`, { y: 3.2, h: 2.1, fontSize: 12 });
    T.notes(slide, "Walk through the file layout so nothing feels mysterious. Show the actual repo URL.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Success criteria — what 'done' looks like" });
    T.addBullets(slide, [
      "Part A runs — you created a Prompt agent in the Foundry portal (version 1.0) and your MAF app connects to it",
      "Part B runs — you connect to a pre-deployed Hosted agent and walk the portal to see what Foundry manages",
      "Part C runs — your MAF app calls the Responses API and handles multi-turn, streaming, and non-streaming",
      "A short reflection.md committed to your fork:",
      { text: "What does Foundry manage for you in Parts A and B that you'd handle yourself in Part C?", indent: 1 },
      { text: "Which felt faster to iterate on?", indent: 1 },
      { text: "Which would you pick for a shared cross-team agent at Publix? Why?", indent: 1 },
    ], { y: contentTop });
    T.notes(slide, "The reflection is the deliverable. Focus on trade-offs, not on maximum coverage.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "How to get help" });
    T.addBullets(slide, [
      "Blocking issue? Post in the workshop channel",
      "Environment / RBAC / quota? Usually a 5-minute fix — flag in chat",
      "Code stuck? Pair up — lab is designed to be doable, not solo-only",
      "Instructor is on for questions during the async portion; response times vary",
    ], { y: contentTop });
    T.notes(slide, "Set the norm that asking is encouraged. First-hour blocker rate matters more than final completion rate.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Common early gotchas (skim before you start)" });
    T.addBullets(slide, [
      "az login succeeded but MAF still 401s — may need Azure AI User role on the project",
      "FOUNDRY_PROJECT_ENDPOINT not set — copy from .env.example, paste from portal",
      "Model deployment name mismatch — deployment name is not the same as model name",
      "Python — package missing — uv sync from labs/day1/python/",
    ], { y: contentTop, fontSize: 14 });
    T.notes(slide, "This is a look-before-you-leap slide. Save the async portion from the same-question-x-15 problem.");
  }

  {
    const { slide, contentTop } = T.bodySlide(pres, { tag: "Day 1 · Module 7", title: "Time expectations" });
    T.addBullets(slide, [
      "Part A → about 30 min (portal setup + connection)",
      "Part B → about 30 min (connect + portal exploration)",
      "Part C → about 45 min (most of the code writing lives here; stretch deploy adds ~30 min)",
      "Reflection commit → ~10 min",
      "Total: ~2 hours of async work",
    ], { y: contentTop });
    slide.addText("Going long? Ping a facilitator — we'll help you scope down.", {
      x: 0.4, y: 4.55, w: 9.2, h: 0.4, fontFace: T.FONTS.body, fontSize: 14, italic: true, color: T.COLORS.muted,
    });
    T.notes(slide, "Set realistic expectations. Attendees who hit 90 min on Part C should ask for help.");
  }

  T.notes(T.takeawaysSlide(pres, {
    tag: "Day 1 · Module 7", title: "Takeaways",
    bullets: [
      "Same underlying docs-assistant behavior — three hosting options with Foundry.",
      "Focus on feeling the difference — not just making the code run.",
      "The reflection is the deliverable, not the code.",
    ],
    next: "End of Day 1 live content. Have fun with the lab.",
  }), "Sign-off. Encourage attendees to start the lab in a small pair or group if the async time doesn't line up individually.");

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
