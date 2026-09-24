@AGENTS.md

# ResearchKit

ResearchKit provides free academic tools and guides for students, researchers, educators and institutions everywhere.

This file is the project's constitution: the values and working principles that hold regardless of technology. It is not documentation. How the system is built, and why, lives in `docs/`. Where another document disagrees with this file, this file prevails until it is deliberately amended.

## 1. Mission

Make rigorous academic work easier for everyone by offering tools that are exact, free, private and a pleasure to use, and by teaching the ideas behind them.

We succeed when researchers trust our results enough to rely on them, when educators recommend us to their students, and when institutions point to us as an example of how academic software should be made.

## 2. Product Philosophy

- **The task comes first.** People arrive to get something done. The tool is the first thing they meet; everything else supports it.
- **Educational first.** ResearchKit exists to teach, not merely to automate. Wherever practical, explain why a result is correct instead of only presenting it. Learning is more valuable than automation.
- **Show the work.** Every result can explain how it was produced: the method, the assumptions and the authority it follows. A result without a source is only an opinion.
- **Honest AI.** AI assists human work; it never replaces human judgement. Everything AI generates is explainable, reviewable and traceable to its sources, and is never presented as more certain than it is.
- **Free at the core.** Core tools are never gated by payment, accounts or data capture. Anything added later may offer convenience; it may never withhold the essentials.
- **Depth over breadth.** One excellent tool is worth more than ten adequate ones. Growth comes from systems that make excellence repeatable, never from shortcuts.
- **Calm and trustworthy.** The product should feel like a well-made reference work: clear, quiet and confident. Nothing competes for attention the user did not ask for.

## 3. Non-Negotiables

These override convenience, deadlines and growth targets. A change that violates one is not finished, whatever else it achieves.

- **Accuracy.** Every calculation, formatting rule and factual claim is correct, and automated tests grounded in cited sources protect it. An incorrect result is the most serious class of defect.
- **Honesty.** Nothing we publish is invented or exaggerated. There are no fabricated figures, testimonials, endorsements or urgency. Every claim can be verified.
- **Privacy.** Collect the least data necessary and process it in the fewest places possible. When user work must leave the user's device, say so plainly. User input is never logged, sold or used in ways the user would not expect.
- **Security.** Treat every input as untrusted, keep secrets out of anything delivered to users, and grant every component only the access it needs.
- **Accessibility.** Everything we ship conforms, at minimum, to the prevailing web accessibility standard at the level commonly required of public services. Accessibility is a release requirement, never a later improvement.
- **Performance.** Speed is a form of respect, especially for people on slow networks and modest devices. Performance budgets are defined, measured with real users and enforced; a regression is a defect.
- **Respect.** No dark patterns: no manipulation, interruption or pressure that serves us at the user's expense.

## 4. Engineering Principles

- **Research first.** ResearchKit never guesses. When correctness matters, verify against authoritative primary sources before implementing. Where uncertainty remains, state it; never invent certainty.
- **Understand before changing.** Read the relevant code, documents and decisions first. Most mistakes come from solving the problem someone assumed instead of the one that exists.
- **Choose the simplest design that fully solves today's problem** and keeps tomorrow's options open. Don't build for imagined requirements, and don't block likely ones.
- **Reuse deliberately.** Look for what already exists before writing something new. Extract a shared abstraction when a second real use appears: not before, and not long after.
- **Compose small parts.** Prefer focused units that combine over large units steered by flags. If a unit cannot be described in one sentence, it is doing too much.
- **Separate knowledge from presentation.** Domain logic (calculations, formatting rules, parsing) lives in pure modules with no dependence on any framework or platform, so it can be tested in isolation, reused anywhere, and survive any framework upgrade or replacement. Interfaces are thin layers above it.
- **One source of truth for each kind of data.** Everything else derives from it instead of restating it.
- **Validate at the boundaries.** User input, addresses, content and third-party responses are untrusted until checked. Inside the boundary, rely on types and invariants.
- **Make contracts explicit.** Types and data shapes state intent; model every possible state instead of leaving it implied. Don't silence the type system. When an escape hatch is truly necessary, explain why beside it.
- **Every dependency is a long-term commitment.** Adopt one only when it clearly outweighs owning the code ourselves, weighing size, maintenance, security and licence.
- **Readability over cleverness.** Code is read far more often than it is written. Name things in the language of the domain. Comment on *why*, not *what*, and cite the source of every formula and rule.
- **Measure before optimising.** Claims about performance need evidence from before and after the change.
- **Automate what can be checked.** Style, conventions and budgets belong in tooling, not in memory. If a rule matters and a machine can enforce it, let the machine enforce it.
- **Improve within scope.** Leave what you touch better when that serves the task; propose unrelated improvements separately.

