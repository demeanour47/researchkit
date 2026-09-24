import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FINER_CRITERIA, FINER_JUDGEMENT_LABELS, evaluateFiner, type FinerAssessment } from "./finer";
import { identifyElements } from "./question-elements";
import { createProjectDraft, type ResearchProjectDraft } from "./research-project";

function finer(question: string, project: ResearchProjectDraft = {}) {
  const assessments = evaluateFiner(question, project, identifyElements(question, project, ["relational"]));
  return Object.fromEntries(assessments.map((assessment) => [assessment.criterion, assessment])) as Record<string, FinerAssessment>;
}

const good = "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?";
const project = createProjectDraft({ topic: "screen time and sleep", researchAim: "To examine how screen time affects sleep among students" });

describe("evaluateFiner", () => {
  it("assesses the five criteria in order, each explained and never scored", () => {
    const assessments = evaluateFiner(good, project, identifyElements(good, project, ["relational"]));
    assert.deepEqual(assessments.map((assessment) => assessment.criterion), [...FINER_CRITERIA]);
    for (const assessment of assessments) {
      assert.ok(assessment.reasons.length > 0, assessment.criterion);
      assert.ok(assessment.toConsider.length > 0, assessment.criterion);
      assert.ok(assessment.meaning.endsWith("?"), assessment.criterion);
      assert.ok(Object.keys(FINER_JUDGEMENT_LABELS).includes(assessment.judgement));
      assert.ok(!/\d+\s*(\/|out of)\s*\d+|%/.test(JSON.stringify(assessment)), `${assessment.criterion} contains a score`);
    }
  });

  it("finds a well-scoped question feasible, while noting what wording can't show", () => {
    const { feasible } = finer(good, project);
    assert.equal(feasible.judgement, "addressed");
    assert.deepEqual(feasible.reasons, [
      "The question names a population and a setting or time frame, which keeps the scope manageable.",
      "Feasibility also depends on things the wording can't show: whether you can reach participants or data, and how much time you have.",
    ]);
  });

  it("flags a very broad scope", () => {
    const { feasible } = finer("How does social media affect everyone worldwide?");
    assert.equal(feasible.judgement, "attention");
    assert.match(feasible.reasons[0], /“everyone”, “worldwide” suggest a very wide scope/);
    assert.match(feasible.reasons[1], /No population is named/);
  });

  it("flags a long question and many variables", () => {
    const long = `${"What is the relationship between many different factors ".repeat(5)}among nurses?`;
    const { feasible } = finer(long, createProjectDraft({ independentVariables: ["a", "b", "c"], dependentVariables: ["d", "e"] }));
    assert.equal(feasible.judgement, "attention");
    assert.ok(feasible.reasons.some((reason) => reason.startsWith("You have listed 5 variables.")));
    assert.ok(feasible.reasons.some((reason) => /^At \d+ words, the question may be trying to do several things at once\.$/.test(reason)));
  });

  it("leaves interest and novelty to the researcher, saying why", () => {
    const { interesting, novel } = finer(good, project);
    assert.equal(interesting.judgement, "yours");
    assert.equal(novel.judgement, "yours");
    assert.match(novel.reasons[0], /only be established by reviewing the published literature/);
  });

  it("flags groups and topics that need ethical care, from the question or the population", () => {
    assert.equal(finer("How do children experience bereavement?").ethical.judgement, "attention");
    assert.match(finer("How do children experience bereavement?").ethical.reasons[0], /“children”, “bereavement”/);
    assert.equal(finer("How do they experience school?", createProjectDraft({ population: "refugee pupils" })).ethical.judgement, "attention");
  });

  it("never declares a question ethical", () => {
    const { ethical } = finer(good, project);
    assert.equal(ethical.judgement, "yours");
    assert.match(ethical.reasons[0], /This isn't an ethical review/);
  });

  it("judges relevance against the aim and topic", () => {
    assert.equal(finer(good, project).relevant.judgement, "addressed");
    assert.match(finer(good, project).relevant.reasons[0], /shares key words with your aim \(“screen”, “time”, “sleep”, “students”\)/);
    assert.equal(finer("How do nurses experience night shifts?", project).relevant.judgement, "attention");
    assert.equal(finer(good).relevant.judgement, "yours");
    assert.match(finer(good).relevant.reasons[0], /You haven't entered a research aim/);
  });
});
