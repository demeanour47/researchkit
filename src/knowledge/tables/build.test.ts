import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_TYPED_PROJECT, projectFromTyped } from "../research/typed-project";
import { buildTable, canShow, tableIssues } from "./build";
import { applyTableStyle } from "./styles";
import { DEFAULT_TABLE_OPTIONS, TABLE_GROUPS, TABLE_GROUP_LABELS, TABLE_STYLES, TABLE_TYPES, TABLE_TYPE_INFO, UNNUMBERED_TYPES, getTableType, typeDefaults, type ResearchTable, type TableOptions, type TableType } from "./types";

const project = projectFromTyped(
  { ...EMPTY_TYPED_PROJECT, independent: "screen time\nfaculty", dependent: "sleep quality: time to fall asleep; feeling rested", control: "gender", design: "correlational", technique: "stratified", margin: "5", hypotheses: "relationship" },
  { "var-screen-time": "ratio", "var-faculty": "nominal", "var-sleep-quality": "likert", "var-gender": "binary" },
);
const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const build = (type: TableType, changes: Partial<TableOptions> = {}, text = TABLE_TYPE_INFO[type].example) => buildTable({ type, text, project, options: options(changes) });

describe("the table catalogue", () => {
  it("has 26 table types, each fully described", () => {
    assert.equal(TABLE_TYPES.length, 26);
    for (const type of TABLE_TYPES) {
      const info = TABLE_TYPE_INFO[type];
      assert.ok(info.label && info.description.endsWith(".") && info.bestFor.endsWith(".") && info.defaultTitle, type);
      assert.ok(TABLE_GROUPS.includes(info.group), type);
      if (info.source !== "project") assert.ok(info.example && info.layout, type);
    }
  });
  it("labels every group", () => {
    for (const group of TABLE_GROUPS) assert.ok(TABLE_GROUP_LABELS[group]);
  });
  it("refuses unknown types", () => {
    assert.throws(() => getTableType("pivot" as never), /Unknown table type: pivot/);
  });
  it("starts front matter without rules", () => {
    assert.deepEqual(typeDefaults("table-of-contents"), { borders: "none" });
    assert.deepEqual(typeDefaults("anova"), {});
    assert.equal(UNNUMBERED_TYPES.size, 3);
  });
});

describe("buildTable: every type's example", () => {
  for (const type of TABLE_TYPES) {
    const label = TABLE_TYPE_INFO[type].label.toLowerCase();
    it(`builds the ${label} without problems`, () => {
      const result = build(type);
      assert.ok(canShow(result), JSON.stringify(result.issues));
      assert.deepEqual(
        result.issues.filter((issue) => issue.severity === "problem"),
        [],
      );
    });
    it(`gives the ${label} a consistent shape`, () => {
      const table = build(type).table as ResearchTable;
      const width = (cells: readonly { span?: number }[]) => cells.reduce((sum, cell) => sum + (cell.span ?? 1), 0);
      for (const header of table.header) assert.equal(width(header), table.columns, `header of ${type}`);
      for (const row of table.rows) assert.equal(width(row.cells), table.columns, `row of ${type}`);
      assert.ok(table.rows.length > 0);
    });
    it(`titles the ${label} with its default, or the researcher's title`, () => {
      assert.equal(build(type).table?.title, TABLE_TYPE_INFO[type].defaultTitle);
      assert.equal(build(type, { title: "  My title " }).table?.title, "My title");
    });
    it(`builds the ${label} in every style`, () => {
      for (const style of TABLE_STYLES) assert.ok(buildTable({ type, text: TABLE_TYPE_INFO[type].example, project, options: applyTableStyle(options(), style) }).table, style);
    });
  }
});

describe("buildTable: empty input", () => {
  for (const type of TABLE_TYPES.filter((candidate) => TABLE_TYPE_INFO[candidate].source !== "project" && candidate !== "hypothesis-summary")) {
    it(`asks for input for an empty ${TABLE_TYPE_INFO[type].label.toLowerCase()}`, () => {
      const result = build(type, {}, "");
      assert.equal(result.table, null);
      assert.ok(result.issues.some((issue) => issue.severity === "problem"));
    });
  }
  it("builds project tables without any pasted text", () => {
    for (const type of ["operationalization", "measurement-scale", "questionnaire-summary", "sample-size-summary", "hypothesis-summary"] as TableType[]) assert.ok(build(type, {}, "").table, type);
  });
  it("refuses decimals outside 0 to 6", () => {
    assert.equal(build("descriptive-statistics", { decimals: 9 }).table, null);
  });
});

describe("tableIssues", () => {
  const base = build("custom").table as ResearchTable;
  it("points out note marks without text", () => {
    const marked = { ...base, rows: [{ kind: "body" as const, cells: [{ text: "A", notes: ["a"] }, { text: "1" }, { text: "2" }, { text: "3" }] }] };
    assert.match(tableIssues(marked, options()).map((issue) => issue.message).join(" "), /Note “a” is marked in the table but has no text/);
    assert.deepEqual(tableIssues(marked, options({ footnotes: "Explained." })), []);
  });
  it("suggests landscape for wide tables", () => {
    assert.match(tableIssues({ ...base, columns: 11 }, options()).map((issue) => issue.message).join(" "), /11 columns may not fit a portrait page/);
    assert.deepEqual(tableIssues({ ...base, columns: 11 }, options({ orientation: "landscape" })), []);
  });
  it("mentions continuation for long tables", () => {
    const long = { ...base, rows: Array.from({ length: 45 }, () => base.rows[0]) };
    assert.match(tableIssues(long, options()).map((issue) => issue.message).join(" "), /With 45 rows the table will run over pages; its header repeats\./);
  });
  it("asks for a brief title", () => {
    assert.match(tableIssues(base, options({ title: "x".repeat(160) })).map((issue) => issue.message).join(" "), /The title is long/);
  });
});
