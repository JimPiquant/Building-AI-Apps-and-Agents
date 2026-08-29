// Shared theme + slide helpers for all decks in this workshop.
// Keep the visual system HERE. Don't one-off styles in module files.

const JSZip = require("jszip");
const COLORS = {
  navy:   "1E2761",   // primary
  ice:    "CADCFC",   // secondary (surfaces, subtle accents)
  white:  "FFFFFF",
  ink:    "212121",   // body text
  muted:  "6B7280",   // captions, module tag
  panel:  "F3F4F6",   // light panel fill (non-code)
  border: "D1D5DB",   // subtle borders
  accent: "E8A87C",   // warm accent — used sparingly for callouts
  codeBg:     "1D1E22", // dark code-block fill, sampled from Jim's editor theme
  codeBorder: "2A2B2E", // subtle edge so the code panel reads on a light slide
};

const FONTS = {
  title: "Calibri",
  body:  "Calibri",
  mono:  "Consolas",
};

const SIZES = {
  slideTitle:   28,
  sectionTitle: 40,
  titleSlide:   40,
  subtitle:     18,
  h2:           20,
  body:         16,
  bullet:       15,
  small:        12,
  tag:          10,
  code:         13,
};

// 16:9 layout — 10" x 5.625"
function newDeck(pres) {
  pres.layout = "LAYOUT_16x9";
  pres.author = "Building AI Apps and Agents Workshop";
  return pres;
}

// Dark navy full-bleed title slide
function titleSlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addText(opts.eyebrow, {
    x: 0.6, y: 0.5, w: 8.8, h: 0.4,
    fontFace: FONTS.body, fontSize: SIZES.tag, color: COLORS.ice, charSpacing: 4,
  });
  slide.addText(opts.title, {
    x: 0.6, y: 1.9, w: 8.8, h: 1.4,
    fontFace: FONTS.title, fontSize: SIZES.titleSlide, bold: true, color: COLORS.white,
  });
  if (opts.subtitle) {
    slide.addText(opts.subtitle, {
      x: 0.6, y: 3.3, w: 8.8, h: 0.7,
      fontFace: FONTS.body, fontSize: SIZES.subtitle, color: COLORS.ice,
    });
  }
  slide.addText(opts.footer || "", {
    x: 0.6, y: 5.0, w: 8.8, h: 0.4,
    fontFace: FONTS.body, fontSize: SIZES.tag, color: COLORS.ice,
  });
  return slide;
}

// Dark navy transition slide (within a module)
function sectionSlide(pres, title, subtitle) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addText(title, {
    x: 0.6, y: 2.2, w: 8.8, h: 1.2,
    fontFace: FONTS.title, fontSize: SIZES.sectionTitle, bold: true, color: COLORS.white,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 3.4, w: 8.8, h: 0.6,
      fontFace: FONTS.body, fontSize: SIZES.subtitle, color: COLORS.ice,
    });
  }
  return slide;
}

// Light body slide skeleton — returns { slide, contentTop, contentBottom, contentX, contentW }
function bodySlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  // thin left navy bar (motif)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: COLORS.navy }, line: { type: "none" },
  });
  // Module tag top-right
  if (opts.tag) {
    slide.addText(opts.tag, {
      x: 6.2, y: 0.3, w: 3.6, h: 0.3,
      fontFace: FONTS.body, fontSize: SIZES.tag, color: COLORS.muted, align: "right", margin: 0,
    });
  }
  slide.addText(opts.title, {
    x: 0.4, y: 0.35, w: 6.8, h: 0.7,
    fontFace: FONTS.title, fontSize: SIZES.slideTitle, bold: true, color: COLORS.navy, margin: 0,
  });
  return {
    slide,
    contentX: 0.4,
    contentTop: 1.2,
    contentW: 9.2,
    contentBottom: 5.3,
  };
}

// Bulleted content region on a body slide
function addBullets(slide, bullets, opts) {
  const items = bullets.map((b, i) => {
    const isString = typeof b === "string";
    const text = isString ? b : b.text;
    const indent = isString ? 0 : (b.indent || 0);
    return {
      text,
      options: { bullet: true, indentLevel: indent, breakLine: i < bullets.length - 1 },
    };
  });
  slide.addText(items, {
    x: opts.x || 0.4, y: opts.y || 1.2, w: opts.w || 9.2, h: opts.h || 4.1,
    fontFace: FONTS.body, fontSize: opts.fontSize || SIZES.bullet, color: COLORS.ink,
    paraSpaceAfter: 6,
  });
}

