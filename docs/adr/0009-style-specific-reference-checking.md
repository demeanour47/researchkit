# ADR-0009: Check References Through Style-Specific Checkers Behind One Contract

- **Status:** Proposed
- **Date:** 2026-10-04

## Context

The Reference Checker (Sprint 43) was built for APA 7 alone. One parser found APA's author–date boundary, "(2024).", and read everything else around it; ordering and same-author checks assumed APA's rules.

By Sprint 49 ResearchKit formats six citation systems: APA 7, MLA 9, Chicago author-date, Chicago notes and bibliography, IEEE and Harvard (ADR-0008). Their entries differ at the very first element (where the year sits, whether the author is inverted, whether a number comes first), and so do their citations: (Smith, 2024), (Yu 2020, 45), (LeCun et al. 437), [3] and numbered notes. A single parser or a single citation pattern would be wrong for most of them, and a check that is right in one style is a false error in another.

The constitution asks the checker to be accurate and honest about uncertainty, never to rewrite a writer's work, and to keep domain logic separate from the interface.

## Problem

How should the Reference Checker check several citation styles without one style's rules leaking into another, and without claiming checks it doesn't make?

## Decision

We will check references through one style-specific checker per citation system, behind a shared contract, with only style-neutral work shared.

- **The contract.** Each checker (`src/knowledge/citation/checker/styles/`) implements `StyleChecker`: it reads one entry and reports its problems, checks the list as a whole (order, numbering, year letters), recognises citations or notes in the writer's text, and declares its capabilities: the source types it reads, how its citations identify a source (author and date, author and page, number, or note), what its list is called, how the list is ordered, and whether it uses year letters. The interface uses the capabilities and a per-style list of checks, tested against them, so it never claims a check that isn't implemented.
- **Shared, style-neutral work.** Splitting pasted text into entries, finding DOIs, URLs, years and author boundaries, detecting duplicates (reusing `sourceIdentity`, plus URLs), matching citations to entries, and counting findings are the same for every style and live beside the contract. Matching is by the capability the style declares, never by checking which style is selected.
- **Style grammars, not one pattern.** Author–date citations are read tolerantly, so a citation in a neighbouring style's form is still recognised, and each style supplies its grammar and turns every departure into its own explanation. MLA, IEEE and Chicago notes have their own readers.
- **One issue shape.** Every finding has a category, severity, message, explanation, action and, where there is one, evidence quoted from the pasted text. Institutional variants (Harvard) and limits of the check are information, not errors. Matching is reported as heuristic; text that can't be read confidently is reported as uncertain, not as an error.
- **The checker diagnoses; the generators format.** No checker rewrites, reorders, merges or deletes text. Each checker is tested against its own generator's output, which must produce no errors or warnings, so the two can't drift apart unnoticed.
- **APA continuity.** The original APA parser moved behind the contract with what it reports unchanged, and `checkReferenceList` remains as the APA entry point.

This decision doesn't add external lookups, document-level footnote analysis, automatic correction, or styles beyond the six ResearchKit formats.

## Alternatives Considered

- **One generic parser with style switches.** Rejected: the styles differ from the first element, so the parser would be a set of style branches spread through every step, the pattern the constitution asks us to avoid.
- **Reuse the formatters by re-formatting parsed entries and comparing text.** Rejected for now: parsing pasted text into complete source records is unreliable, so a comparison would report differences the writer didn't make. The generator-agreement tests give the same assurance in the other direction.
- **A checker per style with no shared contract.** Rejected: duplicates, citation matching and reporting would be implemented six times and drift apart.

## Consequences

- Adding a style means adding one checker, its capabilities and its tests; duplicates, matching and the interface need no change.
- Each checker's rules must be kept in step with its generator; the agreement tests fail when they aren't.
- Citation matching is heuristic. It can miss unusual citations and can't see text the writer doesn't paste, and the interface says so.
- The checker carries style knowledge that also exists in the formatters, in reading form. The shared readings (names, links, years) are in one place.

## Future Revisions

Revisit when ResearchKit reads whole documents (for example, footnotes from a word-processor file), when a style needs a check that crosses the contract's boundaries, or when parsing becomes reliable enough to compare entries with formatter output directly.

## References

- [ADR-0006: Share One Citation Source Model Across Citation Styles](0006-shared-citation-source-model.md).
- [ADR-0007: Keep Reference Numbers in the Citation, Not the Source](0007-numeric-citation-numbering.md).
- [ADR-0008: Format Harvard to One Defined Profile](0008-harvard-referencing-profile.md).
