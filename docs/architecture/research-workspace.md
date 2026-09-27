# Research workspace

How the research methodology tools share one project. The storage decision is ADR-0002.

## Layers

| Layer | Location | Job |
|---|---|---|
| Project model | `src/knowledge/research/research-project.ts` | `ResearchProjectDraft`: every field, cleaned on every change. Framing (`PROJECT_CONTEXT_FIELDS`), shared tool fields (`PROJECT_FIELDS`) and accepted results (`PROJECT_RECORD_FIELDS`). |
| Workspace knowledge | `src/knowledge/workspace/` | Pure TypeScript: stages and which fields each owns (`modules.ts`), committing one stage (`commit.ts`), the saved container and file format (`workspace.ts`), progress (`progress.ts`), project checks (`validation.ts`), stage order (`navigation.ts`). |
| Browser store | `src/features/workspace/store.ts` | Reads and writes the one saved workspace; every component sees it through `useSyncExternalStore`. |
| Tool connection | `src/features/workspace/workspace-scope.tsx` | `WorkspaceScope` around a tool; the tool calls `useWorkspaceLink()` for the project to read and `save()` for its draft. |
| Pages | `/workspace`, `ToolPageLayout` | The dashboard; stage navigation and next-stage links on every workspace tool. |

## Rules

- **One owner per field.** A stage saves only the fields in its `owns` list; `commitModule` ignores everything else. The named independent and dependent variable lists are the one overlap: the question names them, and the Variables Builder keeps all the lists in step with the defined variables.
- **Tools read the project, not retyped details.** In the workspace, a tool's project step becomes a summary of the stages it `reads`, each linking to where it is edited. The Research Question Builder is the exception: its project details are its own stage.
- **Results worked out from the project are accepted, not stored.** The analysis plan and assumption checklist keep only the accepted method ids; comparing them with a fresh calculation shows when the project has moved on.
- **Nothing changes until the researcher does something.** A tool offers its draft on every render, but it is saved only after an interaction, and saving identical fields records nothing.

## Progress

Each stage is Not started, In progress (with what is missing), Completed, Needs review (with why) or Not needed (statistical stages in qualitative projects). A completed stage needs review when a stage it `dependsOn` was saved after it, when accepted analyses no longer match the project, or when a project check finds a problem in it. The percentage counts completed stages among those that apply.

## Bundle size

`src/features/workspace` has no barrel file on purpose: import each module by file. The dashboard carries the analysis engine for progress and checks, and a barrel import from a shared layout put it in every tool's bundle (about 100 KB gzipped).

## Adding a tool to the workspace

1. Give its stage an entry in `MODULES`, with the fields it owns, reads and depends on.
2. Wrap its form in `WorkspaceScope`; seed its state from `link.project` and call `link.save(draft)` when its output changes.
3. Add its address to `STAGE_LINKS`, and tests to `src/knowledge/workspace/`.
