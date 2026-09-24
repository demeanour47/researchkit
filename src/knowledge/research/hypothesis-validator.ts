/**
 * Checks the wording of a hypothesis pair: testability, measurability, logical
 * wording, whether the null mirrors the alternative, and whether the stated direction
 * matches the direction chosen. Checks explain; they never score.
 */

import { makeCheck, type HypothesisCheck, type PairTexts } from "./hypothesis-checks";
import { DIRECTION_LABELS, readDirection } from "./hypothesis-direction";
import { checkNullAlternative } from "./hypothesis-null";
import { pairVariables } from "./hypothesis-alignment";
import type { HypothesisRelationship } from "./hypothesis-types";
import { containsPhrase, VAGUE_WORDS, words } from "./question-text";

const RELATION = /\b(relat\w*|differ\w*|predict\w*|associat\w*|moderat\w*|mediat\w*|effects?|higher|lower|increas\w*|decreas\w*)\b/i;

function testability(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck {
  const text = texts.alternative;
  if (!text.trim()) return makeCheck("testability", "missing", "The alternative hypothesis is empty.");
  if (text.trim().endsWith("?")) {
    return makeCheck("testability", "clarify", "It is phrased as a question. A hypothesis is a statement that the data can support or fail to support.");
  }
  if (/\bshould\b/i.test(text)) {
    return makeCheck("testability", "clarify", "It says what “should” happen. Data can show what happens, but not what should happen, so a “should” claim can't be tested.");
  }
  const variables = [...relationship.independentVariables, ...relationship.dependentVariables];
  const namesVariables = variables.length >= 2 && variables.every((variable) => containsPhrase(text, variable));
  if (namesVariables && RELATION.test(text)) {
    return makeCheck("testability", "aligned", "It names the variables and states a relationship between them, which data can support or fail to support.");
  }
  return makeCheck(
    "testability",
    "worth-checking",
    "A testable hypothesis names at least two variables and states how they are related. Check that both are named and the relationship is stated.",
  );
}

function measurability(texts: PairTexts): HypothesisCheck {
  const vague = VAGUE_WORDS.filter((word) => words(`${texts.null} ${texts.alternative}`).includes(word));
  if (vague.length > 0) {
    return makeCheck(
      "measurability",
      "clarify",
      `It uses ${vague.map((word) => `“${word}”`).join(", ")}, which need defining before they can be measured.`,
    );
  }
  return makeCheck(
    "measurability",
    "review",
    "Whether each variable can be measured depends on your instruments and definitions, which ResearchKit can't see. Check that you can measure every variable named.",
  );
}

function wording(texts: PairTexts): HypothesisCheck {
  if (!texts.null.trim() || !texts.alternative.trim()) {
    return makeCheck("wording", "missing", "A null and an alternative hypothesis are both needed.");
  }
  const both = `${texts.null} ${texts.alternative}`;
  if (/\bprov(e|es|ed|ing)\b/i.test(both)) {
    return makeCheck("wording", "clarify", "It uses “prove”. Research evidence can support or fail to support a hypothesis, but it can't prove it.");
  }
  if (texts.null.trim().endsWith("?")) {
    return makeCheck("wording", "clarify", "The null hypothesis is phrased as a question. State it as a claim.");
  }
  const sentences = (text: string) => text.split(/[.!?](?:\s|$)/).filter((part) => part.trim()).length;
  if (sentences(texts.null) > 1 || sentences(texts.alternative) > 1) {
    return makeCheck("wording", "worth-checking", "A hypothesis with more than one sentence may contain more than one claim. Each claim needs its own hypothesis.");
  }
  return makeCheck("wording", "aligned", "Each hypothesis states a single claim as a statement.");
}

function nullAlternative(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck {
  const issues = checkNullAlternative(texts.null, texts.alternative, pairVariables(relationship));
  return issues.length === 0
    ? makeCheck("nullAlternative", "aligned", "The null hypothesis states the absence of what the alternative states, about the same variables.")
    : makeCheck("nullAlternative", "worth-checking", issues.map((issue) => issue.explanation).join(" "));
}

function direction(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck {
  const chosen = relationship.direction;
  const reading = readDirection(texts.alternative);
  if (reading === "mixed") {
    return makeCheck("direction", "clarify", "The alternative hypothesis uses words for both directions, so its direction is unclear.");
  }
  if (reading === chosen) {
    return makeCheck("direction", "aligned", `The wording matches the direction chosen (${DIRECTION_LABELS[chosen].toLowerCase()}).`);
  }
  if (chosen === "non-directional") {
    return makeCheck("direction", "worth-checking", "The wording states a direction, but this hypothesis is non-directional. Choose a directional hypothesis only if theory or evidence supports it.");
  }
  if (reading === "non-directional") {
    return makeCheck("direction", "worth-checking", "You chose a directional hypothesis, but the wording doesn't state a direction.");
  }
  return makeCheck("direction", "worth-checking", "The wording states the opposite direction to the one chosen.");
}

/** Checks the wording of one hypothesis pair. */
export function validateHypothesisPair(texts: PairTexts, relationship: HypothesisRelationship): HypothesisCheck[] {
  return [testability(texts, relationship), measurability(texts), wording(texts), nullAlternative(texts, relationship), direction(texts, relationship)];
}
