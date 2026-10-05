"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/ui";
import { type Journey, type JourneyNode, type NodeState, type ReadinessDimension } from "@/knowledge/project/journey";

const LANE_X: Record<ReadinessDimension, number> = { foundation: 150, question: 220, evidence: 80, methodology: 150, writing: 150 };
const ROW = 46;
const TOP = 28;

interface Placed {
  node: JourneyNode;
  x: number;
  y: number;
}

/** Lays the journey out as a branching spine: each group of stages sits in its own lane. */
function place(journey: Journey): Placed[] {
  return journey.nodes.map((node, index) => ({ node, x: LANE_X[node.group], y: TOP + index * ROW }));
}

const STROKE: Record<NodeState, string> = {
  completed: "stroke-action fill-action",
  current: "stroke-action fill-surface",
  available: "stroke-text-muted fill-surface",
  blocked: "stroke-border-control fill-sunken",
  optional: "stroke-border fill-surface",
  "not-applicable": "stroke-border-control fill-sunken",
};

const MARK: Record<NodeState, string> = { completed: "✓", current: "●", available: "", blocked: "", optional: "", "not-applicable": "–" };

/**
 * The full research map. Nodes keep their identity and move with CSS transitions
 * when the project type or progress changes, so the structure visibly grows rather
 * than being redrawn. It is a visual aid: the list below it carries the same
 * information, and motion is switched off by the reduced-motion tokens.
 */
export function JourneyMap({ journey, selected, onSelect }: { journey: Journey; selected: string | null; onSelect: (id: string) => void }) {
  const placed = place(journey);
  const height = TOP * 2 + (placed.length - 1) * ROW;
  const previous = useRef<Journey["nodes"]>([]);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const before = new Map(previous.current.map((node) => [node.id, node.state]));
    const changed = journey.nodes.filter((node) => before.get(node.id) && before.get(node.id) !== node.state && node.state === "completed");
    if (changed.length > 0) setAnnouncement(`${changed.map((node) => node.name).join(", ")} completed. ${journey.percent}% of the journey is complete.`);
    previous.current = journey.nodes;
  }, [journey]);

  return (
    <div>
      <svg viewBox={`0 0 300 ${height}`} className="mx-auto h-auto w-full max-w-[22rem]" aria-hidden="true" focusable="false">
        {placed.slice(1).map(({ node, x, y }, index) => {
          const from = placed[index];
          const done = from.node.state === "completed" && node.state === "completed";
          const midY = (from.y + y) / 2;
          return (
            <path
              key={`edge-${node.id}`}
              d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${x} ${midY}, ${x} ${y}`}
              fill="none"
              strokeWidth={2}
              strokeDasharray={done ? undefined : "4 4"}
              className={done ? "stroke-action" : "stroke-border"}
              style={{ transition: "d var(--duration-moderate) var(--ease-standard), stroke var(--duration-moderate) var(--ease-standard)" }}
            />
          );
        })}
        {placed.map(({ node, x, y }) => (
          <g
            key={node.id}
            style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform var(--duration-moderate) var(--ease-standard)" }}
            onClick={() => onSelect(node.id)}
            className="cursor-pointer"
          >
            <circle r={node.state === "current" ? 12 : 9} strokeWidth={node.id === selected ? 4 : 2.5} className={cx(STROKE[node.state], "transition-[r,stroke,fill] duration-(--duration-moderate) ease-standard")} />
            <text textAnchor="middle" dominantBaseline="central" className={cx("text-[10px] font-semibold", node.state === "completed" ? "fill-on-action" : "fill-action")}>{MARK[node.state]}</text>
            <text x={x > 150 ? -18 : 18} textAnchor={x > 150 ? "end" : "start"} dominantBaseline="central" className={cx("text-[11px]", node.state === "current" ? "fill-text font-semibold" : "fill-text-muted")}>{node.name}</text>
          </g>
        ))}
      </svg>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
  );
}
