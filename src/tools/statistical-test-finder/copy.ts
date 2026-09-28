/** All wording for the Statistical Test Finder. Statistical content lives in the knowledge layer. */

/** The Statistics guides the finder links to, by slug. */
export const GUIDE_SLUGS = {
  choosing: "how-to-choose-a-statistical-test",
} as const;

export const page = {
  title: "Statistical Test Finder",
  /** One sentence, for listings such as the tools index. */
  summary: "Helps you identify statistical tests that may suit your research question and data, and explains why each may fit.",
  metaDescription:
    "Which statistical test should I use? Answer a few questions about your research question, variables and groups, and see candidate tests with the reasons each may fit, the assumptions to check and the alternatives.",
  intro:
    "Answer a few questions about what you want to find out, how your variables are measured and how your groups are structured. The finder suggests tests that are commonly used for that situation and explains why each may fit. It never decides for you.",
  noScript:
    "The finder suggests tests as you answer, which needs JavaScript. The decision tree and comparison table below work without it.",
  howHeading: "How the finder works",
  limitsHeading: "What this tool can't determine",
  privacyHeading: "Privacy",
  privacy: "Everything you enter stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "Test selection starts from the research question: what you want to find out narrows the family of tests before anything about the data does.",
  "The finder then asks only what matters for that purpose: how the outcome is measured, how many groups there are, whether they are independent or paired, and whether normality is expected. Questions appear one at a time.",
  "Which test suits which arrangement of variables comes from the same rules the Data Analysis Recommender uses, so the two tools agree.",
  "Each candidate says why it may fit, what to check before relying on it, why a similar test may not fit, and what else to consider. Labels describe methodological fit; none says a test is right or wrong.",
  "Assumptions come from the Statistical Assumption Checker's guides, which explain how to check each one.",
];

export const form = {
  projectHeading: "Start from your project",
  projectIntro: "Your workspace project has hypotheses. Start from one to fill in what it already says; you can change any answer.",
  researchQuestion: "Your research question",
  hypothesisLabel: "Hypothesis to start from",
  useHypothesis: "Use this hypothesis",
  readFromHeading: "Filled in from your project",
  questionsHeading: "Describe your study",
  questionsIntro: "Answer from your research question and variables. Each answer brings up the next question that matters.",
  outcomeName: "Name of the outcome (optional)",
  firstName: "Name of the first variable (optional)",
  variableName: "Name of the variable (optional)",
  predictorName: "Name of the predictor (optional)",
  groupingName: "Name of the grouping variable (optional)",
  secondName: "Name of the second variable (optional)",
  nameHint: "Used in the explanation of your situation.",
  startOver: "Start over",
  startedOver: "Answers cleared. Start again from the first question.",
  hypothesisUsed: (count: number) => `Answers filled in from your hypothesis. ${count === 0 ? "Every question is answered." : `${count} ${count === 1 ? "question still needs" : "questions still need"} an answer.`}`,
} as const;

export const results = {
  heading: "Candidate tests",
  stillNeededHeading: "What the finder still needs to know",
  stillNeededIntro: "No test is suggested until these are answered, so nothing is guessed.",
  problemsHeading: "Check these answers",
  situationHeading: "Your situation",
  notesHeading: "Also note",
  noneCovered: "No test this tool covers fits this situation. The note above names the test usually used.",
  intro: "Tests that may fit your situation. Each says why; the final choice is yours and your supervisor's.",
  answers: "What it answers",
  why: "Why it may fit",
  structure: "Data it needs",
  outcome: "Outcome",
  predictor: "Predictor or grouping variable",
  groups: "Groups",
  pairing: "Independent or paired",
  diagram: "How the variables are arranged",
  assumptions: "Assumptions to check",
  limitations: "Limitations",
  reporting: "Reporting guidance",
  whyNot: "Why a similar test may not fit",
  example: "Example",
  alternatives: "Possible alternatives",
  learnMore: (name: string) => `Learn more: ${name}`,
  learnChoosing: "How to choose a statistical test",
  checkAssumptions: (name: string) => `Check assumptions: ${name}`,
  interpret: (name: string) => `Interpret results: ${name}`,
  checkerMissing: "The Statistical Assumption Checker doesn't cover this test yet.",
} as const;

export const nextSteps = {
  heading: "Apply it to your research",
  intro: "The finder helps you choose; it doesn't save anything. Your analysis plan is kept by the Data Analysis Recommender, which reads your whole project.",
  recommender: "Build your analysis plan in the Data Analysis Recommender",
  checker: "Plan your assumption checks in the Statistical Assumption Checker",
  interpreter: "Interpret your results in the Results Interpretation Assistant",
  workspace: "Open your research workspace",
} as const;

export const reference = {
  heading: "Before you choose",
  intro: "The same reasoning the finder uses, laid out so you can follow it yourself.",
  pairingHeading: "Independent or paired?",
  treeHeading: "The decision tree",
  matrixHeading: "Common tests compared",
  learnHeading: "Learn the ideas behind the tests",
} as const;
