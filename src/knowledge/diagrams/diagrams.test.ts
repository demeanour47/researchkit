import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderDiagram, diagramPdf, DIAGRAM_PNG_DPI, diagramFileName } from "./export";
import { layoutDiagram, PAGE_WIDTH, route, SPACING, widthFactor, wrapParagraph } from "./layout";
import { arrowHead, diagramScene, FONTS, THEME_COLOURS } from "./render";
import { DEFAULT_LAYOUT_OPTIONS, ORIENTATIONS, ORIENTATION_LABELS, THEMES, THEME_LABELS, TYPEFACES, TYPEFACE_LABELS, type FlowDiagram, type LayoutOptions } from "./types";
import { diagramProblems } from "./validate";

/** A small CONSORT-like diagram: two columns, a heading, a down arrow, a side arrow and a merge. */
const DIAGRAM: FlowDiagram = {
  title: "Test diagram",
  description: "A test.",
  columns: 2,
  rows: 4,
  nodes: [
    { id: "head", column: 0, row: 0, span: 2, paragraphs: [{ text: "Enrolment", bold: true }], tone: "header", align: "center" },
    { id: "a", column: 0, row: 1, paragraphs: [{ text: "Assessed for eligibility (n = 120)" }] },
    { id: "b", column: 1, row: 1, paragraphs: [{ text: "Excluded (n = 20):" }, { text: "Not meeting criteria (n = 15)", indent: 1 }, { text: "Declined (n = 5)", indent: 1 }] },
    { id: "c", column: 0, row: 2, paragraphs: [{ text: "Randomised (n = 100)" }] },
    { id: "d", column: 1, row: 2, paragraphs: [{ text: "Other arm (n = 50)" }] },
    { id: "e", column: 0, row: 3, paragraphs: [{ text: "Analysed (n = 95)" }] },
  ],
  edges: [
    { id: "a-b", from: "a", to: "b" },
    { id: "a-c", from: "a", to: "c", label: "eligible" },
    { id: "c-e", from: "c", to: "e" },
    { id: "d-e", from: "d", to: "e" },
    { id: "hidden", from: "c", to: "d", hidden: true },
  ],
  bands: [{ id: "enrol", label: "Enrolment", fromRow: 1, toRow: 3 }],
};
const options = (changes: Partial<LayoutOptions> = {}): LayoutOptions => ({ ...DEFAULT_LAYOUT_OPTIONS, ...changes });
const layout = layoutDiagram(DIAGRAM, options());
const placed = (id: string) => layout.nodes.find((node) => node.node.id === id)!;

describe("diagram options", () => {
  it("labels every orientation, theme and typeface", () => {
    for (const value of ORIENTATIONS) assert.ok(ORIENTATION_LABELS[value]);
    for (const value of THEMES) assert.ok(THEME_LABELS[value] && THEME_COLOURS[value]);
    for (const value of TYPEFACES) assert.ok(TYPEFACE_LABELS[value] && FONTS[value]);
  });
  it("narrows Times text", () => {
    assert.deepEqual([widthFactor("sans"), widthFactor("serif")], [1, 0.92]);
  });
});

describe("wrapParagraph", () => {
  it("wraps text to a width", () => {
    const lines = wrapParagraph({ text: "one two three four five six seven eight" }, 60, 12, 1);
    assert.ok(lines.length > 1);
    assert.equal(lines.join(" "), "one two three four five six seven eight");
  });
  it("keeps a single long word whole", () => {
    assert.deepEqual(wrapParagraph({ text: "Supercalifragilistic" }, 20, 12, 1), ["Supercalifragilistic"]);
  });
  it("breaks at explicit line breaks", () => {
    assert.deepEqual(wrapParagraph({ text: "a\nb" }, 500, 12, 1), ["a", "b"]);
  });
  it("wraps bold text sooner than regular", () => {
    const text = "Records identified from databases and registers";
    assert.ok(wrapParagraph({ text, bold: true }, 250, 12, 1).length >= wrapParagraph({ text }, 250, 12, 1).length);
  });
});

