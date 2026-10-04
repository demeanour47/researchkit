import type { ProfiledStyleId } from "@/domains/publishing";
import { TOOL_ID as APA_GENERATOR_ID } from "@/tools/apa-citation-generator/path";
import { TOOL_ID as CHICAGO_AUTHOR_DATE_GENERATOR_ID } from "@/tools/chicago-author-date-citation-generator/path";
import { TOOL_ID as CHICAGO_NOTES_BIBLIOGRAPHY_GENERATOR_ID } from "@/tools/chicago-notes-bibliography-citation-generator/path";
import { TOOL_ID as CITATION_STYLE_FINDER_ID } from "@/tools/citation-style-finder/path";
import { TOOL_ID as HARVARD_GENERATOR_ID } from "@/tools/harvard-citation-generator/path";
import { TOOL_ID as IEEE_GENERATOR_ID } from "@/tools/ieee-citation-generator/path";
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
  ieee: {
    systems: [{ tool: IEEE_GENERATOR_ID, guide: "ieee-citations-and-references" }],
    coverage: {
      title: "Guide and generator available",
      text: "IEEE is a numeric style: a citation is a number in square brackets, such as [1], and references are numbered in the order they are first cited, not alphabetically. The generator formats books, journal articles, conference papers and web pages, and uses the reference number you give it, since only your paper shows the citation order. Other kinds of source, such as standards, patents and theses, aren't supported yet.",
      meta: "Read the guide to IEEE's numbered citations and references, and format books, journal articles, conference papers and web pages with the generator.",
    },
  },
  harvard: {
    systems: [{ tool: HARVARD_GENERATOR_ID, guide: "harvard-citations-and-references" }],
    coverage: {
      title: "Guide and generator for one defined version of Harvard",
      text: "Harvard has no single official version: universities publish their own, and they differ in punctuation and detail. ResearchKit's guide and generator follow one defined author-date profile, based on Cite Them Right, 13th edition, and explain each choice. They don't reproduce any university's version, so check your university's referencing requirements. The generator formats books, journal articles and web pages.",
      meta: "Read the guide to Harvard citations and references, and format books, journal articles and web pages with a generator that follows a defined profile based on Cite Them Right.",
    },
  },
};

/** What every other style page links to while its full guide is in preparation. */
export const usefulNowIds = {
  tool: CITATION_STYLE_FINDER_ID,
  guide: "how-to-choose-a-citation-style",
} as const;