// Two-column bullets — optionally with headers
function addTwoColumn(slide, left, right, opts = {}) {
  const y = opts.y || 1.2;
  const h = opts.h || 4.1;
  const gap = 0.3;
  const totalW = 9.2;
  const colW = (totalW - gap) / 2;
  const startX = 0.4;

  if (opts.leftHeader) {
    slide.addText(opts.leftHeader, {
      x: startX, y, w: colW, h: 0.4,
      fontFace: FONTS.title, fontSize: SIZES.h2, bold: true, color: COLORS.navy, margin: 0,
    });
  }
  if (opts.rightHeader) {
    slide.addText(opts.rightHeader, {
      x: startX + colW + gap, y, w: colW, h: 0.4,
      fontFace: FONTS.title, fontSize: SIZES.h2, bold: true, color: COLORS.navy, margin: 0,
    });
  }
  const contentY = opts.leftHeader || opts.rightHeader ? y + 0.5 : y;
  const contentH = h - (contentY - y);

  const makeItems = (arr) => arr.map((b, i) => ({
    text: typeof b === "string" ? b : b.text,
    options: {
      bullet: true,
      indentLevel: typeof b === "string" ? 0 : (b.indent || 0),
      breakLine: i < arr.length - 1,
    },
  }));

  slide.addText(makeItems(left), {
    x: startX, y: contentY, w: colW, h: contentH,
    fontFace: FONTS.body, fontSize: SIZES.bullet, color: COLORS.ink, paraSpaceAfter: 6,
  });
  slide.addText(makeItems(right), {
    x: startX + colW + gap, y: contentY, w: colW, h: contentH,
    fontFace: FONTS.body, fontSize: SIZES.bullet, color: COLORS.ink, paraSpaceAfter: 6,
  });
}

// Lightweight code syntax highlighting.
// Not a full parser — a small regex tokenizer covering keywords, strings,
// and comments for the languages this workshop's code slides actually use.
// Falls back to plain (uncolored) text for any language without rules.
// Palette sampled from Jim's own dark editor theme (screenshot, 2026-08-25).
const CODE_TOKEN_COLORS = {
  keyword: "A996B6",
  string: "E4C98A",
  comment: "666666",
  default: "FFFFFF",
};

const CODE_LANG_RULES = {
  python: [
    { type: "comment", re: "#.*" },
    { type: "string", re: "(?:[rRbBfF]{0,2})(?:'''[\\s\\S]*?'''|\"\"\"[\\s\\S]*?\"\"\"|'(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\")" },
    { type: "keyword", re: "@[A-Za-z_][\\w.]*" },
    { type: "keyword", re: "\\b(?:import|from|as|def|class|return|if|elif|else|for|while|try|except|finally|with|async|await|lambda|pass|break|continue|in|is|not|and|or|None|True|False|raise|yield|global|nonlocal|self)\\b" },
  ],
  csharp: [
    { type: "comment", re: "//.*" },
    { type: "comment", re: "/\\*[\\s\\S]*?\\*/" },
    { type: "string", re: "\"(?:[^\"\\\\]|\\\\.)*\"" },
    { type: "keyword", re: "\\b(?:using|namespace|class|public|private|protected|internal|static|void|async|await|var|new|return|if|else|for|foreach|while|try|catch|finally|string|int|bool|double|float|object|this|null|true|false|get|set|readonly|const)\\b" },
  ],
  json: [
    { type: "string", re: "\"(?:[^\"\\\\]|\\\\.)*\"" },
    { type: "keyword", re: "\\b(?:true|false|null)\\b" },
  ],
  bash: [
    { type: "comment", re: "#.*" },
    { type: "string", re: "\"(?:[^\"\\\\]|\\\\.)*\"" },
  ],
};

