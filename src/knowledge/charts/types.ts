/**
 * The charts the Research Chart Builder draws, the shape of data each needs, and the
 * options that style them. Example data is fictional and exists only to show the shape.
 */

export const CHART_TYPES = [
  "bar",
  "grouped-bar",
  "stacked-bar",
  "stacked-bar-100",
  "horizontal-bar",
  "pie",
  "doughnut",
  "line",
  "multi-line",
  "area",
  "histogram",
  "frequency-polygon",
  "scatter",
  "bubble",
  "box-plot",
  "radar",
  "pareto",
  "population-pyramid",
  "likert",
  "mean-comparison",
  "error-bar",
] as const;
export type ChartType = (typeof CHART_TYPES)[number];

/**
 * How the table must be laid out:
 * - category-value: a column of categories, then one column of numbers.
 * - category-series: a column of categories, then one or more columns of numbers, one per series.
 * - values: one or more columns of raw numeric observations.
 * - xy: two numeric columns, x then y, optionally after a column of point labels.
 * - xyz: three numeric columns: x, y and size.
 * - two-sides: a column of categories, then exactly two numeric columns, left and right.
 * - likert: a column of items, then one count column per response level, from most negative to most positive.
 * - mean-error: a column of groups, a column of means, then an optional column of error margins.
 */
export type DataShape = "category-value" | "category-series" | "values" | "xy" | "xyz" | "two-sides" | "likert" | "mean-error";

export interface ChartTypeInfo {
  label: string;
  description: string;
  /** What the chart is for, in one sentence. */
  bestFor: string;
  shape: DataShape;
  /** How to lay out the table, in one sentence. */
  layout: string;
  /** Fictional example data in CSV, to show the layout. */
  example: string;
  /** Whether rows can be sorted by value; false when their order carries meaning. */
  sortable: boolean;
}

