// Shared theme + slide helpers for all decks in this workshop.
// Keep the visual system HERE. Don't one-off styles in module files.

const COLORS = {
  navy:   "1E2761",   // primary
  ice:    "CADCFC",   // secondary (surfaces, subtle accents)
  white:  "FFFFFF",
  ink:    "212121",   // body text
  muted:  "6B7280",   // captions, module tag
  panel:  "F3F4F6",   // code block fill
  border: "D1D5DB",   // subtle borders
  accent: "E8A87C",   // warm accent — used sparingly for callouts
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
  pres.author = "Publix Workshop — Building AI Apps and Agents";
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

// Code block on a body slide
function addCode(slide, code, opts = {}) {
  const y = opts.y || 1.3;
  const h = opts.h || 3.8;
  const x = opts.x || 0.4;
  const w = opts.w || 9.2;
  // background panel
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: COLORS.panel }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText(code, {
    x: x + 0.15, y: y + 0.1, w: w - 0.3, h: h - 0.2,
    fontFace: FONTS.mono, fontSize: opts.fontSize || SIZES.code, color: COLORS.ink,
    valign: "top", margin: 0,
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

module.exports = {
  COLORS,
  FONTS,
  SIZES,
  newDeck,
  titleSlide,
  sectionSlide,
  bodySlide,
  addBullets,
  addTwoColumn,
  addCode,
  addProse,
  addTable,
  takeawaysSlide,
  notes,
};
