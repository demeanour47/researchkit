import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type Contributor, type Source } from "../source";
import { harvardInitials, listAuthors, textAuthors } from "./names";
import type { Decision, Note } from "./notes";
import { formatHarvardReference } from "./reference";

// Every expected string is written out by hand from ResearchKit's Harvard profile (Cite Them Right,
// 13th edition), independently of the code. Entries marked with a library reproduce that university's
// Cite Them Right guide: Cumbria ("A very quick guide to referencing with Cite them right", 13th edn),
// Robert Gordon University (RGU), University of the West of Scotland (UWS), De Montfort University (DMU)
// and the University of Worcester.

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const text = (source: Source, letter?: string) => plainText(formatHarvardReference(source, letter).runs);
const codes = (items: readonly (Note | Decision)[]) => items.map((item) => item.code);

const book = (overrides: Partial<Extract<Source, { type: "book" }>> = {}): Source => ({
  type: "book",
  authors: [person("Cottrell", "Stella")],
  date: { year: 2019 },
  title: "The study skills handbook",
  edition: "5",
  publisher: "Red Globe Press",
  ...overrides,
});

const article = (overrides: Partial<Extract<Source, { type: "journal-article" }>> = {}): Source => ({
  type: "journal-article",
  authors: [person("Chen", "Yonghong")],
  date: { year: 2023 },
  title: "Addressing uncertainties through improved reserve product design",
  journal: "IEEE Transactions on Power Systems",
  volume: "38",
  issue: "4",
  pages: "3911-3923",
  doi: "10.1109/TPWRS.2022.3200697",
  ...overrides,
});

const webpage = (overrides: Partial<Extract<Source, { type: "webpage" }>> = {}): Source => ({
  type: "webpage",
  authors: [person("Sneed", "Annie")],
  date: { year: 2019 },
  title: "The reason Antarctica is melting",
  url: "https://www.scientificamerican.com/",
  accessed: { year: 2020, month: 7, day: 23 },
  ...overrides,
});

describe("Harvard author names", () => {
  it("writes initials with full stops and no spaces", () => {
    assert.equal(harvardInitials("James G."), "J.G.");
    assert.equal(harvardInitials("Mary Anne Louise"), "M.A.L.");
    assert.equal(harvardInitials("Jean-Paul"), "J.-P.");
    assert.equal(harvardInitials("J. A."), "J.A.");
    assert.equal(harvardInitials(""), "");
  });

  it("lists every author with “and” before the last and no comma before it (Cumbria, RGU)", () => {
    const names = ["Culloty E", "Murphy P", "Brereton P", "Suiter J", "Smeaton A", "Zhang D"].map((name) => {
      const [family, given] = name.split(" ");
      return { kind: "person", family, given } as const;
    });
    assert.equal(listAuthors(names), "Culloty, E., Murphy, P., Brereton, P., Suiter, J., Smeaton, A. and Zhang, D.");
    assert.equal(listAuthors(names.slice(0, 2)), "Culloty, E. and Murphy, P.");
    assert.equal(listAuthors([{ kind: "organization", name: "Department for Education" }]), "Department for Education");
    assert.equal(listAuthors([{ kind: "person", family: "Plato", given: "" }]), "Plato");
  });

  it("names up to three authors in the text, and the first and et al. from four", () => {
    const authors = ["Lloyd", "Singh", "Alonso", "Gerrard"].map((family) => ({ kind: "person", family, given: "A." }) as const);
    assert.equal(textAuthors(authors.slice(0, 1)), "Lloyd");
    assert.equal(textAuthors(authors.slice(0, 2)), "Lloyd and Singh");
    assert.equal(textAuthors(authors.slice(0, 3)), "Lloyd, Singh and Alonso");
    assert.equal(textAuthors(authors), "Lloyd et al.");
  });
});

