/**
 * Numbers typed into a statistics form, read strictly: plain decimals only (no
 * percentages, exponents, NaN or Infinity), with a message that says how to fix
 * anything else. Shared by the power analysis and confidence interval requests.
 */

export const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/u;
export const WHOLE = /^\d+$/u;

export type Parsed = { ok: true; value: number } | { ok: false; message: string };

/** A plain decimal number, such as 0.05, -3 or .5. */
export function decimal(text: string | undefined, label: string, example: string): Parsed {
  const value = (text ?? "").trim();
  if (value === "") return { ok: false, message: `Enter ${label}, such as ${example}.` };
  if (value.endsWith("%")) return { ok: false, message: `Enter ${label} as a decimal, not a percentage: ${example} rather than ${Number(example) * 100}%.` };
  if (!DECIMAL.test(value)) return { ok: false, message: `Enter ${label} as a number, such as ${example}.` };
  const number = Number(value);
  // Hundreds of digits pass the pattern but overflow to Infinity.
  if (!Number.isFinite(number)) return { ok: false, message: `Enter ${label} as a number of practical size, such as ${example}.` };
  return { ok: true, value: number };
}

/** A probability, within [0, 1] if inclusive, otherwise strictly between 0 and 1. */
export function probability(text: string | undefined, label: string, example: string, inclusive: boolean): Parsed {
  const parsed = decimal(text, label, example);
  if (!parsed.ok) return parsed;
  const inside = inclusive ? parsed.value >= 0 && parsed.value <= 1 : parsed.value > 0 && parsed.value < 1;
  if (inside) return parsed;
  const range = inclusive ? "from 0 to 1" : "between 0 and 1";
  // A value above 1 and up to 100 is most likely a percentage, such as 80 for 0.80.
  if (parsed.value > 1 && parsed.value <= 100) return { ok: false, message: `Enter ${label} as a decimal ${range}, not a percentage: ${Number((parsed.value / 100).toPrecision(12))} rather than ${parsed.value}.` };
  return { ok: false, message: `Enter ${label} ${range}, such as ${example}.` };
}

/** A whole number from minimum to maximum. */
export function wholeNumber(text: string | undefined, label: string, minimum: number, maximum: number): Parsed {
  const value = (text ?? "").trim();
  if (value === "") return { ok: false, message: `Enter ${label}.` };
  if (!WHOLE.test(value)) return { ok: false, message: `Enter ${label} as a whole number${DECIMAL.test(value) && Number(value) > 0 ? "" : ` of at least ${minimum}`}.` };
  const number = Number(value);
  if (number < minimum) return { ok: false, message: `Enter ${label} of at least ${minimum}.` };
  if (number > maximum) return { ok: false, message: `Enter ${label} of no more than ${maximum.toLocaleString("en")}.` };
  return { ok: true, value: number };
}
