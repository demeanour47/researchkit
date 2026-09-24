/**
 * How a research design fits the current project: the research question, each layer
 * of the research onion, the variables, objectives, hypotheses and conceptual
 * framework. Each check says why, names the project elements that support it, and
 * says what to justify. Checks never rank or score designs.
 */

import type { CheckStatus } from "./hypothesis-checks";
import { joinList } from "./question-text";
import { detectQuestionTypes, getQuestionType, type QuestionTypeId } from "./question-types";
import { findOption, getLayer } from "./research-onion";
import type { ResearchProjectDraft } from "./research-project";
import { getDesign, type DesignId, type OnionFit, type ResearchDesign } from "./design-types";
import type { LayerId } from "./types";
import type { MeasurementLevel } from "./variable-types";

export const COMPATIBILITY_CHECK_IDS = [
  "question",
  "philosophy",
  "approach",
  "choice",
  "strategy",
  "timeHorizon",
  "variables",
  "objectives",
  "hypotheses",
  "framework",
] as const;
export type CompatibilityCheckId = (typeof COMPATIBILITY_CHECK_IDS)[number];

export const COMPATIBILITY_LABELS: Readonly<Record<CompatibilityCheckId, string>> = {
  question: "Research question",
  philosophy: "Research philosophy",
  approach: "Research approach",
  choice: "Methodological choice",
  strategy: "Research strategy",
  timeHorizon: "Time horizon",
  variables: "Variables",
  objectives: "Objectives",
  hypotheses: "Hypotheses",
  framework: "Conceptual framework",
};

/** The statuses compatibility checks use: never “Missing”, because nothing here is required. */
export type CompatibilityStatus = Exclude<CheckStatus, "missing">;

export interface CompatibilityCheck {
  check: CompatibilityCheckId;
  label: string;
  status: CompatibilityStatus;
  explanation: string;
  /** The project elements behind the judgement, quoted. */
  supports: string[];
  /** What the researcher should justify, if anything. */
  justify: string | null;
}

const make = (check: CompatibilityCheckId, status: CompatibilityStatus, explanation: string, supports: string[] = [], justify: string | null = null): CompatibilityCheck => ({
  check,
  label: COMPATIBILITY_LABELS[check],
  status,
  explanation,
  supports,
  justify,
});

/** Question types, and the designs that typically answer them. Awaiting methodology review. */
export const QUESTION_DESIGNS: Readonly<Record<QuestionTypeId, readonly DesignId[]>> = {
  descriptive: ["survey", "cross-sectional", "descriptive", "case-study"],
  comparative: ["experimental", "true-experimental", "quasi-experimental", "survey", "cross-sectional"],
  relational: ["correlational", "survey", "cross-sectional", "longitudinal"],
  correlational: ["correlational", "survey", "cross-sectional", "longitudinal"],
  explanatory: ["experimental", "true-experimental", "quasi-experimental", "explanatory", "case-study", "longitudinal", "sequential-mixed"],
  exploratory: ["exploratory", "case-study", "phenomenology", "grounded-theory", "ethnography", "narrative-inquiry"],
  predictive: ["correlational", "longitudinal", "survey"],
  qualitative: ["case-study", "phenomenology", "grounded-theory", "ethnography", "narrative-inquiry", "action-research", "historical", "exploratory"],
  quantitative: ["experimental", "true-experimental", "quasi-experimental", "pre-experimental", "survey", "correlational", "cross-sectional", "longitudinal", "descriptive"],
  "mixed-methods": ["sequential-mixed", "concurrent-mixed", "embedded-mixed"],
};

