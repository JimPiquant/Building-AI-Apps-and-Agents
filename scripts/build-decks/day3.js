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
  "module-7-evaluation.md",
  "module-8-optional-harnesses.md",
  "module-9-lab-kickoff.md",
];

// Fence language tags recognized by theme.js's code highlighter. Anything
// else (json's cousin "text", no tag, etc.) renders as plain uncolored code.
const CODE_LANG_NAMES = new Set(["python", "csharp", "json", "bash"]);

// Layouts whose parser only extracts specific structural lines (bullets,
// table rows, code fences, numbered flow items) — any other freestanding
// prose paragraph in these sections used to be silently dropped from the
// deck with no error. parseProse recovers that leftover text so it still
// renders (see renderProse / the "hasProse" branch in renderSlide).
const PROSE_LAYOUTS = new Set(["list", "table", "code", "flow"]);

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
    // Top-level bullets may be written as "- " (unordered) or "N. " (ordered)
    // — both render identically in the "list"/"list-code" layouts, so authors
    // can use whichever markdown style fits the content.
    let match = line.match(/^(?:-|\d+\.)\s+\*\*(.+?)\*\*(?:\s+—\s+(.*))?\s*$/);
    if (match) {
      current = { title: clean(match[1]), text: clean(match[2] || ""), children: [] };
      items.push(current);
      continue;
    }
    match = line.match(/^(?:-|\d+\.)\s+(.*)$/);
    if (match) {
      current = { title: "", text: clean(match[1]), children: [] };
      items.push(current);
      continue;
    }
    match = line.match(/^\s{2,}(?:-|\d+\.)\s+(.*)$/);
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

// Extracts a single standard-markdown image reference (used by
// `layout: image`, e.g. an authoritative diagram we render verbatim from a
// source rather than approximate with our own shapes). `src` is resolved
// relative to SLIDES_DIR by the caller.
function parseImage(visible) {
  const match = visible.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  return match ? { alt: clean(match[1]), src: match[2].trim() } : null;
}

// Reads width/height straight out of a PNG's IHDR chunk (bytes 16-23) —
// avoids pulling in an image-dimensions dependency just to lay out one
// picture per slide at its correct aspect ratio.
function getPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

// Recovers freestanding prose paragraphs that a layout's own structural
// parser (parseList/parseTable/parseFlow) doesn't capture — e.g. a
// narrative sentence the author added below a bullet list, a table, a code
// block, or a numbered flow. Strips the layout's own structural lines (and
// any fenced code block, for every layout) first, then groups whatever
// remains into paragraphs: a leftover bullet-style line (e.g. intro bullets
// above a table, which "table" layout's own structural filter doesn't
// consume) always becomes its own paragraph rather than folding into
// neighboring lines — otherwise several distinct bullets with no blank
// line between them collapse into one unreadable run-on sentence. True
// prose lines still fold together within a blank-line-bounded paragraph,
// mimicking standard markdown paragraph wrapping.
function parseProse(visible, layout) {
  const withoutCode = visible.replace(/```(?:\w+)?\n[\s\S]*?```/g, "");
  const isStructuralLine = (line) => {
    if (layout === "table") return /^\|.*\|$/.test(line.trim());
    if (layout === "list") {
      return /^(?:-|\d+\.)\s+/.test(line) || /^\s{2,}(?:-|\d+\.)\s+/.test(line);
    }
    if (layout === "flow") return /^\d+\.\s+\*\*/.test(line);
    return false; // "code" layout: nothing left to strip once the fence is gone
  };
  const remaining = withoutCode.split("\n").filter((line) => !isStructuralLine(line));

  const paragraphs = [];
  let current = [];
  const flush = () => {
    if (current.length) paragraphs.push(clean(current.join(" ")));
    current = [];
  };
  for (const line of remaining) {
    const bulletMatch = line.match(/^\s*(?:-|\d+\.)\s+(.*)$/);
    if (bulletMatch) {
      flush();
      paragraphs.push(clean(bulletMatch[1]));
    } else if (line.trim() === "") {
      flush();
    } else {
      current.push(line.trim());
    }
  }
  flush();
  return paragraphs;
}

