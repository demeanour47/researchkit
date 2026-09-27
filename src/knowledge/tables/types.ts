/**
 * The tables the Research Table Builder makes, where each takes its content from, and
 * the model every export draws from. Example data is fictional and exists only to show
 * the layout each table expects.
 */

export const TABLE_TYPES = [
  "table-of-contents",
  "list-of-tables",
  "list-of-figures",
  "demographic-profile",
  "frequency",
  "percentage",
  "cross-tabulation",
  "descriptive-statistics",
  "reliability",
  "validity",
  "factor-analysis",
  "correlation-matrix",
  "regression",
  "model-summary",
  "coefficients",
  "anova",
  "chi-square",
  "hypothesis-summary",
  "operationalization",
  "measurement-scale",
  "questionnaire-summary",
  "sample-size-summary",
  "research-timeline",
  "reference-coding",
  "appendix",
  "custom",
] as const;
export type TableType = (typeof TABLE_TYPES)[number];

/**
 * Where a table's content comes from:
 * - data: raw responses, one row per participant, which the builder summarises.
 * - results: statistics already produced by your analysis software.
 * - project: the project details, with nothing to paste.
 * - entries: a list typed or pasted in, such as headings or references.
 */
export type TableSource = "data" | "results" | "project" | "entries";

export const TABLE_GROUPS = ["front", "sample", "measures", "tests", "design", "other"] as const;
export type TableGroup = (typeof TABLE_GROUPS)[number];

export const TABLE_GROUP_LABELS: Readonly<Record<TableGroup, string>> = {
  front: "Front matter",
  sample: "Describing the sample and data",
  measures: "Checking the measures",
  tests: "Relationships and tests",
  design: "Research design",
  other: "Other tables",
};

export interface TableTypeInfo {
  label: string;
  group: TableGroup;
  description: string;
  /** When to use it, in one sentence. */
  bestFor: string;
  source: TableSource;
  /** How to lay out the pasted data, in one sentence. Empty for project tables. */
  layout: string;
  /** Fictional example input, in CSV. Empty for project tables. */
  example: string;
  /** The title used until the researcher writes one. */
  defaultTitle: string;
}

