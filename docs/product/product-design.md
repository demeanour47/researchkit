# ResearchKit Product Design

- **Status:** Draft, for maintainer review
- **Date:** 2026-09-24
- **Scope:** Product thinking only: the experience ResearchKit creates, for whom, and how we know it works

Why ResearchKit exists is recorded in [ADR-0000](../adr/0000-product-vision.md), and how its parts fit together in the [system architecture](../architecture/system-architecture.md). This document describes what it should feel like to use ResearchKit, and what has to be true for that feeling to be earned.

---

## 1. The emotional experience

ResearchKit should create an arc of four feelings, in this order:

1. **Relief:** "It just worked." The task that was blocking them is done, sooner than they feared.
2. **Confidence:** "And I can see it's right." The result shows the rule it followed, so they don't have to take it on faith.
3. **Competence:** "Oh, *that's* why." They understand something they didn't before, and will need the tool a little less next time.
4. **Allegiance:** "This is my place for this." Not habit or dependence, but the loyalty people feel towards a good teacher.

Most tools in this space stop at relief, and some manufacture anxiety first so that relief feels bigger. ResearchKit's distinctive promise is the second half of the arc. **People should leave a little more capable than they arrived.**

## 2. Primary users

We design for four people. Everyone else we serve (independent learners, professionals returning to study, writers in other fields) is well served when these four are.

**The student under deadline.** An undergraduate, often late at night and often on a phone, with an essay due and a reference list in the wrong format. They have been told "APA 7th edition" and don't know what that means in detail. They need speed and correctness, and they are quietly afraid of losing marks for mistakes they can't see.

**The graduate researcher.** Writing a thesis or a paper, running analyses, answering to a supervisor and eventually to reviewers. They know enough to distrust black boxes. They need results they can check against their textbook or their statistics output, and methods they can defend in a viva or a response to reviewers.

**The lecturer.** Teaching a course of 30 or 300, marking the same formatting and reporting errors every term. They need resources they can hand to every student without worrying about ads, sign-up demands, data harvesting or bad advice undoing their teaching.

**The librarian.** The institution's curator of trustworthy tools, maintaining the guides students are pointed to. They need tools that are accurate, accessible to every student, respectful of privacy, and still at the same address next year.

The student brings volume, the researcher brings rigour, the lecturer brings reach, and the librarian brings legitimacy. The product must satisfy all four at once; a design that pleases the student but embarrasses the lecturer has failed.

## 3. The problems they arrive with

People rarely arrive curious. They arrive **stuck**, with something specific:

- **A formatting problem with consequences:** "I have 14 sources and don't know how to cite a YouTube video, a government report or a paper with 23 authors."
- **A method they half-understand:** "Which test do I use? What sample size do I need? How do I report this result in APA style?"
- **A rule they can't find:** "Does *et al.* go in italics? When do I include a DOI? What does 'n.d.' mean?"
- **A mechanical chore:** counting words against a limit, converting a title to the right case, reformatting a table.
- **A trust problem:** "The last generator gave me something that looks wrong, and I can't tell if it is."
- **A teaching problem** (lecturers and librarians): "My students keep making the same mistakes. What can I send them that I trust?"

Underneath almost all of these sits the same fear: **being judged for a mistake they cannot see.** ResearchKit's job is to make the invisible rules visible.

## 4. Within 30 seconds

A first-time visitor should, within 30 seconds of arriving:

- **Have a correct, usable result** for the task they came with, without being asked to create an account, give an email address, or get past anything else first.
- **See why it is correct:** the style edition or method it followed, stated specifically enough to check.
- **Know what ResearchKit is:** a free, careful academic toolkit that doesn't want anything from them.

A visitor who arrives at a guide should find the direct answer to their question in the first paragraph, not after a preamble.

## 5. Within 5 minutes

Within five minutes, the same person should have:

- **Finished the whole job, not just one piece of it:** the full reference list, not one reference; the result reported in the correct style, not just calculated.
- **Understood at least one rule** they did not know before, because the explanation appeared exactly when they wondered about it.
- **Found the next step** in their work without searching for it: from one reference to the reference list, from a test to reporting its result.
- **Judged the quality** for themselves. For a lecturer or librarian, that means enough to decide it is safe to share.

## 6. After months of returning

For someone who keeps coming back, ResearchKit should become **part of how they do research**, not a place they visit in emergencies:

