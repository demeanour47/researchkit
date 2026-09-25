/** All wording for the Results Interpretation Assistant. Academic content lives in the knowledge layer. */

export const page = {
  title: "Results Interpretation Assistant",
  /** One sentence, for listings such as the tools index. */
  summary: "Explains the statistical results you already have: what they mean, whether they are significant, and how they bear on your hypotheses, objectives and research question.",
  metaDescription:
    "Interpret statistical results in plain language and in academic style: correlations, regression, t-tests, ANOVA, chi-square, Cronbach's alpha, factor analysis, SEM and PLS-SEM, linked to your hypotheses and objectives.",
  intro:
    "Enter a result from your statistics software, and the assistant explains what it means, whether it is statistically significant, how large the effect is, and what it says about your hypotheses, objectives and research question. It never calculates statistics; it explains the ones you have.",
  noScript:
    "The Results Interpretation Assistant responds to the numbers you enter, which needs JavaScript. Turn on JavaScript to use it. The guide to each kind of result below works without it.",
  howHeading: "How the assistant works",
  limitsHeading: "What this tool can't do",
  reviewHeading: "Awaiting review",
  privacyHeading: "Privacy",
  privacy: "Everything stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "The assistant reads your project draft: research question, objectives, hypotheses, variables, design, sampling, sample size and the analysis plan the Data Analysis Recommender makes from them. Enter them in the first step; later versions will bring them across from the other research tools.",
  "Enter the numbers your statistics software reported. The assistant checks they are possible, then explains them; it doesn't recalculate anything.",
  "Significance is judged against the level you choose. Effect sizes are labelled by the conventions researchers most often cite, which are rules of thumb.",
  "Each result is linked to the hypothesis it tests, the objectives and research question it serves, and its place in your analysis plan. A result supports or doesn't support a hypothesis; it never proves one.",
];

export const steps = {
  project: "Your project",
  projectIntro: "Enter what you already know, so each result can be linked to your hypotheses and objectives.",
  example: "Load an example project and result",
  exampleLoaded: "Example project and result loaded. They are fictional, for trying the assistant.",
  result: "Your result",
  resultIntro: "Choose the analysis, then enter the numbers exactly as your software reported them.",
  kind: "Analysis",
  numbers: "The numbers",
  numbersHint: "Required numbers are marked. Leave optional ones blank if you don't have them.",
  required: "required",
  firstVariable: "Variable (the predictor, or the grouping variable)",
  secondVariable: "Second variable (the outcome)",
  singleVariable: "Variable",
  noVariable: "Not chosen",
  hypothesis: "Hypothesis tested",
  hypothesisAuto: "Match automatically from the variables",
  alphaLegend: "Significance level",
  interpret: "Interpret this result",
  interpretation: "Interpretation",
  stale: "Your entries have changed since this interpretation. Interpret again to update it.",
  meaning: "What the statistic means",
  numbersTable: "The numbers you entered, and what each means",
  statistic: "Statistic",
  value: "Value",
  means: "Meaning",
  significance: "Statistical significance",
  magnitude: "Size of the effect",
  plain: "In plain language",
  academic: "Academic interpretation",
  implication: "Possible implication",
  hypothesisHeading: "Connection with the hypothesis",
  objectives: "Connection with the objectives",
  researchQuestion: "Connection with the research question",
  plan: "In your analysis plan",
  warnings: "Check these",
  limitations: "Limitations",
  mistakes: "Common mistakes to avoid",
  copyLabel: "Copy interpretation",
  copiedLabel: "Copied interpretation",
  copySubject: "as text",
  guide: "Results explained",
  guideIntro: "Every kind of result the assistant interprets: what it tells you, what to enter, and the mistakes to avoid. References will be added after academic review.",
  enter: "What to enter",
  referencesPending: "References awaiting academic review.",
  learnMore: (name: string) => `Learn more about interpreting ${name}`,
} as const;