export const TABLE_TYPE_INFO: Readonly<Record<TableType, TableTypeInfo>> = {
  "table-of-contents": {
    label: "Table of contents",
    group: "front",
    description: "Chapter and section headings with their page numbers, indented by level.",
    bestFor: "The contents page of a thesis, dissertation or report.",
    source: "entries",
    layout: "One heading per row: the heading (numbered like 1.2 to set its level), then its page number.",
    example: "Heading,Page\n1 Introduction,1\n1.1 Background,2\n1.2 Research questions,5\n2 Literature review,7\n2.1 Sleep and screen use,8\n3 Method,15",
    defaultTitle: "Contents",
  },
  "list-of-tables": {
    label: "List of tables",
    group: "front",
    description: "Every table's number, title and page, numbered automatically when numbers are left out.",
    bestFor: "The list of tables after the contents page.",
    source: "entries",
    layout: "One table per row: its title, then its page. An optional first column gives its number.",
    example: "Title,Page\nDemographic Profile of Participants,32\nDescriptive Statistics for Study Variables,34\nCorrelations Among Study Variables,36",
    defaultTitle: "List of Tables",
  },
  "list-of-figures": {
    label: "List of figures",
    group: "front",
    description: "Every figure's number, title and page, numbered automatically when numbers are left out.",
    bestFor: "The list of figures after the list of tables.",
    source: "entries",
    layout: "One figure per row: its title, then its page. An optional first column gives its number.",
    example: "Title,Page\nConceptual Framework,12\nResearch Onion,18\nScreen Time and Sleep Quality,37",
    defaultTitle: "List of Figures",
  },
  "demographic-profile": {
    label: "Demographic profile",
    group: "sample",
    description: "For each characteristic, such as gender or age group, the number and percentage of participants in each category.",
    bestFor: "Describing who took part, usually the first table of the results.",
    source: "data",
    layout: "One row per participant and one column per characteristic, with names in the first row.",
    example: "Gender,Age group,Faculty\nFemale,18–24,Arts\nMale,18–24,Science\nFemale,25–34,Science\nFemale,18–24,Business\nMale,25–34,Arts\nFemale,18–24,Science\nMale,35 or over,Business\nFemale,25–34,Arts\nMale,18–24,Science\nFemale,18–24,Business",
    defaultTitle: "Demographic Profile of Participants",
  },
  frequency: {
    label: "Frequency distribution",
    group: "sample",
    description: "How often each value or category occurs, with percentages and cumulative percentages. Many numeric values are grouped into intervals.",
    bestFor: "Showing the distribution of one variable in detail.",
    source: "data",
    layout: "One column of responses, one per participant, with its name in the first row.",
    example: "Hours of sleep\n6\n7\n7\n8\n6\n5\n7\n8\n9\n7\n6\n7",
    defaultTitle: "Frequency Distribution",
  },
  percentage: {
    label: "Percentage distribution",
    group: "sample",
    description: "The percentage of responses in each category, for one or several items that share the same categories, such as Likert items.",
    bestFor: "Summarising responses to rating items or several yes/no questions side by side.",
    source: "data",
    layout: "One row per participant and one column per item, with the item names in the first row.",
    example: "I feel prepared for exams,The marking criteria are clear\nAgree,Agree\nStrongly agree,Neutral\nNeutral,Disagree\nAgree,Agree\nDisagree,Agree\nAgree,Strongly agree\nStrongly agree,Agree\nNeutral,Neutral",
    defaultTitle: "Percentage Distribution of Responses",
  },
  "cross-tabulation": {
    label: "Cross-tabulation",
    group: "sample",
    description: "Counts for every combination of two categorical variables, with percentages within rows, columns or the whole sample.",
    bestFor: "Showing how one categorical variable is distributed across the groups of another.",
    source: "data",
    layout: "One row per participant: the row variable in the first column, the column variable in the second.",
    example: "Faculty,Uses a sleep app\nArts,Yes\nArts,No\nScience,Yes\nScience,Yes\nBusiness,No\nArts,Yes\nScience,No\nBusiness,No\nBusiness,Yes\nScience,Yes",
    defaultTitle: "Cross-Tabulation",
  },
  "descriptive-statistics": {
    label: "Descriptive statistics",
    group: "sample",
    description: "For each numeric variable: the number of responses, mean, standard deviation, minimum, maximum, skewness and kurtosis.",
    bestFor: "Summarising the study variables before testing hypotheses.",
    source: "data",
    layout: "One row per participant and one numeric column per variable, with names in the first row.",
    example: "Screen time,Sleep quality,Wellbeing\n2.5,7.1,3.8\n4,6.2,3.1\n1.5,8.0,4.2\n3,6.9,3.6\n5,5.8,2.9\n2,7.4,4.0\n3.5,6.5,3.3\n1,8.3,4.5",
    defaultTitle: "Descriptive Statistics for Study Variables",
  },
  reliability: {
    label: "Reliability (Cronbach's alpha)",
    group: "measures",
    description: "Cronbach's alpha for each scale, calculated from the item responses, with optional item-total correlations and alpha if each item is deleted.",
    bestFor: "Reporting the internal consistency of multi-item scales.",
    source: "data",
    layout: "One row per participant and one numeric column per item. Items are grouped into scales by name: SQ1, SQ2 and SQ3 form “SQ”, or write “Sleep quality: SQ1”.",
    example: "SQ1,SQ2,SQ3,WB1,WB2,WB3\n4,4,5,3,3,4\n2,3,2,4,4,4\n5,4,5,2,3,2\n3,3,4,4,5,4\n1,2,1,5,4,5\n4,5,4,3,3,3\n2,2,3,4,4,5\n5,5,4,2,2,3",
    defaultTitle: "Reliability of Measurement Scales",
  },
  validity: {
    label: "Validity (CR and AVE)",
    group: "measures",
    description: "Standardised loadings for each item, with composite reliability and average variance extracted calculated for each construct.",
    bestFor: "Reporting convergent validity after a confirmatory factor analysis or PLS-SEM.",
    source: "results",
    layout: "One row per item: the construct, the item, then its standardised loading.",
    example: "Construct,Item,Loading\nSleep quality,SQ1,0.82\nSleep quality,SQ2,0.79\nSleep quality,SQ3,0.85\nWellbeing,WB1,0.74\nWellbeing,WB2,0.81\nWellbeing,WB3,0.77",
    defaultTitle: "Convergent Validity of Constructs",
  },
  "factor-analysis": {
    label: "Factor analysis",
    group: "measures",
    description: "Factor loadings for each item, grouped by the factor each loads on most, with small loadings suppressed and eigenvalues and variance explained below.",
    bestFor: "Reporting an exploratory factor analysis, such as a rotated component matrix.",
    source: "results",
    layout: "One row per item: the item, then its loading on each factor. Optional rows named “Eigenvalue” and “% of variance” go at the end.",
    example: "Item,Factor 1,Factor 2\nSQ1,0.81,0.12\nSQ2,0.77,0.20\nSQ3,0.84,0.09\nWB1,0.15,0.72\nWB2,0.22,0.80\nWB3,0.10,0.75\nEigenvalue,2.41,1.87\n% of variance,40.2,31.1",
    defaultTitle: "Factor Loadings",
  },
  "correlation-matrix": {
    label: "Correlation matrix",
    group: "tests",
    description: "Means, standard deviations and correlations between every pair of numeric variables, with significance marked.",
    bestFor: "Showing how the study variables relate before regression or modelling.",
    source: "data",
    layout: "One row per participant and one numeric column per variable, with names in the first row.",
    example: "Screen time,Sleep quality,Wellbeing\n2.5,6.4,3.9\n4,6.8,3.0\n1.5,7.2,3.6\n3,5.9,3.8\n5,6.1,2.7\n2,7.9,3.4\n3.5,5.6,3.9\n1,7.0,4.4\n4.5,6.5,3.1\n2,6.3,4.1\n3,7.4,3.2\n1.5,6.0,4.0",
    defaultTitle: "Means, Standard Deviations and Correlations",
  },
  regression: {
    label: "Regression table",
    group: "tests",
    description: "Coefficients for each predictor with the model's R², adjusted R² and F test in the note.",
    bestFor: "Reporting a multiple regression in one compact table.",
    source: "results",
    layout: "One row per predictor: the predictor, then B, SE, β, t and p. Optional rows named R², Adjusted R² and F (with its two degrees of freedom) give the model fit.",
    example: "Predictor,B,SE,β,t,p\n(Constant),8.95,0.41,,21.83,0.000\nScreen time,-0.52,0.09,-0.48,-5.78,0.000\nCaffeine,-0.21,0.08,-0.22,-2.63,0.009\nR²,0.34\nAdjusted R²,0.33\nF,33.45,2,197",
    defaultTitle: "Regression Predicting Sleep Quality",
  },
  "model-summary": {
    label: "Model summary",
    group: "tests",
    description: "Fit statistics for one or more regression models, such as R, R², adjusted R², R² change and the F change test.",
    bestFor: "Comparing the steps of a hierarchical regression.",
    source: "results",
    layout: "One row per model: its name, then any of R, R², adjusted R², SE, ΔR², F change, df1, df2, p and Durbin–Watson, named in the first row.",
    example: "Model,R,R²,Adjusted R²,SE,ΔR²,F change,df1,df2,p\n1,0.41,0.17,0.16,1.12,0.17,40.33,1,198,0.000\n2,0.58,0.34,0.33,1.00,0.17,50.71,1,197,0.000",
    defaultTitle: "Model Summary",
  },
  coefficients: {
    label: "Coefficient table",
    group: "tests",
    description: "Unstandardised and standardised coefficients with standard errors, t, p, confidence intervals and collinearity statistics when given.",
    bestFor: "Reporting regression coefficients in full, as software prints them.",
    source: "results",
    layout: "One row per predictor: the predictor, then any of B, SE, β, t, p, the confidence interval's lower and upper bounds, tolerance and VIF, named in the first row. A row with only a name, such as “Step 2”, starts a group.",
    example: "Predictor,B,SE,β,t,p,Lower,Upper,VIF\n(Constant),8.95,0.41,,21.83,0.000,8.14,9.76,\nScreen time,-0.52,0.09,-0.48,-5.78,0.000,-0.70,-0.34,1.12\nCaffeine,-0.21,0.08,-0.22,-2.63,0.009,-0.37,-0.05,1.12",
    defaultTitle: "Regression Coefficients",
  },
  anova: {
    label: "ANOVA table",
    group: "tests",
    description: "Sums of squares, degrees of freedom, mean squares, F, p and partial eta squared for each source. Missing mean squares, F, p and effect sizes are calculated.",
    bestFor: "Reporting an analysis of variance.",
    source: "results",
    layout: "One row per source: its name, then SS and df. Name the error row “Within groups”, “Error” or “Residual”; a “Total” row is optional.",
    example: "Source,SS,df\nBetween groups,24.60,2\nWithin groups,118.20,87\nTotal,142.80,89",
    defaultTitle: "Analysis of Variance",
  },
  "chi-square": {
    label: "Chi-square table",
    group: "tests",
    description: "Counts and percentages of each characteristic across groups, with the chi-square test of association, its degrees of freedom, p and Cramér's V.",
    bestFor: "Testing whether categorical characteristics differ between groups.",
    source: "data",
    layout: "One row per participant: the grouping variable in the first column, then one column per characteristic to test.",
    example: "Group,Gender,Uses a sleep app\nIntervention,Female,Yes\nControl,Male,No\nIntervention,Female,Yes\nControl,Female,No\nIntervention,Male,Yes\nControl,Female,Yes\nIntervention,Male,No\nControl,Male,No\nIntervention,Female,Yes\nControl,Female,No\nIntervention,Female,Yes\nControl,Male,Yes",
    defaultTitle: "Chi-Square Tests of Association",
  },
  "hypothesis-summary": {
    label: "Hypothesis summary",
    group: "design",
    description: "Each hypothesis from your project, the analysis planned to test it and, once results are entered, whether it was supported.",
    bestFor: "Summarising hypothesis tests at the end of the results chapter.",
    source: "project",
    layout: "Optional: one row per hypothesis with its label and p-value, such as “H1,0.003”, to fill in the decision.",
    example: "Hypothesis,p\nH1,0.003\nH2,0.214",
    defaultTitle: "Summary of Hypothesis Tests",
  },
  operationalization: {
    label: "Variable operationalisation",
    group: "design",
    description: "Each variable with its role, conceptual and operational definitions, indicators, measurement level and scale, from your project.",
    bestFor: "The methodology chapter, showing how each concept is measured.",
    source: "project",
    layout: "",
    example: "",
    defaultTitle: "Operationalisation of Variables",
  },
  "measurement-scale": {
    label: "Measurement scale",
    group: "design",
    description: "Each construct with its number of items, response scale, measurement level and source, from your project and questionnaire.",
    bestFor: "Describing the instruments in the methodology chapter.",
    source: "project",
    layout: "",
    example: "",
    defaultTitle: "Measurement Scales",
  },
  "questionnaire-summary": {
    label: "Questionnaire summary",
    group: "design",
    description: "Each questionnaire section with its questions, question types and the variables it measures.",
    bestFor: "Describing the structure of a questionnaire.",
    source: "project",
    layout: "",
    example: "",
    defaultTitle: "Structure of the Questionnaire",
  },
  "sample-size-summary": {
    label: "Sample size summary",
    group: "design",
    description: "The population, sampling technique and every value used to calculate the sample size, from your project.",
    bestFor: "Justifying the sample in the methodology chapter.",
    source: "project",
    layout: "",
    example: "",
    defaultTitle: "Sample Size Determination",
  },
  "research-timeline": {
    label: "Research timeline",
    group: "design",
    description: "Each activity with the months it runs, marked in a grid of months.",
    bestFor: "A proposal's work plan or Gantt chart.",
    source: "entries",
    layout: "One activity per row: the activity, its first month, then its last month, as numbers from 1.",
    example: "Activity,Start,End\nLiterature review,1,3\nEthics approval,2,3\nData collection,4,6\nData analysis,6,8\nWriting up,7,10",
    defaultTitle: "Research Timeline",
  },
  "reference-coding": {
    label: "Reference coding",
    group: "other",
    description: "The studies in a literature review or systematic review, with the details coded for each.",
    bestFor: "Summarising reviewed studies in a literature review or an appendix.",
    source: "entries",
    layout: "One study per row, with the column names in the first row, such as Study, Design, Sample, Findings and Theme.",
    example: "Study,Design,Sample,Findings,Theme\nStudy A (2021),Survey,312 students,Longer screen time before bed linked to poorer sleep,Screen use\nStudy B (2022),Experiment,48 adults,Blue-light filters had no effect on sleep onset,Interventions\nStudy C (2023),Longitudinal,1 204 adolescents,Sleep problems predicted later wellbeing,Wellbeing",
    defaultTitle: "Summary of Reviewed Studies",
  },
  appendix: {
    label: "Appendix table",
    group: "other",
    description: "Any table for an appendix, numbered with the appendix letter, such as Table A1.",
    bestFor: "Supplementary results or raw summaries placed in an appendix.",
    source: "entries",
    layout: "Any table, with the column names in the first row.",
    example: "Item,Wording,Source\nSQ1,I fall asleep easily,Adapted\nSQ2,I wake feeling rested,Adapted\nSQ3,I sleep through the night,New",
    defaultTitle: "Questionnaire Items",
  },
  custom: {
    label: "Custom table",
    group: "other",
    description: "Any table you paste, formatted in your chosen style. Numbers are rounded to the decimals you choose.",
    bestFor: "Results from other software, or anything the other tables don't cover.",
    source: "entries",
    layout: "Any table, with the column names in the first row. A row with only its first cell filled starts a group.",
    example: "Group,n,M,SD\nIntervention,45,6.82,1.10\nControl,43,6.21,1.24",
    defaultTitle: "Untitled Table",
  },
};

