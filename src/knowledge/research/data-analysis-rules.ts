/**
 * The decision rules. Each rule looks at how variables are measured, what a hypothesis
 * claims, and the project's design, approach and sample, and says how strongly the
 * project supports a method, and why. Rules never call a method wrong: the weakest
 * verdict is that it needs justifying.
 *
 * Normality can't be known before data are collected, so every parametric method
 * carries its non-parametric alternative instead of a guess about the data.
 */

import type { AnalysisProfile, MeasuredVariable } from "./data-analysis-profile";
import { MEASURE_LABELS } from "./data-analysis-profile";
import { NON_PARAMETRIC_ALTERNATIVE, RECOMMENDATION_STRENGTHS, getAnalysisMethod, type AnalysisMethodId, type RecommendationStrength } from "./data-analysis-types";
import type { HypothesisForm } from "./hypothesis-types";

export interface Recommendation {
  method: AnalysisMethodId;
  strength: RecommendationStrength;
  /** Why the method suits, in sentences. Never empty. */
  reasons: string[];
  /** The project elements the reasons rest on, quoted. */
  basedOn: string[];
  /** What the researcher should justify, when the recommendation isn't strong. */
  justify: string | null;
  /** The non-parametric method to use if the normality assumption doesn't hold. */
  fallback: AnalysisMethodId | null;
}

export function recommend(method: AnalysisMethodId, strength: RecommendationStrength, reasons: string[], basedOn: string[] = [], justify: string | null = null): Recommendation {
  return { method, strength, reasons, basedOn, justify, fallback: NON_PARAMETRIC_ALTERNATIVE[method] ?? null };
}

/** One step weaker: strong becomes possible, possible needs justification. */
export const weaken = (strength: RecommendationStrength): RecommendationStrength => (strength === "strong" ? "possible" : "justify");
const rank = (strength: RecommendationStrength) => RECOMMENDATION_STRENGTHS.indexOf(strength);
export const stronger = (a: RecommendationStrength, b: RecommendationStrength) => (rank(a) <= rank(b) ? a : b);

export const numericLike = (variable: MeasuredVariable) => variable.measure === "numeric" || variable.measure === "scale-score";
/** Whether a variable forms exactly two groups. */
export const twoGroups = (variable: MeasuredVariable) => variable.measure === "binary" || (variable.measure === "categorical" && variable.groups === 2);
const describe = (variable: MeasuredVariable) => `${variable.name} (${MEASURE_LABELS[variable.measure]})`;
const based = (...variables: MeasuredVariable[]) => variables.map((variable) => `${variable.name}: ${variable.source}`);

/** Notes that a scale score is being analysed as numeric, which methods sections should state. */
function scaleNotes(...variables: MeasuredVariable[]): string[] {
  return variables
    .filter((variable) => variable.measure === "scale-score")
    .map((variable) => `${variable.name} combines ${variable.items} rating items into one score, which is commonly analysed as numeric; state this in your method.`);
}

export interface PairResult {
  recommendations: Recommendation[];
  notes: string[];
}

/**
 * Methods for one independent and one dependent variable, by how each is measured,
 * the hypothesis form (or null when there is no hypothesis), and whether the same
 * participants are measured more than once.
 */
