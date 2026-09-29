import type { Guide } from "../../src/domains/publishing/guide";

export const apa7CitationsAndReferences: Guide = {
  slug: "apa-7-citations-and-references",
  title: "APA 7 Citations and References",
  description: "Learn how APA 7 connects source metadata, in-text citations and reference-list entries, then build trustworthy outputs without inventing missing information.",
  summary: "A citation tells readers which source supports an idea; a reference gives them enough information to find that source. APA 7 works when the two remain connected, complete and checked against the original source.",
  updated: "2026-09-29",
  reviewedBy: null,
  sections: [
    {
      id: "citation-and-reference",
      heading: "Citation, reference and source traceability",
      blocks: [
        { type: "paragraph", text: "A source is the work you consulted. An in-text citation briefly identifies it where you use its idea. A reference-list entry gives the fuller bibliographic details at the end of the paper. They are related representations of one source, not three independent records." },
        { type: "table", caption: "One source, two common outputs", columns: ["Situation", "APA output", "Why it matters"], rows: [["Paraphrase", "Smith (2024) found... or (Smith, 2024).", "Readers can connect the claim to the reference list."], ["Reference list", "Smith, J. A. (2024). Title. Journal, 10(2), 10–20.", "Readers can identify and retrieve the work."], ["Verification", "Compare every field with the original source.", "A correctly shaped citation can still contain wrong metadata."]] },
        { type: "list", items: ["Cite ideas, findings, words and data that came from a source.", "Keep the source traceable: preserve the original title, authors, date and locator when you have them.", "Do not treat a generated reference as verified merely because it looks complete."] },
        { type: "links", items: [{ label: "Build an APA reference and citation", href: "/tools/apa-citation-generator" }] },
      ],
    },
    {
      id: "parenthetical-and-narrative",
      heading: "Parenthetical and narrative citations",
      blocks: [
        { type: "paragraph", text: "Parenthetical citations place the author and year together in parentheses. Narrative citations make the author part of the sentence and put the year in parentheses. Both point to the same reference." },
        { type: "table", caption: "The same source in two sentence patterns", columns: ["Use", "Example", "Common mistake"], rows: [["Parenthetical", "The result was replicated (Smith, 2024).", "Leaving the citation only in a reference list."], ["Narrative", "Smith (2024) replicated the result.", "Writing an ampersand in running text instead of 'and'."], ["Paraphrase", "A paraphrase still needs Smith (2024).", "Assuming changed wording no longer needs citation."], ["Direct quotation", "The author’s exact words need a locator: (Smith, 2024, p. 12).", "Adding a page number that was never checked."]] },
      ],
    },
    {
      id: "authors-and-dates",
      heading: "Authors, organizations and dates",
      blocks: [
        { type: "paragraph", text: "APA uses family names and initials for people. An organization is written as an organization, not split into a surname and initials. With three or more authors, APA uses the first author followed by et al. in every in-text citation; the reference entry follows its author-list rule." },
        { type: "list", items: ["One author: (Smith, 2024) or Smith (2024).", "Two authors: (Smith & Jones, 2024) or Smith and Jones (2024).", "Three or more authors: (Smith et al., 2024).", "Organization author: (World Health Organization, 2024), unless an abbreviation has been established according to the applicable APA rule.", "No author: use the title in the author position, with the correct italic or quotation-mark treatment for the source type.", "No date: use n.d. and check whether the source has a date elsewhere."] },
        { type: "paragraph", text: "The year is not guessed. Check the publication or update date on the source. A web page may provide a month and day; books and journal articles normally use the year in this workflow." },
      ],
    },
    {
      id: "multiple-sources",
      heading: "Multiple sources and same-year works",
      blocks: [
        { type: "paragraph", text: "When several sources support one parenthetical claim, keep them in one set of parentheses separated by semicolons. Ordering and same-author same-year letters depend on the reference set and APA ordering rules, so they must be calculated from the collection rather than assigned by insertion order." },
        { type: "table", caption: "Collection-level decisions", columns: ["Situation", "Do", "Do not"], rows: [["Several authors", "Use one citation with semicolons between sources.", "Repeat separate parentheses without a reason."], ["Same author, same year", "Determine a and b from the ordered reference set.", "Assign letters merely because a source was added first."], ["Possible duplicate", "Review matching DOI or normalized title and year.", "Automatically merge records."], ["Uncertain ordering", "Check the authoritative APA rule and source metadata.", "Use a plain JavaScript sort as a substitute for the rule."]] },
        { type: "paragraph", text: "The current builder warns about duplicate identity signals in its temporary collection. It does not merge records and it does not claim that a temporary collection represents every source in a paper." },
      ],
    },
    {
      id: "quotations-and-locators",
      heading: "Direct quotations, paraphrases and locators",
      blocks: [
        { type: "paragraph", text: "A direct quotation reproduces the source's words and should identify where those words can be found. Depending on the source, that locator may be a page, page range, paragraph or section. A paraphrase changes the wording but still communicates a source's idea, so it still requires a citation." },
        { type: "list", items: ["Page: (Smith, 2024, p. 12).", "Page range: (Smith, 2024, pp. 12–14).", "Paragraph: (Smith, 2024, para. 4).", "Section: use the source's meaningful section label when a page locator is unavailable.", "Never invent a locator. Leave it blank and check the source."] },
        { type: "paragraph", text: "The builder's locator control changes the generated in-text citation only. It does not generate quotation text or paraphrase a source." },
      ],
    },
    {
      id: "source-types",
      heading: "Journal articles, books and web pages",
      blocks: [
        { type: "paragraph", text: "APA reference structure depends on the source type. Enter the metadata as it appears on the source, then review the output against the original record." },
        { type: "table", caption: "What the builder currently supports", columns: ["Source", "Important metadata", "Output principle"], rows: [["Journal article", "Authors, year, article title, journal, volume, issue, pages or article number, DOI or URL.", "The article title is not italicized; the journal and volume are."], ["Book", "Authors, year, title, edition when not first, publisher, DOI or URL.", "The book title is italicized; a first edition is not shown."], ["Web page", "Author or organization, date when shown, title, site name, URL.", "Use the available date detail and omit a site name that duplicates the organization author."]] },
        { type: "paragraph", text: "Book chapters, edited books, reports, government publications, theses, dissertations, conference papers and datasets are future source-type candidates. They are not silently approximated as books or web pages." },
      ],
    },
    {
      id: "doi-and-url",
      heading: "DOIs, URLs and verification",
      blocks: [
        { type: "paragraph", text: "A DOI is an identifier, not proof that the metadata entered beside it is correct. The builder normalizes accepted DOI forms to an https://doi.org/ address and reports invalid forms, but it does not resolve the DOI or retrieve metadata." },
        { type: "list", items: ["Enter a bare DOI, doi: form or DOI URL; the builder uses one canonical DOI URL in the reference.", "Use a URL when there is no DOI and the source type calls for one.", "Do not paste an arbitrary URL and expect the builder to discover authors, title or date.", "A valid-looking output is still user-entered and not externally verified unless a real verification process has occurred."] },
        { type: "links", items: [{ label: "Build a source with DOI or URL", href: "/tools/apa-citation-generator" }, { label: "DOI Foundation", href: "https://www.doi.org/" }] },
      ],
    },
    {
      id: "missing-metadata",
      heading: "Missing metadata and warnings",
      blocks: [
        { type: "paragraph", text: "Missing information is safer than invented information. The builder keeps absent metadata absent, uses an APA placeholder or n.d. where the formatter requires one, and shows a warning or error explaining what to check." },
        { type: "table", caption: "How to respond to a builder message", columns: ["Message", "Meaning", "Next step"], rows: [["Error", "Required information is missing or an identifier is invalid.", "Check the original source before adding the reference."], ["Warning", "APA can render the output, but a rule or decision needs review.", "Review sentence case, dates, locators or author details."], ["Information", "The output has a provenance limitation.", "Treat user-entered metadata as unverified until checked."]] },
        { type: "paragraph", text: "Do not replace a missing author with Anonymous unless the source itself identifies the author that way. Do not replace a missing date with a guessed publication year." },
      ],
    },
    {
      id: "reference-list",
      heading: "Reference-list entries and ordering",
      blocks: [
        { type: "paragraph", text: "Every source cited in the text should have a corresponding reference entry, and every reference entry should be cited when the assignment or publication rules require it. Reference entries use a consistent structure, punctuation and hanging-indent presentation." },
        { type: "list", items: ["Review author names, dates, titles, publication details and locators against the source.", "Keep DOI links without a final full stop after the URL.", "Use the reference collection to review possible duplicates before copying the list.", "Do not treat the temporary collection as a saved project library: it disappears when the page session ends."] },
        { type: "links", items: [{ label: "Open the APA 7 Citation & Reference Builder", href: "/tools/apa-citation-generator" }, { label: "Open the Literature Matrix", href: "/tools/literature-matrix" }] },
      ],
    },
    {
      id: "secondary-sources",
      heading: "Secondary sources and source evaluation",
      blocks: [
        { type: "paragraph", text: "Prefer reading and citing the original work when it is reasonably available. A secondary citation explains that you learned about an original work through another source; it is not a substitute for checking the original whenever the original can be accessed." },
        { type: "paragraph", text: "Citation correctness is not source quality. The Literature Matrix can help record findings, limitations, reflections and reading status, but the APA builder does not judge whether a source is methodologically sound, credible or relevant to your research question." },
      ],
    },
    {
      id: "workflow",
      heading: "A trustworthy citation workflow",
      blocks: [
        { type: "list", ordered: true, items: ["Keep the original source open while entering metadata.", "Choose the source type that matches the work.", "Enter only details you can identify; leave unknown fields blank.", "Review validation messages and the provenance note.", "Compare the generated reference and citation with the source and your assignment or journal instructions.", "Add the checked entry to the temporary collection, review duplicates and copy the output you need.", "Before submission, check that in-text citations and the reference list correspond."] },
        { type: "paragraph", text: "The tool formats what you provide. The researcher remains responsible for source selection, metadata accuracy, citation completeness and following the instructor, institution or publisher's instructions." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes and worked examples",
      blocks: [
        { type: "table", caption: "Synthetic examples", columns: ["Example", "Input situation", "Illustrative output"], rows: [["1. One-author article", "A journal article by Smith published in 2024.", "Smith, J. (2024). Article title. Journal Name, 10(2), 10–20."], ["2. Multiple authors", "A work by Smith, Jones and Lee.", "(Smith et al., 2024)"], ["3. Book", "A second-edition book with a publisher.", "Smith, J. (2024). *Book title* (2nd ed.). Publisher."], ["4. Organization web page", "A dated page authored by an organization.", "World Health Organization. (2024). *Page title*. URL"], ["5. Direct quotation", "A quotation on page 12.", "(Smith, 2024, p. 12)"], ["6. Paraphrase", "A source idea restated in your words.", "Smith (2024) found..."], ["7. Multiple sources", "Several sources support one statement.", "(Brown, 2022; Jones, 2023; Smith, 2024)"], ["8. Missing metadata", "A source has no supplied title or publisher.", "Warning/error plus a visible placeholder; no guess."], ["9. DOI", "The user enters doi:10.1234/example.", "https://doi.org/10.1234/example"], ["10. Citation form", "The same source is named in two sentence patterns.", "Smith (2024) / (Smith, 2024)"]] },
        { type: "paragraph", text: "These are synthetic examples for teaching. They are not claims that the example works exist or that their metadata has been verified." },
      ],
    },
    {
      id: "learn-more",
      heading: "Learn more and check the rule",
      blocks: [
        { type: "paragraph", text: "APA rules contain source-type exceptions and institution-specific requirements. The Publication Manual and official APA Style guidance remain the authorities; use the builder to make careful work easier, not to replace checking." },
        { type: "references", ids: ["apa-2020"] },
        { type: "links", items: [{ label: "APA Style", href: "https://apastyle.apa.org/" }, { label: "APA 7 Citation & Reference Builder", href: "/tools/apa-citation-generator" }, { label: "How to choose a citation style", href: "/learn/how-to-choose-a-citation-style" }] },
      ],
    },
  ],
  faq: [
    { question: "Does a paraphrase need a citation?", answer: "Yes. A paraphrase changes wording but still uses the source's idea, so cite the source." },
    { question: "Does a DOI mean the reference is verified?", answer: "No. The DOI can be normalized syntactically, but the authors, title, date and other metadata still need checking against the source." },
    { question: "Are references saved to my ResearchKit workspace?", answer: "No. Sprint 42's collection is temporary and does not change the workspace schema or save structured references." },
    { question: "What if the source type is not supported?", answer: "Do not approximate it as another source type. Check the applicable APA guidance and use the future source-type support when it becomes available." },
  ],
  relatedToolIds: ["apa-citation-generator"],
};
