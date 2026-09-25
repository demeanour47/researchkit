import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROJECT_FIELDS,
  PROJECT_FIELD_LABELS,
  createProjectDraft,
  describeProject,
  filledFields,
  parseList,
  updateProjectDraft,
  type ResearchProjectDraft,
} from "./research-project";

const hypothesis = {
  id: "main-1-1-null",
  role: "null" as const,
  text: "There is no relationship between screen time and sleep quality.",
  relationship: {
    kind: "main" as const,
    form: "relationship" as const,
    direction: "non-directional" as const,
    independentVariables: ["screen time"],
    dependentVariables: ["sleep quality"],
    moderators: [],
    mediators: [],
    controls: [],
    population: null,
    context: null,
  },
};

const variable = {
  id: "var-screen-time",
  name: "screen time",
  shortName: "screen time",
  description: "",
  variableType: "independent" as const,
  measurementLevel: null,
  measurementScale: "",
  conceptualDefinition: "",
  operationalDefinition: "",
  possibleIndicators: [],
  questionnaireItems: [],
  notes: "",
  sources: [{ kind: "list" as const, asKind: "independent" as const, references: [] }],
};

const questionnaire = {
  title: "Sleep survey",
  sections: [{ id: "section-a", kind: "items" as const, title: "Section A", content: "" }],
  questions: [
    { id: "q-1", section: "section-a", text: "How many hours did you sleep last night?", type: "numeric" as const, variableId: null, indicatorId: null, required: true, helpText: "", notes: "", options: [], rows: [], scale: null },
  ],
};

const sampleSize = {
  method: "cochran" as const,
  inputs: { populationType: "unknown" as const, populationSize: null, confidence: 95 as const, margin: 5, proportion: 50, responseRate: null, designEffect: 1 },
  justification: "",
  notes: "",
};

const sampling = {
  population: {
    targetPopulation: "Nurses",
    accessiblePopulation: "",
    samplingFrame: "",
    unitOfAnalysis: "",
    unitOfObservation: "",
    geographicalCoverage: "",
    inclusionCriteria: [],
    exclusionCriteria: [],
    samplingLocation: "",
  },
  chosen: null,
  shortlist: [],
  reason: "",
  selectionProcedure: "",
  expectedResponseRate: null,
  potentialBiases: "",
  mitigation: "",
  notes: "",
  answers: {},
};

const design = { chosen: "survey" as const, shortlist: ["survey" as const], justification: "Fits the question.", notes: "", answers: { timing: "once" } };

const framework = {
  variables: [{ id: "v-screen-time", name: "screen time", shortLabel: "screen time", description: "", type: "independent" as const }],
  relationships: [],
  positions: {},
};

describe("createProjectDraft", () => {
  it("creates an empty draft", () => {
    assert.deepEqual(createProjectDraft(), {});
    assert.deepEqual(filledFields(createProjectDraft()), []);
  });

  it("keeps every field it is given, cleaned", () => {
    const draft = createProjectDraft({
      researchArea: "  Public health ",
      topic: "sleep and\n  learning",
      researchAim: "To examine sleep",
      researchQuestion: "What is sleep like?",
      researchObjectives: ["Measure sleep", " "],
      population: "students",
      location: "Nepal",
      timeContext: "2025",
      independentVariables: ["screen time", "Screen Time", ""],
      dependentVariables: ["sleep quality"],
      moderatorVariables: ["gender"],
      mediatorVariables: ["bedtime"],
      controlVariables: ["age"],
      variables: [variable],
      hypotheses: [hypothesis],
      conceptualFramework: framework,
      researchDesign: design,
      samplingPlan: sampling,
      sampleSizePlan: sampleSize,
      questionnaire,
      methodology: "quantitative",
      researchOnionSelection: { philosophy: "positivism" },
      notes: "Check access",
    });
    assert.deepEqual(draft, {
      researchArea: "Public health",
      topic: "sleep and learning",
      researchAim: "To examine sleep",
      researchQuestion: "What is sleep like?",
      researchObjectives: ["Measure sleep"],
      population: "students",
      location: "Nepal",
      timeContext: "2025",
      independentVariables: ["screen time"],
      dependentVariables: ["sleep quality"],
      moderatorVariables: ["gender"],
      mediatorVariables: ["bedtime"],
      controlVariables: ["age"],
      variables: [variable],
      hypotheses: [hypothesis],
      conceptualFramework: framework,
      researchDesign: design,
      samplingPlan: sampling,
      sampleSizePlan: sampleSize,
      questionnaire,
      methodology: "quantitative",
      researchOnionSelection: { philosophy: "positivism" },
      notes: "Check access",
    });
    assert.deepEqual(filledFields(draft), [...PROJECT_FIELDS]);
  });

  it("drops empty values rather than storing them", () => {
    assert.deepEqual(createProjectDraft({ topic: "   ", independentVariables: [" ", ""], researchOnionSelection: {} }), {});
  });

  it("does not share arrays or objects with its input", () => {
    const variables = ["screen time"];
    const draft = createProjectDraft({ independentVariables: variables });
    variables.push("caffeine");
    assert.deepEqual(draft.independentVariables, ["screen time"]);
  });
});

