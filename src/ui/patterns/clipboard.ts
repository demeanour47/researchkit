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
