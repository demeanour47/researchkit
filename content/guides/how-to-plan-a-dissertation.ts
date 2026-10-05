import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Planning a dissertation from requirements to submission, as a map of the research
 * workflow that links to the guides and tools for each stage. The timeline is a labelled
 * example, not a rule; no institution's regulations are stated.
 */
export const howToPlanADissertation: Guide = {
  slug: "how-to-plan-a-dissertation",
  title: "How to plan a dissertation",
  description:
    "How to plan a dissertation or thesis from start to submission: understanding the requirements, writing a proposal, building a realistic timeline with milestones, working with a supervisor, and the guides and tools for each stage.",
  summary:
    "A dissertation is a long project with fixed deadlines, so plan it backwards from the submission date. Start by understanding your programme's requirements, then turn a topic into a research question and a proposal, get ethical approval where needed, and break the work into stages with milestones and a buffer. Write as you go, meet your supervisor regularly, and keep backups.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "requirements",
      heading: "Start with the requirements",
      blocks: [
        { type: "paragraph", text: "Requirements differ between universities, faculties and programmes, including between universities in Nepal, so start with your own programme's regulations and handbook. Find out:" },
        {
          type: "list",
          items: [
            "the word limit, and what counts towards it;",
            "the required structure, chapters and formatting, and the citation style;",
            "the deadlines: proposal, ethics application, drafts and final submission;",
            "how ethical approval works, and how long it takes;",
            "how supervision works: how often you meet, and what your supervisor expects to see;",
            "how the dissertation is assessed, including any viva or defence.",
          ],
        },
        { type: "paragraph", text: "Keep these in one document. When this guide and your regulations differ, your regulations apply." },
      ],
    },
    {
      id: "topic-to-proposal",
      heading: "From topic to proposal",
      blocks: [
        { type: "paragraph", text: "Choose a topic you can sustain interest in for months, that your supervisor can support, and that you can research with the access, data, time and skills you have (Saunders et al., 2019). Read enough to find a gap, then turn the topic into a research question." },
        { type: "paragraph", text: "Most programmes ask for a proposal. Its usual parts are:" },
        {
          type: "list",
          items: [
            "a working title;",
            "the background and the research problem;",
            "the research questions and objectives;",
            "a brief review of the key literature, showing the gap;",
            "the methodology: approach, design, sampling, data collection and analysis;",
            "ethical considerations;",
            "a timeline;",
            "references.",
          ],
        },
        { type: "paragraph", text: "The proposal is a plan, not a contract. It will change as you read and collect data; record what changes and why." },
      ],
    },
    {
      id: "structure",
      heading: "A typical structure",
      blocks: [
        { type: "paragraph", text: "Many empirical dissertations follow a structure like this one, though it varies by discipline and programme, and qualitative dissertations often combine results and discussion (Bryman, 2016):" },
        {
          type: "table",
          caption: "A common dissertation structure",
          columns: ["Chapter", "What it does"],
          rows: [
            ["Introduction", "Background, problem, aims, research questions, significance and the structure of the dissertation"],
            ["Literature review", "What is known, how, and the gap the study addresses"],
            ["Methodology", "Philosophy and approach, design, sampling, data collection, analysis, ethics and limitations"],
            ["Results or findings", "What was found, without interpretation"],
            ["Discussion", "What the findings mean, in the light of the literature, and their limitations"],
            ["Conclusion", "Answers to the research questions, implications, recommendations and further research"],
          ],
        },
      ],
    },
    {
      id: "timeline",
      heading: "Building a timeline",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Work backwards from the submission date, and put every fixed deadline on the plan first.",
            "List the stages and estimate how long each will take, remembering that data collection and ethics approval depend on other people.",
            "Set a milestone for each stage, such as a chapter draft, and agree them with your supervisor.",
            "Overlap stages where you can: draft the methodology while waiting for ethics approval; keep reading during analysis.",
            "Leave a buffer of several weeks before submission for revision, proofreading and problems.",
            "Review the plan every few weeks, and adjust it honestly.",
          ],
        },
        { type: "paragraph", text: "A hypothetical example for a ten-month empirical dissertation. It is one way to divide the time, not a rule; your programme's deadlines decide yours." },
        {
          type: "table",
          caption: "An example ten-month plan",
          columns: ["Months", "Stage", "Milestone"],
          rows: [
            ["1–2", "Topic, reading, research question, proposal", "Proposal approved"],
            ["2–3", "Ethics application, methodology, instruments", "Ethical approval; questionnaire or interview guide piloted"],
            ["3–5", "Data collection; literature review drafted alongside", "Data collected; literature review draft"],
            ["5–7", "Analysis; methodology and results drafted", "Results chapter draft"],
            ["7–8", "Discussion, introduction and conclusion", "Full first draft to supervisor"],
            ["9", "Revision after feedback", "Second draft"],
            ["10", "Final checks: references, word count, formatting, proofreading", "Submission"],
          ],
        },
      ],
    },
    {
      id: "supervisor",
      heading: "Working with your supervisor",
      blocks: [
        {
          type: "list",
          items: [
            "Agree how often you will meet and how you will communicate, and keep a short note of what each meeting decided.",
            "Send work before meetings, with specific questions, rather than asking for general feedback.",
            "Tell your supervisor early if you fall behind or something isn't working.",
            "Remember that the dissertation is yours: your supervisor advises, and you decide and take responsibility.",
          ],
        },
      ],
    },
    {
      id: "writing",
      heading: "Write as you go",
      blocks: [
        { type: "paragraph", text: "Don't leave writing until the data are in. Draft the literature review and methodology early, keep notes of every decision and why you made it, and record sources as you use them. A rough draft can be improved; a blank page in the last month can't." },
        { type: "paragraph", text: "Back up everything, including data, drafts and your reference library, in more than one place." },
      ],
    },
    {
      id: "stages-and-guides",
      heading: "The guides and tools for each stage",
      blocks: [
        { type: "paragraph", text: "ResearchKit's guides and tools follow the same path as a dissertation. Read the guides for the stage you are in, and use the research workspace to keep your plan, from problem to analysis, in one place." },
        {
          type: "links",
          items: [
            { label: "Plan: How to write a research question", href: "/learn/how-to-write-a-research-question" },
            { label: "Plan: How to write research objectives", href: "/learn/how-to-write-research-objectives" },
            { label: "Review: How to write a literature review", href: "/learn/how-to-write-a-literature-review" },
            { label: "Design: Qualitative or quantitative research?", href: "/learn/qualitative-or-quantitative-research" },
            { label: "Analyse: How to choose a statistical test", href: "/learn/how-to-choose-a-statistical-test" },
            { label: "Report: How to report statistics in APA Style", href: "/learn/how-to-report-statistics-in-apa" },
            { label: "Finalise: How to meet a word limit", href: "/learn/how-to-meet-a-word-limit" },
            { label: "Plan your whole project in the research workspace", href: "/workspace" },
          ],
        },
      ],
    },
    {
      id: "final-checks",
      heading: "Before you submit",
      blocks: [
        {
          type: "list",
          items: [
            "Every research question is answered, and the conclusion says how.",
            "Every citation has a reference, every reference is cited, and the list follows your style.",
            "The word count is within the limit, counting what your programme counts.",
            "Tables and figures are numbered, titled and referred to in the text.",
            "The abstract, if required, summarises the finished work.",
            "The formatting, front matter and declarations follow your regulations.",
          ],
        },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Choosing a topic too broad to finish, or one that depends on access you don't have.",
            "Underestimating how long ethics approval and data collection take.",
            "Leaving writing until the end.",
            "Avoiding your supervisor when things go wrong.",
            "Planning no buffer for revision and problems.",
            "Ignoring the programme's regulations on structure, length or formatting.",
          ],
        },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["bryman-2016", "saunders-2019"] }],
    },
  ],
  faq: [
    { question: "How long does a dissertation take?", answer: "It depends on the level and the programme: from a few months for an undergraduate dissertation to years for a doctorate. Your programme's regulations set the time." },
    { question: "Can I change my topic after the proposal?", answer: "Often, within limits; discuss it with your supervisor first, and check whether changes need approval." },
    { question: "Do I need ethical approval?", answer: "Usually, if you collect data from or about people. Your institution's ethics process decides; apply early, because it takes time." },
    { question: "What is the difference between a dissertation and a thesis?", answer: "The terms are used differently in different countries and institutions; use the one your programme uses." },
    { question: "How much should I write each week?", answer: "There is no right amount. Regular writing, even in short sessions, keeps a long project moving better than occasional long sessions." },
  ],
  relatedToolIds: ["research-question-builder", "research-objectives-generator", "research-design-builder", "literature-matrix", "word-counter"],
  relatedGuideSlugs: ["how-to-write-a-research-question", "how-to-write-a-literature-review", "qualitative-or-quantitative-research", "how-to-write-an-abstract", "how-to-meet-a-word-limit", "how-to-manage-your-references"],
};
