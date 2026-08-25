// Build Day 3 decks from the Markdown plans in slides/day3/.
// Markdown is the source of truth for slide text, sources, and delivery notes.

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const T = require("./theme");

const ROOT = path.resolve(__dirname, "..", "..");
const SLIDES_DIR = path.join(ROOT, "slides", "day3");
const OUT_DIR = path.join(ROOT, "decks", "day3");

const MODULE_FILES = [
  "module-1-sessions-state.md",
  "module-2-streaming-structured.md",
  "module-3-compaction.md",
  "module-4-middleware.md",
  "module-5-mcp.md",
  "module-6-azure-devops-mcp.md",
  "module-7-eval-lab-kickoff.md",
  "module-8-optional-harnesses.md",
];

// Fence language tags recognized by theme.js's code highlighter. Anything
// else (json's cousin "text", no tag, etc.) renders as plain uncolored code.
const CODE_LANG_NAMES = new Set(["python", "csharp", "json", "bash"]);

function clean(text) {
  return (text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("Missing front matter");
  const meta = {};
  for (const line of match[1].split("\n")) {
    const split = line.indexOf(":");
    if (split < 0) continue;
    meta[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  return { meta, body: markdown.slice(match[0].length) };
}

function parseList(lines) {
  const items = [];
  let current = null;
  for (const line of lines) {
    let match = line.match(/^-\s+\*\*(.+?)\*\*(?:\s+—\s+(.*))?\s*$/);
    if (match) {
      current = { title: clean(match[1]), text: clean(match[2] || ""), children: [] };
      items.push(current);
      continue;
    }
    match = line.match(/^-\s+(.*)$/);
    if (match) {
      current = { title: "", text: clean(match[1]), children: [] };
      items.push(current);
      continue;
    }
    match = line.match(/^\s{2,}-\s+(.*)$/);
    if (match && current) current.children.push(clean(match[1]));
  }
  return items;
}

function parseFlow(lines) {
  return lines.flatMap((line) => {
    const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*(?:\s+—\s+(.*))?\s*$/);
    return match ? [{ title: clean(match[1]), text: clean(match[2] || "") }] : [];
  });
}

function parseTable(lines) {
  const tableLines = lines.filter((line) => /^\|.*\|$/.test(line.trim()));
  return tableLines
    .filter((line) => !/^\|[\s|:-]+\|$/.test(line.trim()))
    .map((line) => line.trim().slice(1, -1).split("|").map(clean));
}

// Demo placeholder slides carry a "DEMO N.M — Title" heading in the markdown
// for readability; the leading label is stripped before it reaches the
// visual demoSlide title (the "DEMO" eyebrow + tag already carry that cue).
function stripDemoLabel(title) {
  return title.replace(/^DEMO\s+[0-9.]+\s+—\s+/i, "").trim();
}

function parseSlides(body) {
  const matches = [...body.matchAll(/^## (.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    const raw = body.slice(start, end).trim();
    const layout = raw.match(/<!--\s*layout:\s*(.*?)\s*-->/)?.[1].trim() || "cards";
    const sourceText = raw.match(/<!--\s*source:\s*(.*?)\s*-->/)?.[1].trim() || "";
    const guidance = raw.match(/<!--\s*notes:\s*(.*?)\s*-->/)?.[1].trim() || "";
    const demoTime = raw.match(/<!--\s*demo-time:\s*(.*?)\s*-->/)?.[1].trim() || "";
    const demoReference = raw.match(/<!--\s*demo-reference:\s*(.*?)\s*-->/)?.[1].trim() || "";
    const sources = sourceText.split(/\s+\|\s+/).filter(Boolean);
    const visible = raw
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    const codeMatch = visible.match(/```(\w+)?\n([\s\S]*?)```/);
    const code = codeMatch?.[2].trimEnd() || "";
    const codeLang = codeMatch?.[1] && CODE_LANG_NAMES.has(codeMatch[1]) ? codeMatch[1] : "text";
    const lines = visible.split("\n");
    const title = layout === "demo" ? stripDemoLabel(clean(match[1])) : clean(match[1]);
    return {
      title,
      layout,
      sources,
      guidance,
      code,
      codeLang,
      demoTime,
      demoReference,
      description: layout === "demo" ? clean(visible) : visible,
      items: parseList(lines),
      flow: parseFlow(lines),
      table: parseTable(lines),
    };
  });
}

function parseModule(fileName) {
  const markdown = fs.readFileSync(path.join(SLIDES_DIR, fileName), "utf8");
  const { meta, body } = parseFrontMatter(markdown);
  const slides = parseSlides(body);
  if (!meta.deck || !meta.tag || slides.length === 0) {
    throw new Error(`Invalid module plan: ${fileName}`);
  }
  for (const slide of slides) {
    if (slide.sources.length === 0 || !slide.guidance) {
      throw new Error(`Every slide needs source and notes: ${fileName} / ${slide.title}`);
    }
    if (slide.layout === "demo" && (!slide.demoTime || !slide.demoReference || !slide.description)) {
      throw new Error(`Demo slide needs demo-time, demo-reference, and a description: ${fileName} / ${slide.title}`);
    }
  }
  return { fileName, meta, slides };
}

function addSourceFooter(slide, sources, y = 5.22, dark = false) {
  const primary = sources[0];
  const suffix = sources.length > 1 ? `  ·  +${sources.length - 1} in notes` : "";
  slide.addShape("line", {
    x: 0.4, y, w: 9.2, h: 0,
    line: { color: dark ? T.COLORS.ice : T.COLORS.border, width: 0.5 },
  });
  slide.addText(`Source: ${primary}${suffix}`, {
    x: 0.42, y: y + 0.05, w: 9.05, h: 0.2,
    fontFace: T.FONTS.body, fontSize: 8.2,
    color: dark ? T.COLORS.ice : T.COLORS.muted,
    margin: 0, fit: "shrink", breakLine: false,
  });
}

function addNotes(slide, guidance, sources) {
  T.notes(slide, [
    guidance,
    ...sources.map((source) => `GROUNDING SOURCE: ${source}`),
  ]);
}

function addTag(slide, meta) {
  slide.addText(meta.tag, {
    x: 6.0, y: 0.28, w: 3.65, h: 0.25,
    fontFace: T.FONTS.body, fontSize: 9.5, color: T.COLORS.muted,
    align: "right", margin: 0, fit: "shrink",
  });
}

function bodySlide(pres, meta, title) {
  const slide = pres.addSlide();
  slide.background = { color: T.COLORS.white };
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.06, h: 5.625,
    fill: { color: T.COLORS.navy }, line: { type: "none" },
  });
  addTag(slide, meta);
  const titleSize = title.length > 44 ? 23 : title.length > 34 ? 25 : 28;
  slide.addText(title, {
    x: 0.4, y: 0.34, w: 7.2, h: 0.66,
    fontFace: T.FONTS.title, fontSize: titleSize, bold: true,
    color: T.COLORS.navy, margin: 0, fit: "shrink",
  });
  return slide;
}

