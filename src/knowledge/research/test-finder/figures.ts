/**
 * Teaching figures as data: how variables are arranged for each kind of test, the
 * difference between independent and paired observations, and what the main
 * assumptions look like. The interface draws them; every figure has a caption and a
 * text description, so it can be understood without seeing it. Numbers in the
 * assumption figures are illustrative, chosen to show a shape, and are labelled so.
 */

export const STRUCTURE_DIAGRAM_IDS = [
  "one-sample",
  "two-groups",
  "paired",
  "three-groups",
  "two-way",
  "ancova",
  "correlation",
  "regression",
  "multiple-regression",
  "association",
  "goodness-of-fit",
] as const;
export type StructureDiagramId = (typeof STRUCTURE_DIAGRAM_IDS)[number];

export interface DiagramBox {
  /** The variable's role, such as “Outcome (dependent variable)”. */
  role: string;
  label: string;
}

/**
 * How the first row relates to the last: one leads to the other (→), the two are
 * examined together without roles (↔), or one is compared with the other.
 */
export type DiagramLink = "leads-to" | "with" | "compared-with";

export interface StructureDiagram {
  id: StructureDiagramId;
  caption: string;
  /** The whole diagram in one or two sentences, for anyone who can't see it. */
  description: string;
  from: readonly DiagramBox[];
  link: DiagramLink;
  /** The groups a grouping variable forms, shown between the rows. */
  groups?: readonly string[];
  to: readonly DiagramBox[];
  /** Something the arrows can't show, such as an interaction. */
  note?: string;
}

const box = (role: string, label: string): DiagramBox => ({ role, label });

export const STRUCTURE_DIAGRAMS: Readonly<Record<StructureDiagramId, StructureDiagram>> = {
  "one-sample": {
    id: "one-sample",
    caption: "One sample compared with a stated value",
    description: "The mean of one quantitative variable, weekly working hours, is compared with a value stated in advance: the 40 hours in the contract.",
    from: [box("Outcome (quantitative)", "Weekly working hours")],
    link: "compared-with",
    to: [box("Comparison value (stated in advance)", "40 hours")],
  },
  "two-groups": {
    id: "two-groups",
    caption: "Two independent groups compared on one outcome",
    description: "A grouping variable, bank type, splits participants into two separate groups, public and private; their mean job satisfaction is compared.",
    from: [box("Grouping variable (independent variable)", "Bank type")],
    link: "leads-to",
    groups: ["Public banks", "Private banks"],
    to: [box("Outcome (dependent variable)", "Job satisfaction")],
  },
  paired: {
    id: "paired",
    caption: "The same participants measured twice",
    description: "Each participant's score before training is compared with their own score after training.",
    from: [box("First measurement", "Score before training")],
    link: "compared-with",
    to: [box("Second measurement, same participants", "Score after training")],
  },
  "three-groups": {
    id: "three-groups",
    caption: "Three or more independent groups compared on one outcome",
    description: "A grouping variable, teaching method, forms three separate groups: lecture, discussion and online. Their mean exam scores are compared.",
    from: [box("Grouping variable (factor)", "Teaching method")],
    link: "leads-to",
    groups: ["Lecture", "Discussion", "Online"],
    to: [box("Outcome (dependent variable)", "Exam score")],
  },
  "two-way": {
    id: "two-way",
    caption: "Two grouping variables and one outcome",
    description: "Two grouping variables, training method and experience level, both point to one outcome, sales performance. The analysis also asks whether the effect of one depends on the other.",
    from: [box("Factor A", "Training method"), box("Factor B", "Experience level")],
    link: "leads-to",
    to: [box("Outcome (dependent variable)", "Sales performance")],
    note: "Interaction: does the effect of training method depend on experience level?",
  },
  ancova: {
    id: "ancova",
    caption: "Groups compared while adjusting for a covariate",
    description: "A grouping variable, teaching method, and a quantitative covariate, prior achievement, both point to the outcome, final score. Groups are compared after allowing for prior achievement.",
    from: [box("Grouping variable (factor)", "Teaching method"), box("Covariate (quantitative)", "Prior achievement")],
    link: "leads-to",
    to: [box("Outcome (dependent variable)", "Final score")],
  },
  correlation: {
    id: "correlation",
    caption: "Two quantitative variables examined together",
    description: "Study time and exam score are examined together, with no variable treated as the outcome.",
    from: [box("First variable (quantitative)", "Study time")],
    link: "with",
    to: [box("Second variable (quantitative)", "Exam score")],
  },
  regression: {
    id: "regression",
    caption: "One predictor used to estimate an outcome",
    description: "Study hours, the predictor, points to exam score, the outcome being predicted.",
    from: [box("Predictor (independent variable)", "Study hours")],
    link: "leads-to",
    to: [box("Outcome (dependent variable)", "Exam score")],
  },
  "multiple-regression": {
    id: "multiple-regression",
    caption: "Several predictors used together to estimate an outcome",
    description: "Two predictors, study hours and attendance, both point to exam score. Each one's contribution is estimated while holding the other constant.",
    from: [box("Predictor 1", "Study hours"), box("Predictor 2", "Attendance")],
    link: "leads-to",
    to: [box("Outcome (dependent variable)", "Exam score")],
  },
  association: {
    id: "association",
    caption: "Two categorical variables examined together",
    description: "Gender and employment status, both categorical, are cross-tabulated to see whether they are associated.",
    from: [box("First variable (categorical)", "Gender")],
    link: "with",
    to: [box("Second variable (categorical)", "Employment status")],
  },
  "goodness-of-fit": {
    id: "goodness-of-fit",
    caption: "One categorical variable compared with expected shares",
    description: "The counts of customers choosing each service channel are compared with the counts expected if every channel were chosen equally often.",
    from: [box("Categorical variable (observed counts)", "Service channel chosen")],
    link: "compared-with",
    to: [box("Expected counts (stated in advance)", "Equal shares for every channel")],
  },
};

