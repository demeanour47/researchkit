/**
 * Scenes as files: SVG (vector, the sharpest option for Word and other editors), PDF
 * (vector, one page the size of the chart, standard fonts), and the pixel size for a
 * PNG at 300 dots per inch, the resolution journals commonly require for images. The
 * browser draws the PNG from the SVG; the knowledge layer only sizes it.
 */

import { escapeXml, pdfString } from "../research/conceptual-export";
import type { PathCommand, Scene, SceneItem } from "./scene";
import { textWidth } from "./scene";

const n = (value: number) => String(Math.round(value * 100) / 100);

function svgPath(commands: readonly PathCommand[]): string {
  return commands.map((command) => (command[0] === "Z" ? "Z" : `${command[0]}${command.slice(1).map((part) => n(part as number)).join(" ")}`)).join(" ");
}

function svgItem(item: SceneItem, fontFamily: string): string {
  switch (item.type) {
    case "rect":
      return `<rect x="${n(item.x)}" y="${n(item.y)}" width="${n(item.width)}" height="${n(item.height)}" fill="${item.fill ?? "none"}"${item.stroke ? ` stroke="${item.stroke}" stroke-width="${n(item.strokeWidth)}"` : ""}/>`;
    case "line":
      return `<line x1="${n(item.x1)}" y1="${n(item.y1)}" x2="${n(item.x2)}" y2="${n(item.y2)}" stroke="${item.stroke}" stroke-width="${n(item.strokeWidth)}"${item.dash ? ` stroke-dasharray="${item.dash.join(" ")}"` : ""}/>`;
    case "path":
      return `<path d="${svgPath(item.commands)}" fill="${item.fill ?? "none"}"${item.stroke ? ` stroke="${item.stroke}" stroke-width="${n(item.strokeWidth)}" stroke-linejoin="round" stroke-linecap="round"` : ""}${item.dash ? ` stroke-dasharray="${item.dash.join(" ")}"` : ""}/>`;
    case "text": {
      const anchor = item.anchor === "middle" ? "middle" : item.anchor === "end" ? "end" : "start";
      const transform = item.rotate ? ` transform="rotate(${n(item.rotate)} ${n(item.x)} ${n(item.y)})"` : "";
      return `<text x="${n(item.x)}" y="${n(item.y)}" font-family="${escapeXml(fontFamily)}" font-size="${n(item.size)}"${item.weight === "bold" ? ' font-weight="bold"' : ""}${item.italic ? ' font-style="italic"' : ""} fill="${item.fill}" text-anchor="${anchor}"${transform}>${escapeXml(item.text)}</text>`;
    }
  }
}

/** The chart as a standalone SVG document, with its title and text alternative embedded for screen readers. */
export function sceneToSvg(scene: Scene): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img" aria-labelledby="chart-title chart-desc">`,
    `<title id="chart-title">${escapeXml(scene.title)}</title>`,
    `<desc id="chart-desc">${escapeXml(scene.description)}</desc>`,
    `<rect x="0" y="0" width="${scene.width}" height="${scene.height}" fill="#ffffff"/>`,
    ...scene.items.map((item) => svgItem(item, scene.fontFamily)),
    "</svg>",
  ].join("\n");
}

/** Points per pixel: 72 points per inch, 96 pixels per inch. */
export const PX_TO_PT = 0.75;

const rgb = (hex: string) => [1, 3, 5].map((start) => n(parseInt(hex.slice(start, start + 2), 16) / 255)).join(" ");

