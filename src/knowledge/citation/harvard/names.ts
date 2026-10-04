/**
 * Harvard author names in ResearchKit's Harvard profile, which follows Cite Them
 * Right, 13th edition (Pears and Shields, 2025), as university library guides
 * reproduce it:
 *
 *   Reference list   Surname, initials, every author listed in the order the source
 *                    gives, commas between them and "and" before the last:
 *                    Culloty, E., Murphy, P., Brereton, P., Suiter, J., Smeaton, A. and Zhang, D.
 *                    Initials take full stops and no spaces: Speight, J.G.
 *   In the text      Surnames only: one, two ("Hughes and Ali") or three
 *                    ("Lloyd, Singh and Alonso") are all named; four or more are the
 *                    first and et al. ("Gerrard et al.").
 * An organization is written in full in both places. "And" is a word, never an ampersand.
 */

import { initials } from "../source";
import type { NamedContributor } from "../source/authors";

/** How many authors a text citation names before shortening to the first and et al. */
export const MAX_TEXT_AUTHORS = 3;

/** Initials with full stops and no spaces between them: "Emily L." → "E.L.", "Jean-Paul" → "J.-P.". */
export function harvardInitials(given: string): string {
  return initials(given).replace(/\.\s+/gu, ".");
}

/** One author as the reference list writes it: "Speight, J.G.", or an organization in full. */
export function referenceName(author: NamedContributor): string {
  if (author.kind === "organization") return author.name;
  const letters = harvardInitials(author.given);
  return letters ? `${author.family}, ${letters}` : author.family;
}

/** "A", "A and B", "A, B and C": no comma before "and". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The author element of a reference, every author listed. */
export const listAuthors = (authors: readonly NamedContributor[]) => joinNames(authors.map(referenceName));

const textName = (author: NamedContributor) => (author.kind === "organization" ? author.name : author.family);

/** Names for a text citation: up to three surnames, then the first and et al. */
export function textAuthors(authors: readonly NamedContributor[]): string {
  const [first] = authors;
  if (!first) return "";
  if (authors.length > MAX_TEXT_AUTHORS) return `${textName(first)} et al.`;
  return joinNames(authors.map(textName));
}
