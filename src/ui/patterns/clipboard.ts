/** The part of the Clipboard API this module needs, so it can be replaced in tests. */
export interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

/**
 * Copies plain text with the Clipboard API. Resolves to false, rather than
 * throwing, when the API is missing or the browser refuses, so callers can offer
 * another way to copy.
 */
export async function copyText(
  text: string,
  clipboard: ClipboardWriter | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> {
  if (!clipboard || typeof clipboard.writeText !== "function") return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The part of the Clipboard API rich copying needs. */
export interface RichClipboardWriter extends ClipboardWriter {
  write?(items: ClipboardItem[]): Promise<void>;
}

/**
 * Copies formatted HTML with a plain-text alternative, so word processors paste
 * formatting and plain editors paste text. Falls back to the plain text alone when
 * rich copying isn't available. Resolves to false if nothing could be copied.
 */
export async function copyRich(
  html: string,
  text: string,
  clipboard: RichClipboardWriter | undefined = globalThis.navigator?.clipboard,
  makeItem: ((data: Record<string, Blob>) => ClipboardItem) | undefined = typeof ClipboardItem === "undefined" ? undefined : (data) => new ClipboardItem(data),
): Promise<boolean> {
  if (clipboard?.write && makeItem) {
    try {
      await clipboard.write([makeItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
      return true;
    } catch {
      // Some browsers refuse rich items; plain text below still works.
    }
  }
  return copyText(text, clipboard);
}
