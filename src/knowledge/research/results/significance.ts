/**
 * Whether a result is statistically significant, and what that does and doesn't mean.
 * A result is significant when p is below the chosen level, the usual convention; p
 * equal to the level is not.
 */

import { formatAlpha, formatP, levelPercent } from "./format";

export type SignificanceStatus = "significant" | "not-significant" | "no-test";

export interface Significance {
  status: SignificanceStatus;
  /** The judgement, with the numbers behind it. */
  statement: string;
  /** What the judgement means, and what it doesn't. */
  meaning: string;
}

export function significance(p: number | undefined, alpha: number): Significance {
  if (p === undefined) {
    return { status: "no-test", statement: "This result doesn't include a significance test.", meaning: "It describes the data; it doesn't test a hypothesis about the population." };
  }
  if (p < alpha) {
    return {
      status: "significant",
      statement: `${formatP(p)} is below ${formatAlpha(alpha)}, so the result is statistically significant at the ${levelPercent(alpha)} level.`,
      meaning: "If there were truly no effect in the population, a result at least this extreme would be unlikely. It doesn't show the effect is large, important or certain.",
    };
  }
  return {
    status: "not-significant",
    statement: `${formatP(p)} is ${p === alpha ? "equal to" : "above"} ${formatAlpha(alpha)}, so the result is not statistically significant at the ${levelPercent(alpha)} level.`,
    meaning: "The data don't give enough evidence against the null hypothesis. That isn't evidence that there is no effect: the sample may be too small to detect it.",
  };
}
