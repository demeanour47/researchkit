/** A fictional example project, for trying the calculator. Illustrative only. */
export const exampleProject = {
  researchQuestion: "How common is poor sleep quality among first-year students at one university?",
  researchObjectives: "To estimate the prevalence of poor sleep quality among first-year students\nTo describe how sleep quality varies by course",
  independentVariables: "",
  dependentVariables: "poor sleep quality",
  outcomeLevel: "binary",
  design: "survey",
  technique: "simple-random",
  targetPopulation: "First-year undergraduate students at one university",
  samplingFrame: "The university's list of enrolled first-year students",
  planResponseRate: "60",
} as const;

/** Example assumptions matching the project. The response rate is left for the researcher to bring across. */
export const exampleInputs = {
  populationSize: "3,200",
  margin: "5",
  proportion: "50",
  responseRate: "",
  designEffect: "1",
} as const;
