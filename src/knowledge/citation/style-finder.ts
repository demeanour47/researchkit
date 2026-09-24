/**
 * Recommends a citation style from a writer's situation, and explains why.
 *
 * The honest core of this logic: whoever requires a style decides it. Subject
 * conventions only predict what they are likely to require, or what readers
 * expect when the writer is free to choose. Every decision adds a Reason, so
 * the result can always be explained. Wording lives with the interface.
 */

import type { StyleId } from "./styles";

export const WRITING_TYPES = ["assignment", "thesis", "journal-article", "book", "web"] as const;
export const FIELDS = [
  "psychology-social-sciences",
  "education",
  "nursing-health",
  "medicine",
  "natural-sciences",
  "engineering-computing",
  "business-economics",
  "history",
  "literature-arts",
  "law",
  "other",
] as const;
export const REQUIRERS = ["instructor", "university", "publisher", "nobody", "unknown"] as const;
export const REGIONS = [
  "us",
  "canada",
  "uk-ireland",
  "australia",
  "new-zealand",
  "europe",
  "asia",
  "africa",
  "latin-america",
  "other",
] as const;

export type WritingType = (typeof WRITING_TYPES)[number];
export type Field = (typeof FIELDS)[number];
export type Requirer = (typeof REQUIRERS)[number];
export type Region = (typeof REGIONS)[number];

export interface Answers {
  writing: WritingType;
  field: Field;
  requirer: Requirer;
  region?: Region;
}

/** How settled the recommendation is. */
export type Confidence = "strong" | "likely" | "open";

export type Reason =
  | { code: "field-standard"; field: Field; style: StyleId }
  | { code: "field-common"; field: Field; style: StyleId }
  | { code: "field-varies"; field: Field }
  | { code: "no-field" }
  | { code: "law-region"; region: Region; style: StyleId }
  | { code: "law-needs-region" }
  | { code: "law-local-guide"; region: Region }
  | { code: "region-harvard"; region: Region }
  | { code: "journal-decides" }
  | { code: "book-publisher" }
  | { code: "book-chicago" }
  | { code: "thesis-rules" }
  | { code: "web-no-standard" }
  | { code: "requirer-decides"; requirer: Exclude<Requirer, "nobody" | "unknown"> }
  | { code: "free-choice" }
  | { code: "free-choice-consistent" }
  | { code: "requirer-unknown" };

/** What to check before relying on the recommendation. */
export type FirstStep =
  | { code: "check-journal" }
  | { code: "check-publisher" }
  | { code: "check-thesis-rules" }
  | { code: "check-requirer"; requirer: "instructor" | "university" }
  | { code: "find-out" };

export interface StyleRecommendation {
  /** Null when no single style can honestly be singled out. */
  primary: StyleId | null;
  alternatives: readonly StyleId[];
  confidence: Confidence;
  firstStep: FirstStep | null;
  /** Every factor that shaped the result, in the order it was applied. */
  reasons: readonly Reason[];
}

type Strength = "standard" | "common" | "varies";

interface FieldBasis {
  primary: StyleId | null;
  alternatives: StyleId[];
  strength: Strength;
  reasons: Reason[];
}

const HARVARD_REGIONS: ReadonlySet<Region> = new Set(["uk-ireland", "australia", "new-zealand"]);

const LAW_STYLE_BY_REGION: Partial<Record<Region, StyleId>> = {
  us: "bluebook",
  canada: "mcgill",
  "uk-ireland": "oscola",
  australia: "aglc",
  "new-zealand": "nzlsg",
};

function standard(field: Field, style: StyleId, alternatives: StyleId[] = []): FieldBasis {
  return { primary: style, alternatives, strength: "standard", reasons: [{ code: "field-standard", field, style }] };
}

function common(field: Field, style: StyleId, alternatives: StyleId[]): FieldBasis {
  return { primary: style, alternatives, strength: "common", reasons: [{ code: "field-common", field, style }] };
}

function lawBasis(region: Region | undefined): FieldBasis {
  if (!region) {
    return { primary: null, alternatives: [], strength: "varies", reasons: [{ code: "law-needs-region" }] };
  }
  const style = LAW_STYLE_BY_REGION[region];
  if (!style) {
    return { primary: null, alternatives: [], strength: "varies", reasons: [{ code: "law-local-guide", region }] };
  }
  return { primary: style, alternatives: [], strength: "standard", reasons: [{ code: "law-region", region, style }] };
}

