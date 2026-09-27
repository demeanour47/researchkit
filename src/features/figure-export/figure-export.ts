/**
 * Browser-side figure export, shared by the tools that draw figures: downloads,
 * rasterising an SVG to a high-resolution PNG, and writing a figure to the clipboard.
 * Figures always come from the knowledge layer's SVG and PDF writers; this file only
 * moves bytes.
 */

import { copyText } from "@/ui";
import { PNG_DPI, setPngDpi } from "@/knowledge/research";

export interface PixelSize {
  width: number;
  height: number;
}

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

/** Draws an SVG of the given size onto a canvas of the given pixel size, and returns a PNG with its resolution recorded (300 DPI unless stated). */
export async function svgToPng(svg: string, size: PixelSize, pixels: PixelSize, dpi = PNG_DPI): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image(size.width, size.height);
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0, pixels.width, pixels.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding failed");
    return new Blob([setPngDpi(new Uint8Array(await blob.arrayBuffer()), dpi)], { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Copies a figure for pasting into documents: as SVG where the browser allows it,
 * as a high-resolution PNG, and as SVG code in plain text. Falls back to the SVG code alone.
 */
export async function copyFigure(svg: string, size: PixelSize, pixels: PixelSize): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error("Rich clipboard unavailable");
    const supports = (type: string) => (typeof ClipboardItem.supports === "function" ? ClipboardItem.supports(type) : type !== "image/svg+xml");
    const items: Record<string, Blob | Promise<Blob>> = {
      "text/plain": new Blob([svg], { type: "text/plain" }),
      "image/png": svgToPng(svg, size, pixels),
    };
    if (supports("image/svg+xml")) items["image/svg+xml"] = new Blob([svg], { type: "image/svg+xml" });
    await navigator.clipboard.write([new ClipboardItem(items)]);
    return true;
  } catch {
    return copyText(svg);
  }
}
