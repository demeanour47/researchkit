import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Searching for scholarly literature on a topic. The worked examples are invented and
 * labelled as such; Literature Explorer is described by what it actually does.
 */
export const howToSearchAcademicLiterature: Guide = {
  slug: "how-to-search-academic-literature",
  title: "How to search academic literature",
  description:
    "How to turn a topic into search terms, use phrases, synonyms and operators, widen or narrow a search, judge the results, find DOIs and free full text, and record your search so you can repeat it.",
  summary:
    "A good literature search starts with concepts, not sentences. List the key ideas in your question, add the synonyms authors might use, combine them with AND, OR and NOT, and search again as you learn the field's own vocabulary. Judge each result by reading, record every search you run, and keep a preliminary set of works to read in full.",
  updated: "2026-10-05",
  reviewedBy: null,
  sections: [
    {
      id: "why",
      heading: "Why searching is a skill",
      blocks: [
        { type: "paragraph", text: "Searching for scholarly work isn't like searching the web for an answer. A database can only match the words you give it, and the authors you want may use different words from yours. A search that returns nothing useful often has the wrong words, not the wrong topic." },
        { type: "paragraph", text: "Expect to search several times. Each round teaches you the terms the field uses, and the next round is better for it." },
      ],
    },
    {
      id: "concepts",
      heading: "Start from concepts",
      blocks: [
        { type: "paragraph", text: "Break your research question into its main concepts, usually two to four. Leave out words that don't carry meaning, such as “effect of” or “the role of”, unless they are part of what you are studying." },
        {
          type: "table",
          caption: "Invented example: from a question to concepts and synonyms",
          columns: ["Question", "Concept", "Other words an author might use"],
          rows: [
            ["How does feedback from classmates affect undergraduates' essay writing?", "peer feedback", "peer review, peer assessment, peer response"],
            ["", "undergraduate students", "university students, higher education students, college students"],
            ["", "academic writing", "essay writing, written assignments, composition"],
          ],
        },
        { type: "paragraph", text: "The table is an invented example. Check the words against what you find: the titles and abstracts of relevant works show the terms authors actually use." },
      ],
    },
    {
      id: "operators",
      heading: "Combine terms with AND, OR and NOT",
      blocks: [
        {
          type: "list",
          items: [
            "AND requires both ideas: “peer feedback” AND writing. Each AND narrows the search.",
            "OR accepts either word: student OR undergraduate. Use it between synonyms of the same concept. Each OR widens the search.",
            "NOT excludes a word. Use it sparingly: it can remove relevant works that happen to mention the word.",
            "Brackets group terms: (student OR undergraduate) AND “peer feedback”.",
            "Quotation marks keep words together as a phrase: “peer feedback” finds those words side by side, not anywhere in the text.",
          ],
        },
        { type: "paragraph", text: "Databases differ in how they read these, so check the help page of each one you use. Many treat a space between words as AND, and many match different forms of a word, so writing may find writings." },
      ],
    },
    {
      id: "broad-narrow",
      heading: "Widen and narrow",
      blocks: [
        { type: "paragraph", text: "Too many results usually mean the search is too broad; too few mean it is too narrow, or that the words don't match the field's." },
        {
          type: "table",
          caption: "What to try",
          columns: ["If you find", "Try"],
          rows: [
            ["Far too many results", "Add a concept with AND; use a phrase; limit the years; limit to articles or reviews"],
            ["Very few or no results", "Remove a concept; add synonyms with OR; remove quotation marks; remove filters; check the spelling"],
            ["Results from the wrong field", "Add a word that places the topic, such as a population or setting"],
            ["Mostly old work", "Limit the years, then read the older work that the recent studies cite"],
          ],
        },
        { type: "paragraph", text: "Change one thing at a time, so you know which change helped." },
      ],
    },
    {
      id: "iterate",
      heading: "Search again, and follow the trail",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Run a first search with your main concepts.",
            "Read the titles and abstracts of the most relevant results, and note new terms, authors and topics.",
            "Search again with those terms, and with synonyms.",
            "Look at the reference lists of the best works to find earlier work, and search for works that cite them to find later work.",
            "Stop when new searches mostly return works you have already seen.",
          ],
        },
        { type: "paragraph", text: "Several databases are better than one. A single tool, including Literature Explorer, covers only part of the literature, so use your library's databases for your subject too." },
      ],
    },
    {
      id: "evaluate",
      heading: "Judge the results",
      blocks: [
        { type: "paragraph", text: "A search tool ranks results by how well they match your words, not by how good they are. Decide for yourself, starting with the title and abstract and then reading the work." },
        {
          type: "list",
          items: [
            "Does it address your concepts, population and setting, or only mention the words?",
            "Is it a study, a review or a commentary? Each is useful for different things.",
            "Where was it published, and is that a journal, a book, a preprint or a thesis? A preprint has not been through peer review.",
            "Is it current enough, or foundational enough, for your purpose?",
            "Has it been retracted or corrected? Search tools do not always know.",
          ],
        },
        { type: "paragraph", text: "Abstracts are summaries written by the authors or generated by a database. Read the full work before relying on a claim from it." },
      ],
    },
    {
      id: "links",
      heading: "DOIs, publisher links and free full text",
      blocks: [
        { type: "paragraph", text: "A DOI (digital object identifier) is a permanent code for a work. Written as a link, such as https://doi.org/ followed by the code, it leads to the publisher's page for that work even if the publisher's own address changes. Citation styles such as APA ask for the DOI when there is one." },
        { type: "paragraph", text: "Many works are open access, meaning there is a free copy. It may be the published article, or an earlier version such as an accepted manuscript, which can differ from the final version. Your library may also give you access to works that are behind a payment barrier." },
      ],
    },
    {
      id: "duplicates",
      heading: "Duplicates and versions",
      blocks: [
        { type: "paragraph", text: "The same work can appear several times: as a journal article, a preprint and a repository copy, or in several databases. Combine them in your list, and cite the version you actually read, preferring the published version when it is available." },
      ],
    },
    {
      id: "record",
      heading: "Record your search",
      blocks: [
        { type: "paragraph", text: "Keep a log so you can repeat the search, update it later, and describe it in your methods or literature review. For each search, note:" },
        {
          type: "list",
          items: ["the database or tool, and the date you searched", "the exact search words and operators", "the filters, such as years and type of work", "how many results you found, and how many you kept"],
        },
        { type: "paragraph", text: "Then build a preliminary set: the works that look relevant enough to read in full. Add them to your reference manager, and note why you kept each." },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Typing a whole question or sentence instead of key concepts.",
            "Using only your own words and not the field's.",
            "Stopping after one search, or after the first page.",
            "Trusting the first results because they are first.",
            "Not recording the search, so it can't be repeated.",
            "Citing a work from its abstract without reading it.",
            "Treating a free copy as the final published version.",
          ],
        },
      ],
    },
    {
      id: "explorer",
      heading: "Try it with Literature Explorer",
      blocks: [
        { type: "paragraph", text: "Literature Explorer searches OpenAlex, an open index of scholarly works, and shows the words that matched in each result, the topics that recur, and links to each article, its DOI and any free full text. It can copy an APA 7 reference or BibTeX for each work." },
        {
          type: "list",
          ordered: true,
          items: [
            "Enter your main concepts, putting phrases in quotation marks and synonyms joined by OR.",
            "Narrow by years, open access or type of work if there are too many results.",
            "Read the topic groups and suggested words for terms you hadn't thought of, and search again.",
            "Open the works that look relevant, and read them.",
            "Copy the references you want to keep, and record your search.",
          ],
        },
        { type: "paragraph", text: "Its results come from OpenAlex's automatically collected data, which can be incomplete or wrong, and it is not a systematic search. Check every reference against the work before you cite it." },
        {
          type: "links",
          items: [
            { label: "Open Literature Explorer", href: "/tools/literature-explorer" },
            { label: "Compare studies in the Literature Matrix Builder", href: "/tools/literature-matrix" },
            { label: "Format references in the APA 7 builder", href: "/tools/apa-citation-generator" },
            { label: "Check your reference list", href: "/tools/reference-checker" },
          ],
        },
      ],
    },
  ],
  faq: [
    { question: "Is Google Scholar enough?", answer: "It is a useful starting point but not enough on its own. Its coverage and ranking aren't fully documented, so use it alongside the databases your library recommends for your subject." },
    { question: "How many results should I read?", answer: "There is no fixed number. Read the titles and abstracts of the most relevant results, then read in full those that fit your question, and keep searching until new searches mostly return works you have already seen." },
    { question: "Should I search with a full sentence?", answer: "Usually not. Databases match words, so key concepts, phrases and synonyms work better than a whole question." },
    { question: "What is the difference between a keyword and a subject heading?", answer: "A keyword is a word you choose, matched in the text. A subject heading is a term a database assigns from a fixed list. Some databases offer both, and subject headings help when authors use different words for the same idea." },
    { question: "Is a free full-text copy the same as the published article?", answer: "Not always. It may be an earlier version, such as an accepted manuscript. Check which version you have before quoting page numbers or citing it." },
    { question: "Can I cite a work I only found in a search tool?", answer: "Cite a work only after you have read it. A search result tells you the work exists, and the abstract tells you roughly what it is about; neither replaces the work." },
  ],
  relatedToolIds: ["literature-explorer", "literature-matrix", "apa-citation-generator", "reference-checker"],
  relatedGuideSlugs: ["how-to-write-a-literature-review", "how-to-read-a-research-paper", "how-to-manage-your-references", "how-to-write-a-research-question", "how-to-avoid-plagiarism"],
};