describe("layoutDiagram", () => {
  it("fills the page width for the orientation", () => {
    assert.equal(layout.width, PAGE_WIDTH.portrait);
    assert.equal(layoutDiagram(DIAGRAM, options({ orientation: "landscape" })).width, PAGE_WIDTH.landscape);
  });
  it("places columns side by side with a gap", () => {
    assert.ok(Math.abs(placed("b").x - (placed("a").x + placed("a").width + SPACING.columnGap)) < 0.01);
  });
  it("spans headings across columns", () => {
    assert.ok(Math.abs(placed("head").width - (placed("a").width + SPACING.columnGap + placed("b").width)) < 0.01);
  });
  it("gives every box in a row the row's height", () => {
    assert.equal(placed("a").height, placed("b").height);
    assert.ok(placed("b").lines.length >= 3);
  });
  it("stacks rows downwards with a gap", () => {
    assert.ok(Math.abs(placed("c").y - (placed("a").y + placed("a").height + SPACING.rowGap)) < 0.01);
  });
  it("indents listed items", () => {
    const [heading, item] = placed("b").lines;
    assert.ok(item.x > heading.x);
  });
  it("centres centred text", () => {
    const line = placed("head").lines[0];
    assert.ok(line.x > SPACING.padding * 2);
  });
  it("leaves room for bands on the left", () => {
    assert.equal(layout.bands[0].x, SPACING.margin);
    assert.ok(placed("a").x >= SPACING.margin + SPACING.band);
  });
  it("covers the band's rows", () => {
    assert.equal(layout.bands[0].y, placed("a").y);
    assert.ok(Math.abs(layout.bands[0].y + layout.bands[0].height - (placed("e").y + placed("e").height)) < 0.01);
  });
  it("grows a short band so its label fits", () => {
    const short: FlowDiagram = { ...DIAGRAM, bands: [{ id: "x", label: "A very long band label indeed", fromRow: 3, toRow: 3 }] };
    const grown = layoutDiagram(short, options());
    assert.ok(grown.bands[0].height > layoutDiagram({ ...short, bands: [] }, options()).nodes.find((node) => node.node.id === "e")!.height);
  });
  it("uses the full width without bands", () => {
    const plain = layoutDiagram({ ...DIAGRAM, bands: [] }, options());
    assert.equal(plain.nodes.find((node) => node.node.id === "a")!.x, SPACING.margin);
  });
  it("weights column widths", () => {
    const weighted = layoutDiagram({ ...DIAGRAM, columnWeights: [2, 1] }, options());
    const [a, b] = ["a", "b"].map((id) => weighted.nodes.find((node) => node.node.id === id)!.width);
    assert.ok(Math.abs(a / b - 2) < 0.01);
  });
  it("scales text with the font size", () => {
    assert.ok(layoutDiagram(DIAGRAM, options({ fontSize: 12 })).height > layout.height);
  });
  it("leaves out hidden arrows", () => {
    assert.deepEqual(layout.edges.map((edge) => edge.edge.id), ["a-b", "a-c", "c-e", "d-e"]);
  });
  it("refuses boxes outside the grid and arrows to missing boxes", () => {
    assert.throws(() => layoutDiagram({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { id: "x", column: 2, row: 0, paragraphs: [{ text: "x" }] }] }, options()), /outside/);
    assert.throws(() => layoutDiagram({ ...DIAGRAM, edges: [{ id: "bad", from: "a", to: "zz" }] }, options()), /doesn't exist/);
  });
});

