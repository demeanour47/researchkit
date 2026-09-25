/**
 * The Data Analysis Recommender: an analysis plan for the project, read entirely from
 * the project draft. The plan goes in the order a thesis reports it: describe the data,
 * check the measures, answer each hypothesis (or explore each outcome), then test the
 * whole model. Every recommendation says why it suits, which parts of the project it
 * rests on, and what to justify.
 */

import { analysisProfile, type AnalysisProfile, type MeasuredVariable } from "./data-analysis-profile";
import {
  applyContext,
  controlRules,
  manovaRule,
  mediationRules,
  mergeRecommendations,
  moderationRules,
  multipleRules,
  pairRules,
  recommend,
  stronger,
  withFallbacks,
  type Recommendation,
} from "./data-analysis-rules";
import { ANALYSIS_METHODS, getAnalysisMethod, type AnalysisMethodId } from "./data-analysis-types";
import type { HypothesisForm } from "./hypothesis-types";
import type { ResearchProjectDraft } from "./research-project";

export interface AnalysisQuestion {
  id: string;
  title: string;
  /** The hypothesis wording, when the question comes from one. */
  hypothesis: string | null;
  form: HypothesisForm | null;
  recommendations: Recommendation[];
  notes: string[];
}

export const STAGE_IDS = ["describe", "measures", "questions", "model"] as const;
export type StageId = (typeof STAGE_IDS)[number];

export const STAGE_TITLES: Readonly<Record<StageId, string>> = {
  describe: "Describe your data",
  measures: "Check your measures",
  questions: "Answer your research questions",
  model: "Test the whole model",
};

export interface AnalysisStage {
  id: StageId;
  title: string;
  questions: AnalysisQuestion[];
  /** Why the stage has nothing to recommend, when it doesn't. */
  notes: string[];
}

export interface AnalysisPlan {
  profile: AnalysisProfile;
  stages: AnalysisStage[];
  /** The families of methods the plan draws on, such as Correlation, each with the strongest verdict among its methods. */
  overview: Recommendation[];
  /** Notes about the whole plan: sampling, methodology and gaps in the project. */
  notes: string[];
}

const byName = (profile: AnalysisProfile, name: string): MeasuredVariable =>
  profile.variables.find((variable) => variable.name.toLowerCase() === name.trim().toLowerCase()) ?? { id: `named-${name}`, name, kind: "independent", measure: "unknown", groups: null, items: 0, source: "Named in a hypothesis, not recorded as a variable" };
/** Names as a sentence list: “a”, “a and b”, “a, b and c”. */
export const listNames = (names: readonly string[]) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);
const ofKind = (profile: AnalysisProfile, ...kinds: string[]) => profile.variables.filter((variable) => kinds.includes(variable.kind));

// Describing the data.

