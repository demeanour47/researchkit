/** What the matrix builder doesn't do, stated on the page so no one relies on it for more. */
export const LITERATURE_LIMITATIONS: readonly string[] = [
  "Patterns and gaps come from what you enter. The builder matches common names for designs, sampling techniques and analyses, so unusual wording may be counted separately; check the patterns against your matrix.",
  "Reasons given for patterns are the usual reasons researchers make each choice, from the same catalogues the other research tools use. They don't say why a particular study made its choice.",
  "Potential gaps are prompts, not findings. They describe only the studies in your matrix; confirm each against a wider search before claiming it in your review.",
  "Stated gaps are grouped by shared key words, so statements worded very differently may not be grouped, and unrelated ones sharing words occasionally are.",
  "Looking up a study's details from its DOI isn't available yet; the DOI is added and you fill in the details.",
  "BibTeX and RIS imports read the fields reference managers export: authors, year, title, journal, publisher, DOI, abstract and keywords. The rest of the matrix is yours to fill.",
  "The matrix isn't saved between visits. Export it as CSV or Excel to keep it; importing that file again restores everything, including tags and reading status.",
  "Everything happens in your browser; no data leaves your device.",
];

/** Reviews still to come before the tool's guidance is final. */
export const LITERATURE_REVIEW_ITEMS: readonly string[] = [
  "Methodological review: the pattern explanations, the gap thresholds and the descriptions of data collection methods and qualitative analyses.",
  "Systematic review practice: the matrix columns against common data extraction forms.",
  "Accessibility review: the matrix table and study editor with screen reader users.",
  "References: sources for the gap types and thresholds, after academic review.",
];
