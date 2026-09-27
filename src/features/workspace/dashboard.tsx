"use client";

import NextLink from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  Icon,
  IconTile,
  Link,
  Section,
  SectionHeader,
  TextField,
  VisuallyHidden,
  cx,
} from "@/ui";
import { getModule } from "@/knowledge/workspace/modules";
import { nextStage, projectProgress, type ProjectProgress } from "@/knowledge/workspace/progress";
import { validateProject, type ProjectIssue } from "@/knowledge/workspace/validation";
import { recentModules, serializeWorkspace, type Workspace } from "@/knowledge/workspace/workspace";
import { dashboardCopy as copy, timeAgo } from "./copy";
import { StageEditors } from "./stage-editors";
import { STAGE_LINKS } from "./stage-links";
import { StageTimeline } from "./stage-timeline";
import { useWorkspace, workspaceActions } from "./store";

/** The time now, read once per render in the browser; the server never shows relative times. */
const noSubscription = () => () => {};
const useNow = () => useSyncExternalStore(noSubscription, () => Math.floor(Date.now() / 60_000) * 60_000, () => 0);

function StartProject({ onMessage }: { onMessage: (message: string) => void }) {
  const [title, setTitle] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (workspaceActions.start(title)) onMessage(copy.start.started(title.trim() || copy.overview.untitled));
  };
  return (
    <Card as="section" aria-labelledby="start-title" padding="lg" tone="raised" className="grid gap-5">
      <div className="flex items-center gap-3">
        <IconTile icon="layers" size="lg" />
        <h2 id="start-title" className="font-display text-heading font-semibold">
          {copy.start.heading}
        </h2>
      </div>
      <p className="text-text-muted">{copy.start.intro}</p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <TextField id="workspace-start-title" label={copy.start.titleLabel} hint={copy.start.titleHint} value={title} onChange={(event) => setTitle(event.target.value)} />
        <Button type="submit">{copy.start.action}</Button>
      </form>
      <p className="flex items-start gap-2 text-small text-text-muted">
        <Icon name="lock" className="mt-[0.2em]" />
        {copy.start.storage}
      </p>
    </Card>
  );
}

