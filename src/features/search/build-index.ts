import { GUIDES_INDEX_PATH, GUIDE_LISTINGS, TOOLS, TOOLS_INDEX_PATH, TOOL_CATEGORIES } from "@/domains/catalogue";
import { ABOUT_PATH, STYLES_INDEX_PATH, getAboutPage } from "@/domains/publishing";
import { STYLE_LISTINGS, toolIcon } from "@/features/catalogue";
import { guidesIndex } from "@/templates/guides-index/copy";
import { stylesIndex } from "@/templates/styles-index/copy";
import { toolsIndex } from "@/templates/tools-index/copy";
import { site } from "@/config/site";
import { WORKSPACE_PATH } from "@/features/workspace/stage-links";
import { workspacePage } from "@/templates/workspace/copy";
import type { SearchItem } from "./types";

/**
 * Everything global search can find, built from the catalogues on the server.
 * Only published pages are included, so every result leads somewhere.
 */
export function buildSearchIndex(): SearchItem[] {
  const tools: SearchItem[] = TOOLS.flatMap((tool) =>
    tool.status === "available"
      ? [{ id: `tool-${tool.id}`, title: tool.name, description: tool.description, href: tool.href, group: "Tools" as const, icon: toolIcon(tool), keywords: TOOL_CATEGORIES.find((category) => category.id === tool.category)?.title }]
      : [],
  );
  const guides: SearchItem[] = GUIDE_LISTINGS.flatMap((guide) =>
    guide.status === "available" ? [{ id: `guide-${guide.id}`, title: guide.name, description: guide.description, href: guide.href, group: "Guides" as const, icon: "learning" }] : [],
  );
  const styles: SearchItem[] = STYLE_LISTINGS.flatMap((style) =>
    style.status === "available" ? [{ id: `style-${style.id}`, title: style.name, description: style.description, href: style.href, group: "Citation styles" as const, icon: "publishing", keywords: "citation referencing" }] : [],
  );
  const pages: SearchItem[] = [
    { id: "page-home", title: "Home", description: site.description, href: "/", group: "Pages", icon: "home" },
    { id: "page-workspace", title: workspacePage.title, description: workspacePage.metaDescription, href: WORKSPACE_PATH, group: "Pages", icon: "layers", keywords: "project dashboard progress" },
    { id: "page-tools", title: toolsIndex.title, description: toolsIndex.metaDescription, href: TOOLS_INDEX_PATH, group: "Pages", icon: "layout-grid" },
    { id: "page-learn", title: guidesIndex.title, description: guidesIndex.metaDescription, href: GUIDES_INDEX_PATH, group: "Pages", icon: "learning", keywords: "learn" },
    { id: "page-styles", title: stylesIndex.title, description: stylesIndex.metaDescription, href: STYLES_INDEX_PATH, group: "Pages", icon: "publishing" },
    { id: "page-about", title: getAboutPage().title, description: getAboutPage().description, href: ABOUT_PATH, group: "Pages", icon: "info" },
  ];
  return [...tools, ...guides, ...styles, ...pages];
}