export function describeStage(profile: AnalysisProfile): AnalysisStage {
  const categories = profile.variables.filter((variable) => ["binary", "categorical", "ordinal", "multiple"].includes(variable.measure));
  const numeric = profile.variables.filter((variable) => variable.measure === "numeric");
  const scales = profile.variables.filter((variable) => variable.measure === "scale-score");
  const ordinal = profile.variables.filter((variable) => variable.measure === "ordinal");
  const names = (variables: readonly MeasuredVariable[]) => listNames(variables.map((variable) => variable.name));
  const sources = (variables: readonly MeasuredVariable[]) => variables.map((variable) => `${variable.name}: ${variable.source}`);
  const qualitative = profile.choice === "qualitative";
  const recommendations: Recommendation[] = [
    recommend(
      "descriptive-statistics",
      qualitative ? "possible" : "strong",
      [qualitative ? "Even a qualitative study usually describes its participants, such as how many took part and their characteristics." : "Describing the sample and every variable comes before any test, and lets readers judge who the findings apply to."],
      profile.choiceSource ? [profile.choiceSource] : [],
    ),
  ];
  if (categories.length > 0) {
    recommendations.push(recommend("frequency", "strong", [`${names(categories)} ${categories.length === 1 ? "is" : "are"} measured in categories, which are summarised by counting each one.`], sources(categories)));
    recommendations.push(recommend("percentage", "strong", [`Percentages let the categories of ${names(categories)} be compared whatever the group sizes.`], sources(categories)));
  } else {
    recommendations.push(recommend("frequency", "possible", ["Counts describe participant characteristics, such as the number in each group, even when no study variable is categorical."]));
    recommendations.push(recommend("percentage", "possible", ["Percentages describe the make-up of the sample alongside the counts."]));
  }
  if (numeric.length > 0 || scales.length > 0) {
    const all = [...numeric, ...scales];
    const strength = numeric.length > 0 ? "strong" : "possible";
    recommendations.push(recommend("mean", strength, [`${names(all)} ${all.length === 1 ? "is" : "are"} numeric${scales.length > 0 ? " or a scale score" : ""}, so the average summarises the typical value.`], sources(all)));
    recommendations.push(recommend("standard-deviation", strength, [`The standard deviation shows how spread out ${names(all)} ${all.length === 1 ? "is" : "are"}, and is reported with every mean.`], sources(all)));
    recommendations.push(recommend("median", "possible", [`If ${names(all)} ${all.length === 1 ? "is" : "are"} ${all.length === 1 ? "skewed or has" : "skewed or have"} extreme values, the median describes the typical value better than the mean.`], sources(all)));
  }
  if (ordinal.length > 0) {
    recommendations.push(recommend("median", "strong", [`${names(ordinal)} ${ordinal.length === 1 ? "is" : "are"} ordinal, so the middle value describes ${ordinal.length === 1 ? "it" : "them"} without assuming equal steps.`], sources(ordinal)));
  }
  // Descriptive summaries carry no normality fallback: the median is listed beside the mean where it helps.
  const described = mergeRecommendations(recommendations).map((recommendation) => ({ ...recommendation, fallback: null }));
  return { id: "describe", title: STAGE_TITLES.describe, questions: [{ id: "describe", title: "Describe the participants and each variable", hypothesis: null, form: null, recommendations: described, notes: [] }], notes: [] };
}

// Checking the measures.

export function measuresStage(profile: AnalysisProfile): AnalysisStage {
  const scales = profile.variables.filter((variable) => variable.items >= 2);
  if (scales.length === 0) {
    return { id: "measures", title: STAGE_TITLES.measures, questions: [], notes: ["No variable is measured with several rating items, so scale reliability and factor analysis don't apply. If you use an established measure, report its published reliability and validity."] };
  }
  const list = scales.map((variable) => `${variable.name} (${variable.items} items)`).join(", ");
  const sources = scales.map((variable) => `${variable.name}: ${variable.source}`);
  const recommendations: Recommendation[] = [
    recommend("cronbach-alpha", "strong", [`${list} ${scales.length === 1 ? "combines" : "each combine"} several rating items into one score, so the items' internal consistency should be checked before the score is used.`], sources),
    recommend("reliability", "strong", ["A score is only as trustworthy as the items that make it; reliability is reported for every multi-item scale."], sources),
  ];
  const factorable = scales.filter((variable) => variable.items >= 3);
  if (factorable.length > 0) {
    const exploratory = profile.approach === "inductive" || profile.approach === "abductive" || profile.hypotheses.length === 0;
    let strength: Recommendation["strength"] = exploratory ? "strong" : "possible";
    const reasons = [
      exploratory
        ? `Your ${profile.approach ? `${profile.approach} approach` : "project, without hypotheses,"} explores structure, so exploratory factor analysis shows whether the items of ${factorable.map((variable) => variable.name).join(", ")} group as intended.`
        : `With hypotheses set in advance, confirmatory factor analysis tests whether the items of ${factorable.map((variable) => variable.name).join(", ")} measure the constructs they are meant to.`,
    ];
    let justify: string | null = null;
    const basedOn = [...sources, ...(profile.approach ? [`Research onion: ${profile.approach} approach`] : [])];
    if (profile.sampleSize !== null && profile.sampleSize < 100) {
      strength = "justify";
      reasons.push(`Your planned sample of ${profile.sampleSize} is small for factor analysis, whose results are unstable in small samples; many textbooks suggest at least 100 participants.`);
      justify = "Explain why factor analysis is appropriate with this sample, or rely on established measures' published validity.";
      if (profile.sampleSource) basedOn.push(profile.sampleSource);
    }
    recommendations.push(recommend("factor-analysis", strength, reasons, basedOn, justify));
    recommendations.push(recommend("kmo", strength, ["Checked before factor analysis: it shows whether the items share enough variance for factors to be meaningful."], sources, justify));
    recommendations.push(recommend("bartlett", strength, ["Checked before factor analysis: it shows the items are correlated at all."], sources, justify));
    recommendations.push(recommend("validity", strength, [`Factor analysis gives evidence that the scales for ${factorable.map((variable) => variable.name).join(", ")} measure what they are meant to.`], sources, justify));
  }
  return {
    id: "measures",
    title: STAGE_TITLES.measures,
    questions: [{ id: "measures", title: "Check the scales before using their scores", hypothesis: null, form: null, recommendations: mergeRecommendations(recommendations), notes: factorable.length === 0 ? ["Factor analysis needs at least three items per scale; your scales have two."] : [] }],
    notes: [],
  };
}

