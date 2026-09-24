/**
 * The guide registry: the one place that knows which guides exist and where
 * their content comes from. Replacing files with a CMS changes only this module.
 */

import { howToChooseACitationStyle } from "../../../content/guides/how-to-choose-a-citation-style";
import type { Guide } from "./guide";

const GUIDES: readonly Guide[] = [howToChooseACitationStyle];

/** A guide's address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const guidePath = (slug: string) => `/learn/${slug}`;

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}
