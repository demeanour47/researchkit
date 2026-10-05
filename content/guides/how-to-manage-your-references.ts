import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Keeping track of sources from the first search to the final reference list. The
 * details to record match the source model ResearchKit's citation generators use; the
 * guide names common reference managers without recommending one.
 */
export const howToManageYourReferences: Guide = {
  slug: "how-to-manage-your-references",
  title: "How to manage your references",
  description:
    "How to keep track of sources from the start of a project: what details to record for each kind of source, using DOIs, choosing and using a reference manager, organising notes, and checking a generated reference list.",
  summary:
    "Record every source's full details the moment you decide to use it, in one place, with your notes beside it. A reference manager makes this easy and can format your references, but its output is only as good as the details it holds, so check them. Good habits from the first week of a project save days at the end and prevent accidental plagiarism.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "why",
      heading: "Why it matters",
      blocks: [
        { type: "paragraph", text: "Reconstructing a source's details months later is slow and error-prone: a page number you quoted, a DOI, the edition you read. Losing track of where an idea came from is also how accidental plagiarism happens. Recording sources consistently from the start avoids both, and makes writing the reference list a matter of minutes, not days." },
      ],
    },
    {
      id: "what-to-record",
      heading: "What to record for each source",
      blocks: [
        { type: "paragraph", text: "These are the details ResearchKit's citation generators ask for, which between them cover what APA, MLA, Chicago, IEEE and Harvard need:" },
        {
          type: "table",
          caption: "Details to record",
          columns: ["Source", "Details"],
          rows: [
            ["Book", "Authors or editors; year; title and subtitle; edition, if not the first; publisher; place of publication, which IEEE asks for; DOI or URL if you read it online"],
            ["Journal article", "Authors; year, and month for some styles; article title; journal name; volume; issue; page range or article number; DOI"],
            ["Web page", "Author (a person or an organisation); date published or updated; page title; website name; URL; the date you accessed it"],
          ],
        },
        { type: "paragraph", text: "Add the page numbers of anything you quote or closely paraphrase, as you note it. For other kinds of source, such as book chapters, reports and theses, record what your style's manual asks for." },
      ],
    },
    {
      id: "dois",
      heading: "Use DOIs",
      blocks: [
        { type: "paragraph", text: "A DOI (Digital Object Identifier) is a permanent identifier for a published work, such as 10.1111/risa.13574. Unlike a URL, it keeps working when a publisher moves its website. Record the DOI whenever a source has one; it is usually printed on the first page of an article and on its web page. Writing it as a link, https://doi.org/ followed by the DOI, takes readers straight to the work, and most styles now ask for it in that form." },
      ],
    },
    {
      id: "reference-managers",
      heading: "Reference managers",
      blocks: [
        { type: "paragraph", text: "A reference manager stores your sources, often with their PDFs and your notes, imports details from databases and DOIs, and formats citations and reference lists in thousands of styles through a word processor plug-in. Widely used ones include Zotero, which is free and open source; Mendeley, which is free and owned by Elsevier; EndNote, which is commercial; and JabRef, which manages BibTeX files. ResearchKit doesn't recommend a particular one: choose one your institution supports, or that your collaborators use, and learn it early." },
        { type: "paragraph", text: "Reference managers exchange data through standard file formats, mainly RIS and BibTeX, so you can move your library between them and into other tools." },
      ],
    },
    {
      id: "workflow",
      heading: "A workflow that works",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Capture: add each source as soon as you decide it may be useful, from the database or by its DOI, with the PDF if you have it.",
            "Check: correct the imported details against the source. Imported titles, author names and capital letters are often wrong.",
            "Organise: group sources into collections or tags that match your project, such as chapters or themes.",
            "Note: add your summary and evaluation to each source, in your own words, kept apart from quotations.",
            "Cite as you write, using the plug-in or a consistent placeholder, so no citation is added from memory at the end.",
            "Generate the reference list, then check it against your style's rules.",
            "Back up your library and notes regularly.",
          ],
        },
      ],
    },
    {
      id: "check-generated",
      heading: "Check what any tool generates",
      blocks: [
        { type: "paragraph", text: "Reference managers and citation generators format the details they are given. If those details are wrong or incomplete, the formatted entry is wrong too, however neat it looks. Common problems are titles in the wrong capitals, missing issue numbers or page ranges, duplicated entries, and the wrong source type, such as a report entered as a web page. Check every entry against the source and against your style before you submit." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Leaving reference details until the end of the project.",
            "Keeping sources in several places, such as browser bookmarks, downloaded files and notes, that are never brought together.",
            "Trusting imported metadata without checking it.",
            "Forgetting page numbers for quotations.",
            "Mixing your notes with the source's words, so you can't later tell them apart.",
            "Having no backup of your library.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Manage references with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Literature Matrix imports BibTeX and RIS files from your reference manager and records each study's details and your notes in one table. The research workspace keeps your project's references together as you plan, saved only in your browser, so keep your reference manager as the master copy. The citation generators format individual references, and the Reference Checker checks a finished list against your text." },
        { type: "links", items: [{ label: "Import references into the Literature Matrix", href: "/tools/literature-matrix" }, { label: "Plan your project in the workspace", href: "/workspace" }, { label: "Check a reference list", href: "/tools/reference-checker" }] },
      ],
    },
  ],
  faq: [
    { question: "Do I need a reference manager?", answer: "Not for a short assignment with a few sources. For a dissertation or thesis, almost certainly: it saves time and prevents errors." },
    { question: "Which reference manager is best?", answer: "The one you will use consistently. Check which your institution supports and trains students in, and which your collaborators use." },
    { question: "Can a reference manager format my references for me?", answer: "Yes, in most styles, but it formats the details it holds. Check the details, and check the output against your style." },
    { question: "What if a source has no DOI?", answer: "Many older articles, books and web pages don't have one. Record the URL if you read it online, along with the other details." },
    { question: "How do I avoid duplicates?", answer: "Most reference managers can find duplicate entries. Check before generating your list, because duplicates often differ slightly." },
  ],
  relatedToolIds: ["literature-matrix", "reference-checker", "apa-citation-generator", "citation-style-finder"],
  relatedGuideSlugs: ["how-to-write-a-literature-review", "how-to-choose-a-citation-style", "reference-list-or-bibliography", "reference-checker"],
};
