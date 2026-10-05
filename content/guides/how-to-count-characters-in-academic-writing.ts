import type { Guide } from "@/domains/publishing/guide";

export const howToCountCharactersInAcademicWriting: Guide = {
  slug: "how-to-count-characters-in-academic-writing",
  title: "How to count characters in academic writing",
  description:
    "What a character count is, how it differs from a word count, and why abstracts, titles, research proposals, journal submission systems and online forms often set limits in characters rather than words, including guidance for Nepali (Devanagari) and other multilingual text.",
  summary:
    "A character count is every letter, digit, punctuation mark and space a reader sees, usually reported with and without the spaces. Many academic systems set their limits in characters rather than words, so counting before you submit avoids losing text at the last moment, whatever language you write in.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "definition",
      heading: "What is a character count?",
      blocks: [
        {
          type: "paragraph",
          text: "A character count is the number of individual characters in a piece of text: every letter, digit, punctuation mark and space. It is usually reported two ways at once, “with spaces” and “without spaces”, because different limits mean different things by “character”.",
        },
        {
          type: "paragraph",
          text: "A character is counted as a reader sees it, not as a computer happens to store it. An accented letter such as “é”, a Devanagari syllable built from a consonant and a vowel sign, and an emoji with a skin tone or a flag each count as one character, however many underlying code points they are technically built from. A tool that instead counts raw code points, or raw bytes, will overcount exactly this kind of text.",
        },
      ],
    },
    {
      id: "with-spaces",
      heading: "Characters with spaces",
      blocks: [
        {
          type: "paragraph",
          text: "“Characters with spaces” counts every visible character, including the single spaces and tabs between words, but not the line breaks between paragraphs. This is the figure most systems mean when they set a plain “character limit”: it reflects roughly how much room the text takes up.",
        },
        {
          type: "paragraph",
          text: "If you are given a character limit with no further detail, treat it as counting spaces unless told otherwise, and check the exact wording: “up to 250 characters” and “up to 250 characters, excluding spaces” are different limits.",
        },
      ],
    },
    {
      id: "without-spaces",
      heading: "Characters without spaces",
      blocks: [
        {
          type: "paragraph",
          text: "“Characters without spaces” counts only the non-blank characters: letters, digits and punctuation, leaving out every space and tab. It measures the text itself, independent of how many words it happens to be broken into.",
        },
        {
          type: "paragraph",
          text: "Some systems, particularly older database fields, set their limit this way because it is what actually gets stored. A limit given without spaces is more forgiving of the same wording than the same number given with spaces, so check which one you were set before assuming you are close to it.",
        },
      ],
    },
    {
      id: "characters-vs-words",
      heading: "Character count vs. word count",
      blocks: [
        {
          type: "paragraph",
          text: "A character count and a word count measure different things, and they don't convert into one another at a fixed rate. “Assessment” and “a” are each one word, but ten characters and one character. A sentence built from a few long, technical words can reach a character limit well before it reaches the equivalent word limit, and the reverse is just as true of short, simple words.",
        },
        {
          type: "paragraph",
          text: "This matters most when moving text between two systems that measure differently: a title that comfortably fits a 15-word limit can still be rejected by an unrelated 100-character limit if its words are long, and a title that fits a character limit can still be rejected by a word limit if it's written as a long run of short words.",
        },
      ],
    },
    {
      id: "academic-limits",
      heading: "Why character limits matter in academic research",
      blocks: [
        {
          type: "paragraph",
          text: "Character limits show up throughout academic work wherever text has to fit a fixed space: a database field, a printed line, a form's input box, or a summary meant to be read at a glance. Writing to the limit from the start avoids the last-minute work of cutting a title or abstract that is already finished.",
        },
        {
          type: "list",
          items: [
            "Titles are frequently limited in characters, since they are shown in fixed-width places: a journal's table of contents, a database record, a browser tab.",
            "Abstracts are sometimes limited in characters instead of, or as well as, words, particularly in conference and grant systems with a single text field.",
            "Keywords and short summaries, such as a plain-language summary, often carry the tightest limits of all, because they are shown alongside many other entries.",
            "Author biographies, funding statements and cover letters submitted through an online system frequently have their own, separate character limits.",
          ],
        },
      ],
    },
    {
      id: "abstracts",
      heading: "Abstracts",
      blocks: [
        {
          type: "paragraph",
          text: "APA Style's Publication Manual (American Psychological Association, 2020) limits abstracts to 250 words unless an instructor or publisher asks otherwise; journals set their own limits, and some submission systems state the limit in characters instead. Either way, an abstract is written to be read on its own, so cutting it to fit a limit needs care: remove what is least essential to understanding the study, not simply the last sentence.",
        },
        {
          type: "paragraph",
          text: "Because an abstract is usually the most tightly edited part of a submission, it is worth counting both characters and words as you draft it, so you know which limit, if either, you are closer to.",
        },
      ],
    },
    {
      id: "proposals",
      heading: "Research proposals",
      blocks: [
        {
          type: "paragraph",
          text: "Research proposals submitted to a university, funder or ethics committee are often built from several short fields, each with its own limit: a project summary, a statement of significance, a description of methods. These limits are frequently given in characters, since the online forms that collect them are built around fixed-width database fields.",
        },
        {
          type: "paragraph",
          text: "Draft each field separately against its own limit rather than writing the whole proposal first and then trying to fit it in afterwards; the two produce noticeably different, and usually differently sized, text.",
        },
      ],
    },
    {
      id: "journal-submissions",
      heading: "Journal submissions",
      blocks: [
        {
          type: "paragraph",
          text: "Online journal and conference submission systems commonly enforce a character limit on the title, the abstract or a cover message, separately from any word limit stated in the author guidelines. The limit exists because the system stores and displays that text in a fixed-width field, not because of any rule about writing itself.",
        },
        {
          type: "paragraph",
          text: "Where a journal states a limit in one unit and its submission system enforces a different one, follow whichever is stricter, and don't assume the two match: a title within a 20-word guideline can still be too long for a 120-character field.",
        },
      ],
    },
    {
      id: "online-forms",
      heading: "Online academic forms",
      blocks: [
        {
          type: "paragraph",
          text: "Scholarship applications, ethics applications and similar online forms frequently enforce a hard character limit directly in the browser: the field simply stops accepting more text once the limit is reached, sometimes with no visible warning. Text typed past the limit can be silently lost rather than rejected with an error.",
        },
        {
          type: "paragraph",
          text: "Writing and counting your answer elsewhere first, then pasting it in, avoids losing a sentence you were still writing when the field quietly stopped accepting it.",
        },
      ],
    },
    {
      id: "multilingual",
      heading: "Multilingual writing",
      blocks: [
        {
          type: "paragraph",
          text: "A character limit written with one language in mind doesn't automatically transfer to another. Scripts differ in how much they say per character: English needs a space-separated string of letters for most words, while other scripts pack more meaning into fewer, denser characters, or conversely need more marks to represent the same sound.",
        },
        {
          type: "paragraph",
          text: "If you are translating or adapting text that already meets a character limit, recount the new version rather than assuming the limit still holds; the two versions of the same sentence are very unlikely to be the same length.",
        },
      ],
    },
    {
      id: "devanagari",
      heading: "Nepali and Devanagari text",
      blocks: [
        {
          type: "paragraph",
          text: "Devanagari, the script used to write Nepali, builds many of its characters from a base consonant combined with a dependent vowel sign, and sometimes several consonants joined into one conjunct. A reader sees each of these combinations as one character, and a character counter that follows the same rule (segmenting by grapheme, not by the underlying Unicode code points) counts them the same way.",
        },
        {
          type: "paragraph",
          text: "Nepali academic writing typically expresses an idea in fewer, denser characters than the equivalent English sentence, so an English-sized character limit can feel short once the same content is written in Devanagari. Counting the Devanagari text itself, rather than estimating from its English translation, gives the figure that actually matters for the limit.",
        },
        {
          type: "paragraph",
          text: "Devanagari's own sentence-ending mark is the danda, “।”, not a Latin full stop. A sentence count built only from “.”, “?”, “!” and “…” will not recognise the danda as ending a sentence, so it will undercount the number of sentences in text that uses it. This affects sentence counts, not character counts: the character count of Nepali text, with or without spaces, is unaffected by which punctuation mark ends a sentence.",
        },
      ],
    },
    {
      id: "whitespace-punctuation",
      heading: "Whitespace and punctuation",
      blocks: [
        {
          type: "paragraph",
          text: "Spaces and tabs count as characters “with spaces” and are left out “without spaces”; line breaks, which separate paragraphs rather than sit inside one, are not counted as characters either way. Two consecutive spaces both count, so a document with inconsistent spacing between sentences will have a slightly different character count from the same text with single spaces throughout, even though it reads the same.",
        },
        {
          type: "paragraph",
          text: "Punctuation marks, whether a comma, a set of quotation marks or an em dash, each count as one character. Smart, curly quotation marks (“ ” and ‘ ’) and straight quotation marks (\" and ') are both single characters; switching between them, which word processors often do automatically, doesn't change a character count either way.",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Assuming “characters” and “characters with spaces” mean the same thing as a system's actual limit, without checking which one it states.",
            "Estimating a character count from a word count using a fixed average, rather than counting the actual text, especially once it has been translated or heavily edited.",
            "Leaving counting until the text is finished, rather than checking against the limit while drafting, which makes cutting the final version far more disruptive.",
            "Counting code points or raw computer characters for scripts such as Devanagari or for emoji, which overcounts compared with what a reader, and most systems' own limits, actually mean by “one character”.",
            "Assuming a limit written with English text in mind transfers unchanged to a translation in another script.",
          ],
        },
      ],
    },
    {
      id: "checklist",
      heading: "Practical checklist",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Find the exact wording of the limit: characters or words, and with or without spaces.",
            "Count the text you will actually submit, in the language and script you will submit it in, not an estimate or an earlier draft.",
            "If the limit is in characters, check the count with spaces and without, since a system may enforce either.",
            "For Nepali or other Devanagari text, count the Devanagari itself rather than its English translation.",
            "For text with mixed scripts, recount after any translation or heavy edit, rather than assuming the count still holds.",
            "For an online form with a hard limit, draft and count elsewhere first, then paste in the finished text.",
            "Where a title, abstract or field has both a word limit and a character limit, check both before you submit.",
          ],
        },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020"] }],
    },
    {
      id: "next-steps",
      heading: "Put it into practice",
      blocks: [
        {
          type: "paragraph",
          text: "Count your own text against a limit rather than estimating, and use whichever of these fits what you're writing.",
        },
        {
          type: "links",
          items: [
            { label: "Count characters, with and without spaces", href: "/tools/character-counter" },
            { label: "Count words, sentences and paragraphs", href: "/tools/word-counter" },
            { label: "See sentence and paragraph structure in detail", href: "/tools/text-statistics" },
            { label: "Estimate reading and speaking time", href: "/tools/reading-time" },
            { label: "Check and compare your research title", href: "/tools/research-title-builder" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      question: "Does a character limit usually include spaces?",
      answer: "Usually, but not always. A plain “character limit” most often includes spaces, since that reflects the space the text takes up, but some systems state it excluding spaces. Check the exact wording, and count both if you're not sure.",
    },
    {
      question: "Is a character limit stricter than a word limit?",
      answer: "Neither is stricter in general; it depends on your wording. Text built from a few long words reaches a character limit sooner than the equivalent word limit would suggest, while text built from many short words does the opposite.",
    },
    {
      question: "Does an emoji count as more than one character?",
      answer: "As a reader sees it, no: an emoji, including ones built from several joined symbols such as a flag or a family, counts as one character. Some simpler tools that count raw computer code points will overcount it.",
    },
    {
      question: "Why does my Nepali text feel like it uses up a character limit faster than English?",
      answer: "It often does, because Devanagari typically expresses the same idea in fewer, denser characters than English, so a limit sized for English can feel short once the same content is written in Nepali. Count the Devanagari text itself rather than estimating from an English version.",
    },
    {
      question: "Does line spacing or font size change a character count?",
      answer: "No. A character count is based purely on the text itself: the letters, digits, punctuation and spaces it contains. Formatting such as font, size or line spacing changes how the text looks on a page, not how many characters it is made of.",
    },
    {
      question: "Do headings, footnotes and references count towards a character limit?",
      answer: "It depends on what you were asked to submit into that specific field. A limit set for an abstract usually covers only the abstract text; check your instructions rather than assuming.",
    },
  ],
  relatedToolIds: ["character-counter", "word-counter", "reading-time-calculator", "text-statistics", "research-title-builder"],
  relatedGuideSlugs: ["how-to-meet-a-word-limit", "how-to-write-an-abstract", "how-to-write-a-good-research-title"],
};
