import NextLink from "next/link";
import { useId } from "react";
import { Badge, ComingSoon, Icon, IconTile, cardClasses, coverLinkClasses, cx, type IconName } from "@/ui";
import { TOOL_CATEGORIES, type CatalogueItem, type ToolEntry } from "@/domains/catalogue";
import { LATEST_TOOL_IDS } from "@/config/highlights";
import { toolIcon } from "./icons";

export type CatalogueKind = "tool" | "guide" | "style";

const labels = {
  new: "New",
  open: { tool: "Open tool", guide: "Read guide", style: "View style" },
} as const;

const kindIcons: Record<Exclude<CatalogueKind, "tool">, IconName> = { guide: "learning", style: "publishing" };

const isTool = (item: CatalogueItem): item is ToolEntry => "category" in item && TOOL_CATEGORIES.some((category) => category.id === item.category);

function iconFor(item: CatalogueItem, kind: CatalogueKind): IconName {
  return kind === "tool" && isTool(item) ? toolIcon(item) : kindIcons[kind === "tool" ? "guide" : kind];
}

export interface CatalogueCardProps {
  item: CatalogueItem;
  kind?: CatalogueKind;
  /** Show the item's category under its description. */
  showCategory?: boolean;
}

/**
 * One catalogued item. Available items are one link covering the whole card,
 * which lifts under the pointer; items not yet available are plain text with a
 * visible status, so nothing links to a page that doesn't exist.
 */
export function CatalogueCard({ item, kind = "tool", showCategory = false }: CatalogueCardProps) {
  // Unique per card: the same item can be listed twice on one page, such as under “New” and its category.
  const descriptionId = `${useId()}-description`;
  if (item.status !== "available") return <ComingSoon title={item.name} description={item.description} descriptionId={descriptionId} />;

  const isNew = kind === "tool" && (LATEST_TOOL_IDS as readonly string[]).includes(item.id);
  const category = showCategory && isTool(item) ? TOOL_CATEGORIES.find((entry) => entry.id === item.category)?.title : undefined;

  return (
    <li className={cx(cardClasses({ interactive: true }), "group grid content-start gap-4")}>
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={iconFor(item, kind)} />
        {isNew && (
          <Badge tone="accent" icon="sparkles">
            {labels.new}
          </Badge>
        )}
      </div>
      <div className="grid gap-1.5">
        <h3 className="text-heading-sm font-semibold">
          <NextLink href={item.href} aria-describedby={descriptionId} className={coverLinkClasses}>
            {item.name}
          </NextLink>
        </h3>
        <p id={descriptionId} className="text-small text-text-muted">
          {item.description}
        </p>
      </div>
      <p aria-hidden="true" className="mt-auto flex items-center justify-between gap-3 pt-1 text-caption text-text-muted">
        <span>{category}</span>
        <span className="inline-flex items-center gap-1 font-medium text-action opacity-0 transition-opacity duration-(--duration-quick) group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100">
          {labels.open[kind]}
          <Icon name="arrow-right" />
        </span>
      </p>
    </li>
  );
}

export interface CatalogueListProps {
  items: readonly CatalogueItem[];
  /** What the items are, which chooses their icons. */
  kind?: CatalogueKind;
  /** `grid` for directories; `quad` for a row of four; `pair` for a few related items beside other content; `stack` for one column. */
  layout?: "grid" | "quad" | "pair" | "stack";
  showCategory?: boolean;
}

const layoutClasses = {
  grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  quad: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  pair: "grid gap-4 sm:grid-cols-2",
  stack: "grid gap-4",
} as const;

/** Catalogue items (tools, guides, styles) as a list of cards. */
export function CatalogueList({ items, kind = "tool", layout = "grid", showCategory = false }: CatalogueListProps) {
  return (
    <ul className={layoutClasses[layout]}>
      {items.map((item) => (
        <CatalogueCard key={item.id} item={item} kind={kind} showCategory={showCategory} />
      ))}
    </ul>
  );
}
