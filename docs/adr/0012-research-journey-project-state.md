# ADR 0012: Keep the Research Journey as Project State Beside the Workspace

Status: Proposed

## Context

Sprint 58 turns ResearchKit's tools into a guided path from an interest to a research proposal, paper or thesis. The workspace already holds the shared project draft in the browser, versioned and validated. It has no notion of document type, notes for stages without a tool, or document sections. Adding accounts, a database or AI is out of scope.

## Decision

- The journey is **derived**, never stored. `buildJourney` reads the workspace draft, its saved-stage record and a small `ProjectState`, and returns every stage's state. Progress counts artifacts the student produced, never page visits.
- `ProjectState` (project type, profile, notes, confirmed stages, section text and status) is stored in its own local-storage key, `researchkit-project`, parsed defensively. The workspace format and its version are unchanged, so existing projects and exports keep working.
- Stages that do not apply (for example sample size in a qualitative study) are not-applicable and do not lower progress.
- Document structures, formatting guidance, readiness and next steps are plain data and pure functions in `src/knowledge/project`. There is no AI and no content generation; the final output is only the student's text, with incomplete sections marked.
- Citations stay with the existing citation generators and Reference Checker.
- The map animates with CSS transitions on the existing motion tokens, so reduced motion switches it off with no extra code. A text list carries the same information as the drawing.

## Consequences

- The journey can be extended by editing stage definitions; no migration is needed.
- The project state is not part of the workspace export file yet. It lives only in this browser.
- Deleting the workspace does not delete the journey, and the reverse.
