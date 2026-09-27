import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHART_PNG_DPI, PX_TO_PT, chartFileName, pngPixels, sceneToPdf, sceneToSvg } from "./export";
import { renderChart } from "./render";
import type { Scene } from "./scene";
import { parseTable } from "./table";
import { CHART_TYPES, CHART_TYPE_INFO, DEFAULT_OPTIONS, type ChartOptions, type ChartType } from "./types";

const sceneFor = (type: ChartType, options: Partial<ChartOptions> = {}): Scene => {
  const { scene } = renderChart(parseTable(CHART_TYPE_INFO[type].example).table, { ...DEFAULT_OPTIONS, title: "Test chart", ...options, type });
  assert.ok(scene);
  return scene;
};
const pdfText = (bytes: Uint8Array) => Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

const tiny: Scene = {
  width: 100,
  height: 50,
  title: "Tiny & <small>",
  description: "A \"test\" chart",
  fontFamily: "Helvetica, Arial, sans-serif",
  pdfFonts: { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" },
  widthFactor: 1,
  items: [
    { type: "rect", x: 10, y: 10, width: 20, height: 30, fill: "#2a78d6", stroke: null, strokeWidth: 0 },
    { type: "line", x1: 0, y1: 40, x2: 100, y2: 40, stroke: "#8a8984", strokeWidth: 1, dash: [4, 2] },
    { type: "path", commands: [["M", 50, 10], ["L", 60, 20], ["C", 61, 21, 62, 22, 63, 23], ["Z"]], fill: null, stroke: "#0b0b0b", strokeWidth: 2, dash: null },
    { type: "text", x: 50, y: 48, text: "A < B & “C”", size: 12, weight: "bold", italic: false, anchor: "middle", fill: "#0b0b0b", rotate: 0 },
    { type: "text", x: 5, y: 25, text: "Rotated", size: 10, weight: "normal", italic: true, anchor: "start", fill: "#52514e", rotate: -90 },
  ],
  notes: [],
};

describe("sceneToSvg", () => {
  const svg = sceneToSvg(tiny);
  it("is a sized SVG with a view box", () => {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="100" height="50" viewBox="0 0 100 50"/);
    assert.match(svg, /<\/svg>$/);
  });
  it("is labelled for screen readers", () => {
    assert.match(svg, /role="img" aria-labelledby="chart-title chart-desc"/);
  });
  it("escapes the title and description", () => {
    assert.match(svg, /<title id="chart-title">Tiny &amp; &lt;small&gt;<\/title>/);
    assert.match(svg, /<desc id="chart-desc">A &quot;test&quot; chart<\/desc>/);
  });
  it("has a white background so pasted charts aren't transparent", () => {
    assert.match(svg, /<rect x="0" y="0" width="100" height="50" fill="#ffffff"\/>/);
  });
  it("writes rectangles", () => {
    assert.match(svg, /<rect x="10" y="10" width="20" height="30" fill="#2a78d6"\/>/);
  });
  it("writes dashed lines", () => {
    assert.match(svg, /<line x1="0" y1="40" x2="100" y2="40" stroke="#8a8984" stroke-width="1" stroke-dasharray="4 2"\/>/);
  });
  it("writes paths with curves and unfilled shapes", () => {
    assert.match(svg, /<path d="M50 10 L60 20 C61 21 62 22 63 23 Z" fill="none" stroke="#0b0b0b" stroke-width="2"/);
  });
  it("escapes text and sets its font, weight and anchor", () => {
    assert.match(svg, /font-weight="bold" fill="#0b0b0b" text-anchor="middle">A &lt; B &amp; “C”<\/text>/);
  });
  it("rotates text about its anchor", () => {
    assert.match(svg, /font-style="italic" fill="#52514e" text-anchor="start" transform="rotate\(-90 5 25\)">Rotated<\/text>/);
  });
  it("escapes quotes in font families", () => {
    assert.match(sceneToSvg({ ...tiny, fontFamily: "'Times New Roman', serif" }), /font-family="&apos;Times New Roman&apos;, serif"|font-family="&#39;Times New Roman&#39;, serif"/);
  });
  for (const type of CHART_TYPES)
    it(`exports the ${CHART_TYPE_INFO[type].label.toLowerCase()} as well-formed SVG`, () => {
      const output = sceneToSvg(sceneFor(type));
      assert.equal((output.match(/<svg/g) ?? []).length, 1);
      assert.equal((output.match(/<text/g) ?? []).length, (output.match(/<\/text>/g) ?? []).length);
      assert.doesNotMatch(output, /NaN|undefined|Infinity/);
    });
});

