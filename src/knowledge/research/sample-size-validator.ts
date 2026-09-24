/**
 * Checks of sample size inputs, and how the calculation fits the project: design,
 * sampling technique, population, objectives, variables and hypotheses. Checks
 * explain; they never score or rank.
 */

import { getDesign } from "./design-types";
import type { CheckStatus } from "./hypothesis-checks";
import type { ResearchProjectDraft } from "./research-project";
import { calculateSampleSize, formatNumber, type SampleSizePlan } from "./sample-size";
import { cochran, finitePopulationCorrection, roundUp, zScore } from "./sample-size-formulas";
import { getSampleSizeMethod, type InputId } from "./sample-size-types";
import { getTechnique } from "./sampling-types";

type Status = Exclude<CheckStatus, "missing">;

export interface InputProblem {
  input: InputId;
  message: string;
}

/**
 * Inputs that make calculation impossible, each with what to fix. An empty list
 * means the plan can be calculated.
 */
export function inputProblems(plan: SampleSizePlan): InputProblem[] {
  const { inputs } = plan;
  const method = getSampleSizeMethod(plan.method);
  const problems: InputProblem[] = [];
  if (inputs.populationType === "finite") {
    if (inputs.populationSize === null) problems.push({ input: "populationSize", message: "Enter the population size, or choose an unknown population." });
    else if (!Number.isInteger(inputs.populationSize) || inputs.populationSize < 1) problems.push({ input: "populationSize", message: "The population size must be a whole number of at least 1." });
  } else if (method.needsPopulation) {
    problems.push({ input: "populationSize", message: `${method.name} needs a known population size. Enter one, or choose another method.` });
  }
  if (!(inputs.margin > 0 && inputs.margin < 50)) problems.push({ input: "margin", message: "The margin of error must be more than 0% and less than 50%." });
  if (!(inputs.proportion > 0 && inputs.proportion < 100)) {
    problems.push({ input: "proportion", message: "The estimated proportion must be more than 0% and less than 100%: at 0% or 100% there is no variation to estimate." });
  }
  if (inputs.responseRate !== null && !(inputs.responseRate > 0 && inputs.responseRate <= 100)) {
    problems.push({ input: "responseRate", message: "The response rate must be more than 0% and no more than 100%." });
  }
  if (!(inputs.designEffect > 0 && Number.isFinite(inputs.designEffect))) problems.push({ input: "designEffect", message: "The design effect must be a positive number, such as 1 or 1.5." });
  return problems;
}

export interface SampleSizeCheck {
  check: string;
  label: string;
  status: Status;
  explanation: string;
  /** Project elements the check refers to, quoted. */
  supports: string[];
}

const make = (check: string, label: string, status: Status, explanation: string, supports: string[] = []): SampleSizeCheck => ({ check, label, status, explanation, supports });