function addCard(slide, item, x, y, w, h, index, accent = false) {
  slide.addShape("roundRect", {
    x, y, w, h,
    rectRadius: 0.06,
    fill: { color: accent ? T.COLORS.ice : T.COLORS.panel },
    line: { color: accent ? T.COLORS.navy : T.COLORS.border, width: 0.8 },
  });
  if (index !== undefined) {
    slide.addShape("ellipse", {
      x: x + 0.12, y: y + 0.13, w: 0.35, h: 0.35,
      fill: { color: T.COLORS.navy }, line: { type: "none" },
    });
    slide.addText(String(index + 1), {
      x: x + 0.12, y: y + 0.185, w: 0.35, h: 0.16,
      fontFace: T.FONTS.body, fontSize: 9, bold: true,
      color: T.COLORS.white, align: "center", margin: 0,
    });
  }
  const textX = index !== undefined ? x + 0.58 : x + 0.16;
  const textW = index !== undefined ? w - 0.72 : w - 0.32;
  const title = item.title || item.text;
  const body = item.title ? item.text : "";
  slide.addText(title, {
    x: textX, y: y + 0.13, w: textW, h: body ? 0.34 : h - 0.24,
    fontFace: T.FONTS.title, fontSize: 15, bold: true,
    color: T.COLORS.navy, margin: 0, fit: "shrink",
    valign: body ? "mid" : "middle",
  });
  if (body) {
    slide.addText(body, {
      x: x + 0.16, y: y + 0.55, w: w - 0.32, h: h - 0.68,
      fontFace: T.FONTS.body, fontSize: 11.5, color: T.COLORS.ink,
      margin: 0, fit: "shrink", valign: "top",
    });
  }
}

function renderCards(slide, items) {
  const count = Math.max(items.length, 1);
  const cols = count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const gapX = 0.22;
  const gapY = 0.22;
  const w = (9.2 - gapX * (cols - 1)) / cols;
  const h = (3.84 - gapY * (rows - 1)) / rows;
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    addCard(slide, item, 0.4 + col * (w + gapX), 1.18 + row * (h + gapY), w, h, undefined, index === 0);
  });
}

