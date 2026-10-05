import { GUIDES_INDEX_PATH, TOOLS_INDEX_PATH, TOOL_CATEGORIES } from "@/domains/catalogue";
import { ABOUT_PATH, STYLES_INDEX_PATH } from "@/domains/publishing";
import type { NavGroup, NavItem } from "@/features/site";
import { PROJECT_PATH } from "@/features/project/paths";
import { WORKSPACE_PATH } from "@/features/workspace/stage-links";
import { site } from "./site";

/**
 * Site navigation. Addresses come from the modules that own each page, so a
 * link can only change where the page itself changes.
 */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Tools", href: TOOLS_INDEX_PATH, icon: "layout-grid" },
  { label: "Learn", href: GUIDES_INDEX_PATH, icon: "learning" },
  { label: "Styles", href: STYLES_INDEX_PATH, icon: "publishing" },
  { label: "Workspace", href: WORKSPACE_PATH, icon: "layers" },
];

/** Where the homepage lists what is planned. */
export const ROADMAP_PATH = "/#roadmap";

export const footerNavigation: readonly NavGroup[] = [
  {
    heading: "Resources",
    items: [
      { label: "Research journey", href: PROJECT_PATH },
      { label: "Research workspace", href: WORKSPACE_PATH },
      { label: "Academic tools", href: TOOLS_INDEX_PATH },
      { label: "Research guides", href: GUIDES_INDEX_PATH },
      { label: "Citation styles", href: STYLES_INDEX_PATH },
    ],
  },
  {
    heading: "Tool categories",
    items: TOOL_CATEGORIES.map((category) => ({ label: category.title, href: `${TOOLS_INDEX_PATH}#${category.id}` })),
  },
  {
    heading: "Project",
    items: [
      { label: "About", href: ABOUT_PATH },
      { label: "Roadmap", href: ROADMAP_PATH },
      { label: "Documentation", href: site.documentation },
      { label: "GitHub", href: site.repository },
    ],
  },
];
