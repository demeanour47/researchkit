import { cx } from "@/ui";
import {
  INDEPENDENCE_FIGURE,
  NORMALITY_FIGURE,
  PAIRING_FIGURE,
  VARIANCE_FIGURE,
  type DiagramBox,
  type DotPanel,
  type FigureId,
  type HistogramPanel,
  type StructureDiagram,
} from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";

const copy = statisticsCopy.figures;

function Box({ box }: { box: DiagramBox }) {
  return (
    <div className="grid min-w-36 gap-0.5 rounded-control border-2 border-border-strong bg-surface px-3 py-2 text-center">
      <span className="text-caption text-text-muted">{box.role}</span>
      <span className="font-semibold">{box.label}</span>
    </div>
  );
}

function Arrow({ symbol, label }: { symbol: string; label?: string }) {
  return (
    <span className="flex items-center justify-center gap-2 text-heading text-text-muted" aria-hidden="true">
      {symbol}
      {label && <span className="text-small">{label}</span>}
    </span>
  );
}

/**
 * How the variables in a kind of test are arranged: boxes for variables, arrows for
 * direction, and the groups a grouping variable forms. Boxes stack on narrow screens,
 * and the caption describes the whole figure in words.
 */
export function StructureDiagramView({ diagram }: { diagram: StructureDiagram }) {
  const sideBySide = diagram.link !== "leads-to";
  return (
    <figure className="grid gap-3 rounded-panel border border-border bg-sunken p-4">
      <div className={cx("flex items-center justify-center gap-3", sideBySide ? "flex-col sm:flex-row" : "flex-col")}>
        <div className="flex flex-wrap justify-center gap-3">
          {diagram.from.map((box) => (
            <Box key={box.label} box={box} />
          ))}
        </div>
        {diagram.link === "with" && <Arrow symbol="↔" />}
        {diagram.link === "compared-with" && <Arrow symbol="⇄" label={copy.compared} />}
        {diagram.link === "leads-to" && diagram.groups && (
          <>
            <Arrow symbol="↓" />
            <ul className="flex flex-wrap justify-center gap-2">
              {diagram.groups.map((group) => (
                <li key={group} className="rounded-control border border-dashed border-border-strong px-3 py-1 text-small">
                  {group}
                </li>
              ))}
            </ul>
          </>
        )}
        {diagram.link === "leads-to" && <Arrow symbol="↓" />}
        <div className="flex flex-wrap justify-center gap-3">
          {diagram.to.map((box) => (
            <Box key={box.label} box={box} />
          ))}
        </div>
      </div>
      {diagram.note && <p className="text-center text-small font-medium">{diagram.note}</p>}
      <figcaption className="grid gap-1 text-small">
        <span className="font-semibold">{diagram.caption}</span>
        <span className="text-text-muted">{diagram.description}</span>
      </figcaption>
    </figure>
  );
}

