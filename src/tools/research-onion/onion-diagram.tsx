import type { OnionSelection } from "@/knowledge/research";
import { cx } from "@/ui";
import { diagram } from "./copy";
import { DIAGRAM_SIZE, onionRings, type RingState } from "./diagram";

const ringClasses: Record<RingState, string> = {
  current: "fill-action/25 stroke-border-control",
  chosen: "fill-foreground/10 stroke-border-control",
  open: "fill-surface stroke-border-control",
};

/**
 * The research onion as concentric rings, highlighting the layer on screen and
 * shading layers with a choice. It mirrors the progress list, which remains the way
 * to move between layers, so it is a single image with a full text description.
 */
export function OnionDiagram({ selection, current }: { selection: OnionSelection; current: number }) {
  const rings = onionRings(selection, current);
  const centre = DIAGRAM_SIZE / 2;
  const step = DIAGRAM_SIZE / 2 / rings.length;
  const currentRing = rings.find((ring) => ring.state === "current");
  const description = diagram.description(
    currentRing ? currentRing.name.toLowerCase() : null,
    rings.flatMap((ring) => (ring.chosen ? [`${ring.name}, ${ring.chosen}`] : [])),
  );

  return (
    <figure className="mx-auto grid justify-items-center gap-2">
      <svg
        viewBox={`0 0 ${DIAGRAM_SIZE} ${DIAGRAM_SIZE}`}
        width={200}
        height={200}
        role="img"
        aria-labelledby="onion-diagram-title onion-diagram-description"
        className="shrink-0"
      >
        <title id="onion-diagram-title">{diagram.title}</title>
        <desc id="onion-diagram-description">{description}</desc>
        {rings.map((ring) => (
          <circle key={ring.layer} cx={centre} cy={centre} r={ring.radius - 0.5} strokeWidth={1} className={ringClasses[ring.state]} />
        ))}
        {currentRing && (
          <g className="fill-none stroke-action" strokeWidth={3}>
            <circle cx={centre} cy={centre} r={currentRing.radius - 1.5} />
            {currentRing.radius > step && <circle cx={centre} cy={centre} r={currentRing.radius - step + 1.5} />}
          </g>
        )}
        {rings.map((ring) => (
          <text
            key={ring.layer}
            x={centre}
            y={ring.labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            className={cx("fill-text", ring.state === "current" && "font-bold")}
          >
            {ring.number}
          </text>
        ))}
      </svg>
      <figcaption className="w-0 min-w-full text-center text-small text-text-muted">{diagram.legend}</figcaption>
    </figure>
  );
}
