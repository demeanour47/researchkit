/**
 * The assumptions a project should plan to check, for the analyses its analysis plan
 * recommends. What the project draft already shows (measurement levels, repeated
 * measurement, clustering, sample size, multi-item scales) is judged now; everything
 * that needs data is left for the researcher to review. Statuses are the shared check
 * vocabulary; nothing is scored.
 */

import { allRecommendations, recommendAnalyses, type AnalysisPlan } from "../data-analysis";
import type { AnalysisProfile, MeasuredVariable } from "../data-analysis-profile";
import type { Recommendation } from "../data-analysis-rules";
import type { RecommendationStrength } from "../data-analysis-types";
import type { CheckStatus } from "../hypothesis-checks";
import type { ResearchProjectDraft } from "../research-project";
import { getTechnique } from "../sampling-types";
import { ASSUMPTIONS, type AssumptionId } from "./catalogue";
import { METHOD_GUIDES, isAssumptionMethod, type AssumptionMethod } from "./methods";

export interface ChecklistItem {
  assumption: AssumptionId;
  status: CheckStatus;
  /** What the project shows about this assumption, or when to check it. */
  note: string;
  /** The project elements the note rests on. */
  basedOn: string[];
}

export interface MethodChecklist {
  method: AssumptionMethod;
  /** The strongest verdict the analysis plan gives this method. */
  strength: RecommendationStrength;
  /** The plan questions the method answers, such as “Hypothesis 1”. */
  questions: string[];
  items: ChecklistItem[];
}

export interface AssumptionChecklist {
  methods: MethodChecklist[];
  notes: string[];
}

const RANK: Readonly<Record<RecommendationStrength, number>> = { strong: 0, possible: 1, justify: 2 };
const list = (names: readonly string[]) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);
const sourceOf = (variable: MeasuredVariable) => `${variable.name}: ${variable.source}`;

/** The project's variables a recommendation rests on, read from its “name: source” entries. */
export function variablesOf(recommendation: Recommendation, profile: AnalysisProfile): MeasuredVariable[] {
  return profile.variables.filter((variable) => recommendation.basedOn.some((entry) => entry.startsWith(`${variable.name}: `)));
}

interface Context {
  profile: AnalysisProfile;
  project: ResearchProjectDraft;
  method: AssumptionMethod;
  variables: MeasuredVariable[];
}

const review = (id: AssumptionId, reason = "It can only be checked once the data are collected."): Omit<ChecklistItem, "assumption"> => ({ status: "review", note: `${reason} ${ASSUMPTIONS[id].howToCheck[0]}`, basedOn: [] });
const PAIRED_METHODS = new Set<AssumptionMethod>(["paired-t-test", "repeated-measures-anova"]);
const GROUPING = new Set(["binary", "categorical"]);

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** What the project shows about one assumption for one method. Notes start with a capital, even when they start with a variable's name. */
export function judgeAssumption(id: AssumptionId, context: Context): Omit<ChecklistItem, "assumption"> {
  const item = judge(id, context);
  return { ...item, note: capital(item.note) };
}

