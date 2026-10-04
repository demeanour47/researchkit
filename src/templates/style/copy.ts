import type { ProfiledStyleId } from "@/domains/publishing";
import { TOOL_ID as APA_GENERATOR_ID } from "@/tools/apa-citation-generator/path";
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
  metaDescription: (name: string, summary: string, published: boolean) =>
    `${name}: ${summary} ${published ? "Read the full guide and format sources with the generator." : "A full guide is coming soon."}`,
} as const;

/** Styles whose full guide and generator are published, by catalogue id. Their pages link to both instead of saying "coming soon". */
export const publishedResources: Partial<Record<ProfiledStyleId, { tool: string; guide: string }>> = {
  apa: { tool: APA_GENERATOR_ID, guide: "apa-7-citations-and-references" },
  mla: { tool: MLA_GENERATOR_ID, guide: "mla-9-citations-and-works-cited" },
};

/** What every other style page links to while its full guide is in preparation. */
export const usefulNowIds = {
  tool: CITATION_STYLE_FINDER_ID,
  guide: "how-to-choose-a-citation-style",
} as const;