export function pairRules(iv: MeasuredVariable, dv: MeasuredVariable, form: HypothesisForm | null, repeated: boolean): PairResult {
  const pair = `${iv.name} and ${dv.name}`;
  const basedOn = based(iv, dv);
  const r = (method: AnalysisMethodId, strength: RecommendationStrength, reasons: string[], justify: string | null = null) => recommend(method, strength, [...reasons, ...scaleNotes(iv, dv)], basedOn, justify);

  if (iv.measure === "unknown" || dv.measure === "unknown") {
    const unknown = [iv, dv].filter((variable) => variable.measure === "unknown").map((variable) => variable.name);
    return { recommendations: [], notes: [`Record how ${unknown.join(" and ")} ${unknown.length === 1 ? "is" : "are"} measured to see which tests suit ${pair}.`] };
  }
  if (iv.measure === "text" || dv.measure === "text") {
    return { recommendations: [], notes: [`${[iv, dv].filter((variable) => variable.measure === "text").map((variable) => variable.name).join(" and ")} ${iv.measure === "text" && dv.measure === "text" ? "are" : "is"} collected as written answers, which need qualitative analysis, such as coding into themes, before any statistical test.`] };
  }
  if (iv.measure === "multiple" || dv.measure === "multiple") {
    const ticked = [iv, dv].filter((variable) => variable.measure === "multiple").map((variable) => variable.name).join(" and ");
    return {
      recommendations: [r("chi-square", "justify", [`${ticked} lets participants tick several choices, so each choice becomes its own yes/no variable before it can be tested.`], `Explain how ${ticked} is split into yes/no variables, and how you will handle testing each one.`)],
      notes: [],
    };
  }

  const recommendations: Recommendation[] = [];
  const add = (method: AnalysisMethodId, strength: RecommendationStrength, reasons: string[], justify: string | null = null) => recommendations.push(r(method, strength, reasons, justify));

  if (numericLike(dv)) {
    if (numericLike(iv)) {
      const both = `${iv.name} and ${dv.name} are both numeric`;
      if (form === "difference") {
        add("pearson", "justify", [`${both}, so a relationship test fits them.`], `A difference hypothesis compares groups, but ${iv.name} is numeric. State the hypothesis as a relationship, or explain how groups are formed from ${iv.name}.`);
      } else if (form === "prediction") {
        add("simple-regression", "strong", [`The hypothesis predicts ${dv.name} from ${iv.name}, and ${both}.`]);
        add("pearson", "possible", [`${both}; Pearson describes the strength of the relationship the regression models.`]);
      } else {
        add("pearson", "strong", [`${form === "relationship" ? "The hypothesis concerns a relationship, and" : "To see how they relate:"} ${both}.`]);
        add("simple-regression", "possible", [`If you want to predict ${dv.name} from ${iv.name}, regression models the same relationship with an equation.`]);
      }
    } else if (iv.measure === "ordinal") {
      add("spearman", "strong", [`${describe(iv)} can be ranked but not measured, and ${dv.name} can be ranked, so a rank correlation fits.`]);
    } else if (twoGroups(iv)) {
      if (repeated) {
        add("paired-t-test", form === "difference" || form === null ? "strong" : "possible", [`${dv.name} is numeric, and the same participants are measured at two times or in two conditions, so the measurements are paired.`]);
      } else {
        add("independent-t-test", form === "difference" ? "strong" : "possible", [`${describe(iv)} splits participants into two separate groups, and ${dv.name} is numeric, so their means can be compared.`]);
        if (form === "prediction") add("simple-regression", "possible", [`A two-group predictor can enter a regression as a 0/1 variable, which gives the same answer as the t-test with a prediction equation.`]);
      }
    } else {
      // Categorical with three or more groups, or an unknown number.
      if (repeated) {
        const known = iv.groups !== null;
        add("repeated-measures-anova", known ? "strong" : "possible", [`${dv.name} is numeric and the same participants are measured ${known ? `${iv.groups} times` : "more than once"}, so repeated measures ANOVA compares the times. If the data aren't normal, its non-parametric counterpart is the Friedman test.`], known ? null : `Record how many times ${dv.name} is measured to confirm there are three or more.`);
        if (!known) add("paired-t-test", "possible", [`If ${dv.name} is measured only twice, the paired t-test compares the two times.`], `Record how many times ${dv.name} is measured.`);
      } else if (iv.groups !== null && iv.groups >= 3) {
        add("one-way-anova", form === "difference" ? "strong" : "possible", [`${describe(iv)} forms ${iv.groups} groups, and ${dv.name} is numeric, so the group means can be compared.`]);
      } else {
        add("one-way-anova", "possible", [`If ${iv.name} has three or more groups, one-way ANOVA compares ${dv.name}'s mean across them.`], `Record ${iv.name}'s categories, such as its answer options, to confirm how many groups there are.`);
        add("independent-t-test", "possible", [`If ${iv.name} has only two groups, the t-test compares them.`], `Record ${iv.name}'s categories to confirm how many groups there are.`);
      }
    }
    return { recommendations, notes: [] };
  }

  if (dv.measure === "ordinal") {
    if (numericLike(iv) || iv.measure === "ordinal") {
      add("spearman", "strong", [`${describe(dv)} can be ranked but its steps may not be equal, so a rank correlation fits better than Pearson.`]);
      add("pearson", "justify", [`Pearson treats ${dv.name}'s ordered categories as equally spaced numbers.`], `Explain why ${dv.name}'s categories can be treated as equally spaced numbers.`);
    } else if (twoGroups(iv)) {
      if (repeated) {
        add("wilcoxon", "strong", [`${describe(dv)} is ordered, and the same participants are measured twice, so the signed-rank test compares the paired answers.`]);
        add("paired-t-test", "justify", [`The paired t-test treats ${dv.name}'s ordered categories as equally spaced numbers.`], `Explain why ${dv.name} can be treated as numeric.`);
      } else {
        add("mann-whitney", "strong", [`${describe(dv)} is ordered, and ${describe(iv)} forms two independent groups, so a rank test compares them.`]);
        add("independent-t-test", "justify", [`The t-test treats ${dv.name}'s ordered categories as equally spaced numbers.`], `Explain why ${dv.name} can be treated as numeric.`);
      }
    } else {
      add("kruskal-wallis", "strong", [`${describe(dv)} is ordered, and ${describe(iv)} forms several groups, so a rank test compares them.${repeated ? " With repeated measurements of the same people, the Friedman test is the related-samples version." : ""}`]);
      add("one-way-anova", "justify", [`ANOVA treats ${dv.name}'s ordered categories as equally spaced numbers.`], `Explain why ${dv.name} can be treated as numeric.`);
    }
    return { recommendations, notes: [] };
  }

  if (dv.measure === "binary") {
    if (numericLike(iv) || iv.measure === "ordinal") {
      add("logistic-regression", "strong", [`${describe(dv)} has two categories, so logistic regression models the chance of each from ${describe(iv)}.`]);
    } else {
      add("chi-square", "strong", [`${describe(iv)} and ${describe(dv)} are both categories, so the test checks whether they are associated.`]);
      add("fisher-exact", "possible", [`If some combinations of ${pair} are rare, with expected counts below 5, Fisher's exact test replaces chi-square.`]);
    }
    return { recommendations, notes: [] };
  }

  // Categorical outcome with several categories.
  if (iv.measure === "binary" || iv.measure === "categorical") {
    add("chi-square", "strong", [`${describe(iv)} and ${describe(dv)} are both categories, so the test checks whether they are associated.`]);
    add("fisher-exact", "possible", [`If some combinations of ${pair} are rare, with expected counts below 5, Fisher's exact test replaces chi-square.`]);
  } else {
    add("logistic-regression", "justify", [`Logistic regression here handles an outcome with two categories; ${dv.name} has more.`], `Explain how ${dv.name}'s categories are combined into two, or use multinomial logistic regression, which this tool doesn't cover.`);
    add("one-way-anova", "possible", [`Comparing ${iv.name} across ${dv.name}'s categories reverses the roles of the variables, which can still answer whether they are related.`], `Explain why comparing ${iv.name} across ${dv.name}'s categories answers your question.`);
  }
  return { recommendations, notes: [] };
}