function tokenizeCode(code, lang) {
  const rules = CODE_LANG_RULES[lang];
  if (!rules) return [{ type: "default", text: code }];
  const regex = new RegExp(rules.map((r) => `(${r.re})`).join("|"), "g");
  const types = rules.map((r) => r.type);
  const tokens = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(code))) {
    if (match.index > lastIndex) {
      tokens.push({ type: "default", text: code.slice(lastIndex, match.index) });
    }
    const groupIndex = match.slice(1).findIndex((g) => g !== undefined);
    tokens.push({ type: types[groupIndex], text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < code.length) {
    tokens.push({ type: "default", text: code.slice(lastIndex) });
  }
  return tokens;
}

// Every token becomes one or more pptxgenjs runs, grouped by source line so
// that each rendered <a:p> gets exactly the runs that belong to it and ends
// with breakLine on its last (non-empty) run — never a run in the middle.
//
// This matters because pptxgenjs emits a full <a:pPr> for EVERY run object
// passed to addText, even ones whose text is "" (genXmlTextRun skips the
// <a:r> tag for empty text, but genXmlParagraphProperties still runs). A
// naive per-token split on "\n" can produce an empty-text piece that lands
// in the middle of a paragraph (e.g. a Python "# comment" token doesn't
// include its own trailing newline — that "\n" belongs to the next token,
// so splitting it produces a "" piece with breakLine:true right after the
// comment's real run). The result is a real <a:r> followed by a second,
// content-less <a:pPr> before <a:endParaRPr> — invalid per the OOXML
// schema (a <p:txBody>'s <a:p> may have only one <a:pPr>, and it must be
// the first child) and exactly what triggered PowerPoint's "needs repair"
// dialog on this deck. Fix: reassemble tokens into per-source-line groups
// first, so every line becomes one clean sequence of non-empty runs ending
// in a single breakLine — a wholly blank source line becomes exactly one
// deliberate empty-text run (the one case pptxgenjs is actually built to
// support, per its own "empty [lineBreak] runs" handling).
function codeRuns(code, lang) {
  const lines = [[]];
  tokenizeCode(code, lang).forEach((tok) => {
    tok.text.split("\n").forEach((piece, i, pieces) => {
      if (piece !== "") lines[lines.length - 1].push({ type: tok.type, text: piece });
      if (i < pieces.length - 1) lines.push([]);
    });
  });

  const runs = [];
  lines.forEach((lineParts, lineIndex) => {
    const isLastLine = lineIndex === lines.length - 1;
    if (lineParts.length === 0) {
      runs.push({ text: "", options: { color: CODE_TOKEN_COLORS.default, breakLine: !isLastLine } });
      return;
    }
    lineParts.forEach((part, partIndex) => {
      const isLastPart = partIndex === lineParts.length - 1;
      runs.push({
        text: part.text,
        options: {
          color: CODE_TOKEN_COLORS[part.type] || CODE_TOKEN_COLORS.default,
          italic: part.type === "comment",
          breakLine: isLastPart && !isLastLine,
        },
      });
    });
  });
  return runs;
}

// Code block on a body slide
function addCode(slide, code, opts = {}) {
  const y = opts.y || 1.3;
  const h = opts.h || 3.8;
  const x = opts.x || 0.4;
  const w = opts.w || 9.2;
  // dark background panel (matches the token colors above)
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: COLORS.codeBg }, line: { color: COLORS.codeBorder, width: 0.75 },
  });
  slide.addText(codeRuns(code, opts.language || "python"), {
    x: x + 0.15, y: y + 0.1, w: w - 0.3, h: h - 0.2,
    fontFace: FONTS.mono, fontSize: opts.fontSize || SIZES.code,
    valign: "top", margin: 0, fit: "shrink",
  });
}

// Small paragraph of prose (subhead or intro)
function addProse(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.4, y: opts.y || 1.2, w: opts.w || 9.2, h: opts.h || 0.8,
    fontFace: FONTS.body, fontSize: opts.fontSize || SIZES.body, color: COLORS.ink,
    italic: !!opts.italic,
  });
}