describe("Harvard book references", () => {
  it("reproduces the Cite Them Right book pattern (Cumbria)", () => {
    assert.equal(text(book()), "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press.");
  });

  it("reproduces a book with two initials (UWS)", () => {
    assert.equal(text(book({ authors: [person("Speight", "James G.")], title: "Global climate change demystified", edition: "2", publisher: "Wiley" })), "Speight, J.G. (2019) Global climate change demystified. 2nd edn. Wiley.");
  });

  it("italicises the title only", () => {
    assert.deepEqual(formatHarvardReference(book()).runs, [
      { text: "Cottrell, S. (2019) " },
      { text: "The study skills handbook", italic: true },
      { text: ". 5th edn. Red Globe Press." },
    ]);
  });

  it("formats two authors, as Cite Them Right's own reference reads", () => {
    const source = book({ authors: [person("Pears", "Richard"), person("Shields", "Graham")], date: { year: 2025 }, title: "Cite them right: the essential referencing guide", edition: "13", publisher: "Bloomsbury Academic" });
    assert.equal(text(source), "Pears, R. and Shields, G. (2025) Cite them right: the essential referencing guide. 13th edn. Bloomsbury Academic.");
  });

  it("leaves out a first edition and accepts an edition typed as an ordinal", () => {
    assert.equal(text(book({ edition: "1" })), "Cottrell, S. (2019) The study skills handbook. Red Globe Press.");
    assert.ok(codes(formatHarvardReference(book({ edition: "1" })).decisions).includes("first-edition-omitted"));
    assert.equal(text(book({ edition: "3rd" })), "Cottrell, S. (2019) The study skills handbook. 3rd edn. Red Globe Press.");
    const typed = formatHarvardReference(book({ edition: "Revised edn" }));
    assert.equal(plainText(typed.runs), "Cottrell, S. (2019) The study skills handbook. Revised edn. Red Globe Press.");
    assert.ok(codes(typed.notes).includes("check-edition"));
  });

  it("gives no place of publication, even when one is entered", () => {
    assert.equal(text(book({ edition: "", place: "London" })), "Cottrell, S. (2019) The study skills handbook. Red Globe Press.");
  });

  it("keeps a title's own question mark instead of adding a full stop", () => {
    assert.equal(text(book({ title: "What is history?", edition: "" })), "Cottrell, S. (2019) What is history? Red Globe Press.");
  });

  it("writes an organization author in full", () => {
    const result = formatHarvardReference(book({ authors: [organization("World Health Organization")], title: "World health statistics 2023", edition: "", publisher: "World Health Organization" }));
    assert.equal(plainText(result.runs), "World Health Organization (2019) World health statistics 2023. World Health Organization.");
    assert.ok(codes(result.decisions).includes("organization-author"));
  });

  it("begins with the title when there is no author", () => {
    const result = formatHarvardReference(book({ authors: [person("")], edition: "" }));
    assert.equal(plainText(result.runs), "The study skills handbook (2019) Red Globe Press.");
    assert.deepEqual(result.runs[0], { text: "The study skills handbook", italic: true });
    assert.ok(codes(result.notes).includes("no-author"));
  });

  it("writes “no date” without a year, and warns", () => {
    const result = formatHarvardReference(book({ date: {} }));
    assert.equal(plainText(result.runs), "Cottrell, S. (no date) The study skills handbook. 5th edn. Red Globe Press.");
    assert.equal(result.date, "no date");
    assert.ok(result.notes.some((note) => note.code === "missing-year" && note.sourceType === "book"));
  });

  it("adds a DOI after “Available at:”, with no full stop after it", () => {
    assert.equal(text(book({ doi: "doi:10.1007/978-3-030-12345-6" })), "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press. Available at: https://doi.org/10.1007/978-3-030-12345-6");
  });

  it("dates a book's URL with the access date", () => {
    assert.equal(
      text(book({ url: "https://example.org/handbook", accessed: { year: 2025, month: 3, day: 4 } })),
      "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press. Available at: https://example.org/handbook (Accessed: 4 March 2025).",
    );
  });

  it("warns when the publisher is missing", () => {
    const result = formatHarvardReference(book({ publisher: "" }));
    assert.equal(plainText(result.runs), "Cottrell, S. (2019) The study skills handbook. 5th edn.");
    assert.ok(codes(result.notes).includes("missing-publisher"));
  });

  it("marks a missing title with a placeholder", () => {
    const result = formatHarvardReference(book({ title: "  " }));
    assert.deepEqual(result.runs[1], { text: "[Title]", placeholder: true });
    assert.ok(codes(result.notes).includes("missing-title"));
  });
});