/** Methods for several independent variables predicting or explaining one dependent variable. */
export function multipleRules(ivs: readonly MeasuredVariable[], dv: MeasuredVariable, form: HypothesisForm | null): Recommendation[] {
  const known = ivs.filter((variable) => variable.measure !== "unknown" && variable.measure !== "text" && variable.measure !== "multiple");
  if (known.length < 2 || dv.measure === "unknown" || dv.measure === "text" || dv.measure === "multiple") return [];
  const names = known.map((variable) => variable.name).join(", ");
  const basedOn = based(...known, dv);
  const categorical = known.filter((variable) => variable.measure === "binary" || variable.measure === "categorical");

  if (numericLike(dv)) {
    const recommendations = [recommend("multiple-regression", form === "difference" ? "possible" : "strong", [`${names} may each explain ${dv.name}, which is numeric; multiple regression estimates each one's contribution while holding the others constant.`, ...scaleNotes(dv)], basedOn)];
    if (categorical.length === 2 && known.length === 2) {
      recommendations.push(recommend("two-way-anova", form === "difference" ? "strong" : "possible", [`${categorical.map(describe).join(" and ")} are both grouping factors, so two-way ANOVA compares ${dv.name} across them and tests whether they interact.`], basedOn));
    }
    return recommendations;
  }
  if (dv.measure === "binary") return [recommend("logistic-regression", "strong", [`${describe(dv)} has two categories, and ${names} may each explain it; logistic regression estimates each one's contribution.`], basedOn)];
  if (dv.measure === "ordinal") {
    return [recommend("multiple-regression", "justify", [`Multiple regression treats ${dv.name}'s ordered categories as equally spaced numbers.`], basedOn, `Explain why ${dv.name} can be treated as numeric, or analyse each predictor separately with rank methods.`)];
  }
  return [];
}

