import type { ProfiledStyleId } from "@/domains/publishing";
import { TOOL_ID as APA_GENERATOR_ID } from "@/tools/apa-citation-generator/path";
import { TOOL_ID as CHICAGO_AUTHOR_DATE_GENERATOR_ID } from "@/tools/chicago-author-date-citation-generator/path";
import { TOOL_ID as CHICAGO_NOTES_BIBLIOGRAPHY_GENERATOR_ID } from "@/tools/chicago-notes-bibliography-citation-generator/path";
import { TOOL_ID as CITATION_STYLE_FINDER_ID } from "@/tools/citation-style-finder/path";
import { TOOL_ID as MLA_GENERATOR_ID } from "@/tools/mla-citation-generator/path";

/** Wording shared by every style page. */
export const stylePageCopy = {
  eyebrow: "Citation style",
  definedBy: "Defined by",
  usedIn: "Commonly used in",
  status: "Coming soon",
  comingSoon: (name: string) => `A full guide to ${name}, with examples for common types of source, is coming soon.`,
  published: "Guide and generator available",
  publishedText: (name: string) => `Learn how ${name} works in the full guide, and format your sources with the generator.`,
  usefulNow: "Useful now",
  allStyles: "All citation styles",
  reviewStatus: "This page has not yet been checked by a named reviewer.",
  publishedMeta: "Read the full guide and format sources with the generator.",
  metaDescription: (name: string, summary: string, publishedMeta: string | null) => `${name}: ${summary} ${publishedMeta ?? "A full guide is coming soon."}`,
} as const;

export interface PublishedResources {
  /** Each citation system's generator and guide, by catalogue id. Most styles have one; Chicago has two. */
  systems: readonly { tool: string; guide: string }[];
  /** For a style whose systems need telling apart: what is available and how they differ. */
  coverage?: { title: string; text: string; meta: string };
}

/** Styles whose guides and generators are published. Their pages link to them instead of saying "coming soon". */
export const publishedResources: Partial<Record<ProfiledStyleId, PublishedResources>> = {
  apa: { systems: [{ tool: APA_GENERATOR_ID, guide: "apa-7-citations-and-references" }] },
  mla: { systems: [{ tool: MLA_GENERATOR_ID, guide: "mla-9-citations-and-works-cited" }] },
  chicago: {
    systems: [
      { tool: CHICAGO_AUTHOR_DATE_GENERATOR_ID, guide: "chicago-author-date-citations" },
      { tool: CHICAGO_NOTES_BIBLIOGRAPHY_GENERATOR_ID, guide: "chicago-notes-bibliography" },
    ],
    coverage: {
      title: "Guides and generators for both Chicago systems",
      text: "Chicago has two separate systems, and a piece of writing uses one of them. Author-date cites sources in the text, as in (Yu 2020, 45), with a reference list at the end. Notes and bibliography cites them in footnotes or endnotes, with a bibliography at the end. Each has its own guide and generator.",
      meta: "Read the guides to Chicago's author-date and notes-and-bibliography systems, and format sources with a generator for each.",
    },
  },
};

/** What every other style page links to while its full guide is in preparation. */
export const usefulNowIds = {
  tool: CITATION_STYLE_FINDER_ID,
  guide: "how-to-choose-a-citation-style",
} as const;