function pdfContent(scene: Scene): string {
  const X = (x: number) => n(x * PX_TO_PT);
  const Y = (y: number) => n((scene.height - y) * PX_TO_PT);
  const ops: string[] = ["1 1 1 rg", `0 0 ${X(scene.width)} ${n(scene.height * PX_TO_PT)} re f`, "1 J 1 j"];
  const dash = (pattern: number[] | null) => (pattern ? `[${pattern.map((part) => n(part * PX_TO_PT)).join(" ")}] 0 d` : "[] 0 d");
  for (const item of scene.items) {
    if (item.type === "rect") {
      const shape = `${X(item.x)} ${Y(item.y + item.height)} ${n(item.width * PX_TO_PT)} ${n(item.height * PX_TO_PT)} re`;
      if (item.fill) ops.push(`${rgb(item.fill)} rg`);
      if (item.stroke) ops.push(`${rgb(item.stroke)} RG ${n(item.strokeWidth * PX_TO_PT)} w [] 0 d`);
      ops.push(`${shape} ${item.fill && item.stroke ? "B" : item.fill ? "f" : "S"}`);
    } else if (item.type === "line") {
      ops.push(`${rgb(item.stroke)} RG ${n(item.strokeWidth * PX_TO_PT)} w ${dash(item.dash)} ${X(item.x1)} ${Y(item.y1)} m ${X(item.x2)} ${Y(item.y2)} l S`);
    } else if (item.type === "path") {
      const segments = item.commands.map((command) => {
        if (command[0] === "M") return `${X(command[1])} ${Y(command[2])} m`;
        if (command[0] === "L") return `${X(command[1])} ${Y(command[2])} l`;
        if (command[0] === "C") return `${X(command[1])} ${Y(command[2])} ${X(command[3])} ${Y(command[4])} ${X(command[5])} ${Y(command[6])} c`;
        return "h";
      });
      if (item.fill) ops.push(`${rgb(item.fill)} rg`);
      if (item.stroke) ops.push(`${rgb(item.stroke)} RG ${n(item.strokeWidth * PX_TO_PT)} w ${dash(item.dash)}`);
      ops.push(`${segments.join(" ")} ${item.fill && item.stroke ? "B" : item.fill ? "f" : "S"}`);
    } else {
      const font = item.weight === "bold" ? "F2" : item.italic ? "F3" : "F1";
      const size = item.size * PX_TO_PT;
      const width = textWidth(item.text, item.size, scene.widthFactor) * PX_TO_PT;
      const shift = item.anchor === "middle" ? width / 2 : item.anchor === "end" ? width : 0;
      // PDF's y axis points up, so a clockwise SVG rotation becomes an anticlockwise one.
      const angle = (-item.rotate * Math.PI) / 180;
      const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
      const x = item.x * PX_TO_PT - shift * cos;
      const y = (scene.height - item.y) * PX_TO_PT - shift * sin;
      ops.push(`BT ${rgb(item.fill)} rg /${font} ${n(size)} Tf ${n(cos)} ${n(sin)} ${n(-sin)} ${n(cos)} ${n(x)} ${n(y)} Tm ${pdfString(item.text)} Tj ET`);
    }
  }
  return ops.join("\n");
}

/** The chart as a one-page vector PDF the size of the chart. Returned as bytes. */
export function sceneToPdf(scene: Scene): Uint8Array<ArrayBuffer> {
  const content = pdfContent(scene);
  const width = n(scene.width * PX_TO_PT);
  const height = n(scene.height * PX_TO_PT);
  const font = (name: string) => `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    font(scene.pdfFonts.regular),
    font(scene.pdfFonts.bold),
    font(scene.pdfFonts.italic),
    `<< /Title ${pdfString(scene.title)} /Subject ${pdfString(scene.description)} /Producer (ResearchKit) >>`,
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
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 8 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(body.length);
  for (let index = 0; index < body.length; index++) bytes[index] = body.charCodeAt(index);
  return bytes;
}

/** Dots per inch for PNG export, the resolution journals commonly ask for. */
export const CHART_PNG_DPI = 300;

/** A PNG's pixel size at 300 DPI, from a scene sized at 96 pixels per inch. */
export function pngPixels(scene: Pick<Scene, "width" | "height">, dpi = CHART_PNG_DPI): { width: number; height: number } {
  const scale = dpi / 96;
  return { width: Math.round(scene.width * scale), height: Math.round(scene.height * scale) };
}

/** A file name from the chart's title. */
export function chartFileName(title: string, extension: string): string {
  const base = title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
  return `${base || "chart"}.${extension}`;
}
