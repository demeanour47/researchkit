/**
 * Browser-side export: downloads, rasterising the SVG to a 300 DPI PNG, and writing
 * the figure to the clipboard. The figure itself always comes from the knowledge
 * layer's SVG and PDF writers; this file only moves bytes.
 */

import { copyText } from "@/ui";
import { pngSize, setPngDpi, PNG_DPI, type FrameworkLayout } from "@/knowledge/research";

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Draws the SVG onto a canvas at 300 DPI and returns a PNG with its resolution recorded. */
export async function svgToPng(svg: string, layout: FrameworkLayout): Promise<Blob> {
  const { width, height } = pngSize(layout);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image(layout.width, layout.height);
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding failed");
    return new Blob([setPngDpi(new Uint8Array(await blob.arrayBuffer()), PNG_DPI)], { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Copies the figure for pasting into documents: as SVG where the browser allows it,
 * as a 300 DPI PNG, and as SVG code in plain text. Falls back to the SVG code alone.
 */
export async function copyFigure(svg: string, layout: FrameworkLayout): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error("Rich clipboard unavailable");
    const supports = (type: string) => (typeof ClipboardItem.supports === "function" ? ClipboardItem.supports(type) : type !== "image/svg+xml");
    const items: Record<string, Blob | Promise<Blob>> = {
      "text/plain": new Blob([svg], { type: "text/plain" }),
      "image/png": svgToPng(svg, layout),
    };
    if (supports("image/svg+xml")) items["image/svg+xml"] = new Blob([svg], { type: "image/svg+xml" });
    await navigator.clipboard.write([new ClipboardItem(items)]);
    return true;
  } catch {
    return copyText(svg);
  }
}