// Answering the research questions.

interface QuestionParts {
  id: string;
  title: string;
  hypothesis: string | null;
  form: HypothesisForm | null;
  independents: MeasuredVariable[];
  dependents: MeasuredVariable[];
  moderators: MeasuredVariable[];
  mediators: MeasuredVariable[];
  controls: MeasuredVariable[];
}

/** The analysis questions: one per alternative hypothesis, or one per dependent variable when there are no hypotheses. */
export function analysisQuestions(profile: AnalysisProfile): QuestionParts[] {
  const controls = ofKind(profile, "control", "confounding");
  if (profile.hypotheses.length > 0) {
    return profile.hypotheses.map((hypothesis, index) => {
      const relationship = hypothesis.relationship;
      return {
        id: hypothesis.id,
        title: `Hypothesis ${index + 1}`,
        hypothesis: hypothesis.text,
        form: relationship.form,
        independents: relationship.independentVariables.map((name) => byName(profile, name)),
        dependents: relationship.dependentVariables.map((name) => byName(profile, name)),
        moderators: relationship.moderators.map((name) => byName(profile, name)),
        mediators: relationship.mediators.map((name) => byName(profile, name)),
        controls: relationship.controls.length > 0 ? relationship.controls.map((name) => byName(profile, name)) : controls,
      };
    });
  }
  const independents = ofKind(profile, "independent");
  return ofKind(profile, "dependent").map((dependent) => ({
    id: `explore-${dependent.id}`,
    title: `What explains ${dependent.name}`,
    hypothesis: null,
    form: null,
    independents,
    dependents: [dependent],
    moderators: ofKind(profile, "moderator"),
    mediators: ofKind(profile, "mediator"),
    controls,
  }));
}

export function questionRecommendations(parts: QuestionParts, profile: AnalysisProfile): AnalysisQuestion {
  const notes: string[] = [];
  let recommendations: Recommendation[] = [];
  if (parts.independents.length === 0 || parts.dependents.length === 0) {
    notes.push(parts.hypothesis ? "This hypothesis doesn't name both an independent and a dependent variable, so no test can be matched to it." : "Record both independent and dependent variables to see which tests suit them.");
  }
  for (const dv of parts.dependents) {
    for (const iv of parts.independents) {
      const pair = pairRules(iv, dv, parts.form, profile.repeated);
      const several = parts.independents.length > 1;
      recommendations.push(...(several ? pair.recommendations.map((recommendation) => ({ ...recommendation, strength: recommendation.strength === "strong" ? ("possible" as const) : recommendation.strength, reasons: [...recommendation.reasons, `As a first look at ${iv.name} alone, before the model with every predictor.`] })) : pair.recommendations));
      notes.push(...pair.notes.filter((note) => !notes.includes(note)));
    }
    recommendations.push(...multipleRules(parts.independents, dv, parts.form));
    recommendations.push(...controlRules(parts.independents, dv, parts.controls));
    recommendations.push(...moderationRules(parts.independents, dv, parts.moderators));
    recommendations.push(...mediationRules(parts.independents, dv, parts.mediators, profile));
  }
  recommendations.push(...manovaRule(parts.independents, parts.dependents, parts.form));
  const context = { profile, fromHypothesis: parts.hypothesis !== null };
  recommendations = withFallbacks(mergeRecommendations(recommendations).map((recommendation) => applyContext(recommendation, context)));
  return { id: parts.id, title: parts.title, hypothesis: parts.hypothesis, form: parts.form, recommendations: mergeRecommendations(recommendations), notes };
}

