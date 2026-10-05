"use client";

import { ButtonLink, Link } from "@/ui";
import { PROJECT_TYPE_INFO } from "@/knowledge/project/sections";
import { PROJECT_PATH } from "./paths";
import { useProjectView } from "./store";

/** A one-line view of the research journey on tool and Learn pages. Nothing shows for visitors without a project. */
export function JourneyStrip() {
  const view = useProjectView();
  if (!view) return null;
  const { journey } = view;
  const name = PROJECT_TYPE_INFO.find((item) => item.type === journey.type)!.name;
  return (
    <aside aria-label="Your research journey" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-small">
      <p className="min-w-0">
        <span className="font-semibold">{name}</span> · {journey.percent}% · {journey.completed} of {journey.applicable} milestones
        {journey.current && <span className="block text-text-muted"><span aria-hidden="true">● </span>You are here: {journey.current.name}</span>}
      </p>
      <div className="flex items-center gap-3">
        {journey.current?.handoff && <Link href={journey.current.handoff.href}>{journey.current.handoff.label}</Link>}
        <ButtonLink href={PROJECT_PATH} size="sm" trailingIcon="arrow-right">Return to Research Journey</ButtonLink>
      </div>
    </aside>
  );
}
