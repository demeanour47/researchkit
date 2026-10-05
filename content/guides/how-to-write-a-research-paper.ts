import type { Guide } from "../../src/domains/publishing/guide";

/**
 * What a research paper is, how its sections fit together, and how Results and
 * Discussion differ. Structures vary by discipline and journal; the guide says so.
 */
export const howToWriteAResearchPaper: Guide = {
  slug: "how-to-write-a-research-paper",
  title: "How to write a research paper",
  description:
    "How to write a research paper: the usual sections, what each must contain, the difference between Results and Discussion, how it differs from a proposal and a thesis, and common mistakes. For reporting one completed study.",
  summary:
    "A research paper reports one completed study: the question, the method, what was found and what it means. Its Results section says what the data showed and its Discussion explains why that matters. Disciplines and journals differ in format, so follow the instructions you have been given.",
  updated: "2026-10-10",
  reviewedBy: null,
  sections: [
    {
      id: "what-it-is",
      heading: "What a research paper is",
      blocks: [
        { type: "paragraph", text: "A research paper reports research that has been done. It is shorter and narrower than a thesis, usually covering one study, and it is written for readers who want the question, the method, the findings and their meaning. Unlike a proposal, it contains real results." },
      ],
    },
    {
      id: "structure",
      heading: "The sections a paper usually has",
      blocks: [
        { type: "paragraph", text: "Many empirical papers follow an introduction, method, results and discussion pattern. Humanities and some qualitative papers are organised differently, and journals set their own headings." },
        {
          type: "table",
          caption: "A common research paper structure",
          columns: ["Section", "What it must do", "Questions it answers"],
          rows: [
            ["Abstract", "Summarise the whole paper; write it last", "Could a reader understand the study from this alone?"],
            ["Introduction", "Give the background, the gap and the question", "Why was this study needed?"],
            ["Literature review", "Show what is known and where the gap is", "What did earlier work find?"],
            ["Methodology", "Describe what was done in enough detail to judge it", "How was the question answered?"],
            ["Results", "Report what the analysis found", "What did the data show?"],
            ["Discussion", "Interpret the results and link them to the literature", "What do the results mean?"],
            ["Conclusion", "Answer the question and point to next steps", "What follows from this?"],
            ["References", "List every cited source", "Where are the sources?"],
          ],
        },
      ],
    },
    {
      id: "results-vs-discussion",
      heading: "Results versus Discussion",
      blocks: [
        { type: "paragraph", text: "Results report; Discussion interprets. Keeping them apart lets a reader see what the data showed before they hear your explanation of it." },
        {
          type: "table",
          caption: "Results compared with Discussion",
          columns: ["", "Results", "Discussion"],
          rows: [
            ["Purpose", "State what was found", "Explain what it means"],
            ["Content", "Descriptive statistics, test results, tables and figures", "Interpretation, comparison with earlier studies, limits"],
            ["Tone", "Factual and specific", "Reasoned and careful"],
            ["Avoid", "Explaining why", "Repeating the numbers or claiming more than the data support"],
          ],
        },
        { type: "paragraph", text: "Some institutions and many qualitative papers combine the two; if yours does, keep the evidence and the interpretation clearly distinguishable." },
      ],
    },
    {
      id: "building",
      heading: "Building it step by step",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Fix the research question, and the objectives that follow from it.",
            "Describe the method as it was actually carried out, including sampling and measurement.",
            "Analyse the data with methods that suit the design, and check their assumptions.",
            "Report the results, then interpret them in the Discussion.",
            "State the limitations honestly, and say what the study does not show.",
            "Write the introduction, conclusion and abstract once the findings are clear.",
            "Check every citation against the reference list.",
          ],
        },
      ],
    },
    {
      id: "formatting",
      heading: "Formatting",
      blocks: [
        { type: "paragraph", text: "General academic practice covers headings, numbered tables and figures, and matching citations to references. A citation style decides how statistics, citations and references look. A journal or institution decides length, section order and layout, and its author instructions take priority." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Interpreting inside the Results section.",
            "Reporting only the results that were significant.",
            "Claiming causation from a correlation.",
            "Describing the method too thinly for anyone to judge it.",
            "Leaving out limitations.",
            "Introducing new evidence in the conclusion.",
          ],
        },
      ],
    },
  ],
  faq: [
    { question: "What is the difference between a research paper and a thesis?", answer: "A paper reports one completed study concisely. A thesis is a much longer, in-depth project that usually includes a framework, several chapters and appendices." },
    { question: "Should Results and Discussion be separate?", answer: "Usually, in empirical papers. Some disciplines and qualitative studies combine them; follow your instructions." },
    { question: "Does a research paper need a hypothesis?", answer: "Only if the study tests a relationship. Qualitative papers often have research questions instead." },
    { question: "How long should a research paper be?", answer: "A course, institution or journal sets the length. There is no universal word count." },
    { question: "What is the difference between a paper and a proposal?", answer: "A proposal plans research that has not been done and has no results. A paper reports research that has been done." },
  ],
  relatedToolIds: ["statistical-test-finder", "effect-size-calculator", "results-interpretation", "reference-checker", "readability-checker"],
  relatedGuideSlugs: ["how-to-write-a-research-proposal", "how-to-write-a-literature-review", "how-to-write-an-abstract", "how-to-report-statistics-in-apa", "how-to-write-a-thesis-or-dissertation"],
};
