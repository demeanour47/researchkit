/**
 * The shape of a guide. Guides are content, written as data so the words stay
 * separate from layout and every guide renders with the same structure.
 */

import type { AnalysisMethodId } from "@/knowledge/research/data-analysis-types";
import type { FigureId, FormulaId, ProfiledTest, StructureDiagramId, WorkedExampleId } from "@/knowledge/research/test-finder";
import type { ProfiledStyleId } from "./style-profile";

export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: readonly string[] }
  /** Styles described from their shared profiles, with facts from the knowledge layer. */
  | { type: "styles"; styles: readonly ProfiledStyleId[] }
  /** Works cited, by their ids in the knowledge layer's reference registry, shown in APA style. */
  | { type: "references"; ids: readonly string[] }
  /** Worked examples of research titles from the knowledge layer, the same ones the Research Title Builder teaches with. */
  | { type: "title-examples"; region?: "nepal" | "global" }
  /** The academic title patterns the Research Title Builder recognises, with what each promises. */
  | { type: "title-patterns" }
  /** Links to places that aren't catalogued tools or guides, such as the research workspace. */
  | { type: "links"; items: readonly { label: string; href: string }[] }
  /** A small table of text, for comparisons written in the guide itself. */
  | { type: "table"; caption: string; columns: readonly string[]; rows: readonly (readonly string[])[] }
  /** The Statistical Test Finder's decision tree, whose leaves the finder itself computes. */
  | { type: "test-decision-tree" }
  /** The core statistical tests side by side, read from the knowledge layer. */
  | { type: "test-matrix" }
  /** A full explanation of each named test, from the knowledge layer. */
  | { type: "test-profiles"; tests: readonly ProfiledTest[] }
  /** Worked examples taken from question to candidate test, with small datasets. */
  | { type: "worked-examples"; examples: readonly WorkedExampleId[] }
  /** Formulas with every symbol defined. */
  | { type: "formulas"; formulas: readonly FormulaId[] }
  /** Diagrams of how the variables are arranged for kinds of test. */
  | { type: "structure-diagrams"; diagrams: readonly StructureDiagramId[] }
  /** A teaching figure: independent and paired observations, or what an assumption looks like. */
  | { type: "figure"; figure: FigureId }
  /** The mean, median, mode and standard deviation of a small example, with the working. */
  | { type: "descriptive-example" }
  | { type: "spss-procedures"; methods: readonly AnalysisMethodId[] }
  | { type: "spss-workflow"; steps: readonly string[] };

export interface GuideSection {
  /** Stable anchor for linking to the section. */
  id: string;
  heading: string;
  blocks: readonly GuideBlock[];
}

export interface Guide {
  slug: string;
  /** The title, phrased the way people search for it. */
  title: string;
  /** For search results: one or two sentences. */
  description: string;
  /** The direct answer, shown first. */
  summary: string;
  /** ISO date of the last substantive change. */
  updated: string;
  /** The named expert who checked the guide, or null until one has. */
  reviewedBy: string | null;
  sections: readonly GuideSection[];
  faq: readonly { question: string; answer: string }[];
  /** Catalogue ids of tools that put the guide into practice. */
  relatedToolIds: readonly string[];
}
