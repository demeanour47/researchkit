/** What global search can find. Plain data, so the index can be built on the server and sent to the browser. */

export type SearchGroup = "Pages" | "Tools" | "Guides" | "Citation styles";

/** The order groups are shown in. */
export const SEARCH_GROUPS: readonly SearchGroup[] = ["Tools", "Guides", "Citation styles", "Pages"];

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  group: SearchGroup;
  /** An icon name from the design system's set. */
  icon: string;
  /** Extra words people might search for, such as a tool's category. */
  keywords?: string;
}
