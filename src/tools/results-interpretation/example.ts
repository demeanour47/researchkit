import type { TypedProject } from "@/knowledge/research";

/** A fictional example project and result, for trying the assistant. Illustrative only. */
export const exampleProject: TypedProject = {
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year students?",
  researchObjectives: "To examine the relationship between screen time and sleep quality\nTo describe students' evening screen use",
  independent: "screen time",
  dependent: "sleep quality",
  moderator: "",
  mediator: "",
  control: "",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "correlational",
  technique: "convenience",
  margin: "5",
  hypotheses: "relationship",
};

export const exampleLevels = { "var-screen-time": "ratio", "var-sleep-quality": "ratio" } as const;

/** A fictional Pearson correlation, as statistics software might report it. */
export const exampleResult = { kind: "pearson", values: { r: "-0.34", p: "0.002", n: "120" }, variables: ["screen time", "sleep quality"] } as const;
