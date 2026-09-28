/**
 * The decision tree taught alongside the finder: the questions in order, and where each
 * path usually leads. The tests at each leaf aren't written by hand: they are what the
 * finder itself returns for that path's answers, so the tree and the tool can't
 * disagree. Like the finder, the tree shows common choices, not the only valid one.
 */

import type { AnalysisMethodId } from "../data-analysis-types";
import { findTests } from "./finder";
import type { FinderAnswers } from "./questions";

export interface TreeLeaf {
  kind: "leaf";
  /** The answers this path stands for. */
  answers: FinderAnswers;
  /** Tests commonly used here, from the finder. */
  tests: AnalysisMethodId[];
  /** Tests that may also fit, from the finder. */
  alsoConsider: AnalysisMethodId[];
  note?: string;
}

export interface TreeNode {
  kind: "node";
  question: string;
  branches: readonly { answer: string; next: TreeNode | TreeLeaf }[];
}

function leaf(answers: FinderAnswers, note?: string): TreeLeaf {
  const result = findTests(answers);
  if (result.status !== "complete") throw new Error(`Decision tree path is incomplete: ${JSON.stringify(answers)}`);
  const methods = (fit: string) => result.candidates.filter((candidate) => candidate.fit === fit).map((candidate) => candidate.method);
  return { kind: "leaf", answers, tests: methods("common"), alsoConsider: methods("also"), ...(note ? { note } : {}) };
}

const node = (question: string, branches: TreeNode["branches"]): TreeNode => ({ kind: "node", question, branches });

const independent = (extra: FinderAnswers): FinderAnswers => ({ purpose: "compare", comparison: "independent", secondFactor: "no", covariate: "no", normality: "yes", ...extra });

export const DECISION_TREE: TreeNode = node("What are you trying to find out?", [
  {
    answer: "Describe a variable",
    next: node("How is the variable measured?", [
      { answer: "Nominal (categories)", next: leaf({ purpose: "describe", outcomeLevel: "nominal" }) },
      { answer: "Ordinal (ordered categories)", next: leaf({ purpose: "describe", outcomeLevel: "ordinal" }) },
      { answer: "Interval or ratio, roughly symmetric", next: leaf({ purpose: "describe", outcomeLevel: "interval", normality: "yes" }) },
      { answer: "Interval or ratio, skewed", next: leaf({ purpose: "describe", outcomeLevel: "interval", normality: "no" }) },
    ]),
  },
  {
    answer: "Compare groups, times or a target value",
    next: node("What are you comparing?", [
      {
        answer: "One group with a stated value",
        next: node("How is the outcome measured?", [
          { answer: "Interval or ratio", next: leaf({ purpose: "compare", comparison: "value", outcomeLevel: "interval", normality: "yes" }) },
          { answer: "Nominal (categories)", next: leaf({ purpose: "compare", comparison: "value", outcomeLevel: "nominal" }) },
        ]),
      },
      {
        answer: "Separate groups of different people (independent)",
        next: node("How is the outcome measured?", [
          {
            answer: "Interval or ratio",
            next: node("How are the groups arranged?", [
              { answer: "Two groups, one grouping variable", next: leaf(independent({ outcomeLevel: "interval", groups: "two" })) },
              { answer: "Three or more groups, one grouping variable", next: leaf(independent({ outcomeLevel: "interval", groups: "three-plus" })) },
              { answer: "Two grouping variables together", next: leaf(independent({ outcomeLevel: "interval", groups: "two", secondFactor: "yes" }), "Each grouping variable can have two or more categories.") },
              { answer: "Groups compared while controlling for a numeric covariate", next: leaf(independent({ outcomeLevel: "interval", groups: "two", covariate: "yes" })) },
            ]),
          },
          {
            answer: "Ordinal",
            next: node("How many groups?", [
              { answer: "Two", next: leaf({ purpose: "compare", comparison: "independent", outcomeLevel: "ordinal", groups: "two" }) },
              { answer: "Three or more", next: leaf({ purpose: "compare", comparison: "independent", outcomeLevel: "ordinal", groups: "three-plus" }) },
            ]),
          },
          { answer: "Nominal (categories)", next: leaf({ purpose: "compare", comparison: "independent", outcomeLevel: "nominal", groups: "two" }, "The same test applies with more groups or categories.") },
        ]),
      },
      {
        answer: "The same people measured more than once (paired)",
        next: node("How is the outcome measured, and how many times?", [
          { answer: "Interval or ratio, twice", next: leaf({ purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "two", normality: "yes" }) },
          { answer: "Interval or ratio, three or more times", next: leaf({ purpose: "compare", comparison: "paired", outcomeLevel: "interval", measurements: "three-plus", normality: "yes" }) },
          { answer: "Ordinal, twice", next: leaf({ purpose: "compare", comparison: "paired", outcomeLevel: "ordinal", measurements: "two" }) },
        ]),
      },
    ]),
  },
  {
    answer: "Examine a relationship between two variables",
    next: node("How are the two variables measured?", [
      { answer: "Both interval or ratio, roughly normal", next: leaf({ purpose: "relationship", outcomeLevel: "interval", predictorLevel: "interval", normality: "yes" }) },
      { answer: "At least one ordinal", next: leaf({ purpose: "relationship", outcomeLevel: "ordinal", predictorLevel: "interval" }) },
    ]),
  },
  {
    answer: "Predict or explain an outcome",
    next: node("How is the outcome measured, and how many predictors?", [
      { answer: "Interval or ratio, one quantitative predictor", next: leaf({ purpose: "predict", outcomeLevel: "interval", predictors: "one", predictorLevel: "interval" }) },
      { answer: "Interval or ratio, two or more predictors", next: leaf({ purpose: "predict", outcomeLevel: "interval", predictors: "several" }) },
      { answer: "Two categories, such as yes or no", next: leaf({ purpose: "predict", outcomeLevel: "nominal", outcomeCategories: "two", predictors: "several" }) },
    ]),
  },
  {
    answer: "Examine categories",
    next: node("How many categorical variables?", [
      { answer: "One, compared with expected shares", next: leaf({ purpose: "association", categoricalVariables: "one" }) },
      { answer: "Two, examined together", next: leaf({ purpose: "association", categoricalVariables: "two" }) },
    ]),
  },
]);

/** Every leaf in the tree, in reading order. */
export function treeLeaves(tree: TreeNode = DECISION_TREE): TreeLeaf[] {
  return tree.branches.flatMap((branch) => (branch.next.kind === "leaf" ? [branch.next] : treeLeaves(branch.next)));
}
