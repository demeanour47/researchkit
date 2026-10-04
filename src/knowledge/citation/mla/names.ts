/**
 * MLA 9 author names.
 *
 * Works-cited list (MLA Style Center: style.mla.org/inverted-names-in-entries/,
 * style.mla.org/comma-with-and-for-coauthors/, style.mla.org/commas-with-et-al/):
 *   One author      Smith, Jane.
 *   Two authors     Dorris, Michael, and Louise Erdrich.
 *   Three or more   Burdick, Anne, et al.
 * Only the first name is inverted, because the list is alphabetised by it. Given names
 * are written as the researcher entered them; MLA does not reduce them to initials. A
 * comma comes before "et al." only when the name before it is inverted.
 *
 * In text, the parenthetical citation names (Smith), (Smith and Jones) or (Smith et al.).
 * In prose, et al. is not used: a work by three or more authors is "Smith and others"
 * (style.mla.org, "When a work by three or more authors is mentioned in the text…").
 * A person's full name is given at first mention in prose and the surname afterwards
 * (style.mla.org/introducing-name-of-person/).
 */

import type { Contributor } from "../source";

/** Contributors with enough information to name. */
export type NamedContributor =
  | { kind: "person"; family: string; given: string }
  | { kind: "organization"; name: string };

/** The contributor with whitespace trimmed, or null if it has no family name or organization name. */
export function named(contributor: Contributor): NamedContributor | null {
  if (contributor.kind === "organization") {
    const name = contributor.name.trim();
    return name ? { kind: "organization", name } : null;
  }
  const family = contributor.family.trim();
  return family ? { kind: "person", family, given: (contributor.given ?? "").trim() } : null;
}

/** "Smith, Jane" for a person with a given name; otherwise the name as it stands. */
const inverted = (author: NamedContributor) =>
  author.kind === "organization" ? author.name : author.given ? `${author.family}, ${author.given}` : author.family;

/** "Jane Smith": the name in normal order. */
const fullName = (author: NamedContributor) =>
  author.kind === "organization" ? author.name : author.given ? `${author.given} ${author.family}` : author.family;

/** The surname, or an organization in full. */
const shortName = (author: NamedContributor) => (author.kind === "organization" ? author.name : author.family);

const isInverted = (author: NamedContributor) => author.kind === "person" && author.given !== "";

/** The author element of a works-cited entry, without its closing full stop. */
export function worksCitedAuthors(authors: readonly NamedContributor[]): string {
  const [first, second] = authors;
  if (!first) return "";
  if (authors.length === 1) return inverted(first);
  // The comma closes the inverted name, so it is used only when the first name is inverted.
  const comma = isInverted(first) ? "," : "";
  if (authors.length === 2) return `${inverted(first)}${comma} and ${fullName(second)}`;
  return `${inverted(first)}${comma} et al.`;
}

/** Names for a parenthetical citation: "Smith", "Smith and Jones", "Smith et al.". */
export function parentheticalAuthors(authors: readonly NamedContributor[]): string {
  const [first, second] = authors;
  if (!first) return "";
  if (authors.length === 1) return shortName(first);
  if (authors.length === 2) return `${shortName(first)} and ${shortName(second)}`;
  return `${shortName(first)} et al.`;
}

/** Names for running text: at first mention in full, afterwards by surname. Never et al. */
export function proseAuthors(authors: readonly NamedContributor[]): { first: string; later: string } {
  const [lead, second] = authors;
  if (!lead) return { first: "", later: "" };
  if (authors.length === 1) return { first: fullName(lead), later: shortName(lead) };
  if (authors.length === 2) return { first: `${fullName(lead)} and ${fullName(second)}`, later: `${shortName(lead)} and ${shortName(second)}` };
  return { first: `${fullName(lead)} and others`, later: `${shortName(lead)} and others` };
}