export function questionsStage(profile: AnalysisProfile): AnalysisStage {
  const parts = analysisQuestions(profile);
  const notes: string[] = [];
  if (parts.length === 0) notes.push("Record your dependent and independent variables, or hypotheses, to see which tests answer your research questions.");
  else if (profile.hypotheses.length === 0) notes.push("Your project has no hypotheses, so the questions below explore each dependent variable. Tests used this way describe patterns rather than confirm predictions.");
  return { id: "questions", title: STAGE_TITLES.questions, questions: parts.map((part) => questionRecommendations(part, profile)), notes };
}

// Testing the whole model.

export function modelStage(profile: AnalysisProfile): AnalysisStage {
  const constructs = profile.variables.filter((variable) => variable.items >= 3);
  const inModel = profile.variables.filter((variable) => variable.measure !== "text" && variable.measure !== "unknown");
  const mediated = profile.hypotheses.some((hypothesis) => hypothesis.relationship.mediators.length > 0 || hypothesis.relationship.moderators.length > 0);
  if (constructs.length < 2 || inModel.length < 3 || (profile.hypotheses.length < 2 && !mediated)) {
    return {
      id: "model",
      title: STAGE_TITLES.model,
      questions: [],
      notes: ["Structural equation modelling suits frameworks linking three or more variables, at least two of them measured by several items, with several hypotheses. Your project doesn't have that yet, so the tests above answer each question separately."],
    };
  }
  const names = constructs.map((variable) => variable.name).join(", ");
  const basedOn = [...constructs.map((variable) => `${variable.name}: ${variable.source}`), `${profile.hypotheses.length} hypotheses`];
  const confirmatory = profile.approach === "deductive" || profile.philosophy === "positivism";
  const n = profile.sampleSize;
  const sampleBasis = profile.sampleSource ? [profile.sampleSource] : [];
  const recommendations: Recommendation[] = [
    recommend(
      "sem",
      constructs.length >= 3 && profile.hypotheses.length >= 2 ? "strong" : "possible",
      [`${names} are each measured by several items, and your hypotheses link them into one framework; SEM tests the measurement of each construct and every relationship together.`],
      basedOn,
    ),
  ];
  const cbReasons = [confirmatory ? "Your approach tests an established theory, which CB-SEM's overall model-fit statistics are designed for." : "CB-SEM tests how well a theorised model fits the data as a whole."];
  const cbBasis = [...basedOn, ...(profile.approach ? [`Research onion: ${profile.approach} approach`] : []), ...(profile.philosophy ? [`Research onion: ${profile.philosophy}`] : []), ...sampleBasis];
  if (n === null) recommendations.push(recommend("cb-sem", confirmatory ? "possible" : "justify", [...cbReasons, "CB-SEM needs a large sample, and no planned sample size is recorded."], cbBasis, "Confirm your sample will be large enough for CB-SEM; many guidelines suggest 200 or more."));
  else if (n >= 200) recommendations.push(recommend("cb-sem", confirmatory ? "strong" : "possible", [...cbReasons, `Your planned sample of ${n} is large enough for most CB-SEM models.`], cbBasis));
  else recommendations.push(recommend("cb-sem", "justify", [...cbReasons, `Your planned sample of ${n} is small for CB-SEM, which many guidelines suggest needs 200 or more.`], cbBasis, "Explain why CB-SEM suits this sample size, or consider PLS-SEM."));

  const plsReasons = [confirmatory ? "PLS-SEM estimates the same kind of model with fewer demands on sample size and normality." : "Your approach is exploratory or prediction-focused, which is what PLS-SEM is usually chosen for."];
  const plsBasis = [...basedOn, ...(profile.approach ? [`Research onion: ${profile.approach} approach`] : []), ...sampleBasis];
  const plsStrength = !confirmatory || (n !== null && n < 200) ? "strong" : "possible";
  if (n !== null && n < 200) plsReasons.push(`With a planned sample of ${n}, PLS-SEM is often chosen over CB-SEM.`);
  if (n !== null && n < 100) recommendations.push(recommend("pls-sem", "justify", [...plsReasons, `Even PLS-SEM needs enough participants for its largest regression in the model; ${n} may be too few.`], plsBasis, "Check the sample against the largest number of arrows pointing at any one construct in your model."));
  else recommendations.push(recommend("pls-sem", plsStrength, plsReasons, plsBasis));

  const adjusted = recommendations.map((recommendation) => applyContext(recommendation, { profile, fromHypothesis: true }));
  return { id: "model", title: STAGE_TITLES.model, questions: [{ id: "model", title: "Test the framework as a whole", hypothesis: null, form: null, recommendations: mergeRecommendations(adjusted), notes: [] }], notes: [] };
}

