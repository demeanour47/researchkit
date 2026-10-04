# ADR-0008: Format Harvard to One Defined Profile

- **Status:** Proposed
- **Date:** 2026-10-04

## Context

Every citation style ResearchKit formatted before Sprint 48 has one authority: the APA Publication Manual, the MLA Handbook, the Chicago Manual of Style, the IEEE Reference Guide. Each tool can say "this is the rule" and cite it.

Harvard has no such authority. It is a family of author-date styles, and universities, departments and publishers each publish their own version. The versions agree on the essentials (author and year in the text, an alphabetical reference list) and differ in punctuation and detail: whether a comma separates name and year, whether the place of publication is given, when et al. is used, how a DOI is introduced, how titles are capitalized. Harvard University itself does not publish a Harvard style.

Cite Them Right (Richard Pears and Graham Shields, 13th edition, Bloomsbury Academic, 2025) is the Harvard guide many universities in the United Kingdom adopt or adapt. It is published by subscription; its rules are publicly reproduced in many university library guides. ResearchKit's style finder already recommends Harvard for assignments in the United Kingdom, Ireland, Australia and New Zealand.

The constitution requires every formatting rule to be correct and cited, forbids exaggerated claims, and asks ResearchKit to state uncertainty rather than invent certainty.

## Problem

Which Harvard should ResearchKit format, and how should it describe what it formats, when no single Harvard exists?

## Decision

We will format Harvard to one defined profile, name it, and disclose it wherever Harvard output appears.

- **The profile is based on Cite Them Right, 13th edition.** Its rules are taken from university library guides that reproduce it (Cumbria, Robert Gordon, West of Scotland, De Montfort, Wolverhampton, Worcester and others), checked against one another. Where those guides disagree, the profile follows the majority and the knowledge layer says so; for example, a DOI follows "Available at:" with no full stop after it.
- **The profile is a ResearchKit decision, not a claim about Harvard.** The generator, its guide and the Harvard style page say that ResearchKit uses a defined Harvard author-date profile, that Harvard varies between institutions, and that writers should check their university's requirements. Every result carries the same notice as information. Nothing describes the profile as official, universal or the only correct Harvard.
- **Known variations are explained, not offered as options.** Where institutions commonly differ (et al. in the reference list, how a title standing in for an author is styled, how year letters are assigned), the result explains the variation as information. The tool doesn't implement institutional variants.
- **Rules the sources don't settle are not guessed.** Paragraph and section locators, whose forms vary, are reported rather than formatted, as other styles do with locators they don't define.
- **Year letters are the writer's.** Letters for works by the same author in the same year (2024a) depend on the writer's whole reference list, so the writer enters a letter and the generator adds it to the reference and both citations. Like reference numbers in ADR-0007, the letter belongs to the citation request, never to the source.
- **The profile formats the shared source model (ADR-0006).** Cite Them Right dates every URL with an access date, including URLs for e-books and journal articles, so `BookSource` and `JournalArticleSource` gain an optional `accessed` date. Other styles ignore it.

This decision covers Harvard as ResearchKit formats it. It does not add institutional variants, a reference list manager or automatic year letters.

## Alternatives Considered

- **Implement several institutional variants with a selector.** Rejected for now: each variant would need its own authoritative source and tests, and a long list of near-identical options invites choosing the wrong one. Variants can be added later on top of a well-tested profile.
- **A "generic Harvard" built from rules most versions share.** Rejected: where versions differ, a generic style must still choose, and calling the result "generic" hides those choices. Naming the basis is more honest and lets writers compare it with their own guide.
- **Follow one university's guide.** Rejected: it would tie ResearchKit to a single institution's local decisions. Cite Them Right is the common source behind many of those guides.
- **Not offering Harvard.** Rejected: Harvard is required for many assignments in the regions the style finder already serves, and a clearly disclosed profile serves those writers better than none.

## Consequences

- Writers get Harvard output whose every rule is explained and traceable, with a plain statement that their university may differ.
- Some writers' universities will differ from the profile. The notice, the variation notes and the guide's list of common differences are how they find out; the tool can't detect their institution's rules.
- The profile depends on secondary reproductions of a subscription work. If Cite Them Right changes, the profile and its tests must be reviewed against new library guidance.
- `BookSource` and `JournalArticleSource` carry a field other styles ignore; a cross-style test shows their output is unchanged.

## Future Revisions

Revisit when:

- a new edition of Cite Them Right is published;
- ResearchKit gains direct access to Cite Them Right, allowing the profile to be checked against it rather than through library guides; or
- writers' needs justify named institutional variants, each with its own authority and tests.

## References

- [ADR-0006: Share One Citation Source Model Across Citation Styles](0006-shared-citation-source-model.md).
- [ADR-0007: Keep Reference Numbers in the Citation, Not the Source](0007-numeric-citation-numbering.md).
- Pears, R. and Shields, G. (2025) *Cite them right: the essential referencing guide*. 13th edn. Bloomsbury Academic.
- University library guides to Cite Them Right Harvard consulted in October 2026: University of Cumbria ("A very quick guide to referencing with Cite them right"), Robert Gordon University, University of the West of Scotland, De Montfort University, University of Wolverhampton, University of Worcester.
