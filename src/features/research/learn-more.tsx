import type { ReactNode } from "react";
import { Icon } from "@/ui";

/**
 * Detail that most readers can skip, collapsed behind a native disclosure so it
 * works with the keyboard, with screen readers and without JavaScript.
 */
export function LearnMore({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group rounded-control border border-border">
      <summary className="flex min-h-control cursor-pointer list-none items-center gap-2 rounded-control px-3 font-medium focus-ring hover:bg-foreground/5 [&::-webkit-details-marker]:hidden">
        <span className="transition-transform duration-(--duration-quick) group-open:rotate-90">
          <Icon name="arrow-right" />
        </span>
        {label}
      </summary>
      <div className="grid gap-4 border-t border-border p-4">{children}</div>
    </details>
  );
}
