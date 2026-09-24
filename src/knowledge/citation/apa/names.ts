/**
 * APA 7 author names.
 *
 * - A person is written as their family name, a comma, then initials: "LeCun, Y."
 *   Hyphenated given names keep the hyphen ("J.-P."); initials are separated by
 *   spaces ("M. A."). Family names are written exactly as given, including
 *   particles such as "van der".
 * - An organization is written in full, as given.
 * - Up to 20 authors are all listed, with an ampersand before the last. From 21,
 *   the first 19 are listed, then an ellipsis, then the final author, with no
 *   ampersand. The ellipsis follows the Publication Manual's printed example as
 *   spaced full stops (". . ."); confirm at editorial review.
 */

export type Contributor =
  | { kind: "person"; family: string; given?: string }
  | { kind: "organization"; name: string };

export const MAX_LISTED_AUTHORS = 20;
export const AUTHOR_ELLIPSIS = ". . .";

const firstCharacter = (text: string) => Array.from(text)[0] ?? "";

/** "Jean-Paul Anne" → "J.-P. A."; "J.A." → "J. A."; "mary" → "M." */
export function initials(given: string): string {
  return given
    .normalize("NFC")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .filter(Boolean)
        .map((part) =>
          part
            .split(".")
            .map((piece) => piece.trim())
            .filter(Boolean)
            .map((piece) => `${firstCharacter(piece).toLocaleUpperCase("en")}.`)
            .join(" "),
        )
        .filter(Boolean)
        .join("-"),
    )
    .filter(Boolean)
    .join(" ");
}

/** The name as it appears in a reference list, or null if too incomplete to use. */
export function referenceName(contributor: Contributor): string | null {
  if (contributor.kind === "organization") return contributor.name.trim() || null;
  const family = contributor.family.trim();
  if (!family) return null;
  const given = initials(contributor.given ?? "");
  return given ? `${family}, ${given}` : family;
}

/** The name as it appears in an in-text citation: a family name, or an organization in full. */
export function citationName(contributor: Contributor): string | null {
  return contributor.kind === "organization" ? contributor.name.trim() || null : contributor.family.trim() || null;
}

/** Whether an entry has anything in it at all. Blank entries are ignored rather than reported. */
export function isBlank(contributor: Contributor): boolean {
  return contributor.kind === "organization"
    ? contributor.name.trim() === ""
    : contributor.family.trim() === "" && (contributor.given ?? "").trim() === "";
}

export function formatAuthorList(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length > MAX_LISTED_AUTHORS) {
    return `${names.slice(0, MAX_LISTED_AUTHORS - 1).join(", ")}, ${AUTHOR_ELLIPSIS} ${names[names.length - 1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}
