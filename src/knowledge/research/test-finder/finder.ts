/**
 * The Statistical Test Finder's decision engine. It turns the researcher's answers into
 * candidate tests, each with why it may fit, what to check and what else to consider.
 *
 * Which test suits which arrangement of variables is decided once, by the Data Analysis
 * Recommender's rules: the finder describes the answered situation as the variables
 * those rules read and asks them. It adds only what the rules don't cover: describing a
 * variable, comparing with a stated value, one categorical variable against expected
 * shares, and the situations where no covered test fits. It never guesses: until the
 * questions that matter are answered, it says what is still needed.
 */

import { ASSUMPTIONS } from "../assumptions/catalogue";
import { getMethodGuide, isAssumptionMethod } from "../assumptions/methods";
import type { Measure, MeasuredVariable } from "../data-analysis-profile";
import { controlRules, mergeRecommendations, multipleRules, pairRules, type Recommendation } from "../data-analysis-rules";
import { NON_PARAMETRIC_ALTERNATIVE, getAnalysisMethod, type AnalysisMethodId, type RecommendationStrength } from "../data-analysis-types";
import { RESULT_KINDS } from "../results/types";
import { MEASUREMENT_LEVEL_INFO } from "../variable-types";
import { whyItFits } from "./profiles";
import { activeAnswers, getQuestion, isNumeric, unansweredQuestions, type Count, type FinderAnswers, type FinderLevel, type FinderQuestionId } from "./questions";

export const FINDER_FITS = ["common", "also", "justify"] as const;
export type FinderFit = (typeof FINDER_FITS)[number];

/** How a candidate relates to the situation. Methodological fit, never a verdict that a test is right or wrong. */
export const FIT_LABELS: Readonly<Record<FinderFit, string>> = {
  common: "Commonly used for this situation",
  also: "May also fit",
  justify: "Only with justification",
};

const FIT_FOR: Readonly<Record<RecommendationStrength, FinderFit>> = { strong: "common", possible: "also", justify: "justify" };

export interface CandidateTest {
  method: AnalysisMethodId;
  fit: FinderFit;
  /** Why it may fit this situation. Never empty. */
  why: string[];
  /** Something to weigh before relying on it, or null. */
  caution: string | null;
}

export interface MissingAnswer {
  question: FinderQuestionId;
  prompt: string;
  why: string;
}

export type FinderResult =
  | { status: "incomplete"; missing: MissingAnswer[] }
  | { status: "invalid"; problems: string[] }
  | { status: "complete"; situation: string[]; candidates: CandidateTest[]; notes: string[] };

// Describing the answers.

const levelLabel = (level: FinderLevel) => MEASUREMENT_LEVEL_INFO[level].label.toLowerCase();
const levelMeaning = (level: FinderLevel) =>
  isNumeric(level) ? "so it is quantitative" : level === "ordinal" ? "so its values can be ordered, but the steps between them may not be equal" : "so its values are categories";
const counted = (count: Count, two: string, more: string) => (count === "two" ? two : more);

