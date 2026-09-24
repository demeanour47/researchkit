/**
 * Exports a laid-out conceptual framework as standalone SVG, as a vector PDF, and
 * helps produce a 300 DPI PNG. Pure functions of the layout, so every format shows
 * exactly the same figure.
 *
 * SVG uses only basic shapes (rectangles, lines, polygons, text) with explicit colours
 * and no markers, scripts, CSS or external fonts, for the widest compatibility with
 * word processors and presentation software. Compatibility with each application
 * still needs verifying by hand: see the export verification items on the page.
 */

import type { EdgePath, FrameworkLayout, GroupBox, NodeBox } from "./conceptual-layout";
import { LAYOUT, measureText } from "./conceptual-layout";

export interface ExportOptions {
  /** Black and white only. */
  monochrome?: boolean;
  title?: string;
  /** A text description, embedded for screen readers. */
  description?: string;
}

/** Colours from the ResearchKit light theme, written out because exported files can't use CSS variables. */
export const EXPORT_COLOURS = {
  colour: { background: "#ffffff", text: "#0f1729", muted: "#4a5568", line: "#0f1729", box: "#ffffff", bandBox: "#eef1f5", boxStroke: "#2445d6", groupStroke: "#4a5568" },
  monochrome: { background: "#ffffff", text: "#000000", muted: "#000000", line: "#000000", box: "#ffffff", bandBox: "#ffffff", boxStroke: "#000000", groupStroke: "#000000" },
} as const;

export const EXPORT_FONT = "Helvetica, Arial, sans-serif";
const STROKE_WIDTH = 1.5;
const BAND_TYPES = new Set(["mediator", "moderator"]);

const num = (value: number) => String(Math.round(value * 100) / 100);

export function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** The baselines of a box's caption and lines, centring the block of text vertically. */
export function textBaselines(node: NodeBox): { caption: number | null; lines: number[] } {
  const block = (node.caption ? LAYOUT.captionHeight : 0) + node.lines.length * LAYOUT.lineHeight;
  const top = node.y + (node.height - block) / 2;
  // A baseline about 0.35 of the size below a line's middle centres Helvetica visually.
  const caption = node.caption ? top + LAYOUT.captionHeight / 2 + LAYOUT.captionSize * 0.35 : null;
  const first = top + (node.caption ? LAYOUT.captionHeight : 0);
  return { caption, lines: node.lines.map((_, index) => first + index * LAYOUT.lineHeight + LAYOUT.lineHeight / 2 + LAYOUT.fontSize * 0.35) };
}

/** The figure as a standalone SVG document. */
export function toSvg(layout: FrameworkLayout, options: ExportOptions = {}): string {
  const colours = options.monochrome ? EXPORT_COLOURS.monochrome : EXPORT_COLOURS.colour;
  const title = options.title ?? "Conceptual framework";
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="cf-title cf-desc">`,
    `<title id="cf-title">${escapeXml(title)}</title>`,
    `<desc id="cf-desc">${escapeXml(options.description ?? "")}</desc>`,
    `<rect x="0" y="0" width="${layout.width}" height="${layout.height}" fill="${colours.background}"/>`,
  ];
  const text = (x: number, y: number, size: number, fill: string, value: string, anchor = "middle") =>
    `<text x="${num(x)}" y="${num(y)}" font-family="${EXPORT_FONT}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`;

  for (const group of layout.groups) {
    out.push(
      `<rect x="${num(group.x)}" y="${num(group.y)}" width="${num(group.width)}" height="${num(group.height)}" rx="${LAYOUT.cornerRadius}" fill="none" stroke="${colours.groupStroke}" stroke-width="1" stroke-dasharray="4 3"/>`,
      text(group.x + LAYOUT.groupPadding, group.y + LAYOUT.groupLabelHeight - 4, LAYOUT.labelSize, colours.muted, group.label, "start"),
    );
  }
  for (const edge of layout.edges) {
    const dash = edge.dash ? ` stroke-dasharray="${edge.dash.join(" ")}"` : "";
    out.push(
      `<line x1="${num(edge.lineFrom.x)}" y1="${num(edge.lineFrom.y)}" x2="${num(edge.lineTo.x)}" y2="${num(edge.lineTo.y)}" stroke="${colours.line}" stroke-width="${STROKE_WIDTH}"${dash}/>`,
    );
    for (const head of edge.arrowheads) out.push(`<polygon points="${head.map((point) => `${num(point.x)},${num(point.y)}`).join(" ")}" fill="${colours.line}"/>`);
  }
  for (const node of layout.nodes) {
    const fill = BAND_TYPES.has(node.type) ? colours.bandBox : colours.box;
    out.push(
      `<rect x="${num(node.x)}" y="${num(node.y)}" width="${num(node.width)}" height="${num(node.height)}" rx="${LAYOUT.cornerRadius}" fill="${fill}" stroke="${colours.boxStroke}" stroke-width="${STROKE_WIDTH}"/>`,
    );
    const baselines = textBaselines(node);
    const middle = node.x + node.width / 2;
    if (node.caption && baselines.caption !== null) out.push(text(middle, baselines.caption, LAYOUT.captionSize, colours.muted, node.caption));
    node.lines.forEach((line, index) => out.push(text(middle, baselines.lines[index], LAYOUT.fontSize, colours.text, line)));
  }
  for (const edge of layout.edges) {
    if (!edge.label) continue;
    const { x, y, width, height, text: value } = edge.label;
    out.push(
      `<rect x="${num(x)}" y="${num(y)}" width="${num(width)}" height="${num(height)}" fill="${colours.background}"/>`,
      text(x + width / 2, y + height / 2 + LAYOUT.labelSize * 0.35, LAYOUT.labelSize, colours.text, value),
    );
  }
  out.push("</svg>");
  return out.join("\n");
}

