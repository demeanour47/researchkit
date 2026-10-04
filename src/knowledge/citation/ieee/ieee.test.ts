import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { consecutiveRuns, parseReferenceNumbers, plainText, type AnySource, type Contributor } from "../source";
import { formatIeee } from "./citation";
import { ieeeDate } from "./dates";
import { bracketNumbers, formatMultipleCitation, formatSingleCitation } from "./in-text";
import { formatIeeeReference } from "./reference";
import type { IeeeLocator } from "./request";

// Every expected string is written out by hand from IEEE rules, independently of the code. Strings marked
// IEEE reproduce examples in the IEEE Reference Guide, v. 3.28.2025 (IEEE Publication Operations).

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const reference = (source: AnySource) => plainText(formatIeeeReference(source).runs);
const cite = (source: AnySource, number = "1", locator?: IeeeLocator) => formatIeee({ source, provenance: "user-entered", number, locator });

const klausHorn: AnySource = { type: "book", authors: [person("Klaus", "B."), person("Horn", "P.")], date: { year: 1986 }, title: "Robot Vision", place: "Cambridge, MA, USA", publisher: "MIT Press" };
const chiampi: AnySource = {
  type: "journal-article",
  authors: [person("Chiampi", "M. M."), person("Zilberti", "L. L.")],
  date: { year: 2011, month: 10 },
  title: "Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure",
  journal: "IEEE Trans. Biomed. Eng.",
  volume: "58",
  issue: "10",
  pages: "2787-2793",
  doi: "10.1109/TBME.2011.2158315",
};
const sarkar: AnySource = {
  type: "conference-paper",
  authors: [person("Sarkar", "D."), person("Srivastava", "K. V.")],
  date: { year: 2013 },
  title: "SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function",
  proceedings: "Proc. Int. Symp. Electromagn. Theory",
  location: "Hiroshima, Japan",
  pages: "466-469",
};
const smithWeb: AnySource = {
  type: "webpage",
  authors: [person("Smith", "J.")],
  date: {},
  title: "Obama inaugurated as President",
  siteName: "CNN.com",
  url: "http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html",
  accessed: { year: 2009, month: 2, day: 1 },
};

describe("books", () => {
  it("place, publisher and year (IEEE: Klaus and Horn)", () => {
    assert.equal(reference(klausHorn), "B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.");
  });

  it("italicises only the title", () => {
    assert.deepEqual(formatIeeeReference(klausHorn).runs, [{ text: "B. Klaus and P. Horn, " }, { text: "Robot Vision", italic: true }, { text: ". Cambridge, MA, USA: MIT Press, 1986." }]);
  });

  it("reduces full given names to initials, hyphens kept", () => {
    assert.ok(reference({ ...klausHorn, authors: [person("Dessalles", "Jean-Louis")] }).startsWith("J.-L. Dessalles, Robot Vision."));
  });

  it("an edition after the title", () => {
    assert.equal(reference({ ...klausHorn, authors: [person("Young", "G. O.")], title: "Plastics", edition: "2", place: "New York, NY, USA", publisher: "McGraw-Hill", date: { year: 1964 } }), "G. O. Young, Plastics, 2nd ed. New York, NY, USA: McGraw-Hill, 1964.");
  });

  it("no author and no place (IEEE: The Terahertz Wave eBook, without its access details)", () => {
    const result = formatIeeeReference({ type: "book", authors: [], date: { year: 2014 }, title: "The Terahertz Wave eBook", publisher: "ZOmega Terahertz Corp." });
    assert.equal(plainText(result.runs), "The Terahertz Wave eBook. ZOmega Terahertz Corp., 2014.");
    assert.ok(result.notes.some((note) => note.code === "missing-place"));
    assert.ok(result.notes.some((note) => note.code === "no-author"));
  });

  it("an organization author", () => {
    assert.equal(reference({ ...klausHorn, authors: [organization("Westinghouse Electric Corporation")], title: "Integrated Electronic Systems", place: "Englewood Cliffs, NJ, USA", publisher: "Prentice-Hall", date: { year: 1970 } }), "Westinghouse Electric Corporation, Integrated Electronic Systems. Englewood Cliffs, NJ, USA: Prentice-Hall, 1970.");
  });

  it("no year: (n.d.) where the date goes, between periods", () => {
    const result = formatIeeeReference({ ...klausHorn, date: {} });
    assert.equal(plainText(result.runs), "B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press. (n.d.).");
    assert.ok(result.notes.some((note) => note.code === "missing-year"));
  });

  it("a DOI, then a URL after it", () => {
    assert.equal(reference({ ...klausHorn, doi: "10.1000/xyz123", url: "https://example.org/book" }), "B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986, doi: 10.1000/xyz123. [Online]. Available: https://example.org/book");
  });
});