describe("route", () => {
  const box = (x: number, y: number) => ({ x, y, width: 100, height: 40 });
  it("goes straight down within a column", () => {
    assert.deepEqual(route(box(0, 0), box(0, 80)).points, [[50, 40], [50, 80]]);
  });
  it("goes straight across within a row, either way", () => {
    assert.deepEqual(route(box(0, 0), box(150, 0)).points, [[100, 20], [150, 20]]);
    assert.deepEqual(route(box(150, 0), box(0, 0)).points, [[150, 20], [100, 20]]);
  });
  it("goes down then across into the nearer side", () => {
    assert.deepEqual(route(box(300, 0), box(0, 100)).points, [[350, 40], [350, 120], [100, 120]]);
    assert.deepEqual(route(box(0, 0), box(300, 100)).points, [[50, 40], [50, 120], [300, 120]]);
  });
  it("places labels beside the arrow", () => {
    assert.deepEqual(route(box(0, 0), box(0, 80)).labelAt, [56, 60]);
  });
  it("routes the diagram's arrows", () => {
    const merge = layout.edges.find((edge) => edge.edge.id === "d-e")!;
    assert.equal(merge.points.length, 3);
    assert.equal(merge.points[2][0], placed("e").x + placed("e").width);
  });
});

describe("diagramScene", () => {
  const scene = diagramScene(DIAGRAM, layout, options());
  const texts = scene.items.filter((item) => item.type === "text").map((item) => (item.type === "text" ? item.text : ""));
  it("draws every box, band and arrow", () => {
    assert.equal(scene.items.filter((item) => item.type === "rect").length, DIAGRAM.nodes.length + DIAGRAM.bands.length);
    assert.equal(scene.items.filter((item) => item.type === "path" && item.fill !== null).length, 4);
  });
  it("writes every line of text", () => {
    for (const text of ["Enrolment", "Assessed for eligibility (n = 120)", "Declined (n = 5)", "Analysed (n = 95)"]) assert.ok(texts.includes(text), text);
  });
  it("rotates band labels", () => {
    const band = scene.items.find((item) => item.type === "text" && item.rotate === -90);
    assert.ok(band);
  });
  it("labels arrows in italics", () => {
    const label = scene.items.find((item) => item.type === "text" && item.text === "eligible");
    assert.equal(label?.type === "text" && label.italic, true);
  });
  it("draws arrows before boxes, so lines never cross text", () => {
    const firstPath = scene.items.findIndex((item) => item.type === "path");
    const firstBox = scene.items.findIndex((item) => item.type === "rect" && item.width !== layout.bands[0].width);
    assert.ok(firstPath < firstBox);
  });
  it("carries the title, text alternative and fonts", () => {
    assert.deepEqual([scene.title, scene.description, scene.fontFamily], ["Test diagram", "A test.", FONTS.sans.family]);
    assert.equal(diagramScene(DIAGRAM, layout, options({ typeface: "serif" })).pdfFonts.regular, "Times-Roman");
  });
  for (const theme of THEMES)
    it(`fills boxes with the ${theme} theme's colours`, () => {
      const themed = diagramScene(DIAGRAM, layout, options({ theme }));
      const header = themed.items.find((item) => item.type === "rect" && item.fill === THEME_COLOURS[theme].header);
      assert.ok(header);
      assert.ok(themed.items.filter((item) => item.type === "rect").every((item) => item.type === "rect" && item.stroke === THEME_COLOURS[theme].stroke));
    });
  it("uses only grays in grayscale", () => {
    const fills = diagramScene(DIAGRAM, layout, options({ theme: "grayscale" })).items.flatMap((item) => (item.type === "rect" || item.type === "path" ? [item.fill] : [])).filter((fill): fill is string => fill !== null);
    for (const fill of fills) {
      const [r, g, b] = [1, 3, 5].map((start) => parseInt(fill.slice(start, start + 2), 16));
      assert.ok(r === g && g === b, fill);
    }
  });
  it("uses only black and white in high contrast", () => {
    const colours = diagramScene(DIAGRAM, layout, options({ theme: "high-contrast" })).items.flatMap((item) => (item.type === "rect" ? [item.fill, item.stroke] : item.type === "text" ? [item.fill] : []));
    assert.ok(colours.every((colour) => colour === "#ffffff" || colour === "#000000"));
  });
  it("points arrowheads along the arrow", () => {
    const head = arrowHead([[0, 0], [0, 50]]);
    assert.deepEqual(head[0], ["M", 0, 50]);
    const tips = head.slice(1, 3).map((command) => (command[0] === "L" ? command[2] : 0));
    assert.ok(tips.every((y) => y < 50));
  });
});

