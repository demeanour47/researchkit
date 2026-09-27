/**
 * The literature matrix: one row per study, one column per detail a review compares.
 * Every value is text as the researcher wrote it; nothing is invented or filled in.
 * Beside the details, each study carries the researcher's own organisation: a colour
 * tag, a favourite mark, a reading status and a priority.
 */

export const MATRIX_FIELDS = [
  "authors",
  "year",
  "title",
  "journal",
  "publisher",
  "doi",
  "country",
  "context",
  "problem",
  "objectives",
  "design",
  "philosophy",
  "approach",
  "theory",
  "sampling",
  "sampleSize",
  "dataCollection",
  "analysis",
  "variables",
  "independent",
  "dependent",
  "mediator",
  "moderator",
  "findings",
  "gap",
  "limitations",
  "recommendations",
  "contribution",
  "notes",
  "reflection",
] as const;
export type MatrixField = (typeof MATRIX_FIELDS)[number];

export const FIELD_GROUPS = ["source", "context", "method", "variables", "findings", "reflection"] as const;
export type FieldGroup = (typeof FIELD_GROUPS)[number];

export const FIELD_GROUP_LABELS: Readonly<Record<FieldGroup, string>> = {
  source: "Source",
  context: "Context and aims",
  method: "Methodology",
  variables: "Variables",
  findings: "Findings and gaps",
  reflection: "Your notes",
};

export interface FieldInfo {
  label: string;
  group: FieldGroup;
  /** How the value is read: free text, a year, a whole number, a DOI, or a list separated by semicolons. */
  kind: "text" | "year" | "number" | "doi" | "list";
  /** Longer answers get a text area. */
  multiline: boolean;
  hint: string;
}

export const FIELD_INFO: Readonly<Record<MatrixField, FieldInfo>> = {
  authors: { label: "Author(s)", group: "source", kind: "text", multiline: false, hint: "Surnames and initials, separated by semicolons, such as “Smith, J.; Lee, K.”." },
  year: { label: "Year", group: "source", kind: "year", multiline: false, hint: "The year of publication, such as 2023." },
  title: { label: "Title", group: "source", kind: "text", multiline: false, hint: "The study's title, to tell studies by the same authors apart." },
  journal: { label: "Journal", group: "source", kind: "text", multiline: false, hint: "The journal, or the book or conference for other sources." },
  publisher: { label: "Publisher", group: "source", kind: "text", multiline: false, hint: "The publisher, such as Elsevier or SAGE." },
  doi: { label: "DOI", group: "source", kind: "doi", multiline: false, hint: "Such as 10.1177/0013189X17739591, or its https://doi.org/ address." },
  country: { label: "Country", group: "context", kind: "list", multiline: false, hint: "Where the study took place. Separate several with semicolons." },
  context: { label: "Research context", group: "context", kind: "text", multiline: true, hint: "The setting, population or sector studied." },
  problem: { label: "Research problem", group: "context", kind: "text", multiline: true, hint: "The problem the study addresses." },
  objectives: { label: "Research objectives", group: "context", kind: "text", multiline: true, hint: "What the study set out to do." },
  design: { label: "Research design", group: "method", kind: "list", multiline: false, hint: "Such as survey, experiment, case study or cross-sectional." },
  philosophy: { label: "Research philosophy", group: "method", kind: "list", multiline: false, hint: "Such as positivism or interpretivism, if the study states it." },
  approach: { label: "Research approach", group: "method", kind: "list", multiline: false, hint: "Deductive, inductive or abductive; or quantitative, qualitative or mixed." },
  theory: { label: "Theory or framework", group: "method", kind: "list", multiline: false, hint: "The theories or models the study uses, separated by semicolons." },
  sampling: { label: "Sampling technique", group: "method", kind: "list", multiline: false, hint: "Such as convenience, purposive or stratified random sampling." },
  sampleSize: { label: "Sample size", group: "method", kind: "number", multiline: false, hint: "The number of participants or cases analysed." },
  dataCollection: { label: "Data collection method", group: "method", kind: "list", multiline: false, hint: "Such as questionnaire, interviews or secondary data." },
  analysis: { label: "Analysis technique", group: "method", kind: "list", multiline: false, hint: "Such as regression, SEM or thematic analysis, separated by semicolons." },
  variables: { label: "Variables", group: "variables", kind: "list", multiline: false, hint: "Every variable or concept studied, separated by semicolons." },
  independent: { label: "Independent variables", group: "variables", kind: "list", multiline: false, hint: "Predictors or causes, separated by semicolons." },
  dependent: { label: "Dependent variables", group: "variables", kind: "list", multiline: false, hint: "Outcomes, separated by semicolons." },
  mediator: { label: "Mediator", group: "variables", kind: "list", multiline: false, hint: "Variables that carry an effect from predictor to outcome." },
  moderator: { label: "Moderator", group: "variables", kind: "list", multiline: false, hint: "Variables that change the strength of a relationship." },
  findings: { label: "Major findings", group: "findings", kind: "text", multiline: true, hint: "The main results, in your words." },
  gap: { label: "Research gap", group: "findings", kind: "text", multiline: true, hint: "The gap the study addresses or says remains." },
  limitations: { label: "Limitations", group: "findings", kind: "text", multiline: true, hint: "Limitations the authors state, or you notice." },
  recommendations: { label: "Future recommendations", group: "findings", kind: "text", multiline: true, hint: "What the authors suggest future research should do." },
  contribution: { label: "Key contribution", group: "findings", kind: "text", multiline: true, hint: "What the study adds to knowledge or practice." },
  notes: { label: "Notes", group: "reflection", kind: "text", multiline: true, hint: "Anything else worth keeping, such as quotations with page numbers." },
  reflection: { label: "Researcher's critical reflection", group: "reflection", kind: "text", multiline: true, hint: "Your own evaluation: strengths, weaknesses and relevance to your study." },
};

