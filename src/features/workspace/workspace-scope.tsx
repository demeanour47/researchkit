"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, Link, VisuallyHidden } from "@/ui";
import type { ResearchProjectDraft } from "@/knowledge/research/research-project";
import { ownedChanges } from "@/knowledge/workspace/commit";
import { getModule, type ModuleId } from "@/knowledge/workspace/modules";
import type { Workspace } from "@/knowledge/workspace/workspace";
import { scopeCopy as copy } from "./copy";
import { WORKSPACE_PATH } from "./stage-links";
import { useWorkspace, workspaceActions } from "./store";

export interface WorkspaceLink {
  /** The workspace project the tool reads, or null when the tool works on its own. */
  project: ResearchProjectDraft | null;
  /**
   * Offers the tool's current draft to the workspace. Only the stage's own fields are
   * taken, and nothing is saved until the researcher has changed something in the tool.
   */
  save: (source: ResearchProjectDraft) => void;
}

const STANDALONE: WorkspaceLink = { project: null, save: () => {} };
const LinkContext = createContext<WorkspaceLink>(STANDALONE);

/** The workspace connection of the tool this component is part of; standalone outside a `WorkspaceScope`. */
export const useWorkspaceLink = () => useContext(LinkContext);

export interface WorkspaceScopeProps {
  stage: ModuleId;
  /** The tool, which reads its connection with `useWorkspaceLink`. */
  children: ReactNode;
}

/**
 * Connects a tool to the workspace project. The tool starts from the project, and
 * what it changes in its own stage is saved back. A bar above the tool says so, and
 * lets the researcher undo this visit's changes or use the tool on its own.
 */
export function WorkspaceScope({ stage, children }: WorkspaceScopeProps) {
  const snapshot = useWorkspace();
  const [detached, setDetached] = useState(false);
  const [visit, setVisit] = useState(0);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const touched = useRef(false);
  /** The tool's latest draft, offered before the researcher changed anything, saved once they do. */
  const latest = useRef<ResearchProjectDraft | null>(null);
  /**
   * The stage's own fields as last offered. A tool re-offers its draft whenever the
   * project changes, including when another tab saves; only a change in its own
   * fields is the researcher's work, so only that is saved. Otherwise a tab left open
   * would write its older state over newer work from another tab.
   */
  const offered = useRef<string | null>(null);
  /** The project as it was before this visit's first save, for undo. */
  const before = useRef<Workspace | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const workspace = snapshot?.status === "ready" && !detached ? snapshot.workspace : null;
  const definition = getModule(stage);

  const save = useCallback(
    (source: ResearchProjectDraft, force = false) => {
      latest.current = source;
      const own = JSON.stringify(ownedChanges(stage, source));
      const changed = own !== offered.current;
      offered.current = own;
      if (!touched.current || (!changed && !force)) return;
      const current = workspaceActions.current();
      if (!current) return;
      if (workspaceActions.save(stage, source)) {
        if (before.current === null) {
          before.current = current;
          setCanUndo(true);
          setMessage(copy.firstSave(definition.name));
        }
        setSaved(true);
      }
    },
    [stage, definition.name],
  );

  /**
   * The first interaction saves what the tool shows, even when it changes nothing
   * itself, such as a framework drawn from the project that the researcher keeps as is.
   * It runs after React has applied the interaction, so the latest draft is current.
   */
  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    setTimeout(() => {
      if (latest.current) save(latest.current, true);
    }, 0);
  };

  const restart = (nextMessage: string) => {
    touched.current = false;
    latest.current = null;
    offered.current = null;
    before.current = null;
    setCanUndo(false);
    setSaved(false);
    setVisit((count) => count + 1);
    setMessage(nextMessage);
  };

  const undo = () => {
    if (before.current && workspaceActions.restore(before.current)) restart(copy.undone);
  };

  const project = workspace?.draft ?? null;
  const link = useMemo<WorkspaceLink>(() => ({ project, save }), [project, save]);
  // Remounting on a new project, or after undo, makes the tool start again from the project.
  const key = workspace ? `${workspace.id}-${visit}` : `standalone-${visit}`;

  return (
    <>
      {snapshot && (snapshot.status === "ready" || snapshot.status === "none") && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-panel border border-border bg-sunken px-4 py-3 text-small print:hidden">
          {workspace ? (
            <>
              <p className="flex items-center gap-2">
                <Icon name={saved ? "circle-check" : "layers"} className={saved ? "text-success" : "text-action"} />
                <span>
                  {saved ? copy.saved : copy.connected}{" "}
                  <Link href={WORKSPACE_PATH}>{workspace.draft.projectTitle ?? copy.untitled}</Link>
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {canUndo && (
                  <Button variant="ghost" size="sm" onClick={undo}>
                    {copy.undo}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setDetached(true); restart(copy.detached); }}>
                  {copy.detach}
                </Button>
              </div>
            </>
          ) : detached ? (
            <>
              <p className="flex items-center gap-2 text-text-muted">
                <Icon name="info" />
                {copy.standalone}
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setDetached(false); restart(copy.reconnected); }}>
                {copy.reconnect}
              </Button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-text-muted">
              <Icon name="layers" />
              <span>
                {copy.invitation} <Link href={WORKSPACE_PATH}>{copy.invitationLink}</Link>
              </span>
            </p>
          )}
        </div>
      )}
      <VisuallyHidden role="status" aria-live="polite">
        {message}
      </VisuallyHidden>
      <div
        onInputCapture={touch}
        onChangeCapture={touch}
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest("button, [role=option], input, select")) touch();
        }}
      >
        <LinkContext.Provider key={key} value={link}>
          {children}
        </LinkContext.Provider>
      </div>
    </>
  );
}
