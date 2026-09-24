/** A category's availability, e.g. "1 available now, 6 coming soon", or "5 coming soon". */
export const statusSummary = (available: number, comingSoon: number) =>
  available > 0 ? `${available} available now, ${comingSoon} coming soon` : `${comingSoon} coming soon`;
