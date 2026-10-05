import NextLink from "next/link";
import { publishedGuides } from "@/domains/catalogue";
import { availableTools } from "@/features/catalogue";
import { JOURNEY_STAGES } from "@/knowledge/journey/stages";
import { Icon, cx } from "@/ui";

/**
 * The research journey as a list of native disclosure elements. Every stage's
 * text and links are in the HTML, so it is crawlable and works without script;
 * opening one closes the others (`name`), and the keyboard works as it does for any <details>.
 */
export function ResearchJourney() {
  return (
    <ol className="grid gap-3">
      {JOURNEY_STAGES.map((stage, index) => {
        const tools = availableTools(stage.toolIds);
        const guides = publishedGuides(stage.guideSlugs);
        return (
          <li key={stage.id}>
            <details name="research-journey" className="group rounded-panel border border-border bg-surface shadow-card transition-colors duration-(--duration-instant) ease-standard open:border-border-control">
              <summary className="flex min-h-control cursor-pointer list-none items-center gap-4 rounded-panel p-4 focus-ring [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-pill border border-border-control bg-sunken text-small font-semibold">
                  {index + 1}
                </span>
                <span className="grid flex-1 gap-0.5">
                  <span className="font-semibold">{stage.title}</span>
                  <span className="text-small text-text-muted">{stage.summary}</span>
                </span>
                <Icon name="chevron-down" className="shrink-0 text-text-muted transition-transform duration-(--duration-quick) ease-standard group-open:rotate-180" />
              </summary>
              <div className="grid animate-rise-in gap-4 border-t border-border p-4 sm:pl-16">
                <p>
                  <span className="font-semibold">What it means. </span>
                  {stage.meaning}
                </p>
                <p>
                  <span className="font-semibold">Why it matters. </span>
                  {stage.why}
                </p>
                {tools.length > 0 && <LinkRow label="Tools" items={tools.map((tool) => ({ href: tool.href, text: tool.name }))} />}
                {guides.length > 0 && <LinkRow label="Guides" items={guides.map((guide) => ({ href: guide.href, text: guide.name }))} />}
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}

function LinkRow({ label, items }: { label: string; items: readonly { href: string; text: string }[] }) {
  return (
    <div className="grid gap-2">
      <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <NextLink
              href={item.href}
              className={cx(
                "inline-flex min-h-control items-center gap-1.5 rounded-control border border-border-control px-3 text-small font-medium",
                "transition-[background-color,border-color] duration-(--duration-instant) ease-standard hover:bg-hover focus-ring",
              )}
            >
              {item.text}
              <Icon name="arrow-right" />
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
