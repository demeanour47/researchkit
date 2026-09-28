/**
 * The guide registry: the one place that knows which guides exist and where
 * their content comes from. Replacing files with a CMS changes only this module.
 */

import { howToChooseACitationStyle } from "../../../content/guides/how-to-choose-a-citation-style";
import { howToCountCharactersInAcademicWriting } from "../../../content/guides/how-to-count-characters-in-academic-writing";
import { howToWriteAGoodResearchTitle } from "../../../content/guides/how-to-write-a-good-research-title";
import type { Guide } from "./guide";

const GUIDES: readonly Guide[] = [howToChooseACitationStyle, howToWriteAGoodResearchTitle, howToCountCharactersInAcademicWriting];

/** A guide's address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const guidePath = (slug: string) => `/learn/${slug}`;

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}
