import type { Guide } from "../../src/domains/publishing/guide";

/**
 * What a research proposal is and how its sections fit together. It describes planned
 * work, so it never reports results. Structures vary by institution; the guide says so
 * and defers to the reader's own requirements.
 */
export const howToWriteAResearchProposal: Guide = {
  slug: "how-to-write-a-research-proposal",
  title: "How to write a research proposal",
  description:
    "How to write a research proposal: what it is, the sections it usually has, what each section must answer, how it differs from a paper and a thesis, and the mistakes to avoid. A plan for research you have not yet done.",
  summary:
    "A research proposal is a plan for research you have not yet done. It argues that a question matters, shows what is already known, and explains how you will answer it. It reports no results, because there are none yet. Institutions differ in the format they require, so follow your own instructions first.",
  updated: "2026-10-10",
  reviewedBy: null,
  sections: [
    {
      id: "what-it-is",
      heading: "What a research proposal is",
      blocks: [
        { type: "paragraph", text: "A proposal asks a reader, such as a supervisor, a committee or a funder, to agree that your study is worth doing and can be done. It describes planned research: the question, the background, the method and the schedule. It is judged on how convincing and feasible the plan is, not on findings." },
        { type: "paragraph", text: "Because the research has not happened, write about it in the future or conditional tense (\"will survey\", \"would be analysed\"), and never invent results, data or conclusions. If you want to show what an analysis could look like, describe it, and say plainly that it is planned." },
      ],
    },
    {
      id: "structure",
      heading: "The sections a proposal usually has",
      blocks: [
        { type: "paragraph", text: "These sections are common, not universal. Some institutions combine them, rename them or add others, and your instructions decide." },
        {
          type: "table",
          caption: "A common research proposal structure",
          columns: ["Section", "What it must do", "Questions it answers"],
          rows: [
            ["Title and abstract", "Name the study and summarise the plan", "What is the study and why does it matter?"],
            ["Introduction", "Give the background, the problem and the gap", "What is the problem, and what is not yet known?"],
            ["Research questions and objectives", "State what the study will find out", "What exactly will this study answer?"],
            ["Significance and scope", "Say who benefits and where the study stops", "Why does it matter, and what is left out?"],
            ["Literature review", "Show what is known and where the gap is", "What do others say, and what remains open?"],
            ["Methodology", "Describe the design, sample, data and analysis you plan", "How will the questions be answered?"],
            ["Ethics", "Explain how participants and data will be protected", "What could go wrong for the people involved?"],
            ["Timeline and resources", "Show the work is achievable", "Can it be done in the time and with the means available?"],
            ["References", "List every source cited", "Where can the reader check the sources?"],
          ],
        },
      ],
    },
    {
      id: "planned-research",
      heading: "Planned research versus completed research",
      blocks: [
        { type: "paragraph", text: "The clearest difference between a proposal and a paper is time. A proposal looks forward, so its method is a plan and its analysis is a plan. A paper looks back, so its method is a record and its results are real." },
        {
          type: "list",
          items: [
            "A proposal has no Results or Discussion section, because there are no results to report.",
            "Its methodology says what you will do and why that suits the question; it does not say what you found.",
            "Where a paper writes \"participants completed the survey\", a proposal writes \"participants will complete the survey\".",
            "It must show feasibility: that the sample, access, time and skills exist.",
          ],
        },
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
            "Start from an interest and narrow it to a topic you can study in the time available.",
            "Search the literature with keywords and synonyms, and note where studies disagree or leave something out. That is your gap.",
            "Write the research problem, then a research question that responds to it.",
            "Turn the question into objectives that are specific and achievable.",
            "Choose a design that suits the question, then the population, sampling, measurement and analysis.",
            "Think through ethics and the schedule before you write the final text.",
            "Write the introduction and abstract last, once you know what the proposal says.",
          ],
        },
        { type: "paragraph", text: "ResearchKit's Research Journey follows this order and links each step to the tool that helps with it. The journey records what you produce in the tools; it does not write the proposal for you." },
      ],
    },
    {
      id: "formatting",
      heading: "Formatting",
      blocks: [
        { type: "paragraph", text: "Keep three kinds of requirement apart. General academic practice applies almost everywhere: clear headings, numbered tables and figures, every citation matched by a reference. A citation style, such as APA 7 or MLA 9, sets how citations and references look. Your institution sets everything else, including length, margins, front matter and section order, and its instructions take priority over any general advice here." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Choosing a topic too broad to study in the time available.",
            "Stating a topic but no problem or gap.",
            "Writing results, or claiming findings, in a plan.",
            "Describing methods without saying why they suit the question.",
            "Choosing a statistical test before the design is clear.",
            "Leaving out ethics, or the timeline.",
            "Citing sources that were not read.",
          ],
        },
      ],
    },
  ],
  faq: [
    { question: "Does a research proposal include results?", answer: "No. A proposal describes research you plan to do, so it has no results or discussion of findings." },
    { question: "How long should a research proposal be?", answer: "Your institution or funder sets the length. There is no universal word count, so check your instructions." },
    { question: "What is the difference between a proposal and a thesis?", answer: "A proposal plans research; a thesis reports completed research in depth, with results, discussion and conclusions." },
    { question: "Can a proposal change after it is approved?", answer: "Often, within limits. Talk to your supervisor, and record what changed and why." },
    { question: "Do I need a hypothesis?", answer: "Only if the study tests a relationship. A qualitative proposal usually has research questions and no hypothesis, and that is fine." },
  ],
  relatedToolIds: ["research-question-builder", "research-objectives-generator", "research-design-builder", "sampling-builder", "reference-checker"],
  relatedGuideSlugs: ["how-to-write-a-research-question", "how-to-write-a-literature-review", "how-to-plan-a-dissertation", "how-to-write-a-research-paper", "how-to-write-a-thesis-or-dissertation"],
};
