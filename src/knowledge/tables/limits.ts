/** What the table builder doesn't do, stated on the page so no one relies on it for more. */
export const TABLE_LIMITATIONS: readonly string[] = [
  "Tables from raw data are calculated here: frequencies, percentages, descriptive statistics, correlations with their p-values, Cronbach's alpha and chi-square tests. Regression, ANOVA and factor analysis results must come from your statistics software; the builder formats them and fills in only values that follow directly, such as mean squares, F and p.",
  "Style presets follow each manual's general guidance for tables. They don't guarantee compliance with a particular edition, publisher or university; check your own guide, and use the custom style to match it.",
  "Harvard is a family of institutional guides, not one manual, so its preset follows the most common pattern.",
  "p-values use standard approximations to the t, F and chi-square distributions, accurate well beyond the three decimals reported. Spearman's p uses the t approximation, which is less exact for very small samples.",
  "Word continues long tables with their header rows repeated but can't add “(continued)” to the caption; the PDF does.",
  "PDF export uses the standard Times and Helvetica fonts, with Greek letters from the Symbol font. Characters outside these fonts appear as “?”; Arial, Calibri and Georgia are shown in the nearest standard font.",
  "Project tables use what the project details record. Anything missing appears in square brackets for you to fill in; nothing is invented.",
  "Everything is calculated in your browser; no data leaves your device.",
];

/** Reviews still to come before the tool's guidance is final. */
export const TABLE_REVIEW_ITEMS: readonly string[] = [
  "Style review: each preset against the current APA, IEEE, Chicago and MLA manuals, and common Harvard guides.",
  "Statistical review: the calculations, notes and recommendations, by a statistician.",
  "Accessibility review: the table markup and exported documents with screen reader users.",
  "References: sources for the formatting rules and formulas, after academic review.",
];
