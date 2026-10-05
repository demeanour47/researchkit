# ADR-0010: Organise Learn by Research Stage, with Declared Guide-to-Guide Links

- **Status:** Proposed
- **Date:** 2026-10-04

## Context

By Sprint 55, Learn had 18 published guides and 15 planned ones in five subject categories: Citation, Research Methods, Writing, Statistics and Academic Skills. Each guide declared the tools it supports, so a guide linked to its tools and each tool page listed its guides. Guides didn't declare each other: a guide reached another only through hand-written links inside its content, so most guides had no route to the next thing a reader needs, and nothing could check those routes.

Categories answer "what is this about?" Researchers also ask "what do I do next?", and they move through a project in stages: planning a question, reviewing literature, designing a study, analysing data, writing, citing, reporting and finalising. Learn didn't show that sequence.

Where each guide sits in the catalogue (its category) was written inside a module that imports through the `@/` path alias, which the test runner doesn't resolve (TESTING.md), so the catalogue's integrity wasn't tested.

## Problem

How should Learn show the research workflow and connect guides to each other without duplicating content, adding a content system, or breaking published addresses?

## Decision

We will organise Learn by research stage alongside subject category, and make guide-to-guide links part of each guide's data.

- **Guide placement is data.** `src/domains/catalogue/guide-plan.ts` lists every catalogued guide once, in reading order, with its category and its research stage. It has no imports, so tests can check it. The catalogue (`guides.ts`) builds its listings from it; a published guide's title and description still come from the guide itself.
- **Nine research stages.** Discover, Plan, Review, Design, Collect and analyse, Write, Cite, Report, Finalise. Each guide belongs to exactly one stage, the one where a reader most needs it. A guide relevant to several stages is linked from the others, never duplicated.
- **Related guides are declared.** Every guide has `relatedGuideSlugs`, rendered as a "Related guides" section beside its related tools. Tests check that each points to a published guide, that a guide doesn't list itself, and that every guide has at least one.
- **The Learn page shows the workflow.** The guides index shows the stages in order, each with its guides, above the existing category directory, using the directory's existing highlights slot and existing components. Search matches a guide's stage and the names of its related tools as well as its title and description.
- **No new renderer or content system.** Guides keep the existing block types. Addresses don't change.

This decision doesn't add a sitemap or canonical addresses: both need the production domain, which isn't recorded in the repository yet.

## Alternatives Considered

- **Stages instead of categories.** Simpler to show, but readers also browse by subject, and the categories are already published and familiar. Rejected in favour of both views.
- **Guides in several stages.** More places to find a guide, but a guide would appear repeatedly and the workflow view would blur. Rejected; related-guide links cover the overlap.
- **Related guides derived automatically** (same category, or shared tools). No upkeep, but the links would reflect classification rather than what a reader should read next. Rejected.
- **Keep hand-written links only.** No schema change, but no guarantee of coverage and no test of validity. Rejected.

## Consequences

- Every new guide must name its stage (in the plan) and its related guides (in the guide). Tests fail until it does.
- The plan, not the catalogue module, is now where a guide is added to Learn.
- Stage boundaries are judgements and may be revisited; moving a guide between stages changes no address.
- Global search and the Learn directory find guides by stage and related tool, so their wording becomes part of what readers search for.
- References may now carry a `url` for works published only on the web, without a DOI, such as the Office of Research Integrity's guide to ethical writing. Every rendering of a reference (the guide's list, plain text, Markdown and HTML export) shows the DOI link, or else the URL.
- Guides whose examples come from a tool are tested against that tool, so the guide and the tool can't drift apart.

## Future Revisions

Revisit if Learn grows to the point that a stage holds too many guides to scan, or if a production domain is recorded and a sitemap is added.
