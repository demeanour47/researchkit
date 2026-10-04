import type { Guide } from "../../src/domains/publishing/guide";

/**
 * How the Reference Checker works and how to read what it reports. Messages quoted
 * here are the checker's own wording; the guide's tests check that each one is
 * produced by the example beside it. The rules each style's checks follow are
 * taught in that style's guide; this guide links to them rather than restating them.
 */
export const referenceCheckerGuide: Guide = {
  slug: "reference-checker",
  title: "How the Reference Checker Works",
  description:
    "What ResearchKit's Reference Checker checks in APA 7, MLA 9, Chicago, IEEE and Harvard, how it matches citations to a reference list, what it can't check, and how to read and fix what it reports.",
  summary:
    "The Reference Checker reads a pasted reference list in the citation style you choose, reports problems with each entry's structure, finds likely duplicates and ordering problems, and, if you paste your text too, matches citations to entries. It diagnoses; it never rewrites your references, and it can't prove a reference is correct.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-it-does",
      heading: "What a reference checker does",
      blocks: [
        { type: "paragraph", text: "A reference checker reads a reference list as text and compares each entry with the patterns of a citation style: where the authors go, how the date is written, how titles, journals, pages, DOIs and URLs appear. It looks across the whole list for entries that are out of order, numbered wrongly or listed twice. Given the text you wrote, it can also check that each citation leads to an entry and each entry is cited." },
        { type: "paragraph", text: "ResearchKit's Reference Checker does this for six citation systems, each with its own checks. It explains every finding: what it found, why it matters in that style, the text it is about, and what to do." },
        { type: "links", items: [{ label: "Open the Reference Checker", href: "/tools/reference-checker" }] },
      ],
    },
    {
      id: "what-it-does-not-do",
      heading: "What it does not do",
      blocks: [
        { type: "list", items: ["It doesn't correct, reformat, reorder, merge or delete anything. The generators format references; the checker only diagnoses.", "It doesn't look anything up. It never contacts Crossref, a library catalogue or a publisher, so it can't tell whether a DOI exists, a URL works or a date is right.", "It doesn't read your document. It works only on the text you paste, so it can't see footnote placement, page layout or citations elsewhere.", "It doesn't know your institution's rules. It checks each style as ResearchKit formats it."] },
        { type: "paragraph", text: "ResearchKit checks structured patterns and does not guarantee that every citation conforms to every institutional requirement." },
      ],
    },
    {
      id: "why-style-matters",
      heading: "Why the citation style matters",
      blocks: [
        { type: "paragraph", text: "A correct entry in one style is wrong in another. APA puts the year in brackets after the authors, followed by a full stop; ResearchKit's Harvard profile puts it in brackets with no full stop; Chicago author-date puts it between full stops; MLA, Chicago bibliographies and IEEE put it near the end. IEEE numbers its entries, and the others never do." },
        { type: "paragraph", text: "So the checker asks for the style first, and every check follows it. It never assumes APA. Choose the style your instructor, department or publisher requires; if you aren't sure, the Citation Style Finder can help." },
        { type: "table", caption: "The same book's opening in each style", columns: ["Style", "Entry begins"], rows: [["APA 7", "Cottrell, S. (2019). The study skills handbook"], ["Harvard (ResearchKit profile)", "Cottrell, S. (2019) The study skills handbook"], ["Chicago author-date", "Cottrell, Stella. 2019. The Study Skills Handbook"], ["MLA 9 and Chicago bibliography", "Cottrell, Stella. The Study Skills Handbook"], ["IEEE", "[1] S. Cottrell, The Study Skills Handbook"]] },
        { type: "links", items: [{ label: "Citation Style Finder", href: "/tools/citation-style-finder" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
    {
      id: "apa",
      heading: "Checking APA 7",
      blocks: [
        { type: "paragraph", text: "The APA checker finds the date in brackets after the authors and reads the authors, title, journal or publisher, and DOI or URL around it. It reports missing journal volumes, pages and publishers, invalid DOIs and URLs, entries out of alphabetical order, and works by the same author in the same year that need letters such as 2024a." },
        { type: "paragraph", text: "In citations it checks APA's punctuation: a comma between author and year, “&” inside brackets and “and” in running text, et al. from three authors, p. or pp. before page numbers, and n.d. for a missing date." },
        { type: "links", items: [{ label: "APA 7 Citations and References", href: "/learn/apa-7-citations-and-references" }] },
      ],
    },
    {
      id: "mla",
      heading: "Checking MLA 9",
      blocks: [
        { type: "paragraph", text: "The MLA checker reads the author, then the title, then the container and its details. It checks that only the first author is inverted, that three or more authors become the first author and et al., that article titles are in quotation marks, that volume, issue and pages are labelled vol., no. and pp., and that dates are written day, month, year with long months abbreviated. Three hyphens in place of a repeated author are read as the author above." },
        { type: "paragraph", text: "MLA citations give the author and page with no year: (LeCun et al. 437). The checker matches them to entries by author, or by title when there is no author, and reports a comma before the page or a p. it doesn't use." },
        { type: "links", items: [{ label: "MLA 9 Citations and Works Cited", href: "/learn/mla-9-citations-and-works-cited" }] },
      ],
    },
    {
      id: "chicago-author-date",
      heading: "Checking Chicago author-date",
      blocks: [
        { type: "paragraph", text: "The Chicago author-date checker finds the year between full stops after the author, or n.d., and checks that only the first author is inverted, that article titles are in double quotation marks and that journal numbers aren't in APA's arrangement. In citations such as (Yu 2020, 45) it checks that no comma separates author and year, that pages have no p., and that n.d. has a comma before it." },
        { type: "links", items: [{ label: "Chicago Author-Date Citations", href: "/learn/chicago-author-date-citations" }] },
      ],
    },
    {
      id: "chicago-notes-bibliography",
      heading: "Checking Chicago notes and bibliography",
      blocks: [
        { type: "paragraph", text: "Notes and bibliography is checked as its own system, never as author-date. The bibliography is checked like the other lists: the first author inverted, the year with the publication details, and alphabetical order. Paste your notes in the notes box, one per line, and the checker matches each full or shortened note to a bibliography entry by author, using the short title when one author has several works." },
        { type: "list", items: ["A shortened note is a later citation of a source, not a second entry, so it is never reported as a duplicate.", "A note pasted into the bibliography is recognised and left out of the list checks.", "Ibid. is reported as information: it points to the previous note, which depends on note order the checker can't see.", "A bibliography entry no note matches is reported as information, because a bibliography may list works you consulted but didn't cite."] },
        { type: "paragraph", text: "The checker reads notes as text. It can't check where notes sit in your document or how they are numbered." },
        { type: "links", items: [{ label: "Chicago Notes and Bibliography", href: "/learn/chicago-notes-bibliography" }] },
      ],
    },
    {
      id: "ieee",
      heading: "Checking IEEE",
      blocks: [
        { type: "paragraph", text: "In IEEE the number is the reference's identity, so the checker reads it first. Each entry must begin with its number in square brackets. The checker reports missing, malformed and repeated numbers, and gaps in the sequence. It also checks that initials come before family names, that journal details are labelled, and that a DOI is written after doi:." },
        { type: "paragraph", text: "In your text it reads citations such as [1], [3, p. 24], [1, 3] and [4]–[7], and checks every number against the list. It also checks whether numbers are first cited in order, but only within the text you paste, so the result is a prompt to check the whole document." },
        { type: "links", items: [{ label: "IEEE Citations and References", href: "/learn/ieee-citations-and-references" }] },
      ],
    },
    {
      id: "harvard",
      heading: "Checking Harvard",
      blocks: [
        { type: "paragraph", text: "Harvard validation follows the ResearchKit Harvard profile and may differ from institutional Harvard requirements. The profile is based on Cite Them Right, 13th edition, and is the same one the Harvard generator formats." },
        { type: "paragraph", text: "The checker reports what departs from the profile, such as a full stop after the year, “&” between authors, a URL without an access date, or n.d. in place of “no date”. Where universities' Harvard guides commonly differ from the profile, such as the comma between author and year, spaces between initials, or a place of publication, it explains the difference as information rather than calling it a mistake." },
        { type: "links", items: [{ label: "Harvard Citations and References", href: "/learn/harvard-citations-and-references" }] },
      ],
    },
    {
      id: "citation-consistency",
      heading: "Matching citations to the list",
      blocks: [
        { type: "paragraph", text: "Paste the text where you cite your sources, and the checker reads the citations with the selected style's grammar and matches each one to an entry: by author and year in APA, Harvard and Chicago author-date, by author in MLA, by number in IEEE, and by author and short title in Chicago notes." },
        { type: "table", caption: "What matching reports", columns: ["Finding", "Meaning"], rows: [["Citation appears without a matching reference list entry.", "No entry has this author and year. The entry may be missing, or the spelling or year may differ."], ["No entry by Smith from 2024 was found.", "There is an entry by Smith, but from another year, or with a different letter."], ["Reference may be uncited.", "No citation in the text you pasted matches this entry."], ["Could not confidently identify citation.", "Bracketed text with a year doesn't read as a citation in this style, so it wasn't matched."]] },
        { type: "paragraph", text: "Matching is heuristic. It reads citations by their patterns, so a citation written unusually may be missed, and the text you paste may not be your whole document. Treat unmatched and uncited items as prompts to check, not as proof of an error." },
      ],
    },
    {
      id: "duplicates",
      heading: "Duplicate references",
      blocks: [
        { type: "paragraph", text: "The checker reports “Possible duplicate reference.” when two entries share a DOI, the same title and year, or the same URL, whatever the style. A duplicate usually comes from adding the same source twice, perhaps from two databases. The checker never merges or deletes entries: compare the two, and keep both only if they are different works, such as two editions." },
      ],
    },
    {
      id: "ordering",
      heading: "Order and numbering",
      blocks: [
        { type: "paragraph", text: "Order follows the style. APA, MLA, Chicago and Harvard lists are alphabetical by the first author's family name, or by title when there is no author; the checker reports an entry that comes before the one above it. Where a style puts one author's works in date order, it checks that too. IEEE lists are numerical, in the order sources are first cited, so the checker checks numbering instead." },
        { type: "paragraph", text: "Where the checker can't read an entry's author or title, it leaves that entry out of the order check rather than guessing." },
      ],
    },
    {
      id: "style-mismatch",
      heading: "Style mismatches",
      blocks: [
        { type: "paragraph", text: "An entry or citation in another style's form is a common mistake when a writer switches styles or copies references from different places. The checker reports “Reference may be formatted using a different citation style.” only when an entry clearly has another style's shape, such as APA's (2019). in a Chicago list, and reports numeric citations such as [1] in an author-date text, or author-date citations in an IEEE text." },
        { type: "paragraph", text: "It doesn't try to classify every entry. An entry that doesn't fit the selected style but has no clear shape of another is reported as a structure problem instead." },
      ],
    },
    {
      id: "heuristic-limitations",
      heading: "The limits of pattern checking",
      blocks: [
        { type: "list", items: ["Pasted text loses italics, so the checker can't check which titles are italicized.", "Capitalization needs judgment about proper nouns, so titles aren't checked for headline or sentence case.", "Chapters, edited books, reports, conference papers and other source types are read only as far as their shared structure allows.", "A name, abbreviation or title with unusual punctuation can make an entry harder to read; the checker then reports its confidence as partial.", "Matching citations works on the text you paste; it can't see the rest of your document."] },
      ],
    },
    {
      id: "manual-verification",
      heading: "Why you still need to check references yourself",
      blocks: [
        { type: "paragraph", text: "A reference can match every pattern and still be wrong: a misspelled name, the wrong year, a DOI for a different article. Only the source itself can confirm the details. Compare each reference with the title page, journal record or web page it describes, and follow your institution's instructions where they differ from the style." },
      ],
    },
    {
      id: "severity",
      heading: "How to read severity",
      blocks: [
        { type: "table", caption: "Severity levels", columns: ["Severity", "Meaning", "Example"], rows: [["Error", "Something that stops the reference working: a reader can't find the source, or a citation can't lead to an entry.", "DOI syntax appears invalid."], ["Warning", "Something that is probably wrong in the selected style and needs checking.", "Entry appears out of alphabetical order."], ["Information", "Something to know: an omission that may be correct, a common institutional variant, or a limit of the check.", "Citation matching is heuristic."]] },
        { type: "paragraph", text: "Severity is always written as a word, not shown by colour alone. No finding doesn't mean a reference is correct; it means no implemented check found a problem." },
      ],
    },
    {
      id: "fixing-issues",
      heading: "How to fix what the checker finds",
      blocks: [
        { type: "list", ordered: true, items: ["Start with errors, then warnings. Information needs action only if it applies to you.", "Read the explanation: it says why the issue matters in the selected style.", "Use the evidence to find the exact text the issue is about.", "Check the detail against the source before changing anything.", "Correct your own document. To rebuild an entry from its details, use the generator for your style, then paste the list in again to check it."] },
        { type: "links", items: [{ label: "APA 7 Citation & Reference Builder", href: "/tools/apa-citation-generator" }, { label: "MLA Citation Generator", href: "/tools/mla-citation-generator" }, { label: "Chicago Author-Date Citation Generator", href: "/tools/chicago-author-date-citation-generator" }, { label: "Chicago Notes and Bibliography Citation Generator", href: "/tools/chicago-notes-bibliography-citation-generator" }, { label: "IEEE Citation Generator", href: "/tools/ieee-citation-generator" }, { label: "Harvard Citation Generator", href: "/tools/harvard-citation-generator" }] },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common reference-list mistakes",
      blocks: [
        { type: "table", caption: "Mistakes the checker reports", columns: ["Mistake", "Example of what the checker says"], rows: [["A DOI copied with a typo or cut short", "DOI syntax appears invalid."], ["The same source listed twice", "Possible duplicate reference."], ["An entry added at the end instead of in order", "Entry appears out of alphabetical order."], ["A citation for a source left out of the list", "Citation appears without a matching reference list entry."], ["A source kept in the list after its citation was deleted", "Reference may be uncited."], ["An IEEE list renumbered by hand", "Reference number [1] is used more than once."], ["Entries copied from a document in another style", "Reference may be formatted using a different citation style."], ["A URL without the date it was accessed, in Harvard", "The URL has no access date."]] },
      ],
    },
  ],
  faq: [
    { question: "Which citation styles can it check?", answer: "APA 7, MLA 9, Chicago author-date, Chicago notes and bibliography, IEEE, and Harvard as ResearchKit's defined profile, based on Cite Them Right." },
    { question: "Does it correct my references?", answer: "No. It explains what it finds and what to do; you make the changes. Use the generator for your style to rebuild an entry from its details." },
    { question: "Does it check that my DOIs and URLs work?", answer: "No. It checks that they are written correctly, but it never contacts any website, so it can't confirm they lead anywhere." },
    { question: "Why does it say a reference may be uncited when I cited it?", answer: "Matching is heuristic. The citation may be outside the text you pasted, or written so that its author or year differs from the entry. Check both." },
    { question: "Is my reference list sent anywhere?", answer: "No. Checking happens in your browser, and nothing you paste is sent, stored or placed in the URL." },
  ],
  relatedToolIds: ["reference-checker", "citation-style-finder"],
};
