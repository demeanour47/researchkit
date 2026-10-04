/**
 * DOIs, web addresses, page ranges and editions, as APA 7 writes them. DOI and URL
 * checks and page-range dashes are shared by every style (ADR-0006) and re-exported here.
 *
 * - A DOI is written as a web address, https://doi.org/ followed by the DOI,
 *   however it was entered ("doi:10…", "10…", "http://dx.doi.org/10…").
 * - Page ranges use an en dash: 436–444.
 * - Editions other than the first are shown as "2nd ed."; a first edition is not shown.
 */

import { ordinal } from "../source/identifiers";

export { formatPages, isWebAddress, normalizeDoi } from "../source/identifiers";

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