/** MANOVA, for one grouping variable and several numeric outcomes. */
export function manovaRule(ivs: readonly MeasuredVariable[], dvs: readonly MeasuredVariable[], form: HypothesisForm | null): Recommendation[] {
  const outcomes = dvs.filter(numericLike);
  const groups = ivs.filter((variable) => variable.measure === "binary" || variable.measure === "categorical");
  if (outcomes.length < 2 || groups.length === 0) return [];
  return [
    recommend(
      "manova",
      form === "difference" && groups.length === 1 ? "strong" : "possible",
      [`${groups.map(describe).join(" and ")} ${groups.length === 1 ? "forms" : "form"} groups, and ${outcomes.map((variable) => variable.name).join(" and ")} are several numeric outcomes, so MANOVA compares the groups on all of them at once and guards against testing each separately.`],
      based(...groups, ...outcomes),
    ),
  ];
}

/** Adjusting for control variables: ANCOVA when groups are compared, hierarchical regression otherwise. */
export function controlRules(ivs: readonly MeasuredVariable[], dv: MeasuredVariable, controls: readonly MeasuredVariable[]): Recommendation[] {
  const usable = controls.filter((variable) => variable.measure !== "text" && variable.measure !== "unknown" && variable.measure !== "multiple");
  if (usable.length === 0 || !numericLike(dv) || ivs.length === 0) return [];
  const names = usable.map((variable) => variable.name).join(", ");
  const basedOn = based(...ivs, dv, ...usable);
  const grouping = ivs.every((variable) => variable.measure === "binary" || variable.measure === "categorical");
  const numericControls = usable.filter(numericLike);
  if (grouping && numericControls.length > 0) {
    return [recommend("ancova", "strong", [`You compare groups on ${dv.name}, and ${numericControls.map((variable) => variable.name).join(", ")} ${numericControls.length === 1 ? "is a numeric control variable" : "are numeric control variables"}, so ANCOVA compares the groups after adjusting for ${numericControls.length === 1 ? "it" : "them"}.`], basedOn)];
  }
  return [recommend("hierarchical-regression", "strong", [`${names} ${usable.length === 1 ? "is a control variable" : "are control variables"}, so hierarchical regression enters ${usable.length === 1 ? "it" : "them"} first and shows what ${ivs.map((variable) => variable.name).join(", ")} ${ivs.length === 1 ? "adds" : "add"} beyond ${usable.length === 1 ? "it" : "them"}.`, ...scaleNotes(dv)], basedOn)];
}

