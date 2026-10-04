/**
 * Readings of a source that both Chicago systems make the same way: which authors
 * can be named and which need checking, whether a DOI or a URL locates the work, and
 * how an edition is labelled. Each system decides where and with what punctuation
 * the results appear.
 */

import { isBlank, isWebAddress, normalizeDoi, ordinal, type Contributor } from "../source";
import { named, type NamedContributor } from "./names";

export type AuthorProblem =
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "unsupported-contributor-role"; position: number };

/** A name typed in one field that looks like several names, or a name already inverted. */
const looksAmbiguous = (text: string) => /[,;&]|\s(?:and|et al\.?)\s/iu.test(` ${text} `);
/** Roles the source model can't represent: editors, translators, compilers. */
const ROLE_WORDS = /\b(?:eds?|editors?|edited by|trans|translators?|translated by|comp|compilers?)\b\.?/iu;

/** The authors that can be named, in order, and the problems found in the others. Blank entries are ignored. */
export function chicagoAuthors(contributors: readonly Contributor[]): { authors: NamedContributor[]; problems: AuthorProblem[] } {
  const authors: NamedContributor[] = [];
  const problems: AuthorProblem[] = [];
  contributors.forEach((author, index) => {
    if (isBlank(author)) return;
    const name = named(author);
    if (!name) {
      problems.push({ code: "author-incomplete", position: index + 1 });
      return;
    }
    const typed = name.kind === "person" ? `${name.family} ${name.given}` : name.name;
    if (ROLE_WORDS.test(typed)) problems.push({ code: "unsupported-contributor-role", position: index + 1 });
    else if (name.kind === "person" && looksAmbiguous(typed)) problems.push({ code: "ambiguous-author", position: index + 1 });
    authors.push(name);
  });
  return { authors, problems };
}

export const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("en") === b.trim().toLocaleLowerCase("en");

/** The single author's name, when the work has exactly one author and it is an organization. */
export function soleOrganization(authors: readonly NamedContributor[]): string | null {
  const [only] = authors;
  return authors.length === 1 && only.kind === "organization" ? only.name : null;
}

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