// Table helper — accepts a 2D array of strings; first row = header
function addTable(slide, data, opts = {}) {
  const rows = data.map((row, ri) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontFace: FONTS.body,
        fontSize: opts.fontSize || 13,
        bold: ri === 0,
        color: ri === 0 ? COLORS.white : COLORS.ink,
        fill: { color: ri === 0 ? COLORS.navy : (ri % 2 === 0 ? COLORS.panel : COLORS.white) },
        valign: "middle",
        margin: 0.06,
      },
    }))
  );
  slide.addTable(rows, {
    x: opts.x || 0.4,
    y: opts.y || 1.2,
    w: opts.w || 9.2,
    colW: opts.colW,
    rowH: opts.rowH || 0.35,
    border: { type: "solid", color: COLORS.border, pt: 0.5 },
  });
}

// Takeaways / recap slide — bullets + optional "Next" callout line
function takeawaysSlide(pres, opts) {
  const b = bodySlide(pres, opts);
  addBullets(b.slide, opts.bullets, { y: b.contentTop, w: b.contentW, h: 3.4 });
  if (opts.next) {
    b.slide.addShape("rect", {
      x: 0.4, y: 4.75, w: 9.2, h: 0.5,
      fill: { color: COLORS.ice }, line: { type: "none" },
    });
    b.slide.addText([
      { text: "Next: ", options: { bold: true } },
      { text: opts.next },
    ], {
      x: 0.55, y: 4.78, w: 8.9, h: 0.44,
      fontFace: FONTS.body, fontSize: SIZES.body, color: COLORS.navy, margin: 0,
    });
  }
  return b.slide;
}

// Add speaker notes to any slide.
// Two shapes accepted:
//   notes(slide, "one line of text")               -> printed as-is
//   notes(slide, ["bullet 1", "bullet 2", ...])    -> rendered as "• bullet 1\n• bullet 2\n..."
// Prefer arrays for teaching notes so they scan as bullets in Presenter View.
function notes(slide, text) {
  if (!text) return;
  if (Array.isArray(text)) {
    if (text.length === 0) return;
    slide.addNotes(text.map((t) => `• ${t}`).join("\n"));
  } else if (typeof text === "string" && text.trim()) {
    slide.addNotes(text);
  }
}

// Demo marker slide — visually distinct interstitial to cue the presenter that
// a live demo happens here. Ice fill, big "DEMO" eyebrow, title, short blurb.
function demoSlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.ice };
  // navy left bar (matches bodySlide motif but thicker)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.16, h: 5.625, fill: { color: COLORS.navy }, line: { type: "none" },
  });
  if (opts.tag) {
    slide.addText(opts.tag, {
      x: 6.2, y: 0.3, w: 3.6, h: 0.3,
      fontFace: FONTS.body, fontSize: SIZES.tag, color: COLORS.muted, align: "right", margin: 0,
    });
  }
  // Big "DEMO" eyebrow
  slide.addText("DEMO", {
    x: 0.6, y: 1.15, w: 6.0, h: 0.55,
    fontFace: FONTS.title, fontSize: 32, bold: true, color: COLORS.navy, margin: 0, charSpacing: 8,
  });
  // Title
  slide.addText(opts.title, {
    x: 0.6, y: 1.85, w: 8.8, h: 1.0,
    fontFace: FONTS.title, fontSize: 30, bold: true, color: COLORS.navy, margin: 0,
  });
  // Optional time budget on the right
  if (opts.time) {
    slide.addText(opts.time, {
      x: 7.2, y: 1.15, w: 2.4, h: 0.55,
      fontFace: FONTS.body, fontSize: 18, italic: true, color: COLORS.muted, align: "right", margin: 0,
    });
  }
  // Prose description
  if (opts.description) {
    slide.addText(opts.description, {
      x: 0.6, y: 3.05, w: 8.8, h: 1.5,
      fontFace: FONTS.body, fontSize: 16, color: COLORS.ink, margin: 0, paraSpaceAfter: 6,
    });
  }
  // Footer callout — where to find the demo runbook
  if (opts.reference) {
    slide.addText(opts.reference, {
      x: 0.6, y: 4.85, w: 8.8, h: 0.35,
      fontFace: FONTS.body, fontSize: 11, italic: true, color: COLORS.muted, margin: 0,
    });
  }
  return slide;
}

