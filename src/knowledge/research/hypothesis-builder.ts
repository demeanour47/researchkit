/**
 * Generates null and alternative hypothesis drafts from the project draft.
 *
 * It uses only information already in the draft. It never infers a variable, a
 * direction or a relationship: the researcher chooses the form and direction, and
 * every relationship is one they listed. Anything missing stays a visible placeholder.
 * Each pair carries its relationship as structured data for later tools.
 */

import { nullWording, mediationNullWording, moderationNullWording, type NullParts } from "./hypothesis-null";
import {
  DIRECTIONS,
  HYPOTHESIS_FORMS,
  type Direction,
  type HypothesisForm,
  type HypothesisRelationship,
  type HypothesisRole,
  type RelationshipKind,
} from "./hypothesis-types";
import { contextPhrase, PLACEHOLDERS as QUESTION_PLACEHOLDERS } from "./question-builder";
import { capitalise, joinList, stripEndPunctuation } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";

export const HYPOTHESIS_PLACEHOLDERS = {
  independentVariable: QUESTION_PLACEHOLDERS.independentVariable,
  dependentVariable: QUESTION_PLACEHOLDERS.dependentVariable,
  population: QUESTION_PLACEHOLDERS.population,
  context: "[context]",
  groupOfInterest: "[group of interest]",
  comparisonGroup: "[comparison group]",
} as const;

export type HypothesisPlaceholder = keyof typeof HYPOTHESIS_PLACEHOLDERS;

export interface HypothesisDraft {
  id: string;
  role: HypothesisRole;
  text: string;
  /** The placeholders in this draft, for the researcher to replace. */
  placeholders: HypothesisPlaceholder[];
}

export interface HypothesisPair {
  id: string;
  relationship: HypothesisRelationship;
  null: HypothesisDraft;
  alternative: HypothesisDraft;
}

export interface HypothesisOptions {
  form: HypothesisForm;
  direction: Direction;
}

export interface HypothesisSet {
  options: HypothesisOptions;
  pairs: HypothesisPair[];
  /** Every placeholder used anywhere in the set. */
  placeholders: HypothesisPlaceholder[];
  explanation: string;
}

const clean = (values: readonly string[] | undefined) => (values ?? []).map(stripEndPunctuation).filter(Boolean);

/** Throws a RangeError unless the options are a known form and direction. */
export function validateOptions(options: HypothesisOptions): void {
  if (!HYPOTHESIS_FORMS.includes(options.form)) throw new RangeError(`Unknown hypothesis form: ${options.form}`);
  if (!DIRECTIONS.includes(options.direction)) throw new RangeError(`Unknown direction: ${options.direction}`);
}

function alternativeWording(options: HypothesisOptions, independent: string, dependent: string, scope: string): string {
  const { form, direction } = options;
  if (direction === "non-directional") {
    switch (form) {
      case "difference":
        return `There is a difference in ${dependent} between groups defined by ${independent}${scope}.`;
      case "relationship":
        return `There is a relationship between ${independent} and ${dependent}${scope}.`;
      case "prediction":
        return `${capitalise(independent)} predicts ${dependent}${scope}.`;
    }
  }
  const up = direction === "positive";
  switch (form) {
    case "difference":
      return `${capitalise(dependent)} is ${up ? "higher" : "lower"} in ${HYPOTHESIS_PLACEHOLDERS.groupOfInterest} than in ${HYPOTHESIS_PLACEHOLDERS.comparisonGroup}, with groups defined by ${independent}${scope}.`;
    case "relationship":
      return `${capitalise(independent)} is ${up ? "positively" : "negatively"} related to ${dependent}${scope}.`;
    case "prediction":
      return `Higher ${independent} predicts ${up ? "higher" : "lower"} ${dependent}${scope}.`;
  }
}

