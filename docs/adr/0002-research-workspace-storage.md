# ADR-0002: Keep the Research Workspace in the Researcher's Browser

- **Status:** Proposed
- **Date:** 2026-09-27

## Context

The research methodology tools each rebuilt the project from details the researcher typed into every tool again. Sprint 35 connects them through one shared `ResearchProjectDraft`: each tool reads the project and saves only the stage it owns. The project must therefore outlive a single page, which it never did before: every tool promised that nothing was saved.

ResearchKit has no accounts and no server-side storage, and the constitution requires collecting the least data necessary, in the fewest places, and saying so plainly when work is kept.

## Decision

The workspace is kept **only in the researcher's own browser** (`localStorage`, key `researchkit-workspace`), and only once they start a project on `/workspace`.

- Nothing is sent to a server. Tools keep working on their own, exactly as before, when there is no project, or when the researcher chooses "Use without the workspace".
- The stored data is one versioned JSON document (`Workspace` in `src/knowledge/workspace/workspace.ts`), read through `parseWorkspace`, which refuses anything malformed with a reason rather than half-reading it.
- The researcher can download the project as a file, open it on another device, and delete it. A saved project that can't be read is never overwritten silently.
- Tools save only after the researcher interacts with them, so opening a tool never changes the project, and each visit's changes can be undone.
- Every page that saves says so: the workspace bar on each tool, the privacy section of each workspace tool, and the "Nothing is saved unless…" limitations.

## Alternatives considered

- **Server storage with accounts.** Rejected: accounts are a barrier the constitution rules out for core tools, and holding research data would create privacy and security obligations we don't need.
- **Session storage.** Rejected: a project lost when the tab closes can't support "resume where you left off", which is the point of the workspace.
- **IndexedDB.** Not needed yet: a project is a few kilobytes of JSON. Revisit if projects grow to include imported data such as literature matrices.

## Consequences

- A project lives on one device and browser unless exported; clearing site data deletes it. The page says so.
- Private windows that block storage can't use the workspace; the dashboard explains this, and every tool still works on its own.
- The storage format is now a contract: `WORKSPACE_VERSION` must change, with a migration in `parseWorkspace`, whenever the shape of a saved project changes incompatibly.
