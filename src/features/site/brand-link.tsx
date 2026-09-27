import NextLink from "next/link";
import { Icon } from "@/ui";
import type { Brand } from "./types";

/** The product mark: a book on the brand gradient. Decorative; the name beside it is the text. */
export function BrandMark() {
  return (
    <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-control bg-[linear-gradient(135deg,var(--color-action),var(--color-accent))] text-on-action shadow-card">
      <Icon name="book-open" className="size-4" />
    </span>
  );
}

/** The brand, linking home, with an optional badge such as the version. */
export function BrandLink({ brand }: { brand: Brand }) {
  return (
    <span className="flex items-center gap-2.5">
      <NextLink href={brand.href} className="flex items-center gap-2.5 rounded-control font-semibold tracking-tight focus-ring">
        <BrandMark />
        <span>{brand.name}</span>
      </NextLink>
      {brand.badge && (
        <span className="hidden rounded-pill border border-border px-2 py-0.5 text-caption font-medium text-text-muted tabular-nums sm:inline">
          <span className="sr-only">{brand.badgeLabel ?? brand.badge}</span>
          <span aria-hidden="true">{brand.badge}</span>
        </span>
      )}
    </span>
  );
}
