/**
 * The IEEE generator's example. The draft itself is shared by every citation
 * generator (src/features/citation/source-draft.ts).
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, type AuthorDraft } from "../../features/citation/author-draft";
import { blankDraft, type SourceDraft } from "../../features/citation/source-draft";
import type { AnySourceType } from "../../knowledge/citation/source";

const person = (key: number, given: string, family: string): AuthorDraft => ({ ...emptyAuthor(key), given, family });

/**
 * The example: Sarkar and Srivastava's 2013 conference paper, an example in the IEEE
 * Reference Guide's own section on conference proceedings.
 */
export function exampleDraft(firstAuthorKey: number): SourceDraft<AnySourceType> {
  return {
    ...blankDraft(firstAuthorKey),
    type: "conference-paper",
    authors: [person(firstAuthorKey, "D.", "Sarkar"), person(firstAuthorKey + 1, "K. V.", "Srivastava")],
    year: "2013",
    title: "SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function",
    proceedings: "Proc. Int. Symp. Electromagn. Theory",
    location: "Hiroshima, Japan",
    pages: "466–469",
  };
}

/** The example's reference number. */
export const EXAMPLE_NUMBER = "1";
