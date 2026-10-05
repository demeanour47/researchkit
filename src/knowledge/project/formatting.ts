/**
 * Formatting guidance by project type. General academic practice is kept apart from
 * what a citation style requires, and from what the student's institution requires,
 * which only the institution can say. Citation styles come from the existing citation
 * system; this module does not format citations.
 */

import { CITATION_STYLES } from "../citation/styles";
import type { CitationStyleId, ProjectProfile, ProjectType } from "./state";

export interface FormattingGuidance {
  general: readonly string[];
  forType: readonly string[];
  style: { id: CitationStyleId; name: string; points: readonly string[]; toolHref: string | null } | null;
  institution: string;
}

const GENERAL = [
  "Use clear headings that follow a consistent hierarchy.",
  "Refer to every table and figure in the text and number them in order.",
  "Cite every source you use, and list every source you cite.",
  "Write in a formal, precise register and define terms on first use.",
];

const BY_TYPE: Record<ProjectType, readonly string[]> = {
  proposal: ["Write about the research in the future or conditional tense: it has not been done.", "Do not report results or findings."],
  paper: ["Keep Results and Discussion distinct unless your institution combines them.", "Write the abstract last and keep it within the word limit."],
  thesis: ["Expect front matter such as a title page, abstract and table of contents.", "Put supporting material in labelled appendices and refer to each in the text."],
};

const STYLE_POINTS: Record<CitationStyleId, { points: readonly string[]; tool: string | null }> = {
  apa: { points: ["Author-date in-text citations.", "Reference list in alphabetical order with hanging indents."], tool: "/tools/apa-citation-generator" },
  mla: { points: ["Author-page in-text citations.", "A Works Cited list in alphabetical order."], tool: "/tools/mla-citation-generator" },
  chicago: { points: ["Notes and bibliography, or author-date; check which your institution uses."], tool: "/tools/chicago-author-date-citation-generator" },
  harvard: { points: ["Author-date in-text citations.", "A reference list; details vary between institutions."], tool: "/tools/harvard-citation-generator" },
  ieee: { points: ["Numbered citations in square brackets in order of first use.", "A numbered reference list."], tool: "/tools/ieee-citation-generator" },
};

export function formattingFor(profile: ProjectProfile): FormattingGuidance {
  const id = profile.citationStyle;
  const known = id ? (CITATION_STYLES as Record<string, { name: string } | undefined>)[id] : undefined;
  return {
    general: GENERAL,
    forType: BY_TYPE[profile.type],
    style: id ? { id, name: known?.name ?? id.toUpperCase(), points: STYLE_POINTS[id].points, toolHref: STYLE_POINTS[id].tool } : null,
    institution: profile.institution?.trim() || "Your institution's own requirements take priority. Add them in the project details to keep them beside your work.",
  };
}