export type StudyFields = Readonly<Record<MatrixField, string>>;

export const EMPTY_FIELDS: StudyFields = Object.fromEntries(MATRIX_FIELDS.map((field) => [field, ""])) as Record<MatrixField, string>;

// The researcher's own organisation of the studies.

export const READING_STATUSES = ["to-read", "reading", "read", "reviewed"] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];
export const READING_STATUS_LABELS: Readonly<Record<ReadingStatus, string>> = { "to-read": "To read", reading: "Reading", read: "Read", reviewed: "Reviewed" };

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABELS: Readonly<Record<Priority, string>> = { high: "High", medium: "Medium", low: "Low" };

/** Colour tags. Each has a name, shown beside its colour, so a tag never depends on colour alone. */
export const COLOUR_TAGS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export type ColourTag = (typeof COLOUR_TAGS)[number];
export const COLOUR_TAG_LABELS: Readonly<Record<ColourTag, string>> = { red: "Red", orange: "Orange", yellow: "Yellow", green: "Green", blue: "Blue", purple: "Purple" };

export interface Study {
  id: string;
  fields: StudyFields;
  tag: ColourTag | null;
  favourite: boolean;
  status: ReadingStatus;
  priority: Priority | null;
}

export type Matrix = readonly Study[];

/** Named sets of columns, so a wide matrix can be read a part at a time. */
export const COLUMN_PRESETS = {
  essentials: ["authors", "year", "title", "country", "design", "sampleSize", "findings", "gap"],
  methods: ["authors", "year", "design", "philosophy", "approach", "theory", "sampling", "sampleSize", "dataCollection", "analysis"],
  variables: ["authors", "year", "variables", "independent", "dependent", "mediator", "moderator", "findings"],
  gaps: ["authors", "year", "findings", "gap", "limitations", "recommendations", "contribution", "reflection"],
  all: [...MATRIX_FIELDS],
} as const satisfies Readonly<Record<string, readonly MatrixField[]>>;
export type ColumnPreset = keyof typeof COLUMN_PRESETS;
export const COLUMN_PRESET_LABELS: Readonly<Record<ColumnPreset, string>> = { essentials: "Essentials", methods: "Methods", variables: "Variables", gaps: "Findings and gaps", all: "All columns" };

export function getField(field: MatrixField): FieldInfo {
  const info = FIELD_INFO[field];
  if (!info) throw new RangeError(`Unknown matrix column: ${field}`);
  return info;
}