function judge(id: AssumptionId, { profile, project, method, variables }: Context): Omit<ChecklistItem, "assumption"> {
  const n = profile.sampleSize;
  const sample = profile.sampleSource ? [profile.sampleSource] : [];
  const unknown = variables.filter((variable) => variable.measure === "unknown");
  switch (id) {
    case "numeric-measurement": {
      // Grouping variables may be categorical; everything else must be numeric.
      const measured = variables.filter((variable) => !GROUPING.has(variable.measure));
      if (variables.length === 0) return review(id, "The analysis plan doesn't name the variables involved.");
      if (unknown.length > 0) return { status: "missing", note: `No measurement level is recorded for ${list(unknown.map((variable) => variable.name))}.`, basedOn: unknown.map(sourceOf) };
      const ordinal = measured.filter((variable) => variable.measure === "ordinal" || variable.measure === "text" || variable.measure === "multiple");
      const scales = measured.filter((variable) => variable.measure === "scale-score");
      if (ordinal.length > 0) return { status: "clarify", note: `${list(ordinal.map((variable) => variable.name))} ${ordinal.length === 1 ? "isn't" : "aren't"} measured on a numeric scale. Consider the non-parametric alternative, or justify treating ${ordinal.length === 1 ? "it" : "them"} as numeric.`, basedOn: ordinal.map(sourceOf) };
      if (scales.length > 0) return { status: "worth-checking", note: `${list(scales.map((variable) => variable.name))} ${scales.length === 1 ? "is a scale score" : "are scale scores"} from several rating items. Treating ${scales.length === 1 ? "it" : "them"} as interval is common, but state it and report reliability.`, basedOn: scales.map(sourceOf) };
      return { status: "aligned", note: `${list(measured.map((variable) => variable.name))} ${measured.length === 1 ? "is" : "are"} recorded as numeric.`, basedOn: measured.map(sourceOf) };
    }
    case "ordinal-measurement": {
      if (variables.length === 0) return review(id, "The analysis plan doesn't name the variables involved.");
      if (unknown.length > 0) return { status: "missing", note: `No measurement level is recorded for ${list(unknown.map((variable) => variable.name))}.`, basedOn: unknown.map(sourceOf) };
      const unordered = variables.filter((variable) => ["categorical", "text", "multiple"].includes(variable.measure));
      if (unordered.length > 0) return { status: "clarify", note: `${list(unordered.map((variable) => variable.name))} can't be put in order, so rank methods don't suit ${unordered.length === 1 ? "it" : "them"}.`, basedOn: unordered.map(sourceOf) };
      return { status: "aligned", note: `${list(variables.map((variable) => variable.name))} can be ranked.`, basedOn: variables.map(sourceOf) };
    }
    case "categorical-variables": {
      if (variables.length === 0) return review(id, "The analysis plan doesn't name the variables involved.");
      if (unknown.length > 0) return { status: "missing", note: `No measurement level is recorded for ${list(unknown.map((variable) => variable.name))}.`, basedOn: unknown.map(sourceOf) };
      const numeric = variables.filter((variable) => !GROUPING.has(variable.measure));
      if (numeric.length > 0) return { status: "clarify", note: `${list(numeric.map((variable) => variable.name))} ${numeric.length === 1 ? "isn't" : "aren't"} categorical; cutting ${numeric.length === 1 ? "it" : "them"} into categories loses information.`, basedOn: numeric.map(sourceOf) };
      return { status: "aligned", note: `${list(variables.map((variable) => variable.name))} ${variables.length === 1 ? "is" : "are"} categorical.`, basedOn: variables.map(sourceOf) };
    }
    case "binary-outcome": {
      const outcomes = variables.filter((variable) => variable.kind === "dependent");
      if (outcomes.length === 0) return review(id, "The analysis plan doesn't name the outcome.");
      if (outcomes.some((variable) => variable.measure === "unknown")) return { status: "missing", note: "Record how the outcome is measured.", basedOn: outcomes.map(sourceOf) };
      const other = outcomes.filter((variable) => variable.measure !== "binary");
      return other.length > 0
        ? { status: "clarify", note: `${list(other.map((variable) => variable.name))} ${other.length === 1 ? "doesn't" : "don't"} have exactly two categories.`, basedOn: other.map(sourceOf) }
        : { status: "aligned", note: `${list(outcomes.map((variable) => variable.name))} ${outcomes.length === 1 ? "has" : "have"} two categories.`, basedOn: outcomes.map(sourceOf) };
    }
    case "independence": {
      const technique = project.samplingPlan?.chosen ? getTechnique(project.samplingPlan.chosen) : null;
      if (technique && technique.traits.frame === "clusters") return { status: "worth-checking", note: `${technique.name} sampling groups participants, who may be more alike within a cluster. Plan to adjust for clustering, such as with a multilevel model.`, basedOn: [`Sampling technique: ${technique.name} sampling`] };
      if (profile.repeated && !PAIRED_METHODS.has(method)) return { status: "clarify", note: "The same participants are measured more than once. Use a paired or repeated measures method for comparisons over time.", basedOn: [profile.repeatedSource!] };
      if (profile.design) return { status: "aligned", note: `Nothing in your ${profile.design.name.toLowerCase()} design suggests related observations. Confirm each participant contributes once.`, basedOn: [`Research design: ${profile.design.name}`] };
      return review(id, "Record your design and sampling technique to judge this.");
    }
    case "paired-observations":
      return profile.repeated
        ? { status: "aligned", note: "Your project measures the same participants more than once.", basedOn: [profile.repeatedSource!] }
        : { status: "clarify", note: "Your project doesn't record repeated measurement. Paired methods need the same participants, or matched pairs, measured in each condition.", basedOn: profile.design ? [`Research design: ${profile.design.name}`] : [] };
    case "sphericity":
      return profile.repeated ? review(id, "It applies with three or more time points, and needs the data.") : { status: "clarify", note: "Your project doesn't record repeated measurement, which sphericity concerns.", basedOn: [] };
    case "normality":
    case "normality-of-residuals":
    case "normality-of-differences":
    case "multivariate-normality":
      if (n !== null && n < 30) return { status: "worth-checking", note: `With a planned sample of ${n}, normality matters more. Plan to check it carefully, and have the non-parametric alternative ready.`, basedOn: sample };
      return n !== null ? { status: "review", note: `Check once the data are collected. With a planned sample of ${n}, tests of means are commonly considered robust to moderate non-normality, but check anyway. ${ASSUMPTIONS[id].howToCheck[0]}`, basedOn: sample } : review(id);
    case "factor-sample-size":
      if (n === null) return review(id, "No planned sample size is recorded.");
      return n >= 100 ? { status: "aligned", note: `Your planned sample of ${n} meets the commonly cited minimum of 100; check it against the number of items too.`, basedOn: sample } : { status: "worth-checking", note: `Your planned sample of ${n} is below the commonly cited minimum of 100 for factor analysis.`, basedOn: sample };
    case "sem-sample-size": {
      if (n === null) return review(id, "No planned sample size is recorded.");
      if (method === "pls-sem") return { status: "review", note: `Compare your planned sample of ${n} with ten times the largest number of arrows pointing at one construct, or run a power analysis.`, basedOn: sample };
      return n >= 200 ? { status: "aligned", note: `Your planned sample of ${n} meets the commonly cited minimum of 200 for CB-SEM.`, basedOn: sample } : { status: "worth-checking", note: `Your planned sample of ${n} is below the commonly cited minimum of 200 for CB-SEM.`, basedOn: sample };
    }
    case "events-per-predictor": {
      const predictors = variables.filter((variable) => variable.kind !== "dependent").length;
      if (n === null || predictors === 0) return review(id, "The number of cases in each outcome group is only known once data are collected.");
      const needed = 10 * predictors;
      return n < needed * 2
        ? { status: "worth-checking", note: `With ${predictors} ${predictors === 1 ? "predictor" : "predictors"}, the smaller outcome group needs at least ${needed} cases by the common rule; your planned sample of ${n} may not provide that.`, basedOn: sample }
        : { status: "review", note: `With ${predictors} ${predictors === 1 ? "predictor" : "predictors"}, check the smaller outcome group has at least ${needed} cases once data are collected.`, basedOn: sample };
    }
    case "expected-counts":
      if (n !== null && n < 40) return { status: "worth-checking", note: `With a planned sample of ${n}, some expected counts are likely to fall below 5; plan to use Fisher's exact test if they do.`, basedOn: sample };
      return review(id);
    case "model-identification":
    case "measurement-model-quality":
    case "factorability": {
      const scales = profile.variables.filter((variable) => variable.items >= 2);
      if (scales.length === 0) return { status: "clarify", note: "No variable is recorded with several rating items, which this needs.", basedOn: [] };
      const thin = scales.filter((variable) => variable.items < 3);
      if (thin.length > 0 && id !== "measurement-model-quality") return { status: "worth-checking", note: `${list(thin.map((variable) => variable.name))} ${thin.length === 1 ? "has" : "have"} only two items; three or more are commonly needed.`, basedOn: thin.map(sourceOf) };
      return id === "model-identification"
        ? { status: "aligned", note: `Every multi-item construct has at least three items: ${list(scales.map((variable) => `${variable.name} (${variable.items})`))}.`, basedOn: scales.map(sourceOf) }
        : review(id);
    }
    case "covariate-independence":
      return profile.design?.manipulation === "yes"
        ? { status: "worth-checking", note: `In your ${profile.design.name.toLowerCase()} design, measure covariates before the intervention so the groups can't have changed them.`, basedOn: [`Research design: ${profile.design.name}`] }
        : review(id, "Confirm the covariate was measured independently of the grouping.");
    case "multicollinearity": {
      const predictors = variables.filter((variable) => variable.kind !== "dependent");
      return predictors.length >= 2 ? review(id, `${list(predictors.map((variable) => variable.name))} may overlap; check once the data are collected.`) : review(id);
    }
    default:
      return review(id);
  }
}

