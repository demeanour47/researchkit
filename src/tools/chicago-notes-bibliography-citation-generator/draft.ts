/**
 * The Chicago notes-and-bibliography generator's example. The draft itself is shared
 * by every citation generator (src/features/citation/source-draft.ts).
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor } from "../../features/citation/author-draft";
import { blankDraft, type SourceDraft } from "../../features/citation/source-draft";

/**
 * The example: Hyeyoung Kwon's 2022 article in the American Journal of Sociology,
 * the journal example in the Chicago Manual of Style's own notes-and-bibliography
 * sample citations, cited at pages 1842–43 as its sample note is.
 */
export function exampleDraft(firstAuthorKey: number): SourceDraft {
  return {
    ...blankDraft(firstAuthorKey),
    type: "journal-article",
    authors: [{ ...emptyAuthor(firstAuthorKey), given: "Hyeyoung", family: "Kwon" }],
    year: "2022",
    title: "Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life",
    journal: "American Journal of Sociology",
    volume: "127",
    issue: "6",
    pages: "1818–1859",
    doi: "10.1086/720277",
  };
}

export const EXAMPLE_LOCATOR = { kind: "page-range", value: "1842–1843" } as const;
