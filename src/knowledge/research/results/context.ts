/**
 * Connects a result to the project: the hypothesis it tests, the objectives and research
 * question it serves, where it sits in the analysis plan, and the limits the design,
 * sampling and sample size place on it. Everything is read from the project draft.
 */

import { recommendAnalyses, uses } from "../data-analysis";
import { STRENGTH_LABELS, getAnalysisMethod } from "../data-analysis-types";
import { getDesign } from "../design-types";
import type { ProjectHypothesis } from "../hypothesis-types";
import type { ResearchProjectDraft } from "../research-project";
import { getTechnique } from "../sampling-types";
import { interpretNumbers, type CoreInterpretation } from "./interpret";
import { resultProblems, type ResultProblem } from "./validate";
import type { ResultInput } from "./types";

export type HypothesisStatus = "supported" | "not-supported" | "opposite" | "not-tested" | "unlinked";

export const HYPOTHESIS_STATUS_LABELS: Readonly<Record<HypothesisStatus, string>> = {
  supported: "Supports the hypothesis",
  "not-supported": "Doesn't support the hypothesis",
  opposite: "Significant in the opposite direction",
  "not-tested": "Doesn't test a hypothesis",
  unlinked: "No hypothesis chosen",
};

export interface HypothesisConnection {
  status: HypothesisStatus;
  /** The hypothesis wording, when one is linked. */
  hypothesis: string | null;
  label: string | null;
  explanation: string;
}

export interface ResultInterpretation extends CoreInterpretation {
  hypothesis: HypothesisConnection;
  objectives: string[];
  researchQuestion: string;
  /** Where the analysis sits in the project's analysis plan. */
  plan: string;
  limitations: string[];
}

export type InterpretationOutcome = { ok: true; interpretation: ResultInterpretation } | { ok: false; problems: ResultProblem[] };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const mentions = (text: string, name: string) => name.trim().length >= 3 && text.toLowerCase().includes(name.trim().toLowerCase());
const namedIn = (hypothesis: ProjectHypothesis) => {
  const { independentVariables, dependentVariables, moderators, mediators } = hypothesis.relationship;
  return [...independentVariables, ...dependentVariables, ...moderators, ...mediators];
};

/**
 * The hypothesis a result tests: the one chosen, or, if none is chosen, the only
 * alternative hypothesis naming every variable the result concerns.
 */
export function linkedHypothesis(input: ResultInput, project: ResearchProjectDraft): { hypothesis: ProjectHypothesis; index: number; matched: boolean } | null {
  const alternatives = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
  if (input.hypothesisId) {
    const index = alternatives.findIndex((hypothesis) => hypothesis.id === input.hypothesisId);
    if (index === -1) throw new RangeError(`Unknown hypothesis: ${input.hypothesisId}`);
    return { hypothesis: alternatives[index], index, matched: false };
  }
  if (input.variables.length === 0) return null;
  const matches = alternatives.filter((hypothesis) => input.variables.every((name) => namedIn(hypothesis).some((candidate) => same(candidate, name))));
  return matches.length === 1 ? { hypothesis: matches[0], index: alternatives.indexOf(matches[0]), matched: true } : null;
}

export function hypothesisConnection(core: CoreInterpretation, input: ResultInput, project: ResearchProjectDraft): HypothesisConnection {
  if (!core.testsHypothesis) {
    return { status: "not-tested", hypothesis: null, label: null, explanation: `${core.name} ${core.kind === "sem" ? "shows how well the whole model fits; the hypotheses are tested by its path coefficients" : core.kind === "factor-analysis" ? "checks the measures; the hypotheses are tested by later analyses" : "describes the data; it doesn't test a hypothesis"}.` };
  }
  const link = linkedHypothesis(input, project);
  if (!link) {
    const alternatives = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
    return { status: "unlinked", hypothesis: null, label: null, explanation: alternatives.length === 0 ? "Your project has no hypotheses, so this result answers your research question directly rather than testing a prediction." : "Choose the hypothesis this result tests to see whether it supports it." };
  }
  const { hypothesis, index, matched } = link;
  const label = `Hypothesis ${index + 1}`;
  const prefix = matched ? `Matched to ${label} because it names ${input.variables.join(" and ")}. ` : "";
  const unrelated = input.variables.filter((name) => !namedIn(hypothesis).some((candidate) => same(candidate, name)));
  const mismatch = unrelated.length > 0 ? ` Note that ${label} doesn't name ${unrelated.join(" or ")}; check it is the right hypothesis.` : "";
  if (core.significance.status === "no-test") return { status: "not-tested", hypothesis: hypothesis.text, label, explanation: `${prefix}This result has no significance test, so it can't support or reject ${label}.${mismatch}` };
  if (core.significance.status === "not-significant") {
    return { status: "not-supported", hypothesis: hypothesis.text, label, explanation: `${prefix}The result doesn't support ${label}: the null hypothesis can't be rejected. That isn't proof the null hypothesis is true.${mismatch}` };
  }
  const expected = hypothesis.relationship.direction;
  if ((expected === "positive" || expected === "negative") && core.direction && core.direction !== "none" && core.direction !== expected) {
    return { status: "opposite", hypothesis: hypothesis.text, label, explanation: `${prefix}The result is significant, but ${core.direction}, while ${label} predicted a ${expected} ${hypothesis.relationship.form === "difference" ? "difference" : "relationship"}. It doesn't support ${label}; report the unexpected direction and discuss why.${mismatch}` };
  }
  return { status: "supported", hypothesis: hypothesis.text, label, explanation: `${prefix}The result supports ${label}. Support isn't proof: it means the data are consistent with the hypothesis in this sample.${mismatch}` };
}