/** The answered situation in sentences, using the names the researcher gave. */
export function describeSituation(answers: FinderAnswers): string[] {
  const a = activeAnswers(answers);
  const lines: string[] = [];
  const outcome = a.outcomeName ?? (a.purpose === "relationship" ? "The first variable" : a.purpose === "describe" ? "The variable" : "The outcome");
  const predictor = a.predictorName ?? (a.purpose === "relationship" ? "The second variable" : "The predictor");

  if (a.comparison === "value") lines.push("You are comparing one group with a value stated in advance.");
  if (a.comparison === "independent") lines.push(`You are comparing separate groups of different people${a.predictorName ? `, formed by ${a.predictorName}` : ""}, so the groups are independent.`);
  if (a.comparison === "paired") lines.push("You are comparing the same people measured more than once, so the measurements are paired.");
  if (a.outcomeLevel) lines.push(`${outcome} is measured at the ${levelLabel(a.outcomeLevel)} level, ${levelMeaning(a.outcomeLevel)}.`);
  if (a.outcomeCategories) lines.push(`${outcome} has ${counted(a.outcomeCategories, "two categories", "three or more categories")}.`);
  if (a.groups) lines.push(`There are ${counted(a.groups, "two groups", "three or more groups")}.`);
  if (a.measurements) lines.push(`Each participant is measured ${counted(a.measurements, "twice", "three or more times")}.`);
  if (a.secondFactor === "yes") lines.push("A second grouping variable is compared at the same time.");
  if (a.covariate === "yes") lines.push("A numeric covariate is controlled for.");
  if (a.predictors) lines.push(a.predictors === "one" ? "There is one predictor." : "There are two or more predictors.");
  if (a.predictorLevel) lines.push(`${predictor} is measured at the ${levelLabel(a.predictorLevel)} level, ${levelMeaning(a.predictorLevel)}.`);
  if (a.predictorCategories) lines.push(`${predictor} has ${counted(a.predictorCategories, "two categories", "three or more categories")}.`);
  if (a.categoricalVariables) lines.push(a.categoricalVariables === "one" ? "One categorical variable is compared with shares stated in advance." : "Two categorical variables are examined together.");
  if (a.normality === "yes") lines.push("You expect the data to be roughly normal.");
  if (a.normality === "no") lines.push("You said the data aren't roughly normal.");
  if (a.normality === "unknown") lines.push("Whether the data are roughly normal isn't known yet.");
  return lines;
}

// Validation: answers that contradict each other, or ask for something no test here can do.

/** Problems with the answers that need changing before tests can be suggested. */
export function answerProblems(answers: FinderAnswers): string[] {
  const a = activeAnswers(answers);
  const problems: string[] = [];
  if (a.outcomeName && a.predictorName && a.outcomeName.toLowerCase() === a.predictorName.toLowerCase()) {
    problems.push(`The two variables have the same name, “${a.outcomeName}”. A test needs two different variables; check which one is the outcome.`);
  }
  if (a.purpose === "relationship" && (a.outcomeLevel === "nominal" || a.predictorLevel === "nominal")) {
    problems.push("A relationship in this sense needs variables whose values can be put in order. For categories, choose “Examine categories” to test whether they are associated.");
  }
  return problems;
}

// Building candidates.

const variable = (id: string, name: string, kind: MeasuredVariable["kind"], measure: Measure, groups: number | null): MeasuredVariable => ({ id, name, kind, measure, items: 0, groups, source: "Your answer in the Statistical Test Finder" });

/** The analysable measure for a level, using the category count where one is known. */
function measureOf(level: FinderLevel, categories?: Count): Measure {
  if (isNumeric(level)) return "numeric";
  if (level === "ordinal") return "ordinal";
  return categories === "two" ? "binary" : "categorical";
}

const groupsVariable = (count: Count, name: string) => (count === "two" ? variable("groups", name, "independent", "binary", 2) : variable("groups", name, "independent", "categorical", 3));

const candidate = (method: AnalysisMethodId, fit: FinderFit, extra: string[] = [], caution: string | null = null): CandidateTest => ({ method, fit, why: [whyItFits(method), ...extra], caution });

const fromRecommendations = (recommendations: readonly Recommendation[]): CandidateTest[] => recommendations.map((recommendation) => candidate(recommendation.method, FIT_FOR[recommendation.strength], [], recommendation.justify));

const RANK: Readonly<Record<FinderFit, number>> = { common: 0, also: 1, justify: 2 };
const ordered = (candidates: CandidateTest[]) => candidates.map((entry, index) => ({ entry, index })).sort((x, y) => RANK[x.entry.fit] - RANK[y.entry.fit] || x.index - y.index).map(({ entry }) => entry);

const MORE_THAN_NORMAL = "Normality can't usually be known before data are collected; the Statistical Assumption Checker explains how to check it.";

