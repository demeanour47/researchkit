"use client";

import { Icon, Link } from "@/ui";
import { describeProject, type ResearchProjectDraft } from "@/knowledge/research/research-project";
import { getModule, type ModuleId } from "@/knowledge/workspace/modules";
import { summaryCopy as copy } from "./copy";
import { STAGE_LINKS } from "./stage-links";

/**
 * Shown in place of a tool's project step while it works in the workspace: what the
 * tool reads from each earlier stage, with a link to change it where it belongs.
 */
export function WorkspaceProjectSummary({ stage, project }: { stage: ModuleId; project: ResearchProjectDraft }) {
  const stages = getModule(stage).reads.map(getModule);
  return (
    <div className="grid gap-4">
      <p className="text-text-muted">{copy.intro}</p>
      <ul className="grid gap-3">
        {stages.map((stage) => {
          const rows = describeProject(Object.fromEntries(stage.owns.flatMap((field) => (project[field] !== undefined ? [[field, project[field]]] : []))) as ResearchProjectDraft);
          return (
            <li key={stage.id} className="grid gap-2 rounded-panel border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="flex items-center gap-2 text-heading-sm font-semibold">
                  <Icon name={rows.length > 0 ? "circle-check" : "hourglass"} className={rows.length > 0 ? "text-success" : "text-text-muted"} />
                  {stage.name}
                </h3>
                <Link href={STAGE_LINKS[stage.id]} className="text-small">
                  {rows.length > 0 ? copy.edit(stage.name) : copy.start(stage.name)}
                </Link>
              </div>
              {rows.length > 0 ? (
                <dl className="grid gap-1 text-small">
                  {rows.map((row) => (
                    <div key={row.field} className="grid gap-x-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
                      <dt className="text-text-muted">{row.label}</dt>
                      <dd className="break-words">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-small text-text-muted">{copy.notStarted}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
