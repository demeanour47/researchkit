/** All wording for the Statistical Assumption Checker. Academic content lives in the knowledge layer. */

export const page = {
  title: "Statistical Assumption Checker",
  /** One sentence, for listings such as the tools index. */
  summary: "Explains which assumptions to check before each statistical analysis, how to check them, the usual thresholds, and what to do if they fail.",
  metaDescription:
    "Know what to check before running a t-test, ANOVA, regression, chi-square, factor analysis or SEM: each assumption explained, how to test it, commonly used thresholds, alternatives and non-parametric options, and how to report the checks.",
  intro:
    "Before running an analysis, check that its assumptions hold. The checker lists the assumptions behind each analysis your project plans, says what your project already shows about them, and explains how to check the rest once you have data. It never tests assumptions itself.",
  noScript:
    "The checklist for your project needs JavaScript. Turn on JavaScript to use it. The guide to every analysis's assumptions below works without it.",
  howHeading: "How the checker works",
  limitsHeading: "What this tool can't do",
  reviewHeading: "Awaiting review",
  privacyHeading: "Privacy",
  privacy: "Everything stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "The checker reads your project draft: variables and how they are measured, hypotheses, research design, sampling, sample size, and the analyses the Data Analysis Recommender plans from them. Enter them in the first step; later versions will bring them across from the other research tools.",
  "For each planned analysis, it lists the assumptions to check. What your project already shows, such as measurement levels, repeated measurement, clustering and planned sample size, is judged now; the rest is marked for you to review once data are collected.",
  "Every assumption explains why it matters, how researchers usually check it, the thresholds commonly used, and what to do if it fails, including non-parametric alternatives.",
  "Nothing is scored. Each assumption is marked Looks aligned, Worth checking, Needs clarification, Missing or For you to review.",
];

export const steps = {
  saveSubject: "this assumption checklist",
  project: "Your project",
  projectIntro: "Enter what you already know. The checklist follows from the analyses your project plans.",
  example: "Load an example project",
  exampleLoaded: "Example project loaded. It is fictional, for trying the checker.",
  checklist: "Your assumption checklist",
  checklistIntro: "The analyses your project plans, and the assumptions to check before running each.",
  forQuestions: (questions: string) => `Used for: ${questions}.`,
  basedOn: "Based on",
  howToCheck: (name: string) => `How to check ${name.toLowerCase()}`,
  notes: "Notes",
  copyLabel: "Copy checklist",
  copiedLabel: "Copied checklist",
  copySubject: "as text",
  guide: "Assumptions by analysis",
  guideIntro: "Every analysis the checker covers, and everything about its assumptions. Thresholds are commonly used conventions; references will be added after academic review.",
  contents: "Analyses",
  assumptions: "Assumptions to check",
  why: "Why it matters",
  check: "How to check it",
  thresholds: "Commonly used thresholds",
  violated: "If it is violated",
  remedies: "What to do instead",
  alternatives: "Alternatives",
  nonParametric: "Non-parametric alternatives",
  reporting: "Reporting example",
  reportingNote: "Illustrative numbers; replace them with your own.",
  mistakes: "Common mistakes",
  referencesPending: "References awaiting academic review.",
} as const;
