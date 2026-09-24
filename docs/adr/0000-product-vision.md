# ADR-0000: Product Vision

- **Status:** Proposed
- **Date:** 2026-09-24

## Context

Students, researchers and educators rely on a large number of small tools: citation formatters, statistics calculators, writing aids, study utilities. Most of these are offered by sites that fall into familiar patterns:

- **Freemium funnels** that give away a partial result and charge for the rest.
- **Advertising-driven pages** that bury the tool under clutter, slow it down and track the user.
- **Account walls** that demand sign-up or an email address before a result can be used.
- **Answer machines** that produce output without showing how it was derived or whether it is correct.

Academic work has a stricter requirement than most domains. A wrong citation format, a misapplied statistical test or an unsupported claim has real consequences for grades, publications and research integrity. The people most affected are often the least able to pay, and many work on slow connections, modest devices or with assistive technology.

At its founding, ResearchKit set out to become a comprehensive, free library of academic tools and guides serving a worldwide audience at very large scale.

This ADR is numbered `0000` because every later decision depends on it.

## Problem

What is ResearchKit for, and what will it refuse to be? Without a recorded answer, every later decision (technical, design, content or commercial) risks drifting towards the patterns above, one reasonable-sounding compromise at a time.

## Decision

### Why ResearchKit exists

ResearchKit exists to make rigorous academic work easier for everyone by providing tools that are **exact, free, private and a pleasure to use**, and by **teaching the ideas behind them**.

### Who it serves

- **Students** at every level, who need correct results quickly and want to understand them.
- **Researchers**, who need results they can trust, check and cite.
- **Educators**, who need resources they can confidently recommend to their students.
- **Librarians and institutions**, who need tools that meet their standards for accuracy, privacy and accessibility.
- **Independent learners**, and anyone else doing careful intellectual work.

It serves them wherever they are: in any country, on any device, over any connection, and with any assistive technology.

### What problems it solves

- Getting academic mechanics right (formatting, calculation, structure) without needing expertise in every convention.
- Understanding *why* a result is correct, so people become more capable instead of more dependent.
- Access: removing cost, accounts, clutter and technical barriers between people and good tools.
- Trust: offering one place whose results can be checked against cited authorities.

### What success looks like

- Researchers trust our results enough to rely on them.
- Educators recommend ResearchKit to their students.
- Institutions point to it as an example of how academic software should be made.
- People return because it helped them, not because it trapped them.
- People leave having learned something, not only having received an answer.

### What ResearchKit deliberately refuses to become

- **A paywall or upsell funnel.** Core tools are never gated by payment, accounts or data capture.
- **An advertising-driven clutter site.** Nothing is allowed to degrade the tool, the reading experience or the user's privacy for revenue.
- **A tool for academic dishonesty.** We do not build features whose primary purpose is to pass off others' work as one's own or to evade academic-integrity safeguards.
- **A replacement for human judgement.** Automation, including AI, assists people; it does not decide for them or present guesses as certainty.
- **A data business.** User work and behaviour are not a product.
- **An attention trap.** We measure success by usefulness and learning, not by time captured.
- **A content farm.** Scale never excuses pages that are thin, duplicated or unhelpful.

### Core values

- **Accuracy:** correctness grounded in authoritative sources.
- **Honesty:** nothing invented, exaggerated or presented as more certain than it is.
- **Education:** teaching is the purpose; automation is a means.
- **Privacy:** people's work belongs to them.
- **Accessibility:** everyone can use what we build.
- **Respect:** for people's time, attention, intelligence and autonomy.
- **Craft:** care in every detail, because quality is itself a form of trustworthiness.

### Long-term vision

ResearchKit becomes the trusted default for academic tools worldwide: a comprehensive library covering the whole research lifecycle, from planning and finding sources through reading, writing, citing and analysis to presenting and publishing. It is available in the languages people work in, usable on every device and connection, and recommended by the institutions its users belong to. Every tool teaches as well as it computes.

### Non-negotiables

The operative statement of ResearchKit's non-negotiables is maintained in `CLAUDE.md` (Non-Negotiables) and is not repeated here. This ADR records **why** they are non-negotiable:

- **Accuracy**, because an incorrect academic result harms the people who trusted it, and trust lost this way is rarely regained.
- **Honesty**, because a trustworthy reference cannot make untrustworthy claims about itself.
- **Privacy**, because academic work is often unpublished, personal or sensitive.
- **Security**, because privacy and trust cannot survive a system that is easy to abuse.
- **Accessibility**, because a tool that excludes some of its audience fails the mission of serving everyone.
- **Performance**, because many of the people we serve use slow networks and modest devices.
- **Respect**, because manipulative design is incompatible with an educational mission.

## Alternatives Considered

- **A freemium product with a premium tier.** Rejected: it conflicts with serving those least able to pay, and turns every design decision into a negotiation between user benefit and conversion.
- **An advertising-maximising tools site.** Rejected: it is the dominant pattern in this space, and the source of the clutter, slowness and tracking ResearchKit exists to avoid.
- **An AI-first writing assistant.** Rejected as the core identity: it risks replacing learning and judgement instead of supporting them, and aligns poorly with academic integrity. AI may still assist where it serves the principles above.
- **A narrow specialist tool** (for example, citations only). Rejected: people's needs span the whole research lifecycle, and a coherent library serves them better than a single utility.

## Consequences

- **Positive:** A clear, stable identity that guides decisions across technology, design, content and business, and a basis for trust with students, educators and institutions.
- **Negative:** Growth may be slower than for competitors willing to use aggressive tactics. Accuracy, education and accessibility require more expert effort per tool and per page.
- **Obligation:** Any future revenue model must be compatible with this vision. Choosing one is a separate decision requiring its own ADR.
- **Obligation:** Expert review and cited sources become part of the cost of every tool and guide.

## Future Revisions

This vision is intended to endure. Revisit it only if the needs of the people it serves change fundamentally, or if ResearchKit cannot be sustained without compromising a non-negotiable. In that case, the compromise must be decided openly in a superseding ADR, never drifted into.

## References

- `CLAUDE.md`: Mission; Product Philosophy; Non-Negotiables
- [ADR-0001: Record Architecture Decisions](0001-adr-process.md)
- [ADR README](README.md)
