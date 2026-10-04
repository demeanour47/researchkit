/**
 * The Chicago author-date generator's example. The draft itself is shared by every
 * citation generator (src/features/citation/source-draft.ts).
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, type AuthorDraft } from "../../features/citation/author-draft";
import { blankDraft, type SourceDraft } from "../../features/citation/source-draft";

const person = (key: number, given: string, family: string): AuthorDraft => ({ ...emptyAuthor(key), given, family });

/**
 * The example: Dittmar and Schemske's 2023 article in the American Naturalist, the
 * journal example in the Chicago Manual of Style's own author-date sample citations,
 * cited at page 480 as the sample does. Authors take keys from firstAuthorKey upward.
 */
export function exampleDraft(firstAuthorKey: number): SourceDraft {
  return {
    ...blankDraft(firstAuthorKey),
    type: "journal-article",
    authors: [person(firstAuthorKey, "Emily L.", "Dittmar"), person(firstAuthorKey + 1, "Douglas W.", "Schemske")],
    year: "2023",
    title: "Temporal Variation in Selection Influences Microgeographic Local Adaptation",
    journal: "American Naturalist",
    volume: "202",
    issue: "4",
    pages: "471–485",
    doi: "10.1086/725865",
  };
}

export const EXAMPLE_LOCATOR = { kind: "page", value: "480" } as const;
