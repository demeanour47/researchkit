import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type Contributor, type Source } from "../../source";
import { formatChicagoBibliography } from "./bibliography";
import { formatChicagoNotesBibliography } from "./citation";
import { formatChicagoNote } from "./note";
import type { NoteLocator, NotesBibliographyRequest } from "./request";
import { chicagoShortTitle } from "./short-title";

// Every expected string is written out by hand from Chicago notes-and-bibliography rules, independently
// of the code. Strings marked CMOS reproduce the Chicago Manual of Style's 18th-edition sample citations
// (chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html).

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const page = (value: string): NoteLocator => ({ kind: "page", value });
const range = (value: string): NoteLocator => ({ kind: "page-range", value });
const request = (source: Source, locator?: NoteLocator, shortTitle?: string): NotesBibliographyRequest => ({ record: { source, provenance: "user-entered" }, locator, shortTitle });
const full = (source: Source, locator?: NoteLocator) => plainText(formatChicagoNote(request(source, locator), "full-note").runs);
const short = (source: Source, locator?: NoteLocator, shortTitle?: string) => plainText(formatChicagoNote(request(source, locator, shortTitle), "short-note").runs);
const entry = (source: Source) => plainText(formatChicagoBibliography(source).runs);

const yu: Source = { type: "book", authors: [person("Yu", "Charles")], date: { year: 2020 }, title: "Interior Chinatown", publisher: "Pantheon Books" };
const binderKidder: Source = {
  type: "book",
  authors: [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")],
  date: { year: 2022 },
  title: "The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today",
  publisher: "University of Chicago Press",
};
const borel: Source = { type: "book", authors: [person("Borel", "Brooke")], date: { year: 2023 }, title: "The Chicago Guide to Fact-Checking", edition: "2", publisher: "University of Chicago Press" };
const kwon: Source = {
  type: "journal-article",
  authors: [person("Kwon", "Hyeyoung")],
  date: { year: 2022 },
  title: "Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life",
  journal: "American Journal of Sociology",
  volume: "127",
  issue: "6",
  pages: "1818-1859",
  doi: "10.1086/720277",
};
const dittmar: Source = {
  type: "journal-article",
  authors: [person("Dittmar", "Emily L."), person("Schemske", "Douglas W.")],
  date: { year: 2023 },
  title: "Temporal Variation in Selection Influences Microgeographic Local Adaptation",
  journal: "American Naturalist",
  volume: "202",
  issue: "4",
  pages: "471-485",
  doi: "10.1086/725865",
};
// Only the first three names are the article's; the others are placeholders, since only the first three appear.
const snyder: Source = {
  type: "journal-article",
  authors: [person("Snyder", "Carl D."), person("Bedrossian", "Manuel"), person("Barr", "Casey"), person("Four", "A."), person("Five", "B."), person("Six", "C."), person("Seven", "D.")],
  date: { year: 2025 },
  title: "Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments",
  journal: "PLOS ONE",
  volume: "20",
  issue: "3",
  articleNumber: "e0318239",
  doi: "10.1371/journal.pone.0318239",
};
const yale: Source = { type: "webpage", authors: [organization("Yale University")], date: {}, title: "About Yale: Yale Facts", siteName: "Yale University", url: "https://www.yale.edu/about-yale/yale-facts", accessed: { year: 2022, month: 3, day: 8 } };
const google: Source = { type: "webpage", authors: [organization("Google")], date: { year: 2023, month: 11, day: 15 }, title: "Privacy Policy", siteName: "Privacy & Terms", url: "https://policies.google.com/privacy" };

describe("books", () => {
  it("one author: full note, shortened note and bibliography (CMOS: Yu)", () => {
    assert.equal(full(yu, page("45")), "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.");
    assert.equal(short(yu, page("48")), "Yu, Interior Chinatown, 48.");
    assert.equal(entry(yu), "Yu, Charles. Interior Chinatown. Pantheon Books, 2020.");
  });

  it("italicises only the title", () => {
    assert.deepEqual(formatChicagoNote(request(yu, page("45")), "full-note").runs, [{ text: "Charles Yu, " }, { text: "Interior Chinatown", italic: true }, { text: " (Pantheon Books, 2020), 45." }]);
    assert.deepEqual(formatChicagoBibliography(yu).runs, [{ text: "Yu, Charles. " }, { text: "Interior Chinatown", italic: true }, { text: ". Pantheon Books, 2020." }]);
  });

  it("two authors and a subtitle, with the short title from the main title (CMOS: Binder and Kidder)", () => {
    assert.equal(full(binderKidder, range("117-118")), "Amy J. Binder and Jeffrey L. Kidder, The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today (University of Chicago Press, 2022), 117–18.");
    assert.equal(short(binderKidder, page("125")), "Binder and Kidder, Channels of Student Activism, 125.");
    assert.equal(entry(binderKidder), "Binder, Amy J., and Jeffrey L. Kidder. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press, 2022.");
  });

  it("an edition (CMOS: Borel, without its database name)", () => {
    assert.equal(full(borel, page("92")), "Brooke Borel, The Chicago Guide to Fact-Checking, 2nd ed. (University of Chicago Press, 2023), 92.");
    assert.equal(entry(borel), "Borel, Brooke. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press, 2023.");
    // CMOS shortens this title to Fact-Checking; that choice needs judgment, so the writer can give it.
    assert.equal(short(borel, range("104-105")), "Borel, Chicago Guide to Fact-Checking, 104–5.");
    assert.equal(short(borel, range("104-105"), "Fact-Checking"), "Borel, Fact-Checking, 104–5.");
  });

  it("three authors: et al. in notes, all listed in the bibliography", () => {
    const three: Source = { ...yu, authors: [person("Smith", "Jane"), person("Jones", "John"), person("Lee", "Min-jun")], title: "A Shared Book", publisher: "Example Press", date: { year: 2024 } };
    assert.equal(full(three, page("12")), "Jane Smith et al., A Shared Book (Example Press, 2024), 12.");
    assert.equal(short(three, page("14")), "Smith et al., Shared Book, 14.");
    assert.equal(entry(three), "Smith, Jane, John Jones, and Min-jun Lee. A Shared Book. Example Press, 2024.");
  });

  it("a chapter locator (CMOS: chap. 6)", () => {
    assert.equal(full(yu, { kind: "chapter", value: "6" }), "Charles Yu, Interior Chinatown (Pantheon Books, 2020), chap. 6.");
    assert.equal(short(yu, { kind: "chapter", value: "7" }), "Yu, Interior Chinatown, chap. 7.");
  });

  it("no locator", () => {
    assert.equal(full(yu), "Charles Yu, Interior Chinatown (Pantheon Books, 2020).");
    assert.equal(short(yu), "Yu, Interior Chinatown.");
  });

  it("a URL after the locator (CMOS: Kurland and Lerner pattern)", () => {
    assert.equal(full({ ...yu, url: "https://press-pubs.uchicago.edu/founders/" }, page("19")), "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 19, https://press-pubs.uchicago.edu/founders/.");
    assert.equal(entry({ ...yu, url: "https://press-pubs.uchicago.edu/founders/" }), "Yu, Charles. Interior Chinatown. Pantheon Books, 2020. https://press-pubs.uchicago.edu/founders/.");
  });

  it("an organization author", () => {
    const report: Source = { ...yu, authors: [organization("World Health Organization")], title: "Example Report", publisher: "Example Press" };
    assert.equal(full(report, page("8")), "World Health Organization, Example Report (Example Press, 2020), 8.");
    assert.equal(short(report, page("9")), "World Health Organization, Example Report, 9.");
    assert.equal(entry(report), "World Health Organization. Example Report. Example Press, 2020.");
  });

  it("no author: the title begins every form", () => {
    const anonymous: Source = { ...yu, authors: [], title: "The Guide to Field Methods", publisher: "Example Press" };
    assert.equal(full(anonymous, page("8")), "The Guide to Field Methods (Example Press, 2020), 8.");
    assert.equal(short(anonymous, page("9")), "Guide to Field Methods, 9.");
    assert.equal(entry(anonymous), "The Guide to Field Methods. Example Press, 2020.");
  });

  it("no year: n.d., and no publisher: left out and reported", () => {
    const result = formatChicagoNotesBibliography(request({ ...yu, date: {}, publisher: "" }, page("3")));
    assert.equal(plainText(result.fullNote), "Charles Yu, Interior Chinatown (n.d.), 3.");
    assert.equal(plainText(result.bibliography), "Yu, Charles. Interior Chinatown. n.d.");
    assert.ok(result.notes.some((note) => note.code === "missing-publisher"));
    assert.ok(result.notes.some((note) => note.code === "missing-year" && note.sourceType === "book"));
    assert.equal(full({ ...yu, date: {} }, page("3")), "Charles Yu, Interior Chinatown (Pantheon Books, n.d.), 3.");
  });
});

describe("journal articles", () => {
  it("the note cites a page; the bibliography gives the whole range (CMOS: Kwon)", () => {
    assert.equal(full(kwon, range("1842-1843")), "Hyeyoung Kwon, “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life,” American Journal of Sociology 127, no. 6 (2022): 1842–43, https://doi.org/10.1086/720277.");
    assert.equal(short(kwon, page("1851")), "Kwon, “Inclusion Work,” 1851.");
    assert.equal(entry(kwon), "Kwon, Hyeyoung. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127, no. 6 (2022): 1818–59. https://doi.org/10.1086/720277.");
  });

  it("italicises only the journal", () => {
    assert.deepEqual(formatChicagoBibliography(kwon).runs[1], { text: "American Journal of Sociology", italic: true });
  });

  it("two authors (CMOS: Dittmar and Schemske)", () => {
    assert.equal(full(dittmar, page("480")), "Emily L. Dittmar and Douglas W. Schemske, “Temporal Variation in Selection Influences Microgeographic Local Adaptation,” American Naturalist 202, no. 4 (2023): 480, https://doi.org/10.1086/725865.");
    assert.equal(short(dittmar, page("480"), "Temporal Variation"), "Dittmar and Schemske, “Temporal Variation,” 480.");
    assert.equal(entry(dittmar), "Dittmar, Emily L., and Douglas W. Schemske. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202, no. 4 (2023): 471–85. https://doi.org/10.1086/725865.");
  });

  it("a long title without a subtitle is kept whole and flagged for shortening", () => {
    const result = formatChicagoNotesBibliography(request(dittmar, page("480")));
    assert.equal(plainText(result.shortNote), "Dittmar and Schemske, “Temporal Variation in Selection Influences Microgeographic Local Adaptation,” 480.");
    assert.ok(result.notes.some((note) => note.code === "shorten-title"));
  });

  it("more than six authors and an article ID (CMOS: Snyder et al.)", () => {
    assert.equal(full(snyder, range("9-10")), "Carl D. Snyder et al., “Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments,” PLOS ONE 20, no. 3 (2025): 9–10, e0318239, https://doi.org/10.1371/journal.pone.0318239.");
    assert.equal(short(snyder, page("12"), "Extant Life Detection"), "Snyder et al., “Extant Life Detection,” 12.");
    assert.equal(entry(snyder), "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al. “Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments.” PLOS ONE 20, no. 3 (2025): e0318239. https://doi.org/10.1371/journal.pone.0318239.");
  });

  it("a note without a page, flagged", () => {
    const result = formatChicagoNotesBibliography(request(kwon));
    assert.equal(plainText(result.fullNote), "Hyeyoung Kwon, “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life,” American Journal of Sociology 127, no. 6 (2022), https://doi.org/10.1086/720277.");
    assert.equal(plainText(result.shortNote), "Kwon, “Inclusion Work.”");
    assert.ok(result.notes.some((note) => note.code === "article-note-without-page"));
  });

  it("a URL when there is no DOI; the DOI alone when both are given", () => {
    assert.ok(entry({ ...kwon, doi: "", url: "https://example.org/a" }).endsWith("(2022): 1818–59. https://example.org/a."));
    assert.ok(!entry({ ...kwon, url: "https://example.org/a" }).includes("example.org"));
  });

  it("missing volume, issue or pages", () => {
    assert.ok(entry({ ...kwon, issue: "" }).includes("American Journal of Sociology 127 (2022): 1818–59."));
    assert.ok(entry({ ...kwon, volume: "" }).includes("American Journal of Sociology, no. 6 (2022): 1818–59."));
    const noPages = formatChicagoNotesBibliography(request({ ...kwon, pages: "" }));
    assert.ok(plainText(noPages.bibliography).includes("127, no. 6 (2022). https://doi.org"));
    assert.ok(noPages.notes.some((note) => note.code === "incomplete-journal" && note.missing === "pages"));
  });

  it("a long page range in the bibliography, shortened by Chicago's rules", () => {
    assert.ok(entry({ ...kwon, pages: "1496-1500" }).includes("(2022): 1496–500."));
  });

  it("a title ending in a question mark keeps the comma inside the quotation marks (CMOS: Blum)", () => {
    const blum: Source = { ...kwon, authors: [person("Blum", "Dani")], title: "Are Flax Seeds All That?" };
    assert.ok(full(blum, page("2")).startsWith("Dani Blum, “Are Flax Seeds All That?,” American Journal of Sociology"));
    assert.ok(entry(blum).startsWith("Blum, Dani. “Are Flax Seeds All That?” American Journal of Sociology"));
    assert.equal(short(blum, undefined, "Flax Seeds"), "Blum, “Flax Seeds.”");
  });
});

describe("web pages", () => {
  it("an organization whose site has its name: title first, no n.d., an access date (CMOS: Yale)", () => {
    assert.equal(full(yale), "“About Yale: Yale Facts,” Yale University, accessed March 8, 2022, https://www.yale.edu/about-yale/yale-facts.");
    assert.equal(short(yale), "“About Yale: Yale Facts.”");
    assert.equal(short(yale, undefined, "Yale Facts"), "“Yale Facts.”");
    assert.equal(entry(yale), "Yale University. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.");
  });

  it("an organization named apart from its site: the site, then the owner (after CMOS: Google)", () => {
    // CMOS writes “effective November 15” because Google labels its date that way; the label is the page's own.
    assert.equal(full(google), "“Privacy Policy,” Privacy & Terms, Google, November 15, 2023, https://policies.google.com/privacy.");
    assert.equal(short(google), "Google, “Privacy Policy.”");
    assert.equal(entry(google), "Google. “Privacy Policy.” Privacy & Terms. November 15, 2023. https://policies.google.com/privacy.");
  });

  it("a named person: author first in the note, inverted in the bibliography", () => {
    const burns: Source = { type: "webpage", authors: [person("Burns", "Shauntee")], date: { year: 2016, month: 3, day: 2 }, title: "Finding Wonder Women at the Library", siteName: "New York Public Library", url: "https://www.nypl.org/blog/2016/03/02/biographies-women-history" };
    assert.equal(full(burns), "Shauntee Burns, “Finding Wonder Women at the Library,” New York Public Library, March 2, 2016, https://www.nypl.org/blog/2016/03/02/biographies-women-history.");
    assert.equal(short(burns), "Burns, “Finding Wonder Women at the Library.”");
    assert.equal(entry(burns), "Burns, Shauntee. “Finding Wonder Women at the Library.” New York Public Library. March 2, 2016. https://www.nypl.org/blog/2016/03/02/biographies-women-history.");
  });

  it("no author: listed under the owner in the bibliography, by title in notes (after CMOS: Wikimedia)", () => {
    const wiki: Source = { type: "webpage", authors: [], date: { year: 2023, month: 12, day: 19 }, title: "Wikipedia: Manual of Style", publisher: "Wikimedia Foundation", url: "https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style" };
    assert.equal(full(wiki), "“Wikipedia: Manual of Style,” Wikimedia Foundation, December 19, 2023, https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style.");
    assert.equal(short(wiki), "“Wikipedia: Manual of Style.”");
    assert.equal(entry(wiki), "Wikimedia Foundation. “Wikipedia: Manual of Style.” December 19, 2023. https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style.");
  });

  it("no author and no owner: the title throughout", () => {
    const page: Source = { type: "webpage", authors: [], date: { year: 2024 }, title: "Water Statistics", siteName: "State Water Board", url: "https://example.org/water" };
    assert.equal(full(page), "“Water Statistics,” State Water Board, 2024, https://example.org/water.");
    assert.equal(entry(page), "“Water Statistics.” State Water Board. 2024. https://example.org/water.");
  });

  it("leaves out the access date when the page has a date", () => {
    const result = formatChicagoNotesBibliography(request({ ...yale, date: { year: 2021 } }));
    assert.equal(plainText(result.bibliography), "Yale University. “About Yale: Yale Facts.” 2021. https://www.yale.edu/about-yale/yale-facts.");
    assert.ok(result.notes.some((note) => note.code === "access-date-not-needed"));
  });

  it("keeps a long URL whole", () => {
    const url = "https://www.example.org/" + "a-very-long-path-segment-without-breaks".repeat(4) + "?query=1&more=2";
    assert.ok(full({ ...yale, url }).endsWith(`, ${url}.`));
    assert.ok(entry({ ...yale, url }).endsWith(` ${url}.`));
  });
});

describe("short titles", () => {
  it("drops an initial article, and a subtitle only when the title is longer than four words (CMOS samples)", () => {
    assert.deepEqual(chicagoShortTitle("The Wedding Party"), { text: "Wedding Party", method: "article-dropped", needsJudgment: false });
    assert.equal(chicagoShortTitle("The Book by Design: The Remarkable Story of the World's Greatest Invention").text, "Book by Design");
    assert.equal(chicagoShortTitle("The Island of Bolsö: A Study of Norwegian Life").text, "Island of Bolsö");
    assert.equal(chicagoShortTitle("Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life").text, "Inclusion Work");
    assert.equal(chicagoShortTitle("Wikipedia: Manual of Style").text, "Wikipedia: Manual of Style");
    assert.deepEqual(chicagoShortTitle("Interior Chinatown"), { text: "Interior Chinatown", method: "full-title", needsJudgment: false });
  });

  it("leaves key-word choice to the writer, and uses their short title", () => {
    assert.equal(chicagoShortTitle("Are Flax Seeds All That?").needsJudgment, true);
    assert.deepEqual(chicagoShortTitle("Anything at All", "  Own Title "), { text: "Own Title", method: "custom", needsJudgment: false });
  });
});

describe("the three outputs agree", () => {
  it("share one reading of the source, and report problems once", () => {
    const result = formatChicagoNotesBibliography(request({ ...kwon, title: "" }, page("2")));
    assert.equal(result.notes.filter((note) => note.code === "missing-title").length, 1);
    assert.equal(plainText(result.shortNote), "Kwon, [Title], 2.");
  });

  it("is not author-date: the year is not after the author, and there are no parentheses around names", () => {
    for (const source of [yu, kwon, yale]) {
      const result = formatChicagoNotesBibliography(request(source, page("4")));
      const bibliography = plainText(result.bibliography);
      assert.doesNotMatch(bibliography, /^[^“]*\. \d{4}\. /, bibliography);
      assert.doesNotMatch(plainText(result.fullNote), /&|\bpp?\. /);
      assert.doesNotMatch(plainText(result.shortNote), /\d{4}/);
    }
  });
});
