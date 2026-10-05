import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Harvard has no single authority. This guide teaches ResearchKit's defined Harvard
 * profile, based on Cite Them Right, 13th edition (Pears and Shields, 2025; ADR-0008),
 * whose rules are taken from university library guides that reproduce it. Examples
 * credited to a university reproduce that university's Cite Them Right guide; the
 * others are synthetic teaching examples. The guide's tests check that every example
 * the generator can produce matches the generator's output exactly, including the
 * APA, Chicago and IEEE comparisons, which come from ResearchKit's other generators.
 */
export const harvardCitationsAndReferences: Guide = {
  slug: "harvard-citations-and-references",
  title: "Harvard Citations and References",
  description:
    "Learn Harvard referencing: what it is, why versions differ between universities, how in-text citations such as (Smith, 2015, p. 23) lead to a reference list, and how to reference books, journal articles and web pages.",
  summary:
    "Harvard is a family of author-date referencing styles. A citation in the text gives the author's surname and the year, such as (Smith, 2015, p. 23), and an alphabetical reference list gives the full details. Universities publish their own versions, so this guide teaches one defined profile, based on Cite Them Right, and shows where versions differ.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-is-harvard",
      heading: "What Harvard referencing is",
      blocks: [
        { type: "paragraph", text: "Harvard referencing is an author-date system. Wherever you use a source's words, ideas or data, you cite it in the text by the author's surname and the year of publication. At the end of your work, a reference list gives the full details of every source you cited, in alphabetical order by author." },
        { type: "paragraph", text: "The name comes from Harvard University, where the author-date method is said to have been used in the nineteenth century, but Harvard University does not publish or maintain a Harvard style. There is no official manual." },
        { type: "styles", styles: ["harvard"] },
      ],
    },
    {
      id: "harvard-variants",
      heading: "Why Harvard varies between institutions",
      blocks: [
        { type: "paragraph", text: "Because no single body defines Harvard, universities, departments and publishers write their own versions. They agree on the essentials, the author and year in the text and an alphabetical reference list, and differ in the details." },
        { type: "list", items: ["Whether the year is followed by a full stop, and whether a comma separates the name and year in the text.", "Whether the place of publication is given for books.", "Whether et al. may be used in the reference list, and from how many authors.", "Whether a DOI is introduced with “Available at:” and whether an access date follows it.", "How titles are capitalized, and whether a title standing in for an author is in italics or quotation marks."] },
        { type: "paragraph", text: "A reference that is correct under one university's Harvard can be marked as wrong under another's. That is why the first rule of Harvard is to find out which version you are expected to use." },
      ],
    },
    {
      id: "researchkit-profile",
      heading: "ResearchKit's Harvard profile",
      blocks: [
        { type: "paragraph", text: "ResearchKit's guide and generator follow one defined Harvard author-date profile, based on Cite Them Right, 13th edition, by Richard Pears and Graham Shields (2025). Cite Them Right is the Harvard guide many universities in the United Kingdom adopt or adapt. It is published by subscription, so ResearchKit took its rules from university library guides that reproduce it, and checked them against each other." },
        { type: "list", items: ["Authors are family names and initials; every author is listed in the reference.", "The year follows the author in round brackets, with no full stop after it, or “no date” takes its place.", "Books give the publisher without a place of publication, as the 13th edition does.", "A DOI or URL follows “Available at:”; a URL is followed by the date you accessed it.", "Page numbers take “p.” or “pp.” in the reference and in citations."] },
        { type: "paragraph", text: "The profile does not reproduce any university's version, and it does not claim to be the only correct Harvard. Where your university's guide differs, follow your university's guide." },
      ],
    },
    {
      id: "in-text-citations",
      heading: "In-text citations",
      blocks: [
        { type: "paragraph", text: "Cite a source in the text every time you use its words, ideas or data, whether you quote, paraphrase or summarize. A citation gives the surname of the author, or the organization or title that stands in for one, and the year. Add a page number when you quote or refer to a specific passage." },
        { type: "paragraph", text: "There are two ways to write a citation, depending on whether the author's name is part of your sentence. Both point to the same reference." },
        { type: "table", caption: "Two citations of the same source (University of Wolverhampton)", columns: ["Form", "Citation"], rows: [["Parenthetical", "(Smith, 2015, p. 23)"], ["Narrative", "Smith (2015, p. 23)"]] },
      ],
    },
    {
      id: "parenthetical-citations",
      heading: "Parenthetical citations",
      blocks: [
        { type: "paragraph", text: "A parenthetical citation puts the author, year and any page in round brackets, separated by commas, usually at the end of the sentence or clause it supports, before the full stop." },
        { type: "list", items: ["(Smith, 2015) cites the work as a whole.", "(Smith, 2015, p. 23) points to page 23.", "(Jenkins, 2019, pp. 325–327) points to a range of pages.", "(Cool Antarctica, no date) cites a web page with no date."] },
      ],
    },
    {
      id: "narrative-citations",
      heading: "Narrative citations",
      blocks: [
        { type: "paragraph", text: "A narrative citation makes the author part of your sentence. The name stays outside the brackets, and the year, with any page, follows it in brackets." },
        { type: "list", items: ["Smith (2015, p. 23) argues that …", "According to Hughes and Ali (2022, p. 6), …", "Thaker, Smith and Leiserowitz (2020, p. 2485) found that …"] },
        { type: "paragraph", text: "Use the form that reads best. A narrative citation puts the emphasis on who said something; a parenthetical one on what was said." },
      ],
    },
    {
      id: "reference-lists",
      heading: "Reference lists",
      blocks: [
        { type: "paragraph", text: "The reference list, headed “Reference list” or “References”, comes at the end of your work and gives full details of every source you cited, and only those. A bibliography, which some assignments ask for, also includes works you read but didn't cite." },
        { type: "list", items: ["Begin each reference with what the citation names: the author, the organization or, with neither, the title.", "Follow it with the year in round brackets, so the citation and reference match.", "Use one list for every kind of source; don't separate books from articles or web pages.", "Give each reference a hanging indent if your institution asks for one."] },
      ],
    },
    {
      id: "one-author",
      heading: "One author",
      blocks: [
        { type: "paragraph", text: "Give the family name, a comma, then the initials with full stops. Initials are written without spaces between them. In the text, use the family name only." },
        { type: "table", caption: "One author", columns: ["Where", "Example"], rows: [["Reference (University of Cumbria)", "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press."], ["Reference with two initials (University of the West of Scotland)", "Speight, J.G. (2019) Global climate change demystified. 2nd edn. Wiley."], ["Citation", "(Cottrell, 2019)"]] },
      ],
    },
    {
      id: "two-authors",
      heading: "Two authors",
      blocks: [
        { type: "paragraph", text: "Join two authors with “and”, both in the reference and in the text. Harvard writes the word; an ampersand (&) belongs to APA." },
        { type: "table", caption: "Two authors", columns: ["Where", "Example"], rows: [["Reference", "Pears, R. and Shields, G. (2025) Cite them right: the essential referencing guide. 13th edn. Bloomsbury Academic."], ["Citation (University of Wolverhampton)", "(Hughes and Ali, 2022, p. 6)"]] },
      ],
    },
    {
      id: "multiple-authors",
      heading: "Three or more authors",
      blocks: [
        { type: "paragraph", text: "In the reference list, the profile lists every author in the order the source gives, separated by commas, with “and” before the last and no comma before “and”. In the text, three authors are all named; four or more become the first author followed by “et al.”, Latin for “and others”." },
        { type: "table", caption: "Three or more authors", columns: ["Authors", "Reference list", "Citation"], rows: [["Three (University of Cumbria)", "Thaker, J., Smith, N. and Leiserowitz, A. (2020) …", "(Lloyd, Singh and Alonso, 2018, p. 14)"], ["Four or more (University of Wolverhampton)", "Every author is listed.", "(Gerrard et al., 2005, p. 8)"]] },
        { type: "paragraph", text: "Some institutions allow et al. in the reference list as well, usually from four authors; Cite Them Right's own guidance is to list all of them. Some write et al. in italics. Follow your institution's guide." },
      ],
    },
    {
      id: "organization-authors",
      heading: "Organizations as authors",
      blocks: [
        { type: "paragraph", text: "When a work is produced by an organization, such as a government department, a company or a charity, and no person is named, the organization is the author. Write its name in full, in both the reference and the citation." },
        { type: "table", caption: "An organization as author", columns: ["Where", "Example"], rows: [["Reference (University of Cumbria)", "Department for Education (2025) Working together to safeguard children. Available at: https://www.gov.uk/government/publications/working-together-to-safeguard-children--2 (Accessed: 20 August 2025)."], ["Citation (University of Wolverhampton)", "(University of Wolverhampton, 2015)"]] },
      ],
    },
    {
      id: "no-author",
      heading: "Sources with no author",
      blocks: [
        { type: "paragraph", text: "Check carefully before deciding a source has no author: an organization responsible for it is usually the author. When there is genuinely no person or organization, the reference begins with the title, followed by the year, and the citation uses the title." },
        { type: "table", caption: "A journal article with no author (University of the West of Scotland)", columns: ["Where", "Example"], rows: [["Reference", "‘Climate change could be newest social determinant of health’ (2023) Hospital Case Management, 31(7), pp. 1–16. Available at: https://search.ebscohost.com/ (Accessed: 31 July 2023)."], ["Citation", "(‘Climate change could be newest social determinant of health’, 2023)"]] },
        { type: "paragraph", text: "Guides agree that the title replaces the author but differ on its styling in the text: many put every title in italics. ResearchKit styles it as in the reference, italic for books and web pages and in quotation marks for articles, so readers can match the two. Don't write “Anonymous” unless the source does." },
      ],
    },
    {
      id: "books",
      heading: "Books",
      blocks: [
        { type: "paragraph", text: "Pattern: Author (Year) Title. Edition. Publisher. The title is in italics and in sentence case. A first edition isn't mentioned; later editions are abbreviated “edn”. The 13th edition of Cite Them Right dropped the place of publication, so only the publisher is given." },
        { type: "table", caption: "Book references", columns: ["Situation", "Reference"], rows: [["One author, later edition (University of Cumbria)", "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press."], ["Two authors", "Pears, R. and Shields, G. (2025) Cite them right: the essential referencing guide. 13th edn. Bloomsbury Academic."], ["E-book with a DOI (synthetic example)", "Ahmed, R. (2024) Coastal erosion. Example Press. Available at: https://doi.org/10.5555/example.2024"]] },
        { type: "paragraph", text: "An e-book read online adds “Available at:” and its DOI, or its URL and the date you accessed it." },
      ],
    },
    {
      id: "journal-articles",
      heading: "Journal articles",
      blocks: [
        { type: "paragraph", text: "Pattern: Author (Year) ‘Article title’, Journal Title, Volume(Issue), pp. first–last. Available at: DOI. The article title is in single quotation marks and sentence case, followed by a comma; the journal title is in italics, written as the journal writes it. The issue follows the volume in round brackets with no space." },
        { type: "table", caption: "Journal article references", columns: ["Situation", "Reference"], rows: [["One author, with a DOI (Robert Gordon University)", "Chen, Y. (2023) ‘Addressing uncertainties through improved reserve product design’, IEEE Transactions on Power Systems, 38(4), pp. 3911–3923. Available at: https://doi.org/10.1109/TPWRS.2022.3200697"], ["Three authors (University of Cumbria)", "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574"], ["Article number in place of pages (De Montfort University)", "Iacobellis, G. (2020) ‘COVID-19 and diabetes: can DPP4 inhibition play a role?’, Diabetes Research and Clinical Practice, 162, article 108125."]] },
        { type: "paragraph", text: "Some journals publish online without page numbers and give each article a number instead; write “article” and the number where the pages would go. The Cumbria example is shown with the profile's punctuation: an en dash in the page range and no full stop after the DOI." },
      ],
    },
    {
      id: "web-pages",
      heading: "Web pages",
      blocks: [
        { type: "paragraph", text: "Pattern: Author (Year) Title of page. Available at: URL (Accessed: date). The page title is in italics. The year is the year the page was published or last updated; without one, write “no date”. The website's name isn't part of the reference; when no person is named, the organization responsible for the page is the author." },
        { type: "table", caption: "Web page references (University of the West of Scotland)", columns: ["Situation", "Reference"], rows: [["Named author", "Sneed, A. (2019) The reason Antarctica is melting. Available at: https://www.scientificamerican.com/ (Accessed: 23 July 2020)."], ["Organization, no date", "Cool Antarctica (no date) Antarctica and global warming. Available at: https://coolantarctica.com/ (Accessed: 23 July 2020)."]] },
      ],
    },
    {
      id: "doi",
      heading: "DOIs",
      blocks: [
        { type: "paragraph", text: "A DOI (Digital Object Identifier) is a permanent identifier for an article, book or other work. It keeps leading to the work even when a publisher's website changes, so it is preferred to a URL." },
        { type: "list", items: ["Write the DOI as a link: https://doi.org/10.1111/risa.13574, after “Available at:”.", "No access date is needed with a DOI, because the DOI doesn't change.", "Don't add a full stop after the DOI; a reader could mistake it for part of the identifier.", "If you have both a DOI and a URL, give the DOI only."] },
      ],
    },
    {
      id: "urls",
      heading: "URLs",
      blocks: [
        { type: "paragraph", text: "Give a URL for a web page, and for an article or e-book you read online that has no DOI. Copy the full address from your browser, including https://, and place it after “Available at:”." },
        { type: "list", items: ["Give the address of the page itself, not a search results page, unless that is the only stable address, as with some library databases.", "A URL is always followed by the date you accessed it, in brackets.", "Don't shorten a long URL or break it with a hyphen."] },
      ],
    },
    {
      id: "access-dates",
      heading: "Access dates",
      blocks: [
        { type: "paragraph", text: "Web content can change or disappear, so Harvard records when you viewed it. The access date follows the URL in round brackets, with the word “Accessed”, a colon and the full date, day first: (Accessed: 23 July 2020). The reference ends with a full stop after the bracket." },
        { type: "paragraph", text: "Note the date as you read the source; it is much harder to reconstruct later. An access date is not needed with a DOI." },
      ],
    },
    {
      id: "page-locators",
      heading: "Page numbers in citations",
      blocks: [
        { type: "paragraph", text: "Add a page number to a citation when you quote, or when you refer to a specific passage, table or figure. Use “p.” for one page and “pp.” for a range, written in full with an en dash." },
        { type: "table", caption: "Page numbers", columns: ["Situation", "Parenthetical", "Narrative"], rows: [["One page (University of Wolverhampton)", "(Smith, 2015, p. 23)", "Smith (2015, p. 23)"], ["A range of pages", "(Jenkins, 2019, pp. 325–327)", "Jenkins (2019, pp. 325–327)"]] },
        { type: "paragraph", text: "For a source without page numbers, such as a web page, cite the author and year only. Some guides allow paragraph or section numbers; their forms vary, so the generator formats page numbers only." },
      ],
    },
    {
      id: "same-author-same-year",
      heading: "Same author, same year",
      blocks: [
        { type: "paragraph", text: "When you cite two or more works by the same author from the same year, add a lowercase letter straight after the year, in both the reference and every citation: 2024a, 2024b. Many guides assign the letters in alphabetical order of the titles; some in the order you first cite the works. Check your guide." },
        { type: "table", caption: "Two works by one author in one year (synthetic examples)", columns: ["Reference", "Citation"], rows: [["Ahmed, R. (2024a) Coastal erosion. Example Press.", "(Ahmed, 2024a)"], ["Ahmed, R. (2024b) Flood risk. Example Press.", "(Ahmed, 2024b)"]] },
        { type: "paragraph", text: "Only your whole reference list shows whether you need letters, so the generator doesn't assign them. Enter the letter yourself and it is added to the reference and both citations." },
      ],
    },
    {
      id: "reference-order",
      heading: "Ordering the reference list",
      blocks: [
        { type: "paragraph", text: "These rules follow the University of Wolverhampton's guide to Cite Them Right." },
        { type: "list", items: ["Arrange references in alphabetical order by the first word of each entry: the author's family name, the organization's name or, without an author, the title.", "Several works by the same author go in date order, earliest first.", "Works by the same author in the same year go in the order of their letters: 2024a, then 2024b.", "A single author comes before a group led by the same author: Smith, A. (2020) before Smith, A. and Jones, B. (2018)."] },
        { type: "paragraph", text: "The generator formats one reference at a time and doesn't sort a list; most word processors can sort paragraphs alphabetically." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common Harvard mistakes",
      blocks: [
        { type: "table", caption: "Common mistakes in the profile", columns: ["Mistake", "Correct"], rows: [["(Smith 2015 p23)", "(Smith, 2015, p. 23)"], ["Smith & Jones (2020)", "Smith and Jones (2020)"], ["Smith, A. (2015). The title.", "Smith, A. (2015) The title."], ["pp. 2481-97", "pp. 2481–2497"], ["Available at: https://doi.org/10.1111/risa.13574 (Accessed: 3 May 2024).", "Available at: https://doi.org/10.1111/risa.13574"], ["Reference list split into books, articles and websites", "One alphabetical list"]] },
        { type: "paragraph", text: "Other frequent mistakes: citing a source in the text but leaving it out of the reference list, or the reverse; a year in the citation that doesn't match the reference; and mixing two versions of Harvard in one piece of work." },
      ],
    },
    {
      id: "harvard-vs-apa",
      heading: "Harvard and APA",
      blocks: [
        { type: "paragraph", text: "APA 7 is also an author-date style, and for one author the citation can be identical: (Cottrell, 2019). The differences are in the details, and they are easy to mix up." },
        { type: "table", caption: "The same sources in Harvard and APA, from ResearchKit's generators", columns: ["", "Harvard", "APA 7"], rows: [["Book", "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press.", "Cottrell, S. (2019). The study skills handbook (5th ed.). Red Globe Press."], ["Article", "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574", "Thaker, J., Smith, N., & Leiserowitz, A. (2020). Global warming risk perceptions in India. Risk Analysis, 40(12), 2481–2497. https://doi.org/10.1111/risa.13574"], ["Three authors in text", "(Thaker, Smith and Leiserowitz, 2020)", "(Thaker et al., 2020)"]] },
        { type: "paragraph", text: "APA uses “&”, puts a full stop after the year, gives the edition in brackets, writes no “pp.” in a journal reference, and uses et al. from three authors." },
        { type: "links", items: [{ label: "APA 7 Citations and References", href: "/learn/apa-7-citations-and-references" }] },
      ],
    },
    {
      id: "harvard-vs-chicago",
      heading: "Harvard and Chicago author-date",
      blocks: [
        { type: "paragraph", text: "Chicago's author-date system follows the same idea as Harvard, with American conventions and different punctuation." },
        { type: "table", caption: "The same article in Harvard and Chicago author-date, from ResearchKit's generators", columns: ["", "Harvard", "Chicago author-date"], rows: [["Reference", "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574", "Thaker, Jagadish, Nicholas Smith, and Anthony Leiserowitz. 2020. “Global Warming Risk Perceptions in India.” Risk Analysis 40 (12): 2481–97. https://doi.org/10.1111/risa.13574."], ["Citation", "(Thaker, Smith and Leiserowitz, 2020, p. 2485)", "(Thaker et al. 2020, 2485)"]] },
        { type: "paragraph", text: "Chicago gives full given names, uses double quotation marks and headline-style capitals, puts no comma between name and year, writes no “p.”, and shortens page ranges." },
        { type: "links", items: [{ label: "Chicago Author-Date Citations", href: "/learn/chicago-author-date-citations" }] },
      ],
    },
    {
      id: "harvard-vs-ieee",
      heading: "Harvard and IEEE",
      blocks: [
        { type: "paragraph", text: "IEEE is a numeric style. Instead of an author and year, the citation is a number in square brackets, and the reference list is in the order sources are first cited, not alphabetical." },
        { type: "table", caption: "The same article in Harvard and IEEE, from ResearchKit's generators", columns: ["", "Harvard", "IEEE"], rows: [["Reference", "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574", "J. Thaker, N. Smith, and A. Leiserowitz, “Global warming risk perceptions in India,” Risk Anal., vol. 40, no. 12, pp. 2481–2497, Dec. 2020, doi: 10.1111/risa.13574."], ["Citation", "(Thaker, Smith and Leiserowitz, 2020, p. 2485)", "[1, p. 2485]"]] },
        { type: "links", items: [{ label: "IEEE Citations and References", href: "/learn/ieee-citations-and-references" }] },
      ],
    },
    {
      id: "check-institutional-guidance",
      heading: "Check your institution's guidance",
      blocks: [
        { type: "paragraph", text: "Before you submit, find the Harvard guide your university, department or module uses. It is usually on the library's website or in your module handbook, and it may name Cite Them Right or publish its own version." },
        { type: "list", items: ["If your guide follows Cite Them Right, this profile should match it closely; check the points listed under “Why Harvard varies”.", "If your guide differs from this profile, follow your guide, and apply its rules consistently.", "If you can't find a guide, ask your tutor or the library which version is expected.", "Never mix versions in one piece of work."] },
        { type: "links", items: [{ label: "Not sure which style you need? Try the Citation Style Finder", href: "/tools/citation-style-finder" }] },
      ],
    },
    {
      id: "using-the-generator",
      heading: "Using the generator",
      blocks: [
        { type: "paragraph", text: "The Harvard Citation Generator formats one book, journal article or web page at a time in this profile. Enter the details from the source, add a page if you are citing a specific passage, and copy the reference and either citation. It explains every choice it makes and flags anything to check." },
        { type: "list", items: ["Enter given names in full or as initials; the generator writes initials.", "Leave the author blank only if no person or organization is responsible.", "Add the date you accessed a source whenever you give its URL.", "Enter a year letter only if your list has another work by the same author from the same year."] },
        { type: "links", items: [{ label: "Open the Harvard Citation Generator", href: "/tools/harvard-citation-generator" }] },
      ],
    },
    {
      id: "limitations",
      heading: "Limitations of automated citation",
      blocks: [
        { type: "list", items: ["The generator follows one defined profile, not your university's version; differences are yours to apply.", "Titles are used as typed; sentence case needs your judgment about proper nouns.", "Year letters and the order of your reference list depend on your whole list.", "Chapters, edited books, editors, translators, reports, news articles and other formats aren't supported yet.", "A perfectly formatted reference can still contain a wrong date or a misspelled name. Formatting is not verification."] },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "Cite Them Right is the basis of ResearchKit's Harvard profile. Many university libraries provide access to Cite Them Right Online and publish their own quick guides to it." },
        { type: "references", ids: ["cite-them-right-2025"] },
        { type: "links", items: [{ label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "Is there an official Harvard style?", answer: "No. Harvard is a family of author-date styles, and universities publish their own versions. ResearchKit follows one defined profile, based on Cite Them Right, 13th edition." },
    { question: "Do I need a comma between the author and year?", answer: "In this profile, yes: (Smith, 2015). Some versions of Harvard leave it out, so check your university's guide." },
    { question: "Do I still need the place of publication for books?", answer: "Not in the 13th edition of Cite Them Right, which gives the publisher only. Some universities still ask for the place." },
    { question: "Do I need an access date with a DOI?", answer: "No. An access date follows a URL, because web pages change; a DOI is permanent." },
    { question: "When do I use et al.?", answer: "In the text, for four or more authors: (Gerrard et al., 2005). In the reference list, this profile lists every author." },
    { question: "Is Harvard the same as APA?", answer: "No. Both are author-date styles and can look alike, but they differ in punctuation, the use of “&”, how editions and pages are written, and when et al. is used." },
  ],
  relatedToolIds: ["harvard-citation-generator", "citation-style-finder"],
  relatedGuideSlugs: ["how-to-cite-a-website", "reference-list-or-bibliography", "how-to-avoid-plagiarism", "reference-checker"],
};