describe("updateProjectDraft", () => {
  const base: ResearchProjectDraft = createProjectDraft({ topic: "sleep", population: "students", dependentVariables: ["sleep quality"] });

  it("returns a new draft and leaves the original unchanged", () => {
    const updated = updateProjectDraft(base, { population: "nurses" });
    assert.equal(updated.population, "nurses");
    assert.equal(base.population, "students");
    assert.notEqual(updated, base);
  });

  it("changes only the fields given", () => {
    assert.deepEqual(updateProjectDraft(base, { location: "Kenya" }), { ...base, location: "Kenya" });
    assert.deepEqual(updateProjectDraft(base, {}), base);
  });

  it("clears a field given null, an empty string or an empty list", () => {
    assert.equal("population" in updateProjectDraft(base, { population: null }), false);
    assert.equal("topic" in updateProjectDraft(base, { topic: "  " }), false);
    assert.equal("dependentVariables" in updateProjectDraft(base, { dependentVariables: [] }), false);
  });

  it("lets later tools add information progressively", () => {
    const fromOnion = updateProjectDraft(base, { researchOnionSelection: { philosophy: "interpretivism", approach: "inductive" } });
    const fromBuilder = updateProjectDraft(fromOnion, { researchQuestion: "How do students experience sleep loss?" });
    assert.deepEqual(fromBuilder.researchOnionSelection, { philosophy: "interpretivism", approach: "inductive" });
    assert.equal(fromBuilder.researchQuestion, "How do students experience sleep loss?");
    assert.equal(fromBuilder.topic, "sleep");
  });

  it("rejects an unknown methodology or onion choice", () => {
    assert.throws(() => updateProjectDraft(base, { methodology: "astrology" as never }), { name: "RangeError", message: "Unknown methodology: astrology" });
    assert.throws(() => updateProjectDraft(base, { researchOnionSelection: { philosophy: "survey" } }), RangeError);
  });

  it("drops onion layers left unchosen", () => {
    assert.deepEqual(updateProjectDraft(base, { researchOnionSelection: { philosophy: "realism", approach: undefined } }).researchOnionSelection, {
      philosophy: "realism",
    });
  });
});

describe("hypotheses in the project draft", () => {
  it("cleans hypothesis wording and relationship values", () => {
    const draft = createProjectDraft({
      hypotheses: [{ ...hypothesis, text: "  There is no relationship\n between screen time and sleep quality. ", relationship: { ...hypothesis.relationship, controls: [" age ", "Age"], population: "  " } }],
    });
    assert.equal(draft.hypotheses?.[0].text, "There is no relationship between screen time and sleep quality.");
    assert.deepEqual(draft.hypotheses?.[0].relationship.controls, ["age"]);
    assert.equal(draft.hypotheses?.[0].relationship.population, null);
  });

  it("rejects an unknown relationship kind or direction", () => {
    assert.throws(() => createProjectDraft({ hypotheses: [{ ...hypothesis, relationship: { ...hypothesis.relationship, kind: "causal" as never } }] }), {
      message: "Unknown relationship kind: causal",
    });
    assert.throws(() => createProjectDraft({ hypotheses: [{ ...hypothesis, relationship: { ...hypothesis.relationship, direction: "up" as never } }] }), {
      message: "Unknown direction: up",
    });
  });

  it("describes hypotheses with their conventional symbols", () => {
    const [row] = describeProject(createProjectDraft({ hypotheses: [hypothesis, { ...hypothesis, id: "main-1-1-alternative", role: "alternative", text: "There is a relationship." }] }));
    assert.equal(row.value, "H₀: There is no relationship between screen time and sleep quality. H₁: There is a relationship.");
  });
});

describe("parseList", () => {
  it("splits one item per line or by semicolons", () => {
    assert.deepEqual(parseList("screen time\n caffeine ;stress\n\n"), ["screen time", "caffeine", "stress"]);
    assert.deepEqual(parseList(""), []);
  });

  it("keeps commas, which can be part of a variable's name", () => {
    assert.deepEqual(parseList("income, before tax"), ["income, before tax"]);
  });
});

describe("describeProject", () => {
  it("describes each filled field in order, with readable values", () => {
    const draft = createProjectDraft({
      topic: "sleep",
      independentVariables: ["screen time", "caffeine"],
      methodology: "mixed-methods",
      researchOnionSelection: { approach: "abductive", philosophy: "pragmatism" },
    });
    assert.deepEqual(describeProject(draft), [
      { field: "topic", label: "Topic", value: "sleep" },
      { field: "independentVariables", label: "Independent variables", value: "screen time; caffeine" },
      { field: "methodology", label: "Methodology", value: "Mixed methods" },
      { field: "researchOnionSelection", label: "Research onion choices", value: "Research philosophy: Pragmatism; Research approach: Abductive" },
    ]);
  });

  it("labels every field", () => {
    for (const field of PROJECT_FIELDS) assert.ok(PROJECT_FIELD_LABELS[field].length > 0);
  });
});
