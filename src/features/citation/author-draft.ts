/**
 * An author as typed into a citation form, shared by every citation generator.
 * Converting it into the shared contributor model makes no formatting decision.
 */

// A relative import, so the test runner can load this module (see TESTING.md).
import type { Contributor } from "../../knowledge/citation/source";

export type AuthorKind = "person" | "organization";

export interface AuthorDraft {
  /** A stable identity for the author's fields, never reused within a session. */
  key: number;
  kind: AuthorKind;
  family: string;
  given: string;
  name: string;
}

export const emptyAuthor = (key: number): AuthorDraft => ({ key, kind: "person", family: "", given: "", name: "" });

/** Whether nothing has been typed for this author, whichever kind is selected. */
export const isBlankAuthor = (author: AuthorDraft) => [author.family, author.given, author.name].every((value) => value.trim() === "");

/** The author as a contributor, using the fields of the selected kind. */
export const toContributor = (author: AuthorDraft): Contributor =>
  author.kind === "person" ? { kind: "person", family: author.family, given: author.given } : { kind: "organization", name: author.name };
