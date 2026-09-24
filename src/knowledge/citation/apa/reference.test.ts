import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Contributor } from "./names";
import { formatCitation, type Note, type Source } from "./reference";
import { plainText } from "./runs";

// Every expected string is written out by hand from APA 7 rules, independently of the code.

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const codes = (notes: readonly Note[]) => notes.map((note) => note.code);

const lecun: Source = {
  type: "journal-article",
  authors: [person("LeCun", "Yann"), person("Bengio", "Yoshua"), person("Hinton", "Geoffrey")],
  date: { year: 2015 },
  title: "Deep learning",
  journal: "Nature",
  volume: "521",
  issue: "7553",
  pages: "436-444",
  doi: "10.1038/nature14539",
};

describe("journal articles", () => {
  it("formats a complete article with a DOI", () => {
    const citation = formatCitation(lecun);
    assert.equal(
      plainText(citation.reference),
      "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436–444. https://doi.org/10.1038/nature14539",
    );
  });

  it("italicises only the journal name and volume", () => {
    assert.deepEqual(formatCitation(lecun).reference, [
      { text: "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. " },
      { text: "Nature", italic: true },
      { text: ", " },
      { text: "521", italic: true },
      { text: "(7553), 436–444. https://doi.org/10.1038/nature14539" },
    ]);
  });

  it("uses et al. in text from three authors", () => {
    const citation = formatCitation(lecun);
    assert.equal(plainText(citation.parenthetical), "(LeCun et al., 2015)");
    assert.equal(plainText(citation.narrative), "LeCun et al. (2015)");
  });

  it("uses an article number when there are no pages, and a URL when there is no DOI", () => {
    const citation = formatCitation({
      type: "journal-article",
      authors: [person("Smith", "Jane")],
      date: { year: 2021 },
      title: "Measuring reading speed",
      journal: "Journal of Reading Research",
      volume: "7",
      articleNumber: "45",
      url: "https://example.org/article/45",
    });
    assert.equal(
      plainText(citation.reference),
      "Smith, J. (2021). Measuring reading speed. Journal of Reading Research, 7, Article 45. https://example.org/article/45",
    );
  });

  it("ends with the pages when there is neither DOI nor URL", () => {
    const citation = formatCitation({
      type: "journal-article",
      authors: [person("Smith", "Jane")],
      date: { year: 2021 },
      title: "Measuring reading speed",
      journal: "Journal of Reading Research",
      volume: "7",
      issue: "2",
      pages: "1-10",
    });
    assert.equal(
      plainText(citation.reference),
      "Smith, J. (2021). Measuring reading speed. Journal of Reading Research, 7(2), 1–10.",
    );
  });

  it("ignores an invalid DOI, says so, and falls back to the URL", () => {
    const citation = formatCitation({ ...lecun, doi: "nature14539", url: "https://www.nature.com/articles/nature14539" });
    assert.ok(plainText(citation.reference).endsWith("436–444. https://www.nature.com/articles/nature14539"));
    assert.ok(codes(citation.notes).includes("invalid-doi"));
  });

  it("puts an unauthored article's title in quotation marks in text, with the comma inside them", () => {
    const citation = formatCitation({ ...lecun, authors: [] });
    assert.equal(plainText(citation.parenthetical), "(“Deep learning,” 2015)");
    assert.equal(plainText(citation.narrative), "“Deep learning” (2015)");
    assert.ok(plainText(citation.reference).startsWith("Deep learning. (2015). Nature"));
  });
});

