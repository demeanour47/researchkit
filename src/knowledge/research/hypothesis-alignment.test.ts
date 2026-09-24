import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkAlignment, methodologyGuidance, pairVariables } from "./hypothesis-alignment";
import { generateHypotheses } from "./hypothesis-builder";
import type { CheckStatus } from "./hypothesis-checks";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";

const project = createProjectDraft({
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?",
  researchObjectives: ["To measure screen time and sleep quality", "To describe sleep habits"],
  population: "first-year university students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});

function statuses(draft: ResearchProjectDraft, edits: Partial<{ null: string; alternative: string }> = {}, form: "difference" | "relationship" | "prediction" = "relationship") {
  const [pair] = generateHypotheses(draft, { form, direction: "non-directional" }).pairs;
  const texts = { null: edits.null ?? pair.null.text, alternative: edits.alternative ?? pair.alternative.text };
  return Object.fromEntries(checkAlignment(texts, pair.relationship, draft).map((check) => [check.check, check])) as Record<string, { status: CheckStatus; explanation: string }>;
}

describe("checkAlignment", () => {
  it("finds a complete, consistent pair aligned throughout", () => {
    const checks = statuses(project);
    assert.deepEqual(
      Object.values(checks).map((check) => check.status),
      ["aligned", "aligned", "aligned", "aligned", "aligned"],
    );
    assert.equal(
      checks.researchQuestion.explanation,
      "Your question names “screen time” and “sleep quality” and asks a relational question, which a relationship hypothesis can answer.",
    );
    assert.equal(checks.objectives.explanation, "The objective “To measure screen time and sleep quality” mentions the same variables, so the hypothesis appears to serve it.");
  });

  it("reports a missing question, objectives and population", () => {
    const checks = statuses(createProjectDraft({ independentVariables: ["screen time"], dependentVariables: ["sleep quality"] }));
    assert.equal(checks.researchQuestion.status, "missing");
    assert.equal(checks.objectives.status, "missing");
    assert.equal(checks.population.status, "missing");
    assert.equal(checks.variables.status, "missing", "the population and context placeholders are still in the wording");
  });

  it("notices a question that asks something else", () => {
    const checks = statuses({ ...project, researchQuestion: "How does sleep quality differ by year of study among students?" });
    assert.equal(checks.researchQuestion.status, "worth-checking");
    assert.equal(
      checks.researchQuestion.explanation,
      "Your question doesn't mention “screen time”. Your question reads as comparative, which doesn't usually lead to a relationship hypothesis.",
    );
  });

  it("asks for clarification when the question is exploratory", () => {
    const checks = statuses({ ...project, researchQuestion: "How do students experience sleep loss?" });
    assert.equal(checks.researchQuestion.status, "clarify");
    assert.match(checks.researchQuestion.explanation, /an exploratory question may not need one/);
  });

  it("matches difference and prediction hypotheses to the right question types", () => {
    assert.equal(statuses({ ...project, researchQuestion: "How does sleep quality differ by screen time among students?" }, {}, "difference").researchQuestion.status, "aligned");
    assert.equal(statuses({ ...project, researchQuestion: "To what extent does screen time predict sleep quality?" }, {}, "prediction").researchQuestion.status, "aligned");
  });

  it("notices objectives that don't mention the variables", () => {
    const checks = statuses({ ...project, researchObjectives: ["To review the literature"] });
    assert.equal(checks.objectives.status, "worth-checking");
  });

  it("notices variables, population and context left out of edited wording", () => {
    const checks = statuses(project, { alternative: "Screen time is related to sleep." });
    assert.equal(checks.variables.status, "worth-checking");
    assert.equal(checks.variables.explanation, "Both hypotheses should name “sleep quality”, which your project lists for this relationship.");
    assert.equal(checks.population.status, "worth-checking");
    assert.equal(checks.context.status, "worth-checking");
  });

  it("treats context as optional when the project has none", () => {
    const draft = updateProjectDraft(project, { location: null, timeContext: null });
    const [pair] = generateHypotheses(draft, { form: "relationship", direction: "non-directional" }).pairs;
    const texts = { null: pair.null.text.replace(" [context]", ""), alternative: pair.alternative.text.replace(" [context]", "") };
    const context = checkAlignment(texts, pair.relationship, draft).find((check) => check.check === "context")!;
    assert.equal(context.status, "review");
    assert.equal(statuses(draft).context.status, "missing", "an unreplaced [context] placeholder is missing information");
  });
});

describe("pairVariables", () => {
  it("lists independent, dependent, moderator and mediator variables in order", () => {
    const set = generateHypotheses(createProjectDraft({ ...project, moderatorVariables: ["gender"] }), { form: "relationship", direction: "non-directional" });
    assert.deepEqual(pairVariables(set.pairs[1].relationship), ["screen time", "sleep quality", "gender"]);
  });
});

describe("methodologyGuidance", () => {
  const notes = (draft: ResearchProjectDraft) => methodologyGuidance(draft).map((note) => `${note.choice}:${note.status}`);

  it("says hypotheses are common in quantitative projects", () => {
    const [note] = methodologyGuidance(createProjectDraft({ methodology: "quantitative" }));
    assert.equal(note.status, "aligned");
    assert.equal(note.text, "Hypotheses are commonly used in quantitative research, where statistical tests assess them.");
    assert.equal(note.why, "A quantitative design usually collects numerical data for statistical analysis.");
  });

  it("explains that qualitative projects usually prefer research questions", () => {
    const [note] = methodologyGuidance(createProjectDraft({ methodology: "qualitative" }));
    assert.equal(note.status, "clarify");
    assert.match(note.text, /open research questions are usually preferred/);
    assert.match(note.text, /discuss this with your supervisor/);
  });

  it("explains when hypotheses may suit mixed methods and multi-method projects", () => {
    assert.match(methodologyGuidance(createProjectDraft({ methodology: "mixed-methods" }))[0].text, /may suit the quantitative strand/);
    assert.equal(methodologyGuidance(createProjectDraft({ methodology: "multi-method" }))[0].status, "review");
  });

  it("uses the Research Onion's methodological choice when no methodology is stated", () => {
    assert.deepEqual(notes(createProjectDraft({ researchOnionSelection: { choice: "qualitative" } })), ["Qualitative:clarify"]);
  });

  it("asks for a methodology when there is none", () => {
    assert.deepEqual(notes({}), ["Methodology:review"]);
  });

  it("adds notes for the philosophy and approach", () => {
    assert.deepEqual(notes(createProjectDraft({ methodology: "quantitative", researchOnionSelection: { philosophy: "positivism", approach: "deductive" } })), [
      "Quantitative:aligned",
      "Positivism:aligned",
      "Deductive:aligned",
    ]);
    assert.deepEqual(notes(createProjectDraft({ researchOnionSelection: { philosophy: "interpretivism", approach: "inductive" } })), [
      "Methodology:review",
      "Interpretivism:clarify",
      "Inductive:clarify",
    ]);
    assert.deepEqual(notes(createProjectDraft({ researchOnionSelection: { philosophy: "pragmatism", approach: "abductive" } })), [
      "Methodology:review",
      "Pragmatism:review",
      "Abductive:review",
    ]);
  });

  it("never says a methodology is universally right or wrong", () => {
    for (const methodology of ["quantitative", "qualitative", "mixed-methods", "multi-method"] as const) {
      for (const note of methodologyGuidance(createProjectDraft({ methodology }))) {
        assert.ok(!/\b(always|never|must|wrong|correct|only valid)\b/i.test(note.text), note.text);
      }
    }
  });
});
