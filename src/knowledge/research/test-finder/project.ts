/**
 * Starting points for the finder from a project draft: one per alternative hypothesis,
 * with the answers its variables, measurement levels and design already give. Only what
 * the project states is filled in, each with where it was read from; anything the
 * project doesn't say is left for the researcher to answer. The finder never writes to
 * the project.
 */

import { analysisProfile, type MeasuredVariable } from "../data-analysis-profile";
import type { ResearchProjectDraft } from "../research-project";
import { FINDER_LEVELS, type Count, type FinderAnswers, type FinderLevel } from "./questions";

export interface ProjectStart {
  /** The hypothesis id. */
  id: string;
  label: string;
  answers: FinderAnswers;
  /** Where each filled-in answer came from. */
  readFrom: string[];
}

const GROUPING = new Set(["binary", "categorical"]);

/** The finder's level for a measured variable: its own recorded level where it is one of the four, otherwise its analysable measure. */
function levelOf(variable: MeasuredVariable, project: ResearchProjectDraft): FinderLevel | undefined {
  const recorded = project.variables?.find((candidate) => candidate.id === variable.id)?.measurementLevel;
  if (recorded && (FINDER_LEVELS as readonly string[]).includes(recorded) && !(recorded === "ordinal" && variable.measure === "scale-score")) return recorded as FinderLevel;
  switch (variable.measure) {
    case "numeric":
    case "scale-score":
      return "interval";
    case "ordinal":
      return "ordinal";
    case "binary":
    case "categorical":
      return "nominal";
    default:
      return undefined;
  }
}

const countOf = (variable: MeasuredVariable): Count | undefined => (variable.measure === "binary" || variable.groups === 2 ? "two" : variable.groups !== null && variable.groups >= 3 ? "three-plus" : undefined);

/** One starting point per alternative hypothesis in the project. */
export function projectStarts(project: ResearchProjectDraft): ProjectStart[] {
  const profile = analysisProfile(project);
  const byName = (name: string) => profile.variables.find((variable) => variable.name.toLowerCase() === name.trim().toLowerCase()) ?? null;

  return profile.hypotheses.map((hypothesis, index) => {
    const { relationship } = hypothesis;
    const ivs = relationship.independentVariables.map(byName).filter((variable): variable is MeasuredVariable => variable !== null);
    const dv = relationship.dependentVariables.map(byName).find((variable) => variable !== null) ?? null;
    const controls = relationship.controls.map(byName).filter((variable): variable is MeasuredVariable => variable !== null);
    const readFrom = [`Hypothesis: “${hypothesis.text}”`];
    const answers: FinderAnswers = {};
    const note = (variable: MeasuredVariable) => readFrom.push(`${variable.name}: ${variable.source}`);

    const outcomeLevel = dv ? levelOf(dv, project) : undefined;
    if (dv) {
      answers.outcomeName = dv.name;
      note(dv);
    }
    const iv = ivs[0] ?? null;
    if (iv) {
      answers.predictorName = ivs.map((variable) => variable.name).join(" and ");
      ivs.forEach(note);
    }
    const categoricalIvs = ivs.filter((variable) => GROUPING.has(variable.measure));

    if (relationship.form === "difference") {
      answers.purpose = "compare";
      answers.comparison = profile.repeated ? "paired" : "independent";
      if (profile.repeated && profile.repeatedSource) readFrom.push(profile.repeatedSource);
      if (outcomeLevel) answers.outcomeLevel = outcomeLevel;
      if (answers.comparison === "independent" && iv) {
        const groups = countOf(iv);
        if (groups) answers.groups = groups;
        answers.secondFactor = categoricalIvs.length >= 2 ? "yes" : "no";
        answers.covariate = controls.some((variable) => variable.measure === "numeric" || variable.measure === "scale-score") ? "yes" : "no";
        controls.forEach(note);
      }
    } else if (relationship.form === "prediction") {
      answers.purpose = "predict";
      if (outcomeLevel) answers.outcomeLevel = outcomeLevel;
      if (outcomeLevel === "nominal" && dv) {
        const categories = countOf(dv);
        if (categories) answers.outcomeCategories = categories;
      }
      if (ivs.length > 0) answers.predictors = ivs.length >= 2 ? "several" : "one";
      if (ivs.length === 1 && iv) {
        const level = levelOf(iv, project);
        if (level) answers.predictorLevel = level;
        if (level === "nominal") {
          const categories = countOf(iv);
          if (categories) answers.predictorCategories = categories;
        }
      }
    } else {
      const predictorLevel = iv ? levelOf(iv, project) : undefined;
      if (outcomeLevel === "nominal" && predictorLevel === "nominal") {
        answers.purpose = "association";
        answers.categoricalVariables = "two";
      } else {
        answers.purpose = "relationship";
        if (outcomeLevel) answers.outcomeLevel = outcomeLevel;
        if (predictorLevel) answers.predictorLevel = predictorLevel;
      }
    }
    return { id: hypothesis.id, label: `Hypothesis ${index + 1}: ${hypothesis.text}`, answers, readFrom };
  });
}
