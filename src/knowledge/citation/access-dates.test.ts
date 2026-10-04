import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCitation as formatApa } from "./apa/reference";
import { formatChicagoAuthorDate } from "./chicago/author-date/citation";
import { formatChicagoNotesBibliography } from "./chicago/notes-bibliography/citation";
import { formatIeeeReference } from "./ieee/reference";
import { formatMla } from "./mla/citation";
import { plainText, type Run, type Source } from "./source";

// Books and journal articles carry an optional access date, added for Harvard, which dates every
// URL (ADR-0006). Every other style ignores it: these sources must format exactly as before.

const book: Source = { type: "book", authors: [{ kind: "person", family: "Lee", given: "Ann" }], date: { year: 2020 }, title: "A Book", publisher: "P", url: "https://example.org/book" };
const article: Source = { type: "journal-article", authors: [{ kind: "person", family: "Lee", given: "Ann" }], date: { year: 2020 }, title: "An Article", journal: "J", volume: "1", issue: "2", pages: "3-4", url: "https://example.org/article" };
const accessed = { year: 2026, month: 10, day: 4 };

const record = (source: Source) => ({ source, provenance: "user-entered" as const });
const all = (runs: readonly (readonly Run[])[]) => runs.map(plainText);
const outputs: Record<string, (source: Source) => string[]> = {
  APA: (source) => { const c = formatApa(source); return all([c.reference, c.parenthetical, c.narrative]); },
  MLA: (source) => { const c = formatMla(record(source)); return all([c.worksCited, c.parenthetical]); },
  "Chicago author-date": (source) => { const c = formatChicagoAuthorDate(record(source)); return all([c.reference, c.parenthetical]); },
  "Chicago notes and bibliography": (source) => { const c = formatChicagoNotesBibliography({ record: record(source) }); return all([c.fullNote, c.shortNote, c.bibliography]); },
  IEEE: (source) => all([formatIeeeReference(source).runs]),
};

describe("access dates on books and journal articles", () => {
  for (const [style, format] of Object.entries(outputs)) {
    it(`leave ${style} unchanged`, () => {
      for (const source of [book, article]) assert.deepEqual(format({ ...source, accessed }), format(source), `${style} ${source.type}`);
    });
  }
});