/** Front-matter tables, which carry a heading rather than a table number, and usually no rules. */
export const UNNUMBERED_TYPES: ReadonlySet<TableType> = new Set(["table-of-contents", "list-of-tables", "list-of-figures"]);

/** Options a table type starts with when chosen: front matter without rules. */
export const typeDefaults = (type: TableType): Partial<TableOptions> => (UNNUMBERED_TYPES.has(type) ? { borders: "none" } : {});

export function getTableType(type: TableType): TableTypeInfo {
  const info = TABLE_TYPE_INFO[type];
  if (!info) throw new RangeError(`Unknown table type: ${type}`);
  return info;
}

// The table model every export draws from.

export interface TableCell {
  text: string;
  /** Numbers align by their decimal point, or as the options set. */
  numeric?: boolean;
  bold?: boolean;
  italic?: boolean;
  /** Columns the cell spans. */
  span?: number;
  /** Indent levels, for categories under a variable or sub-headings. */
  indent?: number;
  /** A filled cell in a timeline; `text` is its text alternative. */
  mark?: boolean;
  /** Letters of specific notes attached to the cell, shown as superscripts. */
  notes?: string[];
}

export type RowKind = "body" | "group" | "total";

export interface TableRow {
  kind: RowKind;
  cells: TableCell[];
}