/** Adjusts candidates for what the researcher said about normality. Deterministic: the same answers always give the same result. */
function applyNormality(candidates: CandidateTest[], normality: FinderAnswers["normality"]): CandidateTest[] {
  if (!normality || normality === "yes") return candidates;
  const out = candidates.map((entry) => ({ ...entry, why: [...entry.why] }));
  for (const entry of [...out]) {
    const method = getAnalysisMethod(entry.method);
    if (!method.parametric || entry.fit === "justify") continue;
    const fallback = NON_PARAMETRIC_ALTERNATIVE[entry.method];
    if (normality === "unknown") {
      entry.caution = entry.caution ?? `Check normality before relying on it. ${MORE_THAN_NORMAL}`;
      if (fallback && !out.some((other) => other.method === fallback)) out.push(candidate(fallback, "also", ["Consider it if the data turn out not to be roughly normal."]));
      continue;
    }
    // Normality doesn't hold.
    if (entry.fit === "common") entry.fit = "also";
    if (fallback) {
      entry.caution = "You said the data aren't roughly normal. This test is still often used with larger samples, where it is fairly robust; if you use it, say why.";
      const existing = out.find((other) => other.method === fallback);
      if (existing) {
        existing.fit = "common";
        if (!existing.why.some((line) => line.includes("doesn't assume normality"))) existing.why.push("It doesn't assume normality, which you said doesn't hold.");
      } else out.push(candidate(fallback, "common", ["It doesn't assume normality, which you said doesn't hold."]));
    } else {
      const guide = isAssumptionMethod(entry.method) ? getMethodGuide(entry.method) : null;
      const options = guide ? [...guide.nonParametric, ...guide.alternatives].map((alternative) => alternative.name) : [];
      entry.caution = `You said the data aren't roughly normal.${options.length > 0 ? ` Options to consider include ${options.join("; ")}.` : ""} Discuss the choice with your supervisor.`;
    }
  }
  return out;
}

function describeCandidates(a: FinderAnswers): CandidateTest[] {
  const level = a.outcomeLevel!;
  if (level === "nominal") return [candidate("mode", "common"), candidate("frequency", "common"), candidate("percentage", "also")];
  if (level === "ordinal") return [candidate("median", "common"), candidate("frequency", "also"), candidate("mode", "also")];
  if (a.normality === "no") {
    return [
      candidate("median", "common", ["You said the distribution is skewed or has extreme values, which pull the mean away from the typical case."]),
      candidate("mean", "also", [], "With a skewed distribution the mean can mislead; report it only alongside the median."),
      candidate("standard-deviation", "also", [], "Spread around a skewed mean can mislead; the interquartile range suits the median."),
    ];
  }
  const caution = a.normality === "unknown" ? "Look at the distribution first: if it is skewed, report the median as well." : null;
  return [candidate("mean", "common", [], caution), candidate("standard-deviation", "common"), candidate("median", "also")];
}

interface Built {
  candidates: CandidateTest[];
  notes: string[];
}

