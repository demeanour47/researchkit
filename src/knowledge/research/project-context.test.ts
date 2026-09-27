import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_PROJECT_FIELDS, PROJECT_CONTEXT_FIELDS, PROJECT_FIELDS, PROJECT_FIELD_LABELS, PROJECT_RECORD_FIELDS, createProjectDraft, describeProject, filledFields, updateProjectDraft } from "./research-project";
import { acceptance, checklistMethods, planMethods } from "../workspace/accepted";
import { recommendAnalyses } from "./data-analysis";
import { assumptionChecklist } from "./assumptions/checklist";
import { sleepProject } from "./questionnaire-test-helpers";

describe("the project's framing and records", () => {
  it("orders every field: framing, shared fields, then records", () => {
    assert.deepEqual([...ALL_PROJECT_FIELDS], [...PROJECT_CONTEXT_FIELDS, ...PROJECT_FIELDS, ...PROJECT_RECORD_FIELDS]);
    assert.equal(new Set(ALL_PROJECT_FIELDS).size, ALL_PROJECT_FIELDS.length);
    for (const field of ALL_PROJECT_FIELDS) assert.ok(PROJECT_FIELD_LABELS[field].length > 0, field);
  });

  it("tidies the title and keeps paragraphs in the problem, background and gap", () => {
    const draft = createProjectDraft({ projectTitle: "  Sleep\n study ", researchProblem: "One  line.\n\n\n\nTwo\nlines.", background: " ", researchGap: "Gap." });
    assert.deepEqual(draft, { projectTitle: "Sleep study", researchProblem: "One line.\n\nTwo lines.", researchGap: "Gap." });
  });

  it("keeps references and interpretation notes as lists without repeats or blanks", () => {
    const draft = createProjectDraft({ references: ["Smith (2020).", " smith (2020). ", "", "Jones (2021)."], interpretationNotes: [" A note. ", "A note."] });
    assert.deepEqual(draft.references, ["Smith (2020).", "Jones (2021)."]);
    assert.deepEqual(draft.interpretationNotes, ["A note."]);
  });

  it("keeps accepted methods sorted and without repeats, and drops empty records", () => {
    const draft = createProjectDraft({ dataAnalysisPlan: { methods: ["t-test", "anova", "t-test", " "], notes: "  Planned. " }, statisticalAssumptions: { methods: [], notes: "" } });
    assert.deepEqual(draft.dataAnalysisPlan, { methods: ["anova", "t-test"], notes: "Planned." });
    assert.equal(draft.statisticalAssumptions, undefined);
  });

  it("clears framing fields with null or empty values", () => {
    const draft = createProjectDraft({ projectTitle: "T", references: ["A"] });
    assert.deepEqual(updateProjectDraft(draft, { projectTitle: null, references: [] }), {});
  });

  it("describes the new fields in order, after the framing", () => {
    const draft = createProjectDraft({ topic: "Sleep", projectTitle: "Sleep study", references: ["A", "B"], dataAnalysisPlan: { methods: ["pearson"], notes: "" }, interpretationNotes: ["One."] });
    assert.deepEqual(filledFields(draft), ["projectTitle", "references", "topic", "dataAnalysisPlan", "interpretationNotes"]);
    assert.deepEqual(
      describeProject(draft).map((row) => `${row.label}: ${row.value}`),
      ["Project title: Sleep study", "References: A; B", "Topic: Sleep", "Data analysis plan: 1 analysis.", "Results interpretation notes: 1 interpretation kept."],
    );
    assert.equal(describeProject(createProjectDraft({ statisticalAssumptions: { methods: ["a", "b"], notes: "Check normality." } }))[0].value, "2 analyses. Check normality.");
  });

  it("leaves the tools' own fields untouched when the framing changes", () => {
    const project = sleepProject();
    const next = updateProjectDraft(project, { projectTitle: "New", researchGap: "Gap." });
    for (const field of PROJECT_FIELDS) assert.deepEqual(next[field], project[field], field);
  });
});

describe("accepted results", () => {
  const project = sleepProject();
  const methods = planMethods(recommendAnalyses(project));

  it("lists a plan's analyses sorted and without repeats", () => {
    assert.ok(methods.length > 0);
    assert.deepEqual(methods, [...new Set(methods)].sort());
    const checklist = checklistMethods(assumptionChecklist(project));
    assert.deepEqual(checklist, [...new Set(checklist)].sort());
  });

  it("tells unsaved, saved and changed apart", () => {
    assert.equal(acceptance(undefined, methods), "unsaved");
    assert.equal(acceptance({ methods, notes: "" }, methods), "saved");
    assert.equal(acceptance({ methods: methods.slice(1), notes: "" }, methods), "changed");
    assert.equal(acceptance({ methods: [...methods.slice(1), "zzz"], notes: "" }, methods), "changed");
  });
});
