/**
 * Chicago author names, shared by both Chicago systems: the author-date reference
 * list and the notes-and-bibliography bibliography list authors the same way.
 *
 * From the Chicago Manual of Style, 18th ed., author-date sample citations
 * (chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html):
 *   One author        Yu, Charles.
 *   Two authors       Binder, Amy J., and Jeffrey L. Kidder.
 *   Three to six      all listed, the first inverted, "and" before the last.
 *   More than six     the first three, then et al.:
 *                     Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al.
 * In the text, one or two authors are named ("Binder and Kidder"); three or more
 * are the first author and et al. ("Snyder et al."). Given names are written as the
 * source gives them, not reduced to initials. An organization is written in full.
 */

import type { NamedContributor } from "../source/authors";

/** Which contributors can be named is shared by every style (source/authors.ts). */
export { named, type NamedContributor } from "../source/authors";

/** The most authors a reference list entry names before shortening to three and et al. */
export const MAX_LISTED_AUTHORS = 6;
/** How many authors are named before et al. when the list is shortened. */
export const LISTED_BEFORE_ET_AL = 3;

/** "Yu, Charles": the name inverted, for the first author in a list. */
const inverted = (author: NamedContributor) =>
  author.kind === "organization" ? author.name : author.given ? `${author.family}, ${author.given}` : author.family;

/** "Jeffrey L. Kidder": the name in normal order, for every later author. */
const normalOrder = (author: NamedContributor) =>
  author.kind === "organization" ? author.name : author.given ? `${author.given} ${author.family}` : author.family;

/** The surname, or an organization in full, as used in text. */
export const textName = (author: NamedContributor) => (author.kind === "organization" ? author.name : author.family);

/** The author element of a reference list or bibliography entry, without its closing full stop. */
export function listAuthors(authors: readonly NamedContributor[]): string {
  if (authors.length === 0) return "";
  const shortened = authors.length > MAX_LISTED_AUTHORS;
  const names = (shortened ? authors.slice(0, LISTED_BEFORE_ET_AL) : authors).map((author, index) => (index === 0 ? inverted(author) : normalOrder(author)));
  if (shortened) return `${names.join(", ")}, et al.`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/**
 * Names for a full note, in normal order: "Charles Yu", "Amy J. Binder and Jeffrey L.
 * Kidder", and from three authors the first and et al.: "Carl D. Snyder et al." (CMOS 18
 * notes-and-bibliography sample citations).
 */
export function noteAuthors(authors: readonly NamedContributor[]): string {
  const [first, second] = authors;
  if (!first) return "";
  if (authors.length === 1) return normalOrder(first);
  if (authors.length === 2) return `${normalOrder(first)} and ${normalOrder(second)}`;
  return `${normalOrder(first)} et al.`;
}

/** Names for a text citation or a shortened note: "Yu", "Binder and Kidder", "Snyder et al.". */
export function textAuthors(authors: readonly NamedContributor[]): string {
  const [first, second] = authors;
  if (!first) return "";
  if (authors.length === 1) return textName(first);
  if (authors.length === 2) return `${textName(first)} and ${textName(second)}`;
  return `${textName(first)} et al.`;
}
