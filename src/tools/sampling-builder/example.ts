/** A fictional example project, for trying the builder. Illustrative only. */
export const exampleProject = {
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year university students?",
  researchObjectives: "To estimate the prevalence of poor sleep quality among first-year students\nTo examine the relationship between screen time and sleep quality",
  independentVariables: "screen time",
  dependentVariables: "sleep quality",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  strategy: "survey",
  timeHorizon: "cross-sectional",
  design: "correlational",
} as const;

export const examplePopulation = {
  targetPopulation: "First-year undergraduate students at UK universities",
  accessiblePopulation: "First-year undergraduate students at one university",
  samplingFrame: "The university's list of enrolled first-year students",
  unitOfAnalysis: "Individual student",
  unitOfObservation: "Individual student",
  geographicalCoverage: "One university campus",
  inclusionCriteria: "Enrolled full-time in the first year\nAged 18 or over",
  exclusionCriteria: "Studying entirely online",
  samplingLocation: "Online questionnaire sent by university email",
} as const;
