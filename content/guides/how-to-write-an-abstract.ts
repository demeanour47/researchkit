import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Writing an abstract. The content and length guidance follows APA's abstract
 * guidance; structured abstracts follow CONSORT for abstracts. The example abstract is
 * for a hypothetical study, and its word and character counts are the Word Counter's,
 * which the guide's tests recalculate.
 */
export const howToWriteAnAbstract: Guide = {
  slug: "how-to-write-an-abstract",
  title: "How to write an abstract",
  description:
    "What an abstract must contain, how long it should be, structured and unstructured abstracts, a worked example sentence by sentence, keywords, and how to fit within a word or character limit.",
  summary:
    "An abstract is a short, self-contained summary of your whole study: the problem, what you did, what you found and what it means. In APA Style it is usually limited to 250 words, with three to five keywords. Write it last, from the finished work, and make every sentence carry information: a reader should be able to decide from the abstract alone whether to read the paper.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "purpose",
      heading: "What an abstract is for",
      blocks: [
        { type: "paragraph", text: "An abstract gives a brief but comprehensive summary of the paper. Readers use it to decide whether to read the full text, and databases index it, so it is often the only part of your work most people read (American Psychological Association, 2020)." },
        { type: "paragraph", text: "It must stand alone: no references to tables or sections, no abbreviations a reader hasn't been told, and no claims the paper doesn't support. Abstracts aren't usually required for student papers in APA Style; check whether your instructor or institution wants one." },
      ],
    },
    {
      id: "what-to-include",
      heading: "What to include",
      blocks: [
        { type: "paragraph", text: "APA's guidance lists what an abstract addresses, usually in one or two sentences each (American Psychological Association, 2020):" },
        {
          type: "list",
          items: [
            "key aspects of the literature review;",
            "the problem under investigation, or the research questions;",
            "the hypotheses, if any;",
            "the methods, including the design, the sample and the sample size;",
            "the results;",
            "the implications: why the study matters, and how the results or findings can be applied.",
          ],
        },
        { type: "paragraph", text: "A review or theoretical paper has no methods or results in this sense; its abstract states the topic, the scope, the sources used and the conclusions." },
      ],
    },
    {
      id: "length",
      heading: "How long",
      blocks: [
        { type: "paragraph", text: "APA limits an abstract to 250 words unless your instructor or journal asks otherwise, and journals' own limits vary (American Psychological Association, 2020). Many submission systems also limit the number of characters, counting spaces, so check both if both are given." },
      ],
    },
    {
      id: "structured",
      heading: "Structured and unstructured abstracts",
      blocks: [
        { type: "paragraph", text: "An unstructured abstract is a single paragraph, as APA Style uses. A structured abstract divides the same content under headings, such as Background, Methods, Results and Conclusions, and is required by many journals, especially in health research. For reports of randomised trials, CONSORT for abstracts lists the items such an abstract should report (Hopewell et al., 2008). Use the format your journal or instructor specifies." },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example",
      blocks: [
        { type: "paragraph", text: "This is an invented abstract for a hypothetical study; its findings aren't real. It is 123 words and 853 characters including spaces, as the Word Counter counts them, so it fits a 250-word limit comfortably." },
        { type: "paragraph", text: "Homestay tourism is promoted in Nepal as a way of spreading tourism income to rural households, but little is known about which households benefit. This study examined the relationship between participation in a homestay programme and household income in Ghandruk, Kaski district. A survey of 180 households was conducted in 2024, and 14 homestay operators were interviewed. Households running homestays reported higher annual incomes than other households, but the difference was concentrated among households that already owned larger houses. Operators described rising costs and competition between homestays as their main constraints. The findings suggest that homestay programmes raise incomes for some households while reinforcing existing inequalities, so support aimed at poorer households may be needed if the programmes are to meet their aims." },
        {
          type: "table",
          caption: "What each sentence of the example does",
          columns: ["Sentence", "Job"],
          rows: [
            ["1", "Context and problem: what is claimed, and what isn't known"],
            ["2", "Aim, naming the relationship, population and setting"],
            ["3", "Methods: design, sample size, time and the qualitative strand"],
            ["4", "Main quantitative result, with its qualification"],
            ["5", "Main qualitative result"],
            ["6", "Implications"],
          ],
        },
        { type: "paragraph", text: "Compare an abstract that says nothing: “This study is about homestays in Nepal. Homestays are very important for tourism. We did a study and found some interesting results. The results are discussed in this paper and recommendations are made.” It names no question, method, sample, finding or implication, so a reader learns nothing from it." },
      ],
    },
    {
      id: "how-to-write-it",
      heading: "How to write it",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Write the abstract last, when you know what you found.",
            "Draft one or two sentences for each element: problem, aim, method, results, implications.",
            "Give the real findings, with their direction, rather than saying that results will be discussed.",
            "Cut words that carry no information: background everyone knows, and phrases such as “this paper will discuss”.",
            "Check every claim against the paper, and that nothing appears only in the abstract.",
            "Count the words, and the characters if there is a character limit.",
          ],
        },
      ],
    },
    {
      id: "keywords",
      heading: "Keywords",
      blocks: [
        { type: "paragraph", text: "Keywords help databases index your work and readers find it. APA suggests three to five words, phrases or acronyms, covering the topic, the population, the method and the application of the findings, written in lower case except for proper nouns (American Psychological Association, 2020). For the example: homestay tourism, household income, Nepal, mixed methods." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Writing the abstract first and not revising it to match the finished work.",
            "Spending most of the words on background and leaving no room for results.",
            "Promising results (“will be discussed”) instead of stating them.",
            "Including claims, numbers or citations that don't appear in the paper.",
            "Using undefined abbreviations or jargon.",
            "Exceeding the limit, or forgetting that a submission system counts characters.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Check your abstract with ResearchKit",
      blocks: [
        { type: "paragraph", text: "Paste your abstract into the Word Counter or Character Counter to check it against a word or character limit, and into the Readability Checker if it reads densely. A readability score doesn't measure quality, but very long sentences are worth a second look." },
        { type: "links", items: [{ label: "Count words", href: "/tools/word-counter" }, { label: "Count characters", href: "/tools/character-counter" }, { label: "Check readability", href: "/tools/readability-checker" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020", "hopewell-2008"] }],
    },
  ],
  faq: [
    { question: "How long should an abstract be?", answer: "In APA Style, no more than 250 words unless your instructor or journal says otherwise. Many journals set their own limits." },
    { question: "Should an abstract include citations?", answer: "Usually not. If a study is built directly on one earlier work, some journals allow a citation; check their instructions." },
    { question: "Is an abstract the same as an introduction?", answer: "No. An introduction sets up the study; an abstract summarises all of it, including the results and conclusions." },
    { question: "Should I write it in the past or present tense?", answer: "Usually the past tense for what you did and found, and the present tense for conclusions and implications." },
    { question: "Does my assignment need an abstract?", answer: "In APA Style, student papers don't usually include one. Check with your instructor." },
  ],
  relatedToolIds: ["word-counter", "character-counter", "readability-checker"],
  relatedGuideSlugs: ["how-to-meet-a-word-limit", "how-to-count-characters-in-academic-writing", "how-to-report-statistics-in-apa", "how-to-write-a-good-research-title"],
};