describe("journal articles", () => {
  it("volume, issue, pages, month, year and DOI (IEEE: Chiampi and Zilberti)", () => {
    assert.equal(reference(chiampi), "M. M. Chiampi and L. L. Zilberti, “Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure,” IEEE Trans. Biomed. Eng., vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315.");
  });

  it("quotes the title and italicises only the journal", () => {
    const runs = formatIeeeReference(chiampi).runs;
    assert.deepEqual(runs.filter((run) => run.italic).map((run) => run.text), ["IEEE Trans. Biomed. Eng."]);
  });

  it("three authors and a URL (IEEE: Risk, Kino and Shaw)", () => {
    const risk: AnySource = { type: "journal-article", authors: [person("Risk", "W. P."), person("Kino", "G. S."), person("Shaw", "H. J.")], date: { year: 1986, month: 2 }, title: "Fiber-optic frequency shifter using a surface acoustic wave incident at an oblique angle", journal: "Opt. Lett.", volume: "11", issue: "2", pages: "115-117", url: "http://ol.osa.org/abstract.cfm?URI=ol-11-2-115" };
    assert.equal(reference(risk), "W. P. Risk, G. S. Kino, and H. J. Shaw, “Fiber-optic frequency shifter using a surface acoustic wave incident at an oblique angle,” Opt. Lett., vol. 11, no. 2, pp. 115–117, Feb. 1986. [Online]. Available: http://ol.osa.org/abstract.cfm?URI=ol-11-2-115");
  });

  it("an article number after the date (IEEE: Zhang and Tansu)", () => {
    const zhang: AnySource = { type: "journal-article", authors: [person("Zhang", "J."), person("Tansu", "N.")], date: { year: 2013, month: 4 }, title: "Optical gain and laser characteristics of InGaN quantum wells on ternary InGaN substrates", journal: "IEEE Photon. J.", volume: "5", issue: "2", articleNumber: "2600111" };
    assert.equal(reference(zhang), "J. Zhang and N. Tansu, “Optical gain and laser characteristics of InGaN quantum wells on ternary InGaN substrates,” IEEE Photon. J., vol. 5, no. 2, Apr. 2013, Art. no. 2600111.");
  });

  it("more than six authors: the first and et al.", () => {
    const authors = ["Ito:M.", "Two:A.", "Three:B.", "Four:C.", "Five:D.", "Six:E.", "Seven:F."].map((entry) => person(...(entry.split(":") as [string, string])));
    assert.ok(reference({ ...chiampi, authors }).startsWith("M. Ito et al., “Induction"));
    const six = reference({ ...chiampi, authors: authors.slice(0, 6) });
    assert.ok(six.startsWith("M. Ito, A. Two, B. Three, C. Four, D. Five, and E. Six, “"), six);
  });

  it("a question mark keeps the comma inside the quotation marks (IEEE: Ito et al.)", () => {
    assert.ok(reference({ ...chiampi, title: "Can the application of amorphous oxide TFT be an electrophoretic display?" }).includes("“Can the application of amorphous oxide TFT be an electrophoretic display?,” IEEE"));
  });

  it("a single page with p., and missing details reported", () => {
    const result = formatIeeeReference({ ...chiampi, issue: "", pages: "475", doi: "" });
    assert.ok(plainText(result.runs).endsWith("vol. 58, p. 475, Oct. 2011."));
    assert.ok(result.notes.some((note) => note.code === "incomplete-journal" && note.missing === "issue"));
    const none = formatIeeeReference({ ...chiampi, volume: "", issue: "", pages: "" });
    assert.ok(none.notes.some((note) => note.code === "incomplete-journal" && note.missing === "pages"));
    assert.ok(none.notes.some((note) => note.code === "abbreviation-not-applied"));
  });
});

