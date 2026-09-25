import type { TypedProject } from "../../knowledge/research";

/** A fictional example project, for trying the checker. Illustrative only. */
export const exampleProject: TypedProject = {
  researchQuestion: "Does a mindfulness programme reduce exam anxiety among first-year students?",
  researchObjectives: "To compare exam anxiety between students who take the programme and those who don't\nTo examine whether prior anxiety explains differences after the programme",
  independent: "programme",
  dependent: "exam anxiety: worry; tension; physical symptoms",
  moderator: "",
  mediator: "",
  control: "prior anxiety",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "quasi-experimental",
  technique: "cluster",
  margin: "20",
  hypotheses: "difference",
};

export const exampleLevels = { "var-programme": "binary", "var-exam-anxiety": "likert", "var-prior-anxiety": "interval" } as const;
