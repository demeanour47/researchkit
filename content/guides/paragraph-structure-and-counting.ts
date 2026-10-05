import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Paragraph structure in academic writing, and how the Paragraph Counter counts.
 * The advice on structure describes common practice taught by university writing
 * centres, not fixed rules; the guide never prescribes a paragraph length. The
 * counting examples are checked against the counter by the guide's tests.
 */
export const paragraphStructureAndCounting: Guide = {
  slug: "paragraph-structure-and-counting",
  title: "Paragraph Structure and Counting",
  description:
    "How academic paragraphs are built, from topic sentence to transition; what makes a paragraph unified and coherent; why length varies; and how the Paragraph Counter decides where one paragraph ends and the next begins.",
  summary:
    "An academic paragraph usually develops one main idea: it states the idea, supports it with evidence, explains what the evidence shows, and connects to what comes next. Its length depends on that idea, not on a rule. Counting paragraphs shows the shape of your text, which can prompt useful questions, but it isn't a measure of quality.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-a-paragraph",
      heading: "What a paragraph is",
      blocks: [
        { type: "paragraph", text: "A paragraph is a group of sentences that develops one point. On the page it is marked by a break, usually a new line with an indent or a blank line before it. The break tells the reader that one step in the discussion is complete and another is beginning." },
        { type: "paragraph", text: "In academic writing, paragraphs are the units of an argument. Each one carries part of the case the whole text is making, so a reader should be able to say what each paragraph contributes." },
      ],
    },
    {
      id: "academic-structure",
      heading: "Paragraph structure in academic writing",
      blocks: [
        { type: "paragraph", text: "Many university writing centres teach a similar pattern for the body paragraphs of an essay or report. It is a description of what readers find easy to follow, not a template every paragraph must fill." },
        { type: "list", ordered: true, items: ["A topic sentence that states the paragraph's main point.", "Evidence that supports the point: data, examples or sources.", "Analysis that explains what the evidence shows and why it matters.", "A closing or transition that links the point to the argument or to the next paragraph."] },
        { type: "paragraph", text: "Introductions, conclusions and short connecting paragraphs work differently, and some disciplines and genres, such as lab reports or reflective writing, have their own conventions. Follow your assignment's guidance where it differs." },
      ],
    },
    {
      id: "topic-sentence",
      heading: "The topic sentence",
      blocks: [
        { type: "paragraph", text: "The topic sentence tells the reader what the paragraph is about and what it will claim. It is usually the first sentence, though it can come after a sentence that links back to the previous paragraph." },
        { type: "paragraph", text: "A useful topic sentence makes a claim the paragraph then supports, rather than only naming a subject. Compare “This section discusses sample size” with “Small samples made the earlier studies unable to detect modest effects.”" },
      ],
    },
    {
      id: "supporting-evidence",
      heading: "Supporting evidence",
      blocks: [
        { type: "paragraph", text: "Evidence gives the reader a reason to accept the claim: findings, data, quotations, examples or cases, each cited. Choose evidence that bears directly on the paragraph's point, and introduce it so the reader knows where it comes from and why it is there." },
      ],
    },
    {
      id: "analysis",
      heading: "Analysis and explanation",
      blocks: [
        { type: "paragraph", text: "Evidence rarely speaks for itself. The analysis explains how the evidence supports the claim, what its limits are, and how it relates to other evidence. Paragraphs that list sources without explaining them are a common weakness in student writing; the analysis is where your own thinking shows." },
      ],
    },
    {
      id: "closing-and-transition",
      heading: "Closing and transition",
      blocks: [
        { type: "paragraph", text: "The end of a paragraph can draw out what the point means for the larger argument, or prepare for the next point. Not every paragraph needs a summary sentence; repeating the topic sentence adds length without adding meaning. What matters is that the reader can see how this paragraph connects to the next." },
      ],
    },
    {
      id: "how-paragraphs-are-counted",
      heading: "How paragraph count is determined",
      blocks: [
        { type: "paragraph", text: "A counter can't see the formatting of your document; it sees text. The Paragraph Counter decides where a paragraph ends by one of two rules, which you choose." },
        { type: "list", items: ["At a blank line (the default). A paragraph ends at an empty line. Lines separated by a single line break stay in the same paragraph, and several blank lines in a row count as one break.", "At every line break. Each line is a paragraph. Choose this for text pasted from a word processor, where each paragraph usually arrives on one line. The Word Counter and Text Statistics use this rule."] },
        { type: "paragraph", text: "Either way, a paragraph must contain at least one letter or number. Blank lines and decorative lines such as *** aren't counted, and words are counted exactly as the Word Counter counts them." },
        { type: "table", caption: "How the counter reads text, with paragraphs ending at a blank line", columns: ["Text", "Paragraphs"], rows: [["First paragraph. [blank line] Second paragraph.", "2"], ["First. [three blank lines] Second.", "2"], ["A first line [line break] continues on a second line.", "1"], ["Before the break. [blank line] *** [blank line] After the break.", "2"], ["[only spaces and blank lines]", "0"]] },
      ],
    },
    {
      id: "why-blank-lines-matter",
      heading: "Why blank lines matter",
      blocks: [
        { type: "paragraph", text: "In a word processor, a paragraph break is formatting: the program knows where each paragraph ends even when there is no empty line between them. Copied as plain text, those breaks become line breaks, and the spacing between paragraphs disappears." },
        { type: "paragraph", text: "That is why the counter offers two rules. If you type or paste text with blank lines between paragraphs, the blank-line rule keeps hand-wrapped lines together. If your text has line breaks but no blank lines, the counter tells you that it has read everything as one paragraph, and suggests the line-break rule." },
      ],
    },
    {
      id: "paragraph-length",
      heading: "Paragraph length",
      blocks: [
        { type: "paragraph", text: "There is no correct length for an academic paragraph. A paragraph is as long as its point needs: long enough to state, support and explain it, and no longer. Typical lengths differ between disciplines, genres and publications, and between a journal article, a thesis and a short assignment." },
        { type: "paragraph", text: "Length is still a useful signal. Comparing your paragraphs with one another, rather than with a fixed number, shows where a paragraph may be doing too much or too little. Your instructor or publisher may also give guidance for a particular piece of work; follow it where it applies." },
      ],
    },
    {
      id: "very-short-paragraphs",
      heading: "Very short paragraphs",
      blocks: [
        { type: "paragraph", text: "A short paragraph can be deliberate: a transition between sections, a short conclusion, or a single point given emphasis. It may also be a point that hasn't been developed, with a claim but no evidence or analysis, or a fragment that belongs with the paragraph before or after it." },
        { type: "list", items: ["Does it make a point of its own?", "Is the point supported and explained?", "Would it be clearer joined to a neighbouring paragraph?"] },
      ],
    },
    {
      id: "very-long-paragraphs",
      heading: "Very long paragraphs",
      blocks: [
        { type: "paragraph", text: "A long paragraph can be justified by a complex point that needs extended evidence or analysis. It may also combine several points, which makes each harder to follow, or include detail the argument doesn't need." },
        { type: "list", items: ["Can you state its main point in one sentence?", "Does it change direction partway through? That may be where a new paragraph should begin.", "Does every sentence serve the main point?"] },
      ],
    },
    {
      id: "coherence",
      heading: "Paragraph coherence",
      blocks: [
        { type: "paragraph", text: "A coherent paragraph is easy to follow from sentence to sentence. Each sentence connects to the one before, through a logical sequence, repeated key terms, pronouns that clearly refer back, and linking words that show the relationship, such as “however”, “as a result” or “for example”. Coherence is about the reader's path through the paragraph." },
      ],
    },
    {
      id: "unity",
      heading: "Paragraph unity",
      blocks: [
        { type: "paragraph", text: "A unified paragraph keeps to one main point. Sentences that drift to another topic, however interesting, weaken it. A quick test is to read the topic sentence and then each other sentence in turn, and ask whether each one supports or explains the topic sentence." },
      ],
    },
    {
      id: "transitions",
      heading: "Transitions between paragraphs",
      blocks: [
        { type: "paragraph", text: "Transitions show how paragraphs relate: whether the next one adds a point, contrasts with the last, gives an example or draws a consequence. A transition can be a phrase at the start of a paragraph or a sentence at the end of the one before. Without them, a text can read as a list of separate points rather than an argument." },
      ],
    },
    {
      id: "common-problems",
      heading: "Common paragraph problems",
      blocks: [
        { type: "table", caption: "Common problems and what to try", columns: ["Problem", "What to try"], rows: [["No clear main point", "Write the point in one sentence, and make it the topic sentence."], ["Several points in one paragraph", "Split it where the topic changes."], ["Evidence without explanation", "Add analysis: what the evidence shows and why it matters."], ["Explanation without evidence", "Support the claim with a cited source, data or example."], ["Abrupt jumps between paragraphs", "Add a transition that states the relationship."], ["A string of very short paragraphs", "Check whether they develop one point and could be joined."]] },
      ],
    },
    {
      id: "using-the-counter",
      heading: "How to use the Paragraph Counter",
      blocks: [
        { type: "list", ordered: true, items: ["Paste or type your text. Results appear as you type.", "Choose where a paragraph ends: at a blank line, or at every line break if your text came from a word processor.", "Read the counts: paragraphs, words, the average words per paragraph, and the shortest and longest paragraph.", "Open the list of paragraphs to see each one's words, identified by its first words, and look at any that stand out from the rest.", "Review those paragraphs with the questions in this guide. The counter points you to them; it doesn't judge them."] },
        { type: "links", items: [{ label: "Open the Paragraph Counter", href: "/tools/paragraph-counter" }, { label: "Count words, sentences and paragraphs", href: "/tools/word-counter" }, { label: "See sentence and paragraph statistics", href: "/tools/text-statistics" }] },
      ],
    },
    {
      id: "what-the-tool-cannot-determine",
      heading: "What the counter cannot determine",
      blocks: [
        { type: "list", items: ["Whether a paragraph has a clear point, enough evidence or a good transition.", "Where paragraphs end in your original document, if the breaks weren't copied with the text.", "Whether a short line is a heading, caption or list item rather than a paragraph.", "What your discipline, instructor or publisher expects."] },
      ],
    },
    {
      id: "count-is-not-quality",
      heading: "Why paragraph count is not a measure of quality",
      blocks: [
        { type: "paragraph", text: "Two texts with the same number of paragraphs of the same length can differ completely in quality. What makes a paragraph good, a clear point that is supported, explained and connected, can't be counted. The numbers are useful for finding paragraphs to reread, and for seeing the overall shape of a piece of writing; the judgement is yours." },
      ],
    },
  ],
  faq: [
    { question: "How many words should an academic paragraph have?", answer: "There is no correct number. A paragraph should be as long as its point needs, and typical lengths vary by discipline and genre. Follow any guidance your instructor or publisher gives." },
    { question: "Why does the counter say my text is one paragraph?", answer: "Your text probably has line breaks but no blank lines between paragraphs, as text pasted from a word processor often does. Choose “At every line break” to count each line as a paragraph." },
    { question: "Does the Paragraph Counter count headings?", answer: "It can't tell a heading from a short paragraph, so a heading on its own line or block is counted as a paragraph. Remove headings before pasting if you want to count body paragraphs only." },
    { question: "Is my text stored or sent anywhere?", answer: "No. The counter runs in your browser, and your text isn't sent to ResearchKit or anyone else." },
  ],
  relatedToolIds: ["paragraph-counter", "word-counter", "text-statistics"],
  relatedGuideSlugs: ["how-to-structure-an-academic-essay", "sentence-structure-and-counting", "readability-in-academic-writing", "how-to-meet-a-word-limit"],
};
