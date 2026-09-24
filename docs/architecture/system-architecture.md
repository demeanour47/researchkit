# ResearchKit System Architecture

- **Status:** Draft, for maintainer review
- **Date:** 2026-09-24
- **Scope:** Product architecture: the conceptual shape of ResearchKit, independent of any technology

## 1. Purpose

This document describes **what ResearchKit is made of and how its parts relate**. It is the reference model that every later technical decision must fit into.

It deliberately says nothing about how the system is built. Technologies will change many times over ResearchKit's life; the concepts described here should not. A reader should be able to use this document to reason about a proposed feature, a reorganisation or a new platform, without knowing what software sits underneath.

How it relates to other documents:

- **`CLAUDE.md`** sets the values and working principles. This document applies them to the shape of the product.
- **[ADR-0000: Product Vision](../adr/0000-product-vision.md)** records why ResearchKit exists and what it refuses to become. This document describes the structure that serves that vision.
- **Architecture Decision Records** record the specific decisions that turn this model into a working system. Each must be consistent with this document, or explicitly revise it.
- **Technical architecture documents**, when written, describe how the concepts here are currently realised.

Changing the domain model, the relationships or the constraints in this document is an architectural decision and requires an ADR.

## 2. Architectural Vision

ResearchKit is an **ecosystem of knowledge**, not a collection of pages.

A collection of pages grows by addition: each new page is another island, and the whole becomes harder to navigate, maintain and trust as it grows. An ecosystem grows by connection: each new tool or guide strengthens the others, because it joins a shared structure of knowledge, relationships and quality.

At the centre of ResearchKit is **knowledge**: the methods, rules and explanations behind academic work. Everything else exists to make that knowledge usable, findable, understandable and trustworthy:

- **Tools** put knowledge into action.
- **Guides** teach the knowledge behind the action.
- **Connections** lead people from one need to the next, following how research actually happens.
- **Trust** comes from every result being traceable to its method and its sources.

The organising spine of the ecosystem is the **research lifecycle**: planning, finding, reading, writing, citing, analysing, presenting and publishing. People don't experience their work as categories of tools; they experience it as a sequence of tasks. ResearchKit is shaped to accompany them through that sequence.

## 3. Guiding Principles

These principles shape how the parts of ResearchKit are divided and connected. They apply the values in `CLAUDE.md` to the product's structure.

- **Single responsibility.** Every domain, tool and guide has one clear purpose that can be stated in a sentence. When something serves two purposes, it becomes two things.
- **High cohesion.** Everything needed to understand and maintain one capability belongs together: its knowledge, its explanation, its evidence and its relationships.
- **Loose coupling.** Domains interact through clear, stable contracts. A domain can be changed, replaced or removed without redesigning the others.
- **Composition.** Larger experiences are assembled from smaller, self-contained parts: a workflow is a sequence of tools, and a guide is a composition of explanations, examples and tools. New value comes from new combinations, not new special cases.
- **Knowledge at the centre.** Domain knowledge is independent of how it is presented. The same method can serve a web page, an app, an assistant or an interface for other systems, and remains correct in all of them.
- **Tool-first experience.** When a person arrives with a task, the capability that performs it comes first; explanation and discovery follow.
- **Educational first.** Every capability is paired with the understanding behind it. A result that cannot be explained is incomplete.
- **Explainability.** Every output can show how it was produced: the method, the inputs used, the assumptions made and the authority followed.
- **Privacy first.** A person's work stays with them by default. Domains are designed to need as little personal information as possible, and none is shared between domains without purpose.
- **Progressive enhancement.** The essential value of every part remains available in the simplest reliable form. Richer interaction, personalisation and assistance are layers on top, never requirements.
- **One source of truth.** Every kind of information has exactly one authoritative home. Everything else derives from it.

## 4. High-Level Domains

A **domain** is an area of responsibility with its own purpose, its own information and its own rules. The domains below are conceptual. They describe responsibilities, not technical components, and may be realised in any number of ways.

Two terms are used throughout:

- An **item** is any unit people can find and use, such as a tool, a guide or a category.
- **Provenance** is the record of where knowledge comes from: its sources, the authority it follows, who reviewed it and when it last changed.

### Core domains: the value people come for

**Tools**
Self-contained capabilities that perform one academic task: formatting a reference, running a calculation, transforming a text. Every tool, whatever it does, has the same conceptual anatomy:

