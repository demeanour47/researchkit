import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToChooseACitationStyle as guide } from "../../../content/guides/how-to-choose-a-citation-style";
import { citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { STYLE_MANUAL_REFERENCES, GROUP_REFERENCES } from "../research/references";
import { formatCitation } from "./apa/reference";
import { formatChicagoAuthorDate } from "./chicago/author-date/citation";
import { formatChicagoNotesBibliography } from "./chicago/notes-bibliography/citation";
import { formatHarvard } from "./harvard/citation";
import { formatIeee } from "./ieee/citation";
import { formatMla } from "./mla/citation";
import { plainText, type Source } from "./source";

const book = (title: string): Source => ({ type: "book", authors: [{ kind: "person", family: "Cottrell", given: "Stella" }], date: { year: 2019 }, title, edition: "5", publisher: "Red Globe Press", place: "London, U.K." });
const sentenceCase = book("The study skills handbook");
const headline = book("The Study Skills Handbook");
const record = (source: Source) => ({ source, provenance: "user-entered" as const });
const page = { kind: "page" as const, value: "45" };

describe("How to choose a citation style guide", () => {
  it("shows the same book exactly as each generator formats it", () => {
    assert.deepEqual(tableOf(guide, "The same book in six styles").rows, [
      ["APA 7", plainText(formatCitation(sentenceCase).reference), plainText(formatCitation(sentenceCase).parenthetical)],
      ["MLA 9", plainText(formatMla(record(headline)).worksCited), plainText(formatMla(record(headline)).parenthetical)],
      ["Chicago author-date", plainText(formatChicagoAuthorDate(record(headline)).reference), plainText(formatChicagoAuthorDate(record(headline)).parenthetical)],
      ["Chicago notes and bibliography", plainText(formatChicagoNotesBibliography({ record: record(headline) }).bibliography), plainText(formatChicagoNotesBibliography({ record: record(headline) }).fullNote)],
      ["IEEE", plainText(formatIeee({ source: headline, provenance: "user-entered", number: "1" }).entry ?? []), plainText(formatIeee({ source: headline, provenance: "user-entered", number: "1" }).citation ?? [])],
      ["Harvard", plainText(formatHarvard({ record: record(sentenceCase) }).reference), plainText(formatHarvard({ record: record(sentenceCase) }).parenthetical)],
    ]);
  });

  it("describes where each style puts a page number as the generators do", () => {
    assert.equal(plainText(formatMla(record(headline), page).parenthetical), "(Cottrell 45)");
    assert.equal(plainText(formatChicagoAuthorDate(record(headline), page).parenthetical), "(Cottrell 2019, 45)");
    assert.equal(plainText(formatHarvard({ record: record(sentenceCase), locator: page }).parenthetical), "(Cottrell, 2019, p. 45)");
    assert.equal(plainText(formatIeee({ source: headline, provenance: "user-entered", number: "1", locator: page }).citation ?? []), "[1, p. 45]");
    assert.match(proseOf(guide), /MLA gives it with the author, Chicago and Harvard after the year, and IEEE inside the brackets/);
  });

  it("cites each style's authority", () => {
    assert.deepEqual(citationProblems(guide, [...STYLE_MANUAL_REFERENCES, ...GROUP_REFERENCES].map((reference) => reference.id)), []);
  });
});
