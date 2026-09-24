import { GUIDES_INDEX_PATH, TOOLS_INDEX_PATH } from "@/domains/catalogue";
import { ABOUT_PATH, STYLES_INDEX_PATH } from "@/domains/publishing";
import type { NavGroup, NavItem } from "@/features/site";

/**
 * Site navigation. Addresses come from the modules that own each page, so a
 * link can only change where the page itself changes.
 */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Tools", href: TOOLS_INDEX_PATH },
  { label: "Learn", href: GUIDES_INDEX_PATH },
  { label: "Styles", href: STYLES_INDEX_PATH },
];

export const footerNavigation: readonly NavGroup[] = [
  { heading: "Explore", items: primaryNavigation },
  { heading: "About", items: [{ label: "About", href: ABOUT_PATH }] },
];
