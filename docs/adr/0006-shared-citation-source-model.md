# ADR-0006: Share One Citation Source Model Across Citation Styles

- **Status:** Proposed
- **Date:** 2026-10-04

## Context

ResearchKit's first citation generator, the APA 7 Citation & Reference Builder (Sprints 41–42), and the Reference Checker (Sprint 43) were built around a structured description of a source: its type, contributors, date, title and identifiers. That model, together with the DOI and URL checks, the formatted-text "runs" that carry italics, and the record and validation shapes, all lived under `src/knowledge/citation/apa/` and `src/knowledge/citation/workflow.ts`, because APA was the only style.

None of those pieces is APA-specific. The Literature Matrix already imported `normalizeDoi` from the APA folder. Sprint 44 adds the MLA Citation Generator, and Chicago, IEEE and Harvard are listed as coming soon. Each would otherwise either import APA's folder for neutral concepts or define its own copies.

The constitution asks for one source of truth for each kind of data, and for domain logic that is independent of presentation.

## Problem

Where should the style-neutral citation concepts live so that every citation style can share them without depending on another style?

## Decision

We will keep the style-neutral citation concepts in `src/knowledge/citation/source/`, and every citation style will import them from there:

| Module | Concepts |
|---|---|
| `source.ts` | `Source`, `BookSource`, `JournalArticleSource`, `WebpageSource`, `SourceType`, `SOURCE_TYPES`, `parseSourceType` |
| `contributor.ts` | `Contributor` (person or organization, as typed), `isBlank` |
| `date.ts` | `PublicationDate`, `MONTHS`, calendar validity checks |
| `identifiers.ts` | `normalizeDoi`, `isWebAddress`, `formatPages` (dash normalisation), `ordinal` |
| `runs.ts` | `Run`, `plain`, `italic`, `placeholder`, `mergeRuns`, `plainText` |
| `record.ts` | `SourceRecord`, `CitationRequest`, `CitationLocator`, `ValidationIssue`, `ValidationSeverity` |

- **Styles own their formatting.** How a style writes names, dates, titles, page ranges, identifiers and in-text citations stays in the style's folder (`apa/`, `mla/`). A style never imports another style.
- **APA compatibility.** The modules under `apa/` and `workflow.ts` re-export the moved concepts, so every existing import and test is unchanged and APA output is identical.
- **The model grows additively.** Fields describe the work, not a style's output. A style uses the fields it needs and ignores the rest. Sprint 44 adds `publisher?` and `accessed?` to `WebpageSource` for MLA; APA ignores both.
- **One validation shape.** `ValidationIssue` gains optional `explanation` and `action` fields, so a style can say what is wrong, why it matters and what to do, without a second issue model.
- **Shared form pieces.** The author draft, author fields and run renderer used by every generator live in `src/features/citation/`; each style supplies its own wording.

This decision covers the knowledge-layer boundary and the shared generator interface pieces. It does not cover saving references, collections of references, or the Reference Checker's parser, which remains APA-specific.

## Alternatives Considered

- **Each new style imports neutral concepts from `apa/`.** No files move, but every future style would depend on APA's folder, and APA-specific changes there could break other styles. Rejected.
- **Each style defines its own source model.** Rejected: it duplicates the most important data shape, and a source entered once could not be formatted in several styles.
- **A generic citation framework (a style interface, registry and plug-in formatter).** Rejected for now: two styles don't yet show which abstraction a third needs, and the constitution asks for an abstraction only when a second real use appears. The shared model is the part both styles demonstrably share.

## Consequences

- MLA, and later Chicago, IEEE and Harvard, format the same `Source` without depending on one another.
- `apa/` keeps thin re-export modules for compatibility. New code imports from `source/`; the re-exports can be removed in a later change once nothing uses those paths.
- A change to `source/` affects every style, so it needs tests in every style it touches. Changing the meaning of an existing field requires a new ADR.
- The shared model now carries fields that some styles ignore. Each style's tests must show that unused fields don't change its output.

## Future Revisions

Revisit when:

- a third style needs a behaviour that both existing styles implement separately, which suggests a shared abstraction above the model;
- a source type needs fields whose meaning differs between styles; or
- references are saved or exchanged with other tools, which would make `Source` a stored contract needing versioning.

## References

- `CLAUDE.md`, §4 Engineering Principles: one source of truth; separate knowledge from presentation; reuse deliberately.
- [System architecture](../architecture/system-architecture.md), §5 Domain relationships.
- [ADR-0001: Record Architecture Decisions](0001-adr-process.md).
- MLA Handbook, 9th ed. (2021), and the MLA Style Center, for the MLA rules Sprint 44 implements on this model.