// PDF.

/** CSS pixels (96 per inch) to PDF points (72 per inch). */
export const PX_TO_PT = 0.75;

/** Characters Windows-1252 (the encoding of the standard PDF fonts) places outside Latin-1. */
const WIN_ANSI: Readonly<Record<string, number>> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c,
  "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b,
  "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
  // The minus sign has no WinAnsi code; a hyphen is the closest character.
  "−": 0x2d,
};

/**
 * Text as a PDF string literal in WinAnsi encoding. Characters the standard fonts
 * can't show are replaced with "?"; this is a stated limitation of PDF export.
 */
export function pdfString(text: string): string {
  let out = "(";
  for (const character of text) {
    const code = character.codePointAt(0)!;
    const byte = code >= 32 && code <= 126 ? code : WIN_ANSI[character] ?? (code >= 160 && code <= 255 ? code : 0x3f);
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) out += `\\${String.fromCharCode(byte)}`;
    else if (byte > 126) out += `\\${byte.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(byte);
  }
  return `${out})`;
}

const rgb = (hex: string) =>
  [1, 3, 5].map((start) => num(parseInt(hex.slice(start, start + 2), 16) / 255)).join(" ");

/** The page content: the same shapes as the SVG, in PDF operators, with the y axis flipped. */
function pdfContent(layout: FrameworkLayout, monochrome: boolean): string {
  const colours = monochrome ? EXPORT_COLOURS.monochrome : EXPORT_COLOURS.colour;
  const X = (x: number) => num(x * PX_TO_PT);
  const Y = (y: number) => num((layout.height - y) * PX_TO_PT);
  const ops: string[] = [`${rgb(colours.background)} rg`, `0 0 ${X(layout.width)} ${num(layout.height * PX_TO_PT)} re f`];
  const K = 0.5523; // Bézier approximation of a quarter circle.

  const roundedRect = (box: { x: number; y: number; width: number; height: number }) => {
    const r = Math.min(LAYOUT.cornerRadius, box.width / 2, box.height / 2);
    const { x, y, width: w, height: h } = box;
    const c = r * K;
    return [
      `${X(x + r)} ${Y(y)} m`,
      `${X(x + w - r)} ${Y(y)} l`,
      `${X(x + w - r + c)} ${Y(y)} ${X(x + w)} ${Y(y + r - c)} ${X(x + w)} ${Y(y + r)} c`,
      `${X(x + w)} ${Y(y + h - r)} l`,
      `${X(x + w)} ${Y(y + h - r + c)} ${X(x + w - r + c)} ${Y(y + h)} ${X(x + w - r)} ${Y(y + h)} c`,
      `${X(x + r)} ${Y(y + h)} l`,
      `${X(x + r - c)} ${Y(y + h)} ${X(x)} ${Y(y + h - r + c)} ${X(x)} ${Y(y + h - r)} c`,
      `${X(x)} ${Y(y + r)} l`,
      `${X(x)} ${Y(y + r - c)} ${X(x + r - c)} ${Y(y)} ${X(x + r)} ${Y(y)} c`,
      "h",
    ].join("\n");
  };
  const text = (value: string, centreX: number, baseline: number, size: number, colour: string, anchor: "middle" | "start" = "middle") => {
    const width = measureText(value, size);
    const x = anchor === "middle" ? centreX - width / 2 : centreX;
    return `BT ${rgb(colour)} rg /F1 ${num(size * PX_TO_PT)} Tf ${X(x)} ${Y(baseline)} Td ${pdfString(value)} Tj ET`;
  };

  for (const group of layout.groups as GroupBox[]) {
    ops.push(`${rgb(colours.groupStroke)} RG 0.75 w [${num(4 * PX_TO_PT)} ${num(3 * PX_TO_PT)}] 0 d`, roundedRect(group), "S", "[] 0 d");
    ops.push(text(group.label, group.x + LAYOUT.groupPadding, group.y + LAYOUT.groupLabelHeight - 4, LAYOUT.labelSize, colours.muted, "start"));
  }
  for (const edge of layout.edges as EdgePath[]) {
    const dash = edge.dash ? `[${edge.dash.map((part) => num(part * PX_TO_PT)).join(" ")}] 0 d` : "[] 0 d";
    ops.push(`${rgb(colours.line)} RG ${num(STROKE_WIDTH * PX_TO_PT)} w ${dash}`, `${X(edge.lineFrom.x)} ${Y(edge.lineFrom.y)} m ${X(edge.lineTo.x)} ${Y(edge.lineTo.y)} l S`, "[] 0 d");
    for (const [a, b, c] of edge.arrowheads) ops.push(`${rgb(colours.line)} rg ${X(a.x)} ${Y(a.y)} m ${X(b.x)} ${Y(b.y)} l ${X(c.x)} ${Y(c.y)} l h f`);
  }
  for (const node of layout.nodes as NodeBox[]) {
    const fill = BAND_TYPES.has(node.type) ? colours.bandBox : colours.box;
    ops.push(`${rgb(fill)} rg ${rgb(colours.boxStroke)} RG ${num(STROKE_WIDTH * PX_TO_PT)} w`, roundedRect(node), "B");
    const baselines = textBaselines(node);
    const middle = node.x + node.width / 2;
    if (node.caption && baselines.caption !== null) ops.push(text(node.caption, middle, baselines.caption, LAYOUT.captionSize, colours.muted));
    node.lines.forEach((line, index) => ops.push(text(line, middle, baselines.lines[index], LAYOUT.fontSize, colours.text)));
  }
  for (const edge of layout.edges as EdgePath[]) {
    if (!edge.label) continue;
    const { x, y, width, height, text: value } = edge.label;
    ops.push(`${rgb(colours.background)} rg ${X(x)} ${Y(y + height)} ${num(width * PX_TO_PT)} ${num(height * PX_TO_PT)} re f`);
    ops.push(text(value, x + width / 2, y + height / 2 + LAYOUT.labelSize * 0.35, LAYOUT.labelSize, colours.text));
  }
  return ops.join("\n");
}

/**
 * The figure as a one-page vector PDF, sized to the figure, using the standard
 * Helvetica font. Returned as bytes.
 */
export function toPdf(layout: FrameworkLayout, options: ExportOptions = {}): Uint8Array<ArrayBuffer> {
  const content = pdfContent(layout, options.monochrome ?? false);
  const width = num(layout.width * PX_TO_PT);
  const height = num(layout.height * PX_TO_PT);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Title ${pdfString(options.title ?? "Conceptual framework")} /Producer (ResearchKit) >>`,
  ];
  // Every character written is a single byte, so string length equals byte offset.
  let body = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(body.length);
  for (let index = 0; index < body.length; index++) bytes[index] = body.charCodeAt(index);
  return bytes;
}

