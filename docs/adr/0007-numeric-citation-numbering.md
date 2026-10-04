# ADR-0007: Keep Reference Numbers in the Citation, Not the Source

- **Status:** Proposed
- **Date:** 2026-10-04

## Context

ResearchKit's first citation styles (APA, MLA and both Chicago systems) identify a source in the text by its author, its title or a note, so a citation can be built from the source alone, or the source plus a locator and a note context (ADR-0006).

Sprint 47 adds IEEE, a numeric style. An IEEE citation is a number in square brackets, [1], that leads to the entry with that number in the reference list, and numbers are assigned in the order sources are first cited in the writer's document. The same source can be [1] in one paper and [14] in another. Vancouver, also listed in the style finder, works the same way.

## Problem

Where should a reference number live, and what should ResearchKit do about citation order, which depends on a document it never sees?

## Decision

We will treat a reference number as part of how a source is cited, never as part of the source.

- **The source model has no number.** `Source` and `AnySource` describe the work and nothing else. A numeric style's request carries the number: `IeeeReferenceRequest` holds the source, the number as typed, and an optional locator. The numbered entry, “[1] …”, is built by adding the number to a reference formatted from the source alone.
- **Reading numbers is style-neutral.** `src/knowledge/citation/source/numbering.ts` reads numbers as a writer types them (“1, 3, 7”, “4-7”) and reports, without correcting, anything that isn't a valid citation: zero, negatives, non-numbers, malformed ranges and repeats. A list out of ascending order is reported but kept as typed. How numbers are written ([1], [3] or superscripts) belongs to each numeric style.
- **The writer supplies citation order.** A generator that formats one source at a time can't see the writer's document, so it uses the number the writer gives and says plainly that numbers follow the order of first citation. It doesn't number, renumber or sort a reference list, and it doesn't keep a list between visits.
- **Several references by number alone.** Citing several references at once needs only their numbers, so it is a separate input that doesn't need source details.

This decision does not introduce a reference manager, a session collection, or document-wide numbering.

## Alternatives Considered

- **A number field on `Source`.** Rejected: the same work has different numbers in different papers, and every non-numeric style would carry a field it must ignore.
- **A temporary collection that assigns numbers in the order sources are added.** Rejected for now: the order a writer adds sources to a tool isn't the order they are cited in the paper, so automatic numbers would look authoritative and often be wrong. It may be revisited with a document-aware workflow.
- **A generic citation-context framework shared by every style.** Rejected as premature: Chicago notes and bibliography and IEEE each need a small request of their own, and neither yet benefits from a common abstraction beyond the source model.

## Consequences

- IEEE, and later Vancouver, format the same sources as every other style and add numbers only at the citation.
- Writers enter numbers themselves, and the tools explain why. Errors in numbering are the writer's to fix, but the tools catch invalid numbers and repeats.
- The number-reading module must stay free of any one style's punctuation.

## Future Revisions

Revisit if ResearchKit gains a document-aware workflow, such as checking a manuscript's citations against its reference list, where citation order could be read rather than supplied.

## References

- [ADR-0006: Share One Citation Source Model Across Citation Styles](0006-shared-citation-source-model.md).
- IEEE Reference Guide, version 3.28.2025, IEEE Publication Operations, “Citing References”.