// Independent and paired observations.

export interface PairingFigure {
  caption: string;
  independent: { heading: string; groups: readonly { label: string; members: readonly string[] }[]; note: string };
  paired: { heading: string; measures: readonly [string, string]; participants: readonly string[]; note: string };
  /** Why the difference matters for choosing a test. */
  why: string;
}

export const PAIRING_FIGURE: PairingFigure = {
  caption: "Independent groups and paired observations",
  independent: {
    heading: "Independent groups",
    groups: [
      { label: "Group A", members: ["Participant 1", "Participant 2", "Participant 3"] },
      { label: "Group B", members: ["Participant 4", "Participant 5", "Participant 6"] },
    ],
    note: "Six different people: each appears in one group only, so the two sets of scores are unrelated.",
  },
  paired: {
    heading: "Paired observations",
    measures: ["Before", "After"],
    participants: ["Participant 1", "Participant 2", "Participant 3"],
    note: "Three people, each measured twice: every “after” score belongs with one “before” score.",
  },
  why: "Paired scores are related: a person who scores high before usually scores high after. Paired tests use that link by analysing each person's change, which removes differences between people from the comparison. Treating paired data as independent ignores the link; treating independent groups as paired invents one. Either way the test answers the wrong question.",
};

// What assumptions look like.

export interface HistogramPanel {
  label: string;
  /** Bar heights from left to right. */
  counts: readonly number[];
  description: string;
}

export interface NormalityFigure {
  caption: string;
  axis: string;
  panels: readonly [HistogramPanel, HistogramPanel];
  note: string;
}

export const NORMALITY_FIGURE: NormalityFigure = {
  caption: "Roughly normal and clearly skewed distributions",
  axis: "Scores from low (left) to high (right); bar height is the number of participants",
  panels: [
    { label: "Roughly normal", counts: [1, 3, 6, 9, 6, 3, 1], description: "Most scores sit in the middle, tailing off evenly on both sides." },
    { label: "Skewed to the right", counts: [9, 8, 5, 3, 2, 1, 1], description: "Most scores are low, with a long tail of a few high scores." },
  ],
  note: "Illustrative counts, not data from a study. Real data are judged from plots and statistics together, as the Statistical Assumption Checker explains.",
};

export interface DotPanel {
  label: string;
  groups: readonly { label: string; values: readonly number[] }[];
  description: string;
}

export interface VarianceFigure {
  caption: string;
  scale: { min: number; max: number };
  panels: readonly [DotPanel, DotPanel];
  note: string;
}

export const VARIANCE_FIGURE: VarianceFigure = {
  caption: "Similar and very different spreads in two groups",
  scale: { min: 25, max: 75 },
  panels: [
    {
      label: "Similar spread",
      groups: [
        { label: "Group A", values: [40, 45, 50, 55, 60] },
        { label: "Group B", values: [42, 47, 52, 57, 62] },
      ],
      description: "Both groups' scores are spread over about 20 points.",
    },
    {
      label: "Very different spread",
      groups: [
        { label: "Group A", values: [48, 49, 50, 51, 52] },
        { label: "Group B", values: [30, 40, 50, 60, 70] },
      ],
      description: "Group A's scores lie within 4 points of each other; Group B's are spread over 40 points.",
    },
  ],
  note: "Illustrative values, not data from a study. Homogeneity of variance asks for spreads like the first pair; Welch's versions of the tests allow spreads like the second.",
};

export interface IndependenceFigure {
  caption: string;
  panels: readonly { label: string; units: readonly { label: string; members: readonly string[] }[]; description: string }[];
}

export const INDEPENDENCE_FIGURE: IndependenceFigure = {
  caption: "Independent and related observations",
  panels: [
    {
      label: "Independent observations",
      units: [{ label: "Sampled individually", members: ["Employee 1", "Employee 2", "Employee 3", "Employee 4"] }],
      description: "Each employee is sampled and measured once, separately, so one person's answer tells you nothing about another's.",
    },
    {
      label: "Related observations",
      units: [
        { label: "Branch 1", members: ["Employee 1", "Employee 2"] },
        { label: "Branch 2", members: ["Employee 3", "Employee 4"] },
      ],
      description: "Employees in the same branch share a manager and conditions, so their answers tend to be alike. Treating them as independent overstates how much information the data hold.",
    },
  ],
};

export const FIGURE_IDS = ["pairing", "normality", "variance", "independence"] as const;
export type FigureId = (typeof FIGURE_IDS)[number];
