import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { referenceListOrBibliography as guide } from "../../../content/guides/reference-list-or-bibliography";
import { citationProblems, tableOf } from "../../domains/publishing/guide-checks";
import { formatCitation } from "./apa/reference";
import { STYLE_CHECKERS } from "./checker";
import type { CheckerStyleId } from "./checker/types";
import { formatIeee } from "./ieee/citation";
import { plainText, type Source } from "./source";

const STYLE_IDS: Record<string, CheckerStyleId> = {
  "APA 7": "apa",
  "MLA 9": "mla",
  "Chicago author-date": "chicago-author-date",
  "Chicago notes and bibliography": "chicago-notes-bibliography",
  IEEE: "ieee",
  "Harvard (Cite Them Right)": "harvard",
};

const person = (family: string, given: string) => ({ kind: "person" as const, family, given });
const book = (title: string): Source => ({ type: "book", authors: [person("Cottrell", "Stella")], date: { year: 2019 }, title, edition: "5", publisher: "Red Globe Press", place: "London, U.K." });
const article: Source = { type: "journal-article", authors: [person("Thaker", "Jagadish"), person("Smith", "Nicholas"), person("Leiserowitz", "Anthony")], date: { year: 2020, month: 12 }, title: "Global warming risk perceptions in India", journal: "Risk Analysis", volume: "40", issue: "12", pages: "2481-2497", doi: "10.1111/risa.13574" };
const page: Source = { type: "webpage", authors: [person("Sharma", "Anita")], date: { year: 2024, month: 3, day: 18 }, title: "Community forestry in the mid-hills", siteName: "Himalayan Research Notes", url: "https://example.org/community-forestry", accessed: { year: 2025, month: 2, day: 10 } };

describe("Reference list or bibliography guide", () => {
  it("describes each style's list as the Reference Checker defines it", () => {
    const rows = tableOf(guide, "The list at the end, by style").rows;
    assert.equal(rows.length, Object.keys(STYLE_CHECKERS).length);
    for (const [style, list, , order, letters] of rows) {
      const capabilities = STYLE_CHECKERS[STYLE_IDS[style]].capabilities;
      assert.equal(list.toLowerCase(), capabilities.list.toLowerCase(), style);
      assert.equal(order.startsWith("Alphabetical"), capabilities.ordering === "alphabetical", style);
      assert.equal(letters.startsWith("Year letters"), capabilities.yearLetters, style);
    }
  });

  it("shows the APA list sorted alphabetically, as the generator writes each entry", () => {
    const expected = [book("The study skills handbook"), page, article].map((source) => plainText(formatCitation(source).reference)).sort((a, b) => a.localeCompare(b, "en"));
    assert.deepEqual(tableOf(guide, "An APA reference list").rows.map(([entry]) => entry), expected);
  });

  it("shows the IEEE list numbered in citation order, as the generator writes each entry", () => {
    const cited = [article, page, book("The Study Skills Handbook")];
    const expected = cited.map((source, index) => plainText(formatIeee({ source, provenance: "user-entered", number: String(index + 1) }).entry ?? []));
    assert.deepEqual(tableOf(guide, "An IEEE reference list").rows.map(([entry]) => entry), expected);
  });

  it("cites the style manuals it relies on", () => {
    assert.deepEqual(citationProblems(guide), []);
  });
});
