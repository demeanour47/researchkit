import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Citing web pages in the six styles ResearchKit formats. The examples are the
 * generators' own output for two invented pages, and the guide's tests check them
 * against the generators, so the guide and the tools can't disagree.
 */
export const howToCiteAWebsite: Guide = {
  slug: "how-to-cite-a-website",
  title: "How to cite a website",
  description:
    "What to record when you use a web page, how to handle a missing author or date, when to give an access date, and how the same page is cited in APA, MLA, Chicago, IEEE and Harvard.",
  summary:
    "To cite a web page you need its author (a person or an organisation), its date of publication or update, its title, the website's name and its URL, and often the date you accessed it. Every style uses the same facts; they differ in order, punctuation, and what they do when a detail is missing.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-to-record",
      heading: "What to record before you leave the page",
      blocks: [
        { type: "paragraph", text: "Web pages change and disappear, so record their details when you use them, not when you write your reference list:" },
        {
          type: "list",
          items: [
            "Author: the person who wrote the page, or the organisation responsible for it if no person is named.",
            "Date: when the page was published, or last updated if the update applies to the content you are using.",
            "Title of the page, exactly as it appears.",
            "Name of the website, if it differs from the author.",
            "URL: the full address of the page itself, not the home page.",
            "Date you accessed it: some styles always ask for it, others only when the page has no date.",
          ],
        },
        { type: "paragraph", text: "It is good practice, though not a style rule, to keep a copy of anything important you cite from the web, such as a PDF of the page, so you can check what it said if it later changes." },
      ],
    },
    {
      id: "page-and-website",
      heading: "The page is the source; the website contains it",
      blocks: [
        { type: "paragraph", text: "You cite the particular page you used, not the website as a whole. The website is the container, as MLA describes it (Modern Language Association of America, 2021): it appears after the page title, much as a journal's name appears after an article's title." },
        { type: "paragraph", text: "Many documents found online aren't web pages. A journal article, a book, a report or a newspaper article is cited as that kind of source even if you read it in a browser: a journal article found online is cited as a journal article, with its DOI." },
      ],
    },
    {
      id: "finding-the-author",
      heading: "Finding the author",
      blocks: [
        { type: "paragraph", text: "Look for a byline at the top or bottom of the page. If no person is named, the organisation responsible for the page is the author: a government department, a university, a company or an association. Its “About” page or the footer usually names it." },
        { type: "paragraph", text: "When the organisation that wrote the page also runs the website, styles avoid repeating the name. APA leaves out the site name (American Psychological Association, 2020); MLA leaves out the author and the publisher and starts with the page's title; Chicago doesn't repeat the name after the title. The second example below shows each." },
      ],
    },
    {
      id: "finding-the-date",
      heading: "Finding the date, and what to do without one",
      blocks: [
        { type: "paragraph", text: "Use the date the page was published. If it shows a “last updated” date that applies to the content you are citing, APA uses that instead; a “last reviewed” date isn't used, because a page that was reviewed hasn't necessarily changed (American Psychological Association, 2020). A copyright year at the foot of a whole website usually describes the site, not the page." },
        {
          type: "table",
          caption: "A web page with no date",
          columns: ["Style", "What replaces the date"],
          rows: [
            ["APA 7", "n.d. in place of the year, in the reference and the citation"],
            ["MLA 9", "Nothing: the date is left out, and the date you accessed the page is added"],
            ["Chicago author-date", "n.d. in place of the year, and the date you accessed the page"],
            ["Chicago notes and bibliography", "The date you accessed the page"],
            ["IEEE", "Nothing extra: IEEE gives the access date for every web page"],
            ["Harvard (Cite Them Right)", "no date in place of the year, and the access date as always"],
          ],
        },
      ],
    },
    {
      id: "access-dates",
      heading: "When to give the date you accessed a page",
      blocks: [
        { type: "paragraph", text: "An access date records when you consulted a page, because its content may since have changed. Styles disagree about when one is needed:" },
        {
          type: "table",
          caption: "Access dates for web pages",
          columns: ["Style", "Access date", "How ResearchKit's generator handles it"],
          rows: [
            ["APA 7", "Only for pages designed to change over time and not archived, written “Retrieved Month Day, Year, from”", "Doesn't add one; add it yourself for such a page"],
            ["MLA 9", "Optional, and worth adding for a web page, especially an undated one", "Adds it whenever you enter one"],
            ["Chicago author-date", "For web content with no date of publication or revision", "Adds it only when the page has no date"],
            ["Chicago notes and bibliography", "For web content with no date of publication or revision", "Adds it only when the page has no date"],
            ["IEEE", "For every web page, as “Accessed:”", "Always adds it"],
            ["Harvard (Cite Them Right)", "For every web page, after the URL", "Always adds it"],
          ],
        },
      ],
    },
    {
      id: "examples-dated",
      heading: "Example: a page with a named author and a date",
      blocks: [
        { type: "paragraph", text: "These examples use an invented page on an invented website (example.org), so they don't describe a real source. The page was written by Anita Sharma, published on 18 March 2024 on a site called Himalayan Research Notes, and accessed on 10 February 2025. Each row is what ResearchKit's generator for that style produces." },
        {
          type: "table",
          caption: "One web page in six styles",
          columns: ["Style", "Reference entry", "In-text citation or note"],
          rows: [
            ["APA 7", "Sharma, A. (2024, March 18). Community forestry in the mid-hills. Himalayan Research Notes. https://example.org/community-forestry", "(Sharma, 2024)"],
            ["MLA 9", "Sharma, Anita. “Community Forestry in the Mid-Hills.” Himalayan Research Notes, 18 Mar. 2024, example.org/community-forestry. Accessed 10 Feb. 2025.", "(Sharma)"],
            ["Chicago author-date", "Sharma, Anita. 2024. “Community Forestry in the Mid-Hills.” Himalayan Research Notes. March 18. https://example.org/community-forestry.", "(Sharma 2024)"],
            ["Chicago notes and bibliography", "Sharma, Anita. “Community Forestry in the Mid-Hills.” Himalayan Research Notes. March 18, 2024. https://example.org/community-forestry.", "Anita Sharma, “Community Forestry in the Mid-Hills,” Himalayan Research Notes, March 18, 2024, https://example.org/community-forestry."],
            ["IEEE", "[1] A. Sharma. “Community forestry in the mid-hills.” Himalayan Research Notes. Accessed: Feb. 10, 2025. [Online]. Available: https://example.org/community-forestry", "[1]"],
            ["Harvard", "Sharma, A. (2024) Community forestry in the mid-hills. Available at: https://example.org/community-forestry (Accessed: 10 February 2025).", "(Sharma, 2024)"],
          ],
        },
        { type: "paragraph", text: "Italics are lost in this table. APA and Harvard italicise the page title; MLA italicises the website's name; Chicago and IEEE put the page title in quotation marks and leave the website's name in plain type. The citation generators show each entry with its formatting, ready to copy." },
      ],
    },
    {
      id: "examples-organisation",
      heading: "Example: an organisation's page with no date",
      blocks: [
        { type: "paragraph", text: "The second invented page was written by the organisation that runs the website, Example Research Network, and shows no date. It was accessed on 10 February 2025." },
        {
          type: "table",
          caption: "An undated page by an organisation",
          columns: ["Style", "Reference entry", "In-text citation or note"],
          rows: [
            ["APA 7", "Example Research Network. (n.d.). Guidance for student fieldwork in Nepal. https://example.org/fieldwork-guidance", "(Example Research Network, n.d.)"],
            ["MLA 9", "“Guidance for Student Fieldwork in Nepal.” Example Research Network, example.org/fieldwork-guidance. Accessed 10 Feb. 2025.", "(“Guidance for Student Fieldwork in Nepal”)"],
            ["Chicago author-date", "Example Research Network. n.d. “Guidance for Student Fieldwork in Nepal.” Accessed February 10, 2025. https://example.org/fieldwork-guidance.", "(Example Research Network, n.d.)"],
            ["Chicago notes and bibliography", "Example Research Network. “Guidance for Student Fieldwork in Nepal.” Accessed February 10, 2025. https://example.org/fieldwork-guidance.", "“Guidance for Student Fieldwork in Nepal,” Example Research Network, accessed February 10, 2025, https://example.org/fieldwork-guidance."],
            ["IEEE", "[1] Example Research Network. “Guidance for student fieldwork in Nepal.” Example Research Network. Accessed: Feb. 10, 2025. [Online]. Available: https://example.org/fieldwork-guidance", "[1]"],
            ["Harvard", "Example Research Network (no date) Guidance for student fieldwork in Nepal. Available at: https://example.org/fieldwork-guidance (Accessed: 10 February 2025).", "(Example Research Network, no date)"],
          ],
        },
        { type: "paragraph", text: "MLA's citation uses the title because the entry starts with it. MLA allows a long title to be shortened in the text, but where to cut is a judgement, so the generator gives it in full." },
      ],
    },
    {
      id: "titles-and-urls",
      heading: "Titles, capital letters and URLs",
      blocks: [
        {
          type: "list",
          items: [
            "Capital letters differ by style. APA, IEEE and Harvard write page titles in sentence case, capitalising the first word and proper nouns; MLA and Chicago use title case (Chicago calls it headline style). ResearchKit's generators use a title exactly as you type it, because deciding which words are proper nouns needs a person.",
            "Copy the URL from the address bar of the page itself. Avoid shortened links and links that only work after you log in.",
            "APA and IEEE end the entry with the URL, with no full stop after it; Chicago and MLA follow it with a full stop. MLA leaves out “https://”.",
            "Don't add “Retrieved from” before a URL in APA 7; it is used only with a retrieval date.",
          ],
        },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Citing the home page or the search results page instead of the page you used.",
            "Citing a journal article, report or e-book as a web page because you read it online.",
            "Giving the website's name as the author when the page names a person or a specific organisation.",
            "Using a “last reviewed” date, or the copyright year of the whole website, as the page's date.",
            "Writing n.d. without checking the page, its footer and its “About” page for a date.",
            "Leaving out an access date where the style requires one, or adding one in APA where it isn't needed.",
            "Assuming a web page is reliable because it is easy to cite. Citing a page credits it; it doesn't vouch for it.",
          ],
        },
      ],
    },
    {
      id: "limits",
      heading: "Where the rules come from, and where they vary",
      blocks: [
        { type: "paragraph", text: "The rules above follow each style's manual or official guidance: the APA Publication Manual (American Psychological Association, 2020), the MLA Handbook (Modern Language Association of America, 2021), The Chicago Manual of Style (University of Chicago Press, 2024), the IEEE Reference Guide (IEEE Publication Operations, 2025) and Cite Them Right for Harvard (Pears & Shields, 2025)." },
        { type: "paragraph", text: "Harvard has no single official version, and universities publish their own variations. Journals and instructors may also change details, such as whether an access date is needed. Where your instructions differ from this guide, follow your instructions." },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Cite a web page with ResearchKit",
      blocks: [
        { type: "paragraph", text: "Choose Web page as the source type in any citation generator, enter the details as the page gives them, and copy the formatted entry. Check the title's capitals and the date before you use it, then check your finished list with the Reference Checker." },
        { type: "links", items: [{ label: "Find your citation style", href: "/tools/citation-style-finder" }, { label: "APA Citation Generator", href: "/tools/apa-citation-generator" }, { label: "Harvard Citation Generator", href: "/tools/harvard-citation-generator" }, { label: "Check a reference list", href: "/tools/reference-checker" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020", "mla-2021", "chicago-2024", "ieee-2025", "cite-them-right-2025"] }],
    },
  ],
  faq: [
    { question: "Do I need an access date?", answer: "In IEEE and Harvard (Cite Them Right), always. In Chicago, when the page has no date. In MLA it is optional but recommended for web pages. In APA, only for pages designed to change and not archived." },
    { question: "What if a web page has no author?", answer: "Look for the organisation responsible for the page; it is usually the author. Only if no person or organisation can be identified do styles fall back on the page's title." },
    { question: "Should I cite the whole website?", answer: "Usually not. Cite the specific page you used; the website's name appears in the entry as the page's container." },
    { question: "Is a PDF on a website a web page?", answer: "Only if it is part of a web page. A report, article or book that happens to be a PDF is cited as a report, article or book, with the URL where you found it." },
    { question: "Can I cite a page I found through a search engine?", answer: "Yes, but cite the page itself, with its own URL, not the search results." },
  ],
  relatedToolIds: ["apa-citation-generator", "mla-citation-generator", "chicago-author-date-citation-generator", "chicago-notes-bibliography-citation-generator", "ieee-citation-generator", "harvard-citation-generator", "citation-style-finder", "reference-checker"],
  relatedGuideSlugs: ["how-to-choose-a-citation-style", "apa-7-citations-and-references", "mla-9-citations-and-works-cited", "harvard-citations-and-references", "reference-list-or-bibliography", "reference-checker"],
};