export const CHART_TYPE_INFO: Readonly<Record<ChartType, ChartTypeInfo>> = {
  bar: {
    label: "Bar chart",
    description: "Vertical bars, one per category.",
    bestFor: "Comparing counts or values across categories.",
    shape: "category-value",
    layout: "First column: categories. Second column: numbers.",
    example: "Faculty,Participants\nArts,24\nBusiness,41\nEngineering,36\nScience,48\nLaw,15",
    sortable: true,
  },
  "grouped-bar": {
    label: "Grouped bar chart",
    description: "Bars side by side for each category, one bar per group.",
    bestFor: "Comparing several groups within each category.",
    shape: "category-series",
    layout: "First column: categories. Each further column: one group's numbers.",
    example: "Year of study,Female,Male\nFirst,34,28\nSecond,29,31\nThird,22,25\nFourth,18,16",
    sortable: true,
  },
  "stacked-bar": {
    label: "Stacked bar chart",
    description: "Bars made of stacked parts, one part per group.",
    bestFor: "Showing totals and how they divide into parts.",
    shape: "category-series",
    layout: "First column: categories. Each further column: one part's numbers.",
    example: "Faculty,Undergraduate,Postgraduate\nArts,18,6\nBusiness,30,11\nEngineering,25,11\nScience,33,15",
    sortable: true,
  },
  "stacked-bar-100": {
    label: "100% stacked bar chart",
    description: "Bars of equal height, each divided into the percentage in each part.",
    bestFor: "Comparing how categories divide into parts, whatever their totals.",
    shape: "category-series",
    layout: "First column: categories. Each further column: one part's numbers; each row is turned into percentages.",
    example: "Faculty,Yes,No,Unsure\nArts,12,8,4\nBusiness,25,10,6\nEngineering,20,12,4\nScience,30,12,6",
    sortable: true,
  },
  "horizontal-bar": {
    label: "Horizontal bar chart",
    description: "Horizontal bars, one per category.",
    bestFor: "Comparing categories with long names, or many categories.",
    shape: "category-value",
    layout: "First column: categories. Second column: numbers.",
    example: "Reason for choosing the course,Students\nCareer prospects,52\nInterest in the subject,47\nFamily advice,21\nReputation of the university,33\nLocation,18",
    sortable: true,
  },
  pie: {
    label: "Pie chart",
    description: "A circle divided into slices showing each part's share of the whole.",
    bestFor: "Showing a whole divided into a few parts (six or fewer).",
    shape: "category-value",
    layout: "First column: parts. Second column: numbers, all zero or more.",
    example: "Mode of study,Students\nFull-time,68\nPart-time,24\nDistance,8",
    sortable: true,
  },
  doughnut: {
    label: "Doughnut chart",
    description: "A pie chart with a hollow centre.",
    bestFor: "Showing a whole divided into a few parts (six or fewer).",
    shape: "category-value",
    layout: "First column: parts. Second column: numbers, all zero or more.",
    example: "Accommodation,Students\nUniversity halls,45\nPrivate rental,32\nFamily home,23",
    sortable: true,
  },
  line: {
    label: "Line graph",
    description: "Points joined by a line, in order.",
    bestFor: "Showing change over time or another ordered sequence.",
    shape: "category-value",
    layout: "First column: times or ordered steps. Second column: numbers.",
    example: "Week,Mean hours of sleep\n1,7.2\n2,7.0\n3,6.8\n4,6.5\n5,6.6\n6,6.9",
    sortable: false,
  },
  "multi-line": {
    label: "Multiple line graph",
    description: "Several lines on the same axes, one per group.",
    bestFor: "Comparing change over time between groups.",
    shape: "category-series",
    layout: "First column: times or ordered steps. Each further column: one group's numbers.",
    example: "Week,Intervention,Control\n1,7.1,7.2\n2,7.3,7.0\n3,7.6,6.9\n4,7.8,6.8",
    sortable: false,
  },
  area: {
    label: "Area chart",
    description: "A line graph with the area below each line shaded.",
    bestFor: "Showing how a quantity accumulates or changes over time.",
    shape: "category-series",
    layout: "First column: times or ordered steps. Each further column: one series' numbers.",
    example: "Month,Responses\nJan,40\nFeb,85\nMar,130\nApr,160\nMay,172",
    sortable: false,
  },
  histogram: {
    label: "Histogram",
    description: "Touching bars showing how many values fall in each interval.",
    bestFor: "Showing the distribution of one numeric variable.",
    shape: "values",
    layout: "One column of raw numeric values, one per participant.",
    example: "Age\n18\n19\n19\n20\n20\n20\n21\n21\n22\n22\n23\n24\n25\n27\n31",
    sortable: false,
  },
  "frequency-polygon": {
    label: "Frequency polygon",
    description: "A line joining the midpoints of a histogram's intervals.",
    bestFor: "Showing a distribution's shape, or comparing it with another.",
    shape: "values",
    layout: "One column of raw numeric values, one per participant.",
    example: "Score\n52\n58\n61\n63\n64\n66\n68\n69\n70\n72\n74\n75\n78\n81\n88",
    sortable: false,
  },
  scatter: {
    label: "Scatter plot",
    description: "One point per participant, placed by two numeric variables.",
    bestFor: "Showing the relationship between two numeric variables.",
    shape: "xy",
    layout: "Two numeric columns: x, then y. An optional first column labels the points.",
    example: "Screen time (hours),Sleep quality\n1.5,8.1\n2.0,7.6\n2.5,7.9\n3.0,7.0\n3.5,6.8\n4.0,6.9\n4.5,6.1\n5.0,5.8\n6.0,5.5",
    sortable: false,
  },
  bubble: {
    label: "Bubble chart",
    description: "A scatter plot whose point sizes show a third variable.",
    bestFor: "Showing how three numeric variables relate.",
    shape: "xyz",
    layout: "Three numeric columns: x, y, then size (zero or more).",
    example: "Study hours,Grade,Class size\n5,58,20\n8,64,35\n10,70,25\n12,72,40\n15,80,30",
    sortable: false,
  },
  "box-plot": {
    label: "Box plot",
    description: "Boxes showing the median, quartiles and range of each group.",
    bestFor: "Comparing distributions between groups, including outliers.",
    shape: "values",
    layout: "One column of raw numeric values per group, with the group names as headers.",
    example: "Group A,Group B\n52,61\n55,64\n58,66\n60,67\n61,70\n63,72\n65,74\n68,75\n70,79\n92,81",
    sortable: false,
  },
  radar: {
    label: "Radar chart",
    description: "Values on axes arranged in a circle, joined into a shape.",
    bestFor: "Comparing profiles across several dimensions measured on the same scale.",
    shape: "category-series",
    layout: "First column: dimensions (three or more). Each further column: one profile's numbers.",
    example: "Skill,Before,After\nWriting,3.1,3.8\nAnalysis,2.8,3.6\nPresenting,3.4,3.9\nTeamwork,3.9,4.1\nResearch,2.6,3.5",
    sortable: false,
  },
  pareto: {
    label: "Pareto chart",
    description: "Bars in descending order with a line showing the cumulative percentage.",
    bestFor: "Showing which few causes account for most of the total.",
    shape: "category-value",
    layout: "First column: causes or categories. Second column: counts, zero or more.",
    example: "Reason for missing classes,Students\nWork commitments,48\nTransport,22\nIllness,15\nCaring duties,9\nOther,6",
    sortable: false,
  },
  "population-pyramid": {
    label: "Population pyramid",
    description: "Back-to-back horizontal bars comparing two groups across ordered categories.",
    bestFor: "Comparing the age (or other ordered) structure of two groups.",
    shape: "two-sides",
    layout: "First column: ordered categories, youngest first. Then two numeric columns: left group, right group.",
    example: "Age group,Female,Male\n18–24,42,38\n25–34,31,29\n35–44,18,21\n45–54,9,11\n55+,5,4",
    sortable: false,
  },
  likert: {
    label: "Likert scale chart",
    description: "Diverging bars centred on the neutral point, showing agreement for each item.",
    bestFor: "Showing responses to rating-scale items at a glance.",
    shape: "likert",
    layout: "First column: items. Then one count column per response level, from most negative to most positive.",
    example:
      "Item,Strongly disagree,Disagree,Neutral,Agree,Strongly agree\nI feel prepared for exams,4,10,18,40,28\nI understand the marking criteria,6,14,20,38,22\nI get useful feedback,12,22,26,28,12",
    sortable: false,
  },
  "mean-comparison": {
    label: "Mean comparison chart",
    description: "Bars at each group's mean, with optional error bars.",
    bestFor: "Comparing group means, as tested by a t-test or ANOVA.",
    shape: "mean-error",
    layout: "First column: groups. Second column: means. Optional third column: error margins, such as standard errors.",
    example: "Group,Mean anxiety,Standard error\nControl,3.4,0.21\nMindfulness,2.7,0.18\nExercise,2.9,0.20",
    sortable: true,
  },
  "error-bar": {
    label: "Error bar chart",
    description: "Points at each group's value with bars showing the margin of error.",
    bestFor: "Showing estimates with their uncertainty, such as means with 95% confidence intervals.",
    shape: "mean-error",
    layout: "First column: groups. Second column: values. Third column: error margins.",
    example: "Time point,Mean score,95% CI margin\nBaseline,62.4,3.1\nWeek 4,66.8,2.9\nWeek 8,70.1,3.3",
    sortable: false,
  },
};