describe("Harvard journal article references", () => {
  it("reproduces the RGU example exactly", () => {
    assert.equal(text(article()), "Chen, Y. (2023) ‘Addressing uncertainties through improved reserve product design’, IEEE Transactions on Power Systems, 38(4), pp. 3911–3923. Available at: https://doi.org/10.1109/TPWRS.2022.3200697");
  });

  it("italicises the journal and quotes the article title", () => {
    assert.deepEqual(formatHarvardReference(article()).runs, [
      { text: "Chen, Y. (2023) ‘Addressing uncertainties through improved reserve product design’, " },
      { text: "IEEE Transactions on Power Systems", italic: true },
      { text: ", 38(4), pp. 3911–3923. Available at: https://doi.org/10.1109/TPWRS.2022.3200697" },
    ]);
  });

  it("lists three authors (Cumbria, with the profile's en dash and no full stop after the DOI)", () => {
    const source = article({
      authors: [person("Thaker", "Jagadish"), person("Smith", "Nicholas"), person("Leiserowitz", "Anthony")],
      date: { year: 2020 },
      title: "Global warming risk perceptions in India",
      journal: "Risk Analysis",
      volume: "40",
      issue: "12",
      pages: "2481-2497",
      doi: "10.1111/risa.13574",
    });
    assert.equal(text(source), "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574");
  });

  it("uses an article number in place of pages, keeping a title's question mark (DMU)", () => {
    const source = article({ authors: [person("Iacobellis", "Gaetano")], date: { year: 2020 }, title: "COVID-19 and diabetes: can DPP4 inhibition play a role?", journal: "Diabetes Research and Clinical Practice", volume: "162", issue: "", pages: "", articleNumber: "108125", doi: "" });
    assert.equal(text(source), "Iacobellis, G. (2020) ‘COVID-19 and diabetes: can DPP4 inhibition play a role?’, Diabetes Research and Clinical Practice, 162, article 108125.");
  });

  it("begins with the quoted title when there is no author, and dates a URL (UWS)", () => {
    const source = article({ authors: [], title: "Climate change could be newest social determinant of health", journal: "Hospital Case Management", volume: "31", issue: "7", pages: "1-16", doi: "", url: "https://search.ebscohost.com/", accessed: { year: 2023, month: 7, day: 31 } });
    assert.equal(text(source), "‘Climate change could be newest social determinant of health’ (2023) Hospital Case Management, 31(7), pp. 1–16. Available at: https://search.ebscohost.com/ (Accessed: 31 July 2023).");
  });

  it("writes a single page with “p.”", () => {
    assert.equal(text(article({ pages: "12", doi: "" })), "Chen, Y. (2023) ‘Addressing uncertainties through improved reserve product design’, IEEE Transactions on Power Systems, 38(4), p. 12.");
  });

  it("prefers the DOI to a URL, and needs no access date with it", () => {
    const result = formatHarvardReference(article({ url: "https://example.org/article", accessed: { year: 2024, month: 1, day: 2 } }));
    assert.ok(plainText(result.runs).endsWith("Available at: https://doi.org/10.1109/TPWRS.2022.3200697"));
    assert.ok(codes(result.decisions).includes("url-left-out-for-doi"));
    assert.ok(codes(result.notes).includes("access-date-not-needed"));
  });

  it("reports an invalid DOI and falls back to the URL", () => {
    const result = formatHarvardReference(article({ doi: "not a doi", url: "https://example.org/article", accessed: { year: 2024, month: 1, day: 2 } }));
    assert.ok(plainText(result.runs).endsWith("pp. 3911–3923. Available at: https://example.org/article (Accessed: 2 January 2024)."));
    assert.ok(codes(result.notes).includes("invalid-doi"));
  });

  it("gives a URL without an access date, and warns", () => {
    const result = formatHarvardReference(article({ doi: "", url: "https://example.org/article" }));
    assert.ok(plainText(result.runs).endsWith("pp. 3911–3923. Available at: https://example.org/article"));
    assert.ok(codes(result.notes).includes("missing-access-date"));
  });

  it("keeps pages over an article number and says so", () => {
    const result = formatHarvardReference(article({ articleNumber: "e123" }));
    assert.ok(plainText(result.runs).includes("38(4), pp. 3911–3923."));
    assert.ok(codes(result.notes).includes("article-number-not-shown"));
  });

  it("reports what is missing from the journal details", () => {
    const missing = (overrides: Partial<Extract<Source, { type: "journal-article" }>>) => formatHarvardReference(article(overrides)).notes.find((note) => note.code === "incomplete-journal");
    assert.deepEqual(missing({ volume: "", issue: "", pages: "" }), { code: "incomplete-journal", missing: "numbers" });
    assert.deepEqual(missing({ volume: "" }), { code: "incomplete-journal", missing: "volume" });
    assert.deepEqual(missing({ pages: "" }), { code: "incomplete-journal", missing: "pages" });
    assert.equal(missing({}), undefined);
  });

  it("marks a missing journal and title with placeholders", () => {
    const result = formatHarvardReference(article({ journal: "", title: "" }));
    assert.equal(plainText(result.runs), "Chen, Y. (2023) ‘[Title]’, [Journal], 38(4), pp. 3911–3923. Available at: https://doi.org/10.1109/TPWRS.2022.3200697");
    assert.ok(codes(result.notes).includes("missing-journal") && codes(result.notes).includes("missing-title"));
  });

  it("ignores the issue month, which Harvard journal references don't give", () => {
    assert.equal(text(article({ date: { year: 2023, month: 4 } })), text(article()));
  });
});

