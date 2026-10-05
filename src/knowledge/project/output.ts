/**
 * The final document, assembled only from what the student wrote. A section with no
 * text is listed as missing, never filled in, and incomplete sections are labelled.
 */

import { sectionsFor } from "./sections";
import { SECTION_STATUS_LABELS, type ProjectState } from "./state";

export interface OutputSection {
  id: string;
  title: string;
  text: string;
  status: ProjectState["sections"][string]["status"];
  incomplete: boolean;
}

export interface FinalOutput {
  sections: readonly OutputSection[];
  incomplete: number;
  complete: boolean;
}

export function assembleOutput(project: ProjectState): FinalOutput {
  const sections = sectionsFor(project.profile.type).map((template): OutputSection => {
    const saved = project.sections[template.id];
    const status = saved?.status ?? "not-started";
    return { id: template.id, title: template.title, text: saved?.text.trim() ?? "", status, incomplete: status !== "complete" };
  });
  const incomplete = sections.filter((section) => section.incomplete).length;
  return { sections, incomplete, complete: incomplete === 0 };
}

/** Plain text, with a marker line above every section that is not complete. */
export function outputAsText(project: ProjectState, title: string): string {
  const { sections } = assembleOutput(project);
  const parts = sections.map((section) => {
    const marker = section.incomplete ? `[${SECTION_STATUS_LABELS[section.status]}]\n` : "";
    return `${section.title}\n${marker}${section.text || "[No text written yet]"}`;
  });
  return [title, ...parts].join("\n\n");
}