function PairingFigure() {
  const { independent, paired } = PAIRING_FIGURE;
  return (
    <figure className="grid gap-4 rounded-panel border border-border bg-sunken p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <p className="font-semibold">{independent.heading}</p>
          <div className="grid grid-cols-2 gap-2">
            {independent.groups.map((group) => (
              <div key={group.label} className="grid content-start gap-1 rounded-control border border-border bg-surface p-2">
                <span className="text-small font-semibold">{group.label}</span>
                <ul className="grid gap-0.5 text-small">
                  {group.members.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-small text-text-muted">{independent.note}</p>
        </div>
        <div className="grid content-start gap-2">
          <p className="font-semibold">{paired.heading}</p>
          <ul className="grid gap-1 rounded-control border border-border bg-surface p-2 text-small">
            {paired.participants.map((participant) => (
              <li key={participant}>
                {participant} <span aria-hidden="true">→</span> <span className="sr-only">measured</span> {paired.measures[0]} <span aria-hidden="true">→</span>
                <span className="sr-only">then</span> {paired.measures[1]}
              </li>
            ))}
          </ul>
          <p className="text-small text-text-muted">{paired.note}</p>
        </div>
      </div>
      <figcaption className="grid gap-1 text-small">
        <span className="font-semibold">{PAIRING_FIGURE.caption}</span>
        <span>{PAIRING_FIGURE.why}</span>
      </figcaption>
    </figure>
  );
}

function Histogram({ panel, id }: { panel: HistogramPanel; id: string }) {
  const width = 210;
  const height = 100;
  const barWidth = width / panel.counts.length;
  const highest = Math.max(...panel.counts);
  return (
    <div className="grid gap-1">
      <svg viewBox={`0 0 ${width} ${height + 2}`} className="h-auto w-full max-w-64 text-action" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{panel.label}</title>
        <desc id={`${id}-desc`}>{`${panel.description} Bar heights from left to right: ${panel.counts.join(", ")}.`}</desc>
        {panel.counts.map((count, index) => {
          const barHeight = (count / highest) * height;
          return <rect key={index} x={index * barWidth + 2} y={height - barHeight} width={barWidth - 4} height={barHeight} rx="2" fill="currentColor" />;
        })}
        <line x1="0" y1={height + 1} x2={width} y2={height + 1} stroke="currentColor" className="text-border-strong" strokeWidth="2" />
      </svg>
      <p className="text-small font-semibold">{panel.label}</p>
      <p className="text-small text-text-muted">{panel.description}</p>
    </div>
  );
}

function DotStrips({ panel, id }: { panel: DotPanel; id: string }) {
  const { min, max } = VARIANCE_FIGURE.scale;
  const width = 240;
  const row = 30;
  const x = (value: number) => 10 + ((value - min) / (max - min)) * (width - 20);
  return (
    <div className="grid gap-1">
      <svg viewBox={`0 0 ${width} ${panel.groups.length * row + 16}`} className="h-auto w-full max-w-72" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{panel.label}</title>
        <desc id={`${id}-desc`}>{`${panel.description} ${panel.groups.map((group) => `${group.label}: ${group.values.join(", ")}.`).join(" ")}`}</desc>
        {panel.groups.map((group, index) => (
          <g key={group.label} transform={`translate(0 ${index * row + 14})`}>
            <line x1="10" x2={width - 10} y1="0" y2="0" stroke="currentColor" className="text-border" strokeWidth="1" />
            {group.values.map((value) => (
              <circle key={value} cx={x(value)} cy="0" r="5" fill="currentColor" className="text-action" />
            ))}
            <text x="10" y="-8" fontSize="10" fill="currentColor" className="text-text-muted">
              {group.label}
            </text>
          </g>
        ))}
        <text x="10" y={panel.groups.length * row + 14} fontSize="9" fill="currentColor" className="text-text-muted">
          {min}
        </text>
        <text x={width - 10} y={panel.groups.length * row + 14} fontSize="9" textAnchor="end" fill="currentColor" className="text-text-muted">
          {max}
        </text>
      </svg>
      <p className="text-small font-semibold">{panel.label}</p>
      <p className="text-small text-text-muted">{panel.description}</p>
    </div>
  );
}

function IndependenceFigure() {
  return (
    <figure className="grid gap-4 rounded-panel border border-border bg-sunken p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {INDEPENDENCE_FIGURE.panels.map((panel) => (
          <div key={panel.label} className="grid content-start gap-2">
            <p className="font-semibold">{panel.label}</p>
            <div className="flex flex-wrap gap-2">
              {panel.units.map((unit) => (
                <div key={unit.label} className="grid content-start gap-1 rounded-control border border-border bg-surface p-2">
                  <span className="text-small font-semibold">{unit.label}</span>
                  <ul className="grid gap-0.5 text-small">
                    {unit.members.map((member) => (
                      <li key={member}>{member}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-small text-text-muted">{panel.description}</p>
          </div>
        ))}
      </div>
      <figcaption className="text-small font-semibold">{INDEPENDENCE_FIGURE.caption}</figcaption>
    </figure>
  );
}

/** A teaching figure, by id. Every figure has a caption and a text description. */
export function TeachingFigure({ figure }: { figure: FigureId }) {
  switch (figure) {
    case "pairing":
      return <PairingFigure />;
    case "independence":
      return <IndependenceFigure />;
    case "normality":
      return (
        <figure className="grid gap-4 rounded-panel border border-border bg-sunken p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {NORMALITY_FIGURE.panels.map((panel, index) => (
              <Histogram key={panel.label} panel={panel} id={`normality-${index}`} />
            ))}
          </div>
          <figcaption className="grid gap-1 text-small">
            <span className="font-semibold">{NORMALITY_FIGURE.caption}</span>
            <span className="text-text-muted">{NORMALITY_FIGURE.axis}.</span>
            <span className="text-text-muted">{NORMALITY_FIGURE.note}</span>
          </figcaption>
        </figure>
      );
    case "variance":
      return (
        <figure className="grid gap-4 rounded-panel border border-border bg-sunken p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {VARIANCE_FIGURE.panels.map((panel, index) => (
              <DotStrips key={panel.label} panel={panel} id={`variance-${index}`} />
            ))}
          </div>
          <figcaption className="grid gap-1 text-small">
            <span className="font-semibold">{VARIANCE_FIGURE.caption}</span>
            <span className="text-text-muted">{VARIANCE_FIGURE.note}</span>
          </figcaption>
        </figure>
      );
  }
}
