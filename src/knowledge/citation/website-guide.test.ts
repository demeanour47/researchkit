import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToCiteAWebsite as guide } from "../../../content/guides/how-to-cite-a-website";
import { citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { formatCitation } from "./apa/reference";
import { formatChicagoAuthorDate } from "./chicago/author-date/citation";
import { formatChicagoNotesBibliography } from "./chicago/notes-bibliography/citation";
import { formatHarvard } from "./harvard/citation";
import { formatIeee } from "./ieee/citation";
import { formatMla } from "./mla/citation";
import { plainText, type Source, type WebpageSource } from "./source";

/** MLA and Chicago use headline-style capitals; APA, IEEE and Harvard sentence case. The generators use titles as typed. */
const HEADLINE_STYLES = new Set(["MLA 9", "Chicago author-date", "Chicago notes and bibliography"]);

function generated(page: Omit<WebpageSource, "title">, titles: { sentence: string; headline: string }): string[][] {
  const as = (style: string): Source => ({ ...page, title: HEADLINE_STYLES.has(style) ? titles.headline : titles.sentence });
  const record = (style: string) => ({ source: as(style), provenance: "user-entered" as const });
  const apa = formatCitation(as("APA 7"));
  const mla = formatMla(record("MLA 9"));
  const authorDate = formatChicagoAuthorDate(record("Chicago author-date"));
  const notes = formatChicagoNotesBibliography({ record: record("Chicago notes and bibliography") });
  const ieee = formatIeee({ source: as("IEEE"), provenance: "user-entered", number: "1" });
  const harvard = formatHarvard({ record: record("Harvard") });
  return [
    ["APA 7", plainText(apa.reference), plainText(apa.parenthetical)],
    ["MLA 9", plainText(mla.worksCited), plainText(mla.parenthetical)],
    ["Chicago author-date", plainText(authorDate.reference), plainText(authorDate.parenthetical)],
    ["Chicago notes and bibliography", plainText(notes.bibliography), plainText(notes.fullNote)],
    ["IEEE", plainText(ieee.entry ?? []), plainText(ieee.citation ?? [])],
    ["Harvard", plainText(harvard.reference), plainText(harvard.parenthetical)],
  ];
}

describe("How to cite a website guide", () => {
  it("shows exactly what each generator produces for a dated page by a person", () => {
    const page = { type: "webpage" as const, authors: [{ kind: "person" as const, family: "Sharma", given: "Anita" }], date: { year: 2024, month: 3, day: 18 }, siteName: "Himalayan Research Notes", url: "https://example.org/community-forestry", accessed: { year: 2025, month: 2, day: 10 } };
    assert.deepEqual(tableOf(guide, "One web page in six styles").rows, generated(page, { sentence: "Community forestry in the mid-hills", headline: "Community Forestry in the Mid-Hills" }));
  });

  it("shows exactly what each generator produces for an undated page by an organisation", () => {
    const page = { type: "webpage" as const, authors: [{ kind: "organization" as const, name: "Example Research Network" }], date: {}, siteName: "Example Research Network", url: "https://example.org/fieldwork-guidance", accessed: { year: 2025, month: 2, day: 10 } };
    assert.deepEqual(tableOf(guide, "An undated page by an organisation").rows, generated(page, { sentence: "Guidance for student fieldwork in Nepal", headline: "Guidance for Student Fieldwork in Nepal" }));
  });

  it("describes access dates as the generators apply them", () => {
    const rows = Object.fromEntries(tableOf(guide, "Access dates for web pages").rows.map(([style, , generator]) => [style, generator]));
    assert.match(rows["APA 7"], /Doesn't add one/);
    assert.match(rows.IEEE, /Always/);
    assert.match(rows["Harvard (Cite Them Right)"], /Always/);
  });

  it("labels its examples as invented", () => {
    assert.match(proseOf(guide), /invented page on an invented website \(example\.org\), so they don't describe a real source/);
  });

  it("cites every style manual it relies on", () => {
    assert.deepEqual(citationProblems(guide), []);
  });
});
