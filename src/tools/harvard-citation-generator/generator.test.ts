import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyAuthor } from "../../features/citation/author-draft";
import { blankDraft, toSource, type SourceDraft } from "../../features/citation/source-draft";
import { formatHarvard } from "../../knowledge/citation/harvard/citation";
import type { Decision } from "../../knowledge/citation/harvard/notes";
import { announcements, authorLabels, copySubjects, decisionText, form, output, page } from "./copy";
import { copyTexts } from "./copy-texts";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";

const citationFor = (draft: SourceDraft, pageNumber?: string, yearLetter?: string) =>
  formatHarvard({ record: { source: toSource(draft), provenance: "user-entered" }, locator: pageNumber ? { kind: "page", value: pageNumber } : undefined, yearLetter });

describe("load example", () => {
  it("reproduces the Cite Them Right example from the University of Cumbria's guide", () => {
    const texts = copyTexts(citationFor(exampleDraft(10), EXAMPLE_LOCATOR.value));
    assert.equal(texts.reference.text, "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574");
    assert.equal(texts.parenthetical.text, "(Thaker, Smith and Leiserowitz, 2020, p. 2485)");
    assert.equal(texts.narrative.text, "Thaker, Smith and Leiserowitz (2020, p. 2485)");
  });

  it("gives every example author a fresh key", () => {
    assert.deepEqual(exampleDraft(10).authors.map((author) => [author.key, author.family]), [[10, "Thaker"], [11, "Smith"], [12, "Leiserowitz"]]);
  });
});

describe("the shared draft, as Harvard uses it", () => {
  it("formats a web page by an organization with no date, and its access date", () => {
    const draft: SourceDraft = {
      ...blankDraft(1),
      type: "webpage",
      authors: [{ ...emptyAuthor(1), kind: "organization", name: "Cool Antarctica" }],
      title: "Antarctica and global warming",
      siteName: "Cool Antarctica",
      url: "https://coolantarctica.com/",
      accessedYear: "2020",
      accessedMonth: "7",
      accessedDay: "23",
    };
    const texts = copyTexts(citationFor(draft));
    assert.equal(texts.reference.text, "Cool Antarctica (no date) Antarctica and global warming. Available at: https://coolantarctica.com/ (Accessed: 23 July 2020).");
    assert.equal(texts.parenthetical.text, "(Cool Antarctica, no date)");
    assert.equal(texts.narrative.text, "Cool Antarctica (no date)");
  });

  it("carries an access date typed for a journal article's URL", () => {
    const draft: SourceDraft = { ...exampleDraft(1), doi: "", url: "https://search.ebscohost.com/", accessedYear: "2023", accessedMonth: "7", accessedDay: "31" };
    assert.ok(copyTexts(citationFor(draft)).reference.text.endsWith("pp. 2481–2497. Available at: https://search.ebscohost.com/ (Accessed: 31 July 2023)."));
  });

  it("carries an access date typed for a book's URL", () => {
    const draft: SourceDraft = { ...blankDraft(1), authors: [{ ...emptyAuthor(1), family: "Cottrell", given: "Stella" }], year: "2019", title: "The study skills handbook", edition: "5", publisher: "Red Globe Press", url: "https://example.org/book", accessedYear: "2025", accessedMonth: "3", accessedDay: "4" };
    assert.equal(copyTexts(citationFor(draft)).reference.text, "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press. Available at: https://example.org/book (Accessed: 4 March 2025).");
  });

  it("adds no access date to a source when none was typed", () => {
    const source = toSource(exampleDraft(1));
    assert.ok(!("accessed" in source));
  });

  it("ignores a journal month, since Harvard journal references use the year", () => {
    const texts = copyTexts(citationFor({ ...exampleDraft(1), month: "12" }));
    assert.doesNotMatch(texts.reference.text, /December/);
  });

  it("adds the year letter the writer chose to every output", () => {
    const texts = copyTexts(citationFor(exampleDraft(1), "2485", "b"));
    assert.ok(texts.reference.text.startsWith("Thaker, J., Smith, N. and Leiserowitz, A. (2020b) "));
    assert.equal(texts.parenthetical.text, "(Thaker, Smith and Leiserowitz, 2020b, p. 2485)");
    assert.equal(texts.narrative.text, "Thaker, Smith and Leiserowitz (2020b, p. 2485)");
  });
});

