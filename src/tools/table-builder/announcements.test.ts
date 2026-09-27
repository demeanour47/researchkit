import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_TABLE_OPTIONS, TABLE_TYPE_INFO, buildTable, recommendTables } from "../../knowledge/tables";
import { projectFromTyped } from "../../knowledge/research";
import { announcements, tableAnnouncement } from "./announcements";
import { exampleLevels, exampleProject } from "./example";

const project = projectFromTyped(exampleProject, { ...exampleLevels });

describe("tableAnnouncement", () => {
  it("announces a built table with its rows", () => {
    const result = buildTable({ type: "descriptive-statistics", text: TABLE_TYPE_INFO["descriptive-statistics"].example, project, options: DEFAULT_TABLE_OPTIONS });
    assert.equal(tableAnnouncement("descriptive-statistics", result), "Descriptive statistics built: 3 rows.");
  });
  it("counts points to check without grading", () => {
    const result = { table: buildTable({ type: "custom", text: "A,B\n1,2", project, options: DEFAULT_TABLE_OPTIONS }).table, issues: [{ severity: "warning" as const, message: "w" }] };
    assert.equal(tableAnnouncement("custom", result), "Custom table built: 1 row. 1 point to check.");
  });
  it("gives the first problem stopping the table", () => {
    assert.match(tableAnnouncement("anova", buildTable({ type: "anova", text: "Source,F\nA,2", project, options: DEFAULT_TABLE_OPTIONS })), /^ANOVA table can't be built yet: An ANOVA table needs columns named SS/);
  });
  it("names example data as fictional", () => {
    assert.equal(announcements.exampleLoaded("frequency"), "Example data loaded: Frequency distribution. It is fictional.");
    assert.equal(announcements.exported("DOCX"), "DOCX downloaded.");
  });
});

describe("the example project", () => {
  it("builds every project table", () => {
    for (const type of ["hypothesis-summary", "operationalization", "measurement-scale", "questionnaire-summary", "sample-size-summary"] as const) {
      assert.ok(buildTable({ type, text: "", project, options: DEFAULT_TABLE_OPTIONS }).table, type);
    }
  });
  it("is suggested a correlation matrix and hypothesis summary", () => {
    const types = recommendTables(project).map((suggestion) => suggestion.type);
    assert.ok(types.includes("correlation-matrix"));
    assert.ok(types.includes("hypothesis-summary"));
  });
});
