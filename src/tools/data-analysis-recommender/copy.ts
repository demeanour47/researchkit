/** All wording for the Data Analysis Recommender. Academic content lives in the knowledge layer. */

export const page = {
  title: "Data Analysis Recommender",
  /** One sentence, for listings such as the tools index. */
  summary: "Recommends statistical analyses from your variables, hypotheses, design and sample, and explains why each one suits your project.",
  metaDescription:
    "Find the statistical tests your study needs: descriptive statistics, reliability, correlation, regression, t-tests, ANOVA, chi-square, non-parametric tests and SEM, each explained against your variables, hypotheses, design and sample size.",
  intro:
    "The recommender reads your project, including variables and how they are measured, hypotheses, research design, sampling and sample size, and sets out an analysis plan in the order a thesis reports it. Every method says why it suits, what it rests on, and what you'd need to justify.",
  noScript:
    "The Data Analysis Recommender responds to your project, which needs JavaScript. Turn on JavaScript to use it. The guide to analysis methods below works without it.",
  howHeading: "How the recommender works",
  limitsHeading: "What this tool can't do",
  reviewHeading: "Awaiting review",
  privacyHeading: "Privacy",
  privacy: "Everything stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "The recommender reads your project draft: variables and their measurement levels, indicators and questionnaire items, hypotheses, research onion choices, research design, sampling technique and sample size. Enter them in the first step; later versions will bring them across from the other research tools.",
  "Each rule looks at how variables are measured, what each hypothesis claims, whether the same people are measured more than once, and how large the sample will be.",
  "Every method gets one of three verdicts: Strong recommendation, Possible recommendation or Needs justification. None is ever called wrong.",
  "Normality can't be known until data are collected, so every test that assumes it comes with its non-parametric alternative.",
  "The recommender only reads the project draft. It writes nothing back.",
];

export const steps = {
  project: "Project details",
  projectIntro: "Enter what you already know. Anything left blank is simply not used, and the plan says what's missing.",
  example: "Load an example project",
  plan: "Your analysis plan",
  planIntro: "In the order a thesis reports it. Open a method to see why it suits your project and what it rests on.",
  basedOnHeading: "What the plan is based on",
  choiceLabel: "Methodological choice",
  designLabel: "Research design",
  repeatedLabel: "Same people measured more than once",
  sampleLabel: "Planned sample",
  notRecorded: "Not recorded",
  yes: "Yes",
  no: "No",
  overview: "Methods at a glance",
  overviewIntro: "The families of methods your plan draws on, with the strongest verdict among each family's methods.",
  why: "Why it suits",
  basedOn: "Based on",
  fallback: "If the data aren't normally distributed",
  justify: "What to justify",
  assumptions: "Assumptions to check",
  details: (name: string) => `${name}: why, and what to check`,
  notes: "Notes",
  copyLabel: "Copy analysis plan",
  copiedLabel: "Copied analysis plan",
  copySubject: "as text",
  guide: "Analysis methods explained",
  guideIntro: "Every method the recommender covers, grouped by what it is for. References will be added after academic review.",
  purpose: "What it answers",
  suitableWhen: "When it usually suits",
  limitations: "Limitations",
  learnMore: (name: string) => `Learn more about ${name}`,
  referencesPending: "References awaiting academic review.",
} as const;
