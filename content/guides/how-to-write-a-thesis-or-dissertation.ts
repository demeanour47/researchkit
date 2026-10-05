import type { Guide } from "../../src/domains/publishing/guide";

/**
 * What a thesis or dissertation is and how its chapters fit together. Institutions
 * differ in chapter structure, length and terminology, and the guide defers to them.
 */
export const howToWriteAThesisOrDissertation: Guide = {
  slug: "how-to-write-a-thesis-or-dissertation",
  title: "How to write a thesis or dissertation",
  description:
    "How to write a thesis or dissertation: the chapters it usually has, what a theoretical framework and appendices are for, how it differs from a proposal and a paper, how to build it in stages, and common mistakes.",
  summary:
    "A thesis or dissertation is an extended, in-depth report of independent research. It usually adds a literature review, a theoretical or conceptual framework, a detailed methodology, findings and discussion across chapters, and appendices. Terminology and structure vary by country and institution, so your own regulations come first.",
  updated: "2026-10-10",
  reviewedBy: null,
  sections: [
    {
      id: "what-it-is",
      heading: "What a thesis or dissertation is",
      blocks: [
        { type: "paragraph", text: "A thesis or dissertation shows that you can design, carry out and defend a substantial piece of research on your own. It is the longest of the three common research documents. The words are used differently in different countries and programmes, so use the one your programme uses." },
        { type: "paragraph", text: "Unlike a proposal, it reports completed research with real findings. Unlike a paper, it goes deeper: it sets out the theory behind the study, justifies the method in detail, and presents the analysis across several chapters." },
      ],
    },
    {
      id: "structure",
      heading: "The chapters a thesis usually has",
      blocks: [
        { type: "paragraph", text: "This is a common empirical structure. Qualitative, mixed-methods and humanities theses are often organised differently, and some programmes require specific chapter headings." },
        {
          type: "table",
          caption: "A common thesis or dissertation structure",
          columns: ["Part", "What it must do", "Questions it answers"],
          rows: [
            ["Abstract and front matter", "Summarise the work and help readers navigate", "What is this about, and where is everything?"],
            ["Introduction", "Give the background, problem, aims and questions", "Why this study?"],
            ["Literature review", "Synthesise existing work and show the gap", "What is known and what is not?"],
            ["Theoretical or conceptual framework", "State the theory or concepts that guide the study", "How do the concepts relate, and how does that shape the study?"],
            ["Methodology", "Justify the design, sampling, measurement, data collection, analysis and ethics", "Why were these choices made?"],
            ["Findings", "Report the results of the analysis", "What did the data show?"],
            ["Discussion", "Interpret the findings against the literature and the framework", "What do the findings mean?"],
            ["Conclusion and recommendations", "Answer the questions, state the contribution, and recommend", "What follows, and what should come next?"],
            ["References", "List every source cited", "Where are the sources?"],
            ["Appendices", "Hold supporting material", "What supports the study but would interrupt the text?"],
          ],
        },
      ],
    },
    {
      id: "framework",
      heading: "Framework and appendices",
      blocks: [
        { type: "paragraph", text: "A theoretical or conceptual framework tells the reader which ideas guide the study and how they connect. It is more than naming a theory: it should shape the questions, the measures and the way the findings are read." },
        { type: "paragraph", text: "Appendices hold material that supports the work but would interrupt the main text, such as questionnaires, consent forms and extra tables. Refer to each appendix in the text so the reader knows why it is there." },
      ],
    },
    {
      id: "building",
      heading: "Building it in stages",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Read your programme's regulations first, and keep the requirements in one place.",
            "Move from interest to topic, then to a gap in the literature, a problem and a research question.",
            "Choose a framework and a methodology that fit the question.",
            "Get ethical approval before you collect data.",
            "Write as you go: draft the methodology while you wait, and the literature review while you collect data.",
            "Analyse, then write the findings and the discussion separately.",
            "Write the conclusion, the introduction and the abstract last, and leave time to revise.",
          ],
        },
        { type: "paragraph", text: "ResearchKit's Research Journey follows these stages. It records what you produce and links each stage to the tools and guides that help; it does not write any part of your thesis." },
      ],
    },
    {
      id: "formatting",
      heading: "Formatting",
      blocks: [
        { type: "paragraph", text: "Theses usually have the strictest formatting rules of the three documents. Your institution typically specifies the title page, front matter, margins, spacing, heading levels, binding or file format, and the citation style. Follow those exactly. General practice, such as numbering tables and figures and matching every citation to a reference, applies throughout." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Leaving the writing until the data are collected.",
            "Naming a theory without using it.",
            "Letting the discussion repeat the findings.",
            "Underestimating how long ethics approval and revision take.",
            "Ignoring the institution's formatting rules until the last week.",
            "Adding appendices that are never referred to.",
          ],
        },
      ],
    },
  ],
  faq: [
    { question: "What is the difference between a thesis and a dissertation?", answer: "It depends on the country and institution. Use the term your programme uses." },
    { question: "How is a thesis different from a research paper?", answer: "A thesis is longer and more detailed, and usually includes a framework, a fuller methodology, several results chapters and appendices." },
    { question: "How long should a thesis be?", answer: "The institution and level decide. There is no universal length." },
    { question: "Does every thesis need a theoretical framework?", answer: "Many do, but requirements vary by discipline and programme. Ask your supervisor." },
    { question: "Where do I start?", answer: "With your programme's regulations, then an interest narrowed into a topic, a gap and a research question." },
  ],
  relatedToolIds: ["conceptual-framework-builder", "research-design-builder", "sample-size-calculator", "statistical-test-finder", "reference-checker"],
  relatedGuideSlugs: ["how-to-plan-a-dissertation", "how-to-write-a-literature-review", "how-to-write-a-research-proposal", "how-to-write-a-research-paper", "how-to-manage-your-references"],
};
