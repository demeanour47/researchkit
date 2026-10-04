/**
 * The people and organizations responsible for a work, as the researcher entered
 * them. Names are stored exactly as typed; each citation style decides how to write
 * them (APA uses initials, MLA uses full given names), so nothing here formats a name.
 */

export type Contributor =
  | { kind: "person"; family: string; given?: string }
  | { kind: "organization"; name: string };

/** Whether an entry has anything in it at all. Blank entries are ignored rather than reported. */
export function isBlank(contributor: Contributor): boolean {
  return contributor.kind === "organization"
    ? contributor.name.trim() === ""
    : contributor.family.trim() === "" && (contributor.given ?? "").trim() === "";
}

const firstCharacter = (text: string) => Array.from(text)[0] ?? "";

/**
 * Given names reduced to initials, as several styles write them: "Jean-Paul Anne" →
 * "J.-P. A."; "J.A." → "J. A."; "mary" → "M.". Hyphenated names keep the hyphen.
 */
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
