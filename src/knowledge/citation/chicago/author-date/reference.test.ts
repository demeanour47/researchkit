import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type Contributor, type Source } from "../../source";
import type { Decision, Note } from "./notes";
import { formatChicagoReference } from "./reference";

// Every expected string is written out by hand from Chicago author-date rules, independently of the
// code. Entries marked CMOS reproduce the Chicago Manual of Style's author-date sample citations
// (chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html).

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const text = (source: Source) => plainText(formatChicagoReference(source).runs);
const codes = (items: readonly (Note | Decision)[]) => items.map((item) => item.code);

const book = (overrides: Partial<Extract<Source, { type: "book" }>> = {}): Source => ({
  type: "book",
  authors: [person("Yu", "Charles")],
  date: { year: 2020 },
  title: "Interior Chinatown",
  publisher: "Pantheon Books",
  ...overrides,
});

const article = (overrides: Partial<Extract<Source, { type: "journal-article" }>> = {}): Source => ({
  type: "journal-article",
  authors: [person("Dittmar", "Emily L."), person("Schemske", "Douglas W.")],
  date: { year: 2023 },
  title: "Temporal Variation in Selection Influences Microgeographic Local Adaptation",
  journal: "American Naturalist",
  volume: "202",
  issue: "4",
  pages: "471-485",
  doi: "10.1086/725865",
  ...overrides,
});

const yale = (overrides: Partial<Extract<Source, { type: "webpage" }>> = {}): Source => ({
  type: "webpage",
  authors: [organization("Yale University")],
  date: {},
  title: "About Yale: Yale Facts",
  siteName: "Yale University",
  url: "https://www.yale.edu/about-yale/yale-facts",
  accessed: { year: 2022, month: 3, day: 8 },
  ...overrides,
});