function Overview({ workspace, progress, now }: { workspace: Workspace; progress: ProjectProgress; now: number }) {
  const next = nextStage(progress);
  const review = progress.counts["needs-review"];
  return (
    <Card as="section" aria-labelledby="overview-title" padding="none" tone="raised" className="overflow-hidden">
      <div aria-hidden="true" className="h-1 bg-[linear-gradient(90deg,var(--color-action),var(--color-accent))]" />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid gap-4">
          <h2 id="overview-title" className="font-display text-heading font-semibold text-balance">
            {workspace.draft.projectTitle ?? copy.overview.untitled}
          </h2>
          <div className="grid gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p id="progress-label" className="text-small font-medium">
                {copy.overview.complete(progress.completed, progress.applicable)}
                {review > 0 && <span className="text-warning"> · {copy.overview.review(review)}</span>}
              </p>
              <p className="font-display text-subheading font-semibold tabular-nums" aria-hidden="true">
                {progress.percent}%
              </p>
            </div>
            <div
              role="progressbar"
              aria-labelledby="progress-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percent}
              aria-valuetext={`${progress.percent}%: ${copy.overview.complete(progress.completed, progress.applicable)}`}
              className="h-2.5 overflow-hidden rounded-pill bg-secondary"
            >
              <div className="h-full rounded-pill bg-[linear-gradient(90deg,var(--color-action),var(--color-accent))] transition-[width] duration-(--duration-moderate) ease-emphasized" style={{ width: `${progress.percent}%` }} />
            </div>
            {now > 0 && <p className="text-caption text-text-muted">{copy.overview.lastEdited(timeAgo(workspace.updatedAt, now))}</p>}
          </div>
        </div>
        <div className="grid gap-2 lg:justify-items-end">
          {next ? (
            <>
              <p className="text-caption font-semibold tracking-wide text-text-muted uppercase">{copy.overview.resumeHint}</p>
              <ButtonLink href={STAGE_LINKS[next.stage.id]} size="lg" trailingIcon="arrow-right">
                {copy.overview.resume(next.stage.name)}
              </ButtonLink>
            </>
          ) : (
            <p className="flex max-w-xs items-start gap-2 text-small">
              <Icon name="circle-check" className="mt-[0.2em] text-success" />
              {copy.overview.allDone}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProjectChecks({ issues }: { issues: readonly ProjectIssue[] }) {
  const ordered = [...issues.filter((issue) => issue.severity === "problem"), ...issues.filter((issue) => issue.severity === "suggestion")];
  return (
    <section aria-labelledby="checks-title" className="grid gap-3">
      <h2 id="checks-title" className="text-subheading font-semibold">
        {copy.checks.heading}
      </h2>
      <p className="text-small text-text-muted">{copy.checks.intro}</p>
      {ordered.length === 0 ? (
        <p className="flex items-center gap-2 text-small">
          <Icon name="circle-check" className="text-success" />
          {copy.checks.none}
        </p>
      ) : (
        <ul className="grid gap-3">
          {ordered.map((issue) => (
            <li key={issue.id}>
              <Callout tone={issue.severity === "problem" ? "caution" : "note"} title={`${issue.severity === "problem" ? copy.checks.problem : copy.checks.suggestion}: ${getModule(issue.stage).name}`}>
                <p>{issue.message}</p>
                <p className="mt-1">
                  <Link href={STAGE_LINKS[issue.fixIn]}>{copy.checks.fix(getModule(issue.fixIn).name)}</Link>
                </p>
              </Callout>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentStages({ workspace, now }: { workspace: Workspace; now: number }) {
  const recent = recentModules(workspace);
  return (
    <section aria-labelledby="recent-title" className="grid gap-3">
      <h2 id="recent-title" className="text-subheading font-semibold">
        {copy.recent.heading}
      </h2>
      {recent.length === 0 ? (
        <p className="text-small text-text-muted">{copy.recent.none}</p>
      ) : (
        <ul className="grid gap-1">
          {recent.map(({ stage, savedAt }) => (
            <li key={stage.id}>
              <NextLink href={STAGE_LINKS[stage.id]} className="flex min-h-control-sm items-center justify-between gap-3 rounded-control px-2 text-small hover:bg-hover focus-ring">
                <span className="font-medium">{stage.name}</span>
                {now > 0 && <span className="text-caption text-text-muted">{timeAgo(savedAt, now)}</span>}
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const fileName = (workspace: Workspace) =>
  `researchkit-${(workspace.draft.projectTitle ?? "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project"}.json`;

function ProjectActions({ workspace, onMessage }: { workspace: Workspace | null; onMessage: (message: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);

  const download = () => {
    if (!workspace) return;
    const url = URL.createObjectURL(new Blob([serializeWorkspace(workspace)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(workspace);
    link.click();
    URL.revokeObjectURL(url);
    onMessage(copy.actions.exported);
  };

  const open = async (file: File | undefined) => {
    if (!file) return;
    const result = workspaceActions.import(await file.text());
    setImportError(result.ok ? null : result.reason);
    onMessage(result.ok ? copy.actions.imported : result.reason);
  };

  return (
    <section aria-labelledby="file-title" className="grid gap-3">
      <h2 id="file-title" className="text-subheading font-semibold">
        {copy.actions.heading}
      </h2>
      <p className="text-small text-text-muted">{copy.actions.intro}</p>
      <div className="grid gap-3">
        {workspace && (
          <div>
            <Button variant="secondary" size="sm" onClick={download}>
              <Icon name="download" />
              {copy.actions.export}
            </Button>
          </div>
        )}
        <div className="grid gap-1.5">
          <label htmlFor="workspace-import" className="text-small font-medium">
            {copy.actions.import}
          </label>
          <p id="workspace-import-hint" className="text-caption text-text-muted">
            {copy.actions.importHint} {workspace && copy.actions.replaceWarning}
          </p>
          <input
            id="workspace-import"
            type="file"
            accept="application/json,.json"
            aria-describedby={cx("workspace-import-hint", importError && "workspace-import-error")}
            onChange={(event) => {
              void open(event.target.files?.[0]);
              event.target.value = "";
            }}
            className="text-small file:me-3 file:min-h-control-sm file:cursor-pointer file:rounded-control file:border file:border-border-strong file:bg-surface file:px-3 file:font-medium file:text-text hover:file:bg-hover focus-ring"
          />
          {importError && (
            <p id="workspace-import-error" className="flex items-start gap-1.5 text-small font-medium text-danger">
              <Icon name="alert" className="mt-[0.2em]" />
              {importError}
            </p>
          )}
        </div>
        {workspace &&
          (confirming ? (
            <div role="group" aria-labelledby="confirm-delete" className="grid gap-3 rounded-panel border border-danger/40 bg-danger-soft p-4">
              <p id="confirm-delete" className="text-small font-medium">
                {copy.actions.confirmDelete}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  autoFocus
                  onClick={() => {
                    if (workspaceActions.remove()) onMessage(copy.actions.deleted);
                  }}
                >
                  {copy.actions.confirm}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirming(false);
                    requestAnimationFrame(() => deleteButton.current?.focus());
                  }}
                >
                  {copy.actions.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button ref={deleteButton} variant="ghost" size="sm" className="text-danger" onClick={() => setConfirming(true)}>
                <Icon name="trash" />
                {copy.actions.delete}
              </Button>
            </div>
          ))}
      </div>
    </section>
  );
}

/**
 * The research dashboard: every stage with its status, the project's completion,
 * where to resume, project checks, recent edits, and the stages edited here.
 * Before the browser's project is known, as on the server, it shows the stages alone.
 */
export function WorkspaceDashboard() {
  const snapshot = useWorkspace();
  const now = useNow();
  const [message, setMessage] = useState("");
  const workspace = snapshot?.status === "ready" ? snapshot.workspace : null;
  const issues = useMemo(() => (workspace ? validateProject(workspace.draft) : []), [workspace]);
  const progress = useMemo(() => (workspace ? projectProgress(workspace.draft, workspace.saved, issues) : null), [workspace, issues]);

  return (
    <div className="grid gap-12 py-section-compact">
      <VisuallyHidden role="status" aria-live="polite">
        {message}
      </VisuallyHidden>

      <noscript>
        <Callout tone="info" title={copy.noScript.heading}>
          {copy.noScript.text}
        </Callout>
      </noscript>
      {snapshot?.status === "none" && <StartProject onMessage={setMessage} />}
      {snapshot?.status === "unavailable" && (
        <Callout tone="caution" title={copy.unavailable.heading}>
          {copy.unavailable.text}
        </Callout>
      )}
      {snapshot?.status === "unreadable" && (
        <Callout tone="danger" title={copy.unreadable.heading}>
          <p>
            {copy.unreadable.intro} {snapshot.reason}
          </p>
          <div className="mt-3">
            <Button variant="danger" size="sm" onClick={() => workspaceActions.remove() && setMessage(copy.actions.deleted)}>
              {copy.unreadable.action}
            </Button>
          </div>
        </Callout>
      )}
      {workspace && progress && <Overview workspace={workspace} progress={progress} now={now} />}

      <div className={cx("grid gap-12", workspace && "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-10")}>
        <Section labelledBy="stages-title" spacing="compact" className="py-0">
          <SectionHeader id="stages-title" title={copy.timeline.heading} description={copy.timeline.intro} />
          <StageTimeline progress={progress?.stages ?? null} />
        </Section>
        {(workspace || snapshot?.status === "none") && (
          <aside aria-label={copy.asideLabel} className="grid content-start gap-10 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
            {workspace && <ProjectChecks issues={issues} />}
            {workspace && <RecentStages workspace={workspace} now={now} />}
            <ProjectActions workspace={workspace} onMessage={setMessage} />
          </aside>
        )}
      </div>

      {workspace && progress && (
        <Section labelledBy="editors-title" spacing="compact" className="py-0">
          <SectionHeader id="editors-title" title={copy.timeline.here} />
          <StageEditors key={workspace.id} draft={workspace.draft} progress={progress.stages} />
        </Section>
      )}
    </div>
  );
}