function questionCheck(design: ResearchDesign, project: ResearchProjectDraft): CompatibilityCheck {
  if (!project.researchQuestion) return make("question", "review", "Add your research question to see whether this design suits it.");
  const types = detectQuestionTypes(project.researchQuestion).map((detection) => detection.type);
  if (types.length === 0) return make("question", "review", "The wording of your question doesn't clearly signal a type of question, so it can't be compared with this design.", [`Research question: “${project.researchQuestion}”`]);
  const matching = types.filter((type) => QUESTION_DESIGNS[type].includes(design.id));
  const names = (list: QuestionTypeId[]) => joinList(list.map((type) => getQuestionType(type).name.toLowerCase()));
  if (matching.length > 0) {
    return make("question", "aligned", `Your question reads as ${names(matching)}, a kind of question ${design.name.toLowerCase()} designs are commonly used to answer.`, [`Research question: “${project.researchQuestion}”`]);
  }
  return make(
    "question",
    "worth-checking",
    `Your question reads as ${names(types)}. ${design.name} designs aren't typically used for that kind of question.`,
    [`Research question: “${project.researchQuestion}”`],
    `Explain how a ${design.name.toLowerCase()} design will answer your question.`,
  );
}

/** How the subject of an onion check is written: plural designs or a singular technique. */
export interface OnionSubject {
  /** Sentence subject, such as “Correlational designs” or “Simple random sampling”. */
  subject: string;
  plural: boolean;
  /** Inside a sentence, such as “a correlational design” or “simple random sampling”. */
  inSentence: string;
}

export interface OnionJudgement {
  status: CompatibilityStatus;
  explanation: string;
  supports: string[];
  justify: string | null;
}

/** Judges one research onion layer against the choices typical, or possible, for a design or technique. */
export function judgeOnionLayer(fitting: OnionFit, project: ResearchProjectDraft, layer: LayerId, wording: OnionSubject): OnionJudgement {
  const onion = project.researchOnionSelection ?? {};
  const chosenId = layer === "choice" ? (project.methodology ?? onion.choice) : onion[layer];
  const layerName = getLayer(layer).name.toLowerCase();
  const verb = (plural: string, singular: string) => (wording.plural ? plural : singular);
  if (!chosenId) {
    return { status: "review", explanation: `You haven't chosen a ${layerName} yet. Choose one in the Research Onion Explorer to see how it fits.`, supports: [], justify: null };
  }
  const option = findOption(chosenId);
  const supports = [`${getLayer(layer).name}: ${option?.name ?? chosenId}`];
  // Within a sentence, options read as “a deductive approach” or “Positivism”.
  const name = option?.subject ?? chosenId;
  const fit = fitting[layer];
  const why = option ? ` ${option.subject.charAt(0).toUpperCase()}${option.subject.slice(1)} usually ${option.essence}.` : "";
  if (!fit) return { status: "review", explanation: `${wording.subject} ${verb("don't", "doesn't")} depend on a particular ${layerName}.`, supports, justify: null };
  if (fit.typical.includes(chosenId)) return { status: "aligned", explanation: `${wording.subject} ${verb("are", "is")} typically used with ${name}.${why}`, supports, justify: null };
  if (fit.possible?.includes(chosenId)) {
    return {
      status: "worth-checking",
      explanation: `${wording.subject} can be used with ${name}, though it isn't the most common combination.${why}`,
      supports,
      justify: `Explain why ${wording.inSentence} suits ${name}.`,
    };
  }
  return {
    status: "clarify",
    explanation: `${wording.subject} ${verb("aren't", "isn't")} usually combined with ${name}.${why}`,
    supports,
    justify: `Explain why ${wording.inSentence} suits ${name}, or reconsider one of the two.`,
  };
}

function onionCheck(design: ResearchDesign, project: ResearchProjectDraft, layer: LayerId, check: CompatibilityCheckId): CompatibilityCheck {
  const article = /^[aeiou]/i.test(design.name) ? "an" : "a";
  const judgement = judgeOnionLayer(design.onion, project, layer, { subject: `${design.name} designs`, plural: true, inSentence: `${article} ${design.name.toLowerCase()} design` });
  return make(check, judgement.status, judgement.explanation, judgement.supports, judgement.justify);
}

const NUMERIC: readonly MeasurementLevel[] = ["interval", "ratio", "continuous"];
const ORDERED: readonly MeasurementLevel[] = ["ordinal", "likert", "nominal", "binary", "categorical", "multiple-response"];