describe("books", () => {
  it("one author (CMOS: Yu)", () => {
    assert.equal(text(book()), "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.");
  });

  it("italicises the title and nothing else", () => {
    assert.deepEqual(formatChicagoReference(book()).runs, [{ text: "Yu, Charles. 2020. " }, { text: "Interior Chinatown", italic: true }, { text: ". Pantheon Books." }]);
  });

  it("two authors and a long subtitle (CMOS: Binder and Kidder)", () => {
    assert.equal(
      text(book({ authors: [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")], date: { year: 2022 }, title: "The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today", publisher: "University of Chicago Press" })),
      "Binder, Amy J., and Jeffrey L. Kidder. 2022. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press.",
    );
  });

  it("an edition after the title (CMOS: Borel)", () => {
    const entry = formatChicagoReference(book({ authors: [person("Borel", "Brooke")], date: { year: 2023 }, title: "The Chicago Guide to Fact-Checking", edition: "2", publisher: "University of Chicago Press" }));
    assert.equal(plainText(entry.runs), "Borel, Brooke. 2023. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press.");
    assert.ok(codes(entry.decisions).includes("edition-shown"));
  });

  it("three authors, all listed", () => {
    assert.equal(
      text(book({ authors: [person("Smith", "Jane"), person("Jones", "John"), person("Lee", "Min-jun")], date: { year: 2024 }, title: "A Shared Book", publisher: "Example Press" })),
      "Smith, Jane, John Jones, and Min-jun Lee. 2024. A Shared Book. Example Press.",
    );
  });

  it("an organization author, kept as author even when it is also the publisher", () => {
    const entry = formatChicagoReference(book({ authors: [organization("World Health Organization")], title: "Example Report", publisher: "World Health Organization" }));
    assert.equal(plainText(entry.runs), "World Health Organization. 2020. Example Report. World Health Organization.");
    assert.ok(codes(entry.decisions).includes("organization-author"));
    assert.ok(codes(entry.notes).includes("organization-also-publisher"));
  });

  it("no author: the title first, then the year", () => {
    const entry = formatChicagoReference(book({ authors: [], title: "Guide to Field Methods", publisher: "Example Press" }));
    assert.equal(plainText(entry.runs), "Guide to Field Methods. 2020. Example Press.");
    assert.ok(codes(entry.notes).includes("no-author"));
    assert.deepEqual(entry.lead, { kind: "title", title: "Guide to Field Methods", italic: true });
  });

  it("a missing year becomes n.d., and is reported", () => {
    const entry = formatChicagoReference(book({ date: {} }));
    assert.equal(plainText(entry.runs), "Yu, Charles. n.d. Interior Chinatown. Pantheon Books.");
    assert.equal(entry.year, null);
    assert.ok(entry.notes.some((note) => note.code === "missing-year" && note.sourceType === "book"));
  });

  it("a missing publisher is left out and reported, never invented", () => {
    const entry = formatChicagoReference(book({ publisher: "" }));
    assert.equal(plainText(entry.runs), "Yu, Charles. 2020. Interior Chinatown.");
    assert.ok(codes(entry.notes).includes("missing-publisher"));
  });

  it("a DOI as a link, ending with a full stop", () => {
    assert.equal(text(book({ doi: "doi:10.1000/xyz123" })), "Yu, Charles. 2020. Interior Chinatown. Pantheon Books. https://doi.org/10.1000/xyz123.");
  });

  it("a URL in full when there is no DOI", () => {
    const entry = formatChicagoReference(book({ url: "https://press-pubs.uchicago.edu/founders/" }));
    assert.equal(plainText(entry.runs), "Yu, Charles. 2020. Interior Chinatown. Pantheon Books. https://press-pubs.uchicago.edu/founders/.");
    assert.ok(codes(entry.decisions).includes("url-used"));
  });

  it("no first edition, and a worded edition as typed", () => {
    assert.equal(text(book({ edition: "1" })), "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.");
    assert.equal(text(book({ edition: "Rev. ed." })), "Yu, Charles. 2020. Interior Chinatown. Rev. ed. Pantheon Books.");
  });

  it("a title ending in a question mark takes no extra full stop", () => {
    assert.equal(text(book({ title: "Why Read?" })), "Yu, Charles. 2020. Why Read? Pantheon Books.");
  });
});

describe("journal articles", () => {
  it("two authors, volume, issue, pages and DOI (CMOS: Dittmar and Schemske)", () => {
    assert.equal(text(article()), "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.");
  });

  it("quotes the article title and italicises only the journal", () => {
    assert.deepEqual(formatChicagoReference(article()).runs, [
      { text: "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” " },
      { text: "American Naturalist", italic: true },
      { text: " 202 (4): 471–85. https://doi.org/10.1086/725865." },
    ]);
  });

  it("one author, shortening a four-digit range (CMOS: Kwon)", () => {
    assert.equal(
      text(article({ authors: [person("Kwon", "Hyeyoung")], date: { year: 2022 }, title: "Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life", journal: "American Journal of Sociology", volume: "127", issue: "6", pages: "1818-1859", doi: "10.1086/720277" })),
      "Kwon, Hyeyoung. 2022. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127 (6): 1818–59. https://doi.org/10.1086/720277.",
    );
  });

  it("more than six authors, with an article ID in place of pages (CMOS: Snyder et al.)", () => {
    // Only the first three names are the article's; the others are placeholders, since only three appear.
    const authors = [person("Snyder", "Carl D."), person("Bedrossian", "Manuel"), person("Barr", "Casey"), person("Four", "A."), person("Five", "B."), person("Six", "C."), person("Seven", "D.")];
    const entry = formatChicagoReference(article({ authors, date: { year: 2025 }, title: "Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments", journal: "PLOS ONE", volume: "20", issue: "3", pages: "", articleNumber: "e0318239", doi: "10.1371/journal.pone.0318239" }));
    assert.equal(plainText(entry.runs), "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al. 2025. “Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments.” PLOS ONE 20 (3): e0318239. https://doi.org/10.1371/journal.pone.0318239.");
    assert.ok(entry.decisions.some((decision) => decision.code === "authors-shortened" && decision.count === 7));
    assert.ok(codes(entry.decisions).includes("article-id-for-pages"));
  });

  it("a URL when there is no DOI, and the DOI alone when both are given", () => {
    assert.ok(text(article({ doi: "", url: "https://example.org/a" })).endsWith("202 (4): 471–85. https://example.org/a."));
    const both = formatChicagoReference(article({ url: "https://example.org/a" }));
    assert.ok(!plainText(both.runs).includes("example.org"));
    assert.ok(codes(both.decisions).includes("url-left-out-for-doi"));
  });

  it("a volume without an issue", () => {
    assert.ok(text(article({ issue: "" })).includes("American Naturalist 202: 471–85."));
  });

  it("an issue without a volume, reported for checking", () => {
    const entry = formatChicagoReference(article({ volume: "" }));
    assert.ok(plainText(entry.runs).includes("American Naturalist, no. 4: 471–85."));
    assert.ok(entry.notes.some((note) => note.code === "incomplete-journal" && note.missing === "volume"));
  });

  it("missing pages, and missing numbers altogether, are reported", () => {
    const noPages = formatChicagoReference(article({ pages: "" }));
    assert.ok(plainText(noPages.runs).includes("American Naturalist 202 (4). https://doi.org"));
    assert.ok(noPages.notes.some((note) => note.code === "incomplete-journal" && note.missing === "pages"));
    const none = formatChicagoReference(article({ volume: "", issue: "", pages: "" }));
    assert.ok(plainText(none.runs).includes("American Naturalist. https://doi.org"));
    assert.ok(none.notes.some((note) => note.code === "incomplete-journal" && note.missing === "numbers"));
  });

  it("a missing journal is a visible placeholder", () => {
    const entry = formatChicagoReference(article({ journal: "" }));
    assert.ok(plainText(entry.runs).includes("[Journal] 202 (4): 471–85."));
    assert.ok(codes(entry.notes).includes("missing-journal"));
  });

  it("notes Chicago's other volume-and-issue form", () => {
    assert.ok(codes(formatChicagoReference(article()).notes).includes("journal-issue-variant"));
  });
});

describe("web pages", () => {
  it("an organization with no date: n.d. and an access date, site name not repeated (CMOS: Yale)", () => {
    const entry = formatChicagoReference(yale());
    assert.equal(plainText(entry.runs), "Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.");
    assert.ok(codes(entry.decisions).includes("site-name-omitted"));
    assert.ok(entry.decisions.some((decision) => decision.code === "access-date" && decision.text === "March 8, 2022"));
  });

  it("a dated page: the site in roman, then the month and day (after CMOS: Google)", () => {
    // CMOS writes “Effective November 15” because Google labels its date that way; the label is the page's own.
    const entry = formatChicagoReference(yale({ authors: [organization("Google")], date: { year: 2023, month: 11, day: 15 }, title: "Privacy Policy", siteName: "Privacy & Terms", url: "https://policies.google.com/privacy", accessed: undefined }));
    assert.equal(plainText(entry.runs), "Google. 2023. “Privacy Policy.” Privacy & Terms. November 15. https://policies.google.com/privacy.");
    assert.ok(codes(entry.notes).includes("web-date-label"));
    assert.ok(entry.runs.every((run) => !run.italic), "a website name is not italicised");
  });

  it("leaves out an access date when the page has a date", () => {
    const entry = formatChicagoReference(yale({ date: { year: 2021 } }));
    assert.equal(plainText(entry.runs), "Yale University. 2021. “About Yale: Yale Facts.” https://www.yale.edu/about-yale/yale-facts.");
    assert.ok(codes(entry.notes).includes("access-date-not-needed"));
  });

  it("asks for an access date when there is no date and none was given", () => {
    const entry = formatChicagoReference(yale({ accessed: undefined }));
    assert.equal(plainText(entry.runs), "Yale University. n.d. “About Yale: Yale Facts.” https://www.yale.edu/about-yale/yale-facts.");
    assert.ok(codes(entry.notes).includes("missing-access-date"));
  });

  it("a named author and a site", () => {
    assert.equal(
      text(yale({ authors: [person("Burns", "Shauntee")], date: { year: 2016, month: 3, day: 2 }, title: "Finding Wonder Women at the Library", siteName: "New York Public Library", url: "https://www.nypl.org/blog/2016/03/02/biographies-women-history", accessed: undefined })),
      "Burns, Shauntee. 2016. “Finding Wonder Women at the Library.” New York Public Library. March 2. https://www.nypl.org/blog/2016/03/02/biographies-women-history.",
    );
  });

  it("no author: the title first", () => {
    const entry = formatChicagoReference(yale({ authors: [], title: "Statistics for Water Rights", siteName: "State Water Board", url: "https://example.org/water" }));
    assert.equal(plainText(entry.runs), "“Statistics for Water Rights.” n.d. State Water Board. Accessed March 8, 2022. https://example.org/water.");
    assert.ok(codes(entry.notes).includes("no-author"));
  });

  it("gives the owner when there is no site name, and leaves out a publisher when there is", () => {
    assert.ok(text(yale({ authors: [], siteName: "", publisher: "Example Foundation" })).includes("Example Foundation. Accessed"));
    const both = formatChicagoReference(yale({ authors: [], siteName: "Example Portal", publisher: "Example Foundation" }));
    assert.ok(!plainText(both.runs).includes("Example Foundation"));
    assert.ok(codes(both.notes).includes("publisher-not-shown"));
  });

  it("keeps a long URL whole", () => {
    const url = "https://www.example.org/" + "a-very-long-path-segment-without-breaks".repeat(4) + "?query=1&more=2";
    assert.ok(text(yale({ url })).endsWith(`${url}.`));
  });

  it("reports a missing or invalid URL", () => {
    assert.ok(codes(formatChicagoReference(yale({ url: "" })).notes).includes("missing-url"));
    const invalid = formatChicagoReference(yale({ url: "yale dot edu" }));
    assert.ok(codes(invalid.notes).includes("invalid-url"));
    assert.ok(plainText(invalid.runs).endsWith("Accessed March 8, 2022."));
  });
});

describe("authors needing review", () => {
  it("leaves out an author with no family name, and reports its position", () => {
    const entry = formatChicagoReference(book({ authors: [person("Yu", "Charles"), person("", "Ann")] }));
    assert.ok(plainText(entry.runs).startsWith("Yu, Charles. 2020."));
    assert.ok(entry.notes.some((note) => note.code === "author-incomplete" && note.position === 2));
  });

  it("flags several names in one author's fields", () => {
    assert.ok(formatChicagoReference(book({ authors: [person("Smith and Jones")] })).notes.some((note) => note.code === "ambiguous-author" && note.position === 1));
  });

  it("flags editors and translators, which the model can't represent", () => {
    const entry = formatChicagoReference(book({ authors: [person("Marks", "P. J. M., ed.")] }));
    assert.ok(entry.notes.some((note) => note.code === "unsupported-contributor-role" && note.position === 1));
    assert.ok(!codes(entry.notes).includes("ambiguous-author"));
  });

  it("does not change the contributor data it was given", () => {
    const authors = [person(" Yu ", " Charles ")];
    formatChicagoReference(book({ authors }));
    assert.deepEqual(authors, [person(" Yu ", " Charles ")]);
  });
});
