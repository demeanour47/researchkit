/**
 * DOIs, web addresses, page ranges and editions, as APA 7 writes them.
 *
 * - A DOI is written as a web address, https://doi.org/ followed by the DOI,
 *   however it was entered ("doi:10…", "10…", "http://dx.doi.org/10…").
 * - Page ranges use an en dash: 436–444.
 * - Editions other than the first are shown as "2nd ed."; a first edition is not shown.
 */

const DOI_PREFIX = /^(?:https?:\/\/)?(?:dx\.|www\.)?doi\.org\/|^doi:\s*/i;
/** A DOI: "10.", a registrant code of four to nine digits, a slash, then a suffix. */
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/u;
const WEB_ADDRESS = /^https?:\/\/[^\s/?#.]+\.[^\s]+$/iu;

/** The DOI as a https://doi.org/ address, or null if the input is not a DOI. */
export function normalizeDoi(input: string): string | null {
  const doi = input.trim().replace(DOI_PREFIX, "").trim();
  return DOI_PATTERN.test(doi) ? `https://doi.org/${doi}` : null;
}

export function isWebAddress(input: string): boolean {
  return WEB_ADDRESS.test(input.trim());
}

/** Writes a page range with an en dash, whatever dash or hyphen was typed. */
export function formatPages(pages: string): string {
  return pages.trim().replace(/\s*[-‐‑‒–—]+\s*/gu, "–");
}

function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** "2" → "2nd ed."; "Rev." → "Rev. ed."; "1" or blank → null, since first editions aren't shown. */
export function editionLabel(edition: string): string | null {
  const text = edition.trim();
  if (text === "") return null;
  if (/^\d+$/u.test(text)) {
    const n = Number(text);
    return n <= 1 ? null : `${ordinal(n)} ed.`;
  }
  return /\bed\.$/u.test(text) ? text : `${text} ed.`;
}
