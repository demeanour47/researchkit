import type { TypedProject } from "../../knowledge/research";

/** A fictional example project, for trying the builder's suggestions. Illustrative only. */
export const exampleProject: TypedProject = {
  researchQuestion: "How is screen time before bed related to sleep quality among undergraduate students?",
  researchObjectives: "To examine the relationship between screen time and sleep quality\nTo compare sleep quality between faculties",
  independent: "screen time\nfaculty",
  dependent: "sleep quality",
  moderator: "",
  mediator: "",
  control: "",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "correlational",
  technique: "",
  margin: "",
  hypotheses: "relationship",
};

export const exampleLevels = { "var-screen-time": "ratio", "var-faculty": "nominal", "var-sleep-quality": "interval" } as const;