/** Moderation: the moderator changes the strength or direction of a relationship. */
export function moderationRules(ivs: readonly MeasuredVariable[], dv: MeasuredVariable, moderators: readonly MeasuredVariable[]): Recommendation[] {
  if (moderators.length === 0 || ivs.length === 0) return [];
  const names = moderators.map((variable) => variable.name).join(", ");
  const basedOn = based(...ivs, dv, ...moderators);
  const recommendations: Recommendation[] = [];
  if (numericLike(dv)) recommendations.push(recommend("moderation", "strong", [`The hypothesis says ${names} changes how ${ivs.map((variable) => variable.name).join(", ")} relates to ${dv.name}; a regression with an interaction term tests exactly that.`, ...scaleNotes(dv)], basedOn));
  else if (dv.measure === "binary") recommendations.push(recommend("moderation", "possible", [`${names} is a moderator and ${dv.name} has two categories, so the interaction is tested in a logistic regression.`], basedOn));
  else recommendations.push(recommend("moderation", "justify", [`Moderation is usually tested in regression, which needs ${dv.name} to be numeric or to have two categories.`], basedOn, `Explain how ${dv.name} will be analysed in a model with an interaction.`));
  const categoricalModerator = moderators.some((variable) => variable.measure === "binary" || variable.measure === "categorical");
  if (numericLike(dv) && categoricalModerator && ivs.some((variable) => variable.measure === "binary" || variable.measure === "categorical")) {
    recommendations.push(recommend("two-way-anova", "possible", [`The independent variable and the moderator both form groups, so two-way ANOVA tests their interaction on ${dv.name}.`], basedOn));
  }
  return recommendations;
}

/** Mediation: an independent variable affects the outcome through a mediator. */
export function mediationRules(ivs: readonly MeasuredVariable[], dv: MeasuredVariable, mediators: readonly MeasuredVariable[], profile: AnalysisProfile): Recommendation[] {
  if (mediators.length === 0 || ivs.length === 0) return [];
  const names = mediators.map((variable) => variable.name).join(", ");
  const basedOn = based(...ivs, dv, ...mediators);
  const reasons = [`The hypothesis says ${ivs.map((variable) => variable.name).join(", ")} affects ${dv.name} through ${names}; mediation analysis estimates that indirect effect, usually with bootstrapped confidence intervals.`];
  if (!numericLike(dv) || !mediators.every(numericLike)) {
    return [recommend("mediation", "justify", reasons, basedOn, `Mediation models usually need numeric mediators and outcomes. Explain how ${[dv, ...mediators].filter((variable) => !numericLike(variable)).map((variable) => variable.name).join(" and ")} will be modelled.`)];
  }
  const ordered = profile.repeated || profile.design?.causality === "strong" || profile.design?.causality === "moderate";
  if (ordered) return [recommend("mediation", "strong", [...reasons, profile.repeated ? "Measuring at more than one time helps establish that the mediator comes between cause and outcome." : `Your design (${profile.design!.name}) supports claims about cause and effect.`], basedOn)];
  return [recommend("mediation", "possible", [...reasons], basedOn, "With every variable measured at the same time, the causal order of predictor, mediator and outcome comes from theory, not the data. Justify that order.")];
}

// Context: approach, design, exploration and sample size adjust every question's recommendations.

const DESCRIBE_FAMILY = new Set<AnalysisMethodId>(["descriptive-statistics", "frequency", "percentage", "mean", "median", "standard-deviation"]);

export interface Context {
  profile: AnalysisProfile;
  /** True when the question comes from a hypothesis, false when it is explored from the variables. */
  fromHypothesis: boolean;
}

