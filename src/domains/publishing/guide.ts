/**
 * The shape of a guide. Guides are content, written as data so the words stay
 * separate from layout and every guide renders with the same structure.
 */

import type { ProfiledStyleId } from "./style-profile";

export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: readonly string[] }
  /** Styles described from their shared profiles, with facts from the knowledge layer. */
  | { type: "styles"; styles: readonly ProfiledStyleId[] };

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
