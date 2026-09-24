# Architecture Decision Records

This directory is ResearchKit's permanent record of significant decisions: what was decided, what was rejected, and why.

The rules for ADRs (when one is required, who approves it, numbering, status and supersession) are defined in [ADR-0001](0001-adr-process.md). This page is the practical guide and the index.

## What an ADR is

An Architecture Decision Record is a short document that captures **one** significant decision at the moment it was made: the context, the problem, the options considered, the choice and its consequences. Taken together, ADRs form the history of how and why ResearchKit came to be shaped the way it is.

An ADR is not a design document, a specification or a user guide. It explains a *choice*.

## Why ResearchKit uses ADRs

ResearchKit is built to last for many years and to be worked on by people and AI agents who were not present for earlier decisions. Code shows what the system does; ADRs preserve why. They let new contributors understand the reasoning, keep settled questions settled, and make it obvious when a decision *should* be revisited because its context has changed.

## How to create an ADR

1. **Check whether one is needed.** See the criteria in [ADR-0001](0001-adr-process.md#when-an-adr-is-required). If unsure, ask a maintainer.
2. **Check the index below** for existing ADRs on the same subject. If you are changing an accepted decision, your ADR will supersede that one.
3. **Take the next free number** and create `NNNN-short-kebab-case-title.md` in this directory.
4. **Copy the template below** and fill in every section. Write for a reader years from now who knows nothing of today's discussions.
5. **Set the status to Proposed** and add the ADR to the index.
6. **Submit it for review.** A maintainer accepts or rejects it. Implementation starts only after acceptance.
7. **If it supersedes an earlier ADR,** update that ADR's status to `Superseded by ADR-NNNN` in the same change.

## Template

```markdown
# ADR-NNNN: Title in Plain Words

- **Status:** Proposed
- **Date:** YYYY-MM-DD

## Context

The situation, facts and forces at the time of the decision. Write so that a
reader years from now understands what was true and what mattered.

## Problem

The specific question this decision answers, in one or two sentences.

## Decision

What was decided, stated plainly in the active voice ("We will…").
Include the scope: what this decision covers and what it does not.

## Alternatives Considered

Each credible option, with a fair summary of its merits and the reason it was
not chosen. Include "do nothing" where it was a real option.

## Consequences

The effects of the decision: positive, negative and neutral. Include new
obligations, costs, and risks knowingly accepted.

## Future Revisions

The conditions, signals or thresholds that would justify revisiting this
decision.

## References

Related ADRs (with links), project documents, and external sources.
```

## Naming

- File: `NNNN-short-kebab-case-title.md` (four digits, sequential, never reused).
- Title: `ADR-NNNN: Title in Plain Words`.
- Name the *subject*, not the outcome: `0005-url-strategy.md`, not `0005-use-short-urls.md`. The title then stays accurate even if the decision is superseded.

## Status lifecycle

```
Proposed ──► Accepted ──► Superseded by ADR-NNNN
    │            │
    │            └──────► Deprecated
    └──► Rejected
```

A **Proposed** ADR may be edited freely. An **Accepted** ADR is never rewritten to change its decision; it is superseded by a new one. Full definitions are in [ADR-0001](0001-adr-process.md#status-lifecycle).

## Cross-linking

- Link to other ADRs with relative links, e.g. `[ADR-0001](0001-adr-process.md)`.
- Supersession is always linked **in both directions**: the new ADR says what it supersedes, and the old ADR's status points to its successor.
- Project documents that describe the current system link to the ADRs that explain it, instead of restating their reasoning.
- Where code embodies a non-obvious decision, a brief comment may point to the ADR (e.g. "See ADR-NNNN") instead of re-explaining it.
- Changes that implement an ADR reference it in their description.

## Best practices

- **One decision per ADR.** If you find yourself writing "and also", consider splitting it.
- **Keep it short.** Most ADRs fit on one or two screens. Put the detail in project documentation and link to it.
- **Write for the future reader.** Avoid unexplained jargon, abbreviations and references to conversations that won't be available later.
- **Be fair to the alternatives.** A rejected option described honestly is what stops the question being reopened without new information.
- **State consequences honestly,** including the costs and risks you are accepting.
- **Separate facts from judgement.** Context states what is true; Decision states what you chose.
- **Date everything,** and cite sources for factual claims.
- **Don't record implementation detail.** Record the decision and its reasoning; the architecture documents and code describe the result.
- **AI agents draft; maintainers decide.** An agent may propose and refine an ADR but never marks one as Accepted.

## Index

| ADR | Title | Status |
|---|---|---|
| [0000](0000-product-vision.md) | Product Vision | Proposed |
| [0001](0001-adr-process.md) | Record Architecture Decisions | Proposed |
