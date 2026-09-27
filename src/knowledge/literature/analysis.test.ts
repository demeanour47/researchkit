import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProjectDraft } from "../research/research-project";
import { EMPTY_TYPED_PROJECT, projectFromTyped } from "../research/typed-project";
import { compareStudies } from "./compare";
import { contentWords, GAP_KINDS, GAP_KIND_LABELS, potentialGaps, similarStatements, statedGaps, statements } from "./gaps";
import { updateField } from "./matrix";
import { detectPatterns, itemStudyLabels, MIN_STUDIES_FOR_PATTERNS, PATTERN_GROUPS, PATTERN_TITLES, type PatternGroup } from "./patterns";
import { coveredVariables, isEmptyLens, mentions, projectLens, studyVariables, type ProjectLens } from "./project";
import { synthesis, synthesisMarkdown, synthesisText } from "./summary";
import { SAMPLE_MATRIX, study } from "./test-helpers";
import { isProbabilitySampling, KNOWN_IDS, matchConcept, matchConcepts, termKey, theoriesInText, type ConceptKind } from "./vocab";

const lens = (variables: ProjectLens["variables"] = []): ProjectLens => ({ topic: "", researchQuestion: "", objectives: [], hypotheses: [], variables });
const patterns = detectPatterns(SAMPLE_MATRIX);
const group = (id: PatternGroup["id"]) => patterns.groups.find((candidate) => candidate.id === id)!;

describe("matchConcept", () => {
  const cases: [ConceptKind, string, string | null][] = [
    ["design", "Cross-sectional survey", "cross-sectional"],
    ["design", "Quasi-experiment", "quasi-experimental"],
    ["design", "Randomised controlled trial", "true-experimental"],
    ["design", "Laboratory experiment", "experimental"],
    ["design", "Longitudinal panel study", "longitudinal"],
    ["design", "Multiple case study", "case-study"],
    ["design", "Interpretative phenomenology", "phenomenology"],
    ["design", "Grounded theory", "grounded-theory"],
    ["design", "Explanatory sequential mixed methods", "sequential-mixed"],
    ["design", "Convergent mixed methods", "concurrent-mixed"],
    ["design", "Meta-synthesis", null],
    ["sampling", "Stratified random sampling", "stratified"],
    ["sampling", "Simple random sampling", "simple-random"],
    ["sampling", "Random", "simple-random"],
    ["sampling", "Convenience sampling", "convenience"],
    ["sampling", "Purposeful", "purposive"],
    ["sampling", "Snowball", "snowball"],
    ["sampling", "Chain-referral", "snowball"],
    ["sampling", "Multi-stage cluster", "cluster"],
    ["sampling", "Quota sampling", "quota"],
    ["sampling", "Self-selected volunteers", "volunteer"],
    ["sampling", "Whoever came", null],
    ["analysis", "PLS-SEM", "pls-sem"],
    ["analysis", "SmartPLS", "pls-sem"],
    ["analysis", "AMOS", "cb-sem"],
    ["analysis", "Structural equation modelling", "sem"],
    ["analysis", "Hierarchical multiple regression", "hierarchical-regression"],
    ["analysis", "Multiple linear regression", "multiple-regression"],
    ["analysis", "Binary logistic regression", "logistic-regression"],
    ["analysis", "OLS regression", "regression"],
    ["analysis", "Independent-samples t-test", "independent-t-test"],
    ["analysis", "Paired t-test", "paired-t-test"],
    ["analysis", "One-way ANOVA", "one-way-anova"],
    ["analysis", "Repeated-measures ANOVA", "repeated-measures-anova"],
    ["analysis", "MANOVA", "manova"],
    ["analysis", "Chi-square test", "chi-square"],
    ["analysis", "Mann-Whitney U", "mann-whitney"],
    ["analysis", "Pearson correlation", "pearson"],
    ["analysis", "Confirmatory factor analysis (CFA)", "factor-analysis"],
    ["analysis", "Cronbach's alpha", "cronbach-alpha"],
    ["analysis", "Thematic analysis", "thematic-analysis"],
    ["analysis", "Qualitative content analysis", "content-analysis"],
    ["analysis", "Meta-analysis", "meta-analysis"],
    ["philosophy", "Positivist", "positivism"],
    ["philosophy", "Constructivism", "interpretivism"],
    ["philosophy", "Critical realism", "realism"],
    ["approach", "Deductive", "deductive"],
    ["approach", "Mixed methods", "mixed-methods"],
    ["approach", "Qualitative", "qualitative"],
    ["collection", "Online questionnaire", "questionnaire"],
    ["collection", "Semi-structured interviews", "interview"],
    ["collection", "Focus groups", "focus-group"],
    ["collection", "Archival records", "secondary"],
    ["collection", "", null],
  ];
  for (const [kind, text, id] of cases)
    it(`reads the ${kind} “${text}” as ${id ?? "nothing known"}`, () => {
      assert.equal(matchConcept(kind, text)?.id ?? null, id);
    });
  it("explains every concept it knows in sentences", () => {
    for (const [kind, text] of cases) {
      const concept = matchConcept(kind, text);
      if (!concept) continue;
      assert.match(concept.why, /\.$/, `${kind}: ${concept.why}`);
      assert.ok(concept.label, kind);
    }
  });
  it("names sampling techniques as sampling", () => {
    assert.equal(matchConcept("sampling", "convenience")?.label, "Convenience sampling");
  });
  it("finds several designs in one entry, preferring the specific experiment", () => {
    assert.deepEqual(matchConcepts("design", "Cross-sectional survey").map((concept) => concept.id), ["cross-sectional", "survey"]);
    assert.deepEqual(matchConcepts("design", "Quasi-experiment").map((concept) => concept.id), ["quasi-experimental"]);
    assert.deepEqual(matchConcepts("analysis", "Multiple regression").map((concept) => concept.id), ["multiple-regression"]);
  });
  it("lists the ids each kind can match", () => {
    for (const kind of Object.keys(KNOWN_IDS) as ConceptKind[]) assert.ok(KNOWN_IDS[kind].length > 0);
    assert.ok(KNOWN_IDS.analysis.includes("thematic-analysis"));
  });
  it("tells probability from non-probability sampling", () => {
    assert.equal(isProbabilitySampling("stratified"), true);
    assert.equal(isProbabilitySampling("convenience"), false);
    assert.equal(isProbabilitySampling("thematic"), false);
  });
});