function renderFlow(slide, items) {
  const count = items.length;
  const cols = count <= 4 ? count : 3;
  const rows = Math.ceil(count / cols);
  const gapX = 0.28;
  const gapY = 0.28;
  const w = (9.2 - gapX * (cols - 1)) / cols;
  const h = rows === 1 ? 2.35 : 1.72;
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = 0.4 + col * (w + gapX);
    const y = 1.33 + row * (h + gapY);
    addCard(slide, item, x, y, w, h, index, index === 0 || index === count - 1);
    if (col < cols - 1 && index < count - 1) {
      slide.addShape("chevron", {
        x: x + w + 0.04, y: y + h / 2 - 0.12, w: 0.18, h: 0.24,
        fill: { color: T.COLORS.accent }, line: { type: "none" },
      });
    }
  });
}

function renderCompare(slide, items) {
  const panels = items.slice(0, 2);
  panels.forEach((item, index) => {
    const x = index === 0 ? 0.4 : 5.1;
    slide.addShape("roundRect", {
      x, y: 1.18, w: 4.5, h: 3.82,
      fill: { color: index === 0 ? T.COLORS.panel : T.COLORS.ice },
      line: { color: index === 0 ? T.COLORS.border : T.COLORS.navy, width: 0.9 },
    });
    slide.addText(item.title || item.text, {
      x: x + 0.22, y: 1.42, w: 4.06, h: 0.45,
      fontFace: T.FONTS.title, fontSize: 20, bold: true,
      color: T.COLORS.navy, margin: 0, fit: "shrink",
    });
    const details = [...(item.text ? [item.text] : []), ...item.children];
    const runs = details.map((detail, detailIndex) => ({
      text: detail,
      options: { bullet: true, breakLine: detailIndex < details.length - 1 },
    }));
    slide.addText(runs, {
      x: x + 0.25, y: 2.0, w: 3.98, h: 2.62,
      fontFace: T.FONTS.body, fontSize: 13, color: T.COLORS.ink,
      margin: 0.03, paraSpaceAfterPt: 8, breakLine: false, fit: "shrink",
    });
  });
}

function renderTable(slide, rows) {
  if (rows.length === 0) return;
  const columns = rows[0].length;
  const fontSize = rows.length >= 7 || columns >= 4 ? 9.5 : 11;
  const rowH = Math.min(0.72, 3.85 / rows.length);
  T.addTable(slide, rows, {
    x: 0.4, y: 1.18, w: 9.2,
    colW: Array(columns).fill(9.2 / columns),
    rowH, fontSize,
  });
}

function renderCode(slide, code, language) {
  const lines = code.split("\n");
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const fontSize = lines.length > 16 || longest > 84 ? 9.5 : lines.length > 12 ? 10.8 : 12.8;
  const h = Math.min(3.82, Math.max(1.5, lines.length * 0.23 + 0.5));
  T.addCode(slide, code, { x: 0.4, y: 1.22, w: 9.2, h, fontSize, language });
}

function renderLadder(slide, items) {
  const h = Math.min(0.58, 3.6 / Math.max(items.length, 1));
  items.forEach((item, index) => {
    const x = 0.6 + index * 0.18;
    const y = 1.18 + index * (h + 0.06);
    const w = 8.7 - index * 0.36;
    slide.addShape("roundRect", {
      x, y, w, h,
      fill: { color: index < 2 ? T.COLORS.ice : index > items.length - 3 ? "FBE8DD" : T.COLORS.panel },
      line: { color: T.COLORS.border, width: 0.6 },
    });
    slide.addText([
      { text: `${index + 1}. ${item.title}`, options: { bold: true, color: T.COLORS.navy } },
      { text: item.text ? `  —  ${item.text}` : "" },
    ], {
      x: x + 0.15, y: y + 0.1, w: w - 0.3, h: h - 0.16,
      fontFace: T.FONTS.body, fontSize: 11.2, color: T.COLORS.ink,
      margin: 0, fit: "shrink",
    });
  });
}

function renderTakeaways(slide, items) {
  const h = Math.min(0.64, 3.65 / Math.max(items.length, 1));
  items.forEach((item, index) => {
    const y = 1.2 + index * (h + 0.08);
    slide.addShape("roundRect", {
      x: 0.55, y, w: 8.9, h,
      fill: { color: index === items.length - 1 ? T.COLORS.ice : T.COLORS.panel },
      line: { color: T.COLORS.border, width: 0.5 },
    });
    slide.addShape("ellipse", {
      x: 0.73, y: y + 0.14, w: 0.28, h: 0.28,
      fill: { color: T.COLORS.navy }, line: { type: "none" },
    });
    slide.addText("✓", {
      x: 0.73, y: y + 0.17, w: 0.28, h: 0.15,
      fontFace: T.FONTS.body, fontSize: 9, bold: true,
      color: T.COLORS.white, align: "center", margin: 0,
    });
    slide.addText(item.text || item.title, {
      x: 1.14, y: y + 0.12, w: 8.0, h: h - 0.2,
      fontFace: T.FONTS.body, fontSize: 13, color: T.COLORS.ink,
      margin: 0, fit: "shrink", valign: "middle",
    });
  });
}

