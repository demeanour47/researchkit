import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTable } from "../charts/table";
import { createProjectDraft } from "../research/research-project";
import { EMPTY_TYPED_PROJECT, projectFromTyped, type TypedProject } from "../research/typed-project";
import type { MeasurementLevel } from "../research/variable-types";
import { PLACEHOLDERS, hypothesisLabel, hypothesisSummary, measurementScaleTable, operationalizationTable, questionnaireSummaryTable, sampleSizeSummary } from "./build-project";
import { DEFAULT_TABLE_OPTIONS, type ResearchTable, type TableOptions } from "./types";

const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const texts = (table: ResearchTable) => table.rows.map((row) => row.cells.map((cell) => cell.text));
const built = (result: { table: ResearchTable | null; issues: unknown[] }) => {
  assert.ok(result.table, JSON.stringify(result.issues));
  return result.table;
};
const messages = (result: { issues: { message: string }[] }) => result.issues.map((issue) => issue.message).join(" | ");

const typed: TypedProject = {
  ...EMPTY_TYPED_PROJECT,
  researchQuestion: "How is screen time related to sleep quality?",
  independent: "screen time\nfaculty",
  dependent: "sleep quality: time to fall asleep; feeling rested",
  control: "gender",
  choice: "quantitative",
  design: "correlational",
  technique: "stratified",
  margin: "5",
  hypotheses: "relationship",
};
const levels: Record<string, MeasurementLevel> = { "var-screen-time": "ratio", "var-faculty": "nominal", "var-sleep-quality": "likert", "var-gender": "binary" };
const project = projectFromTyped(typed, levels);
const empty = createProjectDraft({});

describe("hypothesisSummary", () => {
  const table = built(hypothesisSummary(project, null, options()));
  it("lists each alternative hypothesis with its label and planned analysis", () => {
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Hypothesis", "Statement", "Analysis", "p", "Decision"]);
    assert.deepEqual(texts(table).map((row) => row[0]), ["H1", "H2"]);
    assert.match(texts(table)[0][1], /screen time and sleep quality/);
    assert.match(texts(table)[0][2], /Pearson correlation/);
  });
  it("leaves decisions as placeholders until p-values are given", () => {
    assert.deepEqual(texts(table).map((row) => row[4]), [PLACEHOLDERS.result, PLACEHOLDERS.result]);
    assert.match(table.notes.general.join(" "), /Enter each hypothesis's p-value/);
  });
  it("decides from pasted p-values at the chosen level", () => {
    const decided = built(hypothesisSummary(project, parseTable("Hypothesis,p\nH1,0.003\nh2,0.214").table, options()));
    assert.deepEqual(texts(decided).map((row) => row.slice(3)), [
      [".003", "Supported"],
      [".214", "Not supported"],
    ]);
    assert.match(decided.notes.general.join(" "), /p < \.05\. Check that the effect is also in the predicted direction/);
  });
  it("uses the chosen significance level", () => {
    const strict = built(hypothesisSummary(project, parseTable("Hypothesis,p\nH1,0.03").table, options({ alpha: 0.01 })));
    assert.equal(texts(strict)[0][4], "Not supported");
  });
  it("treats p equal to the level as not significant", () => {
    assert.equal(texts(built(hypothesisSummary(project, parseTable("H,p\nH1,0.05").table, options())))[0][4], "Not supported");
  });
  it("warns about labels that match no hypothesis, and impossible p-values", () => {
    const result = hypothesisSummary(project, parseTable("H,p\nH7,0.01\nH1,1.5").table, options());
    assert.match(messages(result), /H7 doesn't match a hypothesis/);
    assert.match(messages(result), /p-values lie between 0 and 1/);
  });
  it("needs hypotheses", () => {
    assert.equal(hypothesisSummary(empty, null, options()).table, null);
  });
  it("labels hypotheses H1, H2 and so on", () => {
    assert.deepEqual([0, 1, 9].map(hypothesisLabel), ["H1", "H2", "H10"]);
  });
});

describe("operationalizationTable", () => {
  const result = operationalizationTable(project, options());
  const table = built(result);
  it("gives each variable's definitions, indicators, level and scale", () => {
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Variable", "Type", "Conceptual definition", "Operational definition", "Indicators", "Measurement level", "Scale"]);
    const sleep = texts(table).find((row) => row[0] === "sleep quality")!;
    assert.deepEqual(sleep.slice(1), ["Dependent variable", "[conceptual definition]", "[operational definition]", "time to fall asleep; feeling rested", "Likert", "[scale]"]);
  });
  it("points out placeholders and suggests landscape", () => {
    assert.match(messages(result), /square brackets/);
    assert.match(messages(result), /landscape/);
    assert.doesNotMatch(messages(operationalizationTable(project, options({ orientation: "landscape" }))), /landscape/);
  });
  it("needs variables", () => {
    assert.equal(operationalizationTable(empty, options()).table, null);
  });
});

describe("measurementScaleTable", () => {
  const table = built(measurementScaleTable(project, options()));
  it("counts items and describes each scale from the drafted questionnaire", () => {
    const sleep = texts(table).find((row) => row[0] === "sleep quality")!;
    assert.equal(sleep[1], "2");
    assert.match(sleep[2], /^5-point \(Strongly disagree to Strongly agree\)$/);
    assert.equal(sleep[3], "Likert");
  });
  it("never invents a source", () => {
    assert.ok(texts(table).every((row) => row[4] === PLACEHOLDERS.source));
    assert.match(table.notes.general.join(" "), /drafted from your variables/);
  });
  it("needs variables", () => {
    assert.equal(measurementScaleTable(empty, options()).table, null);
  });
});

describe("questionnaireSummaryTable", () => {
  const table = built(questionnaireSummaryTable(project, options()));
  it("summarises each section with questions, items, types and variables", () => {
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Section", "Questions", "Items", "Question types", "Variables measured"]);
    assert.ok(texts(table).length >= 2);
    assert.ok(texts(table).some((row) => /sleep quality/.test(row[4])));
    assert.match(texts(table)[0][1], /^\d+(–\d+)?$/);
  });
  it("counts the items in the note", () => {
    assert.match(table.notes.general[0], /^The questionnaire has \d+ items/);
  });
  it("needs a questionnaire or variables", () => {
    assert.equal(questionnaireSummaryTable(empty, options()).table, null);
  });
});

describe("sampleSizeSummary", () => {
  const result = sampleSizeSummary(project, options());
  const table = built(result);
  it("lists the values behind the sample size", () => {
    const rows = Object.fromEntries(texts(table).map(([parameter, value]) => [parameter, value]));
    assert.equal(rows["Sampling technique"], "Stratified");
    assert.equal(rows["Method"], "Cochran formula");
    assert.equal(rows["Confidence level"], "95%");
    assert.equal(rows["Margin of error"], "±5%");
    assert.equal(rows["Required sample"], "385");
    assert.equal(rows["Target population"], PLACEHOLDERS.population);
  });
  it("points out what the project doesn't record", () => {
    assert.match(messages(result), /square brackets/);
  });
  it("names the method in the note", () => {
    assert.match(table.notes.general[0], /Cochran formula/);
  });
  it("needs a sample size plan", () => {
    assert.equal(sampleSizeSummary(empty, options()).table, null);
  });
});
