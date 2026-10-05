/** Web addresses from providers are untrusted. Only plain http(s) addresses are ever shown as links. */

import { isWebAddress, normalizeDoi } from "../citation/source";

/** The address if it is a plain http or https address without credentials, else undefined. */
export function safeWebUrl(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const text = input.trim();
  if (text.length === 0 || text.length > 2048 || !isWebAddress(text)) return undefined;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.username !== "" || url.password !== "") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const DOI_URL = "https://doi.org/";

/** The bare DOI ("10.1000/abc") from any DOI form, or undefined. Uses the shared normaliser. */
export function bareDoi(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const normalized = normalizeDoi(input);
  return normalized === null ? undefined : normalized.slice(DOI_URL.length);
}

/** The https://doi.org/ address of a bare DOI. */
export function doiUrl(doi: string): string {
  return `${DOI_URL}${doi}`;
}
