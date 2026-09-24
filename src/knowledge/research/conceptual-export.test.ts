import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addRelationship, addVariable } from "./conceptual-framework";
import { describeFramework } from "./conceptual-description";
import { EXPORT_COLOURS, PNG_DPI, PNG_SCALE, PX_TO_PT, crc32, escapeXml, pdfString, pngChunk, pngSize, setPngDpi, textBaselines, toPdf, toSvg } from "./conceptual-export";
import { LAYOUT, layoutFramework } from "./conceptual-layout";
import { frameworkOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK, type ConceptualFramework } from "./conceptual-types";

const framework = frameworkOfShape({ independent: 2, dependent: 1, mediators: 1, moderators: 1, controls: 1 });
const layout = layoutFramework(framework, { showTypes: true });
const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;
const latin1 = (bytes: Uint8Array) => Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

describe("toSvg", () => {
  const svg = toSvg(layout, { title: "Figure 1", description: describeFramework(framework) });

  it("is a standalone SVG document sized to the figure", () => {
    assert.ok(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}"`));
    assert.ok(svg.endsWith("</svg>"));
    assert.equal(count(svg, /<svg\b/g), 1);
  });

  it("carries a title and a full text description for screen readers", () => {
    assert.ok(svg.includes('role="img" aria-labelledby="cf-title cf-desc"'));
    assert.ok(svg.includes('<title id="cf-title">Figure 1</title>'));
    assert.ok(svg.includes(`<desc id="cf-desc">${escapeXml(describeFramework(framework))}</desc>`));
  });

  it("draws one rounded box per variable, one line per connector, and one polygon per arrowhead", () => {
    assert.equal(count(svg, /<rect [^>]*rx="8" fill="#(ffffff|eef1f5)"/g), layout.nodes.length);
    assert.equal(count(svg, /<line /g), layout.edges.length);
    assert.equal(count(svg, /<polygon /g), layout.edges.reduce((sum, edge) => sum + edge.arrowheads.length, 0));
    assert.equal(count(svg, /stroke-dasharray="4 3"/g), layout.groups.length);
  });

  it("writes every box label, caption and connector label as text", () => {
    for (const node of layout.nodes) for (const line of node.lines) assert.ok(svg.includes(`>${escapeXml(line)}</text>`), line);
    for (const node of layout.nodes) assert.ok(svg.includes(`>${node.caption}</text>`));
    for (const edge of layout.edges) if (edge.label) assert.ok(svg.includes(`>${escapeXml(edge.label.text)}</text>`));
  });

  it("uses no scripts, styles, markers, external references or CSS variables", () => {
    for (const forbidden of ["<script", "<style", "<marker", "href=", "var(--", "<image", "<foreignObject"]) assert.ok(!svg.includes(forbidden), forbidden);
  });

  it("uses a widely available font stack", () => {
    assert.ok(svg.includes('font-family="Helvetica, Arial, sans-serif"'));
  });

  it("escapes text", () => {
    const risky = addVariable(EMPTY_FRAMEWORK, { name: `Pay & "reward" <bonus>`, type: "independent" });
    const out = toSvg(layoutFramework(risky), { title: "A & B" });
    assert.ok(out.includes("Pay &amp; &quot;reward&quot; &lt;bonus&gt;"));
    assert.ok(out.includes("<title id=\"cf-title\">A &amp; B</title>"));
    assert.ok(!out.includes("<bonus>"));
  });

  it("uses only black, white and grey in monochrome mode", () => {
    const mono = toSvg(layout, { monochrome: true });
    const colours = new Set(mono.match(/#[0-9a-f]{6}/g));
    for (const colour of colours) assert.ok(["#000000", "#ffffff"].includes(colour), colour);
    const colour = new Set(svg.match(/#[0-9a-f]{6}/g));
    assert.ok(colour.has(EXPORT_COLOURS.colour.boxStroke));
  });

  it("marks relationship types by line style, never by colour alone", () => {
    let styled: ConceptualFramework = addVariable(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "independent" }), { name: "b", type: "dependent" });
    styled = addRelationship(styled, { source: "v-a", target: "v-b", type: "indirect" });
    styled = addRelationship(styled, { source: "v-b", target: "v-a", type: "influence" });
    const out = toSvg(layoutFramework(styled));
    assert.ok(out.includes('stroke-dasharray="8 5"'));
    assert.ok(out.includes('stroke-dasharray="2 4"'));
  });

  it("centres the block of text vertically in each box", () => {
    for (const node of layout.nodes) {
      const { caption, lines } = textBaselines(node);
      const first = caption ?? lines[0];
      const last = lines[lines.length - 1];
      const middle = (first + last) / 2;
      assert.ok(Math.abs(middle - (node.y + node.height / 2) - LAYOUT.fontSize * 0.35) < LAYOUT.lineHeight, node.id);
    }
  });

  it("exports an empty figure", () => {
    assert.ok(toSvg(layoutFramework(EMPTY_FRAMEWORK)).includes("</svg>"));
  });

  it("exports 100 variables and 200 relationships in under 50 milliseconds", () => {
    let big: ConceptualFramework = EMPTY_FRAMEWORK;
    for (let index = 0; index < 100; index++) big = addVariable(big, { name: `variable ${index}`, type: index % 2 === 0 ? "independent" : "dependent" });
    for (let index = 0; index < 200; index++) big = addRelationship(big, { source: big.variables[(index * 2) % 100].id, target: big.variables[(index * 2 + 1) % 100].id, type: "direct", label: `H${index}` });
    const bigLayout = layoutFramework(big);
    toSvg(bigLayout);
    const times = [0, 1, 2].map(() => {
      const start = performance.now();
      toSvg(bigLayout);
      return performance.now() - start;
    });
    assert.ok(Math.min(...times) < 50, `took ${Math.min(...times).toFixed(1)} ms`);
  });
});

describe("toPdf", () => {
  const bytes = toPdf(layout, { title: "Figure 1 – sleep" });
  const pdf = latin1(bytes);

  it("is a one-page PDF sized to the figure in points", () => {
    assert.ok(pdf.startsWith("%PDF-1.4\n"));
    assert.ok(pdf.endsWith("%%EOF\n"));
    assert.ok(pdf.includes(`/MediaBox [0 0 ${layout.width * PX_TO_PT} ${layout.height * PX_TO_PT}]`));
    assert.equal(count(pdf, /\/Type \/Page\b/g), 1);
  });

  it("has a cross-reference table whose offsets point at each object", () => {
    const xrefAt = Number(/startxref\n(\d+)\n/.exec(pdf)![1]);
    assert.ok(pdf.slice(xrefAt).startsWith("xref\n0 7\n"));
    const offsets = pdf.slice(xrefAt).split("\n").slice(3, 9).map((line) => Number(line.slice(0, 10)));
    offsets.forEach((offset, index) => assert.ok(pdf.slice(offset).startsWith(`${index + 1} 0 obj\n`), `object ${index + 1}`));
  });

  it("states the correct length for its content stream", () => {
    const match = /\/Length (\d+) >>\nstream\n/.exec(pdf)!;
    const start = match.index + match[0].length;
    const end = pdf.indexOf("\nendstream", start);
    assert.equal(end - start, Number(match[1]));
  });

  it("uses the standard Helvetica font, which every PDF reader has", () => {
    assert.ok(pdf.includes("/BaseFont /Helvetica /Encoding /WinAnsiEncoding"));
  });

  it("draws every box, line, arrowhead and label as vector operators", () => {
    const stream = pdf.slice(pdf.indexOf("stream\n") + 7, pdf.indexOf("\nendstream"));
    assert.equal(count(stream, /\nB\n/g) + (stream.startsWith("B\n") ? 1 : 0), layout.nodes.length);
    assert.equal(count(stream, / l S\n/g), layout.edges.length);
    assert.equal(count(stream, / l h f\n/g), layout.edges.reduce((sum, edge) => sum + edge.arrowheads.length, 0));
    assert.equal(count(stream, /BT /g), count(stream, / ET/g));
    for (const node of layout.nodes) for (const line of node.lines) assert.ok(stream.includes(pdfString(line)), line);
  });

  it("records the title, with the en dash in WinAnsi encoding", () => {
    assert.ok(pdf.includes("/Title (Figure 1 \\226 sleep)"));
  });

  it("uses only single-byte characters", () => {
    for (const byte of bytes) assert.ok(byte < 256);
    assert.equal(bytes.length, pdf.length);
  });
});

describe("pdfString", () => {
  it("escapes the characters PDF strings treat specially", () => {
    assert.equal(pdfString("a (b) \\ c"), "(a \\(b\\) \\\\ c)");
  });

  it("encodes Latin-1 and WinAnsi characters, and replaces others", () => {
    assert.equal(pdfString("café"), "(caf\\351)");
    assert.equal(pdfString("“x” – €"), "(\\223x\\224 \\226 \\200)");
    assert.equal(pdfString("H1 (−)"), "(H1 \\(-\\))", "the minus sign becomes a hyphen");
    assert.equal(pdfString("睡眠"), "(??)");
  });
});

describe("PNG export", () => {
  it("scales the 96-per-inch layout to 300 DPI", () => {
    assert.equal(PNG_DPI, 300);
    assert.equal(PNG_SCALE, 3.125);
    assert.deepEqual(pngSize(layout), { width: Math.ceil(layout.width * 3.125), height: Math.ceil(layout.height * 3.125) });
  });

  it("computes the standard CRC-32", () => {
    assert.equal(crc32(new TextEncoder().encode("IEND")), 0xae426082);
    assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
    assert.equal(crc32(new Uint8Array()), 0);
  });

  const header = new Uint8Array(13);
  new DataView(header.buffer).setUint32(0, 10);
  new DataView(header.buffer).setUint32(4, 10);
  header.set([8, 6, 0, 0, 0], 8);
  const join = (...parts: Uint8Array[]) => {
    const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let at = 0;
    for (const part of parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  };
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = join(signature, pngChunk("IHDR", header), pngChunk("IDAT", new Uint8Array([1, 2, 3])), pngChunk("IEND", new Uint8Array()));
  const chunks = (bytes: Uint8Array) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const found: string[] = [];
    for (let at = 8; at < bytes.length; at += 12 + view.getUint32(at)) found.push(String.fromCharCode(...bytes.subarray(at + 4, at + 8)));
    return found;
  };

  it("builds chunks with a correct length and CRC", () => {
    const iend = pngChunk("IEND", new Uint8Array());
    assert.deepEqual(Array.from(iend), [0, 0, 0, 0, 73, 69, 78, 68, 0xae, 0x42, 0x60, 0x82]);
  });

  it("adds a 300 DPI pHYs chunk straight after the header", () => {
    const stamped = setPngDpi(png, 300);
    assert.deepEqual(chunks(stamped), ["IHDR", "pHYs", "IDAT", "IEND"]);
    const at = 8 + 25;
    const view = new DataView(stamped.buffer);
    assert.equal(view.getUint32(at), 9);
    assert.equal(view.getUint32(at + 8), 11811, "300 dots per inch is 11,811 per metre");
    assert.equal(view.getUint32(at + 12), 11811);
    assert.equal(stamped[at + 16], 1);
    assert.equal(view.getUint32(at + 17), crc32(stamped.subarray(at + 4, at + 17)));
  });

  it("replaces an existing pHYs chunk rather than adding a second", () => {
    const twice = setPngDpi(setPngDpi(png, 72), 300);
    assert.deepEqual(chunks(twice), ["IHDR", "pHYs", "IDAT", "IEND"]);
    assert.equal(new DataView(twice.buffer).getUint32(8 + 25 + 8), 11811);
  });

  it("keeps the image data unchanged", () => {
    const stamped = setPngDpi(png, 300);
    assert.deepEqual(Array.from(stamped.subarray(stamped.length - 27)), Array.from(png.subarray(png.length - 27)));
  });

  it("rejects bytes that aren't a PNG", () => {
    assert.throws(() => setPngDpi(new Uint8Array(40), 300), { message: "Not a PNG image." });
  });
});
