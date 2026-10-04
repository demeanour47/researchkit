import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyAuthor } from "../../features/citation/author-draft";
import { blankDraft, toSource, type SourceDraft } from "../../features/citation/source-draft";
import { formatChicagoNotesBibliography } from "../../knowledge/citation/chicago/notes-bibliography/citation";
import type { Decision } from "../../knowledge/citation/chicago/notes-bibliography/notes";
import type { NoteLocator } from "../../knowledge/citation/chicago/notes-bibliography/request";
import { announcements, context, copySubjects, decisionText, form } from "./copy";
import { copyTexts } from "./copy-texts";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";

const citationFor = (draft: SourceDraft, locator?: NoteLocator, shortTitle?: string) =>
  formatChicagoNotesBibliography({ record: { source: toSource(draft), provenance: "user-entered" }, locator, shortTitle });

describe("load example", () => {
  it("reproduces the Chicago Manual of Style's own sample note, shortened note and bibliography entry", () => {
    const texts = copyTexts(citationFor(exampleDraft(10), EXAMPLE_LOCATOR));
    assert.equal(texts.fullNote.text, "Hyeyoung Kwon, “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life,” American Journal of Sociology 127, no. 6 (2022): 1842–43, https://doi.org/10.1086/720277.");
    assert.equal(texts.shortNote.text, "Kwon, “Inclusion Work,” 1842–43.");
    assert.equal(texts.bibliography.text, "Kwon, Hyeyoung. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127, no. 6 (2022): 1818–59. https://doi.org/10.1086/720277.");
  });
});

describe("the shared draft, as notes and bibliography use it", () => {
  it("formats a book through every output", () => {
    const draft: SourceDraft = { ...blankDraft(1), authors: [{ ...emptyAuthor(1), given: "Charles", family: "Yu" }], title: "Interior Chinatown", publisher: "Pantheon Books", year: "2020" };
    const texts = copyTexts(citationFor(draft, { kind: "page", value: "45" }));
    assert.equal(texts.fullNote.text, "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.");
    assert.equal(texts.shortNote.text, "Yu, Interior Chinatown, 45.");
    assert.equal(texts.bibliography.text, "Yu, Charles. Interior Chinatown. Pantheon Books, 2020.");
    assert.equal(texts.fullNote.html, "Charles Yu, <i>Interior Chinatown</i> (Pantheon Books, 2020), 45.");
  });

  it("uses the writer's short title", () => {
    const texts = copyTexts(citationFor(exampleDraft(1), { kind: "page", value: "1851" }, "Inclusion"));
    assert.equal(texts.shortNote.text, "Kwon, “Inclusion,” 1851.");
  });

  it("formats a web page with an access date and no date", () => {
    const draft: SourceDraft = {
      ...blankDraft(1),
      type: "webpage",
      authors: [{ ...emptyAuthor(1), kind: "organization", name: "Yale University" }],
      title: "About Yale: Yale Facts",
      siteName: "Yale University",
      url: "https://www.yale.edu/about-yale/yale-facts",
      accessedYear: "2022",
      accessedMonth: "3",
      accessedDay: "8",
    };
    const texts = copyTexts(citationFor(draft));
    assert.equal(texts.fullNote.text, "“About Yale: Yale Facts,” Yale University, accessed March 8, 2022, https://www.yale.edu/about-yale/yale-facts.");
    assert.equal(texts.bibliography.text, "Yale University. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.");
  });
});

describe("wording", () => {
  it("explains every kind of decision, each differently", () => {
    const decisions: Decision[] = [
      { code: "note-names-normal-order" }, { code: "note-et-al" }, { code: "bibliography-first-inverted" }, { code: "bibliography-authors-listed", count: 3 },
      { code: "bibliography-authors-shortened", count: 7 }, { code: "organization-author" }, { code: "title-first" }, { code: "web-note-title-first" },
      { code: "listed-under-owner" }, { code: "book-title-italic" }, { code: "article-title-quoted" }, { code: "page-title-quoted" },
      { code: "book-publication-parentheses" }, { code: "no-place-of-publication" }, { code: "edition-shown" }, { code: "first-edition-omitted" },
      { code: "journal-numbers" }, { code: "article-page-range" }, { code: "article-id" }, { code: "pages-shortened", from: "1818-1859", to: "1818–59" },
      { code: "site-name-omitted" }, { code: "access-date", text: "March 8, 2022" }, { code: "no-date" }, { code: "doi-used" }, { code: "url-left-out-for-doi" },
      { code: "url-used" }, { code: "note-locator", kind: "page" }, { code: "note-locator", kind: "chapter" }, { code: "short-note-surnames" },
      { code: "short-title", text: "Inclusion Work", method: "main-title" }, { code: "short-note-title-only" },
    ];
    const texts = decisions.map(decisionText);
    assert.equal(new Set(texts).size, texts.length);
    assert.equal(decisionText({ code: "short-title", text: "Inclusion Work", method: "main-title" }), "The shortened note uses the main title, without its subtitle: Inclusion Work.");
  });

  it("makes the citation context explicit", () => {
    assert.deepEqual(Object.keys(context.options), ["full-note", "short-note"]);
    assert.equal(context.shortTitleHint("Inclusion Work"), "Leave blank to use “Inclusion Work”.");
    assert.equal(form.pages, "Pages of the whole article");
  });

  it("announces copies, clearing, loading and updates to the chosen note", () => {
    assert.equal(announcements.copied("bibliography"), "Bibliography entry copied.");
    assert.match(announcements.copyFailed("shortNote"), /^Shortened note couldn't be copied automatically\./);
    assert.equal(announcements.noteUpdated("short-note", "Kwon, “Inclusion Work,” 1851.", 0), "Shortened note updated: Kwon, “Inclusion Work,” 1851.");
    assert.equal(announcements.noteUpdated("full-note", "X.", 2), "Full note updated: X. 2 items to check.");
  });

  it("gives each copy button a distinct accessible name", () => {
    assert.deepEqual(Object.values(copySubjects).map((subject) => `Copy ${subject}`), ["Copy full note", "Copy shortened note", "Copy bibliography entry"]);
  });
});