- It accompanies them through the research lifecycle: planning, finding, reading, writing, citing, analysing and presenting.
- It remembers what they choose to have remembered, so returning feels like picking up where they left off.
- **They need it less for the simple things**, because the explanations have taught them the rules, and they rely on it more for the hard things. This is the measure that separates ResearchKit from a crutch.
- They have recommended it to at least one other person, because it made them look careful, not because we asked.

## 7. What earns immediate trust

Trust is earned in the first few seconds, through details a careless product would not bother with:

- **Nothing stands between the person and the result.** The absence of a demand is the first signal that we are not trying to extract something.
- **Precision in the small things.** An en dash in page ranges, *et al.* applied at exactly the right author count, *p* = .032 with no leading zero. People may not know the rules, but they recognise care.
- **The source is named.** "APA 7th edition, section 9.25" is checkable; "APA format" is not.
- **Honesty about limits.** "We couldn't find a publication date, so APA uses (n.d.). Check the source if you can." Admitting uncertainty earns more trust than pretending certainty.
- **A human stands behind it.** A named reviewer and a date of last review show that someone accountable checked this.
- **Nothing is trying to sell to them.** No countdowns, no locked "premium" answers, no warnings designed to scare.

## 8. Why someone bookmarks it

People bookmark what they know they will need again **and could not easily find again**:

- **The need recurs.** Every essay needs references, and every analysis needs reporting. The first successful use predicts the tenth.
- **It beat the search results.** They remember scrolling past cluttered alternatives to reach this one. Returning directly is faster than repeating that search.
- **It covers the next task too.** Finding that one place handles citing, counting, calculating and checking turns a one-off visit into a toolkit.
- **It remembered them.** When they return by chance and find their last settings still there, the bookmark follows naturally.

We never ask for the bookmark until the person has had a reason to want one.

## 9. Why someone recommends it to classmates

Students recommend what makes them look helpful and costs their friend nothing:

- **It rescued them at a bad moment,** and they want to pass the rescue on in the group chat.
- **It is safe to recommend openly.** It checks and teaches; it doesn't disguise authorship. No one looks like they are cheating by sharing it.
- **The friend can use it instantly:** no sign-up, no trial, no payment, so the recommendation never becomes an awkward favour.
- **A specific result or tool can be shared directly,** so "use this" means exactly the right thing, not a home page to search through.
- **It made them look careful,** because references and results produced here survive a marker's scrutiny.

## 10. Why lecturers recommend it

A lecturer's recommendation puts their own credibility on the line, so they need to be certain:

- **It is right, and they can check that it is right.** The method and source are visible, and they match what the lecturer teaches.
- **It teaches the rule, not just the answer,** so recommending it supports learning instead of undermining it.
- **It is consistent with academic integrity.** Nothing on it helps students misrepresent their work.
- **It is fair to every student:** free, accessible with assistive technology, usable on any device and connection, and with nothing harvested from their students.
- **It reduces their marking burden.** Every formatting error prevented is one they don't have to correct for the hundredth time.
- **It stays put.** The link in this year's course handbook still works next year.

## 11. Why universities reference it

Institutions reference what they can defend in a review:

- **A clear accessibility commitment,** backed by evidence, not claims.
- **A privacy stance they can quote:** student work stays with the student, and nothing is sold or profiled.
- **Published methodology and editorial standards:** how tools are verified, who reviews them and how errors are corrected.
- **A visible record of corrections,** because an institution trusts a source that admits and fixes mistakes more than one that claims never to make them.
- **Commercial neutrality.** Nothing upsells their students, and nothing in the results is shaped by commercial interest.
- **Permanence.** Addresses and methods stay stable enough to put in official guidance.

## 12. Why researchers cite it

Researchers cite what they can **name, find again and reproduce**:

- **Methods documented to academic standard:** the formula, its original source, its assumptions and its limitations, written the way a methods section would.
- **Reproducibility.** A reviewer or reader who follows the citation reaches the same method and gets the same result.
- **A version history of methods.** When a method is corrected or updated, the change is recorded and dated, so earlier work can still be understood.
- **A ready-made citation for the tool itself,** in the styles researchers use, so citing ResearchKit takes no more effort than using it.
- **A permanent, stable address** that will still resolve when the paper is read years from now.

