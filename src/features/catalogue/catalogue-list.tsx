import { Link, Tag } from "@/ui";
import type { CatalogueItem, CatalogueStatus } from "@/domains/catalogue";

const statusLabels: Record<CatalogueStatus, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
};

function CatalogueCard({ item, showStatus }: { item: CatalogueItem; showStatus: boolean }) {
  const descriptionId = `item-${item.id}-description`;

  return (
    <li className="relative grid content-start gap-2 rounded-panel border border-border bg-surface p-6">
      <h3 className="text-subheading font-semibold">
        {item.status === "available" ? (
          <Link
            href={item.href}
            variant="standalone"
            aria-describedby={descriptionId}
            className="after:absolute after:inset-0 after:rounded-panel"
          >
            {item.name}
          </Link>
        ) : (
          item.name
        )}
      </h3>
      <p id={descriptionId} className="text-text-muted">
        {item.description}
      </p>
      {showStatus && (
        <div>
          <Tag tone={item.status === "available" ? "info" : "neutral"}>{statusLabels[item.status]}</Tag>
        </div>
      )}
    </li>
  );
}

export interface CatalogueListProps {
  items: readonly CatalogueItem[];
  /** `grid` for directories; `stack` for a few related items beside other content. */
  layout?: "grid" | "stack";
  /** Hide the status label where every item's status is stated once for the whole list. */
  showStatus?: boolean;
}

/**
 * Catalogue items (tools, guides) as a list of cards. Available items link to
 * themselves, with the whole card clickable; items not yet available are plain
 * text with a visible status.
 */
export function CatalogueList({ items, layout = "grid", showStatus = true }: CatalogueListProps) {
  return (
    <ul className={layout === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
      {items.map((item) => (
        <CatalogueCard key={item.id} item={item} showStatus={showStatus} />
      ))}
    </ul>
  );
}