describe("sceneToPdf", () => {
  const bytes = sceneToPdf(tiny);
  const text = pdfText(bytes);
  it("is a PDF 1.4 file", () => {
    assert.ok(text.startsWith("%PDF-1.4\n"));
    assert.ok(text.endsWith("%%EOF\n"));
  });
  it("uses a page the size of the chart in points", () => {
    assert.match(text, new RegExp(`/MediaBox \\[0 0 ${100 * PX_TO_PT} ${50 * PX_TO_PT}\\]`));
  });
  it("embeds the scene's fonts as standard fonts", () => {
    assert.match(text, /\/BaseFont \/Helvetica \/Encoding \/WinAnsiEncoding/);
    assert.match(text, /\/BaseFont \/Helvetica-Bold/);
    assert.match(text, /\/BaseFont \/Helvetica-Oblique/);
  });
  it("uses Times fonts for serif scenes", () => {
    const serif = pdfText(sceneToPdf({ ...tiny, pdfFonts: { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic" } }));
    assert.match(serif, /\/BaseFont \/Times-Roman/);
  });
  it("records the title as document information", () => {
    assert.match(text, /\/Title \(Tiny & <small>\)/);
    assert.match(text, /\/Producer \(ResearchKit\)/);
  });
  it("has a cross-reference table pointing at each object", () => {
    const start = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    assert.ok(text.slice(start).startsWith("xref\n0 9\n"));
    const offsets = [...text.slice(start).matchAll(/(\d{10}) 00000 n/g)].map((match) => Number(match[1]));
    assert.equal(offsets.length, 8);
    offsets.forEach((offset, index) => assert.ok(text.slice(offset).startsWith(`${index + 1} 0 obj`), `object ${index + 1}`));
  });
  it("gives the content stream its true length", () => {
    const match = /<< \/Length (\d+) >>\nstream\n/.exec(text);
    assert.ok(match);
    const start = match.index + match[0].length;
    assert.equal(text.slice(start + Number(match[1]), start + Number(match[1]) + 10), "\nendstream");
  });
  it("flips y, since PDF measures from the bottom", () => {
    assert.match(text, /7\.5 7\.5 15 22\.5 re f/);
  });
  it("draws dashed lines scaled to points", () => {
    assert.match(text, /\[3 1\.5\] 0 d 0 7\.5 m 75 7\.5 l S/);
  });
  it("draws curves", () => {
    assert.match(text, / c /);
  });
  it("chooses bold and italic fonts", () => {
    assert.match(text, /\/F2 9 Tf/);
    assert.match(text, /\/F3 7\.5 Tf/);
  });
  it("rotates text with a text matrix", () => {
    assert.match(text, /\/F3 7\.5 Tf 0 1 -1 0 /);
  });
  for (const type of CHART_TYPES)
    it(`exports the ${CHART_TYPE_INFO[type].label.toLowerCase()} as a single-byte PDF`, () => {
      const output = sceneToPdf(sceneFor(type, { style: "ieee", palette: "grayscale" }));
      assert.ok(output.every((byte) => byte < 256));
      assert.doesNotMatch(pdfText(output), /NaN|undefined|Infinity/);
    });
});

describe("PNG sizing and file names", () => {
  it("sizes PNGs at 300 DPI from 96-pixel-per-inch scenes", () => {
    assert.equal(CHART_PNG_DPI, 300);
    assert.deepEqual(pngPixels({ width: 600, height: 400 }), { width: 1875, height: 1250 });
  });
  it("sizes PNGs at other resolutions", () => {
    assert.deepEqual(pngPixels({ width: 96, height: 48 }, 600), { width: 600, height: 300 });
  });
  it("names files from the title", () => {
    assert.equal(chartFileName("Enrolment by Faculty (2024)", "svg"), "enrolment-by-faculty-2024.svg");
  });
  it("removes accents", () => {
    assert.equal(chartFileName("Café résumé", "png"), "cafe-resume.png");
  });
  it("falls back to “chart”", () => {
    assert.equal(chartFileName("  ***  ", "pdf"), "chart.pdf");
  });
  it("shortens long titles without a trailing hyphen", () => {
    const name = chartFileName("a ".repeat(50), "svg");
    assert.ok(name.length <= 64);
    assert.doesNotMatch(name, /-\.svg$/);
  });
});
