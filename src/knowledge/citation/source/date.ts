/**
 * Calendar facts about publication dates, independent of how any style writes them.
 * Styles decide which parts of a date they show and in what form.
 */

/** A date as the source gives it. Every part is optional because sources often give only a year. */
export interface PublicationDate {
  year?: number;
  /** 1–12. */
  month?: number;
  /** Only meaningful with a month. */
  day?: number;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export const isWholeNumberIn = (value: number | undefined, min: number, max: number): value is number =>
  value !== undefined && Number.isInteger(value) && value >= min && value <= max;
