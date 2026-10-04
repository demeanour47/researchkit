import type { ProfiledStyleId } from "@/domains/publishing";
import { TOOL_ID as APA_GENERATOR_ID } from "@/tools/apa-citation-generator/path";
import { TOOL_ID as CHICAGO_AUTHOR_DATE_GENERATOR_ID } from "@/tools/chicago-author-date-citation-generator/path";
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
  tool: string;
  guide: string;
  /** For a style only partly covered: what is available and what is still to come. */
  coverage?: { title: string; text: string; meta: string };
}

/** Styles whose guide and generator are published, by catalogue id. Their pages link to both instead of saying "coming soon". */
export const publishedResources: Partial<Record<ProfiledStyleId, PublishedResources>> = {
  apa: { tool: APA_GENERATOR_ID, guide: "apa-7-citations-and-references" },
  mla: { tool: MLA_GENERATOR_ID, guide: "mla-9-citations-and-works-cited" },
  chicago: {
    tool: CHICAGO_AUTHOR_DATE_GENERATOR_ID,
    guide: "chicago-author-date-citations",
    coverage: {
      title: "Author-date guide and generator available",
      text: "ResearchKit covers Chicago's author-date system: learn it in the full guide, and format your sources with the generator. A generator for Chicago's notes-and-bibliography system, with footnotes, is coming soon.",
      meta: "Read the author-date guide and format sources with the author-date generator; notes and bibliography are coming soon.",
    },
  },
};

/** What every other style page links to while its full guide is in preparation. */
export const usefulNowIds = {
  tool: CITATION_STYLE_FINDER_ID,
  guide: "how-to-choose-a-citation-style",
} as const;