/** A stretch of text with its formatting, for captions and notes. */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  smallCaps?: boolean;
}

/** Significance levels marked with one, two or three asterisks. */
export const STAR_LEVELS = [0.05, 0.01, 0.001] as const;
export type StarLevel = (typeof STAR_LEVELS)[number];

export interface TableNotes {
  /** General notes about the whole table, as sentences, such as “N = 200.” */
  general: string[];
  /** Notes on specific cells, marked with superscript letters. */
  specific: { mark: string; text: string }[];
  /** The significance levels marked in the table, explained in the probability note. */
  probability: StarLevel[];
}

export interface ResearchTable {
  type: TableType;
  /** The title, as the researcher wrote it or the type's default. */
  title: string;
  /** Header rows. Cells may span columns; a multi-row header groups columns under a shared heading. */
  header: TableCell[][];
  rows: TableRow[];
  /** The number of columns. */
  columns: number;
  /** Whether the first column labels each row, so it is a row header. */
  rowHeaders: boolean;
  notes: TableNotes;
}

// Options.

export const TABLE_STYLES = ["apa", "ieee", "harvard", "chicago", "mla", "custom"] as const;
export type TableStyleId = (typeof TABLE_STYLES)[number];

export const TABLE_FONTS = ["times", "arial", "calibri", "georgia", "helvetica"] as const;
export type TableFont = (typeof TABLE_FONTS)[number];

