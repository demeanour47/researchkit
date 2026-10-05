import type { Guide } from "../../src/domains/publishing/guide";

export const howToChooseACitationStyle: Guide = {
  slug: "how-to-choose-a-citation-style",
  title: "How to choose a citation style",
  description:
    "Who decides which citation style you use, how the main styles differ, and what to do when instructions are missing or conflict.",
  summary:
    "Use the style named in your instructions. If none is named, ask whoever will assess or publish your work. Only if you are genuinely free to choose should you pick the style most common in your subject, and then use it consistently.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-a-citation-style",
      heading: "What is a citation style?",
      blocks: [
        {
          type: "paragraph",
          text: "A citation style is a set of rules for acknowledging the sources you use: how to mark a source in your text, and how to give its full details in a list or in notes.",
        },
        { type: "paragraph", text: "Styles differ in three main ways:" },
        {
          type: "list",
          items: [
            "How a source appears in your text: as the author and year, the author and page, a number, or a footnote.",
            "How the full reference is ordered and punctuated, from authors' names to titles and dates.",
            "What the list of sources is called: references, works cited or a bibliography.",
          ],
        },
        {
          type: "paragraph",
          text: "Most styles are defined in a manual published by an organisation, and are revised in new editions. Using the right edition matters as much as using the right style.",
        },
      ],
    },
    {
      id: "who-decides",
      heading: "Who decides which style to use?",
      blocks: [
        {
          type: "paragraph",
          text: "Whoever will assess or publish your work decides, not you and not your subject. As a rule, the most specific instruction wins:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Your assignment brief, or a journal's instructions for authors, which apply to this piece of work.",
            "Your course handbook, or your department's or university's referencing guide, which set the default for your programme.",
            "Your instructor or supervisor, when written guidance is missing or unclear.",
            "The conventions of your subject, only when no one has specified a style.",
          ],
        },
        {
          type: "paragraph",
          text: "Journals and publishers often base their house style on a standard one but change details. When you write for publication, follow their instructions even where they differ from the manual.",
        },
      ],
    },
    {
      id: "common-styles",
      heading: "Common citation styles",
      blocks: [
        {
          type: "paragraph",
          text: "These five styles cover most academic writing in English. Each is described by where it is commonly used, not where it is required: your instructions still come first.",
        },
        { type: "styles", styles: ["apa", "mla", "chicago", "ieee", "harvard"] },
      ],
    },
    {
      id: "one-source-six-styles",
      heading: "One source in six styles",
      blocks: [
        { type: "paragraph", text: "The differences are easiest to see side by side. Here is the same book, Stella Cottrell's The Study Skills Handbook (5th edition, 2019), as ResearchKit's generator for each style formats it, with the title typed in the capitals each style uses. Italics are lost in this table." },
        {
          type: "table",
          caption: "The same book in six styles",
          columns: ["Style", "Reference entry", "Citation in the text or note"],
          rows: [
            ["APA 7", "Cottrell, S. (2019). The study skills handbook (5th ed.). Red Globe Press.", "(Cottrell, 2019)"],
            ["MLA 9", "Cottrell, Stella. The Study Skills Handbook. 5th ed., Red Globe Press, 2019.", "(Cottrell)"],
            ["Chicago author-date", "Cottrell, Stella. 2019. The Study Skills Handbook. 5th ed. Red Globe Press.", "(Cottrell 2019)"],
            ["Chicago notes and bibliography", "Cottrell, Stella. The Study Skills Handbook. 5th ed. Red Globe Press, 2019.", "Stella Cottrell, The Study Skills Handbook, 5th ed. (Red Globe Press, 2019)."],
            ["IEEE", "[1] S. Cottrell, The Study Skills Handbook, 5th ed. London, U.K.: Red Globe Press, 2019.", "[1]"],
            ["Harvard", "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press.", "(Cottrell, 2019)"],
          ],
        },
        { type: "paragraph", text: "The details are the same; the order, punctuation, capitals and the form of the citation differ. When you cite a page, MLA gives it with the author, Chicago and Harvard after the year, and IEEE inside the brackets." },
      ],
    },
    {
      id: "multiple-styles-acceptable",
      heading: "When multiple styles are acceptable",
      blocks: [
        {
          type: "paragraph",
          text: "Sometimes you are told to use “any recognised style”, or no style is named at all. In that case:",
        },
        {
          type: "list",
          items: [
            "Choose the style most common in your subject, so your readers find your references familiar.",
            "If your subject has no clear standard, consider the style used by your most important sources.",
            "Use one style, and one edition of it, throughout. Consistency matters more than which style you choose.",
          ],
        },
      ],
    },
    {
      id: "conflicting-instructions",
      heading: "What to do if instructions conflict",
      blocks: [
        {
          type: "paragraph",
          text: "Conflicts are common: a course handbook names one style while an assignment brief names another, or a journal's instructions differ from the manual.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Follow the most specific instruction. An assignment brief usually overrides a general handbook, and a journal's instructions override the published manual.",
            "If you are unsure which applies, ask the person who will assess or publish your work. Ask in writing if you can, and keep the answer.",
            "If you cannot get an answer in time, follow the most specific written instruction and apply it consistently.",
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
            "Mixing styles, such as author–date citations in the text with a numbered reference list.",
            "Using the wrong edition. New editions change rules, so check which edition you were asked for.",
            "Treating Harvard as one style. Versions differ between institutions in punctuation and detail.",
            "Choosing a style because it looks familiar, instead of checking what your instructions require.",
            "Trusting a citation generator without checking. Automated tools make mistakes, especially with web sources and missing details, so check each entry against the style's rules.",
          ],
        },
      ],
    },
    {
      id: "learning-path",
      heading: "Where to go next",
      blocks: [
        { type: "paragraph", text: "Once you know your style, its guide explains how to cite books, journal articles and web pages in it. Then learn how to cite web pages in any style, which list your style uses at the end, and how citing protects you from plagiarism, and check your finished list with the Reference Checker." },
        {
          type: "links",
          items: [
            { label: "APA 7 citations and references", href: "/learn/apa-7-citations-and-references" },
            { label: "MLA 9 citation and Works Cited", href: "/learn/mla-9-citations-and-works-cited" },
            { label: "Chicago author-date citations", href: "/learn/chicago-author-date-citations" },
            { label: "Chicago notes and bibliography", href: "/learn/chicago-notes-bibliography" },
            { label: "IEEE citations and references", href: "/learn/ieee-citations-and-references" },
            { label: "Harvard citations and references", href: "/learn/harvard-citations-and-references" },
            { label: "How to cite a website", href: "/learn/how-to-cite-a-website" },
            { label: "Reference list or bibliography?", href: "/learn/reference-list-or-bibliography" },
            { label: "How to avoid plagiarism", href: "/learn/how-to-avoid-plagiarism" },
            { label: "Find your style with the Citation Style Finder", href: "/tools/citation-style-finder" },
          ],
        },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [
        { type: "paragraph", text: "Each style is defined by its own authority: the APA Publication Manual (American Psychological Association, 2020), the MLA Handbook (Modern Language Association of America, 2021), The Chicago Manual of Style (University of Chicago Press, 2024) and the IEEE Reference Guide (IEEE Publication Operations, 2025). Harvard has no single authority; ResearchKit follows Cite Them Right (Pears & Shields, 2025)." },
        { type: "references", ids: ["apa-2020", "mla-2021", "chicago-2024", "ieee-2025", "cite-them-right-2025"] },
      ],
    },
  ],
  faq: [
    {
      question: "Can I choose any citation style I like?",
      answer:
        "Only if no one has specified one. Most assignments, theses and journals name a style; if yours does not, ask. If you are genuinely free to choose, use the style most common in your subject, and use it consistently.",
    },
    {
      question: "Is Harvard the same as APA?",
      answer:
        "No. Both are author–date styles, so they look similar, but they differ in punctuation and in how references are formatted. Harvard also has no single official version.",
    },
    {
      question: "Which edition should I use?",
      answer:
        "The one your instructions name. If none is named, use the current edition of the style's official manual, unless your institution's guide says otherwise.",
    },
    {
      question: "What if my subject isn't listed here?",
      answer:
        "Many fields have their own styles, such as ACS in chemistry or The Bluebook for law in the United States. The Citation Style Finder covers more subjects, and your library's referencing guide will cover your field.",
    },
    {
      question: "Are footnotes a citation style?",
      answer:
        "Footnotes are a way of citing that several styles use, including Chicago's notes and bibliography system and most legal styles. The style decides how each note is written.",
    },
  ],
  relatedToolIds: ["citation-style-finder", "apa-citation-generator", "mla-citation-generator", "chicago-author-date-citation-generator", "chicago-notes-bibliography-citation-generator", "ieee-citation-generator", "harvard-citation-generator", "reference-checker"],
  relatedGuideSlugs: ["apa-7-citations-and-references", "mla-9-citations-and-works-cited", "chicago-author-date-citations", "chicago-notes-bibliography", "ieee-citations-and-references", "harvard-citations-and-references", "reference-list-or-bibliography"],
};