function compareCandidates(a: FinderAnswers): Built {
  const outcomeName = a.outcomeName ?? "The outcome";
  const level = a.outcomeLevel!;
  const notes: string[] = [];

  if (a.comparison === "value") {
    if (isNumeric(level)) return { candidates: [candidate("one-sample-t-test", "common")], notes };
    if (level === "nominal") {
      notes.push("With a categorical outcome, comparing with a stated value means comparing each category's count with the count its expected share would give.");
      return { candidates: [candidate("chi-square-goodness-of-fit", "common")], notes };
    }
    notes.push("For an ordinal outcome, the one-sample Wilcoxon signed-rank test compares the median with a stated value. It isn't among the tests this tool covers in detail; ask your supervisor or consult a statistics text.");
    return { candidates: [], notes };
  }

  const dv = variable("outcome", outcomeName, "dependent", measureOf(level), null);

  if (a.comparison === "paired") {
    const count = a.measurements!;
    if (level === "nominal") {
      notes.push(
        count === "two"
          ? "For a categorical outcome measured twice on the same people, McNemar's test is the usual choice. It isn't among the tests this tool covers."
          : "For a categorical outcome measured three or more times on the same people, Cochran's Q test is the usual choice for two categories. It isn't among the tests this tool covers.",
      );
      return { candidates: [], notes };
    }
    if (level === "ordinal" && count === "three-plus") {
      notes.push("For an ordinal outcome measured three or more times on the same people, the Friedman test is the usual choice. It isn't among the tests this tool covers.");
      return { candidates: [], notes };
    }
    const times = count === "two" ? variable("time", "Time", "independent", "binary", 2) : variable("time", "Time", "independent", "categorical", 3);
    return { candidates: fromRecommendations(pairRules(times, dv, "difference", true).recommendations), notes };
  }

  // Independent groups.
  const iv = groupsVariable(a.groups!, a.predictorName ?? "The grouping variable");
  const base = pairRules(iv, dv, "difference", false).recommendations;
  if (level === "nominal") notes.push("Your outcome is categories, so comparing groups on it asks whether group and outcome are associated.");
  const factorB = variable("factor-b", "The second grouping variable", "independent", "categorical", null);
  const factorial = a.secondFactor === "yes" ? multipleRules([iv, factorB], dv, "difference") : [];
  const adjusted = a.covariate === "yes" ? controlRules(a.secondFactor === "yes" ? [iv, factorB] : [iv], dv, [variable("covariate", "The covariate", "control", "numeric", null)]) : [];
  if (factorial.length === 0 && adjusted.length === 0) return { candidates: fromRecommendations(base), notes };

  // Only a test that includes everything the researcher named stays commonly used; the rest may also fit.
  const inclusive = new Set((adjusted.length > 0 ? adjusted : factorial).map((recommendation) => recommendation.method));
  const factorialMethods = new Set(factorial.map((recommendation) => recommendation.method));
  const leftOutBy = (method: AnalysisMethodId) =>
    [a.secondFactor === "yes" && !factorialMethods.has(method) ? "the second grouping variable" : null, a.covariate === "yes" ? "the covariate" : null].filter(Boolean).join(" and ");
  const candidates = fromRecommendations(mergeRecommendations([...base, ...factorial, ...adjusted])).map((entry) => {
    if (inclusive.has(entry.method) || entry.fit === "justify") return entry;
    // Regression can take any of the named variables as further predictors, so it leaves nothing out.
    const caution = getAnalysisMethod(entry.method).family === "prediction" ? entry.caution : (entry.caution ?? `As suggested here, it leaves out ${leftOutBy(entry.method)}.`);
    return { ...entry, fit: "also" as const, caution };
  });
  if (a.secondFactor === "yes" && a.covariate === "yes") notes.push("With two grouping variables and a covariate, ANCOVA is run with both factors in the model (a two-way ANCOVA).");
  return { candidates, notes };
}

function predictCandidates(a: FinderAnswers): Built {
  const dv = variable("outcome", a.outcomeName ?? "The outcome", "dependent", measureOf(a.outcomeLevel!, a.outcomeCategories), null);
  if (a.predictors === "several") {
    const predictors = [variable("p1", "Predictor 1", "independent", "numeric", null), variable("p2", "Predictor 2", "independent", "numeric", null)];
    const recommendations = multipleRules(predictors, dv, "prediction");
    const notes = ["Predictors can be quantitative or categorical: categorical predictors enter a regression as dummy (0/1) variables."];
    if (recommendations.length === 0) notes.push("For a categorical outcome with three or more categories, multinomial logistic regression is the usual choice. It isn't among the tests this tool covers.");
    return { candidates: fromRecommendations(recommendations), notes };
  }
  const iv = variable("predictor", a.predictorName ?? "The predictor", "independent", measureOf(a.predictorLevel!, a.predictorCategories), a.predictorCategories === "two" ? 2 : a.predictorCategories === "three-plus" ? 3 : null);
  const result = pairRules(iv, dv, "prediction", false);
  return { candidates: fromRecommendations(result.recommendations), notes: result.notes };
}

