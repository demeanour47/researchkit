/**
 * Everything the Research Title Builder announces to screen readers. Pure functions,
 * so they are tested. Ratings are announced in words; never as numbers.
 */

import { TITLE_CATEGORY_LABELS, type TitleCategory } from "../../knowledge/research/title";

export const announcements = {
  added: (text: string, working: boolean) => (working ? `“${text}” added as your working title.` : `“${text}” added as an alternative.`),
  removed: (text: string) => `“${text}” removed.`,
  working: (text: string) => `“${text}” is now your working title.`,
  favourite: (text: string, on: boolean) => (on ? `“${text}” marked as a favourite.` : `“${text}” is no longer a favourite.`),
  restored: (text: string) => `Earlier version restored: “${text}”.`,
  downloaded: (format: string) => `${format} file downloaded.`,
  copied: "Working title copied.",
  copyFailed: "The title couldn't be copied automatically. Select it and press Control+C, or Command+C on a Mac.",
} as const;

/**
 * The rating of the working title, and what to look at. Announced when the rating
 * changes, not on every keystroke.
 */
export function ratingAnnouncement(category: TitleCategory, needsAnotherLook: readonly string[]): string {
  const rating = `Working title rated ${TITLE_CATEGORY_LABELS[category]}.`;
  if (needsAnotherLook.length === 0) return `${rating} No criterion needs another look.`;
  const list = needsAnotherLook.length === 1 ? needsAnotherLook[0] : `${needsAnotherLook.slice(0, -1).join(", ")} and ${needsAnotherLook[needsAnotherLook.length - 1]}`;
  return `${rating} Worth another look: ${list.toLowerCase()}.`;
}
