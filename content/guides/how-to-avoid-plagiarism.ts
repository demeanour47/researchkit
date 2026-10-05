import type { Guide } from "../../src/domains/publishing/guide";

/**
 * What plagiarism is and how quoting, paraphrasing and citing prevent it. Definitions
 * follow the APA Publication Manual's guidance and Roig's guide to ethical writing;
 * the worked example uses an invented source, labelled as such.
 */
export const howToAvoidPlagiarism: Guide = {
  slug: "how-to-avoid-plagiarism",
  title: "How to avoid plagiarism",
  description:
    "What counts as plagiarism, including patchwriting and self-plagiarism, how quoting, paraphrasing and citing work together, what similarity reports do and don't show, and habits that prevent it.",
  summary:
    "Plagiarism is presenting someone else's words, ideas, data or images as your own, whether you mean to or not. You avoid it by crediting every source you use: quotation marks and a citation for words you copy, a citation for ideas you restate in your own words, and a reference for every source you cite. Most accidental plagiarism starts in careless notes, so good habits matter as much as good intentions.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-it-is",
      heading: "What plagiarism is",
      blocks: [
        { type: "paragraph", text: "Plagiarism is presenting the words, ideas or images of another person as your own. It denies the original authors the credit they are due, and it violates the ethical standards of scholarship whether it is deliberate or unintentional (American Psychological Association, 2020). The underlying principle is simple: an ethical writer always acknowledges the contributions of others to their work (Roig, 2015)." },
        { type: "paragraph", text: "Credit is also how scholarship works. Citations let readers trace an idea to its source, check it and build on it. A citation isn't an admission of weakness; it shows where your work stands in relation to others'." },
      ],
    },
    {
      id: "forms",
      heading: "The forms it takes",
      blocks: [
        {
          type: "list",
          items: [
            "Copying text without quotation marks, even with a citation: the citation credits the idea, but the quotation marks are what tell readers the words are someone else's.",
            "Restating a source's ideas in your own words without citing it.",
            "Patchwriting: keeping a source's sentence structure and much of its wording, with a few words changed or rearranged. Publishers and educators use plagiarism-checking software partly to find it (American Psychological Association, 2020).",
            "Using someone's data, figures, tables, images or study design without credit. If you model a study on someone else's, credit the original study.",
            "Self-plagiarism: presenting your own previously published work as new. Some institutions also treat submitting a paper written for one course to another course, without permission, as self-plagiarism (American Psychological Association, 2020).",
          ],
        },
      ],
    },
    {
      id: "what-it-isnt",
      heading: "What usually isn't plagiarism",
      blocks: [
        { type: "paragraph", text: "A minor citation error, such as a misspelt author's name or a missing element in a reference, isn't usually treated as plagiarism when it is clearly an oversight rather than an attempt to take credit, though it may still cost marks or need correcting (American Psychological Association, 2020)." },
        { type: "paragraph", text: "Facts that are genuinely common knowledge in your field, such as that Kathmandu is the capital of Nepal, don't need a citation. What counts as common knowledge depends on your readers and your discipline, so this is a judgement, not a rule: if a reader might reasonably ask “says who?”, cite a source." },
      ],
    },
    {
      id: "quote-paraphrase-summarise",
      heading: "Quoting, paraphrasing and summarising",
      blocks: [
        {
          type: "table",
          caption: "Three ways to use a source",
          columns: ["", "What you write", "What you must add"],
          rows: [
            ["Quotation", "The source's exact words", "Quotation marks (or a block quotation for a long passage), a citation, and in most styles a page number"],
            ["Paraphrase", "The source's idea, in your own words and your own sentence structure, with the same meaning", "A citation; a page number is optional in APA but helps readers find the passage in a long work"],
            ["Summary", "The main points of a longer passage or a whole work, much shorter than the original", "A citation"],
          ],
        },
        { type: "paragraph", text: "A paraphrase must reproduce the exact meaning of the source's idea in your words and sentence structure (Roig, 2015). That is harder than it sounds: it needs a good understanding of the idea and command of the language, so with very technical text a short quotation can be the honest choice. Published authors paraphrase far more often than they quote, and APA encourages students to do the same (American Psychological Association, 2020)." },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example",
      blocks: [
        { type: "paragraph", text: "The source sentence below is invented for this example, attributed to an invented author, Thapa (2022). It isn't a real finding." },
        { type: "paragraph", text: "Source: “Homestay programmes in rural Nepal have expanded household incomes, but the benefits have been unevenly distributed, favouring families who already owned larger houses and spoke English.”" },
        {
          type: "table",
          caption: "Four ways of using the source",
          columns: ["Version", "Text", "Verdict"],
          rows: [
            ["Copied without quotation marks", "Homestay programmes in rural Nepal have expanded household incomes, but the benefits have been unevenly distributed (Thapa, 2022).", "Plagiarism: the words are the source's, and nothing marks them as quoted"],
            ["Patchwriting", "Homestay schemes in rural Nepal have increased household earnings, but the gains have been unequally shared, favouring families who already had bigger houses and spoke English (Thapa, 2022).", "Plagiarism: the structure and most of the wording are the source's, with synonyms swapped in"],
            ["Quotation", "Thapa (2022) found that the benefits of homestays “have been unevenly distributed, favouring families who already owned larger houses and spoke English” (p. 14).", "Acceptable: the exact words are quoted, cited and located"],
            ["Paraphrase", "Rural homestays have raised incomes in Nepal, but mainly for households that were already better placed, with more room for guests and the ability to speak English with visitors (Thapa, 2022).", "Acceptable: the meaning is the source's, the words and structure are the writer's, and the source is cited"],
          ],
        },
        { type: "paragraph", text: "The page number in the quotation, p. 14, is also invented. The citations follow APA; other styles mark them differently, but the principle is the same in every style." },
      ],
    },
    {
      id: "habits",
      heading: "Habits that prevent accidental plagiarism",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Record the full details of every source when you first read it, before you take notes.",
            "In your notes, put copied words in quotation marks with the page number, so you can't later mistake them for your own.",
            "Write paraphrases with the source closed, then check them against it for meaning and for borrowed wording.",
            "Cite as you write. Adding citations at the end is how they get missed.",
            "Keep your own ideas, and your comments on sources, visibly separate from the sources' ideas in your notes.",
            "Before submitting, check that every citation has a reference and every reference is cited.",
          ],
        },
      ],
    },
    {
      id: "similarity-reports",
      heading: "What similarity reports do and don't show",
      blocks: [
        { type: "paragraph", text: "Universities and publishers often use software such as Turnitin or iThenticate to find text that matches other documents, including copied passages and patchwriting (American Psychological Association, 2020). The report shows matching text; it doesn't decide whether plagiarism happened." },
        {
          type: "list",
          items: [
            "A match isn't necessarily plagiarism: correctly quoted and cited passages, reference lists and common phrases also match.",
            "No match isn't proof of originality: an idea taken without credit, or a source the software doesn't hold, produces no match.",
            "A percentage alone means little. A person reads the matches in context and decides.",
          ],
        },
        { type: "paragraph", text: "Don't rewrite text just to lower a score. Rewording a source to avoid detection, without citing it, is still plagiarism." },
      ],
    },
    {
      id: "images-and-ai",
      heading: "Figures, images and AI-generated text",
      blocks: [
        { type: "paragraph", text: "Tables, figures and images need credit too. Reproducing or adapting one may also need a copyright attribution and, for some material, permission from the copyright holder, even for images that are free to use online (American Psychological Association, 2020)." },
        { type: "paragraph", text: "Institutions differ widely on whether and how generative AI tools may be used, and on how their output must be acknowledged. Check your institution's and your course's policy before using one; presenting text an AI tool produced as your own writing may breach it. APA and other style authorities publish guidance on citing such tools." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Thinking a citation alone makes copied wording acceptable.",
            "Changing a few words of a source and calling it a paraphrase.",
            "Citing a source once and then continuing to use it for several paragraphs without making clear that the ideas are still its.",
            "Citing a source you found quoted in another work as if you had read the original.",
            "Reusing your own earlier assignment or paper without permission or acknowledgement.",
            "Leaving citations until the end and losing track of where ideas came from.",
          ],
        },
      ],
    },
    {
      id: "limits",
      heading: "Rules differ: check your institution's policy",
      blocks: [
        { type: "paragraph", text: "This guide follows widely shared academic conventions. Each university defines academic misconduct in its own policy, decides how cases are handled and sets the penalties, and policies on reusing your own work and on AI tools vary especially widely. Your institution's policy is the one that applies to you." },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Keep your citations complete with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The citation generators format each reference in your style, and the Reference Checker reports citations in your text that have no matching entry, and entries that are never cited. Neither can tell whether you have credited every idea you used: only you know where your ideas came from." },
        { type: "links", items: [{ label: "Check citations against your reference list", href: "/tools/reference-checker" }, { label: "Find your citation style", href: "/tools/citation-style-finder" }, { label: "Keep notes on your sources", href: "/tools/literature-matrix" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020", "roig-2015"] }],
    },
  ],
  faq: [
    { question: "Is it plagiarism if I didn't mean to?", answer: "It can be. Plagiarism is defined by what appears in your work, not by intention, though institutions usually take intention into account when deciding what happens next." },
    { question: "Do I need to cite a source I paraphrased?", answer: "Yes. Paraphrasing changes the words, not the origin of the idea." },
    { question: "How many words can I copy without quotation marks?", answer: "There is no safe number. Any distinctive wording taken from a source needs quotation marks." },
    { question: "Can I reuse my own earlier work?", answer: "Only with permission from whoever will assess or publish the new work, and with a citation to the earlier one." },
    { question: "Does a low similarity score mean my work is fine?", answer: "Not necessarily. Software finds matching text; it can't detect an uncited idea, or text it has no copy of." },
  ],
  relatedToolIds: ["reference-checker", "citation-style-finder", "apa-citation-generator", "literature-matrix"],
  relatedGuideSlugs: ["how-to-paraphrase", "how-to-choose-a-citation-style", "how-to-manage-your-references", "reference-checker"],
};
