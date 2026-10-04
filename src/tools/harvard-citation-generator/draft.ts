/**
 * The Harvard generator's example. The draft itself is shared by every citation
 * generator (src/features/citation/source-draft.ts).
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, type AuthorDraft } from "../../features/citation/author-draft";
import { blankDraft, type SourceDraft } from "../../features/citation/source-draft";

const person = (key: number, given: string, family: string): AuthorDraft => ({ ...emptyAuthor(key), given, family });

/**
 * The example: Thaker, Smith and Leiserowitz's 2020 article in Risk Analysis, the
 * journal example in the University of Cumbria's Cite Them Right quick guide, cited
 * at a page within the article. Authors take keys from firstAuthorKey upward.
 */
export function exampleDraft(firstAuthorKey: number): SourceDraft {
  return {
    ...blankDraft(firstAuthorKey),
    type: "journal-article",
    authors: [person(firstAuthorKey, "Jagadish", "Thaker"), person(firstAuthorKey + 1, "Nicholas", "Smith"), person(firstAuthorKey + 2, "Anthony", "Leiserowitz")],
    year: "2020",
    title: "Global warming risk perceptions in India",
    journal: "Risk Analysis",
    volume: "40",
    issue: "12",
    pages: "2481-2497",
    doi: "10.1111/risa.13574",
  };
}

export const EXAMPLE_LOCATOR = { kind: "page", value: "2485" } as const;