/** Points about the inputs worth knowing, for a plan that can be calculated. */
export function checkInputs(plan: SampleSizePlan): SampleSizeCheck[] {
  if (inputProblems(plan).length > 0) return [];
  const { inputs } = plan;
  const checks: SampleSizeCheck[] = [];
  const result = calculateSampleSize(plan);
  if (!result.available) {
    return [make("method", "Method", "review", "Power analysis isn't available in this calculator yet. Use statistical software, and record the effect size, significance level and power you assume.")];
  }
  if ((plan.method === "yamane" || plan.method === "slovin") && (inputs.confidence !== 95 || inputs.proportion !== 50)) {
    checks.push(make("fixed", "Fixed assumptions", "clarify", `${getSampleSizeMethod(plan.method).name} always assumes 95% confidence and a 50% proportion, so the ${inputs.confidence}% confidence and ${formatNumber(inputs.proportion, 2)}% proportion you entered aren't used. Choose Cochran's formula to use them.`));
  }
  if (plan.method === "krejcie-morgan" && (inputs.confidence !== 95 || inputs.proportion !== 50 || inputs.margin !== 5)) {
    checks.push(make("table", "Published table", "review", "Your values differ from the published table's (95% confidence, 50% proportion, 5% margin), so the result comes from the formula and won't appear in the table."));
  }
  if (plan.method === "cochran" && inputs.populationType === "finite" && inputs.populationSize !== null) {
    const corrected = roundUp(finitePopulationCorrection(cochran(zScore(inputs.confidence), inputs.proportion / 100, inputs.margin / 100), inputs.populationSize));
    if (corrected < (result.required ?? 0)) {
      checks.push(make("fpc", "Finite population", "worth-checking", `Your population is known (${inputs.populationSize}). The finite population correction would reduce the sample to ${corrected}.`));
    }
  }
  if (inputs.margin > 10) checks.push(make("margin", "Margin of error", "worth-checking", `A ±${formatNumber(inputs.margin, 2)}% margin is wide; estimates will be imprecise. Most surveys use 3% to 5%.`));
  if (inputs.designEffect < 1) checks.push(make("design-effect", "Design effect", "worth-checking", "A design effect below 1 means the design is more efficient than simple random sampling, which is unusual; explain where the figure comes from."));
  if (inputs.responseRate === null) checks.push(make("response", "Response rate", "review", "No response rate is set, so the calculation doesn't say how many people to invite."));
  if (result.exceedsPopulation) {
    checks.push(make("exceeds", "Population size", "clarify", "The sample, or the number to invite, is larger than the population. Consider inviting everyone (a census), or revisit the margin of error."));
  }
  return checks;
}

const PROPORTION_CUES = /\b(prevalence|proportion|percentage|share|how many|estimat\w*|levels?|rates?)\b/i;
const TESTING_CUES = /\b(test\w*|effects?|impacts?|compar\w*|differ\w*|relationships?|associat\w*|predict\w*)\b/i;
const CATEGORICAL = new Set(["binary", "nominal", "categorical", "ordinal", "likert", "multiple-response"]);
const NUMERIC = new Set(["interval", "ratio", "continuous"]);

