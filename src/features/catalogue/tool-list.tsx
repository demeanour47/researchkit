import { Link, Tag } from "@/ui";
import type { ToolEntry, ToolStatus } from "@/domains/catalogue";

const statusLabels: Record<ToolStatus, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
};

function ToolCard({ tool }: { tool: ToolEntry }) {
  const descriptionId = `tool-${tool.id}-description`;

  return (
    <li className="relative grid content-start gap-2 rounded-panel border border-border bg-surface p-6">
      <h3 className="text-subheading font-semibold">
        {tool.status === "available" ? (
          <Link
            href={tool.href}
            variant="standalone"
            aria-describedby={descriptionId}
            className="after:absolute after:inset-0 after:rounded-panel"
          >
            {tool.name}
          </Link>
        ) : (
          tool.name
        )}
      </h3>
      <p id={descriptionId} className="text-text-muted">
        {tool.description}
      </p>
      <div>
        <Tag tone={tool.status === "available" ? "info" : "neutral"}>{statusLabels[tool.status]}</Tag>
      </div>
    </li>
  );
}

export interface ToolListProps {
  tools: readonly ToolEntry[];
}

/**
 * Tools as a list of cards. Available tools link to themselves (the whole card
 * is clickable); tools not yet available are plain text with a visible status.
 */
export function ToolList({ tools }: ToolListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </ul>
  );
}