- **Purpose:** the single task it performs and for whom.
- **Method:** the domain knowledge it applies (formulas, rules, conventions), independent of presentation.
- **Interaction:** how a person provides input and receives a result.
- **Explanation:** how the result was produced, and how to understand it.
- **Evidence:** the sources the method follows and the verification that it is correct.

**Articles (Guides)**
Long-form learning. Guides teach the concepts, conventions and judgement behind academic work. They are how ResearchKit teaches as well as computes, and every guide connects to the tools that put its lesson into practice.

**Content**
The shared editorial foundation beneath tools and guides: explanations, worked examples, questions and answers, definitions, sources and provenance. Content is written once and reused wherever it is relevant, so knowledge is consistent everywhere it appears.

### Connective domains: how people find their way

**Catalogue**
The authoritative description of everything that exists in ResearchKit: every item, how it is classified, its status, and how it relates to other items. The catalogue is the single source of truth that navigation, search and discovery all draw on. It is what turns a set of items into an ecosystem.

**Navigation**
Predictable wayfinding through the structure: where am I, what is around me, how do I go up or across. Navigation reflects the catalogue's organisation and is consistent everywhere.

**Search**
Intent-driven finding. A person describes what they need in their own words, and search leads them to the tool or guide that meets it, even when they don't know its name.

**Discovery**
Contextual and serendipitous finding: the next step in a workflow, related tools and guides, and what others find useful. Discovery also covers how ResearchKit is found from outside, through search engines, AI assistants, shared links and recommendations. Items earn that visibility through their quality.

### Supporting domains: serving individuals and sustaining the whole

**User Preferences**
What a person chooses to have remembered: recently used tools, saved inputs, appearance, language and accessibility preferences. Preferences belong to the person, stay with them by default, and are always optional. Every part of ResearchKit works fully for a first-time, anonymous visitor.

**Analytics**
Aggregate understanding of whether ResearchKit is useful: which tools help, where people get stuck, which paths lead to learning. Analytics observes patterns, never the content of anyone's work. It informs human decisions and never changes a result.

**Advertising (Sustainability)**
Any means by which ResearchKit sustains itself financially. Whether this domain exists at all, and in what form, is a future decision (see §10). If it exists, it is isolated at the edges of the experience. It never appears within a tool, never influences a result, never receives the content of anyone's work, and can be removed without affecting any other domain.

### Future domain

**AI Assistance**
Help that adapts to a person's situation: explaining a result in other words, suggesting the right tool, answering a question about a method. AI Assistance draws on ResearchKit's knowledge and provenance; it never replaces them. It is always optional, clearly identified, explainable and reviewable.

## 5. Domain Relationships

The domains form layers. **Dependencies point inward, towards knowledge.** Knowledge depends on nothing else, which is what allows everything around it to change safely.

```
             ┌──────────────────────────────────────────────┐
             │  Sustainability (isolated; optional)         │
             │ ┌──────────────────────────────────────────┐ │
             │ │  Experience: Navigation · Search ·       │ │
             │ │  Discovery · Tool interaction · Reading  │ │
             │ │ ┌──────────────────────────────────────┐ │ │
             │ │ │  Catalogue: what exists and how      │ │ │
             │ │ │  it relates                          │ │ │
             │ │ │ ┌──────────────────────────────────┐ │ │ │
             │ │ │ │  Knowledge: tool methods,        │ │ │ │
             │ │ │ │  content, provenance             │ │ │ │
             │ │ │ └──────────────────────────────────┘ │ │ │
             │ │ └──────────────────────────────────────┘ │ │
             │ └──────────────────────────────────────────┘ │
             └──────────────────────────────────────────────┘
   Alongside: User Preferences (optional input) · Analytics (observes)
              · AI Assistance (draws on Knowledge, optional)
```

How the domains relate:

- **Knowledge is the foundation.** Tool methods, content and provenance are the truth of the system. They don't depend on how they are presented, found or sold.
- **The catalogue describes the knowledge.** It knows what exists and how items relate, but does not contain the knowledge itself.
- **Navigation, search and discovery derive from the catalogue.** None of them keeps its own separate list of what exists. When the catalogue changes, they all reflect it, which is why the ecosystem stays coherent as it grows.
- **Tools and guides are reciprocal.** Every guide leads to the tools that apply it; every tool leads to the guides that explain it. Content is shared between them, never copied.
- **User preferences are optional inputs.** Other domains may use them to personalise the experience, but must work fully without them.
- **Analytics observes but does not act.** It learns from aggregate behaviour to inform human decisions. It never alters results or the content of items.
- **Sustainability sits at the edge and depends on nothing sensitive.** No domain depends on it, and it may not reach inward to influence results, rankings or knowledge. Any commercial influence on what is shown is always disclosed.
- **AI Assistance is a consumer of knowledge, not a source of it.** It draws on methods, content and provenance, and every claim it makes is traceable back to them. No core capability depends on it.

