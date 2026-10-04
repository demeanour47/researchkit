/**
 * IEEE author names (IEEE Reference Guide, v. 3.28.2025, “Style”):
 *
 * - Given names are reduced to initials, which precede the surname: “J. K. Author”,
 *   “J.-L. Dessalles”. Names are never inverted, even the first.
 * - All authors are listed up to six: “B. Klaus and P. Horn”, “L. Li, J. Yang, and
 *   C. Li”. With more than six, the first author is followed by “et al.”:
 *   “J. Yanamadala et al.”.
 * - In the text, a citation may name the authors before its number, with “et al.” from
 *   three authors: “Smith [4]”, “Brown and Jones [5]”, “Wood et al. [7]”.
 */

import { initials, type NamedContributor } from "../source";

/** The most authors a reference lists before shortening to the first and et al. */
export const MAX_LISTED_AUTHORS = 6;

/** “J. K. Author”: initials, then the surname; an organization in full. */
export function ieeeName(author: NamedContributor): string {
  if (author.kind === "organization") return author.name;
  const given = initials(author.given);
  return given ? `${given} ${author.family}` : author.family;
}

/** The author element of a reference, without its closing punctuation. */
export function referenceAuthors(authors: readonly NamedContributor[]): string {
  if (authors.length === 0) return "";
  if (authors.length > MAX_LISTED_AUTHORS) return `${ieeeName(authors[0])} et al.`;
  const names = authors.map(ieeeName);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** Names for running text before a citation number: “Smith”, “Brown and Jones”, “Wood et al.”. */
export function textAuthors(authors: readonly NamedContributor[]): string {
  const surname = (author: NamedContributor) => (author.kind === "organization" ? author.name : author.family);
  const [first, second] = authors;
  if (!first) return "";
  if (authors.length === 1) return surname(first);
  if (authors.length === 2) return `${surname(first)} and ${surname(second)}`;
  return `${surname(first)} et al.`;
}