// The plan.

const UMBRELLAS = ANALYSIS_METHODS.filter((method) => method.covers.length > 0);

/** Family entries, such as Correlation or Regression, with the strongest verdict among their methods. Families already recommended themselves are left as they are. */
export function overview(stages: readonly AnalysisStage[]): Recommendation[] {
  const all = stages.flatMap((stage) => stage.questions.flatMap((question) => question.recommendations));
  const entries: Recommendation[] = [];
  for (const umbrella of UMBRELLAS) {
    const covered = all.filter((recommendation) => umbrella.covers.includes(recommendation.method));
    const own = all.filter((recommendation) => recommendation.method === umbrella.id);
    if (covered.length === 0 && own.length === 0) continue;
    const methods = [...new Set(covered.map((recommendation) => recommendation.method))];
    const strength = [...covered, ...own].map((recommendation) => recommendation.strength).reduce(stronger);
    const reasons = methods.length > 0 ? [`Your plan uses ${methods.map((id) => getAnalysisMethod(id).name).join(", ")}.`, getAnalysisMethod(umbrella.id).purpose] : [getAnalysisMethod(umbrella.id).purpose];
    entries.push(recommend(umbrella.id, strength, reasons, [], strength === "strong" ? null : "See the individual methods for what to justify."));
  }
  const repeated = all.filter((recommendation) => recommendation.method === "repeated-measures-anova");
  if (repeated.length > 0) entries.push(recommend("repeated-measures-anova", repeated.map((recommendation) => recommendation.strength).reduce(stronger), ["The same participants are measured more than once, so repeated measures methods compare the times."]));
  return entries;
}

/** The full analysis plan for a project. */
export function recommendAnalyses(project: ResearchProjectDraft): AnalysisPlan {
  const profile = analysisProfile(project);
  const stages = [describeStage(profile), measuresStage(profile), questionsStage(profile), modelStage(profile)];
  const notes: string[] = [];
  if (profile.choice === "qualitative") notes.push("Your project is qualitative. Its main analysis, such as thematic analysis, is outside this tool; the statistical methods below need justifying if you use them.");
  if (profile.choice === "mixed") notes.push("Your project uses mixed methods. These recommendations cover the quantitative strand; plan the qualitative analysis, and how the two will be integrated, separately.");
  if (profile.probabilitySampling === false) notes.push(`Your sample is chosen without probability sampling (${profile.samplingSource}), so p-values describe your sample more safely than the wider population. Say so when you generalise.`);
  notes.push(...profile.gaps);
  return { profile, stages, overview: overview(stages), notes };
}

/** Every recommendation in the plan, with the question it answers. */
export function allRecommendations(plan: AnalysisPlan): { stage: StageId; question: string; recommendation: Recommendation }[] {
  return plan.stages.flatMap((stage) => stage.questions.flatMap((question) => question.recommendations.map((recommendation) => ({ stage: stage.id, question: question.title, recommendation }))));
}

export const uses = (plan: AnalysisPlan, method: AnalysisMethodId) => allRecommendations(plan).filter((entry) => entry.recommendation.method === method);
