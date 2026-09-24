/** All wording for the Research Question Builder. Academic content lives in the knowledge layer. */

export const page = {
  title: "Research Question Builder",
  /** One sentence, for listings such as the tools index. */
  summary: "Helps you shape a focused research question, explaining each question type and giving feedback on your own wording.",
  metaDescription:
    "Develop a clear research question step by step: choose a question type, draft it in your own words, and get explained feedback on variables, scope, FINER criteria and methodological fit.",
  intro:
    "Describe your project, choose the type of question you want to ask, then write your question in your own words. Every piece of feedback explains why it is given. The builder never writes your final question for you.",
  noScript:
    "The Research Question Builder gives feedback as you type, which needs JavaScript. Turn on JavaScript to use it. The guidance below works without it.",
  howHeading: "How the builder works",
  limitsHeading: "What this tool can't determine",
  finerHeading: "About the FINER criteria",
  privacyHeading: "Privacy",
  privacy: "Everything you enter stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "Your project details are kept together as one project draft. Later research tools will be able to build on the same draft.",
  "Suggestions for question types come from your aim, your variables and your methodology. Each says why it is suggested, and you always choose.",
  "The draft question is assembled only from the words you entered, following the usual structure of the type you chose. Anything missing is shown in square brackets rather than invented.",
  "Feedback reads the wording of your question. It recognises common patterns, so it can miss things or misread them: treat it as prompts for your own thinking.",
];

export const finerAbout: readonly string[] = [
  "FINER stands for Feasible, Interesting, Novel, Ethical and Relevant. It is a checklist for judging a research question, described by Hulley and colleagues in Designing Clinical Research (2013).",
  "The builder judges each criterion in words, never with a score. Interest and novelty can't be judged from wording, so they are always left for you to judge.",
];

export const form = {
  projectHeading: "Your project",
  projectHint: "Only the population is essential for most questions. Add whatever you know; you can change it at any time.",
  researchArea: "Research area",
  researchAreaHint: "The broad field, such as “Public health” or “Education”.",
  topic: "Topic",
  topicHint: "What your project is about, such as “sleep and academic performance”.",
  population: "Population",
  populationHint: "Who or what you will study, such as “first-year university students”.",
  location: "Location (optional)",
  locationHint: "Where the study takes place, such as “Nepal” or “three London hospitals”.",
  timeContext: "Time frame (optional)",
  timeContextHint: "When, or over what period, such as “2025” or “during the first year of study”.",
  researchAim: "Research aim",
  researchAimHint: "What the project sets out to do, such as “To examine how screen time affects sleep quality”.",
  variablesHeading: "Variables (optional)",
  variablesHint: "Add these if your question is about what influences an outcome. Enter one per line.",
  independentVariables: "Independent variables",
  independentVariablesHint: "What might influence the outcome, or define the groups you compare.",
  dependentVariables: "Dependent variables",
  dependentVariablesHint: "The outcomes you will measure or examine.",
  methodologyHeading: "Methodology (optional)",
  methodologyHint: "If you have used the Research Onion Explorer, enter the same choices here to see how your question fits them.",
  methodology: "Methodology",
  philosophy: "Research philosophy",
  approach: "Research approach",
  notChosen: "Not chosen",
} as const;

export const types = {
  heading: "Choose a question type",
  intro: "The type of question shapes your whole design. Read the suggestions, then choose the type that matches what you want to find out.",
  suggestionsHeading: "Suggested for your project",
  noSuggestions: "Add your aim, variables or methodology to see suggestions. You can still choose any type.",
  legend: "Which type of question do you want to ask?",
  purposeHint: "Types by purpose describe what the question asks; types by approach describe the kind of data it needs.",
  purpose: "By purpose",
  approach: "By approach",
  stems: "Typical openings",
  example: "Example",
  none: "Choose a type to see what it means and to get a draft structure.",
} as const;

export const drafting = {
  heading: "Write your question",
  draftHeading: "A starting structure",
  noType: "Choose a question type above to see a draft built from your details.",
  useDraft: "Start from this draft",
  questionLabel: "Your research question",
  questionHint: "Write the question in your own words. Feedback updates as you type.",
} as const;

export const feedback = {
  heading: "Feedback",
  empty: "Write your question above to see feedback on it.",
  intro: "Feedback on the wording of your question. It explains; it doesn't decide. Check anything important with your supervisor.",
  typeHeading: "Question type",
  noTypeDetected: "The wording doesn't clearly signal a type of question. Openings such as “What is the relationship between…” or “How do … experience…” make the type clear.",
  strengths: "Strengths",
  noStrengths: "No particular strengths were recognised in the wording yet. The weaknesses and improvements below show where to start.",
  weaknesses: "Weaknesses",
  noWeaknesses: "No common weaknesses were found in the wording.",
  elements: "Variables and scope",
  finer: "FINER evaluation",
  toConsider: "Questions to consider",
  missing: "Missing information",
  noMissing: "Nothing the question usually needs is missing.",
  improvements: "Possible improvements",
  noImprovements: "No changes are suggested for the wording. You may still want to refine it with your supervisor.",
  consistency: "Methodological consistency",
  noConsistency: "Add a methodology, research philosophy or approach above to see how your question fits them.",
  notes: "Academic notes",
  project: "Your project draft",
  projectHint: "Everything the builder now knows about your project, including your question. It exists only on this page.",
  limits: "This feedback can't tell you whether your research is good, original, publishable or approved.",
  limitsLink: "Read what this tool can't determine",
  why: "Why:",
} as const;

export const announcements = {
  draftUsed: "Draft copied into your question. Edit it in your own words.",
  typeChosen: (name: string) => `${name} question chosen. A draft structure is shown below.`,
  feedbackUpdated: (strengths: number, weaknesses: number, missing: number) =>
    `Feedback updated: ${strengths} ${strengths === 1 ? "strength" : "strengths"}, ${weaknesses} ${weaknesses === 1 ? "weakness" : "weaknesses"}, ${missing} missing ${missing === 1 ? "item" : "items"}.`,
} as const;