Being cited is the highest form of trust in academia. It is also the clearest evidence that ResearchKit has become part of the scholarly record, not just a convenience beside it.

## 13. How ResearchKit differs

Each of these products does something well, and ResearchKit should respect that. The difference is in what each asks of the person in return, and whether the person leaves more capable.

| Product | What it does well | Where ResearchKit differs |
|---|---|---|
| **Scribbr** | Excellent explanatory guides and a strong reputation for academic writing advice | Its free tools and guides sit alongside paid services. ResearchKit's guides lead only to more free help, never to a purchase. |
| **Grammarly** | A polished, widely used writing assistant | It improves prose broadly and reserves its fullest help for paying users. ResearchKit focuses on the academic conventions and methods general writing tools don't cover, and nothing is withheld. |
| **QuillBot** | Fast rewriting and paraphrasing | Rewriting someone else's text sits uneasily with academic integrity. ResearchKit deliberately does not help disguise authorship; it teaches people to cite, quote and report correctly instead. |
| **EasyBib and Citation Machine** | Well-known, quick citation generation | Their experience is shaped by advertising and paid upgrades. ResearchKit shows the rule behind every citation, admits uncertainty, and keeps the experience free of distraction. |

Across all of them, ResearchKit's distinctive position comes down to three commitments together:

1. **Show the work:** every result explains itself and names its source.
2. **Ask for nothing:** no payment, account or data stands between the person and the whole result.
3. **Teach, don't replace:** success means the person understands more, not that they depend on us more.

No competitor holds all three. Holding all three is the product.

## 14. What users must never feel

- **Stupid.** No jargon without explanation, and no condescension about what they "should" know.
- **Tricked.** No bait: no result shown and then withheld, and no "free" that turns out to mean "free to start."
- **Watched.** No sense that their work is being collected, read or kept.
- **Rushed or pressured.** No countdowns, scarcity or manufactured urgency.
- **Afraid.** No warnings designed to frighten them into acting, such as scare messages about plagiarism.
- **Guilty.** Nothing here should feel like cutting corners; using ResearchKit should feel like doing the work properly.
- **Interrupted.** Nothing appears uninvited while they are thinking, reading or typing.
- **Trapped.** Leaving is always easy, and nothing is held hostage to make them stay.
- **Uncertain whether it's right.** If we are unsure, we say so; we never leave doubt unacknowledged.

## 15. Product personality

ResearchKit is **the best teaching assistant you ever had**: the one who knew the rules cold, explained them without making you feel small, and was still patient at eleven at night before a deadline.

| ResearchKit is | ResearchKit is not |
|---|---|
| Knowledgeable | A know-it-all |
| Precise | Pedantic |
| Patient | Slow |
| Generous | Needy or salesy |
| Honest about uncertainty | Falsely confident |
| Calm | Bland |
| Encouraging | Cheerleading |
| Principled | Preachy |

The personality shows most at the moments that are hardest to get right: when the person has made a mistake, when we are unsure, and when the honest answer is "it depends."

## 16. Brand voice

The voice of a careful expert speaking to a capable adult under pressure.

- **Specific over general.** "Formatted to APA 7th edition, section 9.25", not "Perfectly formatted!"
- **Explain in the moment of need.** Every error message teaches: "Sample size must be at least 2. A *t*-test compares variation, and a single value has none."
- **State uncertainty plainly.** "We couldn't confirm the author's name from this page. Please check it against the source."
- **Short sentences under pressure; depth on request.** The result speaks briefly, and the explanation is there for those who want it.
- **Their words first, the correct term second.** "Bibliography, works cited or reference list: which does your style use?" People search in their own vocabulary; we meet them there and then teach the precise term.
- **Confident, never hyped.** No superlatives, exclamation marks or "ultimate" anything. Quality is demonstrated, not announced.
- **Respectful of every discipline.** A historian's footnotes and a psychologist's statistics are both serious work; neither is treated as the default.
- **Never fear as a motivator.** We explain what a convention requires. We never threaten consequences to prompt action.

## 17. Visual personality

Visually, ResearchKit should feel like **a well-edited academic paper that you can use**: composed, spacious and exact, with nothing on the page that hasn't earned its place.

