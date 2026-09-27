/** All wording for the Research Title Builder. Academic content lives in the knowledge layer. */

export const page = {
  title: "Research Title Builder",
  /** One sentence, for listings such as the tools index. */
  summary: "Evaluates your own research titles for clarity, completeness and fit with your project, explaining every point without rewriting a word.",
  metaDescription:
    "Check your research or thesis title against 15 explained criteria: clarity, specificity, variables, population, location, design consistency, abbreviations, jargon and length. Compare alternative titles and see how each fits your research question and objectives. Free, no account.",
  intro:
    "Write your working title and any alternatives. The builder explains how each reads against fifteen criteria and against your research problem, question and objectives. It teaches what makes a strong title; it never writes or rewrites yours.",
  noScript:
    "The Research Title Builder evaluates titles as you type, which needs JavaScript. Turn on JavaScript to use it. The guidance below works without it.",
  howHeading: "How the builder works",
  limitsHeading: "What this tool can't do",
  categoriesHeading: "How titles are rated",
  privacyHeading: "Privacy",
  privacy: "Everything you enter stays in your browser. Nothing is sent anywhere, and your alternatives and their history are cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "Write a working title, then add alternatives. Edit any title freely; each keeps its earlier wordings so you can restore one.",
  "The working title is evaluated against fifteen criteria. Each says what it found, quoting your own words, and why it matters.",
  "The title is also compared with your research problem, gap, question, objectives, variables, population, location and design, and any mismatches are explained.",
  "Compare mode sets every title side by side on the same criteria, so you can see what each does well.",
  "In your research workspace, only the working title is saved to your project. Nothing else in the project is changed.",
];

export const categoriesAbout: readonly string[] = [
  "Titles are rated in words, never with a percentage: Excellent, Good or Needs improvement.",
  "Excellent means no criterion needs another look. Good means one or two do, but none of the core criteria: clarity, completeness, variables, population and design.",
  "Needs improvement means a core criterion, or three or more others, need another look. Every rating names the criteria that decided it.",
];

export const steps = {
  fromProject: "From your project",
  project: "Your project",
  projectIntro: "The title is checked against these details. Add whatever you know; everything is optional.",
  problem: "Research problem",
  gap: "Research gap",
  question: "Research question",
  objectives: "Objectives",
  perLine: "One per line.",
  independent: "Independent variables",
  dependent: "Dependent variables",
  population: "Population",
  location: "Location",
  design: "Research design",
  notChosen: "Not chosen",

  titles: "Your titles",
  titlesIntro: "Your working title is the one evaluated below and, in your workspace, saved to your project. Alternatives are kept for comparison while you are on this page.",
  newTitle: "Add a title",
  newTitleHint: "Type a title in your own words. The first becomes your working title.",
  add: "Add title",
  addError: "Type a title that isn't already in your list.",
  noTitles: "No titles yet. Add your first one above.",
  working: "Working title",
  favourite: "Favourite",
  editLabel: (index: number) => `Title ${index}`,
  makeWorking: "Use as working title",
  markFavourite: "Mark as favourite",
  remove: "Remove",
  history: (count: number) => `Earlier versions (${count})`,
  restore: "Restore",
  restoreLabel: (text: string) => `Restore “${text}”`,
  category: "Rating",

  evaluation: "Evaluation of your working title",
  evaluationIntro: "Each criterion says what it found in your words and why it matters. Nothing here rewrites your title.",
  noWorking: "Add a title to see its evaluation.",
  pattern: "Title pattern",
  noPattern: "No common academic title pattern was recognised. That can be fine; check that a reader can tell what kind of study it is.",
  alsoFollows: "Also follows",
  criteria: "Criteria",
  why: "Why it matters",

  keywords: "Keywords",
  keywordsIntro: "What your title names, element by element, beside your project. Elements read from the title's wording are marked so you can check them.",
  inTitle: "In the title",
  notInTitle: "Not in the title",
  fromTitle: "Read from the title",
  noneFound: "None",

  alignment: "Alignment with your project",
  alignmentIntro: "How the title sits with the rest of your project. Mismatches are explained, not corrected.",
  issues: "Issues found",
  noIssues: "No alignment issues found.",

  compare: "Compare titles",
  compareIntro: "Every title on the same criteria. Statuses are shown in words; open a title's evaluation by making it your working title.",
  compareNeedsTwo: "Add a second title to compare.",
  criterion: "Criterion",

  learn: "Learn from examples",
  learnIntro: "Fictional titles, written only to teach. They show why a title is weak and what a stronger one has; they are not suggestions for yours.",
  weak: "Weak title",
  whyWeak: "Why it is weak",
  stronger: "What a stronger title has",
  academic: "Academic explanation",
  nepal: "Nepal",
  global: "Global",

  export: "Export",
  exportIntro: "A review of all your titles and the working title's evaluation.",
  /** With the subject, which is visually hidden, the button reads “Copy working title”. */
  copyTitle: "Copy",
  copiedTitle: "Copied",
  copySubject: "working title",
  markdown: "Download Markdown",
  word: "Download Word",
  pdf: "Download PDF",
  references: "References",
} as const;
