/**
 * The MLA generator's form as data. The draft itself is shared by every citation
 * generator; the example is MLA's own.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, type AuthorDraft } from "../../features/citation/author-draft";
import { blankDraft, type SourceDraft } from "../../features/citation/source-draft";

export { blankDraft, isEmptyDraft, toSource, withSourceType, type SourceDraft as Draft } from "../../features/citation/source-draft";

const person = (key: number, given: string, family: string): AuthorDraft => ({ ...emptyAuthor(key), given, family });

/**
 * The example: LeCun, Bengio and Hinton's 2015 article in Nature, the same verified
 * source the APA builder uses, with its title in MLA's title case. Authors take keys
 * from firstAuthorKey upward.
 */
export function exampleDraft(firstAuthorKey: number): SourceDraft {
  return {
    ...blankDraft(firstAuthorKey),
    type: "journal-article",
    authors: [
      person(firstAuthorKey, "Yann", "LeCun"),
      person(firstAuthorKey + 1, "Yoshua", "Bengio"),
      person(firstAuthorKey + 2, "Geoffrey", "Hinton"),
    ],
    year: "2015",
    title: "Deep Learning",
    journal: "Nature",
    volume: "521",
    issue: "7553",
    pages: "436–444",
    doi: "10.1038/nature14539",
  };
}
