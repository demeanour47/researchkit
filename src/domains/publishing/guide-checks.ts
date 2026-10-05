/**
 * Checks shared by the guides' tests. Relative imports only, so the test runner can
 * load it (TESTING.md).
 */

import { getReference } from "../../knowledge/research/references";
import type { Guide, GuideBlock } from "./guide";

/** Every block in a guide, in order. */
export const blocksOf = (guide: Guide): GuideBlock[] => guide.sections.flatMap((section) => section.blocks);

/** The guide's prose: paragraphs, list items, table cells and FAQ answers. */
export function proseOf(guide: Guide): string {
  const blocks = blocksOf(guide).map((block) =>
    block.type === "paragraph" ? block.text : block.type === "reveal" ? [block.prompt, block.weak, block.improved, block.explanation].join(" ") : block.type === "list" ? block.items.join(" ") : block.type === "table" ? [block.caption, ...block.rows.flat()].join(" ") : "",
  );
  return [guide.summary, ...blocks, ...guide.faq.map((item) => `${item.question} ${item.answer}`)].join(" ");
}

/** The ids in the guide's references blocks. */
export const referenceIdsOf = (guide: Guide): string[] => blocksOf(guide).flatMap((block) => (block.type === "references" ? [...block.ids] : []));

/**
 * The listed references that aren't cited in the guide's text by their in-text form,
 * and the in-text forms of registered references that are cited but not listed.
 */
export function citationProblems(guide: Guide, known: readonly string[] = []): string[] {
  const prose = proseOf(guide);
  const listed = referenceIdsOf(guide);
  const problems = listed.filter((id) => !prose.includes(getReference(id).cite)).map((id) => `${id} is listed but not cited`);
  for (const id of known) if (!listed.includes(id) && prose.includes(getReference(id).cite)) problems.push(`${id} is cited but not listed`);
  return problems;
}

/** A table in the guide whose caption starts with the given text. */
export function tableOf(guide: Guide, caption: string): Extract<GuideBlock, { type: "table" }> {
  const table = blocksOf(guide).find((block): block is Extract<GuideBlock, { type: "table" }> => block.type === "table" && block.caption.startsWith(caption));
  if (!table) throw new Error(`${guide.slug} has no table captioned “${caption}”`);
  return table;
}
