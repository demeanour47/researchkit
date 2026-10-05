/**
 * Research challenges: short multiple-choice questions about choosing a statistical
 * test. The keyed answer isn't written by hand: it is checked by tests against the
 * Statistical Test Finder's own result for the situation, so a challenge can't teach
 * something the tool contradicts. Adding a challenge is adding an entry here.
 */

import type { AnalysisMethodId } from "../research/data-analysis-types";
import type { FinderAnswers } from "../research/test-finder/questions";

export interface ChallengeOption {
  method: AnalysisMethodId;
  /** Why this option is, or isn't, appropriate here. */
  explanation: string;
}

export interface Challenge {
  id: string;
  prompt: string;
  /** The finder answers the situation stands for. */
  situation: FinderAnswers;
  options: readonly ChallengeOption[];
  /** The option that is correct. */
  correct: AnalysisMethodId;
  /** The catalogue id of the tool to open next. */
  toolId: string;
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "two-groups-scores",
    prompt: "A researcher wants to compare the mean academic performance of two independent groups of students. Which test might be appropriate?",
    situation: { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "two", secondFactor: "no", covariate: "no", normality: "yes" },
    correct: "independent-t-test",
    toolId: "statistical-test-finder",
    options: [
      { method: "independent-t-test", explanation: "It compares the means of a numeric outcome between two separate groups, which is this situation. Its assumptions, such as roughly normal scores, still need checking." },
      { method: "chi-square", explanation: "It tests whether two categorical variables are associated. Academic performance measured as a score is numeric, not categories." },
      { method: "pearson", explanation: "It measures a straight-line relationship between two numeric variables. Here one variable is the group and the question is about a difference in means." },
      { method: "one-way-anova", explanation: "It compares means across three or more groups. With only two groups, a t-test answers the same question." },
    ],
  },
  {
    id: "three-groups-scores",
    prompt: "A researcher compares exam scores of students taught by three different methods, each student in one method only. Which test might be appropriate?",
    situation: { purpose: "compare", comparison: "independent", outcomeLevel: "interval", groups: "three-plus", secondFactor: "no", covariate: "no", normality: "yes" },
    correct: "one-way-anova",
    toolId: "statistical-test-finder",
    options: [
      { method: "independent-t-test", explanation: "It compares exactly two groups. Running several t-tests across three groups inflates the chance of a false positive." },
      { method: "one-way-anova", explanation: "It compares the means of a numeric outcome across three or more independent groups. If it is significant, post hoc tests show which groups differ." },
      { method: "pearson", explanation: "It relates two numeric variables. Teaching method is a grouping variable, not a measured number." },
      { method: "chi-square", explanation: "It needs two categorical variables. Exam scores are numeric." },
    ],
  },
  {
    id: "before-after",
    prompt: "A researcher measures the same students' anxiety scores before and after a workshop. Which test might be appropriate?",
    situation: { purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "two", normality: "yes" },
    correct: "paired-t-test",
    toolId: "statistical-test-finder",
    options: [
      { method: "independent-t-test", explanation: "It treats the two sets of scores as coming from different people. Here every student appears twice, so the scores are paired." },
      { method: "paired-t-test", explanation: "It compares a numeric outcome measured twice on the same participants, which is a before-and-after design. The differences should be roughly normal." },
      { method: "chi-square", explanation: "It tests association between categorical variables. Anxiety scores are numeric." },
      { method: "one-way-anova", explanation: "It compares separate groups. These measurements come from one group of students measured twice." },
    ],
  },
  {
    id: "two-categories",
    prompt: "A researcher asks whether students' study programme (three programmes) is associated with whether they passed (yes or no). Which test might be appropriate?",
    situation: { purpose: "association", categoricalVariables: "two" },
    correct: "chi-square",
    toolId: "statistical-test-finder",
    options: [
      { method: "pearson", explanation: "It needs two numeric variables. Programme and pass or fail are both categories." },
      { method: "one-way-anova", explanation: "It compares the mean of a numeric outcome. Pass or fail is not a number to average." },
      { method: "chi-square", explanation: "It tests whether two categorical variables are associated, which is this situation. Most expected counts should be at least 5, and an effect size should be reported too." },
      { method: "independent-t-test", explanation: "It compares the means of a numeric outcome between two groups. Neither variable here is numeric." },
    ],
  },
  {
    id: "two-numbers",
    prompt: "A researcher asks whether hours of study and exam score, both measured as numbers, go together. Which test might be appropriate?",
    situation: { purpose: "relationship", outcomeLevel: "interval", predictorLevel: "interval", normality: "yes" },
    correct: "pearson",
    toolId: "statistical-test-finder",
    options: [
      { method: "chi-square", explanation: "It needs categorical variables. Both of these are measured as numbers." },
      { method: "independent-t-test", explanation: "It compares means between two groups. There are no groups here, only two measured numbers." },
      { method: "one-way-anova", explanation: "It compares means across groups. Here there is no grouping variable." },
      { method: "pearson", explanation: "It measures the strength and direction of a straight-line relationship between two numeric variables. Check the scatterplot for linearity and outliers first." },
    ],
  },
];

export const getChallenge = (id: string): Challenge | undefined => CHALLENGES.find((challenge) => challenge.id === id);

/** Whether the chosen option is the correct one. */
export const isCorrect = (challenge: Challenge, method: AnalysisMethodId): boolean => challenge.correct === method;

/** The challenge after this one, wrapping to the first; the first for an unknown id. */
export function nextChallenge(currentId: string | undefined, challenges: readonly Challenge[] = CHALLENGES): Challenge | undefined {
  if (challenges.length === 0) return undefined;
  const index = challenges.findIndex((challenge) => challenge.id === currentId);
  return challenges[(index + 1) % challenges.length];
}
