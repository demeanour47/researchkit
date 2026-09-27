import type { ReactNode } from "react";
import { COLOUR_TAG_LABELS, type ColourTag } from "@/knowledge/literature";

/** Swatch classes for each tag, written out in full so Tailwind generates them. */
const SWATCH: Readonly<Record<ColourTag, string>> = {
  red: "bg-tag-red",
  orange: "bg-tag-orange",
  yellow: "bg-tag-yellow",
  green: "bg-tag-green",
  blue: "bg-tag-blue",
  purple: "bg-tag-purple",
};

/** A colour tag: a swatch beside its name, so the tag never depends on colour alone. */
export function TagBadge({ tag }: { tag: ColourTag }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden="true" className={`inline-block size-3 rounded-full ${SWATCH[tag]}`} />
      {COLOUR_TAG_LABELS[tag]}
    </span>
  );
}

export function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="text-heading font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}