/** The project's variables by type, from the Variables Builder where it has been used, otherwise from the variable lists. */
export function projectVariables(project: ResearchProjectDraft): { name: string; kind: string; level: MeasurementLevel | null }[] {
  if (project.variables && project.variables.length > 0) {
    return project.variables.map((variable) => ({ name: variable.name, kind: variable.variableType, level: variable.measurementLevel }));
  }
  const list = (names: readonly string[] | undefined, kind: string) => (names ?? []).map((name) => ({ name, kind, level: null }));
  return [
    ...list(project.independentVariables, "independent"),
    ...list(project.dependentVariables, "dependent"),
    ...list(project.mediatorVariables, "mediator"),
    ...list(project.moderatorVariables, "moderator"),
    ...list(project.controlVariables, "control"),
  ];
}

function variablesCheck(design: ResearchDesign, project: ResearchProjectDraft): CompatibilityCheck {
  const variables = projectVariables(project);
  if (variables.length === 0) return make("variables", "review", "Your project has no variables yet. Add them in the Variables Builder to see how they suit this design.");
  const named = (kind: string) => variables.filter((variable) => variable.kind === kind).map((variable) => variable.name);
  const supports = variables.map((variable) => `${variable.name} (${variable.kind})`);
  const numeric = variables.filter((variable) => variable.level && NUMERIC.includes(variable.level));
  const categorical = variables.filter((variable) => variable.level && ORDERED.includes(variable.level));
  const open = variables.filter((variable) => variable.level === "open-ended");
  switch (design.variables) {
    case "iv-dv": {
      const [ivs, dvs] = [named("independent"), named("dependent")];
      if (ivs.length > 0 && dvs.length > 0) {
        return make("variables", "aligned", `Your project has an independent variable (${joinList(ivs)}) and a dependent variable (${joinList(dvs)}), which this design needs.`, supports, `Explain how ${joinList(ivs)} will be manipulated or compared.`);
      }
      return make("variables", "clarify", `${design.name} designs need an independent variable to manipulate or compare and a dependent variable to measure. Your project doesn't name both.`, supports, "Name the independent and dependent variables, or consider a non-experimental design.");
    }
    case "measured":
      if (open.some((variable) => variable.kind === "independent" || variable.kind === "dependent")) {
        return make("variables", "worth-checking", `This design analyses measured variables, but ${joinList(open.map((variable) => variable.name))} ${open.length === 1 ? "is" : "are"} open-ended.`, supports, "Explain how open-ended answers will be coded for analysis.");
      }
      if (variables.length < 2) return make("variables", "worth-checking", "This design relates two or more measured variables; your project names one.", supports);
      return make("variables", "aligned", `Your project names ${variables.length} variables that this design can measure and relate.`, supports);
    case "concepts":
      if (numeric.length > 0) {
        return make("variables", "worth-checking", `${design.name} designs usually explore concepts rather than measure variables, but ${joinList(numeric.map((variable) => variable.name))} ${numeric.length === 1 ? "is" : "are"} measured numerically.`, supports, "Explain what role these measurements play in a qualitative design.");
      }
      return make("variables", "review", `${design.name} designs explore concepts rather than predefined variables. Check that your variables are treated as ideas to explore, not measures to test.`, supports);
    case "both-kinds":
      if (open.length > 0 && (numeric.length > 0 || categorical.length > 0)) {
        return make("variables", "aligned", "Your variables include measured and open-ended data, which a mixed methods design combines.", supports);
      }
      if (numeric.length + categorical.length + open.length === 0) {
        return make("variables", "review", "Set measurement levels in the Variables Builder to see whether your variables include both kinds of data.", supports);
      }
      return make("variables", "worth-checking", "A mixed methods design needs both measured and qualitative data, but your variables' measurement levels show only one kind.", supports, "Explain where each kind of data will come from.");
    case "any":
      return make("variables", "review", `${design.name} designs don't need any particular kind of variable.`, supports);
  }
}

