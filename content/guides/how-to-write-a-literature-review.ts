import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Planning, searching, organising and writing a literature review. The worked example
 * uses invented studies, labelled as such; the Literature Matrix and PRISMA Flow
 * Builder are described by what they actually do.
 */
export const howToWriteALiteratureReview: Guide = {
  slug: "how-to-write-a-literature-review",
  title: "How to write a literature review",
  description:
    "What a literature review is for, the main types of review, how to search for and record sources, how to synthesise rather than summarise, how to find genuine gaps, and how to structure and write the review.",
  summary:
    "A literature review shows what is already known about your topic, how it is known and what is still unclear, so that your own study has a clear place. Search systematically, record each study's details as you read, and organise the review around concepts and arguments rather than one source after another. The review ends by showing the gap your research question addresses.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "purpose",
      heading: "What a literature review is for",
      blocks: [
        { type: "paragraph", text: "A literature review isn't a list of what you have read. It is an argument about the state of knowledge: what has been established, how it was studied, where findings agree and conflict, and what remains unknown (Hart, 2018). In a thesis or dissertation, it justifies your research question and supplies the concepts, theories and methods your study builds on." },
        { type: "paragraph", text: "A good review is organised around ideas: it should be concept-centric, organised by the concepts it discusses, rather than author-centric, a summary of one author after another (Webster & Watson, 2002)." },
      ],
    },
    {
      id: "types",
      heading: "Types of review",
      blocks: [
        { type: "paragraph", text: "Reviews range from flexible overviews to tightly specified procedures; one analysis identified 14 types, each with its own methods (Grant & Booth, 2009). Three broad approaches are commonly used, though there are many other forms and elements of different approaches are often combined (Snyder, 2019):" },
        {
          type: "table",
          caption: "Three approaches to reviewing literature",
          columns: ["Approach", "Purpose", "Typical use"],
          rows: [
            ["Systematic", "Identify, appraise and synthesise all the evidence on a specific question, by an explicit and reproducible method", "A precise question with comparable studies, such as whether an intervention works"],
            ["Semi-systematic (narrative)", "Map how a broad topic has been studied over time or across fields", "Topics studied in different ways by different disciplines"],
            ["Integrative", "Critique and synthesise the literature to generate new frameworks or perspectives", "Emerging or mature topics that need a fresh conceptual synthesis"],
          ],
        },
        { type: "paragraph", text: "Most literature reviews in coursework, theses and dissertations are narrative reviews. Even then, a planned and recorded search makes the review more credible and easier to update." },
      ],
    },
    {
      id: "process",
      heading: "The process, step by step",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Define the scope from your research question or topic: which concepts, populations, settings, years and kinds of study are in or out.",
            "Plan the search: the databases relevant to your field, your keywords and their synonyms, and how you will combine them with AND, OR and NOT.",
            "Search, and record what you did: where, when, the search terms and how many results each search found.",
            "Screen the results against your criteria, first by title and abstract, then by reading the full text.",
            "Read each included study critically, and record its details in the same structure: aims, design, sample, setting, measures, findings and limitations.",
            "Compare the studies: group them by theme, method or finding, and note where they agree, conflict or leave questions open.",
            "Write the review as an argument, organised around those groups, ending with the gap your study addresses.",
            "Update the search before you finish, so your review includes recent work.",
          ],
        },
      ],
    },
    {
      id: "reading-critically",
      heading: "Reading critically",
      blocks: [
        { type: "paragraph", text: "For each study, ask not only what it found but how far its findings can be trusted and applied:" },
        {
          type: "list",
          items: [
            "Is the question clear, and does the design suit it?",
            "Who was studied, how were they chosen, and how many were there?",
            "Were the measures or methods of data collection appropriate and well described?",
            "Do the conclusions follow from the results, or go beyond them?",
            "What limitations do the authors acknowledge, and what others do you see?",
            "How does the setting compare with yours: would the findings apply in your context?",
          ],
        },
      ],
    },
    {
      id: "synthesis",
      heading: "Summarising versus synthesising",
      blocks: [
        { type: "paragraph", text: "The commonest weakness of student reviews is a paragraph per source. Synthesis instead makes a point that draws on several sources at once. The studies in this example are invented for illustration; they aren't real research." },
        {
          type: "table",
          caption: "The same three studies, summarised and synthesised",
          columns: ["Approach", "Example"],
          rows: [
            ["Summary (author by author)", "Adhikari (2019) surveyed women in savings groups in Dhading and found higher household decision-making. Basnet (2021) interviewed members in Sindhupalchok and found that loan repayment pressure caused stress. Karki (2022) surveyed groups in two districts and found that benefits depended on group leadership."],
            ["Synthesis (by concept)", "Studies of savings groups in Nepal report gains in women's household decision-making (Adhikari, 2019; Karki, 2022), but these gains appear to depend on how groups are led (Karki, 2022) and may come with new pressures, such as the stress of repayment (Basnet, 2021). Most of this evidence comes from surveys in a few hill districts, so how members themselves experience these trade-offs remains little understood."],
          ],
        },
        { type: "paragraph", text: "The synthesis makes claims across studies, shows where they qualify each other, comments on the evidence itself, and ends by pointing towards a gap. Each claim still carries the citations that support it." },
      ],
    },
    {
      id: "gaps",
      heading: "Finding a genuine gap",
      blocks: [
        { type: "paragraph", text: "A gap is something the literature hasn't yet established, not just something you didn't find. Gaps come in several kinds:" },
        {
          type: "list",
          items: [
            "Stated gaps: limitations and future work that the studies' own authors name.",
            "Contextual gaps: populations, places or periods not yet studied, where there is reason to think findings might differ.",
            "Methodological gaps: questions studied only one way, such as only by surveys.",
            "Conflicting findings that no study has yet explained.",
            "Conceptual gaps: relationships or theories not yet tested or connected.",
          ],
        },
        { type: "paragraph", text: "Claim a gap only after a thorough search, and say what your search covered. “No study has examined…” is a strong claim; “No study identified in this search examined…” is an honest one." },
      ],
    },
    {
      id: "structure",
      heading: "Structuring the review",
      blocks: [
        {
          type: "list",
          items: [
            "Introduction: the topic, why it matters, the scope of the review and how it is organised. If your search was systematic, say how it was done.",
            "Body: sections organised by theme, concept, debate or method, each making an argument supported by several sources. Chronological order suits only reviews that trace how a field developed.",
            "Conclusion: what is known, how strong the evidence is, what is missing, and how your research question addresses it.",
          ],
        },
        { type: "paragraph", text: "Headings in the body should name ideas, such as “Leadership and the benefits of savings groups”, not sources or authors." },
      ],
    },
    {
      id: "systematic-reviews",
      heading: "Systematic reviews and PRISMA",
      blocks: [
        { type: "paragraph", text: "A systematic review follows an explicit, reproducible method: a protocol, a full search of several sources, screening against stated criteria by more than one reviewer where possible, appraisal of each study's quality, and a structured synthesis (Grant & Booth, 2009). It is a substantial project in its own right." },
        { type: "paragraph", text: "PRISMA 2020 is a reporting guideline for systematic reviews: a checklist of what to report and a flow diagram showing how many records were identified, screened, excluded with reasons, and included (Page et al., 2021). It describes how to report a review, not how to conduct one. Some narrative reviews also use a PRISMA-style diagram to make their search transparent." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Summarising one source per paragraph instead of synthesising across sources.",
            "Describing findings without evaluating how they were produced.",
            "Including only sources that support your view.",
            "Relying on a few old or easily found sources, and missing recent or key work.",
            "Losing the link to your research question, so the review reads as background rather than justification.",
            "Claiming a gap without a thorough search, or after only a few searches.",
            "Quoting heavily instead of paraphrasing and synthesising.",
            "Citing a study you only know from someone else's review as if you had read it.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Organise your review with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Literature Matrix gives every study the same columns, from design and sample to findings and limitations, imports BibTeX and RIS files from a reference manager, and shows the designs, variables and stated gaps that repeat across your studies. Its potential gaps describe only the studies you have entered, so treat them as prompts to check against a wider search, not as findings. The matrix isn't saved between visits, so export it to keep your work. For a systematic or scoping review, the PRISMA Flow Builder draws the flow diagram from your counts." },
        { type: "links", items: [{ label: "Open the Literature Matrix", href: "/tools/literature-matrix" }, { label: "Draw a PRISMA flow diagram", href: "/tools/prisma-flow-builder" }, { label: "Check your reference list", href: "/tools/reference-checker" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["grant-booth-2009", "hart-2018", "page-2021", "snyder-2019", "webster-watson-2002"] }],
    },
  ],
  faq: [
    { question: "How many sources should a literature review include?", answer: "There is no fixed number. It depends on the topic, the level of study and how much has been published; your handbook or supervisor may give a guide. Coverage of the important work matters more than the count." },
    { question: "How recent should my sources be?", answer: "Include the most recent work on your topic, and older work that is foundational or still influential. Many fields expect most sources to be from the last decade or so, but this varies." },
    { question: "Can I use a review written by someone else?", answer: "Yes, as a source and as a map to the original studies. Read and cite the original studies for the claims you rely on." },
    { question: "Is a literature review the same as a systematic review?", answer: "No. A systematic review is one kind of literature review, with an explicit, reproducible method; most dissertation reviews are narrative." },
    { question: "Should the review be written before or after collecting data?", answer: "Draft it before, because it shapes your question and methods, and revise it after, so it frames the findings you actually have." },
  ],
  relatedToolIds: ["literature-matrix", "prisma-flow-builder", "reference-checker", "research-question-builder"],
  relatedGuideSlugs: ["how-to-search-academic-literature", "how-to-read-a-research-paper", "how-to-manage-your-references", "how-to-paraphrase", "how-to-avoid-plagiarism", "how-to-choose-a-citation-style"],
};
