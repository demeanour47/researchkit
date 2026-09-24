/** A fictional example project, for trying the builder. It is illustrative, not a recommended design. */
export const exampleProject = {
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year university students?",
  researchObjectives: [
    "To examine whether screen time predicts sleep quality",
    "To examine whether caffeine intake predicts sleep quality",
    "To test whether gender moderates the effect of screen time on sleep quality",
    "To examine whether bedtime mediates the effect of screen time on sleep quality",
  ].join("\n"),
  independentVariables: "screen time\ncaffeine intake",
  dependentVariables: "sleep quality",
  mediatorVariables: "bedtime",
  moderatorVariables: "gender",
  controlVariables: "age",
  population: "first-year university students",
  location: "",
  timeContext: "",
} as const;
