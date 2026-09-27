/** What the flow diagram builder doesn't do, stated on the page so no one relies on it for more. */
export const PRISMA_LIMITATIONS: readonly string[] = [
  "The diagram shows the numbers you enter or calculate from them. It can't check that they match what your searches and screening actually found.",
  "Duplicates counted from exported files are matched by DOI, or by title and year. Reference managers match more loosely, so their counts can differ; records without a DOI or title aren't matched at all.",
  "The PRISMA 2020 layout follows the published templates. PRISMA-S is a checklist for reporting searches; its diagram here is the PRISMA 2020 flow with every source listed. Scoping, rapid and narrative review versions adapt the same flow; check your journal's or university's requirements.",
  "Arrows can be hidden and labelled, and every box's wording changed, but boxes can't be moved; the layout follows the template so diagrams stay recognisable.",
  "The diagram isn't saved between visits. Download the SVG or PDF to keep it.",
  "Everything happens in your browser; no data leaves your device.",
];

/** Reviews still to come before the tool's guidance is final. */
export const PRISMA_REVIEW_ITEMS: readonly string[] = [
  "Methods review: the diagram wording against the PRISMA 2020, PRISMA-S and PRISMA-ScR publications.",
  "Validation review: the consistency checks and their messages, by an experienced systematic reviewer.",
  "Accessibility review: the diagram's text alternative and table with screen reader users.",
  "References: the PRISMA statements and guidance, after academic review.",
];
