import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Structuring an academic essay around an argument. The paragraph model is the one the
 * paragraph structure guide teaches; the worked example plans a hypothetical essay
 * without inventing findings.
 */
export const howToStructureAnAcademicEssay: Guide = {
  slug: "how-to-structure-an-academic-essay",
  title: "How to structure an academic essay",
  description:
    "How to build an academic essay around an argument: analysing the question, writing a thesis statement, planning the body, writing introductions and conclusions, common structures for different essay types, and a worked plan.",
  summary:
    "An academic essay is an argument: it answers a question with a clear position, the thesis, and supports it with evidence and reasoning. The introduction sets out the question and your answer; each body paragraph makes one point that advances the argument; the conclusion draws the argument together. Plan the structure from the question before you write.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "an-argument",
      heading: "An essay is an argument",
      blocks: [
        { type: "paragraph", text: "Assessors look for an answer to the question, supported by evidence and reasoning, not a collection of everything you know about the topic. Every part of the essay should serve that answer. Academic writing is shaped by its audience and purpose, and the organisation of a text is one of the main ways a writer guides readers through an argument (Swales & Feak, 2012)." },
      ],
    },
    {
      id: "analyse-the-question",
      heading: "Start by analysing the question",
      blocks: [
        { type: "paragraph", text: "The question tells you what kind of essay to write. Identify its topic, its focus and, above all, its instruction word:" },
        {
          type: "table",
          caption: "Common instruction words",
          columns: ["Instruction", "What it asks you to do"],
          rows: [
            ["Discuss", "Examine an issue from more than one side and reach a reasoned view"],
            ["Evaluate or assess", "Judge the value, strength or success of something, using evidence and criteria"],
            ["Critically analyse", "Break something into its parts and examine how they work and how well they are supported"],
            ["Compare and contrast", "Set out the similarities and the differences, and say what they show"],
            ["To what extent", "Give a qualified judgement: how far a claim holds, and where it doesn't"],
            ["Explain", "Show how or why something happens"],
          ],
        },
        { type: "paragraph", text: "Your instructor's or institution's guidance on these words comes first if it differs; the table describes how they are commonly understood." },
      ],
    },
    {
      id: "thesis",
      heading: "The thesis statement",
      blocks: [
        { type: "paragraph", text: "The thesis is your answer to the question, in one or two sentences, usually at the end of the introduction. A strong thesis takes a position that someone could reasonably dispute, and previews the main reasons for it." },
        {
          type: "table",
          caption: "Weak and strong thesis statements",
          columns: ["Thesis", "Why"],
          rows: [
            ["This essay will discuss community forestry in Nepal.", "Weak: names a topic, takes no position"],
            ["Community forestry has advantages and disadvantages.", "Weak: true of almost anything, and answers nothing"],
            ["Community forestry has improved forest cover and some livelihoods in Nepal, but its benefits have been uneven, because decision-making in user groups often reflects existing inequalities.", "Strong: a clear, arguable position, with the reason the essay will develop"],
          ],
        },
        { type: "paragraph", text: "The strong thesis in the table is a hypothetical example of the form; an essay would need evidence to support each part of it." },
      ],
    },
    {
      id: "structure",
      heading: "The parts of an essay",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Introduction: the context and why the question matters, the focus or definitions the essay uses, the thesis, and a brief map of how the argument will proceed.",
            "Body: a sequence of paragraphs, each making one point that advances the thesis. Group them into sections if the essay is long, and order them so each builds on the last.",
            "Counter-argument: the strongest objections or alternative views, and why your position still holds, or how it must be qualified.",
            "Conclusion: what the argument has shown, the answer to the question restated in the light of it, and its implications or limits. No new evidence.",
          ],
        },
        { type: "paragraph", text: "Each body paragraph follows the pattern the paragraph structure guide describes: a topic sentence stating its point, evidence, analysis explaining what the evidence shows, and a closing link to the argument." },
      ],
    },
    {
      id: "patterns",
      heading: "Structures for different essays",
      blocks: [
        {
          type: "table",
          caption: "Common ways to organise the body",
          columns: ["Essay", "Organisation"],
          rows: [
            ["Argumentative", "Reasons for your position in order of strength, then counter-arguments and your response"],
            ["Discussion", "The main perspectives in turn, each evaluated, leading to your judgement"],
            ["Compare and contrast", "Point by point (each criterion for both subjects), or block by block (one subject, then the other); point by point usually makes comparison clearer"],
            ["Cause and effect", "Causes, then effects, or a chain in which each effect becomes a cause"],
            ["Problem and solution", "The problem and its causes, possible solutions, then an evaluation of which is best"],
          ],
        },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example: planning an essay",
      blocks: [
        { type: "paragraph", text: "A hypothetical question and plan, showing structure rather than content. The plan names the evidence each section needs, not findings: those would come from the student's reading." },
        { type: "paragraph", text: "Question: “To what extent has community forestry improved rural livelihoods in Nepal?” (2,000 words)" },
        {
          type: "table",
          caption: "A plan for a 2,000-word essay",
          columns: ["Section", "Purpose", "About"],
          rows: [
            ["Introduction", "Context of community forestry; define “livelihoods”; thesis; map", "200 words"],
            ["Body 1", "Evidence of improved access to forest products and income", "450 words"],
            ["Body 2", "Evidence that benefits have been unevenly shared within communities", "450 words"],
            ["Body 3", "Why: how decisions are made in user groups", "400 words"],
            ["Counter-argument", "Views that point to strong gains overall, and how far they hold", "250 words"],
            ["Conclusion", "A qualified answer to “to what extent”, and its implications", "250 words"],
          ],
        },
        { type: "paragraph", text: "The word allocations are one reasonable way to divide 2,000 words, not a rule. “To what extent” asks for a qualified judgement, so the plan builds in both the gains and their limits." },
      ],
    },
    {
      id: "introductions-and-conclusions",
      heading: "Introductions and conclusions",
      blocks: [
        {
          type: "list",
          items: [
            "Open with the context of the question, not a sweeping statement about all of history or society.",
            "Define key terms if the question depends on them, and say which definition you use.",
            "State the thesis clearly; don't save your answer for the end.",
            "In the conclusion, say what the argument has shown and answer the question directly. Don't simply repeat the introduction, and don't introduce new evidence.",
            "Write or revise the introduction last, so it describes the essay you actually wrote.",
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
            "Describing the topic instead of answering the question.",
            "A thesis that takes no position, or one the body doesn't support.",
            "Paragraphs that each summarise a source, rather than each making a point.",
            "Ignoring counter-arguments, or mentioning them without responding.",
            "A conclusion that introduces new material or only repeats the introduction.",
            "Spending most of the word count on background.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Check your structure with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Paragraph Counter shows how your essay is divided, with each paragraph's length and opening words, which makes it easy to see whether paragraphs are balanced and each has a topic sentence. The Word Counter checks your length, and the Readability Checker flags dense sentences." },
        { type: "links", items: [{ label: "See your paragraphs", href: "/tools/paragraph-counter" }, { label: "Count words", href: "/tools/word-counter" }, { label: "Check readability", href: "/tools/readability-checker" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["swales-feak-2012"] }],
    },
  ],
  faq: [
    { question: "How many paragraphs should an essay have?", answer: "As many as the argument needs. Each paragraph should make one point; the number follows from how many points you make and the word limit." },
    { question: "Can I use “I” in an academic essay?", answer: "It depends on your discipline and your instructor. Many fields now accept “I” for describing what you did or argue; check your guidance." },
    { question: "Should the thesis come at the start or the end?", answer: "In most academic essays, at the end of the introduction, so the reader knows your answer from the start." },
    { question: "How long should the introduction be?", answer: "Long enough to set up the question, any definitions and your thesis. In a short essay, often a single paragraph." },
    { question: "Do essays need headings?", answer: "Short essays usually don't; longer ones and reports often do. Follow your assignment's instructions." },
  ],
  relatedToolIds: ["paragraph-counter", "word-counter", "readability-checker", "sentence-counter"],
  relatedGuideSlugs: ["paragraph-structure-and-counting", "sentence-structure-and-counting", "readability-in-academic-writing", "how-to-paraphrase", "how-to-meet-a-word-limit"],
};
