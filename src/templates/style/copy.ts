import { TOOL_ID as CITATION_STYLE_FINDER_ID } from "@/tools/citation-style-finder/path";

/** Wording shared by every style page. */
export const stylePageCopy = {
  definedBy: "Defined by",
  usedIn: "Commonly used in",
  status: "Coming soon",
  comingSoon: (name: string) => `A full guide to ${name}, with examples for common types of source, is coming soon.`,
  usefulNow: "Useful now",
  allStyles: "All citation styles",
  reviewStatus: "This page has not yet been checked by a named reviewer.",
  metaDescription: (name: string, summary: string) => `${name}: ${summary} A full guide is coming soon.`,
} as const;

/** What every style page links to while its full guide is in preparation. */
export const usefulNowIds = {
  tool: CITATION_STYLE_FINDER_ID,
  guide: "how-to-choose-a-citation-style",
} as const;
