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