describe("conference papers", () => {
  it("proceedings, location, year and pages (IEEE: Sarkar and Srivastava)", () => {
    assert.equal(reference(sarkar), "D. Sarkar and K. V. Srivastava, “SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function,” in Proc. Int. Symp. Electromagn. Theory, Hiroshima, Japan, 2013, pp. 466–469.");
  });

  it("italicises the proceedings", () => {
    assert.deepEqual(formatIeeeReference(sarkar).runs.filter((run) => run.italic).map((run) => run.text), ["Proc. Int. Symp. Electromagn. Theory"]);
  });

  it("a DOI and no location, reported (IEEE: Veruggio)", () => {
    const result = formatIeeeReference({ type: "conference-paper", authors: [person("Veruggio", "G.")], date: { year: 2006 }, title: "The EURON roboethics roadmap", proceedings: "Proc. Humanoids ’06: 6th IEEE-RAS Int. Conf. Humanoid Robots", pages: "612-617", doi: "10.1109/ICHR.2006.321337" });
    assert.equal(plainText(result.runs), "G. Veruggio, “The EURON roboethics roadmap,” in Proc. Humanoids ’06: 6th IEEE-RAS Int. Conf. Humanoid Robots, 2006, pp. 612–617, doi: 10.1109/ICHR.2006.321337.");
    assert.ok(result.notes.some((note) => note.code === "incomplete-conference" && note.missing === "location"));
  });

  it("a month, more than six authors and a URL, with missing pages reported (IEEE: Yanamadala et al.)", () => {
    const authors = ["Yanamadala:J.", "Two:A.", "Three:B.", "Four:C.", "Five:D.", "Six:E.", "Seven:F."].map((entry) => person(...(entry.split(":") as [string, string])));
    const result = formatIeeeReference({ type: "conference-paper", authors, date: { year: 2014, month: 10 }, title: "Segmentation of the visible human project (VHP) female cryosection images within MATLAB environment", proceedings: "Proc. 23rd Int. Meshing Roundtable", location: "London, U.K.", url: "https://feup.libguides.com/ieee/comunicacoes" });
    assert.equal(plainText(result.runs), "J. Yanamadala et al., “Segmentation of the visible human project (VHP) female cryosection images within MATLAB environment,” in Proc. 23rd Int. Meshing Roundtable, London, U.K., Oct. 2014. [Online]. Available: https://feup.libguides.com/ieee/comunicacoes");
    assert.ok(result.notes.some((note) => note.code === "incomplete-conference" && note.missing === "pages"));
  });

  it("missing proceedings is an error-level note with a placeholder", () => {
    const result = formatIeeeReference({ ...sarkar, proceedings: "" } as AnySource);
    assert.ok(plainText(result.runs).includes("in [Proceedings], Hiroshima"));
    assert.ok(result.notes.some((note) => note.code === "missing-proceedings"));
  });
});

describe("web pages", () => {
  it("elements separated by periods, an access date, then the URL with no period (IEEE: Smith)", () => {
    assert.equal(reference(smithWeb), "J. Smith. “Obama inaugurated as President.” CNN.com. Accessed: Feb. 1, 2009. [Online]. Available: http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html");
  });

  it("two authors (IEEE: Smith and Doe)", () => {
    assert.ok(reference({ ...smithWeb, authors: [person("Smith", "J."), person("Doe", "J.")] }).startsWith("J. Smith and J. Doe. “Obama inaugurated as President.” CNN.com."));
  });

  it("an organization author, and no author", () => {
    assert.ok(reference({ ...smithWeb, authors: [organization("Google")] }).startsWith("Google. “Obama"));
    const anonymous = formatIeeeReference({ ...smithWeb, authors: [] });
    assert.ok(plainText(anonymous.runs).startsWith("“Obama inaugurated as President.” CNN.com. Accessed:"));
  });

  it("the publication date only when there is no access date, and (n.d.) with neither", () => {
    const published = formatIeeeReference({ ...smithWeb, accessed: undefined, date: { year: 2009, month: 1, day: 21 } });
    assert.ok(plainText(published.runs).includes("CNN.com. Jan. 21, 2009. [Online]."));
    assert.ok(published.notes.some((note) => note.code === "missing-access-date"));
    assert.ok(reference({ ...smithWeb, accessed: undefined }).includes("CNN.com. (n.d.). [Online]."));
    assert.ok(formatIeeeReference({ ...smithWeb, date: { year: 2009 } }).notes.some((note) => note.code === "publication-date-not-shown"));
  });

  it("keeps a long URL whole, and reports a missing site or URL", () => {
    const url = "https://www.example.org/" + "a-very-long-path-segment-without-breaks".repeat(4);
    assert.ok(reference({ ...smithWeb, url }).endsWith(`Available: ${url}`));
    const bare = formatIeeeReference({ ...smithWeb, siteName: "", url: "" });
    assert.equal(plainText(bare.runs), "J. Smith. “Obama inaugurated as President.” Accessed: Feb. 1, 2009.");
    assert.ok(bare.notes.some((note) => note.code === "missing-site-name"));
    assert.ok(bare.notes.some((note) => note.code === "missing-url"));
  });
});

