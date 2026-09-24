/**
 * What every catalogued item has in common, whether a tool or a guide.
 * Only available items have an address, so nothing can link to an item that doesn't exist.
 */

interface ItemBase {
  id: string;
  name: string;
  /** One sentence describing the item. */
  description: string;
}

export type CatalogueItem =
  | (ItemBase & { status: "available"; href: string })
  | (ItemBase & { status: "coming-soon" });

export type CatalogueStatus = CatalogueItem["status"];

export interface CatalogueCategory<Id extends string = string> {
  id: Id;
  title: string;
  description: string;
}

export function comingSoon<Extra extends object>(
  id: string,
  name: string,
  description: string,
  extra: Extra,
): CatalogueItem & Extra {
  return { id, name, description, status: "coming-soon", ...extra };
}

/** Items in a category, available ones first, otherwise in catalogue order. */
export function availableFirst<T extends CatalogueItem>(items: readonly T[]): T[] {
  return [...items.filter((item) => item.status === "available"), ...items.filter((item) => item.status !== "available")];
}

export function countByStatus(items: readonly CatalogueItem[]): Record<CatalogueStatus, number> {
  return {
    available: items.filter((item) => item.status === "available").length,
    "coming-soon": items.filter((item) => item.status === "coming-soon").length,
  };
}