describe("copy", () => {
  const texts = copyTexts(citationFor(exampleDraft(1), "2485"));

  it("copies plain text without markup", () => {
    for (const { text } of Object.values(texts)) assert.doesNotMatch(text, /[<>*_]/, text);
  });

  it("keeps the journal's italics in the rich copy", () => {
    assert.ok(texts.reference.html.includes("<i>Risk Analysis</i>, 40(12), pp. 2481–2497."));
  });

  it("italicises a book title used in text when there is no author", () => {
    const book = copyTexts(citationFor({ ...blankDraft(1), title: "Coastal management handbook", publisher: "Example Press", year: "2019" }, "4"));
    assert.equal(book.parenthetical.html, "(<i>Coastal management handbook</i>, 2019, p. 4)");
  });
});

describe("wording", () => {
  it("discloses the profile with the agreed notice", () => {
    assert.equal(page.profileNotice, "ResearchKit uses a defined Harvard author-date profile. Harvard referencing varies between institutions, so check your university's referencing requirements.");
    assert.match(page.metaDescription, /defined profile based on Cite Them Right/);
    assert.doesNotMatch(`${page.summary} ${page.intro} ${page.metaDescription}`, /official|universal/i);
  });

  it("names each output as the brief asks", () => {
    assert.equal(output.referenceHeading, "Harvard Reference");
    assert.equal(output.parenthetical, "Harvard Parenthetical Citation");
    assert.equal(output.narrative, "Harvard Narrative Citation");
    assert.equal(output.issuesHeading, "Validation / Notes");
  });

  it("explains every kind of decision, each differently", () => {
    const decisions: Decision[] = [
      { code: "surname-initials" }, { code: "authors-listed", count: 3 }, { code: "organization-author" }, { code: "title-first" }, { code: "year-in-brackets" },
      { code: "no-date" }, { code: "year-letter", letter: "a" }, { code: "book-title-italic" }, { code: "article-title-quoted" }, { code: "page-title-italic" },
      { code: "journal-numbers" }, { code: "single-page" }, { code: "page-range" }, { code: "article-number" }, { code: "edition-shown" }, { code: "first-edition-omitted" },
      { code: "publisher-only" }, { code: "doi-used" }, { code: "url-left-out-for-doi" }, { code: "url-used" }, { code: "access-date", text: "23 July 2020" },
      { code: "text-page" }, { code: "text-pages" }, { code: "text-no-locator" }, { code: "text-all-named", count: 3 }, { code: "text-et-al" }, { code: "text-title" },
      { code: "text-no-date" },
    ];
    const texts = decisions.map(decisionText);
    assert.equal(new Set(texts).size, texts.length);
    assert.equal(decisionText({ code: "access-date", text: "23 July 2020" }), "The date you accessed the source follows the URL: (Accessed: 23 July 2020).");
  });

  it("marks the required fields in their labels", () => {
    assert.equal(form.title, "Title (required)");
    assert.equal(form.journal, "Journal name (required)");
    assert.match(authorLabels.givenNamesHint, /Harvard uses initials/);
  });

  it("announces copies, clearing, loading and updates", () => {
    assert.equal(announcements.copied("reference"), "Reference copied.");
    assert.match(announcements.copyFailed("narrative"), /^Narrative citation couldn't be copied automatically\. .*Control\+C.*Command\+C/);
    assert.equal(announcements.formCleared, "Form cleared.");
    assert.equal(announcements.exampleLoaded, "Example loaded.");
    assert.equal(announcements.referenceUpdated("X.", 2), "Reference updated: X. 2 items to check.");
  });

  it("gives each copy button a distinct accessible name", () => {
    assert.deepEqual(Object.values(copySubjects).map((subject) => `Copy ${subject}`), ["Copy reference", "Copy parenthetical citation", "Copy narrative citation"]);
  });
});
