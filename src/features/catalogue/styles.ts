import type { CatalogueItem } from "@/domains/catalogue";
import { getStyleProfile, profiledStyles, stylePath } from "@/domains/publishing";
import { styleTitle } from "@/knowledge/citation/styles";

/** Every citation style with a page, as catalogue items, for listings and search. */
export const STYLE_LISTINGS: readonly CatalogueItem[] = profiledStyles().map((style) => ({
  id: style,
  name: styleTitle(style),
  description: getStyleProfile(style).summary,
  status: "available",
  href: stylePath(style),
}));