describe("books", () => {
  it("formats a book by a person", () => {
    const citation = formatCitation({
      type: "book",
      authors: [person("Kahneman", "Daniel")],
      date: { year: 2011 },
      title: "Thinking, fast and slow",
      publisher: "Farrar, Straus and Giroux",
    });
    assert.equal(plainText(citation.reference), "Kahneman, D. (2011). Thinking, fast and slow. Farrar, Straus and Giroux.");
    assert.deepEqual(citation.reference[1], { text: "Thinking, fast and slow", italic: true });
  });

  it("omits the publisher when it is the same as the author, and shows the edition", () => {
    const citation = formatCitation({
      type: "book",
      authors: [organization("American Psychological Association")],
      date: { year: 2020 },
      title: "Publication manual of the American Psychological Association",
      edition: "7",
      publisher: "American Psychological Association",
      doi: "https://doi.org/10.1037/0000165-000",
    });
    assert.equal(
      plainText(citation.reference),
      "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.). https://doi.org/10.1037/0000165-000",
    );
    assert.deepEqual(citation.reference[1], { text: "Publication manual of the American Psychological Association", italic: true });
    assert.ok(codes(citation.notes).includes("publisher-omitted"));
    assert.equal(plainText(citation.parenthetical), "(American Psychological Association, 2020)");
    assert.equal(plainText(citation.narrative), "American Psychological Association (2020)");
  });

  it("adds no full stop after a title ending in a question mark", () => {
    const citation = formatCitation({
      type: "book",
      authors: [person("Lanier", "Jaron")],
      date: { year: 2013 },
      title: "Who owns the future?",
      publisher: "Simon & Schuster",
    });
    assert.equal(plainText(citation.reference), "Lanier, J. (2013). Who owns the future? Simon & Schuster.");
  });

  it("does not show a first edition, and says why", () => {
    const citation = formatCitation({
      type: "book",
      authors: [person("Kahneman", "Daniel")],
      date: { year: 2011 },
      title: "Thinking, fast and slow",
      edition: "1",
      publisher: "Farrar, Straus and Giroux",
    });
    assert.ok(!plainText(citation.reference).includes("ed."));
    assert.ok(codes(citation.notes).includes("first-edition-omitted"));
  });
});

describe("web pages", () => {
  it("formats a web page with a full date and site name", () => {
    const citation = formatCitation({
      type: "webpage",
      authors: [person("Nguyen", "Linh")],
      date: { year: 2022, month: 5, day: 10 },
      title: "How to cite a website",
      siteName: "Example University Library",
      url: "https://library.example.edu/cite-website",
    });
    assert.equal(
      plainText(citation.reference),
      "Nguyen, L. (2022, May 10). How to cite a website. Example University Library. https://library.example.edu/cite-website",
    );
    assert.deepEqual(citation.reference[1], { text: "How to cite a website", italic: true });
  });

  it("omits the site name when it is the same as the author", () => {
    const citation = formatCitation({
      type: "webpage",
      authors: [organization("World Health Organization")],
      date: { year: 2020, month: 3, day: 3 },
      title: "Example fact sheet",
      siteName: "World Health Organization",
      url: "https://www.who.int/example",
    });
    assert.equal(
      plainText(citation.reference),
      "World Health Organization. (2020, March 3). Example fact sheet. https://www.who.int/example",
    );
    assert.ok(codes(citation.notes).includes("site-name-omitted"));
  });

  it("moves the title before the date when there is no author", () => {
    const citation = formatCitation({
      type: "webpage",
      authors: [],
      date: { year: 2021 },
      title: "Citation basics",
      siteName: "Writing Centre",
      url: "https://writing.example.org/citation",
    });
    assert.equal(plainText(citation.reference), "Citation basics. (2021). Writing Centre. https://writing.example.org/citation");
    assert.deepEqual(citation.parenthetical, [{ text: "(" }, { text: "Citation basics", italic: true }, { text: ", 2021)" }]);
    assert.equal(plainText(citation.parenthetical), "(Citation basics, 2021)");
    assert.deepEqual(citation.narrative, [{ text: "Citation basics", italic: true }, { text: " (2021)" }]);
    assert.ok(codes(citation.notes).includes("no-author"));
  });

  it("shows a month without a day", () => {
    const citation = formatCitation({ type: "webpage", authors: [person("Nguyen", "Linh")], date: { year: 2022, month: 5 }, title: "A page", url: "https://example.org" });
    assert.ok(plainText(citation.reference).includes("(2022, May)."));
  });

  it("drops a day given without a month, and says so", () => {
    const citation = formatCitation({ type: "webpage", authors: [person("Nguyen", "Linh")], date: { year: 2022, day: 10 }, title: "A page", url: "https://example.org" });
    assert.ok(plainText(citation.reference).includes("(2022)."));
    assert.ok(codes(citation.notes).includes("day-without-month"));
  });

  it("rejects impossible dates and accepts leap days", () => {
    const page = (year: number, day: number): Source => ({ type: "webpage", authors: [person("Nguyen", "Linh")], date: { year, month: 2, day }, title: "A page", url: "https://example.org" });
    const invalid = formatCitation(page(2021, 30));
    assert.ok(plainText(invalid.reference).includes("(2021, February)."));
    assert.ok(codes(invalid.notes).includes("invalid-date"));
    assert.ok(plainText(formatCitation(page(2024, 29)).reference).includes("(2024, February 29)."));
  });
});