describe("terms and theories", () => {
  it("reduces terms for counting", () => {
    assert.equal(termKey("Technology Acceptance Model (TAM)"), "technology acceptance model");
    assert.equal(termKey("  Sleep-Quality! "), "sleep-quality");
    assert.equal(termKey("Müller's model"), "muller's model");
  });
  it("finds theories named in text", () => {
    assert.deepEqual(theoriesInText("Drawing on the Technology Acceptance Model and Self-Determination Theory, we test…").sort(), ["Self-Determination Theory", "Technology Acceptance Model"]);
    assert.deepEqual(theoriesInText("Based on the theory of planned behaviour, we…"), ["Theory of planned behaviour"]);
    assert.deepEqual(theoriesInText("This model is new."), []);
  });
});

describe("detectPatterns", () => {
  it("covers every pattern group", () => {
    assert.deepEqual(patterns.groups.map((candidate) => candidate.id), [...PATTERN_GROUPS]);
    for (const id of PATTERN_GROUPS) assert.ok(PATTERN_TITLES[id]);
    assert.equal(patterns.studies, 6);
  });
  it("finds repeated variables across columns, counting each study once", () => {
    assert.deepEqual(group("variables").repeated.map((item) => [item.label, item.count]), [["sleep quality", 4], ["screen time", 3]]);
  });
  it("explains a repeated variable with its roles", () => {
    assert.match(group("variables").repeated[0].explanation, /sleep quality is studied in 4 of 6 studies that report variables \(as dependent in 4\)/);
  });
  it("finds repeated relationships", () => {
    assert.deepEqual(group("relationships").repeated.map((item) => [item.label, item.count]), [["Screen time → Sleep quality", 2]]);
  });
  it("matches designs to the catalogue", () => {
    assert.deepEqual(group("designs").repeated.map((item) => [item.label, item.count]), [["Cross-sectional", 4], ["Survey", 3]]);
    assert.match(group("designs").summary, /Cross-sectional is the most common design, in 67% of studies that report one/);
  });
  it("finds the most common sampling technique and explains why it is used", () => {
    const top = group("sampling").repeated[0];
    assert.deepEqual([top.label, top.count, top.share], ["Convenience sampling", 3, 0.5]);
    assert.match(top.explanation, /^Convenience sampling appears in 3 of 6 studies that report their sampling technique \(50%\)\. It is typically used /);
  });
  it("finds the most common analysis", () => {
    assert.deepEqual(group("analyses").repeated.map((item) => item.label), ["Pearson correlation"]);
    assert.ok(group("analyses").items.some((item) => item.label === "Thematic analysis"));
  });
  it("finds the theory used most", () => {
    assert.deepEqual(group("theories").repeated.map((item) => [item.label, item.count]), [["Self-Determination Theory", 2]]);
  });
  it("finds theories named in the text", () => {
    const matrix = [study("a", { contribution: "Extends the Technology Acceptance Model." }), study("b", { theory: "Technology Acceptance Model (TAM)" })];
    assert.deepEqual(detectPatterns(matrix).groups.find((candidate) => candidate.id === "theories")!.repeated.map((item) => item.count), [2]);
  });
  it("finds the most common data collection method and setting", () => {
    assert.deepEqual([group("collection").repeated[0].label, group("collection").repeated[0].count], ["Questionnaire or survey", 5]);
    assert.deepEqual([group("countries").repeated[0].label, group("countries").repeated[0].count], ["United Kingdom", 4]);
  });
  it("counts unrecognised entries by their own wording", () => {
    const matrix = [study("a", { design: "Delphi study" }), study("b", { design: "delphi study" }), study("c", { design: "Survey" })];
    const designs = detectPatterns(matrix).groups.find((candidate) => candidate.id === "designs")!;
    assert.deepEqual(designs.repeated.map((item) => [item.label, item.count]), [["Delphi study", 2]]);
    assert.match(designs.repeated[0].explanation, /“Delphi study” appears in 2 of 3/);
  });
  it("holds back on judging patterns in very small matrices", () => {
    const small = detectPatterns(SAMPLE_MATRIX.slice(0, MIN_STUDIES_FOR_PATTERNS - 1));
    assert.match(small.groups[0].summary, /too early to judge/);
  });
  it("says when nothing is reported", () => {
    assert.equal(detectPatterns([study("a"), study("b"), study("c")]).groups[0].summary, "No study reports this yet.");
  });
  it("labels a pattern's studies", () => {
    assert.deepEqual(itemStudyLabels(group("theories").repeated[0], SAMPLE_MATRIX), ["Adams & Brown (2016)", "Chen (2018)"]);
  });
});

