import type { TypedProject } from "../../knowledge/research";

/** A fictional example project, for trying the builder's suggestions and project tables. Illustrative only. */
export const exampleProject: TypedProject = {
  researchQuestion: "How is screen time before bed related to sleep quality among undergraduate students?",
  researchObjectives: "To examine the relationship between screen time and sleep quality\nTo compare sleep quality between faculties",
  independent: "screen time\nfaculty",
  dependent: "sleep quality: time to fall asleep; feeling rested; waking at night",
  moderator: "",
  mediator: "",
  control: "gender",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "correlational",
  technique: "stratified",
  margin: "5",
  hypotheses: "relationship",
};

export const exampleLevels = { "var-screen-time": "ratio", "var-faculty": "nominal", "var-sleep-quality": "likert", "var-gender": "binary" } as const;
