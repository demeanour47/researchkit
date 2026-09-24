import type { Guide } from "@/domains/publishing/guide";

export const howToChooseACitationStyle: Guide = {
  slug: "how-to-choose-a-citation-style",
  title: "How to choose a citation style",
  description:
    "Who decides which citation style you use, how the main styles differ, and what to do when instructions are missing or conflict.",
  summary:
    "Use the style named in your instructions. If none is named, ask whoever will assess or publish your work. Only if you are genuinely free to choose should you pick the style most common in your subject, and then use it consistently.",
  updated: "2026-09-24",
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
  relatedToolIds: ["citation-style-finder", "apa-citation-generator"],
};