describe("stated gaps", () => {
  it("splits statements and finds their key words", () => {
    assert.deepEqual(statements("First point. Second point; third\nfourth"), ["First point.", "Second point", "third", "fourth"]);
    assert.deepEqual([...contentWords("Future research should use longitudinal designs.")].sort(), ["design", "longitudinal"]);
  });
  it("judges statements similar when they share key words", () => {
    assert.equal(similarStatements(new Set(["longitudinal", "design", "causality"]), new Set(["longitudinal", "design"])), true);
    assert.equal(similarStatements(new Set(["longitudinal", "design", "causality"]), new Set(["longitudinal", "sample", "size", "small"])), false);
  });
  const gaps = statedGaps(SAMPLE_MATRIX);
  it("groups the same gap named by several studies", () => {
    assert.equal(gaps.length, 1);
    assert.deepEqual(gaps[0].studies, ["s1", "s2", "s3"]);
    assert.ok(gaps[0].words.includes("longitudinal"));
    assert.match(gaps[0].explanation, /3 studies name this in similar words/);
  });
  it("keeps where each statement came from", () => {
    assert.deepEqual(
      gaps[0].statements.map((statement) => statement.field),
      ["gap", "recommendations", "gap"],
    );
  });
  it("ignores a gap named by one study only", () => {
    assert.deepEqual(statedGaps([study("a", { gap: "Longitudinal designs are needed." }), study("b", { gap: "Qualitative work is missing." })]), []);
  });
  it("doesn't group statements from the same study", () => {
    assert.deepEqual(statedGaps([study("a", { gap: "Longitudinal designs needed.", limitations: "Longitudinal designs needed." })]), []);
  });
});

