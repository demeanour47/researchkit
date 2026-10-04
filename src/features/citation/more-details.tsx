import type { ReactNode } from "react";

/** Optional fields, folded away until wanted. A native disclosure, so it works with a keyboard and without scripts. */
export function MoreDetails({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="rounded-control border border-border">
      <summary className="cursor-pointer rounded-control px-3 py-2 font-semibold focus-ring">{label}</summary>
      <div className="grid gap-4 p-3">{children}</div>
    </details>
  );
}
