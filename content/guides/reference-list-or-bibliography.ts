import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Reference lists, Works Cited lists and bibliographies: what each contains and
 * which each style uses. The style table matches the Reference Checker's declared
 * capabilities, and the example lists are the generators' output; the guide's tests
 * check both.
 */
export const referenceListOrBibliography: Guide = {
  slug: "reference-list-or-bibliography",
  title: "Reference list or bibliography?",
  description:
    "The difference between a reference list, a Works Cited list and a bibliography, which one APA, MLA, Chicago, IEEE and Harvard use, what each should contain, and how to order it.",
  summary:
    "A reference list contains only the sources you cite in your work. A bibliography can also include works you read for background, and an annotated bibliography adds a note on each. Most styles use a reference list (MLA calls it Works Cited); Chicago's notes and bibliography system uses a bibliography. Use what your style and your instructions ask for.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "the-difference",
      heading: "The difference",
      blocks: [
        { type: "paragraph", text: "A reference list documents the sources behind what you wrote: every entry is cited somewhere in your text, and every citation in your text has an entry. APA puts it this way: a reference list contains works that specifically support the ideas, claims and concepts in a paper, while a bibliography provides works for background or further reading and may include descriptive notes (American Psychological Association, 2020)." },
        { type: "paragraph", text: "The two terms are often used loosely, so read your instructions closely. “Bibliography” sometimes just means the list at the end, whatever it contains." },
      ],
    },
    {
      id: "by-style",
      heading: "Which list each style uses",
      blocks: [
        {
          type: "table",
          caption: "The list at the end, by style",
          columns: ["Style", "List", "Heading", "Order", "Same author, same year"],
          rows: [
            ["APA 7", "Reference list", "References", "Alphabetical", "Year letters: 2024a, 2024b"],
            ["MLA 9", "Works Cited list", "Works Cited", "Alphabetical", "No year letters; titles tell the works apart"],
            ["Chicago author-date", "Reference list", "References", "Alphabetical", "Year letters: 2024a, 2024b"],
            ["Chicago notes and bibliography", "Bibliography", "Bibliography", "Alphabetical", "No year letters; titles tell the works apart"],
            ["IEEE", "Reference list", "References", "Numbered in the order of first citation", "No year letters; each work has its own number"],
            ["Harvard (Cite Them Right)", "Reference list", "Reference list", "Alphabetical", "Year letters: 2024a, 2024b"],
          ],
        },
        { type: "paragraph", text: "MLA's Works Cited list is a reference list under another name: it contains the works you cite (Modern Language Association of America, 2021). In Chicago's notes and bibliography system the notes cite the sources and the bibliography lists them, in alphabetical order (University of Chicago Press, 2024); Chicago's author-date system uses a reference list instead." },
        { type: "paragraph", text: "IEEE is the exception in ordering: references are numbered in the order they are first cited, never alphabetically (IEEE Publication Operations, 2025). Harvard guides, including Cite Them Right (Pears & Shields, 2025), use a reference list of the works cited; some assignments ask for a bibliography as well, which also includes works read but not cited." },
      ],
    },
    {
      id: "what-to-include",
      heading: "What to include",
      blocks: [
        {
          type: "list",
          items: [
            "In a reference list: every source you cite, and nothing you don't. A source you read but didn't cite doesn't belong, however useful it was.",
            "In a bibliography: the sources you cite and, if your instructions ask for it, other works you consulted. Check whether uncited works are wanted.",
            "One entry per source, even if you cite it many times.",
            "The source you actually read. If you only know a work through someone else's account of it, cite the work you read, as your style describes for secondary sources.",
          ],
        },
      ],
    },
    {
      id: "annotated-bibliography",
      heading: "Annotated bibliographies",
      blocks: [
        { type: "paragraph", text: "An annotated bibliography is usually an assignment in its own right: a list of sources, each followed by a short paragraph that summarises and often evaluates it. It is common at the start of a dissertation or literature review, to show the reading you have done. Format the entries in your style, then add the annotations as your instructions describe; the APA Publication Manual gives guidance on formatting them (American Psychological Association, 2020)." },
      ],
    },
    {
      id: "ordering",
      heading: "How to order the list",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Alphabetical styles order entries by their first word: the first author's family name, an organisation's name, or the title when there is no author.",
            "Several works by the same author follow rules that differ by style, usually by year and then title.",
            "Author–date styles add letters to tell apart works by the same author in the same year (2024a, 2024b), so that each citation points to one entry. Only the whole list shows whether letters are needed.",
            "IEEE numbers sources as you first cite them, so the list's order follows your text. Adding or removing a citation can change every later number.",
          ],
        },
      ],
    },
    {
      id: "example",
      heading: "Example: the same three sources, two ways",
      blocks: [
        { type: "paragraph", text: "The same three sources: a book, a journal article and a web page. The book and the article are real; the web page is invented, on an invented website. In APA they are ordered alphabetically by author. In IEEE they are numbered in the order a paper first cites them, here the article, then the web page, then the book. Each entry is what ResearchKit's generator produces, with the title typed in the capitals each style uses." },
        { type: "table", caption: "An APA reference list", columns: ["References"], rows: [["Cottrell, S. (2019). The study skills handbook (5th ed.). Red Globe Press."], ["Sharma, A. (2024, March 18). Community forestry in the mid-hills. Himalayan Research Notes. https://example.org/community-forestry"], ["Thaker, J., Smith, N., & Leiserowitz, A. (2020). Global warming risk perceptions in India. Risk Analysis, 40(12), 2481–2497. https://doi.org/10.1111/risa.13574"]] },
        { type: "table", caption: "An IEEE reference list", columns: ["References"], rows: [["[1] J. Thaker, N. Smith, and A. Leiserowitz, “Global warming risk perceptions in India,” Risk Analysis, vol. 40, no. 12, pp. 2481–2497, Dec. 2020, doi: 10.1111/risa.13574."], ["[2] A. Sharma. “Community forestry in the mid-hills.” Himalayan Research Notes. Accessed: Feb. 10, 2025. [Online]. Available: https://example.org/community-forestry"], ["[3] S. Cottrell, The Study Skills Handbook, 5th ed. London, U.K.: Red Globe Press, 2019."]] },
        { type: "paragraph", text: "The tables lose the formatting: in the generators, book and journal titles appear in italics, and each entry would have a hanging indent in an alphabetical list. IEEE also abbreviates journal names, such as Risk Anal.; the generator uses the name as you type it." },
      ],
    },
    {
      id: "layout",
      heading: "Layout",
      blocks: [
        {
          type: "list",
          items: [
            "Start the list on a new page at the end of the work, under the heading your style uses, unless your instructions say otherwise.",
            "Use a hanging indent for alphabetical lists, where the second and later lines of each entry are indented, if your style or institution asks for it. APA, MLA and Chicago use one.",
            "Use one list for every kind of source. Don't divide books from articles or web pages unless you are told to.",
            "Keep the spacing your instructions ask for, usually the same as the rest of the work.",
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
            "Listing everything you read in a reference list, including works you never cite.",
            "Citing a source in the text that has no entry, or listing a source that is never cited.",
            "Calling the list a bibliography because it sounds more formal, when your style asks for a reference list.",
            "Ordering an IEEE list alphabetically, or an APA list by order of citation.",
            "Splitting the list by source type without being asked to.",
            "Forgetting to update year letters or IEEE numbers after adding or removing a source.",
          ],
        },
      ],
    },
    {
      id: "check-your-list",
      heading: "Check your list with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Reference Checker reads a pasted list in any of six styles and reports entries that are out of order, duplicated or incomplete, and, if you paste your text too, citations without an entry and entries never cited. It reports what it can detect; it doesn't decide whether a source belongs in your list." },
        { type: "links", items: [{ label: "Check a reference list", href: "/tools/reference-checker" }, { label: "Find your citation style", href: "/tools/citation-style-finder" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020", "mla-2021", "chicago-2024", "ieee-2025", "cite-them-right-2025"] }],
    },
  ],
  faq: [
    { question: "Is a Works Cited list the same as a bibliography?", answer: "No. A Works Cited list contains only the works you cite, like a reference list. A bibliography may also include works you consulted." },
    { question: "My assignment says “bibliography” but I'm using APA. What should I do?", answer: "Ask what is wanted. If only cited works are expected, give an APA reference list; if consulted works are wanted too, ask how they should be presented." },
    { question: "Do I list sources I read but didn't cite?", answer: "Not in a reference list or Works Cited list. In a bibliography, only if your instructions ask for consulted works." },
    { question: "Can I sort my list by source type?", answer: "Only if you are asked to. Every style ResearchKit supports uses one list for all source types." },
    { question: "Does the order matter?", answer: "Yes. In an alphabetical list it lets readers find an entry from the citation; in IEEE the numbers depend on the order of first citation." },
  ],
  relatedToolIds: ["reference-checker", "citation-style-finder", "apa-citation-generator", "mla-citation-generator", "chicago-notes-bibliography-citation-generator", "ieee-citation-generator", "harvard-citation-generator"],
  relatedGuideSlugs: ["how-to-choose-a-citation-style", "how-to-manage-your-references", "how-to-avoid-plagiarism", "reference-checker"],
};