/** What the subject's conventions suggest, before the writer's situation is considered. */
function fieldBasis(field: Field, region: Region | undefined): FieldBasis {
  switch (field) {
    case "psychology-social-sciences":
    case "education":
      return standard(field, "apa");
    case "nursing-health":
      return common(field, "apa", ["vancouver"]);
    case "medicine":
      return common(field, "vancouver", ["ama"]);
    case "natural-sciences":
      return {
        primary: null,
        alternatives: ["cse", "acs", "apa", "harvard"],
        strength: "varies",
        reasons: [{ code: "field-varies", field }],
      };
    case "engineering-computing":
      return standard(field, "ieee");
    case "business-economics":
      return region && HARVARD_REGIONS.has(region)
        ? common(field, "harvard", ["apa"])
        : common(field, "apa", ["harvard"]);
    case "history":
      return standard(field, "chicago");
    case "literature-arts":
      return standard(field, "mla", ["chicago"]);
    case "law":
      return lawBasis(region);
    case "other":
      return {
        primary: null,
        alternatives: ["apa", "harvard", "mla", "chicago"],
        strength: "varies",
        reasons: [{ code: "no-field" }],
      };
  }
}

export function recommendStyle(answers: Answers): StyleRecommendation {
  const { writing, field, requirer, region } = answers;
  const basis = fieldBasis(field, region);
  const reasons: Reason[] = [...basis.reasons];
  const alternatives = [...basis.alternatives];
  let firstStep: FirstStep | null = null;

  if (
    writing === "assignment" &&
    field !== "law" &&
    region &&
    HARVARD_REGIONS.has(region) &&
    basis.primary !== "harvard" &&
    !alternatives.includes("harvard")
  ) {
    alternatives.push("harvard");
    reasons.push({ code: "region-harvard", region });
  }

  switch (writing) {
    case "journal-article":
      firstStep = { code: "check-journal" };
      reasons.push({ code: "journal-decides" });
      break;
    case "book":
      firstStep = { code: "check-publisher" };
      reasons.push({ code: "book-publisher" });
      if (basis.primary !== "chicago" && !alternatives.includes("chicago") && field !== "law") {
        alternatives.push("chicago");
        reasons.push({ code: "book-chicago" });
      }
      break;
    case "thesis":
      firstStep = { code: "check-thesis-rules" };
      reasons.push({ code: "thesis-rules" });
      break;
    case "web":
      reasons.push({ code: "web-no-standard" });
      break;
    case "assignment":
      break;
  }

  switch (requirer) {
    case "instructor":
    case "university":
      firstStep ??= { code: "check-requirer", requirer };
      reasons.push({ code: "requirer-decides", requirer });
      break;
    case "publisher":
      firstStep ??= { code: "check-publisher" };
      reasons.push({ code: "requirer-decides", requirer });
      break;
    case "nobody":
      reasons.push({ code: basis.primary ? "free-choice" : "free-choice-consistent" });
      break;
    case "unknown":
      firstStep ??= { code: "find-out" };
      reasons.push({ code: "requirer-unknown" });
      break;
  }

  return {
    primary: basis.primary,
    alternatives: [...new Set(alternatives)].filter((style) => style !== basis.primary),
    confidence: confidenceOf(basis, firstStep, writing),
    firstStep,
    reasons,
  };
}

/**
 * Strong only when the subject has a clear standard and nothing outranks it:
 * no one else decides the style, and the writing is formal academic work.
 */
function confidenceOf(basis: FieldBasis, firstStep: FirstStep | null, writing: WritingType): Confidence {
  if (basis.primary === null || basis.strength === "varies") return "open";
  if (basis.strength === "standard" && firstStep === null && writing !== "web") return "strong";
  return "likely";
}

type RawParams = Record<string, string | string[] | undefined>;

export interface ParsedAnswers {
  /** Complete, valid answers, or null if any required answer is missing or invalid. */
  answers: Answers | null;
  /** Required questions without a valid answer. Empty when nothing was submitted. */
  missing: ReadonlyArray<"writing" | "field" | "requirer">;
  submitted: boolean;
}

function pick<T extends string>(options: readonly T[], raw: string | string[] | undefined): T | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return options.find((option) => option === value);
}

/** Reads answers from untrusted input such as URL search parameters. Unknown values are ignored. */
export function parseAnswers(params: RawParams): ParsedAnswers {
  const submitted = ["writing", "field", "requirer", "region"].some((key) => params[key] !== undefined);
  const writing = pick(WRITING_TYPES, params.writing);
  const field = pick(FIELDS, params.field);
  const requirer = pick(REQUIRERS, params.requirer);
  const region = pick(REGIONS, params.region);

  if (writing && field && requirer) {
    return { answers: { writing, field, requirer, region }, missing: [], submitted };
  }

  const missing = submitted
    ? (["writing", "field", "requirer"] as const).filter(
        (key) => !{ writing, field, requirer }[key],
      )
    : [];
  return { answers: null, missing, submitted };
}
