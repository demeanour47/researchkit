import type { StyleId } from "@/knowledge/citation/styles";

/** Styles with a published profile page. Names, editions and authorities come from the knowledge layer. */
export const PROFILED_STYLES = ["apa", "mla", "chicago", "ieee", "harvard"] as const satisfies readonly StyleId[];

export type ProfiledStyleId = (typeof PROFILED_STYLES)[number];

/** The editorial description of a style, shared by style pages and guides. */
export interface StyleProfile {
  /** Where the style is commonly used, as a sentence. */
  usedIn: string;
  /** How the style works, in one or two sentences. */
  summary: string;
}
