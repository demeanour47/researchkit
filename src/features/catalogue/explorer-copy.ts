/** Wording for catalogue directories' search and filters, for items named by `plural` (“tools”, “guides”). */
export const explorerCopy = (plural: string) =>
  ({
    toolbar: `Search and filter ${plural}`,
    search: `Search ${plural}`,
    searchPlaceholder: `Search ${plural} by name or task…`,
    status: "Availability",
    category: "Category",
    all: "All",
    available: "Available",
    comingSoon: "Coming soon",
    summary: (available: number, comingSoon: number) =>
      available > 0 ? `${available} available now, ${comingSoon} coming soon` : `${comingSoon} coming soon`,
    results: (count: number) => (count === 1 ? `1 ${plural.replace(/s$/, "")} found` : `${count} ${plural} found`),
    noResults: `No ${plural} match`,
    noResultsHint: "Try fewer or different words, or clear the filters to see everything.",
    clear: "Clear filters",
  }) as const;