// Structural validator: opens a saved .pptx (a zip of OOXML parts) and
// checks every slide for a specific class of invalid XML that pptxgenjs can
// silently produce and that triggers PowerPoint's "needs repair" dialog on
// open — even though the file is well-formed XML and opens fine in more
// lenient tools (python-pptx, Keynote, QuickLook), which is exactly why this
// class of bug can ship unnoticed without a check like this one.
//
// The defect: pptxgenjs emits one <a:pPr> for every run object passed to
// addText(), even ones whose text is "" (it just skips the <a:r> tag for
// that one). A <a:p> paragraph may validly contain more than one <a:pPr> in
// practice — real PowerPoint tolerates a paragraph built from several
// same-line runs, each preceded by its own <a:pPr>, as long as every <a:pPr>
// is immediately followed by real content (an <a:r>). What real PowerPoint
// does NOT tolerate is a <a:pPr> that is followed by nothing (paragraph
// ends) or by another <a:pPr> with no <a:r> in between — i.e. a <a:pPr>
// contributed by a run whose text was "". A single, standalone <a:pPr> with
// no run at all is fine (a deliberate blank line); the invalid case is
// specifically a non-final, content-less <a:pPr> sitting next to others
// that do have content.
//
// This was empirically confirmed by bisecting a real corrupted deck down to
// one slide, correlating the exact XML defect with the generator code that
// produced it, fixing the generator, and confirming both the bad and fixed
// output in real PowerPoint (not just an XML well-formedness check).
async function validatePptx(filePath) {
  const fs = require("fs");
  const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml/)[1]);
      const nb = Number(b.match(/slide(\d+)\.xml/)[1]);
      return na - nb;
    });

  const problems = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async("string");
    const paragraphs = xml.match(/<a:p>[\s\S]*?<\/a:p>/g) || [];
    paragraphs.forEach((para, paraIndex) => {
      const pPrBlocks = [...para.matchAll(/<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>|<a:pPr\s*\/>/g)];
      // A single, standalone pPr with no run at all is a legitimate blank
      // paragraph (pptxgenjs's supported "empty [lineBreak]" pattern) — skip
      // the whole paragraph in that case. Otherwise every pPr, INCLUDING the
      // last one, must be immediately followed by a real <a:r> before either
      // the next pPr or the paragraph's end — a multi-pPr paragraph whose
      // final pPr has no run is the same orphaned-empty-run defect, not a
      // blank line, because there's real content earlier in the paragraph.
      if (pPrBlocks.length <= 1) return;
      pPrBlocks.forEach((match, i) => {
        const isLast = i === pPrBlocks.length - 1;
        const afterThisPPr = para.slice(match.index + match[0].length);
        const gapToNextPPr = isLast
          ? afterThisPPr
          : afterThisPPr.slice(0, pPrBlocks[i + 1].index - (match.index + match[0].length));
        if (!gapToNextPPr.includes("<a:r>")) {
          problems.push({
            slide: name,
            paragraphIndex: paraIndex,
            detail: "a <a:pPr> with no run before the next <a:pPr> in the same paragraph — orphaned paragraph-properties block from an empty-text run",
          });
        }
      });
    });
  }
  return problems;
}

// Validates a list of generated .pptx files and throws with a readable
// summary if any structural problems are found — call this after writing
// all decks so a build fails loudly instead of shipping a file that opens
// with a "needs repair" dialog in PowerPoint.
async function validateDecks(filePaths) {
  const allProblems = [];
  for (const filePath of filePaths) {
    const problems = await validatePptx(filePath);
    problems.forEach((p) => allProblems.push({ file: filePath, ...p }));
  }
  if (allProblems.length > 0) {
    const lines = allProblems.map(
      (p) => `  ${p.file} — ${p.slide} paragraph #${p.paragraphIndex}: ${p.detail}`
    );
    throw new Error(
      `Found ${allProblems.length} structurally invalid paragraph(s) that will trigger PowerPoint's "needs repair" dialog:\n${lines.join("\n")}`
    );
  }
}

module.exports = {
  COLORS,
  FONTS,
  SIZES,
  newDeck,
  titleSlide,
  sectionSlide,
  bodySlide,
  demoSlide,
  addBullets,
  addTwoColumn,
  addCode,
  addProse,
  addTable,
  takeawaysSlide,
  notes,
  validatePptx,
  validateDecks,
};
