import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Sentence structure in academic writing, and how the Sentence Counter finds
 * sentences. Grammatical terms follow standard English grammar; advice on length
 * describes common practice, never a fixed rule. The counting examples are checked
 * against the counter by the guide's tests.
 */
export const sentenceStructureAndCounting: Guide = {
  slug: "sentence-structure-and-counting",
  title: "Sentence Structure and Counting",
  description:
    "How sentences are built from clauses, the four sentence types, why length and variety matter in academic writing, common problems such as fragments and run-ons, and how the Sentence Counter decides where a sentence ends.",
  summary:
    "A sentence expresses a complete thought, built from one or more clauses. Academic writing mixes simple, compound and complex sentences, and their length varies with what each one has to say. Counting sentences shows the shape of your writing and points to sentences worth rereading, but it doesn't measure quality.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-a-sentence",
      heading: "What a sentence is",
      blocks: [
        { type: "paragraph", text: "A sentence is a group of words that expresses a complete thought. In written English it begins with a capital letter and ends with a full stop, question mark or exclamation mark, and it contains at least one independent clause: a subject and a verb that can stand alone." },
        { type: "paragraph", text: "Academic writing uses mostly statements, which end with a full stop. Questions appear in research questions and rhetorical framing; exclamations are rare." },
      ],
    },
    {
      id: "sentence-boundaries",
      heading: "Sentence boundaries",
      blocks: [
        { type: "paragraph", text: "A reader finds the end of a sentence from its punctuation and the capital letter that usually follows. That sounds simple, but the full stop has other jobs: it marks abbreviations (Dr., e.g.), initials (J. Smith), decimals (3.14) and parts of web addresses (example.com). Telling these apart is the main problem any sentence counter has to solve." },
      ],
    },
    {
      id: "sentence-structure",
      heading: "Sentence structure",
      blocks: [
        { type: "paragraph", text: "Every sentence is built from clauses. A clause has a subject and a verb. The way clauses are combined gives the four basic sentence types: simple, compound, complex and compound-complex." },
      ],
    },
    {
      id: "clauses",
      heading: "Independent and dependent clauses",
      blocks: [
        { type: "list", items: ["An independent clause can stand alone as a sentence: “The sample was small.”", "A dependent clause can't stand alone. It begins with a word such as “although”, “because”, “when”, “which” or “that”, and depends on an independent clause to complete it: “although the sample was small”."] },
        { type: "paragraph", text: "Dependent clauses let a sentence show how ideas relate: cause, contrast, condition, time. That is why academic writing uses them so often." },
      ],
    },
    {
      id: "academic-sentences",
      heading: "Academic sentence construction",
      blocks: [
        { type: "paragraph", text: "Academic sentences often carry qualified claims, comparisons and evidence, so they tend to be longer and more complex than conversational ones. The aim is still clarity: the reader should be able to find the main claim of each sentence, usually in its main clause, and see how any additional clauses relate to it." },
        { type: "list", items: ["Put the main point in the main clause.", "Keep the subject and verb close together where you can.", "Use one sentence for one main claim, with its qualifications.", "Prefer specific verbs to long noun phrases: “the results show” rather than “the results are a demonstration of”."] },
      ],
    },
    {
      id: "simple-sentences",
      heading: "Simple sentences",
      blocks: [
        { type: "paragraph", text: "A simple sentence has one independent clause: “The sample was small.” It can still be long, with modifiers and phrases, but it makes one statement. Simple sentences are useful for stating a key finding or claim clearly." },
      ],
    },
    {
      id: "compound-sentences",
      heading: "Compound sentences",
      blocks: [
        { type: "paragraph", text: "A compound sentence joins two or more independent clauses, with a coordinating conjunction (and, but, or, so, yet, for, nor) after a comma, or with a semicolon: “The sample was small, but the effect was large.” Each clause could stand alone; joining them shows they are equally important and related." },
      ],
    },
    {
      id: "complex-sentences",
      heading: "Complex sentences",
      blocks: [
        { type: "paragraph", text: "A complex sentence has one independent clause and at least one dependent clause: “Although the sample was small, the effect was large.” The dependent clause sets up the relationship, here a contrast, and the independent clause carries the main point." },
      ],
    },
    {
      id: "compound-complex-sentences",
      heading: "Compound-complex sentences",
      blocks: [
        { type: "paragraph", text: "A compound-complex sentence has two or more independent clauses and at least one dependent clause: “Although the sample was small, the effect was large, and it held in a replication.” These sentences can express several connected ideas, but they are also where clarity is easiest to lose." },
      ],
    },
    {
      id: "sentence-length",
      heading: "Sentence length",
      blocks: [
        { type: "paragraph", text: "There is no correct length for an academic sentence. A sentence is as long as its idea needs, and typical lengths differ between disciplines, genres and publications. Very long sentences can be harder to follow, but there is no universal limit, and a long sentence that is well organized can be perfectly clear." },
        { type: "paragraph", text: "Length is most useful as a comparison within your own text: which sentences are much longer or shorter than the rest, and do they need to be?" },
      ],
    },
    {
      id: "sentence-variety",
      heading: "Sentence variety",
      blocks: [
        { type: "paragraph", text: "Varying sentence length and structure keeps writing readable. A short sentence after several long ones gives a point emphasis; a longer sentence can hold a careful qualification. A long run of sentences of the same length and shape can make even clear content tiring to read." },
      ],
    },
    {
      id: "overly-long-sentences",
      heading: "Overly long sentences",
      blocks: [
        { type: "paragraph", text: "A sentence becomes too long when the reader loses track of its main point, not at a particular word count. Signs to look for:" },
        { type: "list", items: ["The subject and its verb are far apart.", "It contains several “and”, “which” or “that” clauses in a chain.", "It makes more than one main claim.", "You have to read it twice to follow it."] },
        { type: "paragraph", text: "Splitting such a sentence, or moving qualifications into a separate sentence, often helps. Sometimes the length is justified; the counter only points you to it." },
      ],
    },
    {
      id: "fragments",
      heading: "Sentence fragments",
      blocks: [
        { type: "paragraph", text: "A fragment is punctuated as a sentence but lacks an independent clause: “Because the sample was small.” It usually happens when a dependent clause is cut off from the sentence it belongs to. Join it to that sentence: “Because the sample was small, the estimate was imprecise.”" },
        { type: "paragraph", text: "A sentence counter counts a fragment as a sentence, because it looks like one. Finding fragments needs grammatical judgement." },
      ],
    },
    {
      id: "run-on-sentences",
      heading: "Run-on sentences",
      blocks: [
        { type: "paragraph", text: "A run-on sentence joins independent clauses without the punctuation they need. A comma splice joins them with only a comma: “The sample was small, the effect was large.” Fix it with a full stop, a semicolon, or a comma and a conjunction: “The sample was small, but the effect was large.”" },
        { type: "paragraph", text: "A sentence counter counts a run-on as one sentence, because it has only one sentence ending." },
      ],
    },
    {
      id: "abbreviations",
      heading: "Abbreviations and sentence boundaries",
      blocks: [
        { type: "paragraph", text: "Academic writing is full of abbreviations that end with a full stop: Dr., Prof., e.g., i.e., Fig., No., pp. A full stop after them usually doesn't end the sentence. The Sentence Counter recognizes a short list of these, single initials as in J. Smith, and initialisms such as U.S. Labels such as Fig., No. and pp. are treated as abbreviations only when a number follows, so “No.” on its own can still end a sentence." },
        { type: "paragraph", text: "When an abbreviation genuinely ends a sentence, as in “…in the U.K.”, the counter can't tell and joins it to the next sentence. “Etc.” and “et al.” are treated as sentence endings when a capital letter follows, which is usually, but not always, right." },
      ],
    },
    {
      id: "numbers-and-decimals",
      heading: "Numbers and decimals",
      blocks: [
        { type: "paragraph", text: "A full stop inside a number, as in 3.14 or 2.5%, isn't a sentence ending, because it isn't followed by a space. A number at the end of a sentence (“The sample was 42.”) is followed by a space and a capital, so the sentence ends there. A number at the very start of a paragraph followed by a full stop, as in a numbered list, isn't treated as a sentence on its own." },
      ],
    },
    {
      id: "quotations",
      heading: "Quotations",
      blocks: [
        { type: "paragraph", text: "When a quotation ends a sentence, the closing quotation mark stays with the sentence: Smith stated, “The result was significant.” When a quoted question or exclamation sits inside a sentence, the words after it continue the sentence: “Why?” she asked. The counter keeps closing quotation marks and brackets with the sentence they close, and continues a sentence when the next word starts with a lowercase letter." },
      ],
    },
    {
      id: "punctuation-issues",
      heading: "Common punctuation issues",
      blocks: [
        { type: "table", caption: "Punctuation problems that affect sentence boundaries", columns: ["Problem", "Example", "Fix"], rows: [["Comma splice", "The sample was small, the effect was large.", "Use a full stop, a semicolon, or “, but”."], ["Missing space after a full stop", "The sample was small.The effect was large.", "Add a space; without it, the two sentences read as one."], ["Fragment", "Because the sample was small.", "Join it to the sentence it belongs to."], ["Double punctuation", "Was it significant?.", "Use one end mark."]] },
      ],
    },
    {
      id: "how-the-counter-works",
      heading: "How the Sentence Counter works",
      blocks: [
        { type: "paragraph", text: "The counter looks for end punctuation (. ! ? … or a combination such as ?!) followed by a space or the end of a paragraph, then checks each candidate against a few rules: it continues the sentence if the next word starts with a lowercase letter, or if the full stop follows a known abbreviation, an initial or an initialism. Sentences never run across a paragraph break, and a single line break inside a paragraph is read as a space." },
        { type: "table", caption: "How the counter reads text", columns: ["Text", "Sentences"], rows: [["Hello world. This is another sentence.", "2"], ["Really?!", "1"], ["Dr. Smith conducted the study.", "1"], ["The result was 3.14.", "1"], ["See https://example.com for details.", "1"], ["The result was unclear... however, the pattern remained.", "1"], ["Smith stated, “The result was significant.”", "1"], ["According to J. Smith, the result was significant.", "1"]] },
        { type: "paragraph", text: "Words in each sentence are counted exactly as the Word Counter counts them. The Word Counter and Text Statistics use a simpler sentence rule, in which every line ends a sentence and abbreviations end sentences too, so their sentence counts can differ." },
        { type: "links", items: [{ label: "Open the Sentence Counter", href: "/tools/sentence-counter" }, { label: "Count paragraphs", href: "/tools/paragraph-counter" }, { label: "See text statistics", href: "/tools/text-statistics" }] },
      ],
    },
    {
      id: "what-it-cannot-determine",
      heading: "What the counter cannot determine",
      blocks: [
        { type: "list", items: ["Whether a sentence is grammatical: fragments and run-ons are counted as sentences.", "Whether a sentence is clear, or too long for its content.", "Where a sentence ends after an abbreviation that genuinely ends it, or where a new sentence starts with a lowercase letter.", "Sentence endings in scripts with their own end marks, such as the Devanagari danda (।)."] },
      ],
    },
    {
      id: "count-is-not-quality",
      heading: "Why sentence count is not a writing-quality score",
      blocks: [
        { type: "paragraph", text: "The same number of sentences, with the same average length, can be clear or confusing. Clarity depends on how each sentence is built and how sentences connect, which a count can't capture. Use the numbers to find sentences to reread, such as the longest ones, and to see whether your writing varies its rhythm; the judgement is yours." },
      ],
    },
  ],
  faq: [
    { question: "How many words should an academic sentence have?", answer: "There is no correct number. Typical lengths vary by discipline and genre, and a long sentence can be clear if it is well organized. Reread sentences that are much longer than the rest of your text." },
    { question: "Why does the Sentence Counter give a different count from the Word Counter?", answer: "The Sentence Counter handles abbreviations, initials and wrapped lines, which the Word Counter's simpler rule doesn't, so their counts can differ." },
    { question: "Does it check grammar?", answer: "No. It finds sentence boundaries from punctuation. Fragments and run-on sentences are counted, not corrected." },
    { question: "Is my text stored or sent anywhere?", answer: "No. The counter runs in your browser, and your text isn't sent to ResearchKit or anyone else." },
  ],
  relatedToolIds: ["sentence-counter", "paragraph-counter", "word-counter", "text-statistics"],
};
