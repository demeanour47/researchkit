import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Meeting a word limit: what counts, how counters count, and how to cut words without
 * losing substance. The word counts in the examples are the Word Counter's, and the
 * guide's tests recount them.
 */
export const howToMeetAWordLimit: Guide = {
  slug: "how-to-meet-a-word-limit",
  title: "How to meet a word limit",
  description:
    "What may count towards a word limit, how word counters count, and practical ways to cut wordy phrases, repetition and padding, or to develop a draft that falls short, with before-and-after examples.",
  summary:
    "A word limit is part of the task: it tests whether you can make your argument in the space given. Find out exactly what counts towards it, because institutions differ, then cut words that carry no meaning before you cut ideas. If you are under the limit, develop your analysis rather than padding. Count with the same rules your institution uses.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "why-limits",
      heading: "Why word limits matter",
      blocks: [
        { type: "paragraph", text: "A word limit isn't an obstacle to good work; it is part of the assignment. Choosing what to include, and saying it economically, is a skill assessors are looking for. Writing far over the limit can mean penalties or unread pages; writing far under it usually means the argument is underdeveloped." },
        { type: "paragraph", text: "Some institutions allow a margin above the limit and others penalise any excess. That is a local rule, so check your assignment brief or handbook rather than assuming." },
      ],
    },
    {
      id: "what-counts",
      heading: "What counts towards the limit",
      blocks: [
        { type: "paragraph", text: "Institutions and even individual assignments differ on what is included. Before you start cutting, find out whether these count:" },
        {
          type: "list",
          items: [
            "the title, headings and subheadings;",
            "in-text citations;",
            "quotations;",
            "tables, figures and their captions;",
            "footnotes and endnotes;",
            "the reference list or bibliography;",
            "appendices;",
            "the abstract, or a contents page.",
          ],
        },
        { type: "paragraph", text: "If the brief doesn't say, ask. Don't move essential argument into footnotes, tables or appendices just to avoid the count; assessors notice, and some count them anyway." },
      ],
    },
    {
      id: "how-counters-count",
      heading: "How word counters count",
      blocks: [
        { type: "paragraph", text: "Word processors and online counters can give slightly different totals, because they treat hyphens, numbers and symbols differently. ResearchKit's Word Counter counts any run of characters between spaces that contains at least one letter or number, in any script:" },
        {
          type: "table",
          caption: "How the Word Counter counts",
          columns: ["Text", "Words"],
          rows: [
            ["State-of-the-art", "1"],
            ["don't", "1"],
            ["2020", "1"],
            ["Kathmandu–Pokhara", "1"],
            ["e.g.", "1"],
            ["— (a dash on its own)", "0"],
          ],
        },
        { type: "paragraph", text: "If your institution names a particular program's count as the official one, use that program for the final check." },
      ],
    },
    {
      id: "cut-phrases",
      heading: "Cutting words that carry no meaning",
      blocks: [
        { type: "paragraph", text: "Most drafts can lose a tenth of their words without losing a single idea. Start with phrases that say little. The citations in these examples are invented." },
        {
          type: "table",
          caption: "Wordy and concise",
          columns: ["Wordy", "Concise", "Words"],
          rows: [
            ["In order to understand the problem, we interviewed teachers.", "To understand the problem, we interviewed teachers.", "9 → 7"],
            ["Due to the fact that the sample was small, the results should be treated with caution.", "Because the sample was small, the results should be treated with caution.", "16 → 12"],
            ["It is important to note that most respondents were women.", "Most respondents were women.", "10 → 4"],
            ["The survey was completed by a total of 180 households.", "The survey was completed by 180 households.", "10 → 7"],
            ["The researchers carried out an investigation into the causes of absenteeism.", "The researchers investigated the causes of absenteeism.", "11 → 7"],
            ["Previous studies have shown that there is a relationship between income and education (Shrestha, 2020).", "Income is related to education (Shrestha, 2020).", "15 → 7"],
          ],
        },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example: tightening a paragraph",
      blocks: [
        { type: "paragraph", text: "A hypothetical methods paragraph, before and after. The cuts remove padding and repetition; no information is lost." },
        { type: "table", caption: "A paragraph before and after", columns: ["Version", "Text", "Words"], rows: [["Before", "In this section of the study, it is important to note that a total of 180 households in the village of Ghandruk took part in the survey that was carried out in the year 2024. Due to the fact that some households did not answer all of the questions, the analysis that is presented below is based on the 164 households that gave complete answers to the questions.", "68"], ["After", "In 2024, 180 households in Ghandruk took part in the survey. Because some did not answer every question, the analysis below is based on the 164 households that gave complete answers.", "31"]] },
      ],
    },
    {
      id: "cut-content",
      heading: "When cutting phrases isn't enough",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Cut repetition: the same point made in the introduction, the body and the conclusion, or summaries of what you have just said.",
            "Cut background the reader doesn't need, such as general facts about your topic that your field takes for granted.",
            "Merge or cut quotations. A paraphrase is usually shorter, and shows your understanding.",
            "Cut points that don't serve your argument, however interesting. If a paragraph could be removed without weakening the argument, remove it.",
            "Use a table for detail that is clearer as a table, if your institution doesn't count tables or the table is genuinely shorter.",
            "Only then, narrow the scope, and say in the introduction what you have left out and why.",
          ],
        },
      ],
    },
    {
      id: "under-limit",
      heading: "If you are well under the limit",
      blocks: [
        { type: "paragraph", text: "Falling well short usually means something is missing, not that you were efficient. Before adding words, check whether you have explained your reasoning, considered other views or counter-evidence, used evidence for each claim, evaluated your sources rather than summarising them, and addressed every part of the question. Padding with repetition or long quotations makes a short draft weaker, not longer." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Assuming what counts towards the limit instead of checking.",
            "Cutting evidence and analysis instead of padding.",
            "Moving argument into footnotes or appendices to escape the count.",
            "Cutting so hard that sentences lose the words that make them clear.",
            "Padding a short draft with repetition, quotations or wordy phrasing.",
            "Counting with a different tool from the one your institution uses, and finding the totals differ at the last minute.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Check your length with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Word Counter counts as you type, in your browser. The Paragraph Counter and Sentence Counter show where the words are going, and the Readability Checker points to long sentences worth tightening." },
        { type: "links", items: [{ label: "Count words", href: "/tools/word-counter" }, { label: "Count paragraphs", href: "/tools/paragraph-counter" }, { label: "Find long sentences", href: "/tools/sentence-counter" }] },
      ],
    },
  ],
  faq: [
    { question: "Do in-text citations count towards the word limit?", answer: "It depends on your institution and assignment. Some include them, others don't; check your brief or ask." },
    { question: "Does the reference list count?", answer: "That is also set locally. Check your brief or handbook." },
    { question: "Can I go over the limit by 10%?", answer: "Only if your institution says so. Some allow a margin; others penalise any excess." },
    { question: "Why does my word processor give a different count?", answer: "Counters treat hyphens, numbers and symbols differently. Use the count your institution specifies for the final check." },
    { question: "Is it better to be under or over?", answer: "Neither is good. Aim for close to the limit, with every paragraph earning its place." },
  ],
  relatedToolIds: ["word-counter", "paragraph-counter", "sentence-counter", "readability-checker"],
  relatedGuideSlugs: ["how-to-count-characters-in-academic-writing", "how-to-write-an-abstract", "how-to-structure-an-academic-essay", "paragraph-structure-and-counting"],
};
