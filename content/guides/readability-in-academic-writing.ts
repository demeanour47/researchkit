import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Readability formulas, what they measure and what they don't, for academic writers.
 * Every formula is quoted from its original or an authoritative reprint (see the
 * references section), and is the formula the Readability Checker uses. The worked
 * examples are checked against the checker by the guide's tests.
 */
export const readabilityInAcademicWriting: Guide = {
  slug: "readability-in-academic-writing",
  title: "Readability in Academic Writing",
  description:
    "What readability formulas measure, how Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG and the Automated Readability Index are calculated, why they disagree, and why a readability score is not a measure of writing quality.",
  summary:
    "Readability formulas estimate how hard a text is to read from two things they can count: how long its sentences are and how long its words are. They are useful for comparing drafts and spotting dense passages, but they can't judge meaning, accuracy or argument, and a difficult score is often right for specialised academic writing.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-readability-means",
      heading: "What readability means",
      blocks: [
        { type: "paragraph", text: "Readability is how easily readers can read and understand a text. It depends on the text, on the reader's knowledge and on their purpose, so no number captures it completely. Readability formulas approximate one part of it: the difficulty that comes from long sentences and long words." },
        { type: "paragraph", text: "The formulas were developed between the 1940s and 1970s by comparing those counts with how well readers understood test passages, then expressing the relationship as an equation. They predict difficulty for typical readers; they don't measure it for yours." },
      ],
    },
    {
      id: "readability-vs-quality",
      heading: "Readability versus writing quality",
      blocks: [
        { type: "paragraph", text: "A readability score is not a quality score. Two texts with identical scores can be clear and confusing; a scrambled text can score as easy; a precise, well-argued paper can score as very difficult. The formulas count sentence and word length and nothing else: not meaning, accuracy, organization, evidence or style." },
      ],
    },
    {
      id: "why-it-matters",
      heading: "Why readability matters in research communication",
      blocks: [
        { type: "paragraph", text: "Researchers write for many audiences: examiners, specialist peers, reviewers from neighbouring fields, participants reading information sheets, and the public reading summaries. Text written for one audience can be hard going for another. A readability check is a quick way to see whether a lay summary, participant information sheet or abstract is pitched far above its readers, and to compare drafts as you revise." },
      ],
    },
    {
      id: "flesch-reading-ease",
      heading: "Flesch Reading Ease",
      blocks: [
        { type: "paragraph", text: "Rudolf Flesch published the Reading Ease formula in 1948. Higher scores mean easier text, and most prose falls between 0 and 100, though very hard text can score below zero." },
        { type: "table", caption: "Flesch Reading Ease", columns: ["Part", "Detail"], rows: [["Formula", "206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)"], ["Original form", "206.835 − 0.846 wl − 1.015 sl, where wl is syllables per 100 words and sl is words per sentence"], ["Calibration", "100-word samples of the McCall-Crabbs graded reading lessons"]] },
        { type: "table", caption: "Flesch's descriptions of Reading Ease scores (The Art of Readable Writing, 1949)", columns: ["Score", "Description"], rows: [["0–29", "Very difficult"], ["30–49", "Difficult"], ["50–59", "Fairly difficult"], ["60–69", "Standard"], ["70–79", "Fairly easy"], ["80–89", "Easy"], ["90–100", "Very easy"]] },
      ],
    },
    {
      id: "flesch-kincaid",
      heading: "Flesch-Kincaid Grade Level",
      blocks: [
        { type: "paragraph", text: "In 1975, Kincaid and colleagues recalculated Flesch's formula for the U.S. Navy so that it gives a school grade directly. It uses the same two counts as Reading Ease, weighted differently." },
        { type: "table", caption: "Flesch-Kincaid Grade Level", columns: ["Part", "Detail"], rows: [["Formula", "0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59"], ["Result", "An approximate U.S. school grade; 12 is the final year of high school"], ["Calibration", "531 Navy enlisted personnel reading passages from technical training manuals"]] },
      ],
    },
    {
      id: "gunning-fog",
      heading: "Gunning Fog Index",
      blocks: [
        { type: "paragraph", text: "Robert Gunning's Fog Index, published in The Technique of Clear Writing (1952), adds average sentence length to the percentage of “hard” words and multiplies by 0.4." },
        { type: "table", caption: "Gunning Fog Index", columns: ["Part", "Detail"], rows: [["Formula", "0.4 × (words ÷ sentences + 100 × complex words ÷ words)"], ["Complex word", "A word of more than two syllables"], ["Result", "Approximate years of schooling"]] },
        { type: "paragraph", text: "Gunning's instructions are reported to set aside some long words, such as proper names, but accounts of the exact rules differ. The Readability Checker counts every word of three or more syllables, as DuBay (2004) describes the formula, which can make its Fog score slightly higher." },
      ],
    },
    {
      id: "smog",
      heading: "SMOG",
      blocks: [
        { type: "paragraph", text: "G. Harry McLaughlin's SMOG grade (1969) counts polysyllables, words of three or more syllables, in 30 sentences. It predicts the grade a reader needs to understand a text fully, a stricter standard than the other formulas, so its grades tend to be higher." },
        { type: "table", caption: "SMOG grade", columns: ["Part", "Detail"], rows: [["Formula", "1.0430 × √(polysyllables × 30 ÷ sentences) + 3.1291"], ["Quick version", "Count polysyllables in 30 sentences, take the square root of the nearest perfect square, and add 3"], ["Sample", "30 sentences: 10 from the beginning, 10 from the middle and 10 from the end"]] },
        { type: "paragraph", text: "McLaughlin described SMOG results for texts of fewer than 30 sentences as statistically invalid, because the formula was normed on 30-sentence samples. The Readability Checker doesn't show a SMOG grade until a text has 30 sentences, and uses all of a longer text, scaled to 30 sentences, as his generalized formula does." },
      ],
    },
    {
      id: "ari",
      heading: "Automated Readability Index",
      blocks: [
        { type: "paragraph", text: "The Automated Readability Index (Smith and Senter, 1967) was designed for counters attached to a typewriter, so it measures word length in characters rather than syllables." },
        { type: "table", caption: "Automated Readability Index", columns: ["Part", "Detail"], rows: [["Formula", "4.71 × (characters ÷ words) + 0.5 × (words ÷ sentences) − 21.43"], ["Characters", "Every keystroke except spaces: letters, numbers, symbols and punctuation"], ["Result", "An approximate U.S. school grade"]] },
        { type: "paragraph", text: "Kincaid and colleagues (1975) also published a recalculated version for Navy use, with different constants. The Readability Checker uses the original formula above, which is the one usually meant by ARI." },
      ],
    },
    {
      id: "syllable-counting",
      heading: "Syllable counting",
      blocks: [
        { type: "paragraph", text: "Three of the five formulas depend on syllables, and a computer can't hear them. The Readability Checker uses a spelling rule: each group of vowels is one syllable, corrected for common patterns such as a silent final e (since, while), sounded endings (table, wanted, changes), and vowel pairs usually said as two syllables (variable, biology)." },
        { type: "table", caption: "How the checker counts syllables in common academic words", columns: ["Word", "Syllables"], rows: [["research", "2"], ["analysis", "4"], ["statistical", "4"], ["significant", "4"], ["methodology", "5"], ["university", "5"], ["well-being", "3"]] },
        { type: "paragraph", text: "The rule is right for most common words but not all: it undercounts “create” and “area”, for example, and counts numbers, abbreviations such as 2020 or U.S., and web addresses as one syllable each. Small errors like these shift scores only slightly over a long text, but they are one reason to treat scores as estimates." },
      ],
    },
    {
      id: "sentence-length",
      heading: "Sentence length",
      blocks: [
        { type: "paragraph", text: "Every formula here uses average sentence length, and it often moves scores more than any other count. Long sentences make readers hold more in mind before they reach the point. In academic writing, sentence length often comes from qualifications, lists and embedded clauses; splitting a sentence that carries several ideas usually helps both the reader and the score." },
        { type: "paragraph", text: "How sentences are counted matters too. The Readability Checker uses the Sentence Counter's rules, so abbreviations such as e.g., decimals such as 3.14 and web addresses don't end sentences, which would otherwise make sentences look shorter and text look easier than it is." },
        { type: "links", items: [{ label: "Sentence structure and counting", href: "/learn/sentence-structure-and-counting" }] },
      ],
    },
    {
      id: "word-complexity",
      heading: "Word complexity",
      blocks: [
        { type: "paragraph", text: "The formulas treat long words as hard words: by syllables (Flesch, Flesch-Kincaid), by three or more syllables (Fog, SMOG) or by characters (ARI). That is a reasonable average assumption, but long words aren't always hard. “Methodology” is five syllables and familiar to every researcher; a short word can be obscure. Technical vocabulary that your readers know makes a text score as harder than it is for them." },
      ],
    },
    {
      id: "short-text",
      heading: "Short-text limitations",
      blocks: [
        { type: "paragraph", text: "Formulas built on samples of 100 words or 30 sentences become unstable on very short texts: one long sentence or one technical term changes the score a lot. The Readability Checker calculates scores for any text with words, but flags texts under 100 words as too short to interpret reliably, and gives no SMOG grade under 30 sentences." },
        { type: "table", caption: "Two 21-word texts, as the Readability Checker scores them (both flagged as short text)", columns: ["Text", "Sentences", "Flesch Reading Ease", "Flesch-Kincaid Grade"], rows: [["The study surveyed 120 nurses about their workload. Most reported long shifts. Many said that staffing shortages made patient care harder.", "3", "62.8", "6.2"], ["This cross-sectional investigation examined the association between organisational staffing characteristics and self-reported occupational burnout among registered nurses employed in metropolitan hospitals.", "1", "−68.3", "28"]] },
        { type: "paragraph", text: "The two texts have the same number of words. The second packs them into one sentence of long words, so its Reading Ease falls below zero and its grade estimate is far beyond any school grade: a sign that the formula has left the range it was calibrated for, not a literal grade." },
      ],
    },
    {
      id: "formula-limitations",
      heading: "Formula limitations",
      blocks: [
        { type: "list", items: ["They measure surface features only, so they can't tell whether a text makes sense: the same words in a random order score the same.", "They were calibrated on particular readers and texts, such as schoolchildren's reading lessons or Navy training manuals, decades ago.", "Grade levels are U.S. school grades, which don't map neatly onto other education systems.", "They depend on how words, sentences and syllables are counted, so different tools can give different scores for the same text.", "They say nothing about layout, headings, examples, figures or other features that help readers."] },
      ],
    },
    {
      id: "academic-writing",
      heading: "Academic writing and readability",
      blocks: [
        { type: "paragraph", text: "Academic writing usually scores as difficult. Its subjects need precise, often technical, terms, and its claims need qualifications. That isn't a fault to be fixed by chasing a score: replacing a precise term with a vague short one can make a text less accurate and no easier to understand." },
        { type: "paragraph", text: "Readability checks are most useful where the audience is wider than your specialist peers, such as abstracts, lay summaries, participant materials and policy briefs, and for finding the densest passages in your own drafts." },
      ],
    },
    {
      id: "disciplinary-differences",
      heading: "Disciplinary differences",
      blocks: [
        { type: "paragraph", text: "Fields differ in vocabulary and sentence style. Disciplines with long technical terms, such as medicine, chemistry or law, tend to score as harder than fields that use more everyday words, even when the writing in both is clear to its readers. Compare scores with texts from your own field and for the same audience, not with a general target." },
      ],
    },
    {
      id: "english-only",
      heading: "English-language limitations",
      blocks: [
        { type: "paragraph", text: "All five formulas were developed for English, and the syllable rule follows English spelling. Applied to other languages, or to text mixing English with other languages, the scores aren't meaningful. Some languages have their own readability formulas, which the Readability Checker doesn't implement." },
      ],
    },
    {
      id: "conflicting-scores",
      heading: "How to interpret conflicting scores",
      blocks: [
        { type: "paragraph", text: "The formulas often disagree by a grade or more, because each weights sentence length and word length differently, counts word length differently, and was calibrated on different readers. SMOG, which predicts full understanding, usually gives the highest grade." },
        { type: "list", items: ["Look at the direction the measures agree on, not any one score.", "Look at the counts behind the scores: average sentence length and syllables per word show what is driving the difficulty.", "Compare versions of your own text with the same tool, rather than comparing scores across tools."] },
      ],
    },
    {
      id: "using-the-checker",
      heading: "How to use the Readability Checker",
      blocks: [
        { type: "list", ordered: true, items: ["Paste at least 100 words, ideally a whole section; for a SMOG grade, at least 30 sentences.", "Choose where a paragraph ends. If headings are on their own lines without full stops, choose “At every line break” or add blank lines, so headings aren't joined into sentences.", "Read the five measures, then the counts behind them: words, sentences, average sentence length, syllables per word and words of three or more syllables.", "Open “How the scores are calculated” to see each formula, what it means and its limits.", "Revise where it helps your readers, then check again to compare."] },
        { type: "links", items: [{ label: "Open the Readability Checker", href: "/tools/readability-checker" }, { label: "Count sentences", href: "/tools/sentence-counter" }, { label: "Count paragraphs", href: "/tools/paragraph-counter" }] },
      ],
    },
    {
      id: "misconceptions",
      heading: "Common misconceptions",
      blocks: [
        { type: "table", caption: "Misconceptions about readability scores", columns: ["Misconception", "In fact"], rows: [["A readability score measures how good the writing is.", "It measures sentence and word length only."], ["Every text should reach a target score.", "The right difficulty depends on the readers and purpose."], ["The grade level is the reader's grade.", "It is an estimate from formulas calibrated on particular readers."], ["Different tools should give the same score.", "Tools count syllables and sentences differently, so scores vary."], ["Shorter words always make text clearer.", "Replacing precise terms can make text vaguer without making it easier."]] },
      ],
    },
    {
      id: "high-score-not-better",
      heading: "Why a high readability score is not automatically better",
      blocks: [
        { type: "paragraph", text: "A text can score as very easy by using short sentences and short words while being vague, repetitive or disjointed. For specialist readers, simplifying technical language can remove precision they need. Easy to read, by the formulas' measure, isn't the same as easy to understand or worth reading." },
      ],
    },
    {
      id: "low-score-not-bad",
      heading: "Why a low readability score is not automatically bad",
      blocks: [
        { type: "paragraph", text: "A low Reading Ease score, or a high grade, often reflects necessary technical vocabulary and careful qualification. For readers who share that vocabulary, the text may be perfectly clear. A low score is a prompt to ask whether the text suits its audience, and whether any sentences carry more than they need to, not a verdict." },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [
        { type: "paragraph", text: "Each formula was checked against its original publication or an authoritative reprint. Flesch's 1948 paper is reprinted in DuBay's collection of the classic readability studies; Gunning's book is described by DuBay (2004)." },
        { type: "references", ids: ["flesch-1948", "kincaid-1975", "mclaughlin-1969", "gunning-1952", "dubay-2004", "dubay-2007"] },
      ],
    },
  ],
  faq: [
    { question: "Which readability score should I use?", answer: "None alone. Look at where the five measures agree, and at the sentence length and syllables per word behind them. Flesch Reading Ease and Flesch-Kincaid are the most widely used." },
    { question: "What readability score should academic writing have?", answer: "There is no target. Academic writing for specialists often scores as difficult, and that can be appropriate. Aim for text that suits its readers, and use scores to compare drafts or check material for wider audiences." },
    { question: "Why doesn't the checker show a SMOG grade?", answer: "SMOG was normed on 30-sentence samples, and its author described results for fewer sentences as statistically invalid, so the checker waits until your text has 30 sentences." },
    { question: "Why do other tools give different scores?", answer: "Tools count syllables, words and sentences differently; small differences in counting change the scores. Compare drafts with the same tool." },
    { question: "Is my text sent anywhere?", answer: "No. The checker runs in your browser, and your text isn't sent to ResearchKit or anyone else." },
  ],
  relatedToolIds: ["readability-checker", "sentence-counter", "paragraph-counter", "word-counter", "text-statistics"],
  relatedGuideSlugs: ["sentence-structure-and-counting", "paragraph-structure-and-counting", "how-to-structure-an-academic-essay"],
};
