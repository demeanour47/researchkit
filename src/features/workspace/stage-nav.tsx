import NextLink from "next/link";
import { Icon, QuickAction } from "@/ui";
import { stagePosition } from "@/knowledge/workspace/navigation";
import type { ModuleId, WorkspaceModule } from "@/knowledge/workspace/modules";
import { STAGE_LINKS, WORKSPACE_PATH } from "./stage-links";

const copy = {
  label: "Project stages",
  position: (number: number, total: number) => `Stage ${number} of ${total}`,
  previous: "Previous stage",
  next: "Next stage",
  workspace: "Research workspace",
  nextHeading: (name: string) => `Next: ${name}`,
} as const;

function Neighbour({ stage, direction }: { stage: WorkspaceModule; direction: "previous" | "next" }) {
  return (
    <NextLink href={STAGE_LINKS[stage.id]} className="inline-flex min-h-6 items-center gap-1 rounded-sm text-text-muted underline-offset-4 hover:text-text hover:underline focus-ring">
      {direction === "previous" && <Icon name="arrow-left" />}
      <span className="sr-only">{direction === "previous" ? copy.previous : copy.next}: </span>
      {stage.name}
      {direction === "next" && <Icon name="arrow-right" />}
    </NextLink>
  );
}

/**
 * Where a tool sits in the research workflow, with its neighbours. Rendered on the
 * server in the standard order, so it works without scripts and is the same for everyone.
 */
export function StageNav({ stage }: { stage: ModuleId }) {
  const position = stagePosition(stage);
  return (
    <nav aria-label={copy.label} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small print:hidden">
      <NextLink href={WORKSPACE_PATH} className="inline-flex min-h-6 items-center gap-1.5 rounded-pill bg-action-soft px-2.5 font-medium text-action focus-ring">
        <Icon name="layers" />
        {copy.workspace}
        <span aria-hidden="true">·</span>
        <span>{copy.position(position.number, position.total)}</span>
      </NextLink>
      {position.previous && <Neighbour stage={position.previous} direction="previous" />}
      {position.next && <Neighbour stage={position.next} direction="next" />}
    </nav>
  );
}

/** The next stage, offered once the tool's work is done. */
export function NextStage({ stage }: { stage: ModuleId }) {
  const { next } = stagePosition(stage);
  if (!next) return null;
  return <QuickAction as="div" href={STAGE_LINKS[next.id]} icon="workflow" title={copy.nextHeading(next.name)} description={next.summary} tone="accent" />;
}