describe("dates", () => {
  it("abbreviates months as IEEE does", () => {
    assert.equal(ieeeDate({ year: 2023, month: 6, day: 23 }).text, "Jun. 23, 2023");
    assert.equal(ieeeDate({ year: 2011, month: 9 }).text, "Sep. 2011");
    assert.equal(ieeeDate({ year: 1994, month: 5 }).text, "May 1994");
    assert.deepEqual(ieeeDate({ year: 2023, month: 2, day: 30 }), { text: "Feb. 2023", problem: "invalid-date" });
  });
});

describe("reference numbers", () => {
  it("reads lists and ranges without correcting them", () => {
    assert.deepEqual(parseReferenceNumbers("1, 3, 7"), { numbers: [1, 3, 7], problems: [] });
    assert.deepEqual(parseReferenceNumbers("2 4-7 9").numbers, [2, 4, 5, 6, 7, 9]);
    assert.deepEqual(parseReferenceNumbers("3, 1"), { numbers: [3, 1], problems: [{ code: "not-ascending" }] });
  });

  it("rejects zero, negatives, non-numbers, malformed ranges and repeats", () => {
    assert.deepEqual(parseReferenceNumbers("0").problems, [{ code: "not-positive", value: "0" }]);
    assert.deepEqual(parseReferenceNumbers("-1").problems, [{ code: "not-positive", value: "-1" }]);
    assert.deepEqual(parseReferenceNumbers("abc").problems, [{ code: "not-a-number", value: "abc" }]);
    assert.deepEqual(parseReferenceNumbers("1.5").problems, [{ code: "not-a-number", value: "1.5" }]);
    assert.deepEqual(parseReferenceNumbers("7-3").problems, [{ code: "malformed-range", value: "7-3" }]);
    assert.deepEqual(parseReferenceNumbers("1, 2, 2").problems, [{ code: "duplicate-number", value: 2 }]);
    assert.deepEqual(parseReferenceNumbers("1-3, 2").numbers, []);
    assert.deepEqual(parseReferenceNumbers("  ").problems, [{ code: "no-numbers" }]);
  });

  it("finds consecutive runs", () => {
    assert.deepEqual(consecutiveRuns([2, 4, 5, 6, 7, 9]), [[2], [4, 5, 6, 7], [9]]);
  });
});