describe("potential gaps", () => {
  const gaps = potentialGaps(SAMPLE_MATRIX, lens([{ name: "screen time", kind: "independent" }, { name: "academic motivation", kind: "dependent" }]), 2026);
  const kinds = gaps.map((gap) => gap.title);
  it("labels every kind", () => {
    for (const kind of GAP_KINDS) assert.ok(GAP_KIND_LABELS[kind]);
  });
  it("points out a dominant design and suggests alternatives", () => {
    const gap = gaps.find((candidate) => candidate.title === "Most studies use a cross-sectional design")!;
    assert.equal(gap.kind, "methodological");
    assert.match(gap.explanation, /longitudinal or experimental designs/);
  });
  it("points out mostly non-probability samples", () => {
    assert.ok(kinds.includes("Mostly non-probability samples"));
  });
  it("points out small quantitative samples, leaving out qualitative studies", () => {
    const gap = gaps.find((candidate) => candidate.title === "Small samples")!;
    assert.match(gap.evidence, /median sample of the 5 quantitative studies with a sample size is 88/);
    assert.ok(!gap.studies.includes("s6"));
  });
  it("points out concentrated settings", () => {
    assert.ok(kinds.includes("Studies concentrate in United Kingdom"));
  });
  it("points out a lack of recent studies", () => {
    assert.ok(kinds.includes("No study since 2019"));
    assert.ok(!potentialGaps(SAMPLE_MATRIX, null, 2022).some((gap) => gap.kind === "temporal"));
  });
  it("points out little theoretical grounding", () => {
    assert.ok(kinds.includes("Little theoretical grounding"));
  });
  it("points out the project's variables no study covers", () => {
    assert.ok(kinds.includes("No study examines academic motivation"));
    assert.ok(!kinds.includes("No study examines screen time"));
  });
  it("points out the project's relationship no study tests", () => {
    const linked = potentialGaps(SAMPLE_MATRIX, lens([{ name: "screen time", kind: "independent" }, { name: "academic performance", kind: "dependent" }]), 2020);
    assert.ok(!linked.some((gap) => gap.title.startsWith("No study links")));
    const unlinked = potentialGaps([...SAMPLE_MATRIX, study("s7", { independent: "Motivation", dependent: "Grades" })], lens([{ name: "anxiety", kind: "independent" }, { name: "grades", kind: "dependent" }]), 2020);
    assert.ok(unlinked.some((gap) => gap.title === "No study links anxiety with grades"));
  });
  it("points out untested mechanisms", () => {
    const direct = [1, 2, 3, 4, 5, 6].map((index) => study(`d${index}`, { independent: "X", dependent: "Y" }));
    assert.ok(potentialGaps(direct, null, 2026).some((gap) => gap.title === "Mediators and moderators are rarely tested"));
  });
  it("points out quantitative dominance", () => {
    const quantitative = [1, 2, 3].map((index) => study(`q${index}`, { approach: "Quantitative" }));
    assert.ok(potentialGaps(quantitative, null, 2026).some((gap) => gap.title === "Few qualitative or mixed-methods studies"));
    const qualitative = [1, 2, 3].map((index) => study(`q${index}`, { approach: "Qualitative" }));
    assert.ok(potentialGaps(qualitative, null, 2026).some((gap) => gap.title === "Few quantitative studies"));
  });
  it("points out a dominant theory", () => {
    const matrix = [1, 2, 3, 4].map((index) => study(`t${index}`, { theory: index < 4 ? "Social Cognitive Theory" : "Other Theory" }));
    assert.ok(potentialGaps(matrix, null, 2026).some((gap) => gap.title === "One theory dominates: Social Cognitive Theory"));
  });
  it("gives every gap evidence and an explanation", () => {
    for (const gap of gaps) assert.ok(gap.evidence.endsWith(".") && gap.explanation.endsWith("."), gap.title);
  });
  it("infers nothing from fewer than three studies", () => {
    assert.deepEqual(potentialGaps(SAMPLE_MATRIX.slice(0, 2), null, 2026), []);
  });
});

