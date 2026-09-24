/**
 * Comparing designs side by side, exporting the comparison, and the project draft
 * update, which changes only the draft's `researchDesign` section.
 */

import { getDesign, type DesignId, type ResearchDesign } from "./design-types";
import type { ResearchDesignRecord } from "./research-design";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";

export const COMPARISON_ASPECTS = [
  { id: "purpose", label: "Purpose", value: (design: ResearchDesign) => design.purpose },
  { id: "data", label: "Data collection", value: (design: ResearchDesign) => design.typicalData.join("; ") },
  { id: "analysis", label: "Data analysis", value: (design: ResearchDesign) => design.analysisMethods.join("; ") },
  { id: "strengths", label: "Strengths", value: (design: ResearchDesign) => design.strengths.join(" ") },
  { id: "limitations", label: "Limitations", value: (design: ResearchDesign) => design.limitations.join(" ") },
  { id: "sample", label: "Typical sample", value: (design: ResearchDesign) => design.typicalSample },
  { id: "time", label: "Time requirement", value: (design: ResearchDesign) => design.timeRequirement },
  { id: "resources", label: "Resource requirement", value: (design: ResearchDesign) => design.resourceRequirement },
  { id: "use", label: "Common academic use", value: (design: ResearchDesign) => design.commonUse },
] as const;

export interface ComparisonRow {
  aspect: (typeof COMPARISON_ASPECTS)[number]["id"];
  label: string;
  /** One value per design, in the order the designs were given. */
  values: string[];
}

export interface Comparison {
  designs: { id: DesignId; name: string }[];
  rows: ComparisonRow[];
}

/** The designs side by side, one row per aspect. Designs keep the order given; repeats are removed. */
export function compareDesigns(ids: readonly DesignId[]): Comparison {
  const designs = [...new Set(ids)].map(getDesign);
  return {
    designs: designs.map((design) => ({ id: design.id, name: design.name })),
    rows: COMPARISON_ASPECTS.map((aspect) => ({ aspect: aspect.id, label: aspect.label, values: designs.map(aspect.value) })),
  };
}

/** The comparison as tab-separated text, which pastes as a table into word processors and spreadsheets. */
export function comparisonTable(ids: readonly DesignId[]): string {
  const comparison = compareDesigns(ids);
  const clean = (text: string) => text.replace(/[\t\n\r]+/g, " ");
  return [
    ["Aspect", ...comparison.designs.map((design) => design.name)].map(clean).join("\t"),
    ...comparison.rows.map((row) => [row.label, ...row.values].map(clean).join("\t")),
  ].join("\n");
}

/** The project draft with its research design replaced. No other field changes. */
export function applyDesign(project: ResearchProjectDraft, record: ResearchDesignRecord): ResearchProjectDraft {
  return updateProjectDraft(project, { researchDesign: record });
}

/** Everything the Research Design Builder can't do, stated on the page. */
export const DESIGN_LIMITATIONS: readonly string[] = [
  "It never chooses a design for you. Suggestions narrow the explanations; the decision, and its justification, are yours.",
  "Compatibility checks compare your project's wording and choices with typical practice. They can't judge whether a design is feasible, ethical or acceptable in your discipline.",
  "Matching objectives and questions to designs relies on common wording, so an objective phrased differently may not be recognised.",
  "Design descriptions summarise common practice. Methodology texts define some designs differently, and terms such as “concurrent” and “convergent” mixed methods vary between authors.",
  "Nothing is saved. Your choices are lost when you leave the page.",
];

/** Content awaiting review before launch. */
export const DESIGN_REVIEW_ITEMS: readonly string[] = [
  "Academic review: the definitions, purposes, strengths and limitations of each design.",
  "Methodology review: the typical research onion choices, variable needs and question types matched to each design, and the decision assistant's traits.",
  "Design examples: each design's example studies, sample, time and resource descriptions.",
  "References: each design needs references from the methodology literature. None have been added yet.",
];