// Splits a slide's visible markdown into an ordered sequence of "bullets"
// and "code" blocks, preserving the order they appear in — used by the
// list-code hybrid layout so a bullet group can be followed by the snippet
// it introduces, possibly more than once on the same slide.
function parseBlocks(visible) {
  const fenceRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;
  while ((match = fenceRegex.exec(visible))) {
    const items = parseList(visible.slice(lastIndex, match.index).split("\n"));
    if (items.length) blocks.push({ type: "bullets", items });
    const lang = match[1] && CODE_LANG_NAMES.has(match[1]) ? match[1] : "text";
    blocks.push({ type: "code", code: match[2].trimEnd(), lang });
    lastIndex = match.index + match[0].length;
  }
  const trailingItems = parseList(visible.slice(lastIndex).split("\n"));
  if (trailingItems.length) blocks.push({ type: "bullets", items: trailingItems });
  return blocks;
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
      blocks: layout === "list-code" ? parseBlocks(visible) : [],
      prose: PROSE_LAYOUTS.has(layout) ? parseProse(visible, layout) : [],
      image: layout === "image" ? parseImage(visible) : null,
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
    if (slide.layout === "list-code" && slide.blocks.length === 0) {
      throw new Error(`list-code slide has no bullets or code blocks: ${fileName} / ${slide.title}`);
    }
    if (slide.layout === "image") {
      if (!slide.image) {
        throw new Error(`image slide has no markdown image reference: ${fileName} / ${slide.title}`);
      }
      const imgPath = path.join(SLIDES_DIR, slide.image.src);
      if (!fs.existsSync(imgPath)) {
        throw new Error(`image file not found (${slide.image.src}): ${fileName} / ${slide.title}`);
      }
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

function renderFlow(slide, items, opts = {}) {
  const count = items.length;
  const cols = count <= 4 ? count : 3;
  const rows = Math.ceil(count / cols);
  const gapX = 0.28;
  const gapY = 0.28;
  const w = (9.2 - gapX * (cols - 1)) / cols;
  const top = 1.33;
  const idealH = rows === 1 ? 2.35 : 1.72;
  // Default (no bottom given): reproduce the original fixed card height
  // exactly. When a caller passes `bottom` (room reserved for trailing
  // prose below), shrink the cards only as much as that constraint
  // actually requires — never taller than the original ideal height.
  const availH = opts.bottom !== undefined ? opts.bottom - top : Infinity;
  const h = Math.min(idealH, (availH - gapY * (rows - 1)) / rows);
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = 0.4 + col * (w + gapX);
    const y = top + row * (h + gapY);
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

// Column widths proportional to each column's longest cell (by character
// count, consistent with the character-based height estimates used
// elsewhere in this file) rather than split evenly. An even split badly
// starves whichever column happens to hold the longest prose — forcing
// extra wrapped lines and taller rows — while leaving a short column
// (e.g. a "Pattern" name) with wasted white space. Each column is floored
// at a minimum width so a short column never looks unreadably cramped;
// the floor is subtracted from the total budget first, then the
// remainder is split across the still-unclamped columns in proportion to
// their content length.
function computeColumnWidths(rows, totalW, minW = 1.3) {
  const columns = rows[0].length;
  const maxLen = Array(columns).fill(0);
  for (const row of rows) {
    row.forEach((cell, i) => {
      maxLen[i] = Math.max(maxLen[i], String(cell ?? "").length);
    });
  }
  const totalLen = maxLen.reduce((a, b) => a + b, 0) || 1;
  let widths = maxLen.map((len) => (totalW * len) / totalLen);
  const belowFloor = widths.map((w) => w < minW);
  const floorCount = belowFloor.filter(Boolean).length;
  if (floorCount > 0 && floorCount < columns) {
    const remaining = totalW - minW * floorCount;
    const remainingLen = maxLen.reduce((sum, len, i) => sum + (belowFloor[i] ? 0 : len), 0) || 1;
    widths = maxLen.map((len, i) => (belowFloor[i] ? minW : (remaining * len) / remainingLen));
  } else if (floorCount === columns) {
    widths = Array(columns).fill(totalW / columns); // degenerate: all columns tiny, fall back to even split
  }
  return widths;
}

function renderTable(slide, rows, opts = {}) {
  if (rows.length === 0) return;
  const columns = rows[0].length;
  const top = 1.18;
  // Default bottom (5.03) reproduces the original hard-coded 3.85in budget
  // exactly; a caller passes a smaller `bottom` only when trailing prose
  // needs to reserve space underneath the table.
  const bottom = opts.bottom ?? top + 3.85;
  const fontSize = rows.length >= 7 || columns >= 4 ? 9.5 : 11;
  const rowH = Math.min(0.72, (bottom - top) / rows.length);
  T.addTable(slide, rows, {
    x: 0.4, y: top, w: 9.2,
    colW: computeColumnWidths(rows, 9.2),
    rowH, fontSize,
  });
}

// Renders an authoritative external diagram (e.g. an official spec's own
// sequence diagram) verbatim as a picture, rather than approximating it
// with our own shapes — this is the right call whenever the *exact* source
// artifact matters more than matching our deck's house style. The image is
// placed at its true aspect ratio (read straight from the PNG's own
// header) and scaled to fit the available content box without distortion;
// the deck's standard source footer (always present via addSourceFooter)
// supplies the "reproduced from" credit, so no separate caption is added.
function renderImage(slide, image) {
  const top = 1.18;
  const bottom = 5.15;
  const maxW = 9.2;
  const maxH = bottom - top;
  const { width, height } = getPngSize(path.join(SLIDES_DIR, image.src));
  const ratio = width / height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  const x = (10 - w) / 2;
  const y = top + (maxH - h) / 2;
  slide.addImage({
    path: path.join(SLIDES_DIR, image.src),
    x, y, w, h,
    altText: { title: image.alt, description: image.alt, name: "Diagram" },
  });
}

function renderCode(slide, code, language, opts = {}) {
  const lines = code.split("\n");
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const fontSize = lines.length > 16 || longest > 84 ? 9.5 : lines.length > 12 ? 10.8 : 12.8;
  const top = 1.22;
  // Default bottom (5.04) reproduces the original hard-coded 3.82in cap
  // exactly; smaller only when trailing prose needs room below the code.
  const bottom = opts.bottom ?? top + 3.82;
  const h = Math.min(bottom - top, Math.max(1.5, lines.length * 0.23 + 0.5));
  T.addCode(slide, code, { x: 0.4, y: top, w: 9.2, h, fontSize, language });
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
    // Only push a second run when there's real description text — an
    // empty-text run wedged after the title produces a stray, content-less
    // <a:pPr> that can trigger PowerPoint's "needs repair" dialog (see the
    // matching note on renderList).
    const runs = [{ text: `${index + 1}. ${item.title}`, options: { bold: true, color: T.COLORS.navy } }];
    if (item.text) runs.push({ text: `  —  ${item.text}` });
    slide.addText(runs, {
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
      fill: { color: T.COLORS.panel },
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
// source table or short enumeration. Accepts optional position/size so it
// can be reused as one stacked block inside renderListCode.
//
// IMPORTANT: never push a run with empty ("") text into the middle of a
// paragraph. pptxgenjs emits a full <a:pPr> for every run object passed to
// addText — even ones whose text is "" — but skips the <a:r> tag itself for
// empty text. A title-only bullet (bold title, no inline "— description",
// e.g. "**Non-streaming**" with only child bullets under it) used to push a
// second run with text:"" right after the title's real run, producing a
// real <a:r> followed by a second, content-less <a:pPr> before the
// paragraph closes — invalid per the OOXML schema (only one <a:pPr> per
// <a:p>, and it must be the first child) and a real trigger for
// PowerPoint's "needs repair" dialog. Fix: only push the description run
// when there's real text to show; when there isn't, set breakLine directly
// on the title run so the paragraph still ends in the right place.
function renderList(slide, items, opts = {}) {
  const runs = [];
  items.forEach((item, index) => {
    const isLastTop = index === items.length - 1;
    const hasChildren = item.children.length > 0;
    const endsLine = !(isLastTop && !hasChildren);
    if (item.title) {
      if (item.text) {
        runs.push({
          text: item.title,
          options: { bold: true, color: T.COLORS.navy, bullet: true, breakLine: false },
        });
        runs.push({
          text: `  —  ${item.text}`,
          options: { color: T.COLORS.ink, breakLine: endsLine },
        });
      } else {
        runs.push({
          text: item.title,
          options: { bold: true, color: T.COLORS.navy, bullet: true, breakLine: endsLine },
        });
      }
    } else {
      runs.push({
        text: item.text,
        options: { color: T.COLORS.ink, bullet: true, breakLine: endsLine },
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
    x: opts.x ?? 0.55, y: opts.y ?? 1.28, w: opts.w ?? 8.7, h: opts.h ?? 3.85,
    fontFace: T.FONTS.body, fontSize: opts.fontSize ?? 16, margin: 0, paraSpaceAfter: 10,
    valign: "top", fit: "shrink",
  });
}

// Renders freestanding prose paragraphs recovered by parseProse — narrative
// text an author wrote below a slide's primary list/table/code/flow content
// that the layout's own structural parser doesn't otherwise capture. Always
// placed below the primary content in a slightly muted style so it reads as
// a secondary note without looking like a boxed callout.
function renderProse(slide, paragraphs, opts = {}) {
  if (!paragraphs.length) return;
  const runs = paragraphs.map((p, i) => ({
    text: p,
    options: { color: T.COLORS.muted, breakLine: i < paragraphs.length - 1 },
  }));
  slide.addText(runs, {
    x: opts.x ?? 0.4, y: opts.y, w: opts.w ?? 9.2, h: opts.h,
    fontFace: T.FONTS.body, fontSize: opts.fontSize ?? 13,
    margin: 0, paraSpaceAfter: 8, valign: "top", fit: "shrink",
  });
}

// Rough estimate of the vertical space wrapped prose paragraphs will need,
// using an average character width for the body font (not a real text
// measurement, but consistent with estimateBulletsHeight/estimateCodeHeight
// below) so the primary content above it can be shrunk by just enough.
function estimateProseHeight(paragraphs, fontSize, widthIn = 8.8) {
  if (!paragraphs.length) return 0;
  const charWidthIn = (fontSize * 0.52) / 72;
  const charsPerLine = Math.max(20, widthIn / charWidthIn);
  const lineH = (fontSize * 1.25) / 72;
  const paraGap = 8 / 72;
  const totalLines = paragraphs.reduce(
    (sum, p) => sum + Math.max(1, Math.ceil(p.length / charsPerLine)),
    0
  );
  return totalLines * lineH + Math.max(0, paragraphs.length - 1) * paraGap + 0.18;
}

// Water-filling height allocation: distribute `avail` across `weights`
// proportionally, but never below `minH` per item. Blocks that would fall
// below the floor are pinned to minH, and the remaining space is
// re-distributed proportionally among the rest — repeated until stable, so
// the total always sums to `avail` regardless of how many blocks hit the
// floor (unlike a naive per-block max(minH, proportional), which can push
// the total past `avail` and overflow the slide).
function distributeHeights(weights, avail, minH) {
  const heights = new Array(weights.length).fill(0);
  const remaining = new Set(weights.map((_, i) => i));
  let remainingAvail = avail;
  let changed = true;
  while (changed && remaining.size) {
    changed = false;
    const weightSum = [...remaining].reduce((sum, i) => sum + weights[i], 0) || 1;
    for (const i of [...remaining]) {
      const proportional = (weights[i] / weightSum) * remainingAvail;
      if (proportional < minH) {
        heights[i] = minH;
        remainingAvail -= minH;
        remaining.delete(i);
        changed = true;
      }
    }
  }
  const weightSum = [...remaining].reduce((sum, i) => sum + weights[i], 0) || 1;
  for (const i of remaining) {
    heights[i] = (weights[i] / weightSum) * remainingAvail;
  }
  return heights;
}

function estimateBulletsHeight(items, fontSize) {
  const numLines = items.reduce((sum, item) => sum + 1 + item.children.length, 0) || 1;
  const lineH = (fontSize * 1.22) / 72; // ~1.22x line-height factor for this body font
  const paraGap = 10 / 72; // matches the paraSpaceAfter set in renderList
  return numLines * lineH + Math.max(0, numLines - 1) * paraGap + 0.12;
}

function chooseCodeFontSize(code) {
  const lines = code.split("\n");
  const longest = Math.max(...lines.map((line) => line.length), 1);
  return lines.length > 10 || longest > 70 ? 9.5 : lines.length > 6 ? 10.5 : 11.5;
}

function estimateCodeHeight(code, fontSize) {
  const lines = code.split("\n");
  const lineH = (fontSize * 1.15) / 72; // code is single-spaced, no paragraph gap
  return lines.length * lineH + 0.3; // panel padding (0.2) + safety buffer
}

// Hybrid layout: bullets and one or more code blocks, stacked top to bottom
// in the order they appear in the markdown. Each block's share of the
// available vertical space is proportional to its own physically-estimated
// required height (line count × real line height for its font size), not an
// abstract count — bullets at 14pt need noticeably more room per line than
// a 9.5-11.5pt code block, and treating both as equally "weighted" per line
// is what caused the original overlap. `fit: "shrink"` on both renderList
// and addCode is a safety net beneath this: if a block still runs long
// (e.g. a bullet wraps to two lines at this width), PowerPoint shrinks that
// block's own text to fit its box rather than overflowing into the next one.
function renderListCode(slide, blocks) {
  const top = 1.18;
  const bottom = 5.15;
  const gap = 0.14;
  const minH = 0.5;
  const avail = Math.max(minH, bottom - top - gap * Math.max(blocks.length - 1, 0));
  const bulletFontSize = 14;

  const codeFontSizes = blocks.map((block) => (
    block.type === "code" ? chooseCodeFontSize(block.code) : null
  ));
  const naturalHeights = blocks.map((block, index) => (
    block.type === "code"
      ? estimateCodeHeight(block.code, codeFontSizes[index])
      : estimateBulletsHeight(block.items, bulletFontSize)
  ));
  const heights = distributeHeights(naturalHeights, avail, minH);

  let y = top;
  blocks.forEach((block, index) => {
    const h = heights[index];
    if (block.type === "bullets") {
      renderList(slide, block.items, { x: 0.4, y, w: 9.2, h, fontSize: bulletFontSize });
    } else {
      T.addCode(slide, block.code, { x: 0.4, y, w: 9.2, h, fontSize: codeFontSizes[index], language: block.lang });
    }
    y += h + gap;
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

    // Freestanding prose the author wrote below the primary structured
    // content (see parseProse) always renders as its own block underneath
    // that content. Reserve just enough room for it — estimated from
    // character count, not a fixed budget — so the primary content above
    // keeps its usual size unless the prose genuinely needs the space.
    const contentTop = 1.18;
    const contentBottom = 5.15;
    const proseGap = 0.14;
    const hasProse = spec.prose && spec.prose.length > 0;
    let mainBottom = contentBottom;
    let proseH = 0;
    if (hasProse) {
      const minMainH = 1.4; // never let prose crowd out the primary content entirely
      proseH = Math.min(
        estimateProseHeight(spec.prose, 13),
        Math.max(0.3, contentBottom - contentTop - proseGap - minMainH)
      );
      mainBottom = contentBottom - proseH - proseGap;
    }

    if (spec.layout === "flow") renderFlow(slide, spec.flow, hasProse ? { bottom: mainBottom } : {});
    else if (spec.layout === "compare") renderCompare(slide, spec.items);
    else if (spec.layout === "table") renderTable(slide, spec.table, hasProse ? { bottom: mainBottom } : {});
    else if (spec.layout === "code") renderCode(slide, spec.code, spec.codeLang, hasProse ? { bottom: mainBottom } : {});
    else if (spec.layout === "ladder") renderLadder(slide, spec.flow);
    else if (spec.layout === "takeaways") renderTakeaways(slide, spec.items);
    else if (spec.layout === "list") renderList(slide, spec.items, hasProse ? { y: contentTop, h: mainBottom - contentTop } : {});
    else if (spec.layout === "list-code") renderListCode(slide, spec.blocks);
    else if (spec.layout === "image") renderImage(slide, spec.image);
    else renderCards(slide, spec.items.length ? spec.items : spec.flow);

    if (hasProse) {
      renderProse(slide, spec.prose, { y: mainBottom + proseGap, h: proseH });
    }
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
  const outputs = [];
  for (const fileName of MODULE_FILES) {
    const module = parseModule(fileName);
    const result = await buildModule(module);
    outputs.push(result.output);
    console.log(`  ${path.basename(result.output)} (${result.count} slides)`);
  }
  console.log("Validating generated decks…");
  await T.validateDecks(outputs);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
