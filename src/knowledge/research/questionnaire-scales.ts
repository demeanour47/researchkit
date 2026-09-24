/**
 * Rating scales for questionnaire items: the common presets, custom labels, numeric
 * mappings, direction and reverse scoring. Labels are the conventional wordings for
 * each family; their sources are awaiting academic review, so every scale's
 * references are empty until then.
 */

export const SCALE_PRESET_IDS = [
  "agreement-3",
  "agreement-5",
  "agreement-7",
  "rating-10",
  "frequency-5",
  "importance-5",
  "satisfaction-5",
  "confidence-5",
  "probability-5",
  "semantic-differential-7",
  "custom",
] as const;
export type ScalePresetId = (typeof SCALE_PRESET_IDS)[number];

export interface ScalePreset {
  id: ScalePresetId;
  name: string;
  family: "Agreement" | "Frequency" | "Importance" | "Satisfaction" | "Confidence" | "Probability" | "Rating" | "Semantic differential" | "Custom";
  labels: readonly string[];
  /** Words for the two ends, for scales whose points are numbers. */
  anchors: readonly [string, string] | null;
  description: string;
}

const numbers = (count: number) => Array.from({ length: count }, (_, index) => String(index + 1));

export const SCALE_PRESETS: Readonly<Record<ScalePresetId, ScalePreset>> = {
  "agreement-3": { id: "agreement-3", name: "Agreement, 3-point", family: "Agreement", labels: ["Disagree", "Neither agree nor disagree", "Agree"], anchors: null, description: "Agreement with a statement, with a neutral middle point." },
  "agreement-5": {
    id: "agreement-5",
    name: "Agreement, 5-point",
    family: "Agreement",
    labels: ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"],
    anchors: null,
    description: "The most common Likert-type format: agreement with a statement.",
  },
  "agreement-7": {
    id: "agreement-7",
    name: "Agreement, 7-point",
    family: "Agreement",
    labels: ["Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"],
    anchors: null,
    description: "Agreement with finer steps between the ends.",
  },
  "rating-10": { id: "rating-10", name: "Rating, 10-point", family: "Rating", labels: numbers(10), anchors: ["[lowest point]", "[highest point]"], description: "Numbered points from 1 to 10, with words for the two ends." },
  "frequency-5": { id: "frequency-5", name: "Frequency, 5-point", family: "Frequency", labels: ["Never", "Rarely", "Sometimes", "Often", "Always"], anchors: null, description: "How often something happens." },
  "importance-5": {
    id: "importance-5",
    name: "Importance, 5-point",
    family: "Importance",
    labels: ["Not at all important", "Slightly important", "Moderately important", "Very important", "Extremely important"],
    anchors: null,
    description: "How important something is.",
  },
  "satisfaction-5": {
    id: "satisfaction-5",
    name: "Satisfaction, 5-point",
    family: "Satisfaction",
    labels: ["Very dissatisfied", "Dissatisfied", "Neither satisfied nor dissatisfied", "Satisfied", "Very satisfied"],
    anchors: null,
    description: "How satisfied someone is.",
  },
  "confidence-5": {
    id: "confidence-5",
    name: "Confidence, 5-point",
    family: "Confidence",
    labels: ["Not at all confident", "Slightly confident", "Moderately confident", "Very confident", "Completely confident"],
    anchors: null,
    description: "How confident someone is.",
  },
  "probability-5": {
    id: "probability-5",
    name: "Probability, 5-point",
    family: "Probability",
    labels: ["Very unlikely", "Unlikely", "Neither likely nor unlikely", "Likely", "Very likely"],
    anchors: null,
    description: "How likely something is.",
  },
  "semantic-differential-7": {
    id: "semantic-differential-7",
    name: "Semantic differential, 7-point",
    family: "Semantic differential",
    labels: numbers(7),
    anchors: ["[word at one end]", "[opposite word]"],
    description: "Seven points between two opposite words, such as a pair of adjectives.",
  },
  custom: { id: "custom", name: "Custom labels", family: "Custom", labels: ["[label 1]", "[label 2]", "[label 3]"], anchors: null, description: "Your own labels, one per point." },
};

export interface QuestionScale {
  preset: ScalePresetId;
  /** One label per point, in the order shown to respondents. */
  labels: readonly string[];
  /** The number recorded for each label, in the same order. */
  values: readonly number[];
  anchors: readonly [string, string] | null;
  /** Whether values rise or fall from the first label to the last. */
  direction: "ascending" | "descending";
  /** Whether the item is worded in the opposite direction, so its scores are reversed in analysis. */
  reverseScored: boolean;
  /** Reference ids, empty until academic review. */
  references: readonly string[];
}

const valuesFor = (count: number, start: number, direction: QuestionScale["direction"]) =>
  Array.from({ length: count }, (_, index) => (direction === "ascending" ? start + index : start + count - 1 - index));

