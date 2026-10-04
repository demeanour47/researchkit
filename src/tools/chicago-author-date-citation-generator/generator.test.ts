import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyAuthor } from "../../features/citation/author-draft";
import { blankDraft, toSource, type SourceDraft } from "../../features/citation/source-draft";
import { formatChicagoAuthorDate } from "../../knowledge/citation/chicago/author-date/citation";
import type { Decision } from "../../knowledge/citation/chicago/author-date/notes";
import { announcements, authorLabels, copySubjects, decisionText, form } from "./copy";
import { copyTexts } from "./copy-texts";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";

const citationFor = (draft: SourceDraft, page?: string) =>
  formatChicagoAuthorDate({ source: toSource(draft), provenance: "user-entered" }, page ? { kind: "page", value: page } : undefined);

describe("load example", () => {
  it("reproduces the Chicago Manual of Style's own sample citation", () => {
    const texts = copyTexts(citationFor(exampleDraft(10), EXAMPLE_LOCATOR.value));
    assert.equal(texts.reference.text, "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.");
    assert.equal(texts.parenthetical.text, "(Dittmar and Schemske 2023, 480)");
    assert.equal(texts.narrative.text, "Dittmar and Schemske (2023, 480)");
  });

  it("gives every example author a fresh key", () => {
    assert.deepEqual(exampleDraft(10).authors.map((author) => [author.key, author.family]), [[10, "Dittmar"], [11, "Schemske"]]);
  });
});

describe("the shared draft, as Chicago uses it", () => {
  it("formats a web page with no date and an access date", () => {
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
    assert.equal(texts.reference.text, "Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.");
    assert.equal(texts.parenthetical.text, "(Yale University, n.d.)");
    assert.equal(texts.narrative.text, "Yale University (n.d.)");
  });

  it("ignores a journal month, since Chicago author-date journal references use the year", () => {
    const texts = copyTexts(citationFor({ ...exampleDraft(1), month: "4" }));
    assert.ok(texts.reference.text.startsWith("Dittmar, Emily L., and Douglas W. Schemske. 2023. “"));
    assert.doesNotMatch(texts.reference.text, /April/);
  });
});

describe("copy", () => {
  const texts = copyTexts(citationFor(exampleDraft(1), "480"));

  it("copies plain text without markup", () => {
    for (const { text } of Object.values(texts)) assert.doesNotMatch(text, /[<>*_]/, text);
  });

  it("keeps the journal's italics in the rich copy", () => {
    assert.ok(texts.reference.html.includes("<i>American Naturalist</i> 202 (4): 471–85."));
  });

  it("italicises a book title used in text when there is no author", () => {
    const book = copyTexts(citationFor({ ...blankDraft(1), title: "Guide to Field Methods", publisher: "Example Press", year: "2020" }, "8"));
    assert.equal(book.parenthetical.html, "(<i>Guide to Field Methods</i> 2020, 8)");
  });
});

describe("wording", () => {
  it("explains every kind of decision, each differently", () => {
    const decisions: Decision[] = [
      { code: "first-author-inverted" }, { code: "authors-listed", count: 3 }, { code: "authors-shortened", count: 7 }, { code: "organization-author" },
      { code: "title-first" }, { code: "year-after-author" }, { code: "no-date" }, { code: "book-title-italic" }, { code: "article-title-quoted" },
      { code: "page-title-quoted" }, { code: "journal-numbers" }, { code: "pages-shortened", from: "471-485", to: "471–85" }, { code: "article-id-for-pages" },
      { code: "edition-shown" }, { code: "first-edition-omitted" }, { code: "site-name-omitted" }, { code: "site-owner-used" }, { code: "web-month-day" },
      { code: "access-date", text: "March 8, 2022" }, { code: "doi-used" }, { code: "url-left-out-for-doi" }, { code: "url-used" }, { code: "text-page" },
      { code: "text-no-locator" }, { code: "text-et-al" }, { code: "text-title" }, { code: "text-no-date-comma" },
    ];
    const texts = decisions.map(decisionText);
    assert.equal(new Set(texts).size, texts.length);
    assert.equal(decisionText({ code: "pages-shortened", from: "471-485", to: "471–85" }), "The range 471-485 is written 471–85, following Chicago's rules for inclusive numbers.");
  });

  it("marks the required fields in their labels", () => {
    assert.equal(form.title, "Title (required)");
    assert.equal(form.journal, "Journal name (required)");
    assert.match(authorLabels.givenNamesHint, /As the source gives them/);
  });

  it("announces copies, clearing, loading and updates", () => {
    assert.equal(announcements.copied("reference"), "Reference copied.");
    assert.match(announcements.copyFailed("narrative"), /^Narrative citation couldn't be copied automatically\. .*Control\+C.*Command\+C/);
    assert.equal(announcements.formCleared, "Form cleared.");
    assert.equal(announcements.exampleLoaded, "Example loaded.");
    assert.equal(announcements.referenceUpdated("X.", 1), "Reference updated: X. 1 item to check.");
  });

  it("gives each copy button a distinct accessible name", () => {
    assert.deepEqual(Object.values(copySubjects).map((subject) => `Copy ${subject}`), ["Copy reference", "Copy parenthetical citation", "Copy narrative citation"]);
  });
});
