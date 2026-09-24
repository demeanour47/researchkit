import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectOfShape } from "./conceptual-test-helpers";
import { COMPARISON_ASPECTS, DESIGN_LIMITATIONS, DESIGN_REVIEW_ITEMS, applyDesign, compareDesigns, comparisonTable } from "./design-summary";
import { DESIGN_IDS, getDesign } from "./design-types";
import { EMPTY_DESIGN, chooseDesign, setJustification, shortlistDesign } from "./research-design";
import { PROJECT_FIELDS, describeProject } from "./research-project";

describe("compareDesigns", () => {
  it("compares the required aspects side by side", () => {
    assert.deepEqual(COMPARISON_ASPECTS.map((aspect) => aspect.label), [
      "Purpose",
      "Data collection",
      "Data analysis",
      "Strengths",
      "Limitations",
      "Typical sample",
      "Time requirement",
      "Resource requirement",
      "Common academic use",
    ]);
  });

  it("gives one value per design per aspect, in the order given, without repeats", () => {
    const comparison = compareDesigns(["survey", "case-study", "survey"]);
    assert.deepEqual(comparison.designs, [
      { id: "survey", name: "Survey" },
      { id: "case-study", name: "Case study" },
    ]);
    assert.deepEqual(comparison.rows[0], { aspect: "purpose", label: "Purpose", values: [getDesign("survey").purpose, getDesign("case-study").purpose] });
    for (const row of comparison.rows) assert.equal(row.values.length, 2);
  });

  it("compares every design at once", () => {
    const comparison = compareDesigns(DESIGN_IDS);
    assert.equal(comparison.designs.length, 21);
    for (const row of comparison.rows) for (const value of row.values) assert.ok(value.length > 3, row.label);
  });

  it("compares nothing when no designs are given", () => {
    assert.deepEqual(compareDesigns([]).designs, []);
  });

  it("rejects unknown designs", () => {
    assert.throws(() => compareDesigns(["delphi" as never]), RangeError);
  });
});

describe("comparisonTable", () => {
  it("writes tab-separated text with one row per aspect", () => {
    const lines = comparisonTable(["survey", "experimental"]).split("\n");
    assert.equal(lines.length, 1 + COMPARISON_ASPECTS.length);
    assert.equal(lines[0], "Aspect\tSurvey\tExperimental");
    assert.equal(lines[1], `Purpose\t${getDesign("survey").purpose}\t${getDesign("experimental").purpose}`);
    for (const line of lines) assert.equal(line.split("\t").length, 3);
  });
});

describe("applyDesign", () => {
  const project = projectOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 0, controls: 1 });
  const record = setJustification(chooseDesign(shortlistDesign(EMPTY_DESIGN, "survey"), "correlational"), "Fits.");

  it("updates only the research design section of the project draft", () => {
    const updated = applyDesign(project, record);
    for (const field of PROJECT_FIELDS) if (field !== "researchDesign") assert.deepEqual(updated[field], project[field], field);
    assert.deepEqual(updated.researchDesign, { chosen: "correlational", shortlist: ["survey", "correlational"], justification: "Fits.", notes: "", answers: {} });
    assert.equal(project.researchDesign, undefined);
  });

  it("describes the section, and clears it for an empty record", () => {
    assert.deepEqual(describeProject(applyDesign({}, record)), [{ field: "researchDesign", label: "Research design", value: "Chosen: Correlational. Considering: Survey, Correlational." }]);
    assert.deepEqual(describeProject(applyDesign({}, shortlistDesign(EMPTY_DESIGN, "survey"))), [{ field: "researchDesign", label: "Research design", value: "No design chosen. Considering: Survey." }]);
    assert.equal(applyDesign(project, EMPTY_DESIGN).researchDesign, undefined);
  });
});

describe("limitations and review items", () => {
  it("states that the tool never chooses for the researcher", () => {
    assert.match(DESIGN_LIMITATIONS[0], /never chooses a design for you/);
    assert.ok(DESIGN_LIMITATIONS.some((item) => item.includes("Nothing is saved")));
  });

  it("leaves placeholders for academic review, methodology review, design examples and references", () => {
    assert.deepEqual(DESIGN_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Academic review", "Methodology review", "Design examples", "References"]);
  });
});
