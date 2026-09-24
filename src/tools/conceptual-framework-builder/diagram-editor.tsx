"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  describeRelationship,
  describeVariable,
  type ConceptualFramework,
  type FrameworkLayout,
  type Point,
} from "@/knowledge/research";
import { ARROW_KEYS } from "./announcements";
import { steps } from "./copy";

export interface DiagramEditorProps {
  framework: ConceptualFramework;
  layout: FrameworkLayout;
  /** The exported SVG, shown exactly as it will be exported. */
  svg: string;
  selected: string | null;
  /** Moves a box's top-left corner; `done` marks the end of a drag or key press. */
  onMove: (id: string, to: Point, done: boolean) => void;
  onNudge: (id: string, from: Point, dx: number, dy: number, large: boolean) => void;
  onSelect: (relationshipId: string) => void;
}

/** The smallest scale at which the figure's text stays readable. */
const MIN_SCALE = 0.6;

/**
 * The figure, drawn from the export SVG so the screen shows exactly what is exported,
 * with a transparent layer of focusable boxes and connectors on top for editing.
 */
export function DiagramEditor({ framework, layout, svg, selected, onMove, onNudge, onSelect }: DiagramEditorProps) {
  const overlay = useRef<SVGSVGElement>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const drag = useRef<{ id: string; offset: Point; pointer: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<number | null>(null);

  // Fit the figure to the space available, but never below a readable size: below
  // that, the figure keeps its size and scrolls sideways instead.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const fitted = available ? Math.max(MIN_SCALE, Math.min(1, available / layout.width)) : 1;
  // While dragging, the figure may grow; holding the scale steady keeps the box under the pointer.
  const [dragScale, setDragScale] = useState<number | null>(null);
  const scale = dragScale ?? fitted;

  const toDiagram = (event: PointerEvent): Point => {
    const matrix = overlay.current?.getScreenCTM()?.inverse();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  };

  const startDrag = (event: PointerEvent<SVGRectElement>, id: string, box: Point) => {
    const point = toDiagram(event);
    drag.current = { id, offset: { x: point.x - box.x, y: point.y - box.y }, pointer: event.pointerId };
    setDragScale(fitted);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent) => {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    const point = toDiagram(event);
    onMove(drag.current.id, { x: point.x - drag.current.offset.x, y: point.y - drag.current.offset.y }, false);
  };
  const endDrag = (event: PointerEvent) => {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    const point = toDiagram(event);
    onMove(drag.current.id, { x: point.x - drag.current.offset.x, y: point.y - drag.current.offset.y }, true);
    drag.current = null;
    setDragScale(null);
  };

  const keyOnBox = (event: KeyboardEvent, id: string, box: Point) => {
    const direction = ARROW_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    onNudge(id, box, direction[0], direction[1], event.shiftKey);
  };
  const keyOnConnector = (event: KeyboardEvent, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(id);
  };

  return (
    <div ref={frame} className="overflow-x-auto rounded-panel border border-border">
      <div className="relative" style={{ width: layout.width * scale, height: layout.height * scale }}>
        <div aria-hidden="true" className="[&>svg]:h-full [&>svg]:w-full" style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg }} />
        <svg
          ref={overlay}
          className="absolute inset-0"
          width={layout.width * scale}
          height={layout.height * scale}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="group"
          aria-label={steps.diagramLabel}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {layout.edges.map((edge) => {
            const relationship = framework.relationships.find((candidate) => candidate.id === edge.id)!;
            const highlighted = focused === edge.id || selected === edge.id;
            return (
              <g key={edge.id}>
                {highlighted && <line x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} stroke="#2445d6" strokeWidth={6} strokeOpacity={0.35} />}
                <line
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke="transparent"
                  strokeWidth={14}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected === edge.id}
                  aria-label={`${describeRelationship(framework, relationship)} ${steps.connectorHint}`}
                  className="cursor-pointer outline-none"
                  onClick={() => onSelect(edge.id)}
                  onKeyDown={(event) => keyOnConnector(event, edge.id)}
                  onFocus={() => setFocused(edge.id)}
                  onBlur={() => setFocused(null)}
                />
              </g>
            );
          })}
          {layout.nodes.map((node) => (
            <g key={node.id}>
              {focused === node.id && (
                <rect x={node.x - 4} y={node.y - 4} width={node.width + 8} height={node.height + 8} rx={12} fill="none" stroke="#2445d6" strokeWidth={3} />
              )}
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={8}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-roledescription="movable box"
                aria-label={`${describeVariable(framework, node.id)} ${steps.moveHint}`}
                className="cursor-move touch-none outline-none"
                onPointerDown={(event) => startDrag(event, node.id, node)}
                onKeyDown={(event) => keyOnBox(event, node.id, node)}
                onFocus={() => setFocused(node.id)}
                onBlur={() => setFocused(null)}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
