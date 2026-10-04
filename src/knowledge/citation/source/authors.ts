/**
 * Which of a source's contributors can be named in a citation, and which need the
 * researcher's attention. Every style writes names its own way; this only decides
 * what there is to write.
 */

import { isBlank, type Contributor } from "./contributor";

/** A contributor with enough information to name. */
export type NamedContributor =
  | { kind: "person"; family: string; given: string }
  | { kind: "organization"; name: string };

export type AuthorProblem =
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "unsupported-contributor-role"; position: number };

/** The contributor with whitespace trimmed, or null if it has no family name or organization name. */
export function named(contributor: Contributor): NamedContributor | null {
  if (contributor.kind === "organization") {
    const name = contributor.name.trim();
    return name ? { kind: "organization", name } : null;
  }
  const family = contributor.family.trim();
  return family ? { kind: "person", family, given: (contributor.given ?? "").trim() } : null;
}

/** A name typed in one field that looks like several names, or a name already inverted. */
const looksAmbiguous = (text: string) => /[,;&]|\s(?:and|et al\.?)\s/iu.test(` ${text} `);
/** Roles the source model can't represent: editors, translators, compilers. */
const ROLE_WORDS = /\b(?:eds?|editors?|edited by|trans|translators?|translated by|comp|compilers?)\b\.?/iu;

/** The authors that can be named, in order, and the problems found in the others. Blank entries are ignored. */
export function nameableAuthors(contributors: readonly Contributor[]): { authors: NamedContributor[]; problems: AuthorProblem[] } {
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

/** The single author's name, when the work has exactly one author and it is an organization. */
export function soleOrganization(authors: readonly NamedContributor[]): string | null {
  const [only] = authors;
  return authors.length === 1 && only.kind === "organization" ? only.name : null;
}

export const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("en") === b.trim().toLocaleLowerCase("en");
