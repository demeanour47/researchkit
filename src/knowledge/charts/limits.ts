/** What the chart builder doesn't do, stated on the page so no one relies on it for more. */
export const CHART_LIMITATIONS: readonly string[] = [
  "The builder draws the numbers you give it. It doesn't calculate statistics from raw responses, except histogram bins, box plot quartiles and percentages, so means, error margins and counts must come from your analysis.",
  "Error bars show whatever margin you enter. Say in the caption whether they are standard deviations, standard errors or confidence intervals.",
  "Recommendations follow common guidance for statistical graphics, matched to what your project records. They don't know your field's conventions or your journal's figure rules; check its author guidelines.",
  "APA- and IEEE-friendly modes set fonts, captions and gridlines to fit those styles' general figure advice. They don't guarantee compliance with a particular edition or publisher.",
  "Box plots use linear-interpolation quartiles and whiskers at 1.5 × the interquartile range. Other software may use other methods, so values can differ slightly.",
  "Charts show up to eight series, the most the colour palette separates reliably. Combine small groups into “Other”, or draw several charts.",
  "Everything is drawn in your browser; no data leaves your device.",
];

/** Reviews still to come before the tool's guidance is final. */
export const CHART_REVIEW_ITEMS: readonly string[] = [
  "Statistical graphics review: the recommendations for each measurement level, purpose and test, by a statistician.",
  "Style review: the APA- and IEEE-friendly modes against the current APA manual and IEEE author guidelines.",
  "Accessibility review: the text alternatives and table views with screen reader users.",
  "References: sources for the chart guidance, after academic review.",
];
