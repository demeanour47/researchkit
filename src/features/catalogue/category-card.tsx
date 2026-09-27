import NextLink from "next/link";
import { Icon, IconTile, cardClasses, coverLinkClasses, cx } from "@/ui";
import { TOOLS_INDEX_PATH, countByStatus, toolsInCategory, type ToolCategory } from "@/domains/catalogue";
import { CATEGORY_ICONS } from "./icons";

export interface CategoryCardProps {
  category: ToolCategory;
  /** The availability line, such as “6 available, 4 coming soon”. */
  summary: (available: number, comingSoon: number) => string;
  /** How many available tools to name on the card. */
  preview?: number;
}

/** A tool category: what it covers, how many tools it has, and a few of them by name. The whole card links to the category. */
export function CategoryCard({ category, summary, preview = 3 }: CategoryCardProps) {
  const tools = toolsInCategory(category.id);
  const counts = countByStatus(tools);
  const named = tools.filter((tool) => tool.status === "available").slice(0, preview);
  const descriptionId = `category-${category.id}-description`;

  return (
    <li className={cx(cardClasses({ interactive: true }), "group grid content-start gap-4")}>
      <div className="flex items-center justify-between gap-3">
        <IconTile icon={CATEGORY_ICONS[category.id]} size="lg" />
        <Icon name="arrow-up-right" className="size-5 text-text-muted transition-[color,transform] duration-(--duration-quick) ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-action" />
      </div>
      <div className="grid gap-1.5">
        <h3 className="text-subheading font-semibold">
          <NextLink href={`${TOOLS_INDEX_PATH}#${category.id}`} aria-describedby={descriptionId} className={coverLinkClasses}>
            {category.title}
          </NextLink>
        </h3>
        <p id={descriptionId} className="text-small text-text-muted">
          {category.description} <span className="text-text">{summary(counts.available, counts["coming-soon"])}.</span>
        </p>
      </div>
      {named.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {named.map((tool) => (
            <li key={tool.id} className="rounded-pill bg-secondary px-2.5 py-0.5 text-caption text-text-muted">
              {tool.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
