/**
 * Providers give an author as one display string ("Jan H. VAN DRIEL"). Splitting it into
 * family and given names is a guess, so every split is reported for the student to check.
 */

import type { Contributor } from "../citation/source";

const PARTICLES = new Set(["van", "von", "de", "der", "den", "del", "della", "di", "da", "dos", "du", "la", "le", "ter", "bin", "ibn", "al", "el"]);

function tidyCase(token: string): string {
  if (token.length > 1 && token === token.toLocaleUpperCase("en") && /\p{L}/u.test(token)) {
    if (PARTICLES.has(token.toLocaleLowerCase("en"))) return token.toLocaleLowerCase("en");
    return token.charAt(0) + token.slice(1).toLocaleLowerCase("en");
  }
  return token;
}

export interface SplitName {
  contributor: Contributor;
  /** True when the name has more than one word, so the family and given parts were chosen by rule. */
  guessed: boolean;
}

/** Family name is the last word plus any particles before it; everything earlier is given names. */
export function splitAuthorName(display: string): SplitName | null {
  const tokens = display.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (tokens.length === 0) return null;
  if (tokens.length === 1) return { contributor: { kind: "person", family: tidyCase(tokens[0]) }, guessed: false };
  let start = tokens.length - 1;
  while (start > 1 && PARTICLES.has(tokens[start - 1].toLocaleLowerCase("en"))) start -= 1;
  const family = tokens.slice(start).map(tidyCase).join(" ");
  const given = tokens.slice(0, start).join(" ");
  return { contributor: { kind: "person", family, given }, guessed: true };
}
