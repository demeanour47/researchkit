import type { ProjectInputs } from "./project-input";

/** A fictional example project, for trying the builder. Illustrative only: it contains no question wording. */
export const exampleInputs: ProjectInputs = {
  topic: "Screen time and sleep quality among first-year students",
  researchAim: "To understand how screen use in the evening relates to students' sleep",
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year university students?",
  researchObjectives: "To examine the relationship between screen time and sleep quality\nTo describe how first-year students use screens in the evening",
  independent: "screen time: weekday screen time; screen use in the hour before bed",
  dependent: "sleep quality: time taken to fall asleep; feeling rested on waking",
  control: "year of study",
  targetPopulation: "First-year undergraduate students at one university",
};

/** Measurement levels for the example's variables, by variable id. */
export const exampleLevels = {
  "var-screen-time": "ratio",
  "var-sleep-quality": "likert",
  "var-year-of-study": "ordinal",
} as const;