/** Applies what the whole project says to one recommendation. */
export function applyContext(recommendation: Recommendation, { profile, fromHypothesis }: Context): Recommendation {
  if (DESCRIBE_FAMILY.has(recommendation.method)) return recommendation;
  let { strength, justify } = recommendation;
  const reasons = [...recommendation.reasons];
  const basedOn = [...recommendation.basedOn];
  const method = getAnalysisMethod(recommendation.method);

  if (profile.choice === "qualitative") {
    strength = "justify";
    reasons.push("Your project is qualitative, where statistical tests usually aren't the main analysis.");
    justify = justify ?? "Explain what a statistical test adds to a qualitative study, such as describing a larger group alongside interviews.";
    if (profile.choiceSource) basedOn.push(profile.choiceSource);
    return { ...recommendation, strength, reasons, basedOn, justify };
  }
  if (!fromHypothesis && strength === "strong") {
    strength = "possible";
    reasons.push("No hypothesis states this relationship, so the test explores it rather than confirming a prediction.");
  } else if (fromHypothesis && strength === "strong" && profile.approach === "deductive") {
    reasons.push("Your deductive approach tests hypotheses stated before the data are collected, which is what this test does.");
    basedOn.push("Research onion: deductive approach");
  }
  if (profile.design?.id === "descriptive" && strength === "strong") {
    strength = "possible";
    reasons.push("A descriptive design mainly describes; tests of relationships or differences go beyond it.");
    basedOn.push("Research design: Descriptive");
  }
  if (profile.design && strength !== "justify") {
    if (method.family === "difference" && profile.design.manipulation === "yes") reasons.push(`Your ${profile.design.name.toLowerCase()} design creates the groups being compared.`);
    if ((method.family === "relationship" || method.family === "prediction") && profile.design.manipulation === "no" && profile.design.family !== "qualitative") {
      reasons.push(`Your ${profile.design.name.toLowerCase()} design measures variables as they occur, which suits tests of relationships.`);
    }
  }
  if (method.parametric && profile.sampleSize !== null && profile.sampleSize < 30 && strength === "strong") {
    strength = "possible";
    reasons.push(`Your planned sample of ${profile.sampleSize} is small, so whether the data are normally distributed matters more.`);
    justify = justify ?? `Check normality before relying on this test${recommendation.fallback ? `, and use ${getAnalysisMethod(recommendation.fallback).name} if it doesn't hold` : ""}.`;
    if (profile.sampleSource) basedOn.push(profile.sampleSource);
  }
  return { ...recommendation, strength, reasons, basedOn, justify };
}

/** Adds each parametric method's non-parametric alternative, for use if normality doesn't hold. */
export function withFallbacks(recommendations: readonly Recommendation[]): Recommendation[] {
  const out = [...recommendations];
  for (const recommendation of recommendations) {
    const fallback = recommendation.fallback;
    if (!fallback || out.some((candidate) => candidate.method === fallback)) continue;
    out.push(
      recommend(
        fallback,
        recommendation.strength === "justify" ? "justify" : "possible",
        [`If the data don't meet ${getAnalysisMethod(recommendation.method).name}'s assumption of normality, ${getAnalysisMethod(fallback).name} answers the same question without it.`],
        recommendation.basedOn,
        recommendation.strength === "justify" ? recommendation.justify : null,
      ),
    );
  }
  return out;
}

/** Combines recommendations of the same method, keeping the stronger verdict and every reason. */
export function mergeRecommendations(recommendations: readonly Recommendation[]): Recommendation[] {
  const merged: Recommendation[] = [];
  for (const recommendation of recommendations) {
    const existing = merged.find((candidate) => candidate.method === recommendation.method);
    if (!existing) {
      merged.push({ ...recommendation, reasons: [...recommendation.reasons], basedOn: [...recommendation.basedOn] });
      continue;
    }
    const strength = stronger(existing.strength, recommendation.strength);
    existing.reasons.push(...recommendation.reasons.filter((reason) => !existing.reasons.includes(reason)));
    existing.basedOn.push(...recommendation.basedOn.filter((item) => !existing.basedOn.includes(item)));
    existing.justify = strength === "strong" ? null : existing.strength === strength ? existing.justify : recommendation.justify;
    existing.strength = strength;
  }
  return merged.sort((a, b) => rank(a.strength) - rank(b.strength));
}
