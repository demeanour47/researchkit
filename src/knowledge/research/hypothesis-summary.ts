/**
 * Brings a hypothesis set together: its evaluation, its plain-text form, its
 * structured relationships, and the project draft update. The update changes only
 * the draft's `hypotheses` section.
 */

import { checkAlignment, methodologyGuidance, type MethodologyNote } from "./hypothesis-alignment";
import type { HypothesisPair, HypothesisSet } from "./hypothesis-builder";
import type { HypothesisCheck, PairTexts } from "./hypothesis-checks";
import type { HypothesisRelationship, ProjectHypothesis } from "./hypothesis-types";
import { validateHypothesisPair } from "./hypothesis-validator";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";

/** The researcher's edits, by hypothesis id. A hypothesis without an edit keeps its draft wording. */
export type HypothesisEdits = Readonly<Record<string, string>>;

export const textsFor = (pair: HypothesisPair, edits: HypothesisEdits): PairTexts => ({
  null: edits[pair.null.id] ?? pair.null.text,
  alternative: edits[pair.alternative.id] ?? pair.alternative.text,
});

export interface PairEvaluation {
  pairId: string;
  checks: HypothesisCheck[];
}

export interface HypothesisEvaluation {
  pairs: PairEvaluation[];
  methodology: MethodologyNote[];
}

export function evaluateHypotheses(set: HypothesisSet, edits: HypothesisEdits, project: ResearchProjectDraft): HypothesisEvaluation {
  return {
    pairs: set.pairs.map((pair) => {
      const texts = textsFor(pair, edits);
      return { pairId: pair.id, checks: [...checkAlignment(texts, pair.relationship, project), ...validateHypothesisPair(texts, pair.relationship)] };
    }),
    methodology: methodologyGuidance(project),
  };
}

/** The hypotheses as the project draft stores them, with the researcher's wording. */
export function toProjectHypotheses(set: HypothesisSet, edits: HypothesisEdits): ProjectHypothesis[] {
  return set.pairs.flatMap((pair) => {
    const texts = textsFor(pair, edits);
    return [
      { id: pair.null.id, role: "null" as const, text: texts.null, relationship: pair.relationship },
      { id: pair.alternative.id, role: "alternative" as const, text: texts.alternative, relationship: pair.relationship },
    ];
  });
}

/** The project draft with its hypotheses replaced. No other field changes. */
export function applyHypotheses(project: ResearchProjectDraft, hypotheses: readonly ProjectHypothesis[]): ResearchProjectDraft {
  return updateProjectDraft(project, { hypotheses });
}

/** A short label for a pair, such as "screen time → sleep quality, moderated by age". */
export function pairLabel(relationship: HypothesisRelationship): string {
  const from = relationship.independentVariables[0] ?? "independent variable";
  const to = relationship.dependentVariables[0] ?? "dependent variable";
  const via =
    relationship.kind === "moderation"
      ? `, moderated by ${relationship.moderators[0]}`
      : relationship.kind === "mediation"
        ? `, through ${relationship.mediators[0]}`
        : "";
  return `${from} → ${to}${via}`;
}

/** Every hypothesis as plain text, numbered by pair, ready to copy. */
export function hypothesesText(set: HypothesisSet, edits: HypothesisEdits): string {
  return set.pairs
    .map((pair, index) => {
      const texts = textsFor(pair, edits);
      return `H₀${index + 1}: ${texts.null}\nH₁${index + 1}: ${texts.alternative}`;
    })
    .join("\n\n");
}

/** A relationship as labelled rows, leaving out empty ones, for display. */
export function relationshipRows(relationship: HypothesisRelationship): { label: string; values: readonly string[] }[] {
  const rows: { label: string; values: readonly string[] }[] = [
    { label: "Independent variable", values: relationship.independentVariables },
    { label: "Dependent variable", values: relationship.dependentVariables },
    { label: "Moderator", values: relationship.moderators },
    { label: "Mediator", values: relationship.mediators },
    { label: "Control variables", values: relationship.controls },
    { label: "Population", values: relationship.population ? [relationship.population] : [] },
    { label: "Context", values: relationship.context ? [relationship.context] : [] },
  ];
  return rows.filter((row) => row.values.length > 0);
}

/** Everything the tool can't do, stated on the page. */
export const HYPOTHESIS_BUILDER_LIMITATIONS: readonly string[] = [
  "It can't tell whether a hypothesis is supported by theory or previous research. Only your literature review can show that.",
  "It can't choose a direction for you. A directional hypothesis needs a reason from theory or evidence.",
  "It can't check that your variables can be measured, or that your sample is large enough to test the hypotheses.",
  "It reads wording by recognising common patterns, so its checks can miss or misread things.",
  "It can't determine the quality, originality or publishability of your research, or give supervisor or ethics approval.",
];

/** Content that needs review by a named methodology specialist before launch. */
export const HYPOTHESIS_REVIEW_ITEMS: readonly string[] = [
  "Academic references for each hypothesis type: none have been added yet.",
  "The definitions, strengths, limitations and examples of each hypothesis type.",
  "The guidance on when hypotheses suit quantitative, qualitative, mixed methods and multi-method studies.",
  "The standard wording used for difference, relationship, prediction, moderation and mediation hypotheses.",
];