// PNG.

/** The resolution of PNG export, and the scale from the 96-per-inch layout to it. */
export const PNG_DPI = 300;
export const PNG_SCALE = PNG_DPI / 96;

/** The pixel size of a PNG export at 300 DPI. */
export function pngSize(layout: FrameworkLayout): { width: number; height: number } {
  return { width: Math.ceil(layout.width * PNG_SCALE), height: Math.ceil(layout.height * PNG_SCALE) };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** The CRC-32 used by PNG chunks (ISO 3309 / ITU-T V.42). */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** Builds a PNG chunk: length, type, data and CRC. */
export function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  for (let index = 0; index < 4; index++) chunk[4 + index] = type.charCodeAt(index);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

/**
 * Records a resolution in a PNG, so word processors place it at the intended size:
 * a pHYs chunk, in pixels per metre, placed straight after the header. Any existing
 * pHYs chunk is replaced. Throws a RangeError if the bytes aren't a PNG.
 */
export function setPngDpi(png: Uint8Array, dpi: number): Uint8Array<ArrayBuffer> {
  if (png.length < 33 || PNG_SIGNATURE.some((byte, index) => png[index] !== byte)) throw new RangeError("Not a PNG image.");
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const perMetre = Math.round(dpi / 0.0254);
  const data = new Uint8Array(9);
  const dataView = new DataView(data.buffer);
  dataView.setUint32(0, perMetre);
  dataView.setUint32(4, perMetre);
  data[8] = 1; // The unit is the metre.
  const physical = pngChunk("pHYs", data);

  const parts: Uint8Array[] = [png.subarray(0, 8)];
  let offset = 8;
  while (offset < png.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...png.subarray(offset + 4, offset + 8));
    const end = offset + 12 + length;
    if (type !== "pHYs") parts.push(png.subarray(offset, end));
    if (type === "IHDR") parts.push(physical);
    offset = end;
  }
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let position = 0;
  for (const part of parts) {
    out.set(part, position);
    position += part.length;
  }
  return out;
}