export const PALETTES = ["standard", "blues", "grayscale"] as const;
export type PaletteId = (typeof PALETTES)[number];

/** Style presets: standard, or following APA or IEEE figure conventions. */
export const STYLE_PRESETS = ["standard", "apa", "ieee"] as const;
export type StylePreset = (typeof STYLE_PRESETS)[number];

export const SORT_ORDERS = ["none", "ascending", "descending"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const LABEL_ROTATIONS = [0, 45, 90] as const;
export type LabelRotation = (typeof LABEL_ROTATIONS)[number];

export interface ChartOptions {
  type: ChartType;
  title: string;
  subtitle: string;
  xTitle: string;
  yTitle: string;
  /** Whether to show the legend: automatically for two or more series, always, or never. */
  legend: "auto" | "show" | "hide";
  /** Base font size in points. */
  fontSize: number;
  palette: PaletteId;
  style: StylePreset;
  dataLabels: boolean;
  /** Label values as percentages of their total, where that makes sense. */
  percentages: boolean;
  gridlines: boolean;
  /** Decimal places on axis ticks, or null to follow the tick step. */
  axisDecimals: number | null;
  /** Decimal places in data labels, or null to follow the data (up to two). */
  labelDecimals: number | null;
  rotateLabels: LabelRotation;
  sort: SortOrder;
  /** Size in pixels at 96 per inch. */
  width: number;
  height: number;
}

export const DEFAULT_OPTIONS: ChartOptions = {
  type: "bar",
  title: "",
  subtitle: "",
  xTitle: "",
  yTitle: "",
  legend: "auto",
  fontSize: 11,
  palette: "standard",
  style: "standard",
  dataLabels: false,
  percentages: false,
  gridlines: true,
  axisDecimals: null,
  labelDecimals: null,
  rotateLabels: 0,
  sort: "none",
  // 600 × 400 pixels is 6.25 × 4.17 inches: close to a page's text width, so pasted text stays near its set size.
  width: 600,
  height: 400,
};

/**
 * Figure sizes at 96 pixels per inch. A page's text width is about 6.5 inches; a journal
 * column in two-column layouts, such as IEEE's, is about 3.5 inches. Drawing at the size
 * the figure will be printed keeps text at its chosen point size.
 */
export const FIGURE_SIZES = [
  { id: "page", label: "Page width (6.25 × 4.17 in)", width: 600, height: 400 },
  { id: "column", label: "Journal column (3.5 × 2.63 in)", width: 336, height: 252 },
  { id: "wide", label: "Wide, for slides (8.33 × 4.69 in)", width: 800, height: 450 },
] as const;
export type FigureSizeId = (typeof FIGURE_SIZES)[number]["id"];

export function getChartType(type: ChartType): ChartTypeInfo {
  const info = CHART_TYPE_INFO[type];
  if (!info) throw new RangeError(`Unknown chart type: ${type}`);
  return info;
}
