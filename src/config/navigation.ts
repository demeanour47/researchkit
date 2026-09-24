import type { NavGroup, NavItem } from "@/features/site";

/**
 * Placeholder navigation. The addresses are provisional: they become final
 * only when the URL strategy (ADR-0005) is accepted.
 */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Tools", href: "/tools" },
  { label: "Learn", href: "/learn" },
  { label: "Styles", href: "/styles" },
];

export const footerNavigation: readonly NavGroup[] = [
  { heading: "Explore", items: primaryNavigation },
  { heading: "About", items: [{ label: "About", href: "/about" }] },
];