/** How the calculation fits the project, each with the project elements behind it. */
export function checkSampleSizeCompatibility(plan: SampleSizePlan, project: ResearchProjectDraft): SampleSizeCheck[] {
  const checks: SampleSizeCheck[] = [];
  const precision = plan.method !== "power-analysis";

  const designId = project.researchDesign?.chosen;
  if (!designId) checks.push(make("design", "Research design", "review", "Choose your research design to see whether a precision-based sample size suits it."));
  else {
    const design = getDesign(designId);
    const supports = [`Research design: ${design.name}`];
    if (design.traits.emphasis === "qualitative") {
      checks.push(make("design", "Research design", "clarify", `${design.name} designs usually decide sample size by saturation or depth, not by a formula for estimating proportions.`, supports));
    } else if (design.family === "experimental" || design.id === "correlational") {
      checks.push(
        make(
          "design",
          "Research design",
          precision ? "worth-checking" : "aligned",
          precision ? `${design.name} designs usually test effects or relationships, which needs power analysis rather than a formula for estimating a proportion.` : `Power analysis suits ${design.name.toLowerCase()} designs, which test effects or relationships.`,
          supports,
        ),
      );
    } else {
      checks.push(make("design", "Research design", precision ? "aligned" : "review", precision ? `${design.name} designs often estimate proportions in a population, which these formulas are for.` : "Power analysis is for testing effects; check that your design tests one.", supports));
    }
  }

  const techniqueId = project.samplingPlan?.chosen;
  if (!techniqueId) checks.push(make("technique", "Sampling technique", "review", "Choose your sampling technique to see whether the formulas' assumption of random sampling holds."));
  else {
    const technique = getTechnique(techniqueId);
    const supports = [`Sampling technique: ${technique.name} sampling`];
    if (technique.category === "non-probability") {
      checks.push(make("technique", "Sampling technique", "clarify", `These formulas assume random sampling. With ${technique.name.toLowerCase()} sampling, the margin of error and confidence level don't strictly apply; treat the result as a guide to scale.`, supports));
    } else if (technique.traits.frame === "clusters" && plan.inputs.designEffect <= 1) {
      checks.push(make("technique", "Sampling technique", "worth-checking", `${technique.name} sampling usually needs a design effect above 1, because people in the same cluster tend to be alike.`, supports));
    } else {
      checks.push(make("technique", "Sampling technique", "aligned", `${technique.name} sampling is a probability technique, which the formulas assume.`, supports));
    }
  }

  const population = project.samplingPlan?.population;
  const populationSupports = [population?.targetPopulation && `Target population: ${population.targetPopulation}`, population?.samplingFrame && `Sampling frame: ${population.samplingFrame}`].filter((value): value is string => Boolean(value));
  if (!population?.targetPopulation) checks.push(make("population", "Population", "review", "Describe your target population in the Sampling Technique Builder, so the population size can be traced to it."));
  else if (plan.inputs.populationType === "finite" && !population.samplingFrame) {
    checks.push(make("population", "Population", "worth-checking", "You entered a population size but no sampling frame. Say where the count comes from.", populationSupports));
  } else if (plan.inputs.populationType === "unknown" && population.samplingFrame) {
    checks.push(make("population", "Population", "worth-checking", "You have a sampling frame, so you may be able to count the population and use the finite population correction.", populationSupports));
  } else checks.push(make("population", "Population", "aligned", "The population size matches how your population is defined.", populationSupports));

  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) checks.push(make("objectives", "Objectives", "review", "Add your objectives to see which the sample size serves."));
  else {
    const estimating = objectives.filter((objective) => PROPORTION_CUES.test(objective));
    const testing = objectives.filter((objective) => TESTING_CUES.test(objective));
    if (precision && estimating.length > 0) checks.push(make("objectives", "Objectives", "aligned", "An objective estimates a level or proportion, which these formulas are for.", estimating.map((objective) => `Objective: “${objective}”`)));
    else if (testing.length > 0) {
      checks.push(make("objectives", "Objectives", precision ? "worth-checking" : "aligned", precision ? "Your objectives test effects, differences or relationships. Those usually need power analysis." : "Your objectives test effects or relationships, which power analysis is for.", testing.map((objective) => `Objective: “${objective}”`)));
    } else checks.push(make("objectives", "Objectives", "review", "Check which objective the sample size serves."));
  }

  const dependent = (project.variables ?? []).filter((variable) => variable.variableType === "dependent");
  if (dependent.length === 0) checks.push(make("variables", "Variables", "review", "Record your dependent variables and their measurement levels in the Variables Builder to see how they affect the calculation."));
  else {
    const supports = dependent.map((variable) => `Dependent variable: ${variable.name}`);
    const numeric = dependent.filter((variable) => variable.measurementLevel && NUMERIC.has(variable.measurementLevel));
    const categorical = dependent.filter((variable) => variable.measurementLevel && CATEGORICAL.has(variable.measurementLevel));
    if (numeric.length > 0) {
      checks.push(make("variables", "Variables", "worth-checking", `${numeric.map((variable) => variable.name).join(", ")} ${numeric.length === 1 ? "is" : "are"} measured as numbers. Estimating a mean needs its standard deviation; the proportion-based formula here gives a cautious approximation only.`, supports));
    } else if (categorical.length > 0) {
      checks.push(make("variables", "Variables", "aligned", "Your dependent variables are measured in categories, whose proportions these formulas estimate.", supports));
    } else checks.push(make("variables", "Variables", "review", "Set your dependent variables' measurement levels to check the calculation fits them.", supports));
  }

  const hypotheses = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative").length;
  if (hypotheses === 0) checks.push(make("hypotheses", "Hypotheses", precision ? "aligned" : "review", precision ? "Your project has no hypotheses, so a precision-based sample size is appropriate." : "Your project has no hypotheses for a power analysis to test."));
  else {
    checks.push(
      make(
        "hypotheses",
        "Hypotheses",
        precision ? "worth-checking" : "aligned",
        precision ? "Testing hypotheses usually needs a power analysis, which sets the sample by the effect you want to detect rather than by precision." : "Power analysis is the usual way to size a study that tests hypotheses.",
        [`${hypotheses} alternative ${hypotheses === 1 ? "hypothesis" : "hypotheses"}`],
      ),
    );
  }
  return checks;
}