/** The checklist for a project: every supported method its analysis plan recommends, with each assumption judged. */
export function assumptionChecklist(project: ResearchProjectDraft, plan: AnalysisPlan = recommendAnalyses(project)): AssumptionChecklist {
  const byMethod = new Map<AssumptionMethod, { strength: RecommendationStrength; questions: Set<string>; variables: Map<string, MeasuredVariable> }>();
  for (const { question, recommendation } of allRecommendations(plan)) {
    if (!isAssumptionMethod(recommendation.method)) continue;
    const entry = byMethod.get(recommendation.method) ?? { strength: recommendation.strength, questions: new Set<string>(), variables: new Map<string, MeasuredVariable>() };
    if (RANK[recommendation.strength] < RANK[entry.strength]) entry.strength = recommendation.strength;
    entry.questions.add(question);
    for (const variable of variablesOf(recommendation, plan.profile)) entry.variables.set(variable.id, variable);
    byMethod.set(recommendation.method, entry);
  }
  const methods = [...byMethod.entries()]
    .map(([method, entry]): MethodChecklist => {
      const context: Context = { profile: plan.profile, project, method, variables: [...entry.variables.values()] };
      return { method, strength: entry.strength, questions: [...entry.questions], items: METHOD_GUIDES[method].assumptions.map((assumption) => ({ assumption, ...judgeAssumption(assumption, context) })) };
    })
    .sort((a, b) => RANK[a.strength] - RANK[b.strength]);
  const notes: string[] = [];
  if (plan.profile.variables.length === 0) notes.push("Record your variables and how they are measured to see which analyses, and so which assumptions, apply.");
  if (plan.profile.choice === "qualitative") notes.push("Your project is qualitative, so statistical assumptions apply only to any statistics you use alongside the main analysis.");
  if (methods.length > 0) notes.push("Check assumptions before running each analysis, and report the checks and any corrections in your method or results section.");
  return { methods, notes };
}
