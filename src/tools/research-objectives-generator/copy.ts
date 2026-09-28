/** All wording for the Research Objectives Generator. Academic content lives in the knowledge layer. */

export const page = {
  title: "Research Objectives Generator",
  /** One sentence, for listings such as the tools index. */
  summary: "Turns your research question into a general objective and specific objectives, with transparent alignment and quality checks.",
  metaDescription:
    "Write your general objective and specific research objectives from your own research question. Choose a verb that fits your purpose, edit the draft, and see explained checks for alignment and common wording problems.",
  intro:
    "Choose a verb category that fits what your study sets out to do, get a draft general objective built only from your own project details, then break it down into specific objectives. Every draft is a starting point to edit, and every check explains itself.",
  noScript:
    "The Research Objectives Generator drafts and checks objectives as you type, which needs JavaScript. Turn on JavaScript to use it. The guidance below works without it.",
  howHeading: "How the generator works",
  limitsHeading: "What this tool can't determine",
  privacyHeading: "Privacy",
  privacy: "Everything you enter stays in your browser. Nothing is sent anywhere or saved, and it is cleared when you leave the page.",
} as const;

export const how: readonly string[] = [
  "A general objective states, in one sentence, what the whole study sets out to do. Specific objectives break it down into the smaller, achievable steps that together deliver it.",
  "Verb categories group action verbs by research purpose, such as describing, comparing or examining a relationship. The category doesn't decide your methodology, and a category is a suggestion to consider: your research design and question decide which verb fits, and you always choose.",
  "The draft general objective is assembled only from the words in your project: your variables, population, location and time frame. Anything missing is shown in square brackets rather than invented.",
  "Specific objectives are yours to write. Suggested starting points show one way a general objective of this kind is typically broken down; they are not a required structure.",
  "Alignment checks compare your general objective with your research question, and your specific objectives with your general objective. Quality checks look for common wording problems, such as an objective with no clear action, several actions in one objective, or an objective that reads as an outcome rather than a research action. Every check explains why, and none of them score or rank your objectives.",
] as const;

export const form = {
  workspaceNote: "Working in your project: the topic, population, context and variables you use here come from your research question stage.",
  questionHeading: "Your research question",
  questionLabel: "Research question",
  questionHint: "Paste the question from the Research Question Builder, or write it here.",
  detailsHeading: "Project details",
  detailsHint: "These are used to build your draft objectives. Add whatever you know; anything missing is shown as a placeholder in the draft.",
  topic: "Topic",
  topicHint: "What your project is about, such as “sleep and academic performance”.",
  population: "Population",
  populationHint: "Who or what you study, such as “first-year university students”.",
  location: "Location (optional)",
  locationHint: "Such as “Nepal” or “three London hospitals”.",
  timeContext: "Time frame (optional)",
  timeContextHint: "Such as “2025” or “during the first year of study”.",
  independentVariables: "Independent variables (optional)",
  independentVariablesHint: "What may influence the outcome, one per line.",
  dependentVariables: "Dependent variables (optional)",
  dependentVariablesHint: "The outcomes you will measure or examine, one per line.",
} as const;

export const verbs = {
  heading: "Choose a verb category",
  intro: "Each category fits a different research purpose. Read the suggestions if your research question is filled in, then choose the category and verb that best fit your study.",
  suggestionsHeading: "Suggested for your question",
  noSuggestions: "Add your research question above to see suggestions. You can still choose any category.",
  legend: "Which purpose fits your general objective?",
  verbLegend: "Which verb fits best?",
  guidanceHeading: "About this category",
} as const;

export const general = {
  heading: "General objective",
  draftHeading: "A starting draft",
  draftIntro: "Built from your project details and the verb you chose.",
  useDraft: "Use this draft",
  label: "Your general objective",
  hint: "One sentence your specific objectives will work towards together. Edit the draft above, or write your own.",
} as const;

export const specific = {
  heading: "Specific objectives",
  intro: "Break your general objective down into the steps the study will take to achieve it. Add, edit, reorder, duplicate or remove objectives as your study needs.",
  outlinesHeading: "Suggested starting points",
  outlinesIntro: "One way a general objective of this kind is typically broken down. These are suggestions, not a required structure.",
  addOutline: "Add as a specific objective",
  listLegend: (position: number) => `Specific objective ${position}`,
  label: (position: number) => `Objective ${position}`,
  moveUp: (position: number) => `Move objective ${position} up`,
  moveDown: (position: number) => `Move objective ${position} down`,
  duplicate: (position: number) => `Duplicate objective ${position}`,
  remove: (position: number) => `Remove objective ${position}`,
  empty: "No specific objectives yet. Add one below, or use a suggested starting point above.",
  newLabel: "New specific objective",
  add: "Add objective",
} as const;

export const evaluation = {
  heading: "Alignment and quality checks",
  intro: "Checks describe how your objectives fit your project and common wording problems. They never score or rank your objectives.",
  generalHeading: "General objective",
  specificOverallHeading: "Specific objectives as a set",
  specificHeading: (position: number) => `Objective ${position}`,
} as const;

export const actions = {
  copyHeading: "Copy your objectives",
  copySubject: "your objectives",
} as const;

export const project = {
  heading: "Your project",
  intro: "This tool writes only the general objective and specific objectives. Everything else is shown as you entered it.",
} as const;
