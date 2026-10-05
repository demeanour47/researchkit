import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Rules are taken from the MLA Handbook, 9th edition, and the MLA Style Center
 * (style.mla.org), which answers questions on the Handbook's behalf. Examples marked
 * as from the MLA Style Center reproduce entries published there; the others are
 * synthetic teaching examples. The guide's tests check its examples against the
 * MLA Citation Generator's output, so the guide and the tool cannot disagree.
 */
export const mla9CitationsAndWorksCited: Guide = {
  slug: "mla-9-citations-and-works-cited",
  title: "MLA 9 Citation and Works Cited Guide",
  description:
    "Learn how MLA 9 builds Works Cited entries from a source and its container, how in-text citations point to them, and what to do when details are missing.",
  summary:
    "MLA style builds every Works Cited entry from the same core elements, in the same order, using only the ones a source has. A short in-text citation, usually the author's name and a page number such as (Baron 194), points the reader to that entry.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-mla",
      heading: "What MLA style is",
      blocks: [
        { type: "paragraph", text: "MLA style is the documentation system of the Modern Language Association. It is used most in literature, languages and the other humanities, where writers quote and discuss texts closely, so its citations lead readers to an exact page rather than emphasizing a date." },
        { type: "paragraph", text: "The current edition is the MLA Handbook, ninth edition, published in 2021. It keeps the eighth edition's central idea: instead of a separate rule for every kind of source, one template of core elements describes them all. The ninth edition expands the guidance on that template and on in-text citations, adds chapters on inclusive language, formatting a research paper and using notes, and includes an appendix of hundreds of sample entries." },
        { type: "styles", styles: ["mla"] },
      ],
    },
    {
      id: "works-cited-and-in-text",
      heading: "Works Cited entries and in-text citations",
      blocks: [
        { type: "paragraph", text: "MLA documentation has two parts that work together. In your text, a brief citation tells readers which source you are using and where in it. At the end, the Works Cited list gives each source's full details, in alphabetical order. A citation begins with the same word as its entry, usually the author's surname, so readers can find one from the other." },
        { type: "table", caption: "One source, two parts", columns: ["Part", "Example", "Purpose"], rows: [["In-text citation", "(Baron 194)", "Identifies the source and the page, briefly, where you use it."], ["Works Cited entry", "Berman, Russell. “The Necessity of Language Learning.” ADFL Bulletin, vol. 43, no. 2, 2015, pp. 11–14, https://doi.org/10.1632/adfl.43.2.11.", "Gives readers enough to find the source itself."]] },
        { type: "paragraph", text: "Unlike author–date styles such as APA, an MLA in-text citation has no year. The page number does the work of locating the passage, and the year appears in the Works Cited entry." },
      ],
    },
    {
      id: "source-and-container",
      heading: "The source and its container",
      blocks: [
        { type: "paragraph", text: "MLA describes every work as a source, which may sit inside a larger whole, its container. An article is a source; the journal that publishes it is its container. A web page is a source; the website is its container. A book usually stands alone, so it has no container of its own." },
        { type: "list", ordered: true, items: ["Author.", "Title of source.", "Title of container,", "Other contributors,", "Version,", "Number,", "Publisher,", "Publication date,", "Location."] },
        { type: "paragraph", text: "These are the core elements, in order. An entry uses only the elements that apply to the source, and leaves the rest out entirely: there are no empty slots and no placeholders. The punctuation after each element in the list above is the punctuation it takes in an entry." },
        { type: "table", caption: "How the template fits common sources", columns: ["Source", "Title of source", "Container", "Formatting"], rows: [["Book", "The book's title", "None", "The book title is in italics."], ["Journal article", "The article's title", "The journal", "Article title in quotation marks; journal in italics."], ["Web page", "The page's title", "The website", "Page title in quotation marks; website in italics."]] },
        { type: "paragraph", text: "The rule behind the formatting: the title of a self-contained work is italicized, and the title of a work contained in something larger is put in quotation marks. Knowing which is the source and which is the container tells you how to style both. The example tables on this page can't show italics, so keep this rule in mind as you read them." },
      ],
    },
    {
      id: "authors",
      heading: "Author formatting",
      blocks: [
        { type: "paragraph", text: "In the Works Cited list, the first author's name is inverted, family name first, because the list is alphabetized by it. Given names are written as the source gives them, not reduced to initials." },
        { type: "list", items: ["One author: Baron, Naomi.", "In text: (Baron 194), or name the author in your sentence: Naomi Baron argues … (194).", "At first mention in your prose, give the author's full name; afterwards, the surname alone."] },
      ],
    },
    {
      id: "multiple-authors",
      heading: "Multiple authors",
      blocks: [
        { type: "table", caption: "Authors in entries and citations", columns: ["Authors", "Works Cited entry", "Parenthetical citation", "In your sentence"], rows: [["One", "Baron, Naomi.", "(Baron 194)", "Naomi Baron, then Baron"], ["Two", "Dorris, Michael, and Louise Erdrich.", "(Dorris and Erdrich 24)", "Michael Dorris and Louise Erdrich"], ["Three or more", "Burdick, Anne, et al.", "(Burdick et al. 24)", "Anne Burdick and others"]] },
        { type: "list", items: ["Only the first name is inverted; the second is in normal order.", "With two authors, a comma follows the inverted first name, then “and”.", "With three or more, give the first author and et al. The comma before et al. belongs to the inverted name, so it appears in the Works Cited list but not in a parenthetical citation.", "In your own sentences, MLA reserves et al. for citations: write “and others” or name every author.", "MLA uses “and”, never an ampersand."] },
      ],
    },
    {
      id: "organization-authors",
      heading: "Organization authors",
      blocks: [
        { type: "paragraph", text: "An organization can be an author. Its name is written in full and never inverted: World Health Organization." },
        { type: "paragraph", text: "When an organization is both the author and the publisher, MLA begins the entry with the title and names the organization only once, as publisher. On a website with basically the same name as the organization, the author and publisher are both left out. In either case the in-text citation uses the title, because that is now the first word of the entry." },
        { type: "table", caption: "Examples from the MLA Style Center", columns: ["Situation", "Works Cited entry", "In-text citation"], rows: [["Organization is author and publisher", "MLA Handbook. 9th ed., Modern Language Association of America, 2021.", "(MLA Handbook 54)"], ["Organization shares the website's name", "“Education.” New York Public Library, 2018, www.nypl.org/education.", "(“Education”)"]] },
      ],
    },
    {
      id: "books",
      heading: "Books",
      blocks: [
        { type: "paragraph", text: "A book is a self-contained work, so its title is italicized and there is usually no container. An edition other than the first goes after the title, abbreviated to ed., followed by the publisher and the year." },
        { type: "table", caption: "Book entries", columns: ["Situation", "Works Cited entry"], rows: [["One author, second edition (MLA Style Center)", "Lodge, David. Changing Places: A Tale of Two Campuses. 2nd ed., Penguin Books, 1979."], ["Three or more authors (MLA Style Center)", "Burdick, Anne, et al. Digital_Humanities. MIT P, 2012."], ["No author (synthetic)", "Guide to Field Methods. Example Press, 2020."]] },
        { type: "paragraph", text: "MLA shortens academic publishers' names: University Press becomes UP, as in Oxford UP, and business words such as Inc. and Co. are dropped. Write the publisher's name as the book gives it, then apply these abbreviations." },
      ],
    },
    {
      id: "journal-articles",
      heading: "Journal articles",
      blocks: [
        { type: "paragraph", text: "An article is the source and the journal is its container. The article title goes in quotation marks with its full stop inside them; the journal title is italicized. The volume, issue, date and pages follow, labelled vol., no. and pp., then the DOI." },
        { type: "table", caption: "Journal article entries", columns: ["Situation", "Works Cited entry"], rows: [["Pages and DOI (MLA Style Center)", "Berman, Russell. “The Necessity of Language Learning.” ADFL Bulletin, vol. 43, no. 2, 2015, pp. 11–14, https://doi.org/10.1632/adfl.43.2.11."], ["Three authors, long page numbers", "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539."]] },
        { type: "paragraph", text: "If a journal numbers its articles instead of paginating them continuously, MLA advises leaving out the article number: the author and journal are enough for readers to find the article." },
      ],
    },
    {
      id: "web-pages",
      heading: "Web pages",
      blocks: [
        { type: "paragraph", text: "A web page is the source and the website is its container. The page title goes in quotation marks and the website's name in italics. Include the publisher only when it differs from the website's name, then the date and the URL." },
        { type: "table", caption: "Web page entries", columns: ["Situation", "Works Cited entry"], rows: [["Named author (MLA Style Center)", "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history."], ["No author (MLA Style Center)", "“English Language Arts Standards.” Common Core State Standards Initiative, 2017, www.corestandards.org/ELA-Literacy/."]] },
        { type: "paragraph", text: "Dates in MLA are written day, month, year. Months longer than four letters are abbreviated: Jan., Feb., Mar., Apr., Aug., Sept., Oct., Nov. and Dec. May, June and July are written in full." },
      ],
    },
    {
      id: "page-numbers",
      heading: "Page numbers",
      blocks: [
        { type: "paragraph", text: "In an in-text citation, the page number follows the name directly, with no comma and no p.: (Smith 24). In the Works Cited list, a page range is the location of a work within its container and is labelled p. for one page or pp. for several." },
        { type: "list", items: ["One page: (Smith 24).", "A range: (Smith 24–26).", "For numbers over 99, give only the last two digits of the second number unless more are needed: 436–44, 103–04, but 395–401.", "Numbered paragraphs, used only when the source numbers them: (Chan, par. 41) or (Chan, pars. 41–43). A comma separates the name from the label.", "No page numbers: cite the name alone, (Smith). Don't count pages or paragraphs yourself."] },
        { type: "paragraph", text: "The MLA Handbook prints ranges with a hyphen because it is easier to type; publishers use an en dash. Either is acceptable; ResearchKit uses the en dash." },
      ],
    },
    {
      id: "missing-metadata",
      heading: "Missing information",
      blocks: [
        { type: "paragraph", text: "When a source lacks an element, MLA leaves that element out. There is no n.d. for a missing date and no n. pag. for missing page numbers: an element that doesn't apply simply disappears, and the punctuation closes up around what remains. Use n.d. only if your teacher asks you to. If you find a missing detail in a reliable source other than the work itself, MLA lets you add it in square brackets." },
        { type: "table", caption: "What to do when something is missing", columns: ["Missing", "What MLA does", "What not to do"], rows: [["Author", "Begin the entry with the title, and cite the title in text.", "Write Anonymous, unless the source does."], ["Publication date", "Leave it out. For a web page, consider adding the date you accessed it.", "Guess a year, or write n.d."], ["Page numbers", "Cite the name alone in text.", "Count pages on a screen or in a printout."], ["Container", "Leave it out if the work truly stands alone.", "Invent a website name."]] },
        { type: "paragraph", text: "A citation generator should behave the same way: it can leave an element out and tell you, but it must never fill a gap with a guess." },
      ],
    },
    {
      id: "doi-and-url",
      heading: "DOIs and URLs",
      blocks: [
        { type: "paragraph", text: "For an online work, the location is, in order of preference, its DOI, a permalink, or its URL. A DOI is a permanent identifier that keeps working when a publisher's web addresses change, so give it whenever a work has one, written after https://doi.org/." },
        { type: "list", items: ["DOI: https://doi.org/10.1038/nature14539.", "URL: copy it from the browser, then leave out http:// or https://, as the MLA Handbook advises: www.nypl.org/education.", "Give the DOI instead of a URL when the work has one.", "An entry ends with a full stop, even after a DOI or URL.", "A URL so long that it runs past three lines hurts readability; a permalink or DOI, if one exists, is better."] },
        { type: "links", items: [{ label: "DOI Foundation", href: "https://www.doi.org/" }] },
      ],
    },
    {
      id: "access-dates",
      heading: "Access dates",
      blocks: [
        { type: "paragraph", text: "An access date records when you consulted an online work. It is optional in MLA 9, and is most useful when a page has no publication date or might change or disappear. It goes at the very end of the entry, after the URL." },
        { type: "table", caption: "An access date (example from the MLA Style Center)", columns: ["Works Cited entry"], rows: [["“Orhan Pamuk: Un écrivain turc à succès.” Orhan Pamuk Site, İletişm Publishing, orhanpamuk.net/book.aspx?id=10&lng=eng. Accessed 25 Oct. 2015."]] },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Mistakes and corrections", columns: ["Mistake", "Correct MLA"], rows: [["(Smith, 2020, p. 24): APA's year, comma and p.", "(Smith 24)"], ["Smith, J., & Jones, K.: APA initials and ampersand", "Smith, Jane, and Kim Jones."], ["Inverting every author: Smith, Jane, and Jones, Kim.", "Only the first: Smith, Jane, and Kim Jones."], ["(n.d.) for a missing date", "Leave the date out."], ["Smith et al. argue … in your sentence", "Smith and others argue …"], ["Italicizing an article title", "“Article Title.” in quotation marks; italicize the journal."], ["Repeating an organization as author and publisher", "Begin with the title; give the organization once, as publisher."], ["Both a DOI and a URL", "The DOI alone."]] },
      ],
    },
    {
      id: "examples",
      heading: "Worked examples",
      blocks: [
        { type: "paragraph", text: "Each example below follows a source from what you know about it to its entry and citation. Examples credited to the MLA Style Center reproduce entries published there; the rest are synthetic examples for teaching, not claims that those works exist. Tables can't show italics: in real entries, book, journal and website titles are italicized." },
        { type: "table", caption: "From source to citation", columns: ["Source", "Works Cited entry", "In-text citation"], rows: [["Journal article, three authors, quoted from page 437", "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.", "(LeCun et al. 437)"], ["Web page, named author, no page numbers (MLA Style Center)", "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.", "(Burns)"], ["Book, two authors, page 24 (synthetic)", "Dorris, Michael, and Louise Erdrich. The Crown of Columbus. HarperCollins, 1991.", "(Dorris and Erdrich 24)"], ["Unsigned article, page 97 (synthetic)", "“Homily.” Journal of Examples, vol. 3, no. 1, 2020, pp. 90–104.", "(“Homily” 97)"]] },
      ],
    },
    {
      id: "using-the-generator",
      heading: "Using the ResearchKit MLA Citation Generator",
      blocks: [
        { type: "list", ordered: true, items: ["Keep the source open while you work.", "Choose whether it is a book, a journal article or a web page.", "Enter each author in their own fields, with full given names as the source gives them.", "Enter only details you can see on the source; leave the rest blank.", "Add the page you are citing, if the source has page numbers.", "Read “How this was built” to see which element each detail became, and “Check before you use it” for anything missing or doubtful.", "Compare the entry with the source and your instructor's requirements, then copy it."] },
        { type: "paragraph", text: "The generator runs entirely in your browser. Nothing you enter is sent anywhere or saved, and it does not look up details from a DOI or URL: it formats exactly what you give it." },
        { type: "links", items: [{ label: "Open the MLA Citation Generator", href: "/tools/mla-citation-generator" }, { label: "Not sure MLA is the right style? Try the Citation Style Finder", href: "/tools/citation-style-finder" }] },
      ],
    },
    {
      id: "limitations",
      heading: "Limitations of automated citation",
      blocks: [
        { type: "paragraph", text: "A generator applies rules consistently, but some MLA decisions depend on judgment that only the writer can make. Treat its output as a careful first draft that you check." },
        { type: "list", items: ["Title case. MLA capitalizes the first, last and principal words of a title, but proper nouns, terms and titles in other languages need a person's judgment, so titles are used as you type them.", "Short titles. Without an author, a long title should be shortened in text to at least its first noun; where to stop is a judgment, so the full title is shown.", "Several works. Ordering a Works Cited list, replacing a repeated author's name in consecutive entries, and adding short titles to tell apart several works by one author all depend on the whole list.", "Other source types and contributors, such as chapters, editors, translators, newspapers and films, need elements this generator doesn't support yet.", "Accuracy. A perfectly formatted entry can still contain a wrong date or a misspelled name. Formatting is not verification."] },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "The MLA Handbook is the authority for MLA style, and the MLA Style Center publishes the MLA's own answers to questions about it. Your instructor's or publisher's requirements come first where they differ." },
        { type: "references", ids: ["mla-2021"] },
        { type: "links", items: [{ label: "MLA Style Center", href: "https://style.mla.org/" }, { label: "APA 7 Citations and References", href: "/learn/apa-7-citations-and-references" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "Does an MLA in-text citation include the year?", answer: "No. MLA in-text citations give the author and the page, such as (Baron 194). The year appears in the Works Cited entry." },
    { question: "Do I write p. before page numbers in MLA?", answer: "Not in an in-text citation: (Smith 24). In the Works Cited list, a page range that locates a work in its container takes p. or pp." },
    { question: "What if my source has no date?", answer: "Leave the date out; MLA does not use n.d. For a web page, you may add the date you accessed it at the end of the entry." },
    { question: "When do I use et al.?", answer: "For three or more authors, in the Works Cited entry and parenthetical citations. In your own sentences, write “and others” or name every author." },
    { question: "Does a DOI mean the entry is correct?", answer: "No. A DOI identifies the work, but the authors, title, dates and numbers you entered still need checking against the source." },
  ],
  relatedToolIds: ["mla-citation-generator", "citation-style-finder"],
  relatedGuideSlugs: ["how-to-cite-a-website", "reference-list-or-bibliography", "how-to-avoid-plagiarism", "reference-checker"],
};
