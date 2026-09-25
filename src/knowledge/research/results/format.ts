/**
 * Numbers written the way research reports usually write them (following APA style):
 * two decimals for most statistics, three for p, and no leading zero for values that
 * can't exceed 1, such as p, r and β.
 */

const fixed = (value: number, decimals: number) => {
  const text = Math.abs(value).toFixed(decimals);
  return value < 0 && Number(text) !== 0 ? `-${text}` : text;
};

/** A statistic with a leading zero, such as 2.45 or 0.30. */
export const formatStat = (value: number, decimals = 2) => fixed(value, decimals);

/** A statistic that can't exceed 1, without the leading zero, such as .45 or -.30. */
export const formatBounded = (value: number, decimals = 2) => fixed(value, decimals).replace(/^(-?)0\./, "$1.");

/** A p-value as reported: “p = .032”, or “p < .001” below one in a thousand. */
export function formatP(p: number): string {
  if (p < 0.001) return "p < .001";
  if (p > 0.999) return "p > .999";
  return `p = ${formatBounded(p, 3)}`;
}

/** A p-value without “p”, for tables: “.032”, “< .001” or “> .999”. */
export function formatPValue(p: number): string {
  return formatP(p).replace(/^p (= )?/, "");
}

/** A statistic and its value as written in text: “r = .34”, or “p < .001” when the value carries its own sign. */
export const statisticText = (symbol: string, value: string) => (/^[<>]/.test(value) ? `${symbol} ${value}` : `${symbol} = ${value}`);

/** The significance level as a percentage, such as “5%”. */
export const levelPercent = (alpha: number) => `${Math.round(alpha * 100)}%`;
export const formatAlpha = (alpha: number) => `α = ${formatBounded(alpha, 2)}`;

/** A number without trailing zeros, for counts and plain values, such as 12 or 3.5. */
export function formatPlain(value: number, decimals = 2): string {
  const text = fixed(value, decimals);
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}