## 6. Information Flow

This section describes how a person moves through ResearchKit. The architecture exists to make this journey effortless.

### Every item is a front door

Most people don't arrive at the home page. They arrive directly at a tool or guide, from a search engine, an AI assistant, a link from a lecturer, or a bookmark. **Every item must therefore stand on its own:** it explains where the person is, delivers its value immediately, and offers a clear way forward.

### The journey

1. **Arrive.** A person lands on the home page, a category, a tool or a guide, usually with a specific need.
2. **Orient.** They understand immediately where they are and whether this meets their need. If not, search and navigation take them to what does.
3. **Act.** At a tool, they provide input and receive a result straight away, with no barrier between need and outcome.
4. **Understand.** The result comes with its explanation: how it was produced, why it is correct, and where to learn more. Curiosity leads into a guide.
5. **Continue.** Each item suggests the natural next step in the research lifecycle: after formatting one reference, building a reference list; after choosing a test, interpreting its result. The person moves to a related tool or guide.
6. **Repeat.** The cycle of act, understand, continue repeats for as long as it is useful, and no longer. There are no dead ends and no traps.
7. **Return.** On a later visit, with the person's consent, their preferences help them pick up where they left off.
8. **Share.** A result, a tool or a guide is easy to pass on to a classmate, a student or a colleague. For many people, that is how they first arrive.

### Flow principles

- **No dead ends.** Every item offers at least one meaningful next step.
- **No orphans.** Every item can be reached through the structure, not only through search.
- **The shortest path to value.** The fewer steps between arrival and a useful result, the better.
- **Learning is part of the flow.** Understanding is offered at the moment it is most useful, never forced before the result.
- **Leaving is fine.** Success means a person got what they needed, not that they stayed as long as possible.

## 7. Scalability Philosophy

ResearchKit is designed to grow from a handful of tools to hundreds of tools and thousands of guides **without changing its architecture**. Growth changes volume and governance, not structure.

This is possible because of four properties:

1. **Every item is an instance of a type, never a one-off.** Each new tool follows the same anatomy and each new guide the same shape, so the thousandth item costs no more structure than the tenth.
2. **Relationships are information, not hand-made connections.** Because relationships live in the catalogue, navigation, search and discovery improve automatically as items are added.
3. **Quality is checked per item, against the same contract.** Every item carries its own evidence and provenance, so quality can be verified item by item at any scale.
4. **Organisation can evolve without breaking anything.** Categories can be split, merged and reorganised as the library grows. People's bookmarks and links keep working, because addresses are permanent promises.

How emphasis shifts as ResearchKit grows:

| Stage | What matters most |
|---|---|
| **About 10 tools** | Proving the pattern. Each tool is exemplary and defines the standard the rest will meet. Navigation can be simple. |
| **About 100 tools** | Organisation and findability. Categories become meaningful hubs, search becomes a primary way in, and related items and workflows start to form a connected web. |
| **About 500 tools** | Coherence and stewardship. The taxonomy deepens, workflows guide discovery, quality is verified across the whole catalogue, and each area has clear ownership. |
| **1,000+ guides** | Editorial governance. Guides are reviewed and refreshed on a cycle, overlapping pages are consolidated so they don't compete, and shared definitions keep language consistent. |

At every stage the domains, the relationships between them and the constraints stay the same.

Every item also has a lifecycle: it is **drafted**, **published**, periodically **reviewed** and **updated**, and, when no longer useful, **retired**. A retired item's address continues to lead somewhere helpful.

## 8. Extension Philosophy

Future capabilities join ResearchKit as **new layers or new ways in**, never as changes to the foundation. Each must respect the constraints in §9 and be decided through its own ADR.

