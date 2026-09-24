import { LAYERS, findOption, type OnionSelection } from "@/knowledge/research";
import { cx } from "@/ui";
import { explorer } from "./copy";

export interface OnionProgressProps {
  selection: OnionSelection;
  /** The index of the layer being shown, or LAYERS.length for the summary. */
  current: number;
  /** The furthest layer reached so far; layers up to it can be revisited. */
  reached: number;
  onJump: (index: number) => void;
}

/** The six layers as a list of steps, showing each choice made. Layers already reached can be revisited. */
export function OnionProgress({ selection, current, reached, onJump }: OnionProgressProps) {
  return (
    <nav aria-label={explorer.progressLabel}>
      <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {LAYERS.map((layer, index) => {
          const chosen = selection[layer.id];
          const isCurrent = index === current;
          const content = (
            <>
              <span className="text-small text-text-muted">{explorer.layerNumber(layer.number, LAYERS.length)}</span>{" "}
              <span className="font-medium">{layer.name}</span>{" "}
              <span className="text-small text-text-muted">{chosen ? findOption(chosen)?.name : explorer.notChosen}</span>
            </>
          );
          const box = cx(
            "grid h-full w-full content-start gap-0.5 rounded-control border px-3 py-2 text-start",
            isCurrent ? "border-action border-2" : "border-border",
          );
          return (
            <li key={layer.id}>
              {index <= reached && !isCurrent ? (
                <button type="button" onClick={() => onJump(index)} className={cx(box, "hover:bg-foreground/5 focus-ring")}>
                  {content}
                </button>
              ) : (
                <div aria-current={isCurrent ? "step" : undefined} className={cx(box, !isCurrent && "opacity-70")}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