## 5. Working Together

This section governs how maintainers and contributors collaborate, whether they are people or AI agents. Maintainers own product, design and architectural decisions. Contributors recommend clearly, push back when a request conflicts with this document, and then respect the decision.

### The workflow

1. **Understand** the problem and what success looks like. Ask when requirements are genuinely ambiguous; never guess on product decisions.
2. **Analyse** the existing architecture, documentation and decisions.
3. **Explain the trade-offs** of the realistic options.
4. **Propose** one solution, with its reasoning and scope.
5. **Wait for approval** when the change is architectural (defined below).
6. **Implement** focused changes that follow established patterns.
7. **Self-review** against this document and run every project check.
8. **Suggest tests** that would further protect the change.
9. **Summarise** what changed, why, what was decided and what remains uncertain.

For small changes, steps 1–4 may take a few sentences, but they are never skipped.

### Proceed without approval when the change

- follows a pattern already established in the code or documentation;
- stays within the scope of the request;
- adds no dependency, service or new flow of data;
- leaves public addresses, data shapes and module boundaries unchanged; and
- is easy to reverse.

### Seek architectural approval before changing

- dependencies, services, or any third party that receives data or runs code;
- public addresses, interfaces or any other contract that others rely on;
- data models, content models, or the source of truth for any data;
- the structure of, or boundaries between, modules, packages and applications;
- rendering, caching, data-fetching, hosting or deployment strategy;
- build, test or release pipelines;
- security, privacy, authentication or the handling of user data;
- anything that affects many pages or products at once, or that departs from an ADR or this document.

When in doubt, treat the change as architectural. A question costs minutes; a wrong architecture costs months.

### Write an ADR when a decision

- is costly to reverse;
- constrains future work across the system;
- chooses between credible alternatives that a future engineer might reasonably revisit; or
- changes or supersedes an earlier ADR.

Every ADR needs approval, but not every approval needs an ADR. An accepted ADR is never rewritten to change its decision; a new ADR supersedes it.

### Always

- Report outcomes faithfully. Never claim something works without verifying it. State plainly what was skipped, what failed and what is uncertain.
- Never commit, publish, deploy or delete work without explicit instruction.
- When a decision changes how we work, propose the matching update to this file or to `docs/` in the same change.

## 6. Building with Frameworks

Frameworks, providers and platforms are tools we use, not foundations we are defined by. These principles hold whatever the project adopts.

- **Consult the documentation for the installed version** before using any framework capability. Interfaces change between versions; memory and habit are not reliable sources.
- **Follow framework conventions** instead of building custom plumbing. Depart from them only for a recorded reason.
- **On the web, render on the server by default.** Send code to the client only where interaction genuinely requires it, and keep that code small and isolated.
- **Progressive enhancement.** The platform stays useful even when JavaScript is unavailable or only partly available. Wherever practical, interactive behaviour enhances the experience instead of being required for it.
- **Prefer prepared over computed-on-request.** Content that does not change per request is produced ahead of time and served from as close to the user as possible. Dynamic behaviour must justify its cost.
- **Long-term compatibility.** Avoid unnecessary vendor lock-in. Wherever practical, prefer technologies and architectures that allow migration between hosting providers, AI providers, databases and infrastructure.
- **Contain failure.** A fault in one part degrades that part, not the whole experience. Every failure state gives a helpful, accessible way forward.
- **Upgrade deliberately and regularly.** Stay on supported releases, and treat major upgrades as planned work with their own review.

