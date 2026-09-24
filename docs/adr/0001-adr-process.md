# ADR-0001: Record Architecture Decisions

- **Status:** Proposed
- **Date:** 2026-09-24

## Context

ResearchKit is intended to be maintained for many years by a changing group of people and AI agents. Over that time, most of the people who made the early decisions will not be present when those decisions are questioned. Code shows *what* the system does. It rarely shows *why* it was built that way, which alternatives were rejected, or which constraints no longer apply.

The project constitution (`CLAUDE.md`) requires that significant decisions be approved before implementation and that some of them be recorded as Architecture Decision Records (ADRs). This record defines how that works.

## Problem

Without a durable record of decisions:

- future contributors re-argue settled questions, or unknowingly reverse decisions whose reasons they cannot see;
- AI agents, which start each session without memory, fill the gaps with assumptions;
- the reasoning behind a decision disappears when the people who made it move on;
- it becomes impossible to tell whether a constraint is still essential or a leftover.

We need a lightweight, permanent and discoverable way to record significant decisions and their reasoning, one that people and AI agents can read and write equally well.

## Decision

ResearchKit records significant decisions as **Architecture Decision Records**: short Markdown documents stored in the repository under `docs/adr/`, versioned together with the code they govern.

### When an ADR is required

The criteria are set by `CLAUDE.md` (Working Together). An ADR is required when a decision:

- is costly to reverse;
- constrains future work across the system;
- chooses between credible alternatives that a future engineer might reasonably revisit; or
- changes or supersedes an earlier ADR.

Typical examples: the overall system architecture, the rendering and caching strategy, the structure of tools, the public address scheme, the source of truth for content, the adoption of a significant dependency or external service, and policies on privacy, data handling or third parties.

An ADR is usually **not** required for decisions that are easy to reverse, local to one part of the system, or already governed by an existing ADR or standard. Examples: choosing a helper's internals, adding a tool that follows the established pattern, or fixing a defect.

Every ADR needs approval, but not every approval needs an ADR. When unsure whether a decision needs one, ask. A short ADR costs far less than a lost rationale.

### Timing

An ADR is written **before** the decision is implemented. Exploratory prototypes may be built to inform an ADR. They are treated as disposable and are not merged as the implementation until the ADR is accepted.

### Who approves

- **Anyone may propose an ADR,** human or AI agent.
- **Only maintainers accept, reject or deprecate ADRs.** This follows the constitution: maintainers own product, design and architectural decisions.
- An AI agent may draft, revise and recommend an ADR, but must never mark one as Accepted on its own authority.
- Approval is recorded by the maintainer changing the status to Accepted, through the project's normal review process.

### Numbering and naming

- ADRs are numbered with four digits, sequentially, starting at `0000`.
- A number is assigned when the ADR is first proposed. Numbers are never reused, including for rejected ADRs.
- File names follow `NNNN-short-kebab-case-title.md`, and the document title follows `ADR-NNNN: Title in Plain Words`.
- Titles name the decision's subject (for example, "URL Strategy"), so they stay accurate even if the decision is later superseded.

### Status lifecycle

| Status | Meaning |
|---|---|
| **Proposed** | Under discussion. May be edited freely. |
| **Accepted** | Approved by a maintainer. The decision is in force. |
| **Rejected** | Considered and declined. Kept as a record of what was ruled out and why. |
| **Deprecated** | No longer relevant (for example, the thing it governed was removed), with no replacement. |
| **Superseded by ADR-NNNN** | Replaced by a later ADR, which links back to this one. |

### How ADRs are updated

An accepted ADR is a historical record. **Its decision and reasoning are never rewritten.** The only permitted edits to an accepted ADR are:

- changing its status (Deprecated, or Superseded by ADR-NNNN);
- adding links to related or superseding ADRs;
- correcting typos or broken links without changing meaning;
- adding references.

To change an accepted decision, write a new ADR. The new ADR explains what changed and why, and marks itself as superseding the earlier one; the earlier ADR's status is then updated to point forward. Reading the chain of ADRs then tells the full story of how the decision evolved.

### Structure

Every ADR uses the same sections, in the same order: Title, Status, Date, Context, Problem, Decision, Alternatives Considered, Consequences, Future Revisions and References. The template lives in the [ADR README](README.md).

- **Context:** the facts and forces at the time, written so a reader years later understands the situation.
- **Problem:** the specific question the decision answers.
- **Decision:** what was decided, stated plainly and in the active voice.
- **Alternatives Considered:** each credible option, with the reason it was not chosen.
- **Consequences:** positive, negative and neutral effects, including new obligations and risks accepted.
- **Future Revisions:** the conditions or signals that would justify revisiting the decision.
- **References:** related ADRs, documents and external sources.

### How ADRs relate to other knowledge

Each kind of project knowledge answers a different question and changes at a different pace. Information lives in exactly one place; the others link to it.

| Kind | Answers | Changes | Lives in |
|---|---|---|---|
| **Constitution** | Who are we, and how do we work? | Rarely, deliberately | `CLAUDE.md` |
| **ADR** | Why was it decided this way, and what was rejected? | Never rewritten; superseded | `docs/adr/` |
| **Architecture** | How is the system built *now*? | As the system evolves | `docs/architecture/` |
| **Standards** | What measurable bar must work meet? | When the bar is raised or refined | `docs/standards/` |
| **Documentation** | How do I use, run, contribute to or perform tasks in the project? | Whenever practice changes | `README.md`, `CONTRIBUTING.md`, `docs/playbooks/`, `docs/product/` |
| **Implementation** | What does the system actually do? | Continuously | The code itself |

An ADR records a decision *at a point in time*. Architecture documents describe the *current* result of all decisions taken so far. Standards define the bar that implementation must meet. Implementation is the only source of truth for actual behaviour. Where implementation and a document disagree, the disagreement is raised and resolved, never silently ignored.

## Alternatives Considered

- **No formal record.** Rely on code, commit history and memory. Rejected: history shows what changed but rarely why, and memory does not survive changes of people or AI sessions.
- **An external wiki or document tool.** Rejected: it separates decisions from the code they govern, is not versioned with it, and is easily lost when tools change.
- **Decisions recorded only in pull requests or issues.** Rejected: hard to discover, scattered, and tied to a single hosting provider.
- **A heavyweight RFC process.** Rejected for now: too much ceremony for a small team. The ADR format can grow into it if the contributor base grows.
- **The minimal classic ADR format (Context, Decision, Consequences).** Considered and extended. The explicit Problem, Alternatives Considered and Future Revisions sections make the reasoning reviewable and tell future readers when to reconsider.

## Consequences

- **Positive:** Decisions and their reasoning survive changes of people, tools and AI sessions. New contributors and AI agents can learn why the system is shaped as it is, and settled questions stay settled unless something material changes.
- **Positive:** Writing an ADR forces the trade-offs to be stated before implementation, when changing course is cheapest.
- **Negative:** Significant decisions take slightly longer, and the ADR collection must be maintained, especially the status and supersession links.
- **Risk accepted:** ADRs can drift from reality if superseding decisions are implemented without new ADRs. Review practice must catch this.

## Future Revisions

Revisit this process if ADRs are routinely skipped, are consistently too heavy for the decisions they record, or if the contributor base grows enough to need a formal RFC or review-board process.

## References

- `CLAUDE.md`: Working Together; Documentation Architecture
- [ADR README](README.md): template, index and practical guidance
- [ADR-0000: Product Vision](0000-product-vision.md)
- Michael Nygard, "Documenting Architecture Decisions" (2011)
- Architecture Decision Records community resources: <https://adr.github.io>
