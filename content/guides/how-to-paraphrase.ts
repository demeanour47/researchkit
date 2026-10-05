import type { Guide } from "../../src/domains/publishing/guide";

/**
 * How to restate a source in your own words and credit it. Citation rules follow the
 * APA Publication Manual's paraphrasing guidance; the principles follow Roig's guide
 * to ethical writing. The worked examples use invented sources, labelled as such.
 */
export const howToParaphrase: Guide = {
  slug: "how-to-paraphrase",
  title: "How to paraphrase correctly",
  description:
    "A step-by-step method for restating a source's idea in your own words and structure, with worked examples, how to cite a paraphrase, when to quote instead, and the mistakes that turn a paraphrase into plagiarism.",
  summary:
    "A paraphrase restates a source's idea in your own words and your own sentence structure, keeps its meaning exactly, and cites the source. It isn't a matter of swapping synonyms: you need to understand the idea well enough to explain it without looking at the original. Done well, paraphrasing lets you combine and compare sources in your own voice.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-a-paraphrase-is",
      heading: "What a paraphrase is",
      blocks: [
        { type: "paragraph", text: "A paraphrase restates another person's idea in your own words. It lets you summarise and synthesise information from one or more sources, focus on what matters for your argument, and compare and contrast details; published authors paraphrase far more often than they quote, and APA encourages students to do the same (American Psychological Association, 2020)." },
        { type: "paragraph", text: "A good paraphrase meets three tests: it keeps the source's exact meaning, it uses your words and your sentence structure, and it cites the source (Roig, 2015). Fail any one, and it is either inaccurate or plagiarism." },
      ],
    },
    {
      id: "paraphrase-or-quote",
      heading: "Paraphrase or quote?",
      blocks: [
        { type: "paragraph", text: "Paraphrase by default. Quote only when the exact words matter, for example:" },
        {
          type: "list",
          items: [
            "a definition you will rely on, where changing a word would change the concept;",
            "wording that is itself your evidence, such as a policy's or a participant's own words;",
            "a phrase so distinctive that rewording it would lose what makes it worth citing;",
            "highly technical text that you can't restate without changing its meaning.",
          ],
        },
        { type: "paragraph", text: "The last case matters in technical fields: making the substantial changes a real paraphrase needs requires both a good understanding of the ideas and command of the language, so a short, cited quotation is sometimes the more honest choice (Roig, 2015). Conventions also differ by discipline: some fields quote often, while others, such as many sciences, rarely quote at all." },
      ],
    },
    {
      id: "method",
      heading: "A method that works",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Read the passage until you understand it, including the sentences around it. You can't restate an idea you haven't grasped.",
            "Note its main point in a few words of your own: who or what, did what, with what result or condition.",
            "Close the source, or look away from it.",
            "Write the idea as you would explain it to a classmate, in a sentence built your way, for the purpose of your own argument.",
            "Open the source and compare. Has the meaning changed? Have any distinctive phrases or the original sentence structure crept back in?",
            "Revise, keeping technical terms that have no true equivalent, and quoting any phrase you decide to keep.",
            "Add the citation immediately, with a page number if your style requires one or it would help readers.",
          ],
        },
      ],
    },
    {
      id: "techniques",
      heading: "Techniques, and their limits",
      blocks: [
        {
          type: "list",
          items: [
            "Start from a different point. If the source opens with the cause, you might open with the effect.",
            "Change the sentence structure: combine two sentences, split a long one, or change active to passive where it suits your emphasis.",
            "Use your own vocabulary for ordinary words, but keep the field's technical terms. “Statistically significant”, “purposive sampling” and “inflation” have precise meanings; replacing them with near-synonyms can make your paraphrase wrong.",
            "Leave out details your argument doesn't need. A paraphrase can be shorter than the original, and a summary is much shorter.",
            "Connect the idea to your argument, saying why it matters, which also makes it more clearly yours.",
          ],
        },
        { type: "paragraph", text: "None of these techniques works mechanically. Replacing words one by one while keeping the original sentence's shape produces patchwriting, which is a form of plagiarism even with a citation." },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example",
      blocks: [
        { type: "paragraph", text: "The source below is invented for this example, attributed to an invented author, Gurung (2021), and isn't a real finding." },
        { type: "paragraph", text: "Source: “Small and medium enterprises in Pokhara that adopted digital payment systems reported faster transactions, although many owners remained concerned about transaction fees and the reliability of internet connections.”" },
        {
          type: "table",
          caption: "Weak and strong paraphrases",
          columns: ["Attempt", "Text", "What's wrong or right"],
          rows: [
            ["Synonym swap", "Small and medium businesses in Pokhara that took up digital payment systems reported quicker transactions, though many owners stayed worried about transaction charges and the dependability of internet connections (Gurung, 2021).", "Patchwriting: the structure and order are the source's, and only words have changed"],
            ["Changed meaning", "Digital payments made transactions faster for all businesses in Pokhara, and owners had few concerns (Gurung, 2021).", "Inaccurate: the source describes businesses that adopted the systems, and owners who were concerned"],
            ["Strong paraphrase", "Gurung (2021) found that digital payments sped up transactions for the Pokhara SMEs that used them, but their owners still worried about fees and unreliable internet access.", "Same meaning, new structure, technical term SMEs kept, cited"],
          ],
        },
        { type: "paragraph", text: "In the strong version the writer leads with the author, which puts the finding in context, and keeps the qualification about who adopted the systems, which the second attempt lost." },
      ],
    },
    {
      id: "citing",
      heading: "Citing a paraphrase",
      blocks: [
        {
          type: "list",
          items: [
            "Always cite a paraphrase, in the narrative form (Gurung, 2021, found …) or the parenthetical form (… unreliable internet access; Gurung, 2021).",
            "In APA a page or paragraph number isn't required for a paraphrase, but you may add one to help readers find the passage in a long or complex work (American Psychological Association, 2020).",
            "Author–page styles such as MLA, and note styles such as Chicago's notes and bibliography, give the page for paraphrases as well as quotations.",
            "A paraphrase can run over several sentences. In APA, cite the source when you first mention it; you needn't repeat the citation while it is clear you are still paraphrasing the same work, but cite it again if the paraphrase continues into a new paragraph (American Psychological Association, 2020).",
            "When a passage draws on several sources, or switches between them, repeat the citations so it is clear which idea came from which source (American Psychological Association, 2020).",
          ],
        },
      ],
    },
    {
      id: "synthesis",
      heading: "Paraphrasing several sources together",
      blocks: [
        { type: "paragraph", text: "In a literature review, paraphrase works hardest when it combines sources: you state what several studies show, how they agree or differ, and cite each. For example, with three invented studies: “Digital payments appear to speed up transactions for small firms (Gurung, 2021; Rai, 2023), although evidence on their costs is mixed (Rai, 2023; Shrestha, 2022).” Each claim carries the citations that support it, and the sentence makes a point none of the sources makes alone." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Swapping synonyms into the source's sentence and calling it a paraphrase.",
            "Leaving out the citation because the words are your own.",
            "Changing the meaning: dropping a qualification, overstating a finding, or generalising from a specific group.",
            "Replacing technical terms with everyday words that mean something different.",
            "Paraphrasing a whole source sentence by sentence, in the same order, instead of restating its ideas for your purpose.",
            "Relying on automatic rewording tools. They change words, not understanding, can distort meaning, and the result still needs a citation; check your institution's policy before using one.",
          ],
        },
      ],
    },
    {
      id: "practice",
      heading: "Practise with your own reading",
      blocks: [
        { type: "paragraph", text: "Keep paraphrased notes on each source, with the page and the citation, as you read. A literature matrix keeps them side by side, which makes it easier to compare sources and to write sentences that synthesise them." },
        { type: "links", items: [{ label: "Keep notes in a Literature Matrix", href: "/tools/literature-matrix" }, { label: "Cite in APA", href: "/tools/apa-citation-generator" }, { label: "Check your citations", href: "/tools/reference-checker" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020", "roig-2015"] }],
    },
  ],
  faq: [
    { question: "How much do I need to change?", answer: "Enough that the words and the sentence structure are yours. There is no percentage; if a reader could match your sentence to the source's phrase by phrase, it is too close." },
    { question: "Do I need a page number for a paraphrase?", answer: "In APA it is optional but helpful for a long work. In MLA and Chicago's notes and bibliography, give it." },
    { question: "Is a summary the same as a paraphrase?", answer: "A summary is a kind of paraphrase that condenses: it gives the main points of a longer passage or a whole work in far fewer words. Both need a citation." },
    { question: "Can I keep a few of the source's words?", answer: "Keep technical terms. Any other distinctive phrase you keep goes in quotation marks." },
    { question: "Can I paraphrase my own earlier work?", answer: "Yes, but cite it. Restating your own published work as if it were new is self-plagiarism." },
  ],
  relatedToolIds: ["literature-matrix", "apa-citation-generator", "reference-checker"],
  relatedGuideSlugs: ["how-to-avoid-plagiarism", "how-to-write-a-literature-review", "apa-7-citations-and-references"],
};