describe("Harvard web page references", () => {
  it("reproduces the Cite Them Right web page pattern (UWS)", () => {
    assert.equal(text(webpage()), "Sneed, A. (2019) The reason Antarctica is melting. Available at: https://www.scientificamerican.com/ (Accessed: 23 July 2020).");
  });

  it("formats an organization author with no date (UWS)", () => {
    const source = webpage({ authors: [organization("Cool Antarctica")], date: {}, title: "Antarctica and global warming", url: "https://coolantarctica.com/" });
    const result = formatHarvardReference(source);
    assert.equal(plainText(result.runs), "Cool Antarctica (no date) Antarctica and global warming. Available at: https://coolantarctica.com/ (Accessed: 23 July 2020).");
    assert.ok(result.notes.some((note) => note.code === "missing-year" && note.sourceType === "webpage"));
  });

  it("formats a government department as author (Cumbria)", () => {
    const source = webpage({ authors: [organization("Department for Education")], date: { year: 2025 }, title: "Working together to safeguard children", url: "https://www.gov.uk/government/publications/working-together-to-safeguard-children--2", accessed: { year: 2025, month: 8, day: 20 } });
    assert.equal(text(source), "Department for Education (2025) Working together to safeguard children. Available at: https://www.gov.uk/government/publications/working-together-to-safeguard-children--2 (Accessed: 20 August 2025).");
  });

  it("uses the year alone from a full publication date", () => {
    assert.equal(text(webpage({ date: { year: 2019, month: 5, day: 14 } })), text(webpage()));
  });

  it("does not show the site name or owner, and says so", () => {
    const result = formatHarvardReference(webpage({ siteName: "Scientific American", publisher: "Springer Nature" }));
    assert.equal(plainText(result.runs), text(webpage()));
    assert.ok(codes(result.notes).includes("site-not-shown"));
  });

  it("begins with the title when there is no author", () => {
    assert.equal(text(webpage({ authors: [] })), "The reason Antarctica is melting (2019) Available at: https://www.scientificamerican.com/ (Accessed: 23 July 2020).");
  });

  it("uses the valid part of an incomplete or impossible access date, and says so", () => {
    const partial = formatHarvardReference(webpage({ accessed: { year: 2020, month: 7 } }));
    assert.ok(plainText(partial.runs).endsWith("(Accessed: July 2020)."));
    assert.ok(codes(partial.notes).includes("incomplete-access-date"));
    const impossible = formatHarvardReference(webpage({ accessed: { year: 2023, month: 2, day: 30 } }));
    assert.ok(plainText(impossible.runs).endsWith("(Accessed: February 2023)."));
    assert.ok(impossible.notes.some((note) => note.code === "invalid-date" && note.date === "access"));
  });

  it("treats a missing URL as an error and a missing access date as a warning", () => {
    const noUrl = formatHarvardReference(webpage({ url: "" }));
    assert.equal(plainText(noUrl.runs), "Sneed, A. (2019) The reason Antarctica is melting.");
    assert.ok(codes(noUrl.notes).includes("missing-url"));
    const noAccess = formatHarvardReference(webpage({ accessed: undefined }));
    assert.equal(plainText(noAccess.runs), "Sneed, A. (2019) The reason Antarctica is melting. Available at: https://www.scientificamerican.com/");
    assert.ok(codes(noAccess.notes).includes("missing-access-date"));
  });

  it("rejects an invalid URL", () => {
    const result = formatHarvardReference(webpage({ url: "www.example" }));
    assert.equal(plainText(result.runs), "Sneed, A. (2019) The reason Antarctica is melting.");
    assert.ok(codes(result.notes).includes("invalid-url"));
  });

  it("keeps a long title and URL intact", () => {
    const title = "A very long title about the measurement of ice-sheet loss across the West Antarctic peninsula between 1979 and 2017";
    const url = `https://example.org/${"segment/".repeat(20)}page`;
    assert.equal(text(webpage({ title, url })), `Sneed, A. (2019) ${title}. Available at: ${url} (Accessed: 23 July 2020).`);
  });
});

