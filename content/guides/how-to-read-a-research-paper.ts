import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Reading research papers efficiently and critically. The three-pass method and its
 * timings are Keshav's (2007), as published; the appraisal questions are general ones
 * found across methods texts.
 */
export const howToReadAResearchPaper: Guide = {
  slug: "how-to-read-a-research-paper",
  title: "How to read a research paper",
  description:
    "How to read research papers efficiently and critically: the structure of a paper, Keshav's three-pass method, questions to judge a study's methods and statistics, how to take useful notes, and how to read many papers for a review.",
  summary:
    "Don't read a research paper from start to finish on the first attempt. Skim it first to decide whether it matters to you, then read the parts you need with care, and only study it in depth if it is central to your work. As you read, ask whether the methods can support the conclusions, and record the details and your judgement in a consistent form.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "why-a-method",
      heading: "Why you need a method",
      blocks: [
        { type: "paragraph", text: "Researchers spend hundreds of hours a year reading papers, yet the skill is rarely taught, and many students learn by trial and error (Keshav, 2007). Reading every paper in full, in order, wastes time on papers you don't need and leaves too little for the ones you do. Reading in stages, with a purpose for each, is faster and gives a better understanding." },
      ],
    },
    {
      id: "anatomy",
      heading: "How a research paper is organised",
      blocks: [
        { type: "paragraph", text: "Most empirical papers follow the same pattern, often called IMRaD, so you can find what you need quickly:" },
        {
          type: "table",
          caption: "The parts of an empirical paper",
          columns: ["Part", "What it tells you", "Read it for"],
          rows: [
            ["Title and abstract", "What was studied, how, and what was found", "Deciding whether to read on"],
            ["Introduction", "Why the study matters, what is already known, the gap and the question", "The argument and the key literature"],
            ["Methods", "Who took part, how data were collected and analysed", "Judging whether the findings can be trusted"],
            ["Results", "What was found, usually with tables, figures and statistics", "The evidence itself"],
            ["Discussion and conclusion", "What the authors think the results mean, their limitations and implications", "The authors' interpretation, to compare with your own"],
            ["References", "The work the study builds on", "Finding further reading"],
          ],
        },
        { type: "paragraph", text: "Review articles, theoretical papers and qualitative studies are organised differently, but the same questions apply: what is the question, how was it answered, and does the answer follow?" },
      ],
    },
    {
      id: "three-passes",
      heading: "The three-pass method",
      blocks: [
        { type: "paragraph", text: "Keshav's three-pass method reads a paper in up to three passes, each building on the last, so you can stop whenever you know enough (Keshav, 2007):" },
        {
          type: "table",
          caption: "Keshav's three passes",
          columns: ["Pass", "Time", "What to do", "Afterwards you can"],
          rows: [
            ["First", "About five to ten minutes", "Read the title, abstract and introduction; the section headings; the conclusions; and glance over the references", "Decide whether to read further, and say what kind of paper it is and what it contributes"],
            ["Second", "Up to an hour", "Read with greater care, but skip details such as proofs; study the figures and tables; note key points and references to follow up", "Summarise the paper's main argument, with its evidence, to someone else"],
            ["Third", "About four or five hours for a beginner; about an hour for an experienced reader", "Work through the paper as if recreating it, challenging every assumption", "Reconstruct the paper from memory and identify its strengths and weaknesses"],
          ],
        },
        { type: "paragraph", text: "At the end of the first pass, Keshav suggests you should be able to answer five questions, the five Cs: Category (what type of paper is it?), Context (which other work is it related to?), Correctness (do its assumptions appear valid?), Contributions (what are its main contributions?) and Clarity (is it well written?) (Keshav, 2007)." },
        { type: "paragraph", text: "The method was written for computer science, where papers are often read for their technical approach; in other fields, the third pass means scrutinising the design and analysis rather than re-implementing a system. The timings are Keshav's rough guide, not targets." },
      ],
    },
    {
      id: "reading-critically",
      heading: "Reading critically",
      blocks: [
        { type: "paragraph", text: "Critical reading asks whether a study's methods can support its conclusions; this is the core of critical appraisal (Greenhalgh, 2019). Questions to ask of any empirical paper:" },
        {
          type: "list",
          items: [
            "Is the research question clear, and is the design suited to it? A survey can show association, but rarely cause.",
            "Who was studied, how were they chosen, and how many? Can the findings be generalised beyond them, and to your context?",
            "Are the measures valid and reliable, and the data collection described well enough to repeat?",
            "For statistical results: are effect sizes and confidence intervals reported, not just p-values? Is the sample large enough to detect the effects that matter?",
            "For qualitative results: is it clear how the data were analysed, and do the quotations support the themes?",
            "Do the conclusions stay within what the results show, or go beyond them?",
            "Who funded the study, and do the authors declare any conflicts of interest?",
          ],
        },
        { type: "paragraph", text: "A paper being published, even in a well-known journal, doesn't mean its conclusions are correct. Peer review is a check, not a guarantee." },
      ],
    },
    {
      id: "notes",
      heading: "Taking notes that you can use",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Record the full reference first, including the DOI.",
            "Summarise the question, design, sample, main findings and limitations in your own words.",
            "Note your own evaluation separately from the authors' claims.",
            "Copy any wording you may quote, in quotation marks, with the page number.",
            "Note how the paper relates to your question, and to other papers you have read.",
          ],
        },
        { type: "paragraph", text: "Recording every paper in the same structure makes it far easier to compare studies and write a literature review later." },
      ],
    },
    {
      id: "many-papers",
      heading: "Reading many papers for a review",
      blocks: [
        { type: "paragraph", text: "For a literature survey, Keshav suggests finding three to five recent papers with well-chosen keywords, doing a first pass on each, and reading their related-work sections, which summarise the field and point to its key papers and researchers (Keshav, 2007). Give the first pass to many papers, the second to the relevant ones and the third only to the few that are central to your work." },
      ],
    },
    {
      id: "second-language",
      heading: "Reading in a second language",
      blocks: [
        { type: "paragraph", text: "Many students read most of their sources in English as a second or third language. The staged approach helps: read the abstract and conclusions first to know what to expect, keep a glossary of your field's terms and their meanings, and don't stop at every unfamiliar word on a first pass. A technical term used in a precise sense is worth looking up in a subject dictionary or textbook rather than a general translator." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Reading every paper from start to finish, in order.",
            "Relying on the abstract alone for what you cite. Abstracts simplify; check the claim in the paper itself.",
            "Accepting the authors' conclusions without checking them against their methods and results.",
            "Taking notes that mix the authors' words, their claims and your own views.",
            "Recording references incompletely and having to find the paper again later.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Read and record with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Literature Matrix records every study in the same columns, from design and sample to findings and limitations, and imports references from BibTeX and RIS files. When a paper reports statistics, the Results Interpretation tool explains what they mean, and the Effect Size Calculator can calculate an effect size the paper doesn't give." },
        { type: "links", items: [{ label: "Record studies in the Literature Matrix", href: "/tools/literature-matrix" }, { label: "Interpret a reported result", href: "/tools/results-interpretation" }, { label: "Calculate an effect size", href: "/tools/effect-size-calculator" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["greenhalgh-2019", "keshav-2007"] }],
    },
  ],
  faq: [
    { question: "How long should it take to read a paper?", answer: "A first pass takes minutes; understanding a paper in depth can take hours. Decide after the first pass how much time a paper deserves." },
    { question: "Should I read the abstract first?", answer: "Yes, to decide whether to read on, but don't cite a paper on the strength of its abstract alone." },
    { question: "What if I don't understand the statistics?", answer: "Focus first on what was measured, in whom, and the size and direction of the effects. The Results Interpretation tool and the statistics guides explain common results." },
    { question: "How do I know if a journal is trustworthy?", answer: "Check whether it is peer-reviewed and indexed in recognised databases, and be wary of journals that promise very fast publication for a fee. Ask your librarian or supervisor if unsure." },
    { question: "Do I need to read every paper I cite?", answer: "Yes, at least the parts you rely on. Citing a paper you haven't read risks misrepresenting it." },
  ],
  relatedToolIds: ["literature-matrix", "results-interpretation", "effect-size-calculator"],
  relatedGuideSlugs: ["how-to-write-a-literature-review", "how-to-manage-your-references", "what-a-p-value-tells-you"],
};