- **AI.** An assistance layer over existing knowledge. It explains, suggests and answers, always grounded in ResearchKit's methods and provenance, always identifiable as AI, and always optional. Because knowledge is independent of presentation, no provider is fundamental and changing providers doesn't change the knowledge.
- **API (access for other systems).** Another way into the same knowledge. Because methods are independent of presentation, another interface can offer them with the same accuracy and provenance as the tools themselves.
- **Premium.** A possible layer of added convenience, such as larger workloads, collaboration or saved collections. It sits on top of a core that stays complete and free. Nothing that exists in the free core may later be moved behind it.
- **Accounts.** Optional identity that lets a person's preferences and saved work follow them between devices. Accounts extend the User Preferences domain; they are never required to use any core capability.
- **Content management.** A change in where and how content is written, not in what content is. The content and catalogue models stay the same whatever tools are used to author them.
- **Internationalisation.** Language becomes a dimension of content and interface. Knowledge is modelled so that what is universal (a statistical method) is kept separate from what is local (a regional citation convention, a number format). Local conventions are knowledge in their own right, not just translation.
- **Mobile apps.** Another experience layer over the same knowledge and catalogue. Self-contained tools make capabilities that work without a connection a natural extension.
- **Institutional integrations.** Ways for universities and learning platforms to bring ResearchKit's tools and guides into their own environments, using the same knowledge and meeting the same privacy and accessibility commitments.

The test for any extension: **can it be added without changing the knowledge at the centre, and removed without breaking anything else?** If not, the design should be reconsidered before it is built.

## 9. Architectural Constraints

These constraints are permanent. Any design, feature or decision that violates one is out of bounds, however attractive it seems.

- **No hidden functionality.** Everything ResearchKit does with a person's input is visible and explainable. There is no undisclosed processing, collection or sharing.
- **Transparency.** Every result can be traced to its method, its inputs, its assumptions and its sources.
- **Educational integrity.** ResearchKit supports learning and honest scholarship. It never offers capabilities whose primary purpose is to misrepresent authorship or evade academic-integrity safeguards.
- **Honest AI.** AI assists and never replaces human judgement. Its outputs are identified, explainable, reviewable and traceable, and are never presented as more certain than they are.
- **Accessibility.** Every capability is usable by everyone, including people using assistive technology, as a condition of existing.
- **Privacy first.** A person's work stays with them by default. Only the minimum information necessary is collected, and it is used only in ways the person would expect.
- **A free, open core.** Core capabilities are never gated by payment, accounts or data capture, now or later.
- **Addresses are permanent.** Once published, an item's address keeps working for as long as ResearchKit exists.
- **Progressive enhancement.** The essential value of every capability stays available in the simplest reliable form.
- **Knowledge independence.** Domain knowledge never depends on a particular presentation, platform or provider.
- **One source of truth.** Each kind of information has one authoritative home; everything else derives from it.
- **Contained failure.** A problem in one part degrades only that part. No single domain's failure takes down the whole.
- **Commercial neutrality.** Results are never influenced by commercial considerations, and any commercial influence on what is shown is always disclosed.

## 10. Future Architecture Decisions

The following topics need their own ADRs. This document frames the questions; it does not answer them. Each ADR must be consistent with the model and constraints above, or explicitly propose revising them.

**Foundational decisions** (the suggested opening sequence in `CLAUDE.md`):

- **ADR-0002, System architecture:** how the conceptual domains in this document map onto a technical system, and where the boundaries between them sit.
- **ADR-0003, Rendering strategy:** how content and tools reach people quickly and reliably, including how the principle of progressive enhancement is honoured.
- **ADR-0004, Tool architecture:** how the conceptual anatomy of a tool (purpose, method, interaction, explanation, evidence) becomes a repeatable contract.
- **ADR-0005, URL strategy:** how items are addressed so that addresses stay permanent while the taxonomy evolves.

**Later decisions**, to be taken when each becomes relevant:

- **Catalogue and taxonomy model:** how items, categories, topics and relationships are described.
- **Content source and editorial workflow:** where content is authored, and how it is reviewed, versioned and refreshed.
- **Provenance and review model:** how sources, reviewers and verification are recorded and shown.
- **Search approach:** how intent is matched to items as the catalogue grows.
- **Discovery approach:** how related items and next steps are chosen, and how external discoverability is supported.
- **User preferences:** what may be remembered, where it lives, and how people control it.
- **Analytics and privacy:** what is measured, how aggregation protects individuals, and what is never collected.
- **Sustainability model:** whether and how ResearchKit generates revenue, including any advertising or premium layer, within the constraints above.
- **AI assistance:** its scope, safeguards, disclosure, and independence from any single provider.
- **Accounts and identity:** whether optional accounts are offered, and what they may and may not do.
- **Internationalisation:** which languages and regions are served, and how universal and local knowledge are separated.
- **Access for other systems:** whether an API or institutional integrations are offered, and on what terms.
- **Additional platforms:** whether and when experiences beyond the web, such as mobile apps, are offered.

Until an ADR is accepted for a topic, no implementation may assume an answer to it.