describe("theme contrast", () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((start) => {
      const value = parseInt(hex.slice(start, start + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  for (const theme of THEMES)
    it(`keeps text at 7:1 or more on every ${theme} fill`, () => {
      const colours = THEME_COLOURS[theme];
      for (const fill of [colours.box, colours.header, colours.muted, colours.band]) assert.ok(contrast(colours.text, fill) >= 7, `${theme} ${fill}`);
    });
});

describe("diagramProblems", () => {
  it("accepts a sound diagram", () => {
    assert.deepEqual(diagramProblems(DIAGRAM), []);
  });
  const problems = (diagram: FlowDiagram) => diagramProblems(diagram).map((problem) => problem.message).join(" | ");
  it("finds repeated ids", () => {
    assert.match(problems({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { ...DIAGRAM.nodes[1], row: 3, column: 1 }] }), /Two boxes share the id “a”/);
    assert.match(problems({ ...DIAGRAM, edges: [...DIAGRAM.edges, DIAGRAM.edges[0]] }), /Two arrows share the id “a-b”/);
  });
  it("finds boxes outside the grid and overlapping boxes", () => {
    assert.match(problems({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { id: "x", column: 1, row: 9, paragraphs: [{ text: "x" }] }] }), /lies outside/);
    assert.match(problems({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { id: "x", column: 1, row: 1, paragraphs: [{ text: "x" }] }] }), /Boxes “b” and “x” overlap/);
  });
  it("finds empty boxes and invalid spans", () => {
    assert.match(problems({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { id: "x", column: 1, row: 3, paragraphs: [{ text: " " }] }] }), /has no text/);
    assert.match(problems({ ...DIAGRAM, nodes: [...DIAGRAM.nodes, { id: "x", column: 1, row: 3, span: 0.5, paragraphs: [{ text: "x" }] }] }), /invalid span/);
  });
  it("finds arrows to missing boxes and to themselves", () => {
    assert.match(problems({ ...DIAGRAM, edges: [{ id: "bad", from: "a", to: "zz" }] }), /joins a box that doesn't exist/);
    assert.match(problems({ ...DIAGRAM, edges: [{ id: "loop", from: "a", to: "a" }] }), /points from a box to itself/);
  });
  it("finds bands over missing rows and bad column weights", () => {
    assert.match(problems({ ...DIAGRAM, bands: [{ id: "x", label: "X", fromRow: 2, toRow: 9 }] }), /covers rows that don't exist/);
    assert.match(problems({ ...DIAGRAM, columnWeights: [1] }), /Column widths/);
    assert.match(problems({ ...DIAGRAM, columnWeights: [1, 0] }), /Column widths/);
  });
  it("needs a grid", () => {
    assert.match(problems({ ...DIAGRAM, columns: 0 }), /at least one row and one column/);
  });
});

describe("renderDiagram", () => {
  const rendered = renderDiagram(DIAGRAM, options());
  it("writes a labelled SVG", () => {
    assert.match(rendered.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="680"/);
    assert.match(rendered.svg, /<title id="chart-title">Test diagram<\/title>/);
    assert.match(rendered.svg, /<desc id="chart-desc">A test\.<\/desc>/);
  });
  it("sizes the PNG for 300 DPI", () => {
    assert.equal(DIAGRAM_PNG_DPI, 300);
    assert.equal(rendered.png.width, Math.round((680 * 300) / 96));
  });
  it("writes a vector PDF", () => {
    const text = Array.from(diagramPdf(rendered), (byte) => String.fromCharCode(byte)).join("");
    assert.ok(text.startsWith("%PDF-1.4"));
    assert.match(text, /\(Randomised \(n = 100\)\)|Randomised \\\(n = 100\\\)/);
  });
  it("names files from the title", () => {
    assert.equal(diagramFileName("PRISMA 2020 flow diagram", "svg"), "prisma-2020-flow-diagram.svg");
  });
});
