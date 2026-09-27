import NextLink from "next/link";
import { Badge, Icon, cardClasses, coverLinkClasses, cx, type BadgeTone, type IconName } from "@/ui";
import { MODULES } from "@/knowledge/workspace/modules";
import type { StageProgress, StageStatus } from "@/knowledge/workspace/progress";
import { STAGE_STATUS_LABELS } from "@/knowledge/workspace/progress";
import { dashboardCopy } from "./copy";
import { STAGE_LINKS } from "./stage-links";

const copy = dashboardCopy.timeline;

/** Each status has its own icon and words, so it is never shown by colour alone. */
export const STATUS_STYLE: Readonly<Record<StageStatus, { icon: IconName; tone: BadgeTone; marker: string }>> = {
  "not-started": { icon: "circle", tone: "outline", marker: "border-border-strong bg-surface text-text-muted" },
  "in-progress": { icon: "circle-dot", tone: "info", marker: "border-action bg-action-soft text-action" },
  completed: { icon: "circle-check", tone: "success", marker: "border-success bg-success-soft text-success" },
  "needs-review": { icon: "alert", tone: "caution", marker: "border-warning bg-warning-soft text-warning" },
  "not-needed": { icon: "circle-minus", tone: "neutral", marker: "border-border bg-sunken text-text-muted" },
};

export function StatusBadge({ status }: { status: StageStatus }) {
  const style = STATUS_STYLE[status];
  // Caution badges add their own alert icon.
  return (
    <Badge tone={style.tone} icon={style.tone === "caution" ? undefined : style.icon}>
      {STAGE_STATUS_LABELS[status]}
    </Badge>
  );
}

/**
 * The project's stages in order, as a timeline. With progress, each shows its status
 * and what it still needs; without, as rendered on the server, the plain list of
 * stages, which is how the page reads before the browser's project is known.
 */
export function StageTimeline({ progress }: { progress: readonly StageProgress[] | null }) {
  return (
    <ol aria-label={copy.heading} className="grid gap-3">
      {MODULES.map((stage, index) => {
        const entry = progress?.find((candidate) => candidate.stage.id === stage.id) ?? null;
        const status = entry?.status ?? null;
        const edited = stage.toolId === null;
        return (
          <li key={stage.id} className={cx(cardClasses({ interactive: true, padding: "sm", tone: status === "not-needed" ? "sunken" : "default" }), "group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2")}>
            <span aria-hidden="true" className={cx("row-span-2 inline-flex size-9 items-center justify-center rounded-pill border text-small font-semibold tabular-nums", status ? STATUS_STYLE[status].marker : "border-border-strong bg-surface text-text-muted")}>
              {status && status !== "not-started" ? <Icon name={STATUS_STYLE[status].icon} className="size-4" /> : index + 1}
            </span>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h3 className="text-heading-sm font-semibold">
                <NextLink href={STAGE_LINKS[stage.id]} className={coverLinkClasses}>
                  <span className="sr-only">{`${index + 1}. `}</span>
                  {stage.name}
                </NextLink>
              </h3>
              <span className="flex items-center gap-2">
                {status && <StatusBadge status={status} />}
                <Icon name="arrow-right" className="text-text-muted transition-transform duration-(--duration-quick) group-hover:translate-x-0.5 group-hover:text-action" />
              </span>
            </div>
            <div className="col-start-2 grid gap-1 text-small text-text-muted">
              <p>{status === "not-needed" ? copy.notNeeded : stage.summary}</p>
              {entry && entry.missing.length > 0 && (
                <p>
                  <span className="font-medium text-text">{copy.stillNeeds}:</span> {entry.missing.join("; ")}.
                </p>
              )}
              {entry && entry.reviewReasons.length > 0 && (
                <p>
                  <span className="font-medium text-text">{copy.review}:</span> {entry.reviewReasons.join(" ")}
                </p>
              )}
              {edited && <p className="text-caption">{copy.here}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