/** Generates hypothesis pairs for every relationship the project lists. Throws for invalid options. */
export function generateHypotheses(project: ResearchProjectDraft, options: HypothesisOptions): HypothesisSet {
  validateOptions(options);
  const independents = clean(project.independentVariables);
  const dependents = clean(project.dependentVariables);
  const moderators = clean(project.moderatorVariables);
  const mediators = clean(project.mediatorVariables);
  const controls = clean(project.controlVariables);
  const population = project.population ? stripEndPunctuation(project.population) : "";
  const contextText = `${contextPhrase(project.location)}${contextPhrase(project.timeContext)}`.trim();

  const scopePlaceholders: HypothesisPlaceholder[] = [];
  if (!population) scopePlaceholders.push("population");
  if (!contextText) scopePlaceholders.push("context");
  const scope =
    ` among ${population || HYPOTHESIS_PLACEHOLDERS.population} ${contextText || HYPOTHESIS_PLACEHOLDERS.context}` +
    (controls.length > 0 ? `, after controlling for ${joinList(controls)}` : "");

  const ivs = independents.length > 0 ? independents : [HYPOTHESIS_PLACEHOLDERS.independentVariable];
  const dvs = dependents.length > 0 ? dependents : [HYPOTHESIS_PLACEHOLDERS.dependentVariable];
  const variablePlaceholders: HypothesisPlaceholder[] = [
    ...(independents.length === 0 ? (["independentVariable"] as const) : []),
    ...(dependents.length === 0 ? (["dependentVariable"] as const) : []),
  ];

  const relationshipFor = (kind: RelationshipKind, iv: string, dv: string, extra: { moderators?: string[]; mediators?: string[] } = {}) => ({
    kind,
    form: kind === "main" ? options.form : ("relationship" as const),
    direction: kind === "main" ? options.direction : ("non-directional" as const),
    independentVariables: independents.length > 0 ? [iv] : [],
    dependentVariables: dependents.length > 0 ? [dv] : [],
    moderators: extra.moderators ?? [],
    mediators: extra.mediators ?? [],
    controls,
    population: population || null,
    context: contextText || null,
  });

  const pairs: HypothesisPair[] = [];
  const addPair = (id: string, relationship: HypothesisRelationship, nullText: string, alternativeText: string) => {
    const placeholders = (text: string): HypothesisPlaceholder[] =>
      (Object.keys(HYPOTHESIS_PLACEHOLDERS) as HypothesisPlaceholder[]).filter((key) => text.includes(HYPOTHESIS_PLACEHOLDERS[key]));
    pairs.push({
      id,
      relationship,
      null: { id: `${id}-null`, role: "null", text: nullText, placeholders: placeholders(nullText) },
      alternative: { id: `${id}-alternative`, role: "alternative", text: alternativeText, placeholders: placeholders(alternativeText) },
    });
  };

  ivs.forEach((iv, i) => {
    dvs.forEach((dv, j) => {
      const parts: NullParts = { independent: iv, dependent: dv, scope };
      addPair(`main-${i + 1}-${j + 1}`, relationshipFor("main", iv, dv), nullWording(options.form, parts), alternativeWording(options, iv, dv, scope));
      moderators.forEach((moderator, k) => {
        addPair(
          `moderation-${k + 1}-${i + 1}-${j + 1}`,
          relationshipFor("moderation", iv, dv, { moderators: [moderator] }),
          moderationNullWording(moderator, parts),
          `${capitalise(moderator)} moderates the relationship between ${iv} and ${dv}${scope}.`,
        );
      });
      mediators.forEach((mediator, k) => {
        addPair(
          `mediation-${k + 1}-${i + 1}-${j + 1}`,
          relationshipFor("mediation", iv, dv, { mediators: [mediator] }),
          mediationNullWording(mediator, parts),
          `The relationship between ${iv} and ${dv} is mediated by ${mediator}${scope}.`,
        );
      });
    });
  });

  const placeholders = [
    ...new Set([...variablePlaceholders, ...scopePlaceholders, ...pairs.flatMap((pair) => [...pair.null.placeholders, ...pair.alternative.placeholders])]),
  ];
  return {
    options,
    pairs,
    placeholders: (Object.keys(HYPOTHESIS_PLACEHOLDERS) as HypothesisPlaceholder[]).filter((key) => placeholders.includes(key)),
    explanation:
      "These drafts use only the variables, population and context in your project, in the form and direction you chose. " +
      (placeholders.length > 0 ? "Words in square brackets are missing from your project; replace them before you use the hypotheses. " : "") +
      (moderators.length > 0 || mediators.length > 0 ? "Moderator and mediator hypotheses are non-directional; add a direction only if your theory supports one. " : "") +
      "They are drafts: edit them, and check them with your supervisor.",
  };
}
