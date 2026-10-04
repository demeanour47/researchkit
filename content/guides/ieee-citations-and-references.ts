import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Rules are taken from the IEEE Reference Guide, version 3.28.2025 (IEEE Publication
 * Operations), linked from the IEEE Author Center. Examples credited to IEEE reproduce
 * examples in that guide; the others are synthetic teaching examples. The guide's tests
 * check that every example the generator can produce matches its output exactly.
 */
export const ieeeCitationsAndReferences: Guide = {
  slug: "ieee-citations-and-references",
  title: "IEEE Citations and References",
  description:
    "Learn IEEE's numeric citation style: how [1], [2] and [3] point to a numbered reference list in citation order, and how to cite books, journal articles, conference papers and web pages.",
  summary:
    "IEEE style cites sources by number. The first source you cite is [1], the next new source [2], and so on; the reference list at the end gives the sources in that order, each with its number.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-ieee",
      heading: "What IEEE style is",
      blocks: [
        { type: "paragraph", text: "IEEE style is the citation style of the Institute of Electrical and Electronics Engineers, set out for authors in the IEEE Reference Guide and the IEEE Editorial Style Manual. Its references give authors' initials before their surnames, abbreviate journal and conference names, and are cited in the text by number." },
        { type: "styles", styles: ["ieee"] },
      ],
    },
    {
      id: "where-used",
      heading: "Where IEEE style is used",
      blocks: [
        { type: "paragraph", text: "IEEE style is used across electrical and electronic engineering, computer science, telecommunications and related technical fields, in IEEE's own journals and conferences and in many university departments. Much of the literature in these fields is published in conference proceedings, which is why conference papers are a central kind of reference." },
      ],
    },
    {
      id: "numeric-systems",
      heading: "Numeric citation systems",
      blocks: [
        { type: "paragraph", text: "Author-based styles such as APA, MLA and Chicago identify a source in the text by its author, and order the reference list alphabetically. Numeric styles identify a source by a number that leads to its entry in a numbered list. The number says nothing about the source itself; it only links the citation to the entry." },
        { type: "table", caption: "How a citation leads to its source", columns: ["Style", "In the text", "List at the end"], rows: [["IEEE (numeric)", "[1]", "Numbered in order of first citation"], ["APA (author-date)", "(Klaus & Horn, 1986)", "Alphabetical by author"], ["MLA (author-page)", "(Klaus and Horn 24)", "Alphabetical by author"]] },
      ],
    },
    {
      id: "citation-numbering",
      heading: "How IEEE numbering works",
      blocks: [
        { type: "paragraph", text: "Give the first source you cite the number 1, the next new source 2, and so on. A source keeps its number every time it is cited again, however much later. There must be only one reference with each number, and each reference only one number." },
        { type: "list", ordered: true, items: ["The first sentence citing a source gives it [1].", "A different source cited next becomes [2].", "Citing the first source again uses [1] again, not a new number.", "The reference list gives entries in that order: [1], [2], [3]."] },
      ],
    },
    {
      id: "reference-order",
      heading: "Reference order",
      blocks: [
        { type: "paragraph", text: "An IEEE reference list is in numerical order, which is the order of first citation. It is never sorted alphabetically by author. Reference numbers are set flush left in square brackets, forming a column of their own beside the entries." },
        { type: "paragraph", text: "Because the order comes from your paper, adding or removing a citation can change later numbers. When you edit, renumber the references and the citations in the text together." },
      ],
    },
    {
      id: "single-citations",
      heading: "Citing one reference",
      blocks: [
        { type: "paragraph", text: "A citation is the reference number in square brackets, on the line (not superscript) and inside the sentence's punctuation. It can be read as a noun or as a footnote number, and it may follow the authors' names." },
        { type: "list", items: ["According to [1], …", "as demonstrated in [2].", "Smith [4] and Brown and Jones [5] showed …", "Wood et al. [7] found … (et al. from three authors)"] },
      ],
    },
    {
      id: "multiple-citations",
      heading: "Citing several references",
      blocks: [
        { type: "paragraph", text: "When one statement draws on several sources, give each number in its own brackets, separated by commas. IEEE's examples list them in ascending order." },
        { type: "list", items: ["[1], [3]", "as shown by Brown [4], [5]", "as mentioned earlier [2], [4], [5], [6], [7], [9]"] },
      ],
    },
    {
      id: "citation-ranges",
      heading: "Consecutive numbers and ranges",
      blocks: [
        { type: "paragraph", text: "The current IEEE Reference Guide writes every number out: what was once written [1]–[4] is now [1], [2], [3], [4]. Earlier IEEE guidance joined consecutive numbers with an en dash, as in [2], [4]–[7], [9], and some publishers and instructors still ask for that form." },
        { type: "table", caption: "The same citation in both forms", columns: ["Numbers cited", "Current IEEE Reference Guide", "Earlier IEEE guidance"], rows: [["2, 4, 5, 6, 7, 9", "[2], [4], [5], [6], [7], [9]", "[2], [4]–[7], [9]"], ["1, 2, 3, 4", "[1], [2], [3], [4]", "[1]–[4]"], ["4, 5", "[4], [5]", "[4], [5]"]] },
        { type: "paragraph", text: "The generator uses the current form unless you choose the earlier one. In the earlier form it joins three or more consecutive numbers, since IEEE's examples write two consecutive numbers separately." },
      ],
    },
    {
      id: "books",
      heading: "Books",
      blocks: [
        { type: "paragraph", text: "Give the authors, the italic title, any edition after the first, then the city, state for U.S. cities, and country of publication, a colon, the publisher and the year." },
        { type: "table", caption: "Book references", columns: ["Situation", "Reference"], rows: [["Two authors (IEEE)", "B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986."], ["Organization as author (after IEEE, which also names the division)", "Westinghouse Electric Corporation, Integrated Electronic Systems. Englewood Cliffs, NJ, USA: Prentice-Hall, 1970."]] },
        { type: "paragraph", text: "Tables on this page can't show italics: book, journal and conference names are italicized in real references." },
      ],
    },
    {
      id: "journal-articles",
      heading: "Journal articles",
      blocks: [
        { type: "paragraph", text: "Give the authors, the article title in quotation marks with a comma inside them, the italic journal name, then vol., no., pp., the month and year, and the DOI. Page ranges are given in full. When a journal numbers articles instead of paginating them, the article number follows the date." },
        { type: "table", caption: "Journal references (IEEE)", columns: ["Situation", "Reference"], rows: [["With a DOI", "M. M. Chiampi and L. L. Zilberti, “Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure,” IEEE Trans. Biomed. Eng., vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315."], ["Three authors, online", "W. P. Risk, G. S. Kino, and H. J. Shaw, “Fiber-optic frequency shifter using a surface acoustic wave incident at an oblique angle,” Opt. Lett., vol. 11, no. 2, pp. 115–117, Feb. 1986. [Online]. Available: http://ol.osa.org/abstract.cfm?URI=ol-11-2-115"], ["Article number", "J. Zhang and N. Tansu, “Optical gain and laser characteristics of InGaN quantum wells on ternary InGaN substrates,” IEEE Photon. J., vol. 5, no. 2, Apr. 2013, Art. no. 2600111."]] },
        { type: "paragraph", text: "IEEE abbreviates journal names, as in IEEE Trans. Biomed. Eng. and Opt. Lett., using its own lists; one-word titles such as Science and Nature are never abbreviated. The generator uses the name you enter, so enter the abbreviation yourself when it is required." },
      ],
    },
    {
      id: "conference-papers",
      heading: "Conference papers",
      blocks: [
        { type: "paragraph", text: "A paper in conference proceedings gives the authors and paper title, then “in” and the italic, abbreviated name of the proceedings, the location if given, the date, the pages and the DOI." },
        { type: "table", caption: "Conference references (IEEE)", columns: ["Situation", "Reference"], rows: [["With a location", "D. Sarkar and K. V. Srivastava, “SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function,” in Proc. Int. Symp. Electromagn. Theory, Hiroshima, Japan, 2013, pp. 466–469."], ["With a DOI", "G. Veruggio, “The EURON roboethics roadmap,” in Proc. Humanoids ’06: 6th IEEE-RAS Int. Conf. Humanoid Robots, 2006, pp. 612–617, doi: 10.1109/ICHR.2006.321337."]] },
        { type: "paragraph", text: "Conference names use standard abbreviations such as Proc. (Proceedings), Int. (International), Conf. (Conference) and Symp. (Symposium). The IEEE guide also gives conference dates with their days, as in Mar. 20–22, 2005; the generator gives the month and year." },
      ],
    },
    {
      id: "web-pages",
      heading: "Web pages",
      blocks: [
        { type: "paragraph", text: "A website reference separates its parts with periods: the authors, the page title in quotation marks, the website's name, the date you accessed it, and “[Online]. Available:” with the URL." },
        { type: "table", caption: "A web page (IEEE)", columns: ["Reference"], rows: [["J. Smith. “Obama inaugurated as President.” CNN.com. Accessed: Feb. 1, 2009. [Online]. Available: http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html"]] },
      ],
    },
    {
      id: "authors",
      heading: "Authors",
      blocks: [
        { type: "paragraph", text: "Give each author's initials before the surname, and never invert a name: J. K. Author, J.-L. Dessalles. List all authors up to six, with a comma before “and” from three: L. Li, J. Yang, and C. Li. With more than six, give the first author followed by et al.: J. Yanamadala et al." },
        { type: "table", caption: "Author lists", columns: ["Authors", "Reference"], rows: [["One", "B. Klaus"], ["Two", "B. Klaus and P. Horn"], ["Three (IEEE)", "W. P. Risk, G. S. Kino, and H. J. Shaw"], ["More than six", "M. Ito et al."]] },
      ],
    },
    {
      id: "organization-authors",
      heading: "Organization authors",
      blocks: [
        { type: "paragraph", text: "An organization that is the author is written in full in the author position, as in the Westinghouse example above. Without a person or organization as author, the reference begins with the title." },
      ],
    },
    {
      id: "doi",
      heading: "DOIs",
      blocks: [
        { type: "paragraph", text: "IEEE writes a DOI as “doi:” followed by the DOI, not as a link: doi: 10.1109/TBME.2011.2158315. A reference ending with a DOI ends with a period. Early-access articles should always give their DOI, since it doesn't change." },
      ],
    },
    {
      id: "urls",
      heading: "URLs",
      blocks: [
        { type: "paragraph", text: "A URL follows “[Online]. Available:” and has no period after it. When a reference has a DOI or an access date as well as a URL, the DOI or date comes first, followed by a period, then the URL." },
        { type: "list", items: ["DOI and URL: … 1986, doi: 10.1000/xyz123. [Online]. Available: https://example.org/book", "URL only: … Feb. 1986. [Online]. Available: http://ol.osa.org/abstract.cfm?URI=ol-11-2-115"] },
      ],
    },
    {
      id: "locators",
      heading: "Citing part of a reference",
      blocks: [
        { type: "paragraph", text: "To point to a particular part of a reference, put it inside the brackets after a comma." },
        { type: "list", items: ["Pages: [3, pp. 5–10]; one page: [3, p. 24]", "Chapter: [3, Ch. 2]", "Section: [3, Sect. 4.5]", "IEEE also cites figures, equations, theorems and the like: [3, Fig. 1], [3, eq. (2)], [3, Thm. 1]. The generator formats pages, chapters and sections."] },
      ],
    },
    {
      id: "reference-numbering",
      heading: "Keeping numbers right as you write",
      blocks: [
        { type: "paragraph", text: "Numbers depend on the order of first citation, so moving a paragraph or adding a source can shift them. Many writers number references only at the end, or use their word processor's or reference manager's citation tools, which renumber automatically." },
        { type: "list", items: ["Check that the first citation in the paper is [1] and that new numbers appear in order.", "Check that every number in the text has an entry, and every entry is cited.", "After editing, renumber the list and the citations together."] },
      ],
    },
    {
      id: "duplicate-sources",
      heading: "Sources cited more than once",
      blocks: [
        { type: "paragraph", text: "A source cited again keeps its first number; never give it a second entry. IEEE doesn't use ibid. or op. cit.: cite the earlier number, with a new page if needed, such as [3, pp. 5–10]." },
        { type: "paragraph", text: "The generator formats one source at a time, so it can't see whether a source is already in your list. Before giving a source a new number, check your list for it." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Mistakes and corrections", columns: ["Mistake", "Correct IEEE"], rows: [["Sorting the reference list alphabetically", "Numbering in order of first citation"], ["A new number for a source cited again", "Its first number again"], ["Superscript numbers", "On the line in brackets: [1]"], ["(Klaus & Horn, 1986)", "[1], or Klaus and Horn [1]"], ["Klaus, B. and Horn, P.", "B. Klaus and P. Horn"], ["[1, 24]", "[1, p. 24]"], ["https://doi.org/10.1109/…", "doi: 10.1109/…"], ["Ibid.", "The earlier number"]] },
      ],
    },
    {
      id: "ieee-vs-apa",
      heading: "IEEE compared with APA",
      blocks: [
        { type: "paragraph", text: "APA is an author-date style: (Klaus & Horn, 1986) in the text and an alphabetical reference list, with the year after the authors. IEEE cites [1] and lists references by number in citation order, with the year near the end. APA inverts every author's name (Klaus, B., & Horn, P.); IEEE never inverts and uses “and”, not an ampersand." },
        { type: "links", items: [{ label: "APA 7 Citations and References", href: "/learn/apa-7-citations-and-references" }] },
      ],
    },
    {
      id: "ieee-vs-mla",
      heading: "IEEE compared with MLA",
      blocks: [
        { type: "paragraph", text: "MLA cites the author and page, (Klaus and Horn 24), with an alphabetical Works Cited list and full given names. IEEE cites the number and, when needed, the page inside the brackets, [1, p. 24], with initials and a numbered list." },
        { type: "links", items: [{ label: "MLA 9 Citation and Works Cited Guide", href: "/learn/mla-9-citations-and-works-cited" }] },
      ],
    },
    {
      id: "ieee-vs-chicago",
      heading: "IEEE compared with Chicago",
      blocks: [
        { type: "paragraph", text: "Chicago's author-date system cites (Klaus and Horn 1986, 24), and its notes-and-bibliography system uses numbered notes, but those numbers count notes, not sources: a source cited twice gets a new note each time. In IEEE, the number belongs to the source and is reused every time it is cited." },
        { type: "links", items: [{ label: "Chicago Author-Date Citations", href: "/learn/chicago-author-date-citations" }, { label: "Chicago Notes and Bibliography", href: "/learn/chicago-notes-bibliography" }] },
      ],
    },
    {
      id: "consistency",
      heading: "Keeping citations consistent in a research paper",
      blocks: [
        { type: "list", items: ["Choose IEEE at the start, and confirm your venue's template and instructions; IEEE conferences and journals publish templates.", "Record full details for every source as you read, including DOIs and page ranges.", "Use one form for consecutive numbers throughout: the current written-out form, unless your venue asks for ranges.", "Abbreviate journal and conference names consistently, using IEEE's lists.", "Before submitting, check numbering, order and that every citation has its entry."] },
      ],
    },
    {
      id: "using-the-generator",
      heading: "Using the ResearchKit IEEE Citation Generator",
      blocks: [
        { type: "list", ordered: true, items: ["Enter the reference number the source has in your paper's citation order.", "Choose whether it is a book, a journal article, a conference paper or a web page, and enter its details as the source gives them.", "Add a page, chapter or section if you are citing part of it.", "Copy the citation into your text and the numbered entry into your reference list.", "To cite several references at once, enter their numbers in the section for several references.", "Read “Validation and notes” and compare the result with the source."] },
        { type: "paragraph", text: "The generator formats citation text. It doesn't see your paper, so it can't assign or update numbers, sort your list or find sources cited twice. Everything runs in your browser; nothing you enter is sent anywhere or saved." },
        { type: "links", items: [{ label: "Open the IEEE Citation Generator", href: "/tools/ieee-citation-generator" }] },
      ],
    },
    {
      id: "limitations",
      heading: "Limitations of automated citation",
      blocks: [
        { type: "list", items: ["Reference numbers depend on your whole paper; the generator uses the number you give.", "IEEE's journal and conference abbreviations come from its own lists, which the generator doesn't apply.", "Book chapters, edited books, editors, translators, theses, reports, standards, patents and datasets aren't supported yet.", "Conference dates with day ranges are given as month and year.", "A perfectly formatted reference can still contain a wrong date or a misspelled name. Formatting is not verification."] },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "The IEEE Reference Guide is the authority for IEEE references, published by IEEE Publication Operations and linked from the IEEE Author Center. Your venue's or instructor's requirements come first where they differ." },
        { type: "references", ids: ["ieee-2025"] },
        { type: "links", items: [{ label: "IEEE Author Center: editorial style", href: "https://journals.ieeeauthorcenter.ieee.org/your-role-in-article-production/ieee-editorial-style-manual/" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "How are IEEE references numbered?", answer: "In the order sources are first cited in your paper. A source keeps its number every time it is cited." },
    { question: "Should I write [1]–[4] or [1], [2], [3], [4]?", answer: "The current IEEE Reference Guide writes every number out: [1], [2], [3], [4]. Earlier guidance used [1]–[4], which some venues still ask for." },
    { question: "How do I cite a specific page?", answer: "Inside the brackets after a comma: [3, p. 24], or [3, pp. 5–10] for a range." },
    { question: "Is the reference list alphabetical?", answer: "No. It is in numerical order, which is the order of first citation." },
    { question: "Does the generator number my references?", answer: "No. It can't see your paper, so it uses the number you enter. Word processors and reference managers can number references automatically." },
  ],
  relatedToolIds: ["ieee-citation-generator", "citation-style-finder"],
};
