import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Rules are taken from the Chicago Manual of Style, 18th edition (2024), through its
 * own published sample citations and Q&A (chicagomanualofstyle.org). Examples
 * credited to the Chicago Manual of Style reproduce its sample citations; the others
 * are synthetic teaching examples. The guide's tests check that every example the
 * generator can produce matches the generator's output exactly. Examples the
 * generator does not produce are labeled as such.
 */
export const chicagoAuthorDateCitations: Guide = {
  slug: "chicago-author-date-citations",
  title: "Chicago Author-Date Citations",
  description:
    "Learn Chicago's author-date system: how text citations such as (Yu 2020, 45) point to a reference list, how to cite books, journal articles and web pages, and how it differs from notes and bibliography.",
  summary:
    "In Chicago's author-date system, a short citation in the text gives the author's surname and the year, such as (Yu 2020, 45), and the reference list at the end gives the full details, with the year straight after the author so the two can be matched.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-author-date",
      heading: "What Chicago author-date is",
      blocks: [
        { type: "paragraph", text: "The Chicago Manual of Style, published by the University of Chicago Press, describes two complete systems of citation. The author-date system cites sources in the text by the author's surname and the year of publication, and lists every source in a reference list at the end of the work. The current edition, the 18th, was published in 2024." },
        { type: "paragraph", text: "The system is built around one idea: the author and year in the text are the first two things in the reference list entry, so a reader moves from one to the other without numbers or notes." },
        { type: "styles", styles: ["chicago"] },
      ],
    },
    {
      id: "when-to-use",
      heading: "When to use it",
      blocks: [
        { type: "paragraph", text: "Author-date is common in the physical, natural and social sciences, where the date of a finding matters and sources are cited often and briefly. Many journals and departments that otherwise follow Chicago ask for author-date; historians and many humanities fields more often use notes and bibliography." },
        { type: "paragraph", text: "The decision is rarely yours alone. Follow your instructor's, department's or publisher's instructions first; they may name a system, or a style based on Chicago such as Turabian." },
        { type: "links", items: [{ label: "Not sure which style you need? Try the Citation Style Finder", href: "/tools/citation-style-finder" }] },
      ],
    },
    {
      id: "author-date-and-notes",
      heading: "Author-date and notes and bibliography",
      blocks: [
        { type: "paragraph", text: "Both Chicago systems record the same information about a source; they differ in where the citation goes and in the order of the elements. The Chicago Manual of Style's own samples for the same book show the difference." },
        { type: "table", caption: "One book in both Chicago systems (Chicago Manual of Style samples)", columns: ["System", "In the text", "At the end"], rows: [["Author-date", "(Yu 2020, 45)", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books."], ["Notes and bibliography", "A numbered note: 1. Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.", "Yu, Charles. Interior Chinatown. Pantheon Books, 2020."]] },
        { type: "paragraph", text: "In author-date the year moves up to follow the author; in a bibliography it comes at the end, with the publisher. ResearchKit's generator produces author-date only; notes and bibliography are shown here for comparison." },
      ],
    },
    {
      id: "in-text-citations",
      heading: "In-text citations",
      blocks: [
        { type: "paragraph", text: "Cite a source in the text wherever you use its words, ideas or data. A citation gives the surname of the author, or the organization or title that stands in for one, and the year, with no punctuation between them. A page number, when you refer to a particular passage, follows a comma." },
        { type: "list", items: ["(Yu 2020) cites the work as a whole.", "(Yu 2020, 45) points to page 45.", "(Binder and Kidder 2022, 117–18) points to a range of pages.", "No “p.” or “pp.” is used before page numbers."] },
      ],
    },
    {
      id: "parenthetical-citations",
      heading: "Parenthetical citations",
      blocks: [
        { type: "paragraph", text: "A parenthetical citation puts the author, year and page together in parentheses, usually at the end of the clause or sentence it supports, before the final punctuation." },
        { type: "table", caption: "Parenthetical citations", columns: ["Authors", "Example"], rows: [["One", "(Yu 2020, 45)"], ["Two", "(Dittmar and Schemske 2023, 480)"], ["Three or more", "(Snyder et al. 2025, 9–10)"], ["An organization", "(Google 2023)"], ["No date", "(Yale University, n.d.)"]] },
      ],
    },
    {
      id: "narrative-citations",
      heading: "Narrative citations",
      blocks: [
        { type: "paragraph", text: "When the author's name is part of your sentence, only the year, and any page, goes in parentheses straight after it. This is not the parenthetical citation with its parentheses removed: the name stays in the sentence, and the year still sits in parentheses." },
        { type: "list", items: ["Dittmar and Schemske (2023, 480) found that selection varied over time.", "As Yu (2020) shows, the narrative frame shapes the reader's view.", "Snyder et al. (2025) describe a detection method that needs no labels."] },
      ],
    },
    {
      id: "reference-lists",
      heading: "Reference lists",
      blocks: [
        { type: "paragraph", text: "Every source cited in the text appears in the reference list, titled References, at the end of the work, in alphabetical order by the first author's surname. Each entry gives the author, the year, the title and the publication details, separated by full stops, with a hanging indent." },
        { type: "list", ordered: true, items: ["Author, first author inverted.", "Year of publication, or n.d.", "Title: italic for a book; in quotation marks for an article or web page.", "Publication details: publisher; or journal, volume, issue and pages; or website.", "DOI or URL."] },
      ],
    },
    {
      id: "one-author",
      heading: "One author",
      blocks: [
        { type: "paragraph", text: "The author's name is inverted, family name first, followed by the given names as the source gives them. In the text, use the surname alone." },
        { type: "table", caption: "One author (Chicago Manual of Style sample)", columns: ["Reference list", "Text citation"], rows: [["Yu, Charles. 2020. Interior Chinatown. Pantheon Books.", "(Yu 2020, 45)"]] },
      ],
    },
    {
      id: "two-authors",
      heading: "Two authors",
      blocks: [
        { type: "paragraph", text: "Only the first name is inverted; the second follows in normal order after a comma and “and”. In the text, name both, joined by “and”, never an ampersand." },
        { type: "table", caption: "Two authors (Chicago Manual of Style sample)", columns: ["Reference list", "Text citation"], rows: [["Binder, Amy J., and Jeffrey L. Kidder. 2022. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press.", "(Binder and Kidder 2022, 117–18)"]] },
      ],
    },
    {
      id: "three-or-more-authors",
      heading: "Three or more authors",
      blocks: [
        { type: "paragraph", text: "In the reference list, list up to six authors. For more than six, list the first three followed by et al. (“and others”). In the text, from three authors on, give only the first author followed by et al." },
        { type: "table", caption: "Many authors", columns: ["Authors", "Reference list", "Text citation"], rows: [["Three (synthetic)", "Smith, Jane, John Jones, and Min-jun Lee. 2024. A Shared Book. Example Press.", "(Smith et al. 2024)"], ["Seven (Chicago Manual of Style sample)", "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al. 2025. “Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments.” PLOS ONE 20 (3): e0318239. https://doi.org/10.1371/journal.pone.0318239.", "(Snyder et al. 2025, 9–10)"]] },
      ],
    },
    {
      id: "organization-authors",
      heading: "Organization authors",
      blocks: [
        { type: "paragraph", text: "When no person is named as author, Chicago allows the organization responsible for a work to serve as its author. Its name is written in full and never inverted. If real people are named as authors, cite them instead, even when an organization published the work." },
        { type: "table", caption: "Organizations as authors (Chicago Manual of Style samples)", columns: ["Reference list", "Text citation"], rows: [["Google. 2023. “Privacy Policy.” Privacy & Terms. Effective November 15. https://policies.google.com/privacy.", "(Google 2023)"], ["Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.", "(Yale University, n.d.)"]] },
        { type: "paragraph", text: "When the organization's website has the same name as the organization, as in the Yale example, the name isn't repeated. When an organization is both the author and the publisher of a book, ResearchKit names it in both places and tells you so, because no Chicago rule it could confirm says to leave the publisher out." },
      ],
    },
    {
      id: "books",
      heading: "Books",
      blocks: [
        { type: "paragraph", text: "A book reference gives the author, year, italic title, edition if it isn't the first, and publisher. A place of publication is no longer required in the 18th edition. Add a DOI or URL if you consulted the book online." },
        { type: "table", caption: "Book references", columns: ["Situation", "Reference list"], rows: [["One author (Chicago Manual of Style sample)", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books."], ["Second edition (after the Chicago Manual of Style sample)", "Borel, Brooke. 2023. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press."], ["No author (synthetic)", "Guide to Field Methods. 2020. Example Press."]] },
        { type: "paragraph", text: "The Borel sample in the Chicago Manual of Style ends with the database it was read in, EBSCOhost; the generator doesn't record databases, so its entry stops at the publisher. Tables on this page can't show italics: book and journal titles are italicized in real references." },
      ],
    },
    {
      id: "journal-articles",
      heading: "Journal articles",
      blocks: [
        { type: "paragraph", text: "An article title goes in quotation marks; the journal title is italicized. The volume follows the journal, the issue in parentheses, then a colon and the article's full page range. In the text, cite the specific page." },
        { type: "table", caption: "Journal article references (Chicago Manual of Style samples)", columns: ["Reference list", "Text citation"], rows: [["Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.", "(Dittmar and Schemske 2023, 480)"], ["Kwon, Hyeyoung. 2022. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127 (6): 1818–59. https://doi.org/10.1086/720277.", "(Kwon 2022, 1842–43)"]] },
        { type: "list", items: ["When a journal numbers articles instead of paginating them, the article ID takes the place of the page range: PLOS ONE 20 (3): e0318239.", "Chicago also allows the form 202, no. 4 (April): 471–85 when the issue's month or season is cited. Choose one form and use it throughout.", "Use the year of the numbered issue, not the date the article first appeared online."] },
      ],
    },
    {
      id: "web-pages",
      heading: "Web pages",
      blocks: [
        { type: "paragraph", text: "The Chicago Manual of Style notes that web content can often simply be described in the text. When a formal citation is needed, give the author or the organization responsible, the year, the page title in quotation marks, the name of the site (not italicized), the month and day if the page gives them, and the URL." },
        { type: "paragraph", text: "The month and day are written as the page labels them: Google's policy is “Effective November 15”; a page might instead say “Last modified” or “Published”. The generator gives the date without a label, so add the page's own wording." },
        { type: "table", caption: "Web pages", columns: ["Situation", "Reference list"], rows: [["The Chicago Manual of Style sample", "Google. 2023. “Privacy Policy.” Privacy & Terms. Effective November 15. https://policies.google.com/privacy."], ["What the generator produces for the same page, before you add the label", "Google. 2023. “Privacy Policy.” Privacy & Terms. November 15. https://policies.google.com/privacy."]] },
      ],
    },
    {
      id: "doi-and-url",
      heading: "DOIs and URLs",
      blocks: [
        { type: "paragraph", text: "For a source consulted online, end the reference with a URL, preferably one based on the work's DOI, written as a https://doi.org/ link. A DOI keeps working when a publisher's web addresses change." },
        { type: "list", items: ["Give the DOI link in place of any other URL: https://doi.org/10.1086/725865.", "Copy URLs in full, including https://.", "End the reference with a full stop, even after a URL.", "Instead of a URL, Chicago also allows the name of the database where you found the source; the generator doesn't support database names."] },
        { type: "links", items: [{ label: "DOI Foundation", href: "https://www.doi.org/" }] },
      ],
    },
    {
      id: "page-locators",
      heading: "Page locators",
      blocks: [
        { type: "paragraph", text: "Add page numbers to a text citation when you quote or refer to a particular passage. The reference list gives the full range of an article, never the page you cited." },
        { type: "paragraph", text: "Chicago shortens the second number of a range. Up to 100, and for multiples of 100, use all the digits (71–72, 100–104). For 101 to 109 (and 201 to 209, and so on), show only what changes (101–8, 1103–4). Otherwise use two digits, or more where they change (321–28, 1496–500)." },
        { type: "list", items: ["(Binder and Kidder 2022, 117–18)", "(Kwon 2022, 1842–43)", "For other locators, such as a chapter in an ebook without fixed pages, Chicago uses abbreviations such as chap.: (Roy 2008, chap. 6). The generator formats page numbers only."] },
      ],
    },
    {
      id: "missing-dates",
      heading: "Missing dates",
      blocks: [
        { type: "paragraph", text: "When a source gives no date of publication or revision, Chicago uses n.d. (“no date”) in place of the year. For web content, add the date you accessed it, before the URL. In a parenthetical citation, a comma comes before n.d., so it isn't read as part of the name." },
        { type: "table", caption: "No date (Chicago Manual of Style sample)", columns: ["Reference list", "Parenthetical", "Narrative"], rows: [["Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.", "(Yale University, n.d.)", "Yale University (n.d.)"]] },
        { type: "paragraph", text: "Look carefully before using n.d.: copyright lines, “last modified” notices and the issue a journal article appeared in all supply dates. Never guess a year." },
      ],
    },
    {
      id: "same-author-same-year",
      heading: "Same author, same year",
      blocks: [
        { type: "paragraph", text: "When your reference list includes two or more works by the same author from the same year, Chicago adds lowercase letters to the year, 2024a and 2024b, assigned by the alphabetical order of their titles, and uses the same letters in the text: (Smith 2024a, 12)." },
        { type: "paragraph", text: "The letters depend on the whole reference list, which a generator formatting one source at a time can't see. ResearchKit's generator doesn't assign them; add them yourself once your list is complete." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Mistakes and corrections", columns: ["Mistake", "Correct Chicago author-date"], rows: [["(Yu, 2020, p. 45): APA's comma and p.", "(Yu 2020, 45)"], ["(Yu 45): MLA's author and page, with no year", "(Yu 2020, 45)"], ["Yu, C. (2020). Interior Chinatown.: APA's initials and bracketed year", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books."], ["Binder & Kidder", "Binder and Kidder"], ["Inverting every author", "Only the first: Binder, Amy J., and Jeffrey L. Kidder."], ["vol. 202, no. 4, pp. 471–85", "202 (4): 471–85"], ["Guessing a missing year", "n.d., and for a web page an access date"]] },
      ],
    },
    {
      id: "reporting-consistently",
      heading: "Citing consistently",
      blocks: [
        { type: "list", items: ["Make sure every text citation has a reference list entry, and every entry is cited.", "Check that the author and year in each citation match the entry exactly, including any 2024a and 2024b letters.", "Choose one form for journal volumes and issues and for web dates, and use it throughout.", "Give DOIs wherever works have them, and URLs only otherwise.", "Use the same name for an organization every time it appears."] },
      ],
    },
    {
      id: "when-not-appropriate",
      heading: "When author-date may not be the right choice",
      blocks: [
        { type: "paragraph", text: "Author-date works best when sources are recent, authored and dated. It is awkward for undated archival documents, manuscripts, legal and public documents, and works known by title rather than author, all of which Chicago's notes and bibliography handle more naturally. It also gives no room for commentary, which notes allow." },
        { type: "paragraph", text: "If your sources are mostly of these kinds, or your field expects footnotes, ask whether notes and bibliography is expected instead." },
      ],
    },
    {
      id: "relationship-to-notes-bibliography",
      heading: "Moving between the two Chicago systems",
      blocks: [
        { type: "paragraph", text: "Because both systems record the same details, converting between them is mostly a matter of moving the year and changing punctuation. Keep complete details for every source from the start, and either system can be produced later." },
        { type: "list", items: ["Author-date reference: the year follows the author, and elements are separated by full stops.", "Bibliography entry: the year moves to the end of the publication details.", "Text citation becomes a numbered note giving the author's name in normal order, the title, the publication details in parentheses, and the page."] },
      ],
    },
    {
      id: "using-the-generator",
      heading: "Using the ResearchKit Chicago Author-Date Citation Generator",
      blocks: [
        { type: "list", ordered: true, items: ["Keep the source open while you work.", "Choose whether it is a book, a journal article or a web page.", "Enter each author in their own fields, as the source names them, or an organization if no person is named.", "Enter only details you can see on the source; leave the rest blank.", "Add a page number if you are citing a specific passage.", "Read “Validation and notes” for anything missing or that Chicago allows in more than one form, and “How this was built” for each decision.", "Compare the result with the source and your instructions, then copy it."] },
        { type: "paragraph", text: "The generator runs entirely in your browser. Nothing you enter is sent anywhere or saved, and it does not look up details from a DOI or URL: it formats exactly what you give it." },
        { type: "links", items: [{ label: "Open the Chicago Author-Date Citation Generator", href: "/tools/chicago-author-date-citation-generator" }] },
      ],
    },
    {
      id: "limitations",
      heading: "Limitations of automated citation",
      blocks: [
        { type: "list", items: ["Notes and bibliography aren't generated yet.", "Headline-style capitalization and shortened titles need your judgment, so titles are used as you type them.", "Year letters such as 2024a depend on the whole reference list.", "Editors, translators, chapters, news articles, databases and other sources aren't supported yet; the generator says so rather than approximate them.", "A perfectly formatted reference can still contain a wrong date or a misspelled name. Formatting is not verification."] },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "The Chicago Manual of Style is the authority for both Chicago systems; its website publishes sample citations and answers to questions from writers and editors. Your instructor's or publisher's requirements come first where they differ." },
        { type: "references", ids: ["chicago-2024"] },
        { type: "links", items: [{ label: "Chicago Manual of Style: author-date sample citations", href: "https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html" }, { label: "MLA 9 Citation and Works Cited Guide", href: "/learn/mla-9-citations-and-works-cited" }, { label: "APA 7 Citations and References", href: "/learn/apa-7-citations-and-references" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "Is there a comma between the author and the year?", answer: "No: (Yu 2020). A comma separates the year from a page number, (Yu 2020, 45), and comes before n.d. when there is no date, (Yale University, n.d.)." },
    { question: "Do I write p. before page numbers?", answer: "No. Chicago author-date text citations give the page number alone after a comma." },
    { question: "When do I use et al.?", answer: "In the text, from three authors on. In the reference list, only when there are more than six authors, after the first three." },
    { question: "Does ResearchKit generate footnotes?", answer: "Not yet. The generator covers the author-date system; notes and bibliography are planned separately." },
    { question: "Does a DOI mean the reference is correct?", answer: "No. A DOI identifies the work, but the authors, title, dates and numbers you entered still need checking against the source." },
  ],
  relatedToolIds: ["chicago-author-date-citation-generator", "citation-style-finder"],
};
