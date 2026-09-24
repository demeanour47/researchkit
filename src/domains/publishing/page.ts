import type { GuideSection } from "./guide";

/** A standalone content page, such as About: an introduction and sections of content blocks. */
export interface ContentPage {
  title: string;
  /** For search results: one or two sentences. */
  description: string;
  /** The opening statement, shown first. */
  lead: string;
  sections: readonly GuideSection[];
}