export const BORDER_STYLES = ["horizontal", "grid", "outer", "none"] as const;
export type BorderStyle = (typeof BORDER_STYLES)[number];

export const PADDINGS = ["compact", "normal", "relaxed"] as const;
export type Padding = (typeof PADDINGS)[number];

export const TEXT_ALIGNS = ["left", "center"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const NUMBER_ALIGNS = ["decimal", "right", "center"] as const;
export type NumberAlign = (typeof NUMBER_ALIGNS)[number];

export const ORIENTATIONS = ["portrait", "landscape"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const PERCENT_BASES = ["row", "column", "total", "none"] as const;
export type PercentBase = (typeof PERCENT_BASES)[number];

export const CORRELATION_METHODS = ["pearson", "spearman"] as const;
export type CorrelationMethod = (typeof CORRELATION_METHODS)[number];

export const SUPPRESS_BELOW = [0, 0.3, 0.4, 0.5] as const;

export const CAPTION_POSITIONS = ["above", "below"] as const;
export type CaptionPosition = (typeof CAPTION_POSITIONS)[number];

/** The caption format for the custom university style. */
export interface CustomStyle {
  /** The label word, such as “Table”. */
  label: string;
  /** What follows the number, such as “.” or “:”. Empty puts the title on its own line. */
  separator: string;
  position: CaptionPosition;
  labelBold: boolean;
  titleItalic: boolean;
}

export interface TableOptions {
  style: TableStyleId;
  custom: CustomStyle;
  font: TableFont;
  /** In points. */
  fontSize: number;
  borders: BorderStyle;
  padding: Padding;
  textAlign: TextAlign;
  numberAlign: NumberAlign;
  /** Decimal places for statistics. Counts, percentages and p-values follow their own conventions. */
  decimals: number;
  boldHeaders: boolean;
  alternatingRows: boolean;
  orientation: Orientation;
  /** The table's number. */
  number: number;
  /** For appendix tables: the appendix letter, such as “A”. */
  appendix: string;
  title: string;
  /** A general note, added after any the builder writes. */
  note: string;
  source: string;
  /** Specific notes, one per line; each gets the next letter. */
  footnotes: string;
  /** Repeat the header rows, and label continued parts, when the table runs onto another page. */
  repeatHeader: boolean;
  /** Mark significant correlations with asterisks. */
  stars: boolean;
  /** In regression and coefficient tables, show p as asterisks instead of a column. */
  pAsStars: boolean;
  // Options for particular tables.
  percentBase: PercentBase;
  correlation: CorrelationMethod;
  /** Factor loadings below this are left blank; 0 shows all. */
  suppressBelow: number;
  /** Item-total statistics in reliability tables. */
  itemDetails: boolean;
  /** The significance level for hypothesis decisions. */
  alpha: 0.05 | 0.01 | 0.1;
}

export const DEFAULT_TABLE_OPTIONS: TableOptions = {
  style: "apa",
  custom: { label: "Table", separator: ".", position: "above", labelBold: true, titleItalic: false },
  font: "times",
  fontSize: 12,
  borders: "horizontal",
  padding: "normal",
  textAlign: "left",
  numberAlign: "decimal",
  decimals: 2,
  boldHeaders: false,
  alternatingRows: false,
  orientation: "portrait",
  number: 1,
  appendix: "A",
  title: "",
  note: "",
  source: "",
  footnotes: "",
  repeatHeader: true,
  stars: true,
  pAsStars: false,
  percentBase: "row",
  correlation: "pearson",
  suppressBelow: 0.3,
  itemDetails: false,
  alpha: 0.05,
};
