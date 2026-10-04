/**
 * Readings of a source that both Chicago systems make the same way: which authors
 * can be named and which need checking, whether a DOI or a URL locates the work, and
 * how an edition is labelled. Each system decides where and with what punctuation
 * the results appear.
 */

import { isWebAddress, normalizeDoi, ordinal } from "../source";

/** Author analysis and name comparison are shared by every style (source/authors.ts). */
export { nameableAuthors as chicagoAuthors, sameName, soleOrganization, type AuthorProblem } from "../source/authors";

export interface ChicagoLocation {
  /** The DOI link or URL to give, or null when neither is valid. */
  location: { kind: "doi" | "url"; text: string } | null;
  /** True when a URL was given but left out because a DOI was used. */
  urlLeftOut: boolean;
  problems: ("invalid-doi" | "invalid-url")[];
}

/** A DOI as a https://doi.org/ link if valid, otherwise a URL in full if valid (CMOS 13.7). */
export function chicagoLocation(doi: string | undefined, url: string | undefined): ChicagoLocation {
  const typedUrl = (url ?? "").trim();
  const problems: ChicagoLocation["problems"] = [];
  if (doi && doi.trim()) {
    const normalized = normalizeDoi(doi);
    if (normalized) return { location: { kind: "doi", text: normalized }, urlLeftOut: typedUrl !== "", problems };
    problems.push("invalid-doi");
  }
  if (!typedUrl) return { location: null, urlLeftOut: false, problems };
  if (!isWebAddress(typedUrl)) return { location: null, urlLeftOut: false, problems: [...problems, "invalid-url"] };
  return { location: { kind: "url", text: typedUrl }, urlLeftOut: false, problems };
}

export type ChicagoEdition =
  | { kind: "none" }
  | { kind: "first"; label: null }
  | { kind: "numbered"; label: string }
  | { kind: "as-typed"; label: string };

/** "2" → "2nd ed."; "1" isn't shown; other wording is kept as typed. */
export function chicagoEdition(edition: string | undefined): ChicagoEdition {
  const text = (edition ?? "").trim();
  if (!text) return { kind: "none" };
  if (/^\d+$/u.test(text)) return Number(text) > 1 ? { kind: "numbered", label: `${ordinal(Number(text))} ed.` } : { kind: "first", label: null };
  return { kind: "as-typed", label: text };
}