/** A scale from a preset, numbered from 1 upwards. */
export function createScale(preset: ScalePresetId): QuestionScale {
  const source = SCALE_PRESETS[preset];
  if (!source) throw new RangeError(`Unknown scale: ${preset}`);
  return { preset, labels: [...source.labels], values: valuesFor(source.labels.length, 1, "ascending"), anchors: source.anchors, direction: "ascending", reverseScored: false, references: [] };
}

const lowest = (scale: QuestionScale) => Math.min(...scale.values);

/** Replaces the labels, which makes the scale custom. Values are renumbered to match. */
export function setScaleLabels(scale: QuestionScale, labels: readonly string[]): QuestionScale {
  const cleaned = labels.map((label) => label.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (cleaned.length < 2) throw new RangeError("A scale needs at least two labels.");
  const start = scale.values.length > 0 ? lowest(scale) : 1;
  return { ...scale, preset: "custom", labels: cleaned, values: valuesFor(cleaned.length, start, scale.direction) };
}

/** Sets which number the lowest point records, such as 0 or 1. */
export function setScaleStart(scale: QuestionScale, start: number): QuestionScale {
  if (!Number.isInteger(start)) throw new RangeError("A scale starts at a whole number.");
  return { ...scale, values: valuesFor(scale.labels.length, start, scale.direction) };
}

/** Numbers the labels upwards or downwards from the first label to the last. */
export function setScaleDirection(scale: QuestionScale, direction: QuestionScale["direction"]): QuestionScale {
  return { ...scale, direction, values: valuesFor(scale.labels.length, lowest(scale), direction) };
}

export const setReverseScored = (scale: QuestionScale, reverseScored: boolean): QuestionScale => ({ ...scale, reverseScored });

export function setScaleAnchors(scale: QuestionScale, anchors: readonly [string, string] | null): QuestionScale {
  return { ...scale, anchors: anchors ? [anchors[0].trim(), anchors[1].trim()] : null };
}

/**
 * The score recorded for the label at a position, after reverse scoring: a reversed
 * item scores (lowest + highest − value), so its high end matches the other items'.
 */
export function scoreFor(scale: QuestionScale, index: number): number {
  const value = scale.values[index];
  if (value === undefined) throw new RangeError(`No point ${index + 1} on this scale.`);
  return scale.reverseScored ? Math.min(...scale.values) + Math.max(...scale.values) - value : value;
}

/** Labels as shown on the page, with any end words added to the first and last point. */
export function displayLabels(scale: QuestionScale): string[] {
  if (!scale.anchors) return [...scale.labels];
  return scale.labels.map((label, index) => (index === 0 ? `${label} ${scale.anchors![0]}` : index === scale.labels.length - 1 ? `${label} ${scale.anchors![1]}` : label));
}

/** The numeric coding, such as “Strongly disagree = 1, …”, for codebooks and exports. */
export function scaleCoding(scale: QuestionScale): string {
  const coding = scale.labels.map((label, index) => `${label} = ${scale.values[index]}`).join("; ");
  return scale.reverseScored ? `${coding} (reverse-scored)` : coding;
}

/** Problems that make a scale unusable or unclear, each as a sentence. Empty when the scale is sound. */
export function scaleProblems(scale: QuestionScale): string[] {
  const problems: string[] = [];
  if (scale.labels.length < 2) problems.push("The scale needs at least two labels.");
  if (scale.labels.some((label) => !label.trim())) problems.push("Every point needs a label.");
  const lower = scale.labels.map((label) => label.trim().toLowerCase());
  if (new Set(lower).size !== lower.length) problems.push("Two points have the same label.");
  if (scale.values.length !== scale.labels.length) problems.push("Every label needs exactly one number.");
  else {
    const rising = scale.values.every((value, index) => index === 0 || value > scale.values[index - 1]);
    const falling = scale.values.every((value, index) => index === 0 || value < scale.values[index - 1]);
    if (!rising && !falling) problems.push("The numbers should rise or fall steadily from one end to the other.");
    else if ((scale.direction === "ascending" && !rising) || (scale.direction === "descending" && !falling)) problems.push("The numbers run the opposite way to the scale's stated direction.");
  }
  if (scale.anchors && scale.anchors.some((anchor) => !anchor.trim())) problems.push("Both ends need words.");
  if (scale.labels.some((label) => /^\[.*\]$/.test(label.trim())) || scale.anchors?.some((anchor) => /^\[.*\]$/.test(anchor.trim()))) problems.push("Some labels are still placeholders.");
  return problems;
}

/** A short description of a scale's shape, for comparing the scales of related questions. */
export const scaleSignature = (scale: QuestionScale) => `${scale.labels.length}:${scale.labels.map((label) => label.trim().toLowerCase()).join("|")}`;