function objectivesCheck(design: ResearchDesign, project: ResearchProjectDraft): CompatibilityCheck {
  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) return make("objectives", "review", "Add your research objectives to see which of them this design serves.");
  const matching = objectives.filter((objective) => design.objectiveCues.test(objective));
  if (matching.length > 0) {
    return make("objectives", "aligned", `${matching.length === 1 ? "An objective uses" : `${matching.length} objectives use`} wording that suits the purpose of a ${design.name.toLowerCase()} design: ${design.purpose.charAt(0).toLowerCase()}${design.purpose.slice(1)}`, matching.map((objective) => `Objective: “${objective}”`));
  }
  return make("objectives", "worth-checking", `None of your objectives uses wording typical of a ${design.name.toLowerCase()} design, whose purpose is ${design.purpose.charAt(0).toLowerCase()}${design.purpose.slice(1, -1)}.`, [], "Explain which objective this design serves.");
}

function hypothesesCheck(design: ResearchDesign, project: ResearchProjectDraft): CompatibilityCheck {
  const count = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative").length;
  const supports = count > 0 ? [`${count} alternative ${count === 1 ? "hypothesis" : "hypotheses"}`] : [];
  if (count === 0) {
    return design.hypotheses === "typical"
      ? make("hypotheses", "review", `${design.name} designs usually test hypotheses, and your project has none yet.`, [], "If your study tests predictions, add hypotheses with the Hypothesis Builder.")
      : make("hypotheses", "aligned", `${design.name} designs don't usually need hypotheses, and your project has none.`);
  }
  switch (design.hypotheses) {
    case "typical":
      return make("hypotheses", "aligned", `Your project has hypotheses, which ${design.name.toLowerCase()} designs are typically used to test.`, supports);
    case "possible":
      return make("hypotheses", "worth-checking", `${design.name} designs can test hypotheses, but often don't.`, supports, "Explain how the design will test your hypotheses.");
    case "unusual":
      return make("hypotheses", "clarify", `${design.name} designs don't usually test hypotheses, but your project has some.`, supports, "Explain what role the hypotheses play, or consider whether open research questions would suit the design better.");
  }
}

const CAUSAL_TYPES = new Set(["direct", "indirect", "mediation", "moderation", "influence"]);

function frameworkCheck(design: ResearchDesign, project: ResearchProjectDraft): CompatibilityCheck {
  const framework = project.conceptualFramework;
  if (!framework) return make("framework", "review", "Your project has no conceptual framework yet.");
  const relationships = framework.relationships;
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
  const supports = [`Conceptual framework: ${plural(framework.variables.length, "variable")} and ${plural(relationships.length, "relationship")}`];
  if (design.traits.emphasis === "qualitative") {
    return make("framework", "review", "A framework can guide a qualitative study. Check that it leaves room for what you may discover.", supports);
  }
  if (relationships.length === 0) {
    return make("framework", "worth-checking", "Your framework has no relationships, so it doesn't yet show what the design will examine.", supports);
  }
  const causal = relationships.filter((relationship) => CAUSAL_TYPES.has(relationship.type));
  if (design.traits.causality === "none" && causal.length > 0) {
    return make(
      "framework",
      "worth-checking",
      `Your framework shows ${causal.length} ${causal.length === 1 ? "relationship" : "relationships"} of influence or effect, but ${design.name.toLowerCase()} designs don't establish cause and effect.`,
      supports,
      "Explain how you will interpret relationships of influence without causal claims.",
    );
  }
  return make("framework", "aligned", `Your framework's relationships are the kind this design can examine.`, supports);
}

/** Every compatibility check for a design, in a fixed order. */
export function checkCompatibility(id: DesignId, project: ResearchProjectDraft): CompatibilityCheck[] {
  const design = getDesign(id);
  return [
    questionCheck(design, project),
    onionCheck(design, project, "philosophy", "philosophy"),
    onionCheck(design, project, "approach", "approach"),
    onionCheck(design, project, "choice", "choice"),
    onionCheck(design, project, "strategy", "strategy"),
    onionCheck(design, project, "timeHorizon", "timeHorizon"),
    variablesCheck(design, project),
    objectivesCheck(design, project),
    hypothesesCheck(design, project),
    frameworkCheck(design, project),
  ];
}

/** Every project element that supports a design, from checks that look aligned. */
export function supportingElements(id: DesignId, project: ResearchProjectDraft): string[] {
  return [...new Set(checkCompatibility(id, project).filter((check) => check.status === "aligned").flatMap((check) => check.supports))];
}