// Plain bulleted list — one paragraph per item, bold "title" lead-in (when
// present) followed by an em-dash description, with optional indented
// sub-bullets from nested markdown children. Unlike renderCards, nothing is
// boxed; this is a literal bullet list for content lifted verbatim from a
// source table or short enumeration.
function renderList(slide, items) {
  const runs = [];
  items.forEach((item, index) => {
    const isLastTop = index === items.length - 1;
    const hasChildren = item.children.length > 0;
    if (item.title) {
      runs.push({
        text: item.title,
        options: { bold: true, color: T.COLORS.navy, bullet: true, breakLine: false },
      });
      runs.push({
        text: item.text ? `  —  ${item.text}` : "",
        options: { color: T.COLORS.ink, breakLine: !(isLastTop && !hasChildren) },
      });
    } else {
      runs.push({
        text: item.text,
        options: { color: T.COLORS.ink, bullet: true, breakLine: !(isLastTop && !hasChildren) },
      });
    }
    item.children.forEach((child, childIndex) => {
      const isLastChild = isLastTop && childIndex === item.children.length - 1;
      runs.push({
        text: child,
        options: { color: T.COLORS.ink, bullet: { indent: 18 }, indentLevel: 1, breakLine: !isLastChild },
      });
    });
  });
  slide.addText(runs, {
    x: 0.55, y: 1.28, w: 8.7, h: 3.85,
    fontFace: T.FONTS.body, fontSize: 16, margin: 0, paraSpaceAfter: 10, valign: "top",
  });
}

function renderSlide(pres, module, spec) {
  let slide;
  if (spec.layout === "title") {
    slide = T.titleSlide(pres, {
      eyebrow: module.meta.eyebrow,
      title: module.meta.title,
      subtitle: module.meta.subtitle,
      footer: "Building AI Apps and Agents",
    });
  } else if (spec.layout === "demo") {
    // Same visually-distinct interstitial component used by demos/day1 and
    // demos/day2 (T.demoSlide) — ice fill, big "DEMO" eyebrow, time budget,
    // short blurb, and a footer pointing at the runbook. Placeholder only:
    // the runbook file carries the full narration, setup, and fallback plan.
    slide = T.demoSlide(pres, {
      tag: `${module.meta.tag} · Demo`,
      title: spec.title,
      time: spec.demoTime,
      description: spec.description,
      reference: spec.demoReference,
    });
  } else {
    slide = bodySlide(pres, module.meta, spec.title);
    if (spec.layout === "flow") renderFlow(slide, spec.flow);
    else if (spec.layout === "compare") renderCompare(slide, spec.items);
    else if (spec.layout === "table") renderTable(slide, spec.table);
    else if (spec.layout === "code") renderCode(slide, spec.code, spec.codeLang);
    else if (spec.layout === "ladder") renderLadder(slide, spec.flow);
    else if (spec.layout === "takeaways") renderTakeaways(slide, spec.items);
    else if (spec.layout === "list") renderList(slide, spec.items);
    else renderCards(slide, spec.items.length ? spec.items : spec.flow);
  }
  addSourceFooter(
    slide,
    spec.sources,
    spec.layout === "title" ? 4.62 : 5.22,
    spec.layout === "title",
  );
  addNotes(slide, spec.guidance, spec.sources);
}

async function buildModule(module) {
  const pres = T.newDeck(new pptxgen());
  pres.subject = "Day 3 — Single-Agent Runtime + MCP";
  pres.title = module.meta.title;
  pres.company = "Building AI Apps and Agents Workshop";
  for (const spec of module.slides) renderSlide(pres, module, spec);
  const output = path.join(OUT_DIR, module.meta.deck);
  await pres.writeFile({ fileName: output });
  return { output, count: module.slides.length, titles: module.slides.map((slide) => slide.title) };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Building Day 3 decks from Markdown…");
  for (const fileName of MODULE_FILES) {
    const module = parseModule(fileName);
    const result = await buildModule(module);
    console.log(`  ${path.basename(result.output)} (${result.count} slides)`);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
