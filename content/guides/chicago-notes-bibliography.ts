import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Rules are taken from the Chicago Manual of Style, 18th edition (2024), through its
 * own published notes-and-bibliography sample citations and Q&A
 * (chicagomanualofstyle.org). Examples credited to the Chicago Manual of Style
 * reproduce its samples; the others are synthetic teaching examples. The guide's tests
 * check that every example the generator can produce matches its output exactly;
 * examples it doesn't produce are labeled.
 */
export const chicagoNotesBibliography: Guide = {
  slug: "chicago-notes-bibliography",
  title: "Chicago Notes and Bibliography",
  description:
    "Learn Chicago's notes-and-bibliography system: full notes, shortened notes and bibliography entries for books, journal articles and web pages, and how it differs from author-date.",
  summary:
    "In Chicago's notes-and-bibliography system, a numbered note gives the source's details the first time you cite it, a shortened note points back to it every time after that, and a bibliography lists every source in alphabetical order at the end.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-notes-bibliography",
      heading: "What Chicago notes and bibliography is",
      blocks: [
        { type: "paragraph", text: "The Chicago Manual of Style describes two complete systems of citation. In notes and bibliography, a superscript number in your text refers to a note, which identifies the source and the passage. A bibliography at the end of the work lists the sources in alphabetical order. The current edition, the 18th, was published in 2024." },
        { type: "styles", styles: ["chicago"] },
      ],
    },
    {
      id: "when-to-use",
      heading: "When to use it",
      blocks: [
        { type: "paragraph", text: "Notes and bibliography is the traditional system in history, literature, the arts and other humanities, where sources include archival documents, manuscripts and older works that author-date handles awkwardly, and where notes give room for comment. Follow your instructor's, department's or publisher's instructions first; Turabian, a guide for students, follows the same system." },
        { type: "links", items: [{ label: "Not sure which style you need? Try the Citation Style Finder", href: "/tools/citation-style-finder" }] },
      ],
    },
    {
      id: "how-notes-work",
      heading: "How notes work, compared with in-text citations",
      blocks: [
        { type: "paragraph", text: "Author-date puts a short citation in the sentence itself: (Yu 2020, 45). Notes and bibliography moves the citation out of the sentence into a numbered note, so the text reads without interruption, and the note can give fuller details and even comment on the source." },
        { type: "list", items: ["Place the note number at the end of the sentence or clause it supports, usually after the punctuation.", "Number notes consecutively through the work; your word processor does this for you.", "A note can cite more than one source, separated by semicolons, and can add a sentence of comment."] },
      ],
    },
    {
      id: "footnotes",
      heading: "Footnotes",
      blocks: [
        { type: "paragraph", text: "Footnotes appear at the foot of the page that refers to them, so readers can check a source without turning pages. Word processors place, number and renumber them automatically as you write." },
      ],
    },
    {
      id: "endnotes",
      heading: "Endnotes",
      blocks: [
        { type: "paragraph", text: "Endnotes gather the same notes at the end of a chapter or of the whole work. They are written exactly as footnotes are; only their position differs. Endnotes keep pages uncluttered when notes are many or long, at the cost of readers turning to the back. Use whichever your instructor or publisher asks for." },
      ],
    },
    {
      id: "full-notes",
      heading: "Full notes",
      blocks: [
        { type: "paragraph", text: "The first time you cite a source, the note gives its full details. Unlike a bibliography entry, a note gives names in normal order, separates its parts with commas, puts a book's publisher and year in parentheses, and ends with the page you are citing." },
        { type: "table", caption: "Full notes (Chicago Manual of Style samples)", columns: ["Source", "Full note"], rows: [["Book", "1. Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45."], ["Journal article", "1. Hyeyoung Kwon, “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life,” American Journal of Sociology 127, no. 6 (2022): 1842–43, https://doi.org/10.1086/720277."]] },
        { type: "paragraph", text: "Tables on this page can't show italics: book and journal titles are italicized in real notes and entries." },
      ],
    },
    {
      id: "shortened-notes",
      heading: "Shortened notes",
      blocks: [
        { type: "paragraph", text: "Every later citation of the same source uses a shortened note: the author's surname, a short form of the title, and the page. It is enough to lead readers back to the full note or the bibliography." },
        { type: "table", caption: "Shortened notes (Chicago Manual of Style samples)", columns: ["Source", "Shortened note"], rows: [["Book", "3. Yu, Interior Chinatown, 48."], ["Book, two authors", "4. Binder and Kidder, Channels of Student Activism, 125."], ["Journal article", "5. Kwon, “Inclusion Work,” 1851."], ["Web page by an organization", "4. Google, “Privacy Policy.”"]] },
      ],
    },
    {
      id: "bibliography",
      heading: "Bibliography",
      blocks: [
        { type: "paragraph", text: "The bibliography lists every source at the end of the work. Its entries invert the first author's name, separate their parts with full stops, put a book's publisher and year at the end, and give an article's full page range." },
        { type: "table", caption: "One source as a note and as an entry (Chicago Manual of Style samples)", columns: ["Form", "Example"], rows: [["Full note", "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45."], ["Bibliography entry", "Yu, Charles. Interior Chinatown. Pantheon Books, 2020."]] },
      ],
    },
    {
      id: "books",
      heading: "Books",
      blocks: [
        { type: "paragraph", text: "A book's note gives the author, the italic title, any edition after the first, then the publisher and year in parentheses, then the page. The 18th edition no longer requires a place of publication. Add a DOI or URL at the end for a book read online." },
        { type: "table", caption: "Books", columns: ["Form", "Example"], rows: [["Full note (CMOS sample)", "Brooke Borel, The Chicago Guide to Fact-Checking, 2nd ed. (University of Chicago Press, 2023), 92."], ["Bibliography (CMOS sample)", "Borel, Brooke. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press, 2023."], ["Shortened note, as the generator derives it", "Borel, Chicago Guide to Fact-Checking, 104–5."], ["Shortened note, as CMOS shortens it", "Borel, Fact-Checking, 104–5."]] },
        { type: "paragraph", text: "The CMOS Borel samples end with the database the book was read in, EBSCOhost, which the generator doesn't record. Its short title, Fact-Checking, is a judgment the generator leaves to you: enter it as your own short title and the generator uses it." },
      ],
    },
    {
      id: "journal-articles",
      heading: "Journal articles",
      blocks: [
        { type: "paragraph", text: "An article's title goes in quotation marks and the journal's is italicized, followed by the volume, “no.” and the issue, and the year in parentheses. A note gives the page you cite; the bibliography gives the article's whole range. They are different numbers and shouldn't be confused." },
        { type: "table", caption: "One article (Chicago Manual of Style samples)", columns: ["Form", "Example"], rows: [["Full note, citing pages 1842–43", "Hyeyoung Kwon, “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life,” American Journal of Sociology 127, no. 6 (2022): 1842–43, https://doi.org/10.1086/720277."], ["Shortened note, citing page 1851", "Kwon, “Inclusion Work,” 1851."], ["Bibliography, the whole article", "Kwon, Hyeyoung. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127, no. 6 (2022): 1818–59. https://doi.org/10.1086/720277."]] },
        { type: "paragraph", text: "When a journal numbers its articles instead of paginating them, the article ID stands in for the page range in the bibliography; a note may give both the page cited and the ID." },
      ],
    },
    {
      id: "web-pages",
      heading: "Web pages",
      blocks: [
        { type: "paragraph", text: "When no person is the author of a page, its note begins with the title, then names the site and the organization that owns it. In the bibliography, the page is listed under its owner or sponsor. A page without a date of publication or revision gets an access date; the Chicago Manual of Style's samples give that, not n.d." },
        { type: "table", caption: "A page with no date (Chicago Manual of Style samples)", columns: ["Form", "Example"], rows: [["Full note", "“About Yale: Yale Facts,” Yale University, accessed March 8, 2022, https://www.yale.edu/about-yale/yale-facts."], ["Bibliography", "Yale University. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts."], ["Shortened note, as CMOS shortens it", "“Yale Facts.”"]] },
        { type: "paragraph", text: "Give a page's date as the page labels it. Google's policy is “effective November 15”; a page might say “last modified” or “published”. The generator gives the date without a label, so add the page's own wording." },
        { type: "table", caption: "A dated page", columns: ["Form", "Example"], rows: [["Chicago Manual of Style sample", "Google. “Privacy Policy.” Privacy & Terms. Effective November 15, 2023. https://policies.google.com/privacy."], ["The generator, before you add the label", "Google. “Privacy Policy.” Privacy & Terms. November 15, 2023. https://policies.google.com/privacy."]] },
      ],
    },
    {
      id: "multiple-authors",
      heading: "Multiple authors",
      blocks: [
        { type: "paragraph", text: "Name two authors in full in every form. With three or more, a note names the first followed by et al.; the bibliography lists up to six, and for more than six, the first three followed by et al." },
        { type: "table", caption: "Authors in notes and the bibliography", columns: ["Authors", "Full note", "Shortened note", "Bibliography"], rows: [["Two (CMOS)", "Amy J. Binder and Jeffrey L. Kidder", "Binder and Kidder", "Binder, Amy J., and Jeffrey L. Kidder."], ["Three (synthetic)", "Jane Smith et al.", "Smith et al.", "Smith, Jane, John Jones, and Min-jun Lee."], ["Seven (CMOS)", "Carl D. Snyder et al.", "Snyder et al.", "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al."]] },
      ],
    },
    {
      id: "organization-authors",
      heading: "Organization authors",
      blocks: [
        { type: "paragraph", text: "When no person is named, Chicago allows the organization responsible for a work to serve as its author, written in full and never inverted. When real people are named as authors, cite them instead." },
        { type: "table", caption: "An organization's report (synthetic)", columns: ["Form", "Example"], rows: [["Full note", "World Health Organization, Example Report (Example Press, 2020), 8."], ["Shortened note", "World Health Organization, Example Report, 9."], ["Bibliography", "World Health Organization. Example Report. Example Press, 2020."]] },
        { type: "paragraph", text: "When an organization is also a book's publisher, ResearchKit names it in both places and tells you, because no Chicago rule it could confirm says to leave the publisher out. When a website has the same name as its owner, the name isn't repeated." },
      ],
    },
    {
      id: "no-author",
      heading: "Sources with no author",
      blocks: [
        { type: "paragraph", text: "Never invent an author, and don't write Anonymous unless the source does. Without an author, the title begins the full note, the shortened note and the bibliography entry, so all three stay consistent." },
        { type: "table", caption: "A book with no author (synthetic)", columns: ["Form", "Example"], rows: [["Full note", "The Guide to Field Methods (Example Press, 2020), 8."], ["Shortened note", "Guide to Field Methods, 9."], ["Bibliography", "The Guide to Field Methods. Example Press, 2020."]] },
      ],
    },
    {
      id: "page-locators",
      heading: "Page locators",
      blocks: [
        { type: "paragraph", text: "A note ends with the page or pages cited, after a comma and with no “p.” or “pp.”. Chicago shortens the second number of a range: 117–18, 1842–43, 104–5. Where there are no fixed pages, as in some ebooks, a chapter can be cited instead: chap. 6." },
        { type: "list", items: ["Full note: Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.", "Chapter (synthetic, after the CMOS chap. 6 sample): Charles Yu, Interior Chinatown (Pantheon Books, 2020), chap. 6.", "Range: Binder and Kidder, Channels of Student Activism, 117–18."] },
      ],
    },
    {
      id: "doi-and-url",
      heading: "DOIs and URLs",
      blocks: [
        { type: "paragraph", text: "For a source consulted online, end the note and the bibliography entry with a URL, preferably one based on the work's DOI, written as a https://doi.org/ link. In a note, the URL follows the page cited." },
        { type: "list", items: ["Give the DOI link in place of any other URL.", "Copy URLs in full, including https://.", "Chicago also allows the name of a database instead of a URL; the generator doesn't record databases."] },
      ],
    },
    {
      id: "repeated-sources",
      heading: "Citing a source again",
      blocks: [
        { type: "paragraph", text: "After the first, full note, cite a source with a shortened note every time, even when it was cited in the note just before. The 18th edition discourages ibid. (“in the same place”), which saves little space and can obscure which source is meant." },
        { type: "paragraph", text: "Whether a citation is the first of its source depends on your whole document. The generator can't see it, so you choose the citation context: a full note for the first citation, a shortened note after that." },
      ],
    },
    {
      id: "short-titles",
      heading: "How short titles are formed",
      blocks: [
        { type: "paragraph", text: "A shortened note uses the main title, shortened if it is longer than four words, without an initial A, An or The. The words kept are the key words of the title, in their original order." },
        { type: "table", caption: "Short titles", columns: ["Full title", "Short title", "How"], rows: [["The Wedding Party", "Wedding Party", "Initial article dropped (CMOS)."], ["The Channels of Student Activism: How the Left and Right Are Winning . . .", "Channels of Student Activism", "Subtitle and article dropped (CMOS)."], ["Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life", "Inclusion Work", "Subtitle dropped (CMOS)."], ["Temporal Variation in Selection Influences Microgeographic Local Adaptation", "Temporal Variation", "Key words chosen (CMOS); the generator asks you to choose."]] },
        { type: "paragraph", text: "The generator takes only the steps that follow a rule: dropping an initial article, and dropping a subtitle when a title is longer than four words. Choosing key words from a long title is a judgment, so it keeps such a title whole and asks you to enter your own short title." },
      ],
    },
    {
      id: "bibliography-order",
      heading: "Ordering the bibliography",
      blocks: [
        { type: "paragraph", text: "The bibliography is in alphabetical order by the first word of each entry: usually the first author's surname, otherwise an organization or a title. That is why the first author's name is inverted there and nowhere else." },
        { type: "paragraph", text: "Ordering needs the whole list, so the generator gives one entry at a time; arrange the entries in your document." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Mistakes and corrections", columns: ["Mistake", "Correct notes and bibliography"], rows: [["Yu, Charles, Interior Chinatown (Pantheon Books, 2020), 45: an inverted name in a note", "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45."], ["Charles Yu. Interior Chinatown. Pantheon Books, 2020: note order in the bibliography", "Yu, Charles. Interior Chinatown. Pantheon Books, 2020."], ["(Yu 2020, 45) in a notes-and-bibliography paper", "A numbered note"], ["Repeating the full note for every citation", "A shortened note after the first"], ["Ibid., 48.", "Yu, Interior Chinatown, 48."], ["The article's whole page range in a note", "The page you cite"], ["p. 45", "45"]] },
      ],
    },
    {
      id: "compared-with-author-date",
      heading: "Notes and bibliography compared with author-date",
      blocks: [
        { type: "table", caption: "Chicago's two systems (Chicago Manual of Style samples)", columns: ["", "Notes and bibliography", "Author-date"], rows: [["Citation in the text", "A note number; the note: Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.", "(Yu 2020, 45)"], ["Later citations", "Shortened note: Yu, Interior Chinatown, 48.", "The same short citation"], ["List at the end", "Bibliography: Yu, Charles. Interior Chinatown. Pantheon Books, 2020.", "References: Yu, Charles. 2020. Interior Chinatown. Pantheon Books."], ["Where the year goes", "With the publisher", "After the author"]] },
        { type: "paragraph", text: "The two systems are not interchangeable within one piece of writing: choose one, as your instructions direct, and use it throughout." },
        { type: "links", items: [{ label: "Chicago Author-Date Citations guide", href: "/learn/chicago-author-date-citations" }, { label: "Chicago Author-Date Citation Generator", href: "/tools/chicago-author-date-citation-generator" }] },
      ],
    },
    {
      id: "research-writing",
      heading: "Notes in academic research writing",
      blocks: [
        { type: "paragraph", text: "Notes do more than cite. They let you acknowledge a source precisely, point readers to further reading, explain a translation or a disagreement among sources, or set out evidence that would interrupt the argument. Keep such comment brief and relevant; the argument belongs in the text." },
        { type: "list", items: ["Record full details for every source as you read, so the first note can be complete.", "Cite the exact page of every quotation and close paraphrase.", "Use one short title for a source throughout the work.", "Check that every source in the notes appears in the bibliography."] },
      ],
    },
    {
      id: "using-the-generator",
      heading: "Using the ResearchKit Chicago Notes and Bibliography Citation Generator",
      blocks: [
        { type: "list", ordered: true, items: ["Choose whether the source is a book, a journal article or a web page, and enter its details as the source gives them.", "Choose the citation context: a full note for the first citation of the source, a shortened note for later ones.", "Enter your own short title if the one shown needs shortening.", "Add the page, range or chapter you are citing.", "Copy the note into your word processor's footnote, after the number it supplies, and the bibliography entry into your bibliography.", "Read “Validation and notes” and compare the result with the source."] },
        { type: "paragraph", text: "The generator formats citation text. It doesn't insert or number notes in your document, remember which sources you have cited, or look up details from a DOI or URL. Everything runs in your browser; nothing you enter is sent anywhere or saved." },
        { type: "links", items: [{ label: "Open the Chicago Notes and Bibliography Citation Generator", href: "/tools/chicago-notes-bibliography-citation-generator" }] },
      ],
    },
    {
      id: "limitations",
      heading: "Limitations of automated citation",
      blocks: [
        { type: "list", items: ["Choosing a short title's key words, and headline-style capitalization, need your judgment.", "Note numbering, the order of notes and the bibliography's order depend on your whole document.", "Editors, translators, chapters, news articles, databases and other sources aren't supported yet; the generator says so rather than approximate them.", "A perfectly formatted note can still contain a wrong date or a misspelled name. Formatting is not verification."] },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "The Chicago Manual of Style is the authority for both Chicago systems; its website publishes sample citations and answers to questions from writers and editors. Your instructor's or publisher's requirements come first where they differ." },
        { type: "references", ids: ["chicago-2024"] },
        { type: "links", items: [{ label: "Chicago Manual of Style: notes and bibliography sample citations", href: "https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html" }, { label: "Chicago Author-Date Citations", href: "/learn/chicago-author-date-citations" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "Do I need a full note every time I cite a source?", answer: "No. Give a full note the first time, then a shortened note with the author's surname, a short title and the page." },
    { question: "Should I use ibid.?", answer: "The 18th edition of the Chicago Manual of Style discourages it. Use a shortened note instead, even for the source cited just before." },
    { question: "Is a place of publication required?", answer: "No. The 18th edition no longer requires it for books; give the publisher and year." },
    { question: "Does the generator number my footnotes?", answer: "No. Your word processor numbers and places notes; the generator gives you the text to put in them." },
    { question: "Can I mix notes and author-date citations?", answer: "No. Choose one Chicago system, as your instructions direct, and use it throughout a piece of writing." },
  ],
  relatedToolIds: ["chicago-notes-bibliography-citation-generator", "citation-style-finder"],
};