function buildCandidates(a: FinderAnswers): Built {
  switch (a.purpose!) {
    case "describe":
      return { candidates: describeCandidates(a), notes: ["Descriptive statistics summarise your sample. They don't test hypotheses or generalise to a population on their own."] };
    case "compare":
      return compareCandidates(a);
    case "relationship": {
      const first = variable("first", a.outcomeName ?? "The first variable", "dependent", measureOf(a.outcomeLevel!), null);
      const second = variable("second", a.predictorName ?? "The second variable", "independent", measureOf(a.predictorLevel!), null);
      return { candidates: fromRecommendations(pairRules(second, first, "relationship", false).recommendations), notes: ["A relationship between variables doesn't by itself show that one causes the other."] };
    }
    case "predict":
      return predictCandidates(a);
    case "association": {
      if (a.categoricalVariables === "one") return { candidates: [candidate("chi-square-goodness-of-fit", "common")], notes: ["State the expected shares before looking at the data, and say where they come from."] };
      const first = variable("first", "The first variable", "independent", "categorical", null);
      const second = variable("second", "The second variable", "dependent", "categorical", null);
      return { candidates: fromRecommendations(pairRules(first, second, null, false).recommendations), notes: [] };
    }
  }
}

/** Candidate tests for the answers, or what is still needed, or what needs changing. */
export function findTests(answers: FinderAnswers): FinderResult {
  const a = activeAnswers(answers);
  const problems = answerProblems(a);
  if (problems.length > 0) return { status: "invalid", problems };
  const unanswered = unansweredQuestions(a);
  if (unanswered.length > 0) {
    return { status: "incomplete", missing: unanswered.map((id) => ({ question: id, prompt: getQuestion(id, a).prompt, why: getQuestion(id, a).why })) };
  }
  const built = buildCandidates(a);
  const withNormality = a.purpose === "describe" ? built.candidates : applyNormality(built.candidates, a.normality);
  return { status: "complete", situation: describeSituation(a), candidates: ordered(withNormality), notes: built.notes };
}

// What each candidate involves, from the catalogues other tools own.

export interface CandidateAssumption {
  name: string;
  /** What it requires, when the assumption catalogue describes it. */
  statement: string | null;
}

/** The assumptions to check: from the Statistical Assumption Checker's guides where it covers the method, otherwise the analysis catalogue. */
export function assumptionsFor(method: AnalysisMethodId): CandidateAssumption[] {
  if (isAssumptionMethod(method)) return getMethodGuide(method).assumptions.map((id) => ({ name: ASSUMPTIONS[id].name, statement: ASSUMPTIONS[id].statement }));
  return getAnalysisMethod(method).assumptions.map((text) => ({ name: text, statement: null }));
}

export interface CandidateAlternative {
  name: string;
  when: string;
}

/** Other methods to consider, from the assumption guides where they exist, otherwise the catalogue's non-parametric counterpart. */
export function alternativesFor(method: AnalysisMethodId): CandidateAlternative[] {
  if (isAssumptionMethod(method)) {
    const guide = getMethodGuide(method);
    return [...guide.nonParametric, ...guide.alternatives].map((alternative) => ({ name: alternative.name, when: alternative.when }));
  }
  const fallback = NON_PARAMETRIC_ALTERNATIVE[method];
  return fallback ? [{ name: getAnalysisMethod(fallback).name, when: "When the data don't meet the assumption of normality." }] : [];
}

/** Whether the Statistical Assumption Checker has a guide for the method. */
export const assumptionCheckerCovers = (method: AnalysisMethodId): boolean => isAssumptionMethod(method);

/** Whether the Results Interpretation Assistant can interpret the method's results. */
export const interpreterCovers = (method: AnalysisMethodId): boolean => (RESULT_KINDS as readonly string[]).includes(method);
