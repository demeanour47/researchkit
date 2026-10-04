import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCitation } from "../apa/reference";
import { formatChicagoAuthorDate } from "../chicago/author-date/citation";
import { formatChicagoNotesBibliography } from "../chicago/notes-bibliography/citation";
import { formatHarvard } from "../harvard/citation";
import { formatIeee } from "../ieee/citation";
import { formatMla } from "../mla/citation";
import { plainText, type Contributor, type Source } from "../source";
import { check, problems } from "./test-helpers";
import type { CheckerStyleId } from "./types";

// The checker diagnoses and the generators format (ADR-0009): what each generator produces must pass
// the same style's checks, and its citations must match its entries.

const person = (family: string, given: string): Contributor => ({ kind: "person", family, given });
const sources: Source[] = [
  { type: "book", authors: [person("Cottrell", "Stella")], date: { year: 2019 }, title: "The Study Skills Handbook", edition: "5", publisher: "Red Globe Press", place: "London, U.K." },
  { type: "journal-article", authors: [person("Thaker", "Jagadish"), person("Smith", "Nicholas"), person("Leiserowitz", "Anthony")], date: { year: 2020, month: 12 }, title: "Global Warming Risk Perceptions in India", journal: "Risk Analysis", volume: "40", issue: "12", pages: "2481-2497", doi: "10.1111/risa.13574" },
  { type: "webpage", authors: [{ kind: "organization", name: "World Health Organization" }], date: { year: 2023, month: 5, day: 4 }, title: "Climate Change and Health", siteName: "WHO", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health", accessed: { year: 2024, month: 1, day: 2 } },
  { type: "book", authors: [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")], date: { year: 2022 }, title: "The Channels of Student Activism", publisher: "University of Chicago Press", place: "Chicago, IL, USA" },
  { type: "journal-article", authors: [person("Iacobellis", "Gaetano")], date: { year: 2020 }, title: "COVID-19 and Diabetes: Can DPP4 Inhibition Play a Role?", journal: "Diabetes Research and Clinical Practice", volume: "162", articleNumber: "108125" },
];
const record = (source: Source) => ({ source, provenance: "user-entered" as const });
const page = { kind: "page" as const, value: "45" };

const generated: Record<CheckerStyleId, { references: string[]; citations: string[] }> = {
  apa: { references: sources.map((s) => plainText(formatCitation(s).reference)), citations: sources.flatMap((s) => [plainText(formatCitation(s).parenthetical), plainText(formatCitation(s).narrative)]) },
  mla: { references: sources.map((s) => plainText(formatMla(record(s), page).worksCited)), citations: sources.map((s) => plainText(formatMla(record(s), page).parenthetical)) },
  "chicago-author-date": { references: sources.map((s) => plainText(formatChicagoAuthorDate(record(s), page).reference)), citations: sources.flatMap((s) => [plainText(formatChicagoAuthorDate(record(s), page).parenthetical), plainText(formatChicagoAuthorDate(record(s), page).narrative)]) },
  "chicago-notes-bibliography": {
    references: sources.map((s) => plainText(formatChicagoNotesBibliography({ record: record(s), locator: page }).bibliography)),
    citations: sources.flatMap((s) => [plainText(formatChicagoNotesBibliography({ record: record(s), locator: page }).fullNote), plainText(formatChicagoNotesBibliography({ record: record(s), locator: page }).shortNote)]),
  },
  ieee: {
    references: sources.map((s, i) => plainText(formatIeee({ source: s, provenance: "user-entered", number: String(i + 1) }).entry ?? [])),
    citations: sources.map((s, i) => plainText(formatIeee({ source: s, provenance: "user-entered", number: String(i + 1), locator: page }).citation ?? [])),
  },
  harvard: { references: sources.map((s) => plainText(formatHarvard({ record: record(s) }).reference)), citations: sources.flatMap((s) => [plainText(formatHarvard({ record: record(s), locator: page }).parenthetical), plainText(formatHarvard({ record: record(s), locator: page }).narrative)]) },
};

describe("generator output passes the same style's checks", () => {
  for (const [style, output] of Object.entries(generated) as [CheckerStyleId, (typeof generated)[CheckerStyleId]][]) {
    it(style, () => {
      const references = style === "ieee" ? output.references : [...output.references].sort((a, b) => a.localeCompare(b, "en"));
      const report = check(style, references.join("\n\n"), output.citations.join(style === "chicago-notes-bibliography" ? "\n" : " Then "));
      const found = [...report.references.flatMap((reference) => reference.issues), ...report.notices, ...report.citations.findings.flatMap((finding) => finding.issues)];
      assert.deepEqual(problems(found).map((item) => `${item.category}: ${item.message} ${item.evidence ?? ""}`), [], references.join("\n"));
      assert.equal(report.total, sources.length);
      assert.equal(report.citations.unmatched, 0);
      assert.equal(report.citations.uncited, 0);
      assert.ok(report.references.every((reference) => reference.confidence === "high"), style);
    });
  }
});