- **Restraint as confidence.** The page is quiet because it doesn't need to shout; clutter signals desperation, and space signals assurance.
- **One point of emphasis per view,** the way a careful reader marks only the sentence that matters. If everything is emphasised, nothing is.
- **Precision is the decoration.** Correctly set citations, aligned figures and exact notation are the visual detail. We don't add ornament to make up for missing substance.
- **The evidence is visible.** Sources, editions and review dates are part of the design, not hidden in fine print.
- **Real academic objects, never stock imagery.** Imagery shows the actual instruments of scholarship (a distribution, a reference, a margin note), never smiling models holding laptops.
- **Calm in motion.** Anything that moves does so to show that something changed, and then it is still.
- **Equally at home everywhere:** as composed on a phone at midnight as on a lecture-theatre projector.

## 18. Interaction philosophy

- **Result first, explanation one step away.** The person gets the answer immediately; the reasoning is always available and never forced on them first.
- **Accept input the way people actually have it.** A pasted link, a messy half-reference, a column copied from somewhere else. The tool does the tidying, not the person.
- **Never ask what can be inferred.** Every question we ask costs attention; we ask only what we genuinely cannot work out.
- **Show, then invite.** Each tool can demonstrate itself with a realistic example, so no one faces a blank page wondering what to type.
- **Teach at the moment of confusion.** Explanations appear where the question arises, at the error or the unfamiliar term, not in a manual somewhere else.
- **Everything is reversible.** Nothing a person does here causes them to lose work.
- **Finish the job.** Each tool carries the person through to the usable outcome: copied, exported or shared in the form their assignment or paper needs.
- **Equally usable by everyone,** whether by touch, keyboard, voice or assistive technology.
- **Stillness while thinking.** Nothing shifts, interrupts or demands attention while someone is reading or typing.

## 19. Navigation philosophy

People look for things in three different ways, and ResearchKit supports all three equally:

- **By task, in their own words:** "how do I cite a YouTube video", "which test for two groups". Search understands the question, not just the tool's name.
- **By stage of work:** "I'm writing up my results. What helps now?" The research lifecycle is a way to navigate, not just a way we organise.
- **By browsing:** "What else is there for citations?" Categories are real places, not lists.

Principles that apply to all three:

- **Every item is a front door.** Most people arrive deep inside ResearchKit, not at the home page, so every page orients them without assuming they came through it.
- **Always know where you are.** Wherever someone lands, it is clear what this is, what it belongs to and what is nearby.
- **The next step follows the work, not the catalogue.** After a citation comes a reference list, not merely "other citation tools."
- **Speak every discipline's dialect.** "Bibliography", "works cited" and "reference list" all lead to the right place, and each is explained.
- **Shallow and predictable.** Nothing worth finding is buried, and the structure behaves the same everywhere.

## 20. Success metrics

Success is measured by **what people achieved and learned**, never by how much of their time we captured. Every measure is aggregate and respects the privacy commitments in `CLAUDE.md`.

### The guiding measure

**Useful outcomes:** tasks where a person reached a result and then *used* it (copied it, exported it or shared it). It captures what matters: a real task completed, well enough to use.

### Supporting measures

| Question | Signal |
|---|---|
| **Did it work immediately?** | Time from arrival to first useful result; share of visits that reach a result at all |
| **Was it right?** | Reported errors, how serious they were, and how quickly each was corrected (the target is zero uncorrected errors) |
| **Did they understand?** | How often explanations are opened when they are offered, and whether repeat users need help less for simple tasks over time |
| **Did we help with the whole job?** | How often a person continues to the next step *of the same work* |
| **Did it earn a return?** | Share of people who come back within a month for a new task |
| **Did they tell others?** | Visits arriving from shared links and personal recommendations |
| **Do educators trust it?** | Links from course pages, reading lists and syllabi |
| **Do institutions trust it?** | References from library and university guidance |
| **Does it enter the scholarly record?** | Citations of ResearchKit tools in published work |
| **Can everyone use it?** | Accessibility barriers reported, and how quickly they are removed |

### What we deliberately do not optimise

- **Time on site and pages per visit.** More time can mean more confusion. These are watched only as warning signs, never as goals.
- **Sign-ups, or any conversion that asks something of the person** before they have what they came for.
- **Volume of pages** as a goal in itself. A thousand pages that help no one are a liability, not an asset.

If a proposed change would improve a number here while making a person feel any of the things in section 14, the number is wrong.