describe("missing dates", () => {
  it("uses n.d. in the reference and in text, and says so", () => {
    const citation = formatCitation({
      type: "book",
      authors: [person("Kahneman", "Daniel")],
      date: {},
      title: "Thinking, fast and slow",
      publisher: "Farrar, Straus and Giroux",
    });
    assert.equal(plainText(citation.reference), "Kahneman, D. (n.d.). Thinking, fast and slow. Farrar, Straus and Giroux.");
    assert.equal(plainText(citation.parenthetical), "(Kahneman, n.d.)");
    assert.equal(plainText(citation.narrative), "Kahneman (n.d.)");
    assert.ok(codes(citation.notes).includes("no-date"));
  });
});

describe("multiple authors", () => {
  it("joins two authors with & in brackets and 'and' in running text", () => {
    const citation = formatCitation({ ...lecun, authors: [person("Smith", "Jane"), person("Jones", "Kim")], date: { year: 2020 } });
    assert.ok(plainText(citation.reference).startsWith("Smith, J., & Jones, K. (2020)."));
    assert.equal(plainText(citation.parenthetical), "(Smith & Jones, 2020)");
    assert.equal(plainText(citation.narrative), "Smith and Jones (2020)");
  });

  it("uses the ellipsis form from 21 authors, and says so", () => {
    const authors = Array.from({ length: 21 }, (_, i) => person(`Author${i + 1}`, "Ann"));
    const citation = formatCitation({ ...lecun, authors });
    const expectedNames = `${Array.from({ length: 19 }, (_, i) => `Author${i + 1}, A.`).join(", ")}, . . . Author21, A.`;
    assert.ok(plainText(citation.reference).startsWith(`${expectedNames} (2015).`));
    assert.deepEqual(citation.notes.find((note) => note.code === "over-twenty-authors"), { code: "over-twenty-authors", count: 21 });
    assert.equal(plainText(citation.parenthetical), "(Author1 et al., 2015)");
  });

  it("leaves out an incomplete author entry, says which, and ignores blank ones", () => {
    const citation = formatCitation({
      ...lecun,
      authors: [person("LeCun", "Yann"), person("", "Yoshua"), person("", ""), organization("  ")],
    });
    assert.ok(plainText(citation.reference).startsWith("LeCun, Y. (2015)."));
    assert.deepEqual(citation.notes.filter((note) => note.code === "author-incomplete"), [{ code: "author-incomplete", position: 2 }]);
  });
});

describe("corporate authors", () => {
  it("does not double the full stop after a name ending in one", () => {
    const citation = formatCitation({ type: "book", authors: [organization("Acme Inc.")], date: { year: 2020 }, title: "Annual report", publisher: "Acme Publishing" });
    assert.ok(plainText(citation.reference).startsWith("Acme Inc. (2020). Annual report. Acme Publishing."));
    assert.equal(plainText(citation.parenthetical), "(Acme Inc., 2020)");
  });
});

describe("missing required information", () => {
  it("shows a placeholder for each missing item, and lists it", () => {
    const book = formatCitation({ type: "book", authors: [person("Kahneman", "Daniel")], date: { year: 2011 }, title: "", publisher: "" });
    assert.equal(plainText(book.reference), "Kahneman, D. (2011). [Title]. [Publisher].");
    assert.deepEqual(book.notes.filter((note) => note.code === "missing"), [{ code: "missing", field: "title" }, { code: "missing", field: "publisher" }]);
    assert.ok(book.reference.some((run) => run.placeholder && run.text === "[Title]"));

    const article = formatCitation({ ...lecun, journal: "" });
    assert.ok(plainText(article.reference).includes("Deep learning. [Journal], 521(7553)"));

    const page = formatCitation({ type: "webpage", authors: [person("Nguyen", "Linh")], date: { year: 2022 }, title: "A page", url: "not a url" });
    assert.ok(plainText(page.reference).endsWith("A page. [URL]"));
    assert.ok(codes(page.notes).includes("invalid-url"));
  });

  it("asks the writer to check sentence case whenever there is a title", () => {
    assert.ok(codes(formatCitation(lecun).notes).includes("check-sentence-case"));
  });
});
