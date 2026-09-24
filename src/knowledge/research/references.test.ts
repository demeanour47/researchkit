import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALTERNATIVE_VIEWS, EVIDENCE, GENERAL_VIEW } from "./evidence";
import { REFERENCES, doiUrl, getReference, referenceMarkdown, referenceRuns, referenceText } from "./references";
import { FINER_SOURCES } from "./finer";
import { GENERAL_NOTE_SOURCES } from "./question-evaluator";
import { QUESTION_TYPES } from "./question-types";
import { OPTIONS } from "./research-onion";

/** Crossref's recommended pattern for modern DOIs. */
const DOI_PATTERN = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;

/** The surnames in an APA author (or editor) list, such as "Saunders, M. N. K., Lewis, P., & Thornhill, A.". */
function surnames(apa: string): string[] {
  const authors = apa.slice(0, apa.indexOf(" (")).replace(", Jr.", "");
  return authors.split(/\.,(?: &)? /).map((author) => author.split(",")[0]);
}

describe("REFERENCES", () => {
  it("has unique ids and DOIs", () => {
    assert.equal(new Set(REFERENCES.map((reference) => reference.id)).size, REFERENCES.length);
    const dois = REFERENCES.flatMap((reference) => (reference.doi ? [reference.doi] : []));
    assert.equal(new Set(dois).size, dois.length);
  });

  for (const reference of REFERENCES) {
    it(`formats ${reference.id} as a complete APA reference`, () => {
      assert.ok(reference.apa.includes(`(${reference.year}).`), "year in brackets after the authors");
      assert.ok(reference.apa.endsWith("."), "ends with a full stop");
      assert.equal(reference.apa.split("*").length, 3, "exactly one italic part");
      assert.ok(!/\d-\d/.test(reference.apa), "page ranges use an en dash");
      assert.ok(!reference.apa.includes("doi.org"), "the DOI is stored separately");
    });

    it(`gives ${reference.id} an APA in-text citation that matches its authors`, () => {
      const names = surnames(reference.apa);
      const expected =
        names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} & ${names[1]}` : `${names[0]} et al.`;
      assert.equal(reference.cite, `${expected}, ${reference.year}`);
    });
  }

  it("stores every DOI in the valid bare format", () => {
    for (const reference of REFERENCES) {
      if (reference.doi === undefined) continue;
      assert.match(reference.doi, DOI_PATTERN, reference.id);
    }
  });

  it("gives every journal article a DOI", () => {
    const articles = REFERENCES.filter((reference) => /\*\(\d+\)/.test(reference.apa));
    assert.ok(articles.length >= 5);
    for (const article of articles) assert.ok(article.doi, `${article.id} has no DOI`);
  });

  it("cites the authors the project prefers", () => {
    const all = REFERENCES.map((reference) => reference.apa).join("\n");
    for (const author of ["Saunders, M.", "Creswell, J. W.", "Crotty, M.", "Bryman, A.", "Yin, R. K.", "Maxwell, J. A.", "Lincoln, Y. S., & Guba, E. G.", "Denzin, N. K."]) {
      assert.ok(all.includes(author), author);
    }
  });

  it("uses every reference somewhere, so none is listed without a purpose", () => {
    const used = new Set([
      ...OPTIONS.flatMap((option) => option.references),
      ...Object.values(EVIDENCE).flatMap((evidence) => evidence.sources),
      ...Object.values(ALTERNATIVE_VIEWS).flatMap((view) => view.sources),
      ...GENERAL_VIEW.sources,
      ...QUESTION_TYPES.flatMap((type) => type.sources),
      ...FINER_SOURCES,
      ...Object.values(GENERAL_NOTE_SOURCES),
    ]);
    for (const reference of REFERENCES) assert.ok(used.has(reference.id), `${reference.id} is unused`);
  });
});

describe("getReference", () => {
  it("finds references and rejects unknown ids", () => {
    assert.equal(getReference("yin-2018").cite, "Yin, 2018");
    assert.throws(() => getReference("smith-1776"), { name: "RangeError", message: "Unknown reference: smith-1776" });
  });
});

describe("reference formats", () => {
  const bowen = getReference("bowen-2009");
  const saunders = getReference("saunders-2019");

  it("builds DOI links", () => {
    assert.equal(doiUrl("10.3316/QRJ0902027"), "https://doi.org/10.3316/QRJ0902027");
  });

  it("splits a journal article into runs with the journal and volume in italics", () => {
    assert.deepEqual(referenceRuns(bowen), [
      { text: "Bowen, G. A. (2009). Document analysis as a qualitative research method. ", italic: false },
      { text: "Qualitative Research Journal, 9", italic: true },
      { text: "(2), 27–40.", italic: false },
    ]);
  });

  it("splits a book into runs with the title in italics", () => {
    assert.deepEqual(referenceRuns(saunders), [
      { text: "Saunders, M. N. K., Lewis, P., & Thornhill, A. (2019). ", italic: false },
      { text: "Research methods for business students", italic: true },
      { text: " (8th ed.). Pearson.", italic: false },
    ]);
  });

  it("writes plain text without italics markers, with the DOI as a link", () => {
    assert.equal(
      referenceText(bowen),
      "Bowen, G. A. (2009). Document analysis as a qualitative research method. Qualitative Research Journal, 9(2), 27–40. https://doi.org/10.3316/QRJ0902027",
    );
    assert.equal(
      referenceText(saunders),
      "Saunders, M. N. K., Lewis, P., & Thornhill, A. (2019). Research methods for business students (8th ed.). Pearson.",
    );
  });

  it("writes Markdown with the italic part in asterisks", () => {
    assert.equal(
      referenceMarkdown(bowen),
      "Bowen, G. A. (2009). Document analysis as a qualitative research method. *Qualitative Research Journal, 9*(2), 27–40. https://doi.org/10.3316/QRJ0902027",
    );
    assert.equal(referenceMarkdown(saunders), saunders.apa);
  });
});