describe("Harvard dates and year letters", () => {
  it("adds the writer's year letter to the year", () => {
    const result = formatHarvardReference(book(), "a");
    assert.equal(plainText(result.runs), "Cottrell, S. (2019a) The study skills handbook. 5th edn. Red Globe Press.");
    assert.equal(result.date, "2019a");
    assert.ok(!codes(result.notes).includes("same-year-letter"));
  });

  it("explains same-author, same-year letters when none is given", () => {
    assert.ok(codes(formatHarvardReference(book()).notes).includes("same-year-letter"));
  });

  it("rejects anything but one lowercase letter, without correcting it", () => {
    for (const letter of ["A", "ab", "1", "é"]) {
      const result = formatHarvardReference(book(), letter);
      assert.equal(result.date, "2019", letter);
      assert.ok(codes(result.notes).includes("invalid-year-letter"), letter);
    }
  });

  it("doesn't attach a letter to “no date”", () => {
    const result = formatHarvardReference(book({ date: {} }), "b");
    assert.equal(result.date, "no date");
    assert.ok(codes(result.notes).includes("year-letter-without-year"));
  });

  it("reports an impossible year", () => {
    const result = formatHarvardReference(book({ date: { year: Number.NaN } }));
    assert.equal(result.date, "no date");
    assert.ok(result.notes.some((note) => note.code === "invalid-date" && note.date === "publication"));
  });
});

describe("Harvard notes", () => {
  it("always states the profile first", () => {
    for (const source of [book(), article(), webpage()]) assert.equal(formatHarvardReference(source).notes[0].code, "profile");
  });

  it("explains et al. as an institutional variation from four authors", () => {
    const four = ["Ahmed", "Brown", "Clark", "Diaz"].map((family) => person(family, "A."));
    const result = formatHarvardReference(book({ authors: four }));
    assert.ok(plainText(result.runs).startsWith("Ahmed, A., Brown, A., Clark, A. and Diaz, A. (2019) "));
    assert.ok(codes(result.notes).includes("et-al-variant"));
    assert.ok(!codes(formatHarvardReference(book({ authors: four.slice(0, 3) })).notes).includes("et-al-variant"));
  });

  it("reports ambiguous, incomplete and editor names from the shared reading", () => {
    const result = formatHarvardReference(book({ authors: [person("Smith and Jones", "A."), person("", "Ann"), person("Brown (ed.)", "B.")] }));
    assert.deepEqual(result.notes.filter((note) => "position" in note), [
      { code: "ambiguous-author", position: 1 },
      { code: "author-incomplete", position: 2 },
      { code: "unsupported-contributor-role", position: 3 },
    ]);
  });
});