const outcomeWords = (core: CoreInterpretation) =>
  core.significance.status === "significant" ? "gives evidence towards it" : core.significance.status === "not-significant" ? "doesn't give evidence towards it, which is itself a finding to report" : "describes part of what it asks about";

export function objectiveConnections(core: CoreInterpretation, input: ResultInput, project: ResearchProjectDraft): string[] {
  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) return ["Your project has no objectives recorded, so the result can't be linked to one."];
  if (input.variables.length === 0) return ["Choose the variables this result concerns to see which objectives it serves."];
  const related = objectives.filter((objective) => input.variables.some((name) => mentions(objective, name)));
  if (related.length === 0) return [`No objective names ${input.variables.join(" or ")}. Say which objective this result serves, or whether it is additional.`];
  return related.map((objective) => `It addresses the objective “${objective}”, and ${outcomeWords(core)}.`);
}

export function researchQuestionConnection(core: CoreInterpretation, input: ResultInput, project: ResearchProjectDraft): string {
  const question = project.researchQuestion;
  if (!question) return "Your project has no research question recorded, so the result can't be linked to it.";
  if (input.variables.length === 0) return `Choose the variables this result concerns to link it to your research question, “${question}”.`;
  const named = input.variables.filter((name) => mentions(question, name));
  if (named.length === 0) return `Your research question, “${question}”, doesn't name ${input.variables.join(" or ")}, so this result is supporting or additional; say how it relates.`;
  return `It helps answer your research question, “${question}”, because it concerns ${named.join(" and ")}. It ${outcomeWords(core)}.`;
}

/** Where this analysis sits in the plan the Data Analysis Recommender makes from the same project. */
export function planConnection(input: ResultInput, project: ResearchProjectDraft): string {
  const plan = recommendAnalyses(project);
  const name = getAnalysisMethod(input.kind).name;
  const entries = uses(plan, input.kind);
  const overview = plan.overview.find((entry) => entry.method === input.kind);
  if (entries.length > 0) {
    const where = entries.slice(0, 3).map((entry) => `${STRENGTH_LABELS[entry.recommendation.strength]} for “${entry.question}”`);
    return `Your analysis plan includes ${name}: ${where.join("; ")}${entries.length > 3 ? `, and ${entries.length - 3} more` : ""}.`;
  }
  if (overview) return `Your analysis plan draws on ${name} as a family of methods: ${STRENGTH_LABELS[overview.strength]}.`;
  // Without variables the plan only has generic descriptive advice, so there is nothing to compare with.
  return plan.profile.variables.length > 0 ? `${name} isn't in the analysis plan made from your project. Explain why you used it, or check the plan's recommendations.` : "Your project doesn't yet give the analysis plan enough to compare this result with.";
}

export function contextLimitations(core: CoreInterpretation, input: ResultInput, project: ResearchProjectDraft): string[] {
  const limitations = [...getAnalysisMethod(input.kind).limitations];
  const design = project.researchDesign?.chosen ? getDesign(project.researchDesign.chosen) : null;
  if (core.testsHypothesis && core.significance.status === "significant" && design && design.traits.manipulation !== "yes") {
    limitations.push(`Your ${design.name.toLowerCase()} design doesn't manipulate variables, so this result shows association, not cause and effect.`);
  }
  const technique = project.samplingPlan?.chosen ? getTechnique(project.samplingPlan.chosen) : null;
  if (technique?.category === "non-probability") limitations.push(`Your sample was drawn by ${technique.name.toLowerCase()} sampling, so the result may not generalise to the wider population.`);
  const n = input.values.n ?? input.values.total;
  if (n !== undefined && n < 30) limitations.push(`With ${n} participants, the result may not replicate; small samples give imprecise estimates.`);
  return limitations;
}

/** The full interpretation of a result in the context of the project, or the problems that stop it. */
export function interpretResult(input: ResultInput, project: ResearchProjectDraft): InterpretationOutcome {
  const problems = resultProblems(input);
  if (problems.length > 0) return { ok: false, problems };
  const core = interpretNumbers(input);
  return {
    ok: true,
    interpretation: {
      ...core,
      hypothesis: hypothesisConnection(core, input, project),
      objectives: objectiveConnections(core, input, project),
      researchQuestion: researchQuestionConnection(core, input, project),
      plan: planConnection(input, project),
      limitations: contextLimitations(core, input, project),
    },
  };
}