describe("the project lens", () => {
  const project = projectFromTyped({ ...EMPTY_TYPED_PROJECT, researchQuestion: "How does screen time affect sleep quality?", researchObjectives: "To examine screen time and sleep", independent: "screen time", dependent: "sleep quality", hypotheses: "relationship" }, {});
  const projectLensValue = projectLens({ ...project, topic: "Screens and sleep" });
  it("reads the topic, question, objectives, hypotheses and variables from the project", () => {
    assert.equal(projectLensValue.topic, "Screens and sleep");
    assert.equal(projectLensValue.researchQuestion, "How does screen time affect sleep quality?");
    assert.deepEqual(projectLensValue.objectives, ["To examine screen time and sleep"]);
    assert.equal(projectLensValue.hypotheses.length, 1);
    assert.deepEqual(projectLensValue.variables, [{ name: "screen time", kind: "independent" }, { name: "sleep quality", kind: "dependent" }]);
  });
  it("is empty for an empty project", () => {
    assert.equal(isEmptyLens(projectLens(createProjectDraft({}))), true);
    assert.equal(isEmptyLens(projectLensValue), false);
  });
  it("finds the project's variables a study covers, as whole words", () => {
    assert.deepEqual(coveredVariables(SAMPLE_MATRIX[0], projectLensValue), ["screen time", "sleep quality"]);
    assert.deepEqual(coveredVariables(SAMPLE_MATRIX[3], projectLensValue), ["screen time"]);
    assert.equal(mentions(study("x", { variables: "screen timeline" }), "screen time"), false);
  });
  it("lists a study's variables once each", () => {
    assert.deepEqual(studyVariables(SAMPLE_MATRIX[1]), ["phone use", "wellbeing", "Screen time", "Sleep quality"]);
  });
});

describe("compareStudies", () => {
  const comparison = compareStudies(SAMPLE_MATRIX[0], SAMPLE_MATRIX[1]);
  it("compares every column", () => {
    const row = (field: string) => comparison.rows.find((candidate) => candidate.field === field)!;
    assert.equal(row("country").relation, "same");
    assert.equal(row("year").relation, "different");
    assert.equal(row("mediator").relation, "missing");
  });
  it("lists shared variables, methods and theories", () => {
    assert.deepEqual(comparison.sharedVariables, ["screen time", "sleep quality"]);
    assert.ok(comparison.sharedMethods.includes("Cross-sectional"));
    assert.ok(comparison.sharedMethods.includes("Convenience sampling"));
    assert.deepEqual(comparison.sharedTheories, ["Self-Determination Theory"]);
  });
  it("compares only the columns asked for", () => {
    assert.equal(compareStudies(SAMPLE_MATRIX[0], SAMPLE_MATRIX[1], ["year"]).rows.length, 1);
  });
});

describe("synthesis", () => {
  const sections = synthesis(SAMPLE_MATRIX, lens([{ name: "screen time", kind: "independent" }]), 2026);
  it("has an overview, methods, theories, gaps and the project", () => {
    assert.deepEqual(sections.map((section) => section.heading), ["Overview", "Methods", "Theories and variables", "Gaps", "Your project"]);
  });
  it("describes the matrix in numbers", () => {
    assert.equal(sections[0].paragraphs[0], "The matrix holds 6 studies, published between 2015 and 2019, from 3 countries.");
    assert.equal(sections[0].paragraphs[1], "Reading progress: 6 to read.");
  });
  it("names the common methods and repeated gaps", () => {
    assert.match(sections[1].paragraphs.join(" "), /The most common designs are Cross-sectional \(4\) and Survey \(3\)/);
    assert.match(sections[3].paragraphs[0], /^Named by 3 studies \(key words: /);
  });
  it("relates the matrix to the project's variables", () => {
    assert.match(sections[4].paragraphs.join(" "), /screen time \(3\)/);
  });
  it("says when the matrix is empty or small", () => {
    assert.deepEqual(synthesis([], null, 2026), [{ heading: "Overview", paragraphs: ["The matrix has no studies yet."] }]);
    assert.match(synthesis(SAMPLE_MATRIX.slice(0, 2), null, 2026)[0].paragraphs.join(" "), /Patterns become meaningful from 3 studies/);
  });
  it("counts reading progress by status", () => {
    const read = updateField(SAMPLE_MATRIX, "s1", "year", "2016").map((candidate, index) => (index < 2 ? { ...candidate, status: "read" as const } : candidate));
    assert.equal(synthesis(read, null, 2026)[0].paragraphs[1], "Reading progress: 4 to read, 2 read.");
  });
  it("writes plain text and Markdown", () => {
    assert.match(synthesisText(sections), /^Overview\nThe matrix holds 6 studies/);
    assert.match(synthesisMarkdown(sections), /^## Overview\n\nThe matrix holds/);
  });
});
