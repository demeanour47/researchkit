/** Checks of the researcher's sampling plan: population, choice, reason, procedure, response and bias. */

import type { CheckStatus } from "./hypothesis-checks";
import { containsPhrase, words } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";
import type { SamplingPlan } from "./sampling";
import { checkSamplingCompatibility } from "./sampling-compatibility";
import { narrowTechniques } from "./sampling-decision";
import { getTechnique } from "./sampling-types";

export const PLAN_CHECK_IDS = ["population", "unit", "criteria", "choice", "frame", "reason", "procedure", "response", "bias", "compatibility", "answers"] as const;
export type PlanCheckId = (typeof PLAN_CHECK_IDS)[number];

export const PLAN_CHECK_LABELS: Readonly<Record<PlanCheckId, string>> = {
  population: "Population",
  unit: "Unit of analysis",
  criteria: "Inclusion and exclusion criteria",
  choice: "Technique chosen",
  frame: "Sampling frame",
  reason: "Reason for the technique",
  procedure: "Selection procedure",
  response: "Expected response",
  bias: "Biases and mitigation",
  compatibility: "Fit with your project",
  answers: "Fit with your answers",
};

export interface PlanCheck {
  check: PlanCheckId;
  label: string;
  status: Exclude<CheckStatus, "missing">;
  explanation: string;
}

/** Reasons shorter than this rarely explain why a technique suits the question, design and population. */
export const SHORT_REASON_WORDS = 30;

const criteriaCount = (count: number, kind: string) => `${count} ${kind} ${count === 1 ? "criterion" : "criteria"}`;

const make = (check: PlanCheckId, status: PlanCheck["status"], explanation: string): PlanCheck => ({ check, label: PLAN_CHECK_LABELS[check], status, explanation });

export function validateSamplingPlan(plan: SamplingPlan, project: ResearchProjectDraft): PlanCheck[] {
  const { population } = plan;
  const checks: PlanCheck[] = [];

  if (!population.targetPopulation) checks.push(make("population", "review", "Describe your target population: everyone your findings are meant to apply to."));
  else if (!population.accessiblePopulation) checks.push(make("population", "review", "Describe your accessible population: the part of the target population you can actually reach."));
  else checks.push(make("population", "aligned", "Your target and accessible populations are both described. Explain any difference between them in your methodology."));

  checks.push(
    population.unitOfAnalysis
      ? make("unit", "aligned", `Your unit of analysis is “${population.unitOfAnalysis}”.`)
      : make("unit", "review", "State your unit of analysis: what each case in your data is, such as a person, a class or a school."),
  );

  checks.push(
    population.inclusionCriteria.length + population.exclusionCriteria.length === 0
      ? make("criteria", "worth-checking", "List who is eligible and who isn't. Clear criteria make your sample reproducible and your findings easier to interpret.")
      : make("criteria", "aligned", `You have listed ${criteriaCount(population.inclusionCriteria.length, "inclusion")} and ${criteriaCount(population.exclusionCriteria.length, "exclusion")}.`),
  );

  if (!plan.chosen) {
    checks.push(make("choice", "review", plan.shortlist.length > 0 ? "You haven't chosen a technique yet. That is your decision: compare your shortlist, then choose." : "You haven't chosen or shortlisted a technique yet."));
    return checks;
  }
  const technique = getTechnique(plan.chosen);
  const name = `${technique.name.toLowerCase()} sampling`;
  checks.push(make("choice", "aligned", `You have chosen ${name}.`));

  if (technique.traits.frame !== "none") {
    checks.push(
      population.samplingFrame
        ? make("frame", "aligned", `Your sampling frame is “${population.samplingFrame}”. Check that it lists every member of the population, and nobody outside it.`)
        : make("frame", "clarify", `${technique.name} sampling needs a sampling frame, and you haven't described one.`),
    );
  }

  const count = words(plan.reason).length;
  if (count === 0) checks.push(make("reason", "review", "Write why this technique suits your question, design and population."));
  else if (count < SHORT_REASON_WORDS) checks.push(make("reason", "worth-checking", `Your reason is ${count} words. A full reason usually covers why the technique suits your question and design, and how you will handle its limitations.`));
  else if (!containsPhrase(plan.reason, technique.name)) checks.push(make("reason", "worth-checking", `Your reason doesn't name the technique. Say explicitly why ${name} is appropriate.`));
  else checks.push(make("reason", "aligned", "Your reason names the technique and is long enough to explain your thinking."));

  if (!plan.selectionProcedure) checks.push(make("procedure", "review", "Describe step by step how participants will be selected and invited."));
  else if (technique.category === "probability" && !/\brandom\w*/i.test(plan.selectionProcedure)) {
    checks.push(make("procedure", "worth-checking", "Your procedure doesn't say how random selection will be done, such as with a random number generator."));
  } else checks.push(make("procedure", "aligned", "Your selection procedure is described."));

  if (plan.expectedResponseRate === null) {
    checks.push(make("response", "review", "Estimate what share of the people you invite will take part, so you know how many to invite."));
  } else {
    const rate = plan.expectedResponseRate;
    const invite = rate > 0 ? Math.ceil(100 / (rate / 100)) : null;
    checks.push(
      make(
        "response",
        rate < 100 && !plan.potentialBiases ? "worth-checking" : "review",
        `At ${rate}%, ${invite === null ? "nobody you invite would take part" : `you would need to invite about ${invite} people for every 100 participants`}.${rate < 100 && !plan.potentialBiases ? " People who don't respond may differ from those who do; consider this under potential biases." : " Base the estimate on similar studies or a pilot."}`,
      ),
    );
  }

  if (!plan.potentialBiases) checks.push(make("bias", "review", "Describe the biases your sampling could introduce, such as who is left out or who is more likely to take part."));
  else if (!plan.mitigation) checks.push(make("bias", "worth-checking", "You have described potential biases but not how you will reduce or account for them."));
  else checks.push(make("bias", "aligned", "Potential biases and how you will address them are both described."));

  const compatibility = checkSamplingCompatibility(plan.chosen, project);
  const clarify = compatibility.filter((check) => check.status === "clarify");
  const worth = compatibility.filter((check) => check.status === "worth-checking");
  if (clarify.length > 0) checks.push(make("compatibility", "clarify", `Some parts of your project need clarifying against this technique: ${clarify.map((check) => check.label.toLowerCase()).join(", ")}.`));
  else if (worth.length > 0) checks.push(make("compatibility", "worth-checking", `Some parts of your project are worth checking against this technique: ${worth.map((check) => check.label.toLowerCase()).join(", ")}.`));
  else checks.push(make("compatibility", "aligned", "No part of your project needs clarifying against this technique."));

  const narrowing = narrowTechniques(plan.answers).find((entry) => entry.technique === plan.chosen)!;
  if (Object.keys(plan.answers).length === 0) checks.push(make("answers", "review", "Answer the decision questions to see how the technique fits your situation."));
  else if (narrowing.differs.length > 0) checks.push(make("answers", "worth-checking", narrowing.differs.map((entry) => entry.explanation).join(" ")));
  else checks.push(make("answers", "aligned", "The technique fits every decision question you answered."));
  return checks;
}
