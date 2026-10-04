/**
 * DOIs, web addresses, page ranges and ordinal numbers: checks and normalisations
 * every citation style shares. How a style then writes them (a DOI as a link, a URL
 * with or without its protocol, a shortened page range) belongs to the style.
 *
 * - A DOI is recognised however it was entered ("doi:10…", "10…", "http://dx.doi.org/10…")
 *   and normalised to its https://doi.org/ address, the form DOI registration
 *   agencies display.
 * - Page ranges use an en dash: 436–444.
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

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ordinal(n: number): string {
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
