import type { ProjectInputs } from "./project-input";

/** A fictional example project, for trying the recommender. Illustrative only. */
export const exampleInputs: ProjectInputs = {
  researchQuestion: "How does social support relate to the wellbeing of first-year students, and does stress explain the link?",
  researchObjectives: "To examine the relationship between social support and wellbeing\nTo test whether stress mediates the relationship",
  independent: "social support: family support; friend support; university support",
  dependent: "wellbeing: life satisfaction; positive mood; sense of purpose",
  moderator: "",
  mediator: "stress: feeling overwhelmed; worry; difficulty relaxing",
  control: "year of study",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "correlational",
  technique: "stratified",
  margin: "5",
  hypotheses: "relationship",
};

/** Measurement levels for the example's variables, by variable id. */
export const exampleLevels = {
  "var-social-support": "likert",
  "var-wellbeing": "likert",
  "var-stress": "likert",
  "var-year-of-study": "ordinal",
} as const;