describe("citations in the text", () => {
  it("one reference: [1]", () => {
    assert.equal(plainText(formatSingleCitation("1").runs ?? []), "[1]");
  });

  it("several references written out, as the current guide does (IEEE: [2], [4], [5], [6], [7], [9])", () => {
    assert.equal(plainText(formatMultipleCitation("2, 4-7, 9", "written-out").runs ?? []), "[2], [4], [5], [6], [7], [9]");
    assert.equal(plainText(formatMultipleCitation("1, 3", "written-out").runs ?? []), "[1], [3]");
    assert.equal(plainText(formatMultipleCitation("1, 2, 3, 4", "written-out").runs ?? []), "[1], [2], [3], [4]");
  });

  it("the earlier en-dash form, on request, for runs of three or more (IEEE 2018: [2], [4]–[7], [9])", () => {
    const result = formatMultipleCitation("2, 4, 5, 6, 7, 9", "en-dash");
    assert.equal(plainText(result.runs ?? []), "[2], [4]–[7], [9]");
    assert.ok(result.notes.some((note) => note.code === "en-dash-ranges-variant"));
    assert.equal(bracketNumbers([1, 2, 3, 4], "en-dash"), "[1]–[4]");
    assert.equal(bracketNumbers([4, 5], "en-dash"), "[4], [5]");
  });

  it("locators inside the brackets (IEEE: [3, pp. 5–10], [3, Ch. 2], [3, Sect. 4.5])", () => {
    assert.equal(plainText(formatSingleCitation("3", { kind: "page-range", value: "5-10" }).runs ?? []), "[3, pp. 5–10]");
    assert.equal(plainText(formatSingleCitation("3", { kind: "page", value: "24" }).runs ?? []), "[3, p. 24]");
    assert.equal(plainText(formatSingleCitation("3", { kind: "chapter", value: "2" }).runs ?? []), "[3, Ch. 2]");
    assert.equal(plainText(formatSingleCitation("3", { kind: "section", value: "4.5" }).runs ?? []), "[3, Sect. 4.5]");
  });

  it("reports unsupported, incomplete and empty locators", () => {
    const paragraph = formatSingleCitation("3", { kind: "paragraph", value: "2" });
    assert.equal(plainText(paragraph.runs ?? []), "[3]");
    assert.ok(paragraph.notes.some((note) => note.code === "unsupported-locator"));
    assert.ok(formatSingleCitation("3", { kind: "page-range", value: "5" }).notes.some((note) => note.code === "incomplete-locator"));
    assert.ok(formatSingleCitation("3", { kind: "page", value: "" }).notes.some((note) => note.code === "missing-locator-value"));
    assert.ok(formatMultipleCitation("1, 2", "written-out", { kind: "page", value: "4" }).notes.some((note) => note.code === "locator-with-several-numbers"));
  });

  it("invalid numbers produce no citation and an error note", () => {
    for (const typed of ["0", "-1", "abc", "1, 2", ""]) {
      const result = formatSingleCitation(typed);
      assert.equal(result.runs, null, typed);
      assert.ok(result.notes.some((note) => note.code === "invalid-reference-number"), typed);
    }
    const duplicate = formatMultipleCitation("1, 1", "written-out");
    assert.equal(duplicate.runs, null);
  });

  it("keeps a non-ascending list in the order typed, and says so", () => {
    const result = formatMultipleCitation("3, 1", "written-out");
    assert.equal(plainText(result.runs ?? []), "[3], [1]");
    assert.ok(result.notes.some((note) => note.code === "numbers-not-ascending"));
  });
});

describe("one source, numbered", () => {
  it("the number links the entry and the citations", () => {
    const result = cite(klausHorn, "4", { kind: "page", value: "12" });
    assert.equal(result.number, 4);
    assert.equal(plainText(result.entry ?? []), "[4] B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.");
    assert.equal(plainText(result.citation ?? []), "[4, p. 12]");
    assert.equal(plainText(result.namedCitation ?? []), "Klaus and Horn [4, p. 12]");
    assert.ok(result.notes.some((note) => note.code === "citation-order"));
  });

  it("names three or more authors as the first and et al. (IEEE: Wood et al. [7])", () => {
    const result = cite({ ...klausHorn, authors: [person("Wood", "A."), person("Two", "B."), person("Three", "C.")] }, "7");
    assert.equal(plainText(result.namedCitation ?? []), "Wood et al. [7]");
  });

  it("without a valid number, the reference is formatted but not numbered", () => {
    const result = cite(klausHorn, "0");
    assert.equal(result.entry, null);
    assert.equal(result.citation, null);
    assert.ok(plainText(result.reference).startsWith("B. Klaus"));
  });

  it("the number is never part of the source", () => {
    const source = { ...klausHorn };
    cite(source, "9");
    assert.deepEqual(Object.keys(source).sort(), Object.keys(klausHorn).sort());
  });

  it("is not APA, MLA or Chicago: no author-year citations, no ampersands, no inverted first name", () => {
    for (const source of [klausHorn, chiampi, sarkar, smithWeb]) {
      const result = cite(source, "2", { kind: "page", value: "5" });
      const all = [result.entry, result.citation, result.namedCitation].map((runs) => plainText(runs ?? [])).join(" ");
      assert.doesNotMatch(all, /&|\(\w+,? \d{4}|\b\d{4}, \d+\)/, all);
      assert.doesNotMatch(plainText(result.entry ?? []), /^\[2\] \w+, [A-Z]\./, "the first author is not inverted");
    }
  });
});