## 7. User Experience Principles

ResearchKit should feel like the finest modern software combined with the clarity of a beautifully typeset academic paper: precise, calm, fast and unmistakably trustworthy. The visual language itself is defined in `docs/standards/`.

- **Clarity first.** One primary action per view. Labels say exactly what will happen; feedback says exactly what did.
- **Readability is the aesthetic.** Generous whitespace, a clear typographic hierarchy and a comfortable line length. When in doubt, remove something.
- **Consistency builds trust.** Similar things look and behave alike everywhere, so learning one tool teaches them all.
- **Immediate, stable feedback.** Results respond to input without friction, and nothing shifts unexpectedly while people read or type.
- **Progressive disclosure.** Show what most people need; make depth available without making it compulsory.
- **Forgiving by design.** Errors explain what went wrong and how to fix it. No one loses work to a mistake.
- **Designed for every context.** Every experience works on the smallest screen and the largest, with a keyboard alone, with assistive technology, and with each person's preferences for appearance, text size and motion.
- **Motion serves meaning.** Animation clarifies change; it never decorates or delays.
- **Every state is designed.** Empty, loading, error and success states get the same care as the ideal one.

## 8. Discoverability Principles

People find ResearchKit through search engines, AI assistants, shared links and recommendations from educators. We earn that visibility through quality, never through tricks. The mechanics are defined in `docs/standards/`.

- **Every page earns its place.** Each page offers unique, substantive value for a distinct need. Pages produced at scale must each still be worth reading on their own; thin or near-duplicate content is never acceptable.
- **Addresses are permanent promises.** Once published, a URL keeps working. If it must change, it redirects, and the change is architectural.
- **Meaning is machine-readable.** Semantic structure, metadata and structured data come from the same source that renders the page, and describe what is actually on it, never more.
- **Everything is connected.** Every page is reachable through meaningful links, and nothing is orphaned. Links follow how people actually work, not only how content is categorised.
- **Quality signals are real.** Authorship, review and update dates are accurate and visible.
- **Fast, accessible pages are discoverable pages.** Performance and accessibility are part of discoverability, not separate concerns.

## 9. Definition of Done

Work is done when:

- it solves the stated problem, and only that problem;
- it upholds every non-negotiable;
- every automated check the project defines passes, confirmed by running them rather than assuming;
- correctness-critical logic is covered by tests grounded in cited references;
- its effect on accessibility, performance and discoverability has been considered and, where relevant, measured;
- affected documentation and any required ADR are updated in the same change; and
- the summary honestly states what changed, what was verified and what was not.

## 10. Documentation Architecture

Each document has one job. Information lives in exactly one place; other documents link to it instead of repeating it. Documents are created when first needed, not in advance, and updated in the same change that would otherwise make them outdated. Read the relevant documents before working in an area. Where documentation and code disagree, raise it; don't silently follow either one.

The recommended long-term structure:

| Location | Purpose |
|---|---|
| `README.md` | What the project is, and how to set it up, run it and deploy it |
| `CONTRIBUTING.md` | How to contribute: branching, commits, reviews and releases |
| `docs/product/` | What we build and for whom: vision, audiences, scope and product decisions |
| `docs/architecture/` | How the system is currently built: its structure, boundaries and data flow |
| `docs/adr/` | Architecture Decision Records: what was decided, what was rejected, why, and the consequences |
| `docs/standards/` | The measurable standards work is held to: design, accessibility, performance, discoverability, testing and conventions |
| `docs/playbooks/` | Step-by-step guides for recurring tasks |

ADRs are numbered sequentially, and numbers are never reused. A suggested opening sequence is `0000-product-vision`, `0001-adr-process`, `0002-system-architecture`, `0003-rendering-strategy`, `0004-tool-architecture` and `0005-url-strategy`.

This file describes who we are and how we work. Everything that describes how things are currently done belongs in the documents above.
